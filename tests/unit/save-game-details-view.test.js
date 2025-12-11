/**
 * Unit tests for save game details view
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveGameDetailsView } from '../../src/js/ui/save-game-details-view.js';
import { getImportedSaveGame, clearImportedSaveGame } from '../../src/js/save-game-importer.js';

// Mock the importer module
vi.mock('../../src/js/save-game-importer.js', () => ({
  getImportedSaveGame: vi.fn(),
  clearImportedSaveGame: vi.fn()
}));

describe('SaveGameDetailsView', () => {
  let container;
  let view;

  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    container.id = 'test-save-game-details';
    document.body.appendChild(container);
    
    // Create view instance
    view = new SaveGameDetailsView('test-save-game-details');
    
    // Clear mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('should render empty state when no save game is imported', () => {
    getImportedSaveGame.mockReturnValue(null);
    
    view.render();
    
    expect(container.innerHTML).toContain('No save game imported');
  });

  it('should render save game details when imported', () => {
    const mockSaveGame = {
      version: 'v2052',
      buildingCounts: {
        'Cursor': 23,
        'Grandma': 25,
        'Farm': 20
      },
      totalCookies: 248402.5281663947,
      cookiesPerSecond: 10585973.528169299,
      hardcoreMode: false,
      playerCps: 8,
      timeElapsed: 9092.3,
      importedAt: Date.now()
    };
    
    getImportedSaveGame.mockReturnValue(mockSaveGame);
    
    view.render();
    
    expect(container.innerHTML).toContain('Imported Save Game Details');
    expect(container.innerHTML).toContain('v2052');
    expect(container.innerHTML).toContain('Cursor');
    expect(container.innerHTML).toContain('23');
  });

  it('should toggle collapse state', () => {
    const mockSaveGame = {
      buildingCounts: {},
      importedAt: Date.now()
    };
    
    getImportedSaveGame.mockReturnValue(mockSaveGame);
    
    view.render();
    view.attachEventListeners();
    
    const initialCollapsed = view.isCollapsed;
    const toggleBtn = container.querySelector('#save-game-details-toggle');
    
    if (toggleBtn) {
      toggleBtn.click();
      expect(view.isCollapsed).toBe(!initialCollapsed);
    }
  });

  it('should format numbers correctly', () => {
    expect(view.formatNumber(1000)).toBe('1.00K');
    expect(view.formatNumber(1000000)).toBe('1.00M');
    expect(view.formatNumber(1000000000)).toBe('1.00B');
    expect(view.formatNumber(1000000000000)).toBe('1.00T');
    expect(view.formatNumber(123)).toBe('123');
  });

  it('should format time correctly', () => {
    expect(view.formatTime(3661)).toBe('1h 1m 1s');
    expect(view.formatTime(61)).toBe('1m 1s');
    expect(view.formatTime(30)).toBe('30s');
    expect(view.formatTime(0)).toBe('0s');
    expect(view.formatTime(86400)).toBe('1d');
    expect(view.formatTime(90000)).toBe('1d 1h');
    expect(view.formatTime(90061)).toBe('1d 1h 1m 1s');
    expect(view.formatTime(31536000)).toBe('1y');
    expect(view.formatTime(31622400)).toBe('1y 1d');
    expect(view.formatTime(31626061)).toBe('1y 1d 1h 1m 1s');
    expect(view.formatTime(63072000)).toBe('2y');
  });

  it('should escape HTML to prevent XSS', () => {
    const malicious = '<script>alert("xss")</script>';
    const escaped = view.escapeHtml(malicious);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;');
  });
});

