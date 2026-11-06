import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Content } from '../models/content.model';
import { AuthService } from './auth.service';
import { ContentService } from './content.service';
import { fileToBase64 } from '../utils/file-to-base64';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly contentService = inject(ContentService);

  async upload(file: File): Promise<Content> {
    const dataBase64 = await fileToBase64(file);
    const content = await firstValueFrom(
      this.http.post<Content>(
        `${environment.apiBaseUrl}/gallery`,
        {
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
          dataBase64,
        },
        { headers: this.auth.authHeaders() },
      ),
    );
    this.contentService.setLocalContent(content);
    return content;
  }

  async remove(id: string): Promise<Content> {
    const content = await firstValueFrom(
      this.http.request<Content>('DELETE', `${environment.apiBaseUrl}/gallery`, {
        body: { id },
        headers: this.auth.authHeaders(),
      }),
    );
    this.contentService.setLocalContent(content);
    return content;
  }
}
