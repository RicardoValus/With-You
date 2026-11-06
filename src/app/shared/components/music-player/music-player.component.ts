import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MusicContent } from '../../../core/models/content.model';

@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatSliderModule],
  templateUrl: './music-player.component.html',
  styleUrl: './music-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicPlayerComponent implements OnDestroy {
  private readonly destroyRef = inject(DestroyRef);

  readonly music = input.required<MusicContent>();
  readonly audioRef = viewChild<ElementRef<HTMLAudioElement>>('audio');

  readonly isPlaying = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);

  constructor() {
    effect(() => {
      this.music();
      this.isPlaying.set(false);
      this.currentTime.set(0);
      this.duration.set(0);
      queueMicrotask(() => {
        const audio = this.audioRef()?.nativeElement;
        if (audio) {
          audio.load();
        }
      });
    });

    this.destroyRef.onDestroy(() => this.pauseAudio());
  }

  ngOnDestroy(): void {
    this.pauseAudio();
  }

  togglePlay(): void {
    const audio = this.audioRef()?.nativeElement;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      void audio.play().then(() => this.isPlaying.set(true));
    } else {
      audio.pause();
      this.isPlaying.set(false);
    }
  }

  onTimeUpdate(): void {
    const audio = this.audioRef()?.nativeElement;
    if (!audio) {
      return;
    }
    this.currentTime.set(audio.currentTime);
  }

  onLoadedMetadata(): void {
    const audio = this.audioRef()?.nativeElement;
    if (!audio) {
      return;
    }
    this.duration.set(Number.isFinite(audio.duration) ? audio.duration : 0);
  }

  onEnded(): void {
    this.isPlaying.set(false);
    this.currentTime.set(0);
  }

  seek(value: number): void {
    const audio = this.audioRef()?.nativeElement;
    if (!audio) {
      return;
    }
    audio.currentTime = value;
    this.currentTime.set(value);
  }

  formatTime(totalSeconds: number): string {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
      return '0:00';
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  private pauseAudio(): void {
    const audio = this.audioRef()?.nativeElement;
    if (audio && !audio.paused) {
      audio.pause();
    }
  }
}
