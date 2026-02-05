/**
 * Unit Tests for PointsTypeSystem
 * Tests point type validation and metadata management
 */

import { PointsTypeSystem } from '../../services/PointsTypeSystem';
import { PointsType } from '../../types';

describe('PointsTypeSystem', () => {
  let system: PointsTypeSystem;

  beforeEach(() => {
    system = new PointsTypeSystem();
  });

  describe('isValidType', () => {
    it('should accept valid types: alpha, rewards, balance', () => {
      expect(system.isValidType('alpha')).toBe(true);
      expect(system.isValidType('rewards')).toBe(true);
      expect(system.isValidType('balance')).toBe(true);
    });

    it('should reject invalid types', () => {
      expect(system.isValidType('invalid')).toBe(false);
      expect(system.isValidType('points')).toBe(false);
      expect(system.isValidType('crypto')).toBe(false);
      expect(system.isValidType('')).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(system.isValidType('Alpha')).toBe(false);
      expect(system.isValidType('ALPHA')).toBe(false);
      expect(system.isValidType('Rewards')).toBe(false);
    });
  });

  describe('getMetadata', () => {
    it('should return complete metadata for alpha type', () => {
      const meta = system.getMetadata('alpha');
      expect(meta).toHaveProperty('type', 'alpha');
      expect(meta).toHaveProperty('name');
      expect(meta).toHaveProperty('description');
      expect(meta).toHaveProperty('icon');
      expect(meta).toHaveProperty('color');
    });

    it('should return complete metadata for rewards type', () => {
      const meta = system.getMetadata('rewards');
      expect(meta).toHaveProperty('type', 'rewards');
      expect(meta).toHaveProperty('name');
      expect(meta).toHaveProperty('description');
      expect(meta).toHaveProperty('icon');
      expect(meta).toHaveProperty('color');
    });

    it('should return complete metadata for balance type', () => {
      const meta = system.getMetadata('balance');
      expect(meta).toHaveProperty('type', 'balance');
      expect(meta).toHaveProperty('name');
      expect(meta).toHaveProperty('description');
      expect(meta).toHaveProperty('icon');
      expect(meta).toHaveProperty('color');
    });

    it('should throw error for invalid type', () => {
      expect(() => system.getMetadata('invalid' as PointsType)).toThrow();
    });

    it('should return a copy of metadata (not reference)', () => {
      const meta1 = system.getMetadata('alpha');
      const meta2 = system.getMetadata('alpha');
      expect(meta1).toEqual(meta2);
      expect(meta1).not.toBe(meta2);
    });
  });

  describe('getAllTypes', () => {
    it('should return exactly three types', () => {
      const types = system.getAllTypes();
      expect(types).toHaveLength(3);
    });

    it('should return all required types', () => {
      const types = system.getAllTypes();
      const typeNames = types.map((t) => t.type);
      expect(typeNames).toContain('alpha');
      expect(typeNames).toContain('rewards');
      expect(typeNames).toContain('balance');
    });

    it('should return complete metadata for each type', () => {
      const types = system.getAllTypes();
      types.forEach((meta) => {
        expect(meta).toHaveProperty('type');
        expect(meta).toHaveProperty('name');
        expect(meta).toHaveProperty('description');
        expect(meta).toHaveProperty('icon');
        expect(meta).toHaveProperty('color');
      });
    });

    it('should return copies, not references', () => {
      const types1 = system.getAllTypes();
      const types2 = system.getAllTypes();
      expect(types1).toEqual(types2);
      expect(types1).not.toBe(types2);
    });
  });

  describe('getValidTypes', () => {
    it('should return exactly three valid types', () => {
      const types = system.getValidTypes();
      expect(types).toHaveLength(3);
    });

    it('should return alpha, rewards, balance', () => {
      const types = system.getValidTypes();
      expect(types).toContain('alpha');
      expect(types).toContain('rewards');
      expect(types).toContain('balance');
    });
  });

  describe('validateType', () => {
    it('should validate correct types', () => {
      expect(system.validateType('alpha')).toEqual({ valid: true });
      expect(system.validateType('rewards')).toEqual({ valid: true });
      expect(system.validateType('balance')).toEqual({ valid: true });
    });

    it('should reject invalid types with error message', () => {
      const result = system.validateType('invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid points type');
    });
  });

  describe('getIcon', () => {
    it('should return icon for each type', () => {
      expect(system.getIcon('alpha')).toBeDefined();
      expect(system.getIcon('rewards')).toBeDefined();
      expect(system.getIcon('balance')).toBeDefined();
    });

    it('should return non-empty string', () => {
      expect(system.getIcon('alpha')).toBeTruthy();
      expect(system.getIcon('rewards')).toBeTruthy();
      expect(system.getIcon('balance')).toBeTruthy();
    });
  });

  describe('getColor', () => {
    it('should return color for each type', () => {
      expect(system.getColor('alpha')).toBeDefined();
      expect(system.getColor('rewards')).toBeDefined();
      expect(system.getColor('balance')).toBeDefined();
    });

    it('should return valid hex color', () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      expect(system.getColor('alpha')).toMatch(hexColorRegex);
      expect(system.getColor('rewards')).toMatch(hexColorRegex);
      expect(system.getColor('balance')).toMatch(hexColorRegex);
    });
  });

  describe('getName', () => {
    it('should return name for each type', () => {
      expect(system.getName('alpha')).toBeDefined();
      expect(system.getName('rewards')).toBeDefined();
      expect(system.getName('balance')).toBeDefined();
    });

    it('should return non-empty string', () => {
      expect(system.getName('alpha')).toBeTruthy();
      expect(system.getName('rewards')).toBeTruthy();
      expect(system.getName('balance')).toBeTruthy();
    });
  });

  describe('getDescription', () => {
    it('should return description for each type', () => {
      expect(system.getDescription('alpha')).toBeDefined();
      expect(system.getDescription('rewards')).toBeDefined();
      expect(system.getDescription('balance')).toBeDefined();
    });

    it('should return non-empty string', () => {
      expect(system.getDescription('alpha')).toBeTruthy();
      expect(system.getDescription('rewards')).toBeTruthy();
      expect(system.getDescription('balance')).toBeTruthy();
    });
  });

  describe('getTypeByName', () => {
    it('should find type by name', () => {
      expect(system.getTypeByName('Alpha Points')).toBe('alpha');
      expect(system.getTypeByName('Reward Points')).toBe('rewards');
      expect(system.getTypeByName('Platform Balance')).toBe('balance');
    });

    it('should be case-insensitive', () => {
      expect(system.getTypeByName('alpha points')).toBe('alpha');
      expect(system.getTypeByName('ALPHA POINTS')).toBe('alpha');
      expect(system.getTypeByName('AlPhA PoInTs')).toBe('alpha');
    });

    it('should return null for unknown name', () => {
      expect(system.getTypeByName('unknown')).toBeNull();
      expect(system.getTypeByName('points')).toBeNull();
    });
  });

  describe('addMetadata', () => {
    it('should allow adding custom metadata for valid types', () => {
      const customMeta = {
        type: 'alpha' as PointsType,
        name: 'Custom Alpha',
        description: 'Custom description',
        icon: '🔧',
        color: '#FF0000',
      };
      system.addMetadata('alpha', customMeta);
      expect(system.getName('alpha')).toBe('Custom Alpha');
    });

    it('should throw error for invalid type', () => {
      const customMeta = {
        type: 'invalid' as PointsType,
        name: 'Invalid',
        description: 'Invalid',
        icon: '❌',
        color: '#000000',
      };
      expect(() => system.addMetadata('invalid' as PointsType, customMeta)).toThrow();
    });
  });

  describe('resetToDefaults', () => {
    it('should restore default metadata after modification', () => {
      const originalName = system.getName('alpha');
      system.addMetadata('alpha', {
        type: 'alpha',
        name: 'Modified',
        description: 'Modified',
        icon: '🔧',
        color: '#FF0000',
      });
      expect(system.getName('alpha')).toBe('Modified');
      system.resetToDefaults();
      expect(system.getName('alpha')).toBe(originalName);
    });
  });

  describe('Metadata Completeness', () => {
    it('should have all required fields for each type', () => {
      const types = system.getAllTypes();
      types.forEach((meta) => {
        expect(meta.type).toBeDefined();
        expect(meta.name).toBeDefined();
        expect(meta.description).toBeDefined();
        expect(meta.icon).toBeDefined();
        expect(meta.color).toBeDefined();
        expect(typeof meta.type).toBe('string');
        expect(typeof meta.name).toBe('string');
        expect(typeof meta.description).toBe('string');
        expect(typeof meta.icon).toBe('string');
        expect(typeof meta.color).toBe('string');
      });
    });

    it('should have non-empty values for all fields', () => {
      const types = system.getAllTypes();
      types.forEach((meta) => {
        expect(meta.type.length).toBeGreaterThan(0);
        expect(meta.name.length).toBeGreaterThan(0);
        expect(meta.description.length).toBeGreaterThan(0);
        expect(meta.icon.length).toBeGreaterThan(0);
        expect(meta.color.length).toBeGreaterThan(0);
      });
    });
  });
});
