import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { ContentService } from '../../core/services/content.service';
import { GalleryService } from '../../core/services/gallery.service';
import { GalleryImage } from '../../core/models/content.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './admin.page.html',
  styleUrl: './admin.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly contentService = inject(ContentService);
  private readonly galleryService = inject(GalleryService);
  private readonly snackBar = inject(MatSnackBar);

  readonly content = this.contentService.content;
  readonly authenticated = signal(this.auth.isAuthenticated());
  readonly busy = signal(false);
  readonly loginError = signal<string | null>(null);

  readonly loginControl = this.fb.nonNullable.control('', Validators.required);

  readonly contentForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    phrase: ['', Validators.required],
    startDate: ['', Validators.required],
  });

  ngOnInit(): void {
    void this.bootstrap();
  }

  async bootstrap(): Promise<void> {
    const content = this.content() ?? (await this.contentService.load());
    this.patchForm(content.title, content.phrase, content.startDate);
  }

  async login(): Promise<void> {
    if (this.loginControl.invalid || this.busy()) {
      return;
    }

    this.busy.set(true);
    this.loginError.set(null);

    try {
      await this.auth.login(this.loginControl.value);
      this.authenticated.set(true);
      this.snackBar.open('Login ok', 'Fechar', { duration: 2500 });
    } catch {
      this.loginError.set('Senha inválida');
    } finally {
      this.busy.set(false);
    }
  }

  logout(): void {
    this.auth.logout();
    this.authenticated.set(false);
  }

  async saveContent(): Promise<void> {
    if (this.contentForm.invalid || this.busy()) {
      return;
    }

    this.busy.set(true);
    try {
      const value = this.contentForm.getRawValue();
      const localDate = value.startDate;
      const startDate = localDate.length === 16 ? `${localDate}:00-03:00` : localDate;
      await this.contentService.update({
        title: value.title.trim(),
        phrase: value.phrase.trim(),
        startDate,
      });
      this.snackBar.open('Conteúdo salvo', 'Fechar', { duration: 2500 });
    } catch {
      this.snackBar.open('Falha ao salvar. Verifique o login e a API.', 'Fechar', {
        duration: 3500,
      });
    } finally {
      this.busy.set(false);
    }
  }

  async onPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    this.busy.set(true);
    try {
      await this.galleryService.upload(file);
      this.snackBar.open('Foto enviada', 'Fechar', { duration: 2500 });
    } catch {
      this.snackBar.open('Falha no upload da foto', 'Fechar', { duration: 3500 });
    } finally {
      this.busy.set(false);
    }
  }

  async removePhoto(image: GalleryImage): Promise<void> {
    this.busy.set(true);
    try {
      await this.galleryService.remove(image.id);
      this.snackBar.open('Foto removida', 'Fechar', { duration: 2500 });
    } catch {
      this.snackBar.open('Falha ao remover foto', 'Fechar', { duration: 3500 });
    } finally {
      this.busy.set(false);
    }
  }

  async setCover(image: GalleryImage): Promise<void> {
    this.busy.set(true);
    try {
      await this.contentService.update({ coverImageId: image.id });
      this.snackBar.open('Capa atualizada', 'Fechar', { duration: 2500 });
    } catch {
      this.snackBar.open('Falha ao definir capa', 'Fechar', { duration: 3500 });
    } finally {
      this.busy.set(false);
    }
  }

  async onMusicSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    this.busy.set(true);
    try {
      await this.contentService.uploadMusic(file);
      this.snackBar.open('Música atualizada', 'Fechar', { duration: 2500 });
    } catch {
      this.snackBar.open('Falha no upload da música', 'Fechar', { duration: 3500 });
    } finally {
      this.busy.set(false);
    }
  }

  async clearMusic(): Promise<void> {
    this.busy.set(true);
    try {
      await this.contentService.update({ music: null });
      this.snackBar.open('Música removida', 'Fechar', { duration: 2500 });
    } catch {
      this.snackBar.open('Falha ao remover música', 'Fechar', { duration: 3500 });
    } finally {
      this.busy.set(false);
    }
  }

  toDatetimeLocal(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private patchForm(title: string, phrase: string, startDate: string): void {
    this.contentForm.patchValue({
      title,
      phrase,
      startDate: this.toDatetimeLocal(startDate),
    });
  }
}
