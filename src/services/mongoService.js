// src/services/mongoService.js
// Client service to interact with the MongoDB Atlas backend endpoints

export async function getMongoStatus() {
  try {
    const res = await fetch('/api/mongodb/status', {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[MongoDB Service] getMongoStatus error:', err.message);
    return {
      connected: false,
      error: err.message,
      collections: []
    };
  }
}

export async function testMongoConnection(uri, dbName) {
  try {
    const res = await fetch('/api/mongodb/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri, dbName })
    });
    return await res.json();
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

export async function saveMongoConfig(config) {
  try {
    const res = await fetch('/api/mongodb/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return await res.json();
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

export async function syncAllToMongo(data) {
  try {
    const res = await fetch('/api/mongodb/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    return await res.json();
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

export async function fetchAllFromMongo() {
  try {
    const res = await fetch('/api/mongodb/fetch-all', {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    return {
      success: false,
      error: err.message,
      data: null
    };
  }
}

export async function saveRowToMongo(table, row, pkField) {
  try {
    fetch('/api/mongodb/save-row', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, row, pkField })
    }).catch((e) => console.warn('[MongoDB saveRow background]', e.message));
  } catch (e) {}
}

export async function deleteRowFromMongo(table, id, pkField) {
  try {
    fetch('/api/mongodb/delete-row', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id, pkField })
    }).catch((e) => console.warn('[MongoDB deleteRow background]', e.message));
  } catch (e) {}
}
