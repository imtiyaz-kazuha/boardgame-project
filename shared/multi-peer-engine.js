/**
 * Multi-Peer Network Engine powered by PeerJS (WebRTC DataChannels)
 * Supports 1 to 6 players star-topology (Host manages connections & broadcasts).
 * 100% serverless, zero-cost.
 */
class MultiPeerEngine {
  constructor(options = {}) {
    this.gamePrefix = options.gamePrefix || 'ludo';
    this.maxPlayers = options.maxPlayers || 6;
    this.onConnected = options.onConnected || (() => {});
    // Support both onPlayerJoined and onPlayerJoin callbacks
    this.onPlayerJoined = options.onPlayerJoined || options.onPlayerJoin || (() => {});
    this.onPlayerJoin = this.onPlayerJoined;
    this.onPlayerLeft = options.onPlayerLeft || (() => {});
    this.onData = options.onData || (() => {});
    this.onStatus = options.onStatus || (() => {});

    this.peer = null;
    this.hostConn = null; // Client side
    this.clientConns = []; // Host side: array of { id, conn, playerIndex, name }
    this.isHost = false;
    this.peerId = null;
    this.roomId = null;
    this.rawRoomCode = null;
    this.myPlayerIndex = 0;
    this.myName = 'Player';

    // Window unload listener to cleanly release PeerJS session
    this._unloadHandler = () => {
      this.destroy();
    };
    window.addEventListener('beforeunload', this._unloadHandler);
  }

