import { Injectable, signal } from '@angular/core';
import { HuStatusVariant } from '../alert/alert.component';

export interface HuToastOptions {
  message: string;
  title?: string;
  variant?: HuStatusVariant;
  /** Milisaniye. 0 verilirse kullanıcı kapatana kadar kalır. */
  duration?: number;
}

export interface HuToast extends Required<Omit<HuToastOptions, 'title'>> {
  id: number;
  title?: string;
}

/**
 * Geçici bildirimler. Uygulamada bir kez `<hu-toaster />` yerleştirilmelidir.
 * @example inject(HuToastService).success('Kayıt güncellendi.');
 */
@Injectable({ providedIn: 'root' })
export class HuToastService {
  private nextId = 1;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly _toasts = signal<HuToast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(options: HuToastOptions): number {
    const toast: HuToast = { id: this.nextId++, variant: 'info', duration: 5000, ...options };
    this._toasts.update((list) => [...list, toast].slice(-5));
    if (toast.duration > 0) {
      this.timers.set(toast.id, setTimeout(() => this.dismiss(toast.id), toast.duration));
    }
    return toast.id;
  }

  info(message: string, title?: string): number {
    return this.show({ message, title, variant: 'info' });
  }
  success(message: string, title?: string): number {
    return this.show({ message, title, variant: 'success' });
  }
  warning(message: string, title?: string): number {
    return this.show({ message, title, variant: 'warning' });
  }
  error(message: string, title?: string): number {
    return this.show({ message, title, variant: 'danger', duration: 8000 });
  }

  dismiss(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clear(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
    this._toasts.set([]);
  }
}
