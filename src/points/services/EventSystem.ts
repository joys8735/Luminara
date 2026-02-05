/**
 * Event System Service
 * Manages real-time event emission and subscription
 * 
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */

import { EventType, PointsEvent } from '../types';

type EventCallback = (event: any) => void;

export class EventSystem {
  private listeners: Map<EventType, Set<EventCallback>> = new Map();
  private onceListeners: Map<EventType, Set<EventCallback>> = new Map();

  /**
   * Subscribe to event
   * Requirement 10.5: Support subscribing to specific event types
   */
  on(eventType: EventType, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.off(eventType, callback);
    };
  }

  /**
   * Unsubscribe from event
   */
  off(eventType: EventType, callback: EventCallback): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Subscribe to event once
   */
  once(eventType: EventType, callback: EventCallback): () => void {
    if (!this.onceListeners.has(eventType)) {
      this.onceListeners.set(eventType, new Set());
    }

    const wrappedCallback = (event: any) => {
      callback(event);
      this.offOnce(eventType, wrappedCallback);
    };

    this.onceListeners.get(eventType)!.add(wrappedCallback);

    // Return unsubscribe function
    return () => {
      this.offOnce(eventType, wrappedCallback);
    };
  }

  /**
   * Unsubscribe from once listener
   */
  private offOnce(eventType: EventType, callback: EventCallback): void {
    const callbacks = this.onceListeners.get(eventType);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Emit event
   * Requirement 10.1, 10.2, 10.3: Emit events with transaction details
   */
  emit(event: PointsEvent): void {
    const eventType = event.type as EventType;

    // Call regular listeners
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }

    // Call once listeners
    const onceCallbacks = this.onceListeners.get(eventType);
    if (onceCallbacks) {
      onceCallbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in once listener for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Get listener count for event type
   */
  getListenerCount(eventType: EventType): number {
    const regularCount = this.listeners.get(eventType)?.size || 0;
    const onceCount = this.onceListeners.get(eventType)?.size || 0;
    return regularCount + onceCount;
  }

  /**
   * Get all event types with listeners
   */
  getEventTypes(): EventType[] {
    const types = new Set<EventType>();
    this.listeners.forEach((_, type) => types.add(type));
    this.onceListeners.forEach((_, type) => types.add(type));
    return Array.from(types);
  }

  /**
   * Remove all listeners for event type
   */
  removeAllListeners(eventType?: EventType): void {
    if (eventType) {
      this.listeners.delete(eventType);
      this.onceListeners.delete(eventType);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  /**
   * Check if has listeners
   */
  hasListeners(eventType: EventType): boolean {
    return (this.listeners.get(eventType)?.size || 0) > 0 || (this.onceListeners.get(eventType)?.size || 0) > 0;
  }
}

// Export singleton instance
export const eventSystem = new EventSystem();
