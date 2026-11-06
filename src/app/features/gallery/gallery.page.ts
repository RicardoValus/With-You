import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContentService } from '../../core/services/content.service';
import { GalleryImage } from '../../core/models/content.model';
import { LightboxDialogComponent } from './lightbox-dialog.component';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './gallery.page.html',
  styleUrl: './gallery.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryPage implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly dialog = inject(MatDialog);

  readonly content = this.contentService.content;
  readonly loading = this.contentService.loading;

  ngOnInit(): void {
    if (!this.content()) {
      void this.contentService.load();
    }
  }

  openLightbox(image: GalleryImage): void {
    this.dialog.open(LightboxDialogComponent, {
      data: { image },
      maxWidth: '100vw',
      maxHeight: '100vh',
      width: '100vw',
      height: '100vh',
      panelClass: 'lightbox-panel',
    });
  }
}
