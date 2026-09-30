import { InjectionToken, Provider, Signal } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

/** hu-form-field'ın, içindeki kontrole sunduğu arayüz. */
export interface HuFormFieldParent {
  readonly describedBy: Signal<string | null>;
  readonly showError: Signal<boolean>;
}

export const HU_FORM_FIELD = new InjectionToken<HuFormFieldParent>('HU_FORM_FIELD');

/**
 * hu-form-field içine yerleştirilebilen her kontrolün uyguladığı sözleşme
 * (huInput, hu-date-picker, ...). Kendi kontrolünüzü yazarken
 * `providers: [{ provide: HuFormFieldControl, useExisting: MyControl }]` verin.
 */
export abstract class HuFormFieldControl {
  /** Label'ın `for` özniteliği bu id'ye bağlanır. */
  abstract readonly id: Signal<string>;
  /** Bir Angular form kontrolüne bağlı mı? */
  abstract readonly hasControl: boolean;
  /** Kontrol geçersiz ve kullanıcı etkileşime girmiş. */
  abstract readonly controlErrorVisible: Signal<boolean>;
  abstract readonly errors: Signal<ValidationErrors | null>;
}

/** Validator hata anahtarı → kullanıcıya gösterilecek mesaj. */
export type HuErrorMessages = Record<string, string | ((error: any) => string)>;

export const HU_DEFAULT_ERROR_MESSAGES: HuErrorMessages = {
  required: 'Bu alan zorunludur.',
  requiredTrue: 'Devam etmek için onaylamanız gerekir.',
  email: 'Geçerli bir e-posta adresi giriniz.',
  minlength: (e: { requiredLength: number }) => `En az ${e.requiredLength} karakter olmalıdır.`,
  maxlength: (e: { requiredLength: number }) => `En fazla ${e.requiredLength} karakter olabilir.`,
  min: (e: { min: number }) => `Değer en az ${e.min} olmalıdır.`,
  max: (e: { max: number }) => `Değer en fazla ${e.max} olabilir.`,
  pattern: 'Geçersiz format.',
  huDateParse: 'Geçerli bir tarih giriniz (gg.aa.yyyy).',
  huDateMin: (e: { min: string }) => `Tarih ${e.min} veya sonrası olmalıdır.`,
  huDateMax: (e: { max: string }) => `Tarih ${e.max} veya öncesi olmalıdır.`,
  huDateUnavailable: 'Bu tarih seçilemez.',
};

export const HU_ERROR_MESSAGES = new InjectionToken<HuErrorMessages>('HU_ERROR_MESSAGES', {
  providedIn: 'root',
  factory: () => HU_DEFAULT_ERROR_MESSAGES,
});

/**
 * Varsayılan validasyon mesajlarını genişletir / değiştirir.
 * @example provideHuErrorMessages({ tckn: 'Geçerli bir T.C. kimlik numarası giriniz.' })
 */
export function provideHuErrorMessages(messages: HuErrorMessages): Provider {
  return { provide: HU_ERROR_MESSAGES, useValue: { ...HU_DEFAULT_ERROR_MESSAGES, ...messages } };
}
