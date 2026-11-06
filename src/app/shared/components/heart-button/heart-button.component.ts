import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-heart-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './heart-button.component.html',
  styleUrl: './heart-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeartButtonComponent {
  readonly label = input('Ver a galeria');
  readonly pressed = output<void>();
}
