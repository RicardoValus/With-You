import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Content, ContentUpdate } from '../models/content.model';
import { AuthService } from './auth.service';
import { fileToBase64 } from '../utils/file-to-base64';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly contentSignal = signal<Content | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly content = this.contentSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  async load(): Promise<Content> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const content = await firstValueFrom(
        this.http.get<Content>(`${environment.apiBaseUrl}/content`),
      );
      this.contentSignal.set(content);
      return content;
    } catch {
      const fallback = await firstValueFrom(
        this.http.get<Content>('/assets/content.json'),
      );
      this.contentSignal.set(fallback);
      if (environment.production) {
        this.errorSignal.set('API indisponível — usando conteúdo local');
      }
      return fallback;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async update(patch: ContentUpdate): Promise<Content> {
    const content = await firstValueFrom(
      this.http.put<Content>(`${environment.apiBaseUrl}/content`, patch, {
        headers: this.auth.authHeaders(),
      }),
    );
    this.contentSignal.set(content);
    return content;
  }

  async uploadMusic(file: File): Promise<Content> {
    const dataBase64 = await fileToBase64(file);
    const content = await firstValueFrom(
      this.http.post<Content>(
        `${environment.apiBaseUrl}/content`,
        {
          fileName: file.name,
          mimeType: file.type || 'audio/mpeg',
          dataBase64,
        },
        { headers: this.auth.authHeaders() },
      ),
    );
    this.contentSignal.set(content);
    return content;
  }

  coverUrl(content: Content): string | null {
    if (!content.coverImageId) {
      return content.gallery[0]?.url ?? null;
    }
    return content.gallery.find((image) => image.id === content.coverImageId)?.url
      ?? content.gallery[0]?.url
      ?? null;
  }

  setLocalContent(content: Content): void {
    this.contentSignal.set(content);
  }
}
