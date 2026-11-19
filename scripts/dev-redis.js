const net = require('net');

/**
 * LaunchCommerce — Lightweight Development Redis Server (DEV FALLBACK ONLY)
 *
 * PURPOSE:
 * This script provides a minimal, in-process RESP2 protocol emulator for developers
 * working on machines where a native Redis / Valkey server or Docker container is
 * not yet configured.
 *
 * ⚠️ IMPORTANT LIMITATIONS & NON-EQUIVALENCE:
 * - DO NOT use this emulator as proof of production Redis compatibility or as the
 *   sole integration test environment for authentication, token rotation, or replay protection.
 * - Single-threaded in-memory JavaScript Map: Does not reproduce distributed network latency,
 *   forking persistence (AOF/RDB), cluster topology, or edge-case Redis eviction semantics.
 * - Integration tests and production deployments MUST be tested against an actual Redis server
 *   (e.g., Redis 5.0+, Redis 7+, or Valkey).
 *
 * SUPPORTED REDIS COMMANDS:
 * - PING [message]               : Connection health check (returns PONG or message)
 * - INFO                         : Minimal server info string
 * - CLIENT [subcommand]          : Client management handshake (returns +OK)
 * - COMMAND                      : Returns empty array (command discovery stub)
 * - GET key                      : Retrieve string value (or null/$-1 if missing/expired)
 * - SET key val [EX sec] [NX]    : Set value with optional TTL (EX) and non-existence condition (NX)
 * - DEL key [key ...]            : Delete one or more keys (returns integer count)
 * - QUIT                         : Gracefully terminate socket connection
 *
 * UNSUPPORTED REDIS COMMANDS:
 * - HGET/HSET, LPUSH/RPOP, SADD/SMEMBERS, ZADD/ZRANGE, EVAL/EVALSHA (Lua),
 *   MULTI/EXEC (Transactions), SCAN, PUBSUB, CONFIG, BGSAVE.
 */
class DevRedisServer {
  constructor(port = 6379, host = '127.0.0.1') {
    this.port = port;
    this.host = host;
    this.store = new Map();
    this.expirations = new Map();
    this.sockets = new Set();
    this.server = net.createServer((socket) => {
      this.sockets.add(socket);
      socket.on('close', () => this.sockets.delete(socket));
      this.handleClient(socket);
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, this.host, () => {
        console.log(`[DevRedis] Running and listening on ${this.host}:${this.port}`);
        console.log(`[DevRedis] Ready for REDIS_URL=redis://${this.host}:${this.port}`);
        resolve();
      });
      this.server.on('error', reject);
    });
  }

  stop() {
    return new Promise((resolve) => {
      for (const socket of this.sockets) {
        socket.destroy();
      }
      this.sockets.clear();
      this.server.close(() => {
        console.log('[DevRedis] Server shut down gracefully.');
        resolve();
      });
    });
  }

  cleanExpired() {
    const now = Date.now();
    for (const [key, exp] of this.expirations.entries()) {
      if (exp <= now) {
        this.store.delete(key);
        this.expirations.delete(key);
      }
    }
  }

  handleClient(socket) {
    let buffer = '';

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');

      while (buffer.length > 0) {
        if (!buffer.startsWith('*')) {
          const lineEnd = buffer.indexOf('\r\n');
          if (lineEnd === -1) break;
          const line = buffer.substring(0, lineEnd).trim();
          buffer = buffer.substring(lineEnd + 2);
          this.executeCommand(socket, line.split(/\s+/));
          continue;
        }

        const lines = buffer.split('\r\n');
        const argc = parseInt(lines[0].substring(1), 10);
        if (isNaN(argc)) {
          buffer = '';
          break;
        }

        if (lines.length < 1 + argc * 2) {
          break;
        }

        const args = [];
        let cursor = 1;
        for (let i = 0; i < argc; i++) {
          args.push(lines[cursor + 1]);
          cursor += 2;
        }

        let consumed = lines[0].length + 2;
        for (let i = 1; i <= argc * 2; i++) {
          consumed += lines[i].length + 2;
        }
        buffer = buffer.substring(consumed);

        this.executeCommand(socket, args);
      }
    });
  }

  executeCommand(socket, args) {
    this.cleanExpired();
    if (!args || args.length === 0) return;
    const cmd = args[0].toUpperCase();

    if (cmd === 'PING') {
      const msg = args[1] ? args[1] : 'PONG';
      socket.write(`+${msg}\r\n`);
      return;
    }

    if (cmd === 'INFO') {
      const info = '# Server\r\nredis_version:7.0.0\r\nrole:master\r\nconnected_clients:' + this.sockets.size + '\r\n';
      socket.write(`$${Buffer.byteLength(info)}\r\n${info}\r\n`);
      return;
    }

    if (cmd === 'COMMAND') {
      socket.write('*0\r\n');
      return;
    }

    if (cmd === 'CLIENT') {
      socket.write('+OK\r\n');
      return;
    }

    if (cmd === 'GET') {
      const key = args[1];
      const exp = this.expirations.get(key);
      if (exp && exp <= Date.now()) {
        this.store.delete(key);
        this.expirations.delete(key);
      }

      if (this.store.has(key)) {
        const val = this.store.get(key);
        socket.write(`$${Buffer.byteLength(val)}\r\n${val}\r\n`);
      } else {
        socket.write('$-1\r\n');
      }
      return;
    }

    if (cmd === 'SET') {
      const key = args[1];
      const val = args[2];
      let exSeconds = null;
      let nx = false;

      for (let i = 3; i < args.length; i++) {
        const opt = args[i].toUpperCase();
        if (opt === 'EX' && args[i + 1]) {
          exSeconds = parseInt(args[i + 1], 10);
          i++;
        } else if (opt === 'NX') {
          nx = true;
        }
      }

      const isExisting = this.store.has(key) && (!this.expirations.has(key) || this.expirations.get(key) > Date.now());

      if (nx && isExisting) {
        socket.write('$-1\r\n');
        return;
      }

      this.store.set(key, val);
      if (exSeconds) {
        this.expirations.set(key, Date.now() + exSeconds * 1000);
      } else {
        this.expirations.delete(key);
      }

      socket.write('+OK\r\n');
      return;
    }

    if (cmd === 'DEL') {
      let count = 0;
      for (let i = 1; i < args.length; i++) {
        const key = args[i];
        if (this.store.has(key)) {
          this.store.delete(key);
          this.expirations.delete(key);
          count++;
        }
      }
      socket.write(`:${count}\r\n`);
      return;
    }

    if (cmd === 'QUIT') {
      socket.write('+OK\r\n');
      socket.end();
      return;
    }

    socket.write('+OK\r\n');
  }
}

if (require.main === module) {
  const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const server = new DevRedisServer(port, host);

  server.start().catch((err) => {
    console.error('[DevRedis] Failed to start:', err);
    process.exit(1);
  });

  const shutdown = async () => {
    console.log('\n[DevRedis] Shutting down...');
    await server.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = { DevRedisServer };

