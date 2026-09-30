import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HuAlert, HuButton, HuCheckbox, HuFormField, HuIcon, HuInput, HuPrefix, HuSuffix, HuThemeToggle } from '@hu/ui';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, HuAlert, HuButton, HuCheckbox, HuFormField, HuIcon, HuInput, HuPrefix, HuSuffix, HuThemeToggle],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly failed = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });

  protected submit(): void {
    this.failed.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      if (this.form.value.password === 'hatali') {
        this.failed.set(true);
        return;
      }
      this.router.navigate(['/']);
    }, 800);
  }
}
