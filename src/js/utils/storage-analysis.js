/**
 * Storage Analysis Utility
 * Analyzes localStorage usage and identifies optimization opportunities
 * 
 * Usage in browser console:
 *   import { logStorageAnalysis } from './js/utils/storage-analysis.js';
 *   logStorageAnalysis();
 */

const STORAGE_PREFIX = 'cookieRouter:';

/**
 * Get detailed storage information
 */
export function getStorageInfo() {
  const info = {
    totalSize: 0,
    totalSizeKB: 0,
    totalSizeMB: 0,
    items: {},
    summary: {}
  };

  // Check all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      const value = localStorage.getItem(key);
      const size = new Blob([value]).size;
      info.totalSize += size;
      
      try {
        const parsed = JSON.parse(value);
        const itemInfo = {
          key: key,
          size: size,
          sizeKB: (size / 1024).toFixed(2),
          sizeMB: (size / (1024 * 1024)).toFixed(4),
          type: Array.isArray(parsed) ? 'array' : typeof parsed,
          count: Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length,
        };
        
        // Add sample data for routes
        if (key === STORAGE_PREFIX + 'routes' && Array.isArray(parsed) && parsed.length > 0) {
          const route = parsed[0];
          itemInfo.sample = {
            id: route.id,
            categoryId: route.categoryId,
            stepCount: route.buildings ? route.buildings.length : 0,
            firstStepFields: route.buildings && route.buildings.length > 0 ? Object.keys(route.buildings[0]) : []
          };
          itemInfo.totalSteps = parsed.reduce((sum, r) => sum + (r.buildings ? r.buildings.length : 0), 0);
        }
        
        // Add sample data for saved routes
        if (key === STORAGE_PREFIX + 'savedRoutes' && Array.isArray(parsed) && parsed.length > 0) {
          const savedRoute = parsed[0];
          itemInfo.sample = {
            id: savedRoute.id,
            name: savedRoute.name,
            categoryId: savedRoute.categoryId,
            stepCount: savedRoute.routeData && savedRoute.routeData.buildings ? savedRoute.routeData.buildings.length : 0
          };
        }
        
        info.items[key] = itemInfo;
      } catch (e) {
        info.items[key] = {
          key: key,
          size: size,
          sizeKB: (size / 1024).toFixed(2),
          error: 'Failed to parse'
        };
      }
    }
  }

  info.totalSizeKB = (info.totalSize / 1024).toFixed(2);
  info.totalSizeMB = (info.totalSize / (1024 * 1024)).toFixed(4);
  
  // Create summary
  info.summary = {
    totalItems: Object.keys(info.items).length,
    totalSize: `${info.totalSizeKB} KB (${info.totalSizeMB} MB)`,
    largestItem: Object.values(info.items).reduce((max, item) => 
      item.size > (max?.size || 0) ? item : max, null
    )
  };

  return info;
}

/**
 * Analyze storage usage
 */
