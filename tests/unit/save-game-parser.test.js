/**
 * Unit tests for save game parser
 */

import { describe, it, expect } from 'vitest';
import {
  decodeSaveString,
  decodeBase64,
  parseSections,
  extractBuildingCounts,
  detectVersion,
  extractGameStats,
  parseSaveGame,
  SaveGameParseError,
  SaveGameDecodeError
} from '../../src/js/save-game-parser.js';

// Example save string (base64 encoded "2.053|section2|section3")
const EXAMPLE_SAVE = 'Mi4wNTN8c2VjdGlvbjJ8c2VjdGlvbjM=!END!';

describe('decodeSaveString', () => {
  it('should remove !END! suffix', () => {
    const input = 'dGVzdA==!END!';
    const result = decodeSaveString(input);
    expect(result).toBe('dGVzdA==');
  });

  it('should handle URL-encoded strings', () => {
    const input = 'dGVzdCUzRA%3D%3D!END!';
    const result = decodeSaveString(input);
    expect(result).toBe('dGVzdA==');
  });

  it('should throw SaveGameDecodeError for invalid input', () => {
    expect(() => decodeSaveString(null)).toThrow(SaveGameDecodeError);
  });
});

describe('decodeBase64', () => {
  it('should decode valid base64 string', () => {
    const result = decodeBase64('dGVzdA==');
    expect(result).toBe('test');
  });

  it('should throw SaveGameDecodeError for invalid base64', () => {
    expect(() => decodeBase64('invalid!!!')).toThrow(SaveGameDecodeError);
  });
});

describe('parseSections', () => {
  it('should split string by | character', () => {
    const result = parseSections('section1|section2|section3');
    expect(result).toEqual(['section1', 'section2', 'section3']);
  });
});

describe('detectVersion', () => {
  it('should detect v2052 from version 2.053', () => {
    const result = detectVersion('2.053|section2');
    expect(result).toBe('v2052');
  });

  it('should return null if version cannot be determined', () => {
    const result = detectVersion('unknown|section2');
    expect(result).toBeNull();
  });
});

describe('extractGameStats', () => {
  it('should extract total cookies and cookies per second', () => {
    const decoded = '2.053|||248402.5281663947;10585973.528169299;15;4;15;7;0;0;0;0;0;0;0;0;0;4;0;0;0;0;0;0;;0;0;0;0;0;0;0;-1;-1;-1;-1;-1;0;0;0;0;75;0;0;-1;-1;1763823785965;0;0;;100;0;0;9092.3;50;0;0;|section5';
    const result = extractGameStats(decoded);
    expect(result.totalCookies).toBe(248402.5281663947);
    expect(result.cookiesPerSecond).toBe(10585973.528169299);
  });
});

describe('extractBuildingCounts', () => {
  it('should extract building counts', async () => {
    const buildingEntries = ['23,23,8290,0,,0,23', '25,25,94125,0,,0,25'].join(';');
    const decoded = `2.053|||section4|${buildingEntries}|section6`;
    const result = await extractBuildingCounts(decoded, 'v2052');
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });
});

describe('parseSaveGame', () => {
  it('should throw SaveGameParseError for empty string', async () => {
    await expect(parseSaveGame('')).rejects.toThrow(SaveGameParseError);
  });

  it('should throw SaveGameDecodeError for invalid base64', async () => {
    await expect(parseSaveGame('invalid!!!END!')).rejects.toThrow(SaveGameDecodeError);
  });
});

describe('Error Classes', () => {
  it('SaveGameParseError should have correct properties', () => {
    const error = new SaveGameParseError('Test', 'test', 'step');
    expect(error.name).toBe('SaveGameParseError');
    expect(error.parseStep).toBe('step');
  });

  it('SaveGameDecodeError should have correct properties', () => {
    const error = new SaveGameDecodeError('Test', 'test', 'base64');
    expect(error.name).toBe('SaveGameDecodeError');
    expect(error.decodeType).toBe('base64');
  });
});
