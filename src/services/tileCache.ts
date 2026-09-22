/**
 * RakshaNet Offline Tile Caching Engine for Leaflet
 * Provides seamless offline map navigation during internet and cellular grid outages.
 * Caches vector/raster basemaps into Browser CacheStorage and IndexedDB.
 */
import L from 'leaflet';

export const TILE_CACHE_NAME = 'rakshanet-leaflet-tiles-v1';
export const TILE_METADATA_KEY = 'rakshanet_tile_cache_metadata';

export interface CachedAreaInfo {
  name: string;
  lat: number;
  lng: number;
  tileCount: number;
  cachedAt: number;
}

export interface TileCacheStats {
  totalTiles: number;
  estimatedSizeMB: number;
  lastUpdated: number | null;
  areas: CachedAreaInfo[];
  isCaching: boolean;
}

let isMonkeyPatched = false;

/**
 * Converts Latitude/Longitude to Web Mercator Tile X, Y coordinates
 */
export function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number; z: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n
  );
  return { x: Math.max(0, Math.min(x, n - 1)), y: Math.max(0, Math.min(y, n - 1)), z: zoom };
}

/**
 * Generates an SVG data URI representing a tactical offline backup grid
 * used when a user pans to an uncached coordinate while 100% offline.
 */
export function getOfflineFallbackTileSvg(coords: { x: number; y: number; z: number }): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#090d16" />
    <path d="M 0 0 L 256 0 M 0 64 L 256 64 M 0 128 L 256 128 M 0 192 L 256 192 M 0 256 L 256 256" stroke="#1e293b" stroke-width="1" />
    <path d="M 0 0 L 0 256 M 64 0 L 64 256 M 128 0 L 128 256 M 192 0 L 192 256 M 256 0 L 256 256" stroke="#1e293b" stroke-width="1" />
    <circle cx="128" cy="128" r="4" fill="#334155" />
    <text x="128" y="145" fill="#475569" font-family="monospace" font-size="10" text-anchor="middle">OFFLINE GRID</text>
    <text x="128" y="160" fill="#334155" font-family="monospace" font-size="8" text-anchor="middle">Z:${coords.z} X:${coords.x} Y:${coords.y}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Initializes transparent offline caching on Leaflet's TileLayer.
 * Every Leaflet TileLayer in the application will automatically:
 * 1. Check CacheStorage for existing cached tiles (works offline)
 * 2. On cache-hit: load from local CacheStorage blob instantly (zero network latency)
 * 3. On cache-miss and online: fetch and store into CacheStorage on-the-fly
 * 4. On cache-miss and offline: gracefully fallback to tactical offline grid
 */
export function initLeafletTileCaching() {
  if (isMonkeyPatched || typeof window === 'undefined') return;

  const originalCreateTile = (L.TileLayer.prototype as any).createTile;

  (L.TileLayer.prototype as any).createTile = function (coords: any, done: L.DoneCallback) {
    const tile = document.createElement('img');

    L.DomEvent.on(tile, 'load', L.Util.bind((this as any)._tileOnLoad, this, done, tile));
    L.DomEvent.on(tile, 'error', L.Util.bind((this as any)._tileOnError, this, done, tile));

    if (this.options.crossOrigin || this.options.crossOrigin === '') {
      tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
    }

    tile.alt = '';
    tile.setAttribute('role', 'presentation');

    const url = this.getTileUrl(coords);

    // If CacheStorage is supported
    if ('caches' in window) {
      caches.open(TILE_CACHE_NAME).then(cache => {
        cache.match(url).then(cachedResponse => {
          if (cachedResponse) {
            // Cache Hit: Serve from offline cache
            cachedResponse.blob().then(blob => {
              const objectUrl = URL.createObjectURL(blob);
              tile.onload = () => {
                URL.revokeObjectURL(objectUrl);
                (this as any)._tileOnLoad(done, tile);
              };
              tile.src = objectUrl;
            }).catch(() => {
              tile.src = url;
            });
          } else {
            // Cache Miss
            if (!navigator.onLine) {
              // Completely offline and tile not precached -> fallback to tactical grid
              tile.src = getOfflineFallbackTileSvg(coords);
            } else {
              // Online: Load standard tile, and asynchronously cache in background
              tile.src = url;
              // Cache on the fly
              fetch(url, { mode: 'cors' })
                .then(res => {
                  if (res.ok) {
                    cache.put(url, res.clone());
                  }
                })
                .catch(() => {
                  // Ignore background cache fetch failures
                });
            }
          }
        }).catch(() => {
          tile.src = url;
        });
      }).catch(() => {
        tile.src = url;
      });
    } else {
      tile.src = url;
    }

    return tile;
  };

  isMonkeyPatched = true;
  console.log('✅ Leaflet Tile Caching Engine initialized successfully.');
}

/**
 * Primary Basemap Tile Templates for precaching critical emergency zones
 */
const CRITICAL_TILE_TEMPLATES = [
  // 1. Tactical Dark Canvas Base
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  // 2. Tactical Dark Canvas Reference Labels
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
  // 3. OpenStreetMap Street Cartography
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
];

/**
 * Calculates all tile URLs covering given critical locations at navigation zoom levels
 */
