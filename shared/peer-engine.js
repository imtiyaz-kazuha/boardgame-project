/**
 * Shared P2P Network Engine powered by PeerJS (WebRTC DataChannels)
 * Zero external servers, 100% free, client-side only.
 */
class PeerEngine {
  constructor(options = {}) {
    this.gamePrefix = options.gamePrefix || 'bg';
    this.onConnected = options.onConnected || (() => {});
    this.onDisconnected = options.onDisconnected || (() => {});
    this.onData = options.onData || (() => {});
    this.onStatus = options.onStatus || (() => {});

    this.peer = null;
    this.conn = null;
    this.isHost = false;
    this.peerId = null;
    this.roomId = null;
  }

  // Generate random room code
  generateRoomCode() {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  initHost() {
    this.isHost = true;
    const rawCode = this.generateRoomCode();
    this.roomId = `${this.gamePrefix}-${rawCode}`;

    this.onStatus(`Initializing Host room: ${rawCode.toUpperCase()}...`);

    this.peer = new Peer(this.roomId, {
      debug: 1
    });

    this.peer.on('open', (id) => {
      this.peerId = id;
      this.onStatus(`Host ready! Room code: ${rawCode.toUpperCase()}`);
    });

    this.peer.on('connection', (connection) => {
      if (this.conn && this.conn.open) {
        connection.close(); // Only 1-on-1 for 2-player board games
        return;
      }
      this.conn = connection;
      this._setupConnListeners();
    });

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
      this.onStatus(`Connection error: ${err.type || err.message}`);
    });

    return rawCode;
  }

  initJoin(roomCode) {
    this.isHost = false;
    const cleanCode = roomCode.trim().toLowerCase();
    this.roomId = cleanCode.startsWith(this.gamePrefix) ? cleanCode : `${this.gamePrefix}-${cleanCode}`;

    this.onStatus(`Connecting to room ${cleanCode.toUpperCase()}...`);

    this.peer = new Peer({
      debug: 1
    });

    this.peer.on('open', (id) => {
      this.peerId = id;
      const connection = this.peer.connect(this.roomId, {
        reliable: true
      });
      this.conn = connection;
      this._setupConnListeners();
    });

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
      this.onStatus(`Connection error: ${err.type || err.message}`);
    });
  }

  _setupConnListeners() {
    this.conn.on('open', () => {
      this.onStatus(`Connected to opponent!`);
      this.onConnected({ isHost: this.isHost });
    });

    this.conn.on('data', (data) => {
      this.onData(data);
    });

    this.conn.on('close', () => {
      this.onStatus(`Opponent disconnected.`);
      this.onDisconnected();
    });

    this.conn.on('error', (err) => {
      console.error('Conn error:', err);
      this.onStatus(`Data error occurred.`);
    });
  }

  send(data) {
    if (this.conn && this.conn.open) {
      this.conn.send(data);
    }
  }

  destroy() {
    if (this.conn) this.conn.close();
    if (this.peer) this.peer.destroy();
  }
}

window.PeerEngine = PeerEngine;
