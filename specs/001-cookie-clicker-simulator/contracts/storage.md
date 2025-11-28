# Storage Contract: localStorage Operations

**Date**: 2025-11-23  
**Feature**: [spec.md](../spec.md)

## Overview

This contract defines the interface for all localStorage operations used by the Cookie Clicker Building Order Simulator. All operations are synchronous and use JSON serialization.

## Namespace

All localStorage keys are prefixed with `cookieRouter:` to avoid collisions.

## Operations

### Categories

#### `getCategories(): Category[]`

Retrieves all categories (predefined and user-created) from localStorage.

**Returns**: Array of Category objects, empty array if none exist or on error

**Errors**: 
- Handles corrupted JSON gracefully (returns empty array)
- Handles missing key gracefully (returns empty array)

**Storage Key**: `cookieRouter:categories`

---

#### `saveCategory(category: Category): void`

Saves a category to localStorage. If category with same ID exists, it is replaced.

**Parameters**:
- `category` (Category): Category object to save

**Returns**: void

**Errors**:
- Throws if localStorage quota exceeded
- Throws if category validation fails

**Storage Key**: `cookieRouter:categories`

---

#### `deleteCategory(categoryId: string): void`

Deletes a category from localStorage by ID.

**Parameters**:
- `categoryId` (string): ID of category to delete

**Returns**: void

**Errors**: None (idempotent - no error if category doesn't exist)

**Storage Key**: `cookieRouter:categories`

---

#### `getCategoryById(categoryId: string): Category | null`

Retrieves a single category by ID.

**Parameters**:
- `categoryId` (string): ID of category to retrieve

**Returns**: Category object or null if not found

**Errors**: None (returns null on error)

**Storage Key**: `cookieRouter:categories`

### Routes

#### `getRoutes(): Route[]`

Retrieves all calculated routes from localStorage.

**Returns**: Array of Route objects, empty array if none exist or on error

**Errors**: 
- Handles corrupted JSON gracefully (returns empty array)
- Handles missing key gracefully (returns empty array)

**Storage Key**: `cookieRouter:routes`

---

#### `saveRoute(route: Route): void`

Saves a calculated route to localStorage. If route with same ID exists, it is replaced.

**Parameters**:
- `route` (Route): Route object to save

**Returns**: void

**Errors**:
- Throws if localStorage quota exceeded
- Throws if route validation fails

**Storage Key**: `cookieRouter:routes`

---

#### `getRouteById(routeId: string): Route | null`

Retrieves a single route by ID.

**Parameters**:
- `routeId` (string): ID of route to retrieve

**Returns**: Route object or null if not found

**Errors**: None (returns null on error)

**Storage Key**: `cookieRouter:routes`

---

#### `getRoutesByCategory(categoryId: string): Route[]`

Retrieves all routes for a specific category.

**Parameters**:
- `categoryId` (string): ID of category

**Returns**: Array of Route objects for that category, empty array if none

**Errors**: None

**Storage Key**: `cookieRouter:routes`

---

#### `deleteRoute(routeId: string): void`

Deletes a route from localStorage by ID. Also deletes associated progress.

**Parameters**:
- `routeId` (string): ID of route to delete

**Returns**: void

**Errors**: None (idempotent)

**Storage Key**: `cookieRouter:routes` and `cookieRouter:progress`

### Progress

#### `getProgress(routeId: string): Progress | null`

Retrieves progress tracking for a specific route.

**Parameters**:
- `routeId` (string): ID of route

**Returns**: Progress object or null if not found

**Errors**: None (returns null on error)

**Storage Key**: `cookieRouter:progress`

---

#### `saveProgress(progress: Progress): void`

Saves progress tracking for a route.

**Parameters**:
- `progress` (Progress): Progress object to save

**Returns**: void

**Errors**:
- Throws if localStorage quota exceeded
- Throws if progress validation fails

**Storage Key**: `cookieRouter:progress`

---

#### `updateProgress(routeId: string, completedBuildings: number[]): void`

Updates the completed buildings list for a route's progress.

**Parameters**:
- `routeId` (string): ID of route
- `completedBuildings` (number[]): Array of step orders that are completed

**Returns**: void

**Errors**:
- Throws if routeId doesn't exist
- Throws if completedBuildings contains invalid step orders

**Storage Key**: `cookieRouter:progress`

---

#### `clearProgress(routeId: string): void`

Clears progress tracking for a route.

**Parameters**:
- `routeId` (string): ID of route

**Returns**: void

**Errors**: None (idempotent)

**Storage Key**: `cookieRouter:progress`

## Error Handling

All functions should handle localStorage errors gracefully:

1. **Quota Exceeded**: Catch `QuotaExceededError` and throw user-friendly error message
2. **Corrupted Data**: Validate JSON on read, return empty/default values if invalid
3. **Missing Keys**: Return empty arrays/objects or null as appropriate
4. **Invalid Data**: Validate input parameters, throw descriptive errors

## Data Validation

All save operations must validate data according to data-model.md before saving:
- Category: Validate all required fields, name length, numeric ranges
- Route: Validate building steps, algorithm, numeric fields
- Progress: Validate routeId exists, completedBuildings are valid step orders

## Implementation Notes

- All operations are synchronous (localStorage API is synchronous)
- Use try-catch blocks for error handling
- Log errors to console in development mode
- Consider implementing data versioning for future migrations

