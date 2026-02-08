/**
 * Token store – MVP: in-memory with optional JSON file persistence.
 * Keys: platform_userId (e.g. meta_user123). Value: { accessToken, refreshToken, expiresAt, ... }.
 * Replace with DB (e.g. encrypted column per user) for production.
 */

const fs = require('fs');
const path = require('path');

const STORE_FILE = path.join(__dirname, 'token-store.json');

let memory = {};

function load() {
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    memory = JSON.parse(raw);
  } catch {
    memory = {};
  }
}

function save() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(memory, null, 2), 'utf8');
  } catch (err) {
    console.warn('Token store: could not persist to file', err.message);
  }
}

// Load on require so we start with persisted data if file exists
load();

function key(platform, userId) {
  return `${platform}_${userId || 'default'}`;
}

module.exports = {
  get(platform, userId) {
    return memory[key(platform, userId)] || null;
  },

  set(platform, userId, data) {
    memory[key(platform, userId)] = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    save();
  },

  delete(platform, userId) {
    delete memory[key(platform, userId)];
    save();
  },
};
