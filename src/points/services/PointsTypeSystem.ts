/**
 * Points Type System Service
 * Manages point types and their metadata
 * 
 * Validates: Requirements 1.1, 1.3, 1.4, 1.5
 */

import { PointsType, PointsTypeMetadata } from '../types';
import { POINTS_TYPE_METADATA, VALIDATION } from '../constants';

export class PointsTypeSystem {
  private metadata: Record<string, PointsTypeMetadata>;

  constructor() {
    this.metadata = { ...POINTS_TYPE_METADATA };
  }

  /**
   * Get metadata for a specific points type
   * Requirement 1.3, 1.4: Returns all required fields (name, description, icon, color)
   */
  getMetadata(type: PointsType): PointsTypeMetadata {
    const meta = this.metadata[type];
    if (!meta) {
      throw new Error(`Invalid points type: ${type}`);
    }
    return { ...meta };
  }

  /**
   * Check if a type string is valid
   * Requirement 1.1, 1.5: Only accepts exactly three types: alpha, rewards, balance
   */
  isValidType(type: string): boolean {
    return VALIDATION.VALID_POINTS_TYPES.includes(type as PointsType);
  }

  /**
   * Get all available point types and their metadata
   * Requirement 1.3: Returns metadata for all types
   */
  getAllTypes(): PointsTypeMetadata[] {
    return Object.values(this.metadata).map((meta) => ({ ...meta }));
  }

  /**
   * Get all valid type strings
   */
  getValidTypes(): PointsType[] {
    return [...VALIDATION.VALID_POINTS_TYPES];
  }

  /**
   * Validate a points type
   * Returns validation result with error message if invalid
   */
  validateType(type: string): { valid: boolean; error?: string } {
    if (!this.isValidType(type)) {
      return {
        valid: false,
        error: `Invalid points type: ${type}. Valid types are: ${this.getValidTypes().join(', ')}`,
      };
    }
    return { valid: true };
  }

  /**
   * Get type by name (case-insensitive)
   */
  getTypeByName(name: string): PointsType | null {
    const normalized = name.toLowerCase();
    for (const [key, meta] of Object.entries(this.metadata)) {
      if (meta.name.toLowerCase() === normalized) {
        return key as PointsType;
      }
    }
    return null;
  }

  /**
   * Get type icon
   */
  getIcon(type: PointsType): string {
    return this.getMetadata(type).icon;
  }

  /**
   * Get type color
   */
  getColor(type: PointsType): string {
    return this.getMetadata(type).color;
  }

  /**
   * Get type name
   */
  getName(type: PointsType): string {
    return this.getMetadata(type).name;
  }

  /**
   * Get type description
   */
  getDescription(type: PointsType): string {
    return this.getMetadata(type).description;
  }

  /**
   * Add custom metadata (for extensions)
   */
  addMetadata(type: PointsType, metadata: PointsTypeMetadata): void {
    if (!this.isValidType(type)) {
      throw new Error(`Cannot add metadata for invalid type: ${type}`);
    }
    this.metadata[type] = { ...metadata };
  }

  /**
   * Reset to default metadata
   */
  resetToDefaults(): void {
    this.metadata = { ...POINTS_TYPE_METADATA };
  }
}

// Export singleton instance
export const pointsTypeSystem = new PointsTypeSystem();
