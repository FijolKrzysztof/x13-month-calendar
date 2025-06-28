import { Injectable, signal, effect } from '@angular/core';
import { CalendarEvent } from '../models/event.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class EventService {
  private events = signal<Record<string, CalendarEvent[]>>({});
  private readonly STORAGE_KEY = 'events';

  constructor(private storageService: StorageService) {
    this.loadEventsFromStorage();
    this.setupAutoSave();
  }

  getEvents() {
    return this.events;
  }

  addEvent(dateKey: string, event: Omit<CalendarEvent, 'id'>) {
    const currentEvents = this.events();
    const dayEvents = currentEvents[dateKey] || [];

    this.events.update(events => ({
      ...events,
      [dateKey]: [...dayEvents, { ...event, id: Date.now() }]
    }));
  }

  updateEvent(dateKey: string, eventId: number, updatedEvent: Omit<CalendarEvent, 'id'>) {
    this.events.update(events => ({
      ...events,
      [dateKey]: events[dateKey].map(event =>
        event.id === eventId ? { ...updatedEvent, id: eventId } : event
      )
    }));
  }

  removeEvent(dateKey: string, eventId: number) {
    this.events.update(events => ({
      ...events,
      [dateKey]: events[dateKey].filter(event => event.id !== eventId)
    }));
  }

  getEventsForDate(dateKey: string): CalendarEvent[] {
    return this.events()[dateKey] || [];
  }

  // Clear all events
  clearAllEvents(): void {
    this.events.set({});
  }

  // Export events for backup
  exportEvents(): Record<string, CalendarEvent[]> {
    return this.events();
  }

  // Import events from backup
  importEvents(eventsData: Record<string, CalendarEvent[]>): void {
    this.events.set(eventsData);
  }

  // Get events count for analytics
  getEventsCount(): { total: number; dates: number } {
    const allEvents = this.events();
    const total = Object.values(allEvents).reduce((sum, dayEvents) => sum + dayEvents.length, 0);
    const dates = Object.keys(allEvents).length;
    return { total, dates };
  }

  private loadEventsFromStorage(): void {
    try {
      const savedEvents = this.storageService.getItem<Record<string, CalendarEvent[]>>(
        this.STORAGE_KEY,
        {}
      );

      if (savedEvents && Object.keys(savedEvents).length > 0) {
        this.events.set(savedEvents);
        console.log('📅 Events loaded from storage:', Object.keys(savedEvents).length, 'dates');
      }
    } catch (error) {
      console.error('❌ Error loading events from storage:', error);
    }
  }

  private setupAutoSave(): void {
    // Auto-save events whenever they change
    effect(() => {
      const currentEvents = this.events();
      try {
        this.storageService.setItem(this.STORAGE_KEY, currentEvents);
      } catch (error) {
        console.error('❌ Error saving events to storage:', error);
      }
    });
  }
}
