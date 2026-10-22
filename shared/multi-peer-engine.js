/**
 * Multi-Peer Network Engine powered by PeerJS (WebRTC DataChannels)
 * Supports 1 to 4 players star-topology (Host manages connections & broadcasts).
 * 100% serverless, zero-cost.
 */
class MultiPeerEngine {
  constructor(options = {}) {
    this.gamePrefix = options.gamePrefix || 'ludo';
    this.maxPlayers = options.maxPlayers || 4;
    this.onConnected = options.onConnected || (() => {});
    this.onPlayerJoined = options.onPlayerJoined || (() => {});
    this.onPlayerLeft = options.onPlayerLeft || (() => {});
    this.onData = options.onData || (() => {});
    this.onStatus = options.onStatus || (() => {});

    this.peer = null;
    this.hostConn = null; // Client side
    this.clientConns = []; // Host side: array of { id, conn, playerIndex, name }
    this.isHost = false;
    this.peerId = null;
    this.roomId = null;
    this.myPlayerIndex = 0;
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
    const rawCode = (customCode && customCode.trim()) ? customCode.trim().toLowerCase().replace(/[^a-z0-9]/g, '') : this.generateRoomCode();
    this.roomId = `${this.gamePrefix}-${rawCode}`;

    this.onStatus(`Initializing Host room: ${rawCode.toUpperCase()}...`);

    this.peer = new Peer(this.roomId, { debug: 1 });

    this.peer.on('open', (id) => {
      this.peerId = id;
      this.onStatus(`Room ready: ${rawCode.toUpperCase()}`);
    });

    this.peer.on('connection', (connection) => {
      if (this.clientConns.length >= this.maxPlayers - 1) {
        connection.close(); // Lobby full
        return;
      }

      const playerIdx = this.clientConns.length + 1;
      const clientObj = { id: connection.peer, conn: connection, playerIndex: playerIdx, name: `Player ${playerIdx + 1}` };
      this.clientConns.push(clientObj);

      connection.on('open', () => {
        this.onPlayerJoined(clientObj);
      });

      connection.on('data', (data) => {
        this.onData(data, clientObj);
        // Relay to other peers if needed
        this.broadcast(data, connection.peer);
      });

      connection.on('close', () => {
        this.clientConns = this.clientConns.filter(c => c.conn !== connection);
        this.onPlayerLeft(clientObj);
      });

      connection.on('error', (err) => {
        console.error('Peer connection error:', err);
      });
    });

    this.peer.on('error', (err) => {
      console.error('Host peer error:', err);
      this.onStatus(`Error: ${err.type || err.message}`);
    });

    return rawCode;
  }

  initJoin(roomCode, myName = 'Player') {
    this.isHost = false;
    const cleanCode = roomCode.trim().toLowerCase();
    this.roomId = cleanCode.startsWith(this.gamePrefix) ? cleanCode : `${this.gamePrefix}-${cleanCode}`;

    this.onStatus(`Connecting to ${cleanCode.toUpperCase()}...`);

    this.peer = new Peer({ debug: 1 });

    this.peer.on('open', (id) => {
      this.peerId = id;
      this.hostConn = this.peer.connect(this.roomId, { reliable: true });

      this.hostConn.on('open', () => {
        this.onStatus(`Connected to room host!`);
        this.hostConn.send({ type: 'JOIN_REQ', name: myName });
        this.onConnected({ isHost: false });
      });

      this.hostConn.on('data', (data) => {
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
      this.onStatus(`Connection failed: ${err.type || err.message}`);
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
    if (this.hostConn) this.hostConn.close();
    this.clientConns.forEach(c => c.conn.close());
    if (this.peer) this.peer.destroy();
  }
}

window.MultiPeerEngine = MultiPeerEngine;