export function getTileUrlsForLocations(
  locations: { lat: number; lng: number }[],
  zoomLevels: number[] = [12, 13, 14]
): { url: string; coords: { x: number; y: number; z: number } }[] {
  const tileSet = new Map<string, { url: string; coords: { x: number; y: number; z: number } }>();

  for (const loc of locations) {
    for (const z of zoomLevels) {
      const centerTile = latLngToTile(loc.lat, loc.lng, z);
      // For each zoom, cache a 3x3 grid around the critical coordinate
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const x = centerTile.x + dx;
          const y = centerTile.y + dy;
          const coords = { x, y, z };

          for (const template of CRITICAL_TILE_TEMPLATES) {
            let url = template
              .replace('{z}', z.toString())
              .replace('{x}', x.toString())
              .replace('{y}', y.toString());
            
            // Random subdomain if template uses {s}
            if (url.includes('{s}')) {
              url = url.replace('{s}', 'a');
            }

            if (!tileSet.has(url)) {
              tileSet.set(url, { url, coords });
            }
          }
        }
      }
    }
  }

  return Array.from(tileSet.values());
}

/**
 * Downloads and caches tiles for critical areas (User location, Shelters, Hazard Epicenters)
 */
export async function cacheCriticalAreas(
  criticalAreas: { name: string; lat: number; lng: number }[],
  onProgress?: (progress: { loaded: number; total: number; percent: number; statusText: string }) => void
): Promise<{ success: boolean; totalCached: number; totalBytes: number }> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return { success: false, totalCached: 0, totalBytes: 0 };
  }

  const cache = await caches.open(TILE_CACHE_NAME);
  const tileEntries = getTileUrlsForLocations(criticalAreas, [12, 13, 14]);
  const total = tileEntries.length;
  let loaded = 0;
  let totalBytes = 0;

  if (onProgress) {
    onProgress({ loaded: 0, total, percent: 0, statusText: 'Starting tile caching for critical areas...' });
  }

  // Concurrency limit to prevent network throttling
  const CONCURRENCY = 6;
  const chunks: { url: string; coords: { x: number; y: number; z: number } }[][] = [];
  for (let i = 0; i < tileEntries.length; i += CONCURRENCY) {
    chunks.push(tileEntries.slice(i, i + CONCURRENCY));
  }

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(async item => {
        try {
          const existing = await cache.match(item.url);
          if (existing) {
            const blob = await existing.blob();
            totalBytes += blob.size;
            loaded++;
          } else {
            const response = await fetch(item.url, { mode: 'cors' });
            if (response.ok) {
              const clone = response.clone();
              const blob = await clone.blob();
              totalBytes += blob.size;
              await cache.put(item.url, response);
              loaded++;
            }
          }
        } catch (err) {
          // If fetch fails, don't crash
        }
      })
    );

    const percent = Math.min(100, Math.round((loaded / total) * 100));
    if (onProgress) {
      onProgress({
        loaded,
        total,
        percent,
        statusText: `Caching critical tiles (${loaded}/${total})...`
      });
    }
  }

  // Store metadata in localStorage
  const existingMetadata = getStoredTileMetadata();
  const areaInfos: CachedAreaInfo[] = criticalAreas.map(area => ({
    name: area.name,
    lat: area.lat,
    lng: area.lng,
    tileCount: Math.round(loaded / (criticalAreas.length || 1)),
    cachedAt: Date.now()
  }));

  const updatedMetadata: TileCacheStats = {
    totalTiles: loaded,
    estimatedSizeMB: Number((totalBytes / (1024 * 1024)).toFixed(2)) || Number((loaded * 0.025).toFixed(2)),
    lastUpdated: Date.now(),
    areas: areaInfos,
    isCaching: false
  };

  saveStoredTileMetadata(updatedMetadata);

  if (onProgress) {
    onProgress({
      loaded,
      total,
      percent: 100,
      statusText: `Successfully cached ${loaded} critical map tiles!`
    });
  }

  return { success: true, totalCached: loaded, totalBytes };
}

/**
 * Returns stats about the current tile cache
 */
export async function getTileCacheStats(): Promise<TileCacheStats> {
  const metadata = getStoredTileMetadata();

  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(TILE_CACHE_NAME);
      const keys = await cache.keys();
      const count = keys.length;

      return {
        totalTiles: count,
        estimatedSizeMB: Number((count * 0.022).toFixed(2)), // avg ~22KB per map tile
        lastUpdated: metadata.lastUpdated,
        areas: metadata.areas,
        isCaching: false
      };
    } catch {
      return metadata;
    }
  }

  return metadata;
}

/**
 * Clears all cached map tiles
 */
export async function clearTileCache(): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;

  try {
    await caches.delete(TILE_CACHE_NAME);
    localStorage.removeItem(TILE_METADATA_KEY);
    return true;
  } catch {
    return false;
  }
}

// Local Storage helpers
function getStoredTileMetadata(): TileCacheStats {
  if (typeof window === 'undefined') {
    return { totalTiles: 0, estimatedSizeMB: 0, lastUpdated: null, areas: [], isCaching: false };
  }
  try {
    const raw = localStorage.getItem(TILE_METADATA_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { totalTiles: 0, estimatedSizeMB: 0, lastUpdated: null, areas: [], isCaching: false };
}

function saveStoredTileMetadata(meta: TileCacheStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TILE_METADATA_KEY, JSON.stringify(meta));
  } catch {}
}
