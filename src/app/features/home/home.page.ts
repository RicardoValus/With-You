import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { interval, map, startWith } from 'rxjs';
import { ContentService } from '../../core/services/content.service';
import { calculateTogetherDuration } from '../../core/utils/together-duration';
import { CounterGridComponent } from '../../shared/components/counter-grid/counter-grid.component';
import { HeartButtonComponent } from '../../shared/components/heart-button/heart-button.component';
import { MusicPlayerComponent } from '../../shared/components/music-player/music-player.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    MatProgressSpinnerModule,
    MatIconModule,
    CounterGridComponent,
    HeartButtonComponent,
    MusicPlayerComponent,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly content = this.contentService.content;
  readonly loading = this.contentService.loading;
  readonly apiWarning = this.contentService.error;
  readonly now = signal(new Date());
  readonly isDesktop = signal(false);

  readonly counter = computed(() => {
    const content = this.content();
    if (!content) {
      return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return calculateTogetherDuration(new Date(content.startDate), this.now());
  });

  readonly coverUrl = computed(() => {
    const content = this.content();
    return content ? this.contentService.coverUrl(content) : null;
  });

  readonly coverBackground = computed(() => {
    const url = this.coverUrl();
    return url ? `url('${url}')` : 'none';
  });

  ngOnInit(): void {
    void this.contentService.load();

    interval(1000)
      .pipe(
        startWith(0),
        map(() => new Date()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((date) => this.now.set(date));

    this.breakpoint
      .observe('(min-width: 768px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => this.isDesktop.set(state.matches));
  }

  openGallery(): void {
    void this.router.navigateByUrl('/gallery');
  }
}
