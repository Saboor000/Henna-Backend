// lib/cache.js
const store = new Map();

export const cache = {
  get(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.value;
  },

  set(key, value, ttlSeconds = 60) {
    store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  },

  invalidate(prefix) {
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) store.delete(key);
    }
  },
};
