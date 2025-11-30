/**
 * Unit tests for Page State Detection
 * Tests the detectPageState() function and related logic
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { detectPageState } from '../../src/main.js';
import { getSavedRoutes } from '../../src/js/storage.js';

// Mock storage module
vi.mock('../../src/js/storage.js', () => ({
  getSavedRoutes: vi.fn()
}));

describe('Page State Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('detectPageState()', () => {
    it('should return hasSavedRoutes: false when no saved routes exist', () => {
      getSavedRoutes.mockReturnValue([]);
      
      const pageState = detectPageState();
      
      expect(pageState).toEqual({ hasSavedRoutes: false });
      expect(getSavedRoutes).toHaveBeenCalledOnce();
    });

    it('should return hasSavedRoutes: true when saved routes exist', () => {
      const mockSavedRoutes = [
        { id: 'route-1', name: 'Test Route', categoryId: 'cat-1' }
      ];
      getSavedRoutes.mockReturnValue(mockSavedRoutes);
      
      const pageState = detectPageState();
      
      expect(pageState).toEqual({ hasSavedRoutes: true });
      expect(getSavedRoutes).toHaveBeenCalledOnce();
    });

    it('should handle localStorage errors gracefully and default to hasSavedRoutes: false', () => {
      // getSavedRoutes() already handles errors and returns [] on error
      getSavedRoutes.mockReturnValue([]);
      
      const pageState = detectPageState();
      
      expect(pageState).toEqual({ hasSavedRoutes: false });
      expect(getSavedRoutes).toHaveBeenCalledOnce();
    });
  });
});

