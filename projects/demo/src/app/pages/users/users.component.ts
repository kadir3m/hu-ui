import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import {
  HuAvatar,
  HuBadge,
  HuBadgeVariant,
  HuButton,
  HuCard,
  HuCellDef,
  HuColumn,
  HuDialog,
  HuDialogFooter,
  HuFormField,
  HuIcon,
  HuInput,
  HuDropdown,
  HuDropdownItem,
  HuDropdownTrigger,
  HuPaginator,
  HuPrefix,
  HuDatePicker,
  HuDatePickerValue,
  HuDateRange,
  HuSort,
  HuTable,
  compareDays,
  HuToastService,
} from '@ucme-ui/angular';
import { DEPARTMENTS, ROLES, STATUS_LABELS, User, UserStatus, createUsers } from '../../data/users';

/** Demo: yalnızca kurum alan adındaki adresler kabul edilir. */
const CORPORATE_DOMAIN = '@example.com';

function corporateMailValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value ?? '';
  return !value || value.endsWith(CORPORATE_DOMAIN) ? null : { corporateMail: true };
}

const collator = new Intl.Collator('tr-TR', { numeric: true });

@Component({
  selector: 'app-users',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    HuAvatar,
    HuBadge,
    HuButton,
    HuCard,
    HuCellDef,
    HuDialog,
    HuDialogFooter,
    HuFormField,
    HuIcon,
    HuInput,
    HuDropdown,
    HuDropdownItem,
    HuDropdownTrigger,
    HuPaginator,
    HuPrefix,
    HuTable,
    HuDatePicker,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  private readonly toast = inject(HuToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly roles = ROLES;
  protected readonly departments = DEPARTMENTS;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly statusVariants: Record<UserStatus, HuBadgeVariant> = {
    aktif: 'success',
    pasif: 'neutral',
    beklemede: 'warning',
  };

  protected readonly columns: HuColumn<User>[] = [
    { key: 'name', header: 'Ad Soyad', sortable: true },
    { key: 'role', header: 'Rol', sortable: true, hideOnMobile: true },
    { key: 'department', header: 'Birim', sortable: true, hideOnMobile: true },
    { key: 'status', header: 'Durum', sortable: true },
    { key: 'createdAt', header: 'Kayıt tarihi', sortable: true, hideOnMobile: true },
    { key: 'actions', header: '', align: 'end', width: '56px' },
  ];

  protected readonly trackById = (user: User) => user.id;

  // --- Liste durumu ------------------------------------------------------------
  protected readonly users = signal<User[]>(createUsers());
  protected readonly search = signal('');
  protected readonly roleFilter = signal('');
  protected readonly statusFilter = signal('');
  protected readonly createdRange = signal<HuDateRange | null>(null);
  protected readonly sort = signal<HuSort>({ key: 'createdAt', direction: 'desc' });
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLocaleLowerCase('tr-TR');
    const role = this.roleFilter();
    const status = this.statusFilter();
    const range = this.createdRange();
    return this.users().filter(
      (u) =>
        (!q || u.name.toLocaleLowerCase('tr-TR').includes(q) || u.email.includes(q)) &&
        (!role || u.role === role) &&
        (!status || u.status === status) &&
        (!range?.start || compareDays(u.createdAt, range.start) >= 0) &&
        (!range?.end || compareDays(u.createdAt, range.end) <= 0),
    );
  });

  // Sayfalama sıralamadan sonra yapılmalı; bu yüzden tablo "server" modunda,
  // sıralamayı burada yapıyoruz. Gerçek API'de bu kısım backend'e gider.
  protected readonly sorted = computed(() => {
    const { key, direction } = this.sort();
    const list = this.filtered();
    if (!key || !direction) return list;
    const factor = direction === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = a[key as keyof User];
      const bv = b[key as keyof User];
      const result = av instanceof Date && bv instanceof Date ? av.getTime() - bv.getTime() : collator.compare(String(av), String(bv));
      return result * factor;
    });
  });

  protected readonly page = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.sorted().slice(start, start + this.pageSize());
  });

  protected readonly hasFilters = computed(
    () => !!(this.search() || this.roleFilter() || this.statusFilter() || this.createdRange()),
  );

  protected setCreatedRange(value: HuDatePickerValue): void {
    this.createdRange.set(value && !(value instanceof Date) ? value : null);
    this.pageIndex.set(0);
  }

  protected setFilter(target: 'search' | 'role' | 'status', event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    ({ search: this.search, role: this.roleFilter, status: this.statusFilter })[target].set(value);
    this.pageIndex.set(0);
  }

  protected clearFilters(): void {
    this.search.set('');
    this.roleFilter.set('');
    this.statusFilter.set('');
    this.createdRange.set(null);
    this.pageIndex.set(0);
  }

  // --- Ekle / düzenle ------------------------------------------------------------
  protected readonly formOpen = signal(false);
  protected readonly editing = signal<User | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email, corporateMailValidator]],
    role: this.fb.control<string>('', Validators.required),
    department: this.fb.control<string>('', Validators.required),
    status: this.fb.control<UserStatus>('aktif'),
  });

  protected openCreate(): void {
    this.editing.set(null);
    this.form.reset({ name: '', email: '', role: '', department: '', status: 'aktif' });
    this.formOpen.set(true);
  }

  protected openEdit(user: User): void {
    this.editing.set(user);
    this.form.reset({ name: user.name, email: user.email, role: user.role, department: user.department, status: user.status });
    this.formOpen.set(true);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue() as Omit<User, 'id' | 'createdAt'>;
    const editing = this.editing();

    // API çağrısını taklit et
    setTimeout(() => {
      if (editing) {
        this.users.update((list) => list.map((u) => (u.id === editing.id ? { ...u, ...value } : u)));
        this.toast.success(`${value.name} bilgileri güncellendi.`, 'Kaydedildi');
      } else {
        const id = Math.max(0, ...this.users().map((u) => u.id)) + 1;
        this.users.update((list) => [{ ...value, id, createdAt: new Date() }, ...list]);
        this.toast.success(`${value.name} sisteme eklendi.`, 'Kullanıcı oluşturuldu');
      }
      this.saving.set(false);
      this.formOpen.set(false);
    }, 600);
  }

  // --- Sil ------------------------------------------------------------------------
  protected readonly deleting = signal<User | null>(null);
  protected readonly deleteOpen = computed(() => this.deleting() !== null);

  protected confirmDelete(): void {
    const user = this.deleting();
    if (!user) return;
    this.users.update((list) => list.filter((u) => u.id !== user.id));
    this.deleting.set(null);
    this.toast.show({ variant: 'info', message: `${user.name} silindi.` });
  }

  protected toggleStatus(user: User): void {
    const status: UserStatus = user.status === 'aktif' ? 'pasif' : 'aktif';
    this.users.update((list) => list.map((u) => (u.id === user.id ? { ...u, status } : u)));
    this.toast.info(`${user.name} artık ${STATUS_LABELS[status].toLocaleLowerCase('tr-TR')}.`);
  }

  protected exportCsv(): void {
    this.toast.warning('Dışa aktarma bu demoda devre dışı.', 'Bilgi');
  }
}
