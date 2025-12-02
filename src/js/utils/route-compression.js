/**
 * Route Compression Utilities
 * Optimizes route storage by removing redundant data and using shorter field names
 */

/**
 * Compress a route step by removing redundant fields
 * Removes: cookiesPerSecond, timeElapsed, totalCookies (can be calculated)
 * Shortens field names
 */
export function compressRouteStep(step) {
  const compressed = {
    o: step.order,
    n: step.buildingName, // name
    r: step.cookiesRequired, // required
    ci: step.cpsIncrease, // cpsIncrease
    dt: step.timeSinceLastStep, // deltaTime
  };
  
  // Only include optional fields if they have values
  if (step.buildingCount !== null && step.buildingCount !== undefined) {
    compressed.c = step.buildingCount; // count
  }
  
  if (step.achievementUnlocks && step.achievementUnlocks.length > 0) {
    compressed.a = step.achievementUnlocks; // achievements
  }
  
  return compressed;
}

/**
 * Decompress a route step, calculating redundant fields from previous step
 */
export function decompressRouteStep(compressed, previousStep = null) {
  const step = {
    order: compressed.o,
    buildingName: compressed.n,
    cookiesRequired: compressed.r,
    cpsIncrease: compressed.ci,
    timeSinceLastStep: compressed.dt,
  };
  
  // Calculate redundant fields from previous step
  if (previousStep) {
    step.cookiesPerSecond = previousStep.cookiesPerSecond + compressed.ci;
    step.timeElapsed = previousStep.timeElapsed + compressed.dt;
    step.totalCookies = previousStep.totalCookies + compressed.r;
  } else {
    // First step - use values from compressed data if available, otherwise defaults
    step.cookiesPerSecond = compressed.cps || 0;
    step.timeElapsed = compressed.t || 0;
    step.totalCookies = compressed.tc || 0;
  }
  
  if (compressed.c !== undefined) {
    step.buildingCount = compressed.c;
  } else {
    step.buildingCount = null;
  }
  
  if (compressed.a) {
    step.achievementUnlocks = compressed.a;
  }
  
  return step;
}

/**
 * Compress an entire route
 */
export function compressRoute(route) {
  const compressed = {
    id: route.id,
    cid: route.categoryId, // categoryId
    b: route.buildings.map((step, i) => {
      const prev = i > 0 ? route.buildings[i - 1] : null;
      return compressRouteStep(step);
    }),
    ca: route.calculatedAt, // calculatedAt
    sb: route.startingBuildings, // startingBuildings
    alg: route.algorithm, // algorithm
    lh: route.lookahead, // lookahead
    ct: route.completionTime, // completionTime
    vid: route.versionId, // versionId
  };
  
  // Store first step's absolute values for decompression
  if (route.buildings.length > 0) {
    const first = route.buildings[0];
    compressed.b[0].cps = first.cookiesPerSecond;
    compressed.b[0].t = first.timeElapsed;
    compressed.b[0].tc = first.totalCookies;
  }
  
  if (route.achievementIds) {
    compressed.aid = route.achievementIds;
  }
  
  if (route.achievementUnlocks) {
    compressed.au = route.achievementUnlocks;
  }
  
  if (route.usedImportedData !== undefined) {
    compressed.uid = route.usedImportedData;
  }
  
  return compressed;
}

/**
 * Decompress an entire route
 */
export function decompressRoute(compressed) {
  const route = {
    id: compressed.id,
    categoryId: compressed.cid,
    buildings: compressed.b.map((step, i) => {
      const prev = i > 0 ? decompressRouteStep(compressed.b[i - 1], null) : null;
      return decompressRouteStep(step, prev);
    }),
    calculatedAt: compressed.ca,
    startingBuildings: compressed.sb,
    algorithm: compressed.alg,
    lookahead: compressed.lh,
    completionTime: compressed.ct,
    versionId: compressed.vid,
  };
  
  if (compressed.aid) {
    route.achievementIds = compressed.aid;
  }
  
  if (compressed.au) {
    route.achievementUnlocks = compressed.au;
  }
  
  if (compressed.uid !== undefined) {
    route.usedImportedData = compressed.uid;
  }
  
  return route;
}

/**
 * Estimate compression ratio
 */
export function estimateCompressionRatio(route) {
  const original = JSON.stringify(route).length;
  const compressed = JSON.stringify(compressRoute(route)).length;
  return {
    original,
    compressed,
    ratio: (compressed / original).toFixed(2),
    savings: ((1 - compressed / original) * 100).toFixed(1) + '%'
  };
}

