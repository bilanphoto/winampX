/**
 * Winamp Web Player - IndexedDB Storage Engine
 * Persists imported audio files (MP3, WAV, etc.) and playlist state
 * across page refreshes and browser restarts.
 */

class WinampDB {
  constructor() {
    this.dbName = 'WinampWebDB';
    this.dbVersion = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Object store for audio tracks (metadata + audio blob)
        if (!db.objectStoreNames.contains('tracks')) {
          const trackStore = db.createObjectStore('tracks', { keyPath: 'id' });
          trackStore.createIndex('order', 'order', { unique: false });
        }

        // Object store for settings and application state
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Add or update a track
  async saveTrack(track) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tracks'], 'readwrite');
      const store = transaction.objectStore('tracks');
      const req = store.put(track);

      req.onsuccess = () => resolve(track);
      req.onerror = () => reject(req.error);
    });
  }

  // Add multiple tracks at once
  async saveTracks(tracks) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tracks'], 'readwrite');
      const store = transaction.objectStore('tracks');

      tracks.forEach(track => store.put(track));

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Retrieve all tracks sorted by order
  async getAllTracks() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tracks'], 'readonly');
      const store = transaction.objectStore('tracks');
      const index = store.index('order');
      const req = index.getAll();

      req.onsuccess = () => {
        resolve(req.result || []);
      };
      req.onerror = () => reject(req.error);
    });
  }

  // Remove a track by ID
  async deleteTrack(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tracks'], 'readwrite');
      const store = transaction.objectStore('tracks');
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  // Clear all tracks
  async clearTracks() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tracks'], 'readwrite');
      const store = transaction.objectStore('tracks');
      const req = store.clear();

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  // Re-save track order
  async updateOrder(tracks) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tracks'], 'readwrite');
      const store = transaction.objectStore('tracks');

      tracks.forEach((t, idx) => {
        t.order = idx;
        store.put(t);
      });

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Settings storage with localStorage dual-persistence
  async setSetting(key, value) {
    try {
      localStorage.setItem('wa_' + key, JSON.stringify(value));
    } catch (e) {}

    if (!this.db) {
      try {
        await this.init();
      } catch (e) {
        return false;
      }
    }

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        const req = store.put({ key, value });

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  }

  async getSetting(key, defaultValue = null) {
    let localVal = defaultValue;
    try {
      const item = localStorage.getItem('wa_' + key);
      if (item !== null) {
        localVal = JSON.parse(item);
      }
    } catch (e) {}

    if (!this.db) {
      try {
        await this.init();
      } catch (e) {
        return localVal;
      }
    }

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        const req = store.get(key);

        req.onsuccess = () => {
          if (req.result && req.result.value !== undefined) {
            resolve(req.result.value);
          } else {
            resolve(localVal);
          }
        };
        req.onerror = () => resolve(localVal);
      } catch (err) {
        resolve(localVal);
      }
    });
  }
}

// Global instance
window.winampDB = new WinampDB();
