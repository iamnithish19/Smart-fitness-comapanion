import dns from 'node:dns';
import fs from 'node:fs';
import path from 'node:path';
import { MongoClient } from 'mongodb';

// Ensure IPv4 first to avoid Node 24 Windows NAT64 translation timeouts
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignore if already set or unsupported
}

const CONFIG_PATH = path.resolve(process.cwd(), 'mongodb_config.json');

const DEFAULT_CONFIG = {
  uri: 'mongodb+srv://24104025_db_user:HxM3b9pQ1uUywf7f@cluster0.sump7fc.mongodb.net/?appName=Cluster0',
  dbName: 'smart_fitness_companion',
  autoSync: true
};

export function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('[MongoDB] Error reading config file:', err.message);
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(newConfig) {
  const current = loadConfig();
  const merged = { ...current, ...newConfig };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  // Invalidate cached client to reconnect with new config
  closeClient();
  return merged;
}

export function maskUri(uri) {
  if (!uri) return '';
  return uri.replace(/(:\/\/[^:]+:)([^@]+)(@)/, '$1••••••••$3');
}

/**
 * Builds direct replica-set fallback URI if Node c-ares DNS SRV resolution encounters ECONNREFUSED/ETIMEDOUT.
 */
export function getDirectFallbackUri(uri) {
  if (uri.includes('cluster0.sump7fc.mongodb.net')) {
    const authPart = uri.replace('mongodb+srv://', '').split('@')[0];
    return `mongodb://${authPart}@ac-kln2yin-shard-00-00.sump7fc.mongodb.net:27017,ac-kln2yin-shard-00-01.sump7fc.mongodb.net:27017,ac-kln2yin-shard-00-02.sump7fc.mongodb.net:27017/?ssl=true&authSource=admin&replicaSet=atlas-asmhka-shard-0&appName=Cluster0`;
  }
  return uri;
}

let cachedClient = null;
let cachedUri = null;
let isConnecting = false;

export async function getClient(customUri) {
  const config = loadConfig();
  const targetUri = customUri || config.uri;

  if (cachedClient && cachedUri === targetUri) {
    return cachedClient;
  }

  if (cachedClient) {
    await closeClient();
  }

  let client = null;
  // First attempt with user URI
  try {
    client = new MongoClient(targetUri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 5000
    });
    await client.connect();
  } catch (err) {
    const isDnsError =
      err.message.includes('querySrv') ||
      err.message.includes('ETIMEDOUT') ||
      err.message.includes('ECONNREFUSED') ||
      err.message.includes('ENETUNREACH');

    if (isDnsError && targetUri.includes('mongodb+srv://')) {
      console.log('[MongoDB] DNS SRV query issue detected. Switching to direct Atlas cluster replica topology...');
      const fallbackUri = getDirectFallbackUri(targetUri);
      client = new MongoClient(fallbackUri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000
      });
      await client.connect();
    } else {
      throw err;
    }
  }

  if (!customUri) {
    cachedClient = client;
    cachedUri = targetUri;
  }
  return client;
}

export async function closeClient() {
  if (cachedClient) {
    try {
      await cachedClient.close();
    } catch (e) {}
    cachedClient = null;
    cachedUri = null;
  }
}

export async function testConnection(customUri, customDbName) {
  const config = loadConfig();
  const uriToTest = customUri || config.uri;
  const dbNameToTest = customDbName || config.dbName;
  const startTime = Date.now();

  let testClient = null;
  try {
    testClient = await getClient(uriToTest);
    const admin = testClient.db('admin');
    await admin.command({ ping: 1 });
    const latencyMs = Date.now() - startTime;

    const db = testClient.db(dbNameToTest);
    const collections = await db.listCollections().toArray();

    return {
      success: true,
      latencyMs,
      dbName: dbNameToTest,
      maskedUri: maskUri(uriToTest),
      collectionsCount: collections.length,
      collections: collections.map((c) => c.name)
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      maskedUri: maskUri(uriToTest)
    };
  } finally {
    if (customUri && testClient && testClient !== cachedClient) {
      await testClient.close().catch(() => {});
    }
  }
}

export async function getStatus() {
  const config = loadConfig();
  const startTime = Date.now();
  try {
    const client = await getClient();
    const admin = client.db('admin');
    await admin.command({ ping: 1 });
    const latencyMs = Date.now() - startTime;

    const db = client.db(config.dbName);
    const collections = await db.listCollections().toArray();

    const collectionStats = [];
    for (const col of collections) {
      try {
        const count = await db.collection(col.name).countDocuments();
        collectionStats.push({ name: col.name, count });
      } catch (e) {
        collectionStats.push({ name: col.name, count: 0 });
      }
    }

    return {
      connected: true,
      dbName: config.dbName,
      maskedUri: maskUri(config.uri),
      rawUri: config.uri,
      autoSync: config.autoSync,
      latencyMs,
      collectionsCount: collections.length,
      collections: collectionStats
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
      dbName: config.dbName,
      maskedUri: maskUri(config.uri),
      rawUri: config.uri,
      autoSync: config.autoSync,
      collectionsCount: 0,
      collections: []
    };
  }
}

export async function syncAllTables(data) {
  const config = loadConfig();
  const client = await getClient();
  const db = client.db(config.dbName);

  const results = {};
  for (const [table, rows] of Object.entries(data)) {
    if (!Array.isArray(rows)) continue;
    try {
      const col = db.collection(table);
      // Clean and re-seed collection or upsert
      await col.deleteMany({});
      if (rows.length > 0) {
        // Strip MongoDB default _id if present in seed to avoid duplicate key issues
        const cleanRows = rows.map((r) => {
          const clone = { ...r };
          delete clone._id;
          return clone;
        });
        await col.insertMany(cleanRows);
      }
      results[table] = rows.length;
    } catch (err) {
      console.error(`[MongoDB] Error syncing table ${table}:`, err.message);
      results[table] = { error: err.message };
    }
  }

  // Update sync metadata collection
  try {
    const metaCol = db.collection('_sync_meta');
    await metaCol.updateOne(
      { _id: 'last_sync' },
      { $set: { syncedAt: new Date().toISOString(), tablesCount: Object.keys(results).length } },
      { upsert: true }
    );
  } catch (e) {}

  return results;
}

export async function fetchAllTables() {
  const config = loadConfig();
  const client = await getClient();
  const db = client.db(config.dbName);

  const collections = await db.listCollections().toArray();
  const data = {};

  for (const col of collections) {
    if (col.name.startsWith('_')) continue;
    try {
      const docs = await db.collection(col.name).find({}).toArray();
      // Remove Mongo _id before sending to frontend state
      data[col.name] = docs.map((doc) => {
        const { _id, ...rest } = doc;
        return rest;
      });
    } catch (e) {
      data[col.name] = [];
    }
  }

  return data;
}

export async function saveRow(table, row, pkField) {
  const config = loadConfig();
  const client = await getClient();
  const db = client.db(config.dbName);
  const col = db.collection(table);

  const { _id, ...cleanRow } = row;
  const filter = pkField && cleanRow[pkField] !== undefined ? { [pkField]: cleanRow[pkField] } : cleanRow;

  await col.updateOne(filter, { $set: cleanRow }, { upsert: true });
  return { success: true };
}

export async function deleteRow(table, id, pkField) {
  const config = loadConfig();
  const client = await getClient();
  const db = client.db(config.dbName);
  const col = db.collection(table);

  const filter = { [pkField]: id };
  await col.deleteOne(filter);
  return { success: true };
}
