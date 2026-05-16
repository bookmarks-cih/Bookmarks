// Neo Marks Storage Sync Utilities
// Enables syncing localStorage marks to file-based storage server

(function() {
  const STORAGE_SERVER_URL = 'http://localhost:3456';
  let storageSyncEnabled = false;

  // Sync marks to server
  async function syncMarksToServer(cookieId, marks) {
    if (!storageSyncEnabled) return false;
    try {
      const response = await fetch(STORAGE_SERVER_URL + '/api/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookieId: cookieId, marks: marks })
      });
      if (response.ok) {
        console.log('[Marks] Synced to server:', marks.length, 'marks');
        return true;
      }
    } catch (e) {
      console.warn('[Marks] Server sync failed:', e.message);
    }
    return false;
  }

  // Load marks from server
  async function loadMarksFromServer(cookieId) {
    if (!storageSyncEnabled) return null;
    try {
      const response = await fetch(STORAGE_SERVER_URL + '/api/marks?cookieId=' + encodeURIComponent(cookieId));
      if (response.ok) {
        const data = await response.json();
        return data.marks || [];
      }
    } catch (e) {
      console.warn('[Marks] Server load failed:', e.message);
    }
    return null;
  }

  // Enable storage sync
  function enableStorageSync() {
    storageSyncEnabled = true;
    console.log('[Marks] Storage sync enabled - marks will sync to local server');
  }

  // Disable storage sync
  function disableStorageSync() {
    storageSyncEnabled = false;
    console.log('[Marks] Storage sync disabled');
  }

  // Check if sync is enabled
  function isSyncEnabled() {
    return storageSyncEnabled;
  }

  // Check server health
  async function checkServerHealth() {
    try {
      const response = await fetch(STORAGE_SERVER_URL + '/health');
      if (response.ok) {
        const data = await response.json();
        return { ok: true, status: data.status, uptime: data.uptime };
      }
    } catch (e) {
      return { ok: false, error: e.message };
    }
    return { ok: false, error: 'Server not responding' };
  }

  // Expose to window
  window.NeoMarksStorage = {
    enableStorageSync: enableStorageSync,
    disableStorageSync: disableStorageSync,
    syncMarksToServer: syncMarksToServer,
    loadMarksFromServer: loadMarksFromServer,
    isSyncEnabled: isSyncEnabled,
    checkServerHealth: checkServerHealth,
    SERVER_URL: STORAGE_SERVER_URL
  };

  console.log('[NeoMarksStorage] Utilities loaded');
})();