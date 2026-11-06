import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface CounterValues {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CounterCell {
  value: number;
  label: string;
}

@Component({
  selector: 'app-counter-grid',
  standalone: true,
  templateUrl: './counter-grid.component.html',
  styleUrl: './counter-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterGridComponent {
  readonly values = input.required<CounterValues>();

  cells(): CounterCell[] {
    const v = this.values();
    return [
      { value: v.years, label: 'anos' },
      { value: v.months, label: 'meses' },
      { value: v.days, label: 'dias' },
      { value: v.hours, label: 'horas' },
      { value: v.minutes, label: 'min' },
      { value: v.seconds, label: 'seg' },
    ];
  }
}
