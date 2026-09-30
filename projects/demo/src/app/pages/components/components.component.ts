import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  HuButtonColor,
  HuButtonGroup,
  HuButtonSize,
  HuButtonVariant,
  HuCalendar,
  HuCalendarMarker,
  HuDatePicker,
  HuDateRange,
  addDays,
  formatDate,
  formatRange,
  startOfDay,
  HuAlert,
  HuAvatar,
  HuBadge,
  HuBreadcrumb,
  HuButton,
  HuCard,
  HuCardActions,
  HuCheckbox,
  HuColumn,
  HuDialog,
  HuDialogFooter,
  HuFormField,
  HuIcon,
  HuInput,
  HuMenu,
  HuMenuItem,
  HuMenuTrigger,
  HuPaginator,
  HuPrefix,
  HuSpinner,
  HuSuffix,
  HuSwitch,
  HuTab,
  HuTable,
  HuTabs,
  HuToastService,
} from '@kadirucme/hu-ui';

interface Course {
  code: string;
  name: string;
  credit: number;
  quota: number;
}

@Component({
  selector: 'app-components',
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    HuButtonGroup,
    HuCalendar,
    HuDatePicker,
    HuAlert,
    HuAvatar,
    HuBadge,
    HuBreadcrumb,
    HuButton,
    HuCard,
    HuCardActions,
    HuCheckbox,
    HuDialog,
    HuDialogFooter,
    HuFormField,
    HuIcon,
    HuInput,
    HuMenu,
    HuMenuItem,
    HuMenuTrigger,
    HuPaginator,
    HuPrefix,
    HuSpinner,
    HuSuffix,
    HuSwitch,
    HuTab,
    HuTable,
    HuTabs,
  ],
  templateUrl: './components.component.html',
  styleUrl: './components.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentsComponent {
  protected readonly toast = inject(HuToastService);

  // --- Butonlar ---------------------------------------------------------------------
  protected readonly buttonVariants: HuButtonVariant[] = ['solid', 'soft', 'outline', 'ghost', 'link'];
  protected readonly buttonColors: { value: HuButtonColor; label: string }[] = [
    { value: 'primary', label: 'Birincil' },
    { value: 'neutral', label: 'Nötr' },
    { value: 'success', label: 'Başarılı' },
    { value: 'warning', label: 'Uyarı' },
    { value: 'danger', label: 'Tehlikeli' },
    { value: 'info', label: 'Bilgi' },
  ];
  protected readonly buttonSizes: HuButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  protected readonly viewOptions = [
    { value: 'list', label: 'Liste', icon: 'menu' },
    { value: 'grid', label: 'Kart', icon: 'grid' },
    { value: 'calendar', label: 'Takvim', icon: 'calendar' },
  ];
  protected readonly viewMode = signal('list');
  protected readonly formatOptions = [
    { value: 'bold', label: 'Kalın', short: 'K' },
    { value: 'italic', label: 'İtalik', short: 'İ' },
    { value: 'underline', label: 'Altı çizili', short: 'A' },
  ];
  protected readonly formats = signal<ReadonlySet<string>>(new Set(['bold']));
  protected readonly formatList = computed(() => [...this.formats()].join(', ') || '—');

  // --- Kısmen seçili ("Tümünü seç") örneği -------------------------------------------
  protected readonly permissions = [
    { key: 'read', label: 'Kayıtları görüntüleme' },
    { key: 'create', label: 'Kayıt oluşturma' },
    { key: 'update', label: 'Kayıt düzenleme' },
    { key: 'delete', label: 'Kayıt silme' },
  ];
  protected readonly selectedPermissions = signal<ReadonlySet<string>>(new Set(['read', 'update']));
  protected readonly allPermissions = computed(() => this.selectedPermissions().size === this.permissions.length);
  protected readonly somePermissions = computed(() => this.selectedPermissions().size > 0 && !this.allPermissions());

  protected setAllPermissions(checked: boolean): void {
    this.selectedPermissions.set(new Set(checked ? this.permissions.map((p) => p.key) : []));
  }

  protected togglePermission(key: string, checked: boolean): void {
    this.selectedPermissions.update((set) => {
      const next = new Set(set);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  protected toggleFormat(value: string): void {
    this.formats.update((set) => {
      const next = new Set(set);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  // --- Takvim & tarih seçici ----------------------------------------------------------
  protected readonly today = startOfDay(new Date());
  protected readonly maxDate = addDays(this.today, 90);
  protected readonly weekdaysOnly = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6;
  protected readonly calendarDate = signal<Date | null>(null);
  protected readonly demoMarkers: HuCalendarMarker[] = [
    { date: addDays(this.today, 2), label: 'Ara sınav', variant: 'warning' },
    { date: addDays(this.today, 2), label: 'Kulüp toplantısı', variant: 'success' },
    { date: addDays(this.today, 8), label: 'Burs son gün', variant: 'primary' },
    { date: addDays(this.today, 14), label: 'Resmî tatil', variant: 'danger' },
  ];

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly dateForm = this.fb.group({
    applyDate: this.fb.control<Date | null>(null, Validators.required),
    leave: this.fb.control<HuDateRange | null>(null),
    locked: this.fb.control<Date | null>({ value: this.today, disabled: true }),
  });
  private readonly dateFormStatus = toSignal(this.dateForm.valueChanges, { initialValue: this.dateForm.value });
  /** Formun anlık değeri: tarihlerin forma nasıl yazıldığını gösterir. */
  protected readonly dateFormValue = computed(() => {
    const v = this.dateFormStatus();
    return [
      `applyDate: ${v.applyDate ? formatDate(v.applyDate) : 'null'}`,
      `leave:     ${v.leave ? formatRange(v.leave) : 'null'}`,
      `geçerli:   ${this.dateForm.valid ? 'evet' : 'hayır'}`,
    ].join('\n');
  });

  protected readonly loading = signal(false);
  protected readonly dialogOpen = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly accepted = signal(true);
  protected readonly notify = signal(true);
  protected readonly page = signal(3);
  protected readonly tableLoading = signal(false);

  protected readonly courses: Course[] = [
    { code: 'BBM 101', name: 'Programlamaya Giriş I', credit: 4, quota: 120 },
    { code: 'BBM 203', name: 'Veri Yapıları', credit: 3, quota: 90 },
    { code: 'MAT 123', name: 'Analiz I', credit: 4, quota: 150 },
    { code: 'FİZ 137', name: 'Fizik I', credit: 4, quota: 140 },
    { code: 'İST 292', name: 'Olasılık ve İstatistik', credit: 3, quota: 80 },
  ];
  protected readonly courseColumns: HuColumn<Course>[] = [
    { key: 'code', header: 'Kod', sortable: true, width: '110px' },
    { key: 'name', header: 'Ders adı', sortable: true },
    { key: 'credit', header: 'Kredi', sortable: true, align: 'end' },
    { key: 'quota', header: 'Kontenjan', sortable: true, align: 'end' },
  ];

  protected simulateLoading(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1500);
  }

  protected reloadTable(): void {
    this.tableLoading.set(true);
    setTimeout(() => this.tableLoading.set(false), 1200);
  }
}