  generateRoomCode() {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  initHost(customCode) {
    this.isHost = true;
    this.myPlayerIndex = 0;
    const rawCode = (customCode && customCode.trim())
      ? customCode.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
      : this.generateRoomCode();

    this.rawRoomCode = rawCode;
    this.roomId = `${this.gamePrefix}-${rawCode}`;

    this.onStatus(`Initializing Host room: ${rawCode.toUpperCase()}...`);

    try {
      this.peer = new Peer(this.roomId, { debug: 1 });
    } catch (e) {
      console.warn("Peer constructor error, generating fallback:", e);
      const fallbackCode = `${rawCode}-${Math.floor(10 + Math.random() * 90)}`;
      this.rawRoomCode = fallbackCode;
      this.roomId = `${this.gamePrefix}-${fallbackCode}`;
      this.peer = new Peer(this.roomId, { debug: 1 });
    }

    this.peer.on('open', (id) => {
      this.peerId = id;
      this.onStatus(`Room ready: ${this.rawRoomCode.toUpperCase()} (${this.clientConns.length + 1}/${this.maxPlayers})`);
    });

    this.peer.on('connection', (connection) => {
      if (this.clientConns.length >= this.maxPlayers - 1) {
        connection.close(); // Lobby full
        return;
      }

      const playerIdx = this.clientConns.length + 1;
      const clientObj = {
        id: connection.peer,
        conn: connection,
        playerIndex: playerIdx,
        name: `Player ${playerIdx + 1}`
      };
      this.clientConns.push(clientObj);

      connection.on('open', () => {
        // Send initial slot assignment and room info to the newly joined peer
        try {
          connection.send({
            type: '_SYS_ASSIGN_SLOT',
            playerIndex: clientObj.playerIndex,
            totalConnected: this.clientConns.length + 1,
            maxPlayers: this.maxPlayers,
            roomId: this.rawRoomCode
          });
        } catch (e) {
          console.error("Failed to send _SYS_ASSIGN_SLOT:", e);
        }

        this.onPlayerJoined(clientObj);
        this._broadcastLobbyRoster();
      });

      connection.on('data', (data) => {
        if (data && data.type === 'JOIN_REQ') {
          if (data.name) clientObj.name = data.name;
          this.onPlayerJoined(clientObj);
          this._broadcastLobbyRoster();
          return;
        }

        this.onData(data, clientObj);
        // Relay to other peers if needed
        this.broadcast(data, connection.peer);
      });

      connection.on('close', () => {
        this.clientConns = this.clientConns.filter(c => c.conn !== connection);
        // Re-index remaining connected clients to avoid gaps
        this.clientConns.forEach((c, idx) => {
          c.playerIndex = idx + 1;
          try {
            c.conn.send({
              type: '_SYS_ASSIGN_SLOT',
              playerIndex: c.playerIndex,
              totalConnected: this.clientConns.length + 1,
              maxPlayers: this.maxPlayers,
              roomId: this.rawRoomCode
            });
          } catch (e) {}
        });
        this.onPlayerLeft(clientObj);
        this._broadcastLobbyRoster();
      });

      connection.on('error', (err) => {
        console.error('Peer connection error:', err);
      });
    });

    this.peer.on('error', (err) => {
      console.warn('Host peer error:', err);
      if (err.type === 'unavailable-id') {
        // ID is still registered on the cloud signaling broker (e.g. from a recent page refresh)
        // Automatically create a new unique suffix so hosting succeeds without freezing
        const fallbackCode = `${this.rawRoomCode}-${Math.floor(10 + Math.random() * 89)}`;
        this.rawRoomCode = fallbackCode;
        this.roomId = `${this.gamePrefix}-${fallbackCode}`;
        this.onStatus(`Reconnecting with code: ${fallbackCode.toUpperCase()}...`);

        // Update any input fields on page that show the code/link
        const shareInput = document.getElementById('shareLinkInput');
        if (shareInput) {
          shareInput.value = `${window.location.origin}${window.location.pathname}?room=${fallbackCode}`;
        }
        const roomNameInput = document.getElementById('roomNameInput');
        if (roomNameInput) {
          roomNameInput.value = fallbackCode;
        }

        if (this.peer) {
          try { this.peer.destroy(); } catch (e) {}
        }
        this.peer = new Peer(this.roomId, { debug: 1 });
        this.peer.on('open', (id) => {
          this.peerId = id;
          this.onStatus(`Room ready: ${fallbackCode.toUpperCase()} (${this.clientConns.length + 1}/${this.maxPlayers})`);
        });
      } else {
        this.onStatus(`Error: ${err.type || err.message}`);
      }
    });

    return this.rawRoomCode;
  }

  _broadcastLobbyRoster() {
    const roster = [
      { playerIndex: 0, name: this.myName || 'Host', isHost: true },
      ...this.clientConns.map(c => ({ playerIndex: c.playerIndex, name: c.name, isHost: false }))
    ];
    this.broadcast({
      type: '_SYS_LOBBY_UPDATE',
      roster: roster,
      totalConnected: this.clientConns.length + 1,
      maxPlayers: this.maxPlayers
    });
    this.onStatus(`Connected: ${this.clientConns.length + 1} / ${this.maxPlayers}`);
  }

  initJoin(roomCode, myName = 'Player') {
    this.isHost = false;
    this.myName = myName;
    const cleanCode = roomCode.trim().toLowerCase();
    this.rawRoomCode = cleanCode;
    this.roomId = cleanCode.startsWith(this.gamePrefix) ? cleanCode : `${this.gamePrefix}-${cleanCode}`;

    this.onStatus(`Connecting to ${cleanCode.toUpperCase()}...`);

    this.peer = new Peer({ debug: 1 });

    this.peer.on('open', (id) => {
      this.peerId = id;
      this.hostConn = this.peer.connect(this.roomId, { reliable: true });

      this.hostConn.on('open', () => {
        this.onStatus(`Connected to room host! Waiting for match start...`);
        this.hostConn.send({ type: 'JOIN_REQ', name: myName });
        this.onConnected({ isHost: false });
      });

      this.hostConn.on('data', (data) => {
        if (data && data.type === '_SYS_ASSIGN_SLOT') {
          this.myPlayerIndex = data.playerIndex;
          this.onStatus(`Joined as Player ${data.playerIndex + 1}! Waiting for host to start...`);
        }
        this.onData(data);
      });

      this.hostConn.on('close', () => {
        this.onStatus(`Disconnected from host.`);
        this.onPlayerLeft();
      });

      this.hostConn.on('error', (err) => {
        console.error('HostConn error:', err);
      });
    });

    this.peer.on('error', (err) => {
      console.error('Client peer error:', err);
      if (err.type === 'peer-unavailable') {
        this.onStatus(`Room not found! Host may be offline or room code "${cleanCode.toUpperCase()}" is incorrect.`);
      } else {
        this.onStatus(`Connection failed: ${err.type || err.message}`);
      }
    });
  }

  send(data) {
    if (this.isHost) {
      this.broadcast(data);
    } else if (this.hostConn && this.hostConn.open) {
      this.hostConn.send(data);
    }
  }

  broadcast(data, excludePeerId = null) {
    if (!this.isHost) return;
    this.clientConns.forEach(c => {
      if (c.id !== excludePeerId && c.conn && c.conn.open) {
        c.conn.send(data);
      }
    });
  }

  destroy() {
    if (this._unloadHandler) {
      window.removeEventListener('beforeunload', this._unloadHandler);
    }
    if (this.hostConn) {
      try { this.hostConn.close(); } catch (e) {}
    }
    this.clientConns.forEach(c => {
      try { c.conn.close(); } catch (e) {}
    });
    this.clientConns = [];
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
    }
  }
}

window.MultiPeerEngine = MultiPeerEngine;
