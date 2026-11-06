import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/services/auth.service';

export interface PasswordDialogData {
  title?: string;
}

@Component({
  selector: 'app-password-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './password-dialog.component.html',
  styleUrl: './password-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PasswordDialogComponent, boolean>);
  private readonly auth = inject(AuthService);
  readonly data = inject<PasswordDialogData>(MAT_DIALOG_DATA, { optional: true });

  readonly passwordControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  async submit(): Promise<void> {
    if (this.passwordControl.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.auth.login(this.passwordControl.value);
      this.dialogRef.close(true);
    } catch {
      this.errorMessage.set('Senha inválida');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