export function analyzeStorage() {
  const analysis = {
    totalSize: 0,
    items: {},
    recommendations: []
  };

  // Check all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      const value = localStorage.getItem(key);
      const size = new Blob([value]).size;
      analysis.totalSize += size;
      
      try {
        const parsed = JSON.parse(value);
        analysis.items[key] = {
          size,
          sizeKB: (size / 1024).toFixed(2),
          sizeMB: (size / (1024 * 1024)).toFixed(2),
          type: Array.isArray(parsed) ? 'array' : typeof parsed,
          count: Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length,
          sample: Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : parsed
        };
      } catch (e) {
        analysis.items[key] = {
          size,
          sizeKB: (size / 1024).toFixed(2),
          error: 'Failed to parse'
        };
      }
    }
  }

  // Analyze routes specifically
  const routesData = localStorage.getItem(STORAGE_PREFIX + 'routes');
  if (routesData) {
    try {
      const routes = JSON.parse(routesData);
      if (Array.isArray(routes) && routes.length > 0) {
        const route = routes[0];
        if (route.buildings && route.buildings.length > 0) {
          const step = route.buildings[0];
          const stepSize = new Blob([JSON.stringify(step)]).size;
          const avgStepSize = routes.reduce((sum, r) => {
            return sum + (r.buildings ? r.buildings.reduce((s, step) => s + new Blob([JSON.stringify(step)]).size, 0) : 0);
          }, 0) / routes.reduce((sum, r) => sum + (r.buildings ? r.buildings.length : 0), 0);
          
          analysis.items[STORAGE_PREFIX + 'routes'].stepAnalysis = {
            totalSteps: routes.reduce((sum, r) => sum + (r.buildings ? r.buildings.length : 0), 0),
            avgStepSize: avgStepSize.toFixed(2),
            stepFields: Object.keys(step),
            sampleStep: step
          };
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  // Generate recommendations
  if (analysis.totalSize > 1024 * 1024) { // > 1MB
    analysis.recommendations.push('Storage exceeds 1MB - consider cleaning old routes');
  }

  const routesItem = analysis.items[STORAGE_PREFIX + 'routes'];
  if (routesItem && routesItem.count > 10) {
    analysis.recommendations.push(`Found ${routesItem.count} calculated routes - old routes should be cleaned automatically`);
  }

  return analysis;
}

/**
 * Log storage analysis to console
 */
export function logStorageAnalysis() {
  const analysis = analyzeStorage();
  console.group('📊 Storage Analysis');
  console.log(`Total size: ${(analysis.totalSize / (1024 * 1024)).toFixed(2)} MB`);
  console.table(analysis.items);
  
  if (analysis.recommendations.length > 0) {
    console.group('💡 Recommendations');
    analysis.recommendations.forEach(rec => console.log(`- ${rec}`));
    console.groupEnd();
  }
  
  if (analysis.items[STORAGE_PREFIX + 'routes']?.stepAnalysis) {
    console.group('Route Step Analysis');
    console.log(analysis.items[STORAGE_PREFIX + 'routes'].stepAnalysis);
    console.groupEnd();
  }
  
  console.groupEnd();
  return analysis;
}

/**
 * Log detailed storage information including content and sizes
 */
export function logStorageInfo() {
  const info = getStorageInfo();
  
  console.group('💾 localStorage Content & Size');
  console.log(`Total Storage: ${info.summary.totalSize}`);
  console.log(`Items: ${info.summary.totalItems}`);
  
  if (info.summary.largestItem) {
    console.log(`Largest Item: ${info.summary.largestItem.key} (${info.summary.largestItem.sizeKB} KB)`);
  }
  
  console.group('📦 Storage Items');
  Object.values(info.items).forEach(item => {
    console.group(`🔑 ${item.key.replace(STORAGE_PREFIX, '')}`);
    console.log(`Size: ${item.sizeKB} KB (${item.sizeMB} MB)`);
    console.log(`Type: ${item.type}`);
    console.log(`Count: ${item.count}`);
    
    if (item.sample) {
      console.log('Sample:', item.sample);
    }
    
    if (item.totalSteps) {
      console.log(`Total Steps: ${item.totalSteps}`);
    }
    
    // Show actual content for small items or on request
    if (item.size < 10240) { // Less than 10KB
      try {
        const content = JSON.parse(localStorage.getItem(item.key));
        console.log('Content:', content);
      } catch (e) {
        console.log('Content: [Unable to parse]');
      }
    } else {
      console.log('Content: [Too large to display - use getStorageItemContent()]');
    }
    
    console.groupEnd();
  });
  console.groupEnd();
  
  console.group('📊 Summary');
  console.table(Object.values(info.items).map(item => ({
    Key: item.key.replace(STORAGE_PREFIX, ''),
    'Size (KB)': item.sizeKB,
    'Size (MB)': item.sizeMB,
    Type: item.type,
    Count: item.count,
    'Total Steps': item.totalSteps || '-'
  })));
  console.groupEnd();
  
  console.groupEnd();
  return info;
}

/**
 * Get content of a specific storage item
 */
export function getStorageItemContent(key) {
  const fullKey = key.startsWith(STORAGE_PREFIX) ? key : STORAGE_PREFIX + key;
  const value = localStorage.getItem(fullKey);
  if (!value) {
    console.warn(`Storage item "${fullKey}" not found`);
    return null;
  }
  
  try {
    return JSON.parse(value);
  } catch (e) {
    console.error(`Failed to parse storage item "${fullKey}":`, e);
    return value; // Return raw string if not JSON
  }
}

