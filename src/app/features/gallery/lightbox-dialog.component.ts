import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GalleryImage } from '../../core/models/content.model';

export interface LightboxDialogData {
  image: GalleryImage;
}

@Component({
  selector: 'app-lightbox-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <button mat-icon-button type="button" class="close" mat-dialog-close aria-label="Fechar">
      <mat-icon>close</mat-icon>
    </button>
    <img [src]="data.image.url" alt="Foto da galeria" />
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      position: relative;
      width: 100vw;
      height: 100vh;
      background: rgba(10, 4, 20, 0.94);
    }

    img {
      max-width: min(96vw, 1100px);
      max-height: 92vh;
      object-fit: contain;
      border-radius: 0.75rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
    }

    .close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      color: #fff;
      z-index: 1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LightboxDialogComponent {
  readonly data = inject<LightboxDialogData>(MAT_DIALOG_DATA);
}
