import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type HuThemeMode = 'light' | 'dark' | 'system';
export type HuResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'hu-theme';

/**
 * Açık / koyu / sistem temasını yönetir. Seçim localStorage'da saklanır ve
 * `<html data-theme="...">` özniteliği üzerinden token'lara yansır.
 */
@Injectable({ providedIn: 'root' })
export class HuThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly win = this.doc.defaultView;
  private readonly media = this.win?.matchMedia?.('(prefers-color-scheme: dark)');
  private readonly systemDark = signal(this.media?.matches ?? false);

  readonly mode = signal<HuThemeMode>(this.readStoredMode());
  readonly resolved = computed<HuResolvedTheme>(() => {
    const mode = this.mode();
    if (mode === 'system') return this.systemDark() ? 'dark' : 'light';
    return mode;
  });

  constructor() {
    this.media?.addEventListener('change', (e) => this.systemDark.set(e.matches));

    effect(() => {
      this.doc.documentElement.setAttribute('data-theme', this.resolved());
      try {
        this.win?.localStorage.setItem(STORAGE_KEY, this.mode());
      } catch {
        // Depolama kapalı olabilir (gizli pencere vb.)
      }
    });
  }

  setMode(mode: HuThemeMode): void {
    this.mode.set(mode);
  }

  toggle(): void {
    this.mode.set(this.resolved() === 'dark' ? 'light' : 'dark');
  }

  private readStoredMode(): HuThemeMode {
    try {
      const value = this.win?.localStorage.getItem(STORAGE_KEY);
      if (value === 'light' || value === 'dark' || value === 'system') return value;
    } catch {
      // yok say
    }
    return 'system';
  }
}
