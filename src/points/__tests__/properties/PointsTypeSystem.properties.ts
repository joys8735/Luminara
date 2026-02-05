/**
 * Property-Based Tests for PointsTypeSystem
 * Validates: Requirements 1.1, 1.3, 1.4, 1.5
 * 
 * Property 1: Point Type Validation
 * Property 2: Point Type Metadata Completeness
 */

import fc from 'fast-check';
import { PointsTypeSystem } from '../../services/PointsTypeSystem';
import { PointsType } from '../../types';

describe('PointsTypeSystem - Property-Based Tests', () => {
  let system: PointsTypeSystem;

  beforeEach(() => {
    system = new PointsTypeSystem();
  });

  /**
   * Property 1: Point Type Validation
   * For any point type string, the system should only accept exactly three types:
   * 'alpha', 'rewards', 'balance'. Invalid types should be rejected.
   * 
   * Validates: Requirements 1.1, 1.5
   */
  describe('Property 1: Point Type Validation', () => {
    it('should only accept exactly three valid types', () => {
      fc.assert(
        fc.property(fc.string(), (typeStr: string) => {
          const isValid = system.isValidType(typeStr);
          const validTypes = ['alpha', 'rewards', 'balance'];
          
          // If valid, must be one of the three types
          if (isValid) {
            expect(validTypes).toContain(typeStr);
          }
          
          // If it's one of the three types, must be valid
          if (validTypes.includes(typeStr)) {
            expect(isValid).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should reject all invalid type strings', () => {
      fc.assert(
        fc.property(
          fc.string().filter((s) => !['alpha', 'rewards', 'balance'].includes(s)),
          (invalidType: string) => {
            expect(system.isValidType(invalidType)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be consistent: isValidType and getMetadata agreement', () => {
      fc.assert(
        fc.property(fc.string(), (typeStr: string) => {
          const isValid = system.isValidType(typeStr);
          let canGetMetadata = true;
          try {
            system.getMetadata(typeStr as PointsType);
          } catch {
            canGetMetadata = false;
          }
          
          // If isValidType returns true, getMetadata should work
          if (isValid) {
            expect(canGetMetadata).toBe(true);
          }
          
          // If getMetadata works, isValidType should return true
          if (canGetMetadata) {
            expect(isValid).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: Point Type Metadata Completeness
   * For any valid point type, retrieving its metadata should return all required fields:
   * name, description, icon, color.
   * 
   * Validates: Requirements 1.3, 1.4
   */
  describe('Property 2: Point Type Metadata Completeness', () => {
    it('should return all required fields for valid types', () => {
      const validTypes: PointsType[] = ['alpha', 'rewards', 'balance'];
      
      fc.assert(
        fc.property(fc.sampled.uniformIntegerDistribution(0, 2), (index: number) => {
          const type = validTypes[index];
          const metadata = system.getMetadata(type);
          
          // All required fields must exist
          expect(metadata).toHaveProperty('type');
          expect(metadata).toHaveProperty('name');
          expect(metadata).toHaveProperty('description');
          expect(metadata).toHaveProperty('icon');
          expect(metadata).toHaveProperty('color');
          
          // All fields must be non-empty strings
          expect(typeof metadata.type).toBe('string');
          expect(typeof metadata.name).toBe('string');
          expect(typeof metadata.description).toBe('string');
          expect(typeof metadata.icon).toBe('string');
          expect(typeof metadata.color).toBe('string');
          
          expect(metadata.type.length).toBeGreaterThan(0);
          expect(metadata.name.length).toBeGreaterThan(0);
          expect(metadata.description.length).toBeGreaterThan(0);
          expect(metadata.icon.length).toBeGreaterThan(0);
          expect(metadata.color.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should return consistent metadata for the same type', () => {
      const validTypes: PointsType[] = ['alpha', 'rewards', 'balance'];
      
      fc.assert(
        fc.property(fc.sampled.uniformIntegerDistribution(0, 2), (index: number) => {
          const type = validTypes[index];
          const meta1 = system.getMetadata(type);
          const meta2 = system.getMetadata(type);
          
          // Metadata should be equal
          expect(meta1).toEqual(meta2);
          
          // But not the same reference (should be copies)
          expect(meta1).not.toBe(meta2);
        }),
        { numRuns: 100 }
      );
    });

    it('should have unique metadata for each type', () => {
      const types: PointsType[] = ['alpha', 'rewards', 'balance'];
      const metadataList = types.map((t) => system.getMetadata(t));
      
      // Each type should have different metadata
      for (let i = 0; i < metadataList.length; i++) {
        for (let j = i + 1; j < metadataList.length; j++) {
          expect(metadataList[i]).not.toEqual(metadataList[j]);
        }
      }
    });

    it('should have valid color format for all types', () => {
      const validTypes: PointsType[] = ['alpha', 'rewards', 'balance'];
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      
      validTypes.forEach((type) => {
        const metadata = system.getMetadata(type);
        expect(metadata.color).toMatch(hexColorRegex);
      });
    });

    it('should have non-empty icon for all types', () => {
      const validTypes: PointsType[] = ['alpha', 'rewards', 'balance'];
      
      validTypes.forEach((type) => {
        const metadata = system.getMetadata(type);
        expect(metadata.icon).toBeTruthy();
        expect(metadata.icon.length).toBeGreaterThan(0);
      });
    });
  });

  /**
   * Property 3: getAllTypes returns complete and consistent data
   */
  describe('Property 3: getAllTypes Consistency', () => {
    it('should always return exactly three types', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const types = system.getAllTypes();
          expect(types).toHaveLength(3);
        }),
        { numRuns: 100 }
      );
    });

    it('should return all valid types', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const types = system.getAllTypes();
          const typeNames = types.map((t) => t.type);
          
          expect(typeNames).toContain('alpha');
          expect(typeNames).toContain('rewards');
          expect(typeNames).toContain('balance');
        }),
        { numRuns: 100 }
      );
    });

    it('should return consistent results across calls', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const types1 = system.getAllTypes();
          const types2 = system.getAllTypes();
          
          expect(types1).toEqual(types2);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4: Type validation is consistent with getAllTypes
   */
  describe('Property 4: Validation Consistency', () => {
    it('should validate all types returned by getAllTypes', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const types = system.getAllTypes();
          
          types.forEach((meta) => {
            expect(system.isValidType(meta.type)).toBe(true);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should retrieve metadata for all types returned by getValidTypes', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const validTypes = system.getValidTypes();
          
          validTypes.forEach((type) => {
            expect(() => system.getMetadata(type)).not.toThrow();
          });
        }),
        { numRuns: 100 }
      );
    });
  });
});
