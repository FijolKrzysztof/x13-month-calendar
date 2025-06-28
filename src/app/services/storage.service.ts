import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly STORAGE_PREFIX = 'calendar_13m_';
  private readonly COOKIE_EXPIRY_DAYS = 365; // 1 year

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Save data to cookies
  setItem(key: string, value: any): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const serializedValue = JSON.stringify(value);
      const fullKey = this.STORAGE_PREFIX + key;

      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + this.COOKIE_EXPIRY_DAYS);

      // Set cookie with secure options
      document.cookie = `${fullKey}=${encodeURIComponent(serializedValue)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;

      console.log(`📝 Saved to cookies: ${key}`);
    } catch (error) {
      console.error('❌ Error saving to cookies:', error);
      // Fallback to localStorage if available
      this.setItemFallback(key, value);
    }
  }

  // Get data from cookies
  getItem<T>(key: string, defaultValue: T): T {
    if (!isPlatformBrowser(this.platformId)) return defaultValue;

    try {
      const fullKey = this.STORAGE_PREFIX + key;
      const cookies = document.cookie.split(';');

      for (let cookie of cookies) {
        const [cookieKey, cookieValue] = cookie.trim().split('=');
        if (cookieKey === fullKey) {
          const decodedValue = decodeURIComponent(cookieValue);
          const parsedValue = JSON.parse(decodedValue);
          console.log(`📖 Loaded from cookies: ${key}`);
          return parsedValue;
        }
      }

      // Try fallback storage
      return this.getItemFallback(key, defaultValue);
    } catch (error) {
      console.error('❌ Error reading from cookies:', error);
      return this.getItemFallback(key, defaultValue);
    }
  }

  // Remove item from cookies
  removeItem(key: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const fullKey = this.STORAGE_PREFIX + key;
      document.cookie = `${fullKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      console.log(`🗑️ Removed from cookies: ${key}`);
    } catch (error) {
      console.error('❌ Error removing from cookies:', error);
    }

    // Also remove from fallback storage
    this.removeItemFallback(key);
  }

  // Clear all calendar data
  clearAll(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const cookies = document.cookie.split(';');

      for (let cookie of cookies) {
        const cookieKey = cookie.trim().split('=')[0];
        if (cookieKey.startsWith(this.STORAGE_PREFIX)) {
          document.cookie = `${cookieKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      }

      console.log('🧹 Cleared all calendar data from cookies');
    } catch (error) {
      console.error('❌ Error clearing cookies:', error);
    }

    // Also clear fallback storage
    this.clearAllFallback();
  }

  // Check if storage is available
  isStorageAvailable(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    try {
      // Test if we can write cookies
      const testKey = this.STORAGE_PREFIX + 'test';
      document.cookie = `${testKey}=test; path=/`;
      const canWrite = document.cookie.includes(testKey);

      // Clean up test cookie
      if (canWrite) {
        document.cookie = `${testKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }

      return canWrite;
    } catch {
      return false;
    }
  }

  // Get storage info for debugging
  getStorageInfo(): { type: string; size: number; items: string[] } {
    if (!isPlatformBrowser(this.platformId)) {
      return { type: 'none', size: 0, items: [] };
    }

    try {
      const cookies = document.cookie.split(';');
      const calendarCookies = cookies
        .filter(cookie => cookie.trim().split('=')[0].startsWith(this.STORAGE_PREFIX))
        .map(cookie => cookie.trim().split('=')[0].replace(this.STORAGE_PREFIX, ''));

      const totalSize = document.cookie.length;

      return {
        type: 'cookies',
        size: totalSize,
        items: calendarCookies
      };
    } catch {
      return this.getStorageInfoFallback();
    }
  }

  // Export all data (for backup)
  exportData(): any {
    if (!isPlatformBrowser(this.platformId)) return {};

    const data: any = {};
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      const [cookieKey, cookieValue] = cookie.trim().split('=');
      if (cookieKey && cookieKey.startsWith(this.STORAGE_PREFIX)) {
        const key = cookieKey.replace(this.STORAGE_PREFIX, '');
        try {
          data[key] = JSON.parse(decodeURIComponent(cookieValue));
        } catch {
          data[key] = cookieValue;
        }
      }
    }

    return data;
  }

  // Import data (for restore)
  importData(data: any): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      for (const [key, value] of Object.entries(data)) {
        this.setItem(key, value);
      }
      console.log('📥 Data imported successfully');
    } catch (error) {
      console.error('❌ Error importing data:', error);
    }
  }

  // Fallback to localStorage if cookies fail
  private setItemFallback(key: string, value: any): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(value));
        console.log(`📝 Saved to localStorage (fallback): ${key}`);
      } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
      }
    }
  }

  private getItemFallback<T>(key: string, defaultValue: T): T {
    if (typeof localStorage !== 'undefined') {
      try {
        const item = localStorage.getItem(this.STORAGE_PREFIX + key);
        if (item) {
          console.log(`📖 Loaded from localStorage (fallback): ${key}`);
          return JSON.parse(item);
        }
      } catch (error) {
        console.error('❌ Error reading from localStorage:', error);
      }
    }
    return defaultValue;
  }

  private removeItemFallback(key: string): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(this.STORAGE_PREFIX + key);
      } catch (error) {
        console.error('❌ Error removing from localStorage:', error);
      }
    }
  }

  private clearAllFallback(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const keys = Object.keys(localStorage).filter(key =>
          key.startsWith(this.STORAGE_PREFIX)
        );
        keys.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.error('❌ Error clearing localStorage:', error);
      }
    }
  }

  private getStorageInfoFallback(): { type: string; size: number; items: string[] } {
    if (typeof localStorage !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
          .filter(key => key.startsWith(this.STORAGE_PREFIX))
          .map(key => key.replace(this.STORAGE_PREFIX, ''));

        const size = keys.reduce((total, key) => {
          const value = localStorage.getItem(this.STORAGE_PREFIX + key);
          return total + (value ? value.length : 0);
        }, 0);

        return { type: 'localStorage', size, items: keys };
      } catch {
        return { type: 'none', size: 0, items: [] };
      }
    }
    return { type: 'none', size: 0, items: [] };
  }
}
