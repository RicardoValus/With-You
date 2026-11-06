import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addYears,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  differenceInYears,
} from 'date-fns';
import { CounterValues } from '../../shared/components/counter-grid/counter-grid.component';

export function calculateTogetherDuration(startDate: Date, now: Date = new Date()): CounterValues {
  if (now.getTime() < startDate.getTime()) {
    return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const years = differenceInYears(now, startDate);
  const afterYears = addYears(startDate, years);
  const months = differenceInMonths(now, afterYears);
  const afterMonths = addMonths(afterYears, months);
  const days = differenceInDays(now, afterMonths);
  const afterDays = addDays(afterMonths, days);
  const hours = differenceInHours(now, afterDays);
  const afterHours = addHours(afterDays, hours);
  const minutes = differenceInMinutes(now, afterHours);
  const afterMinutes = addMinutes(afterHours, minutes);
  const seconds = differenceInSeconds(now, afterMinutes);

  return { years, months, days, hours, minutes, seconds };
}
