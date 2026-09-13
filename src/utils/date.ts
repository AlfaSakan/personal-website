const SECONDS = 1000;
const MINUTES = SECONDS * 60;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24;
const MONTHS = DAYS * 30;

export function experienceDuration(later: Date, earlier: Date) {
  const ltr = later.getTime();
  const elr = earlier.getTime();
  const delta = ltr - elr;

  const months = Math.floor(delta / MONTHS);
  const year = Math.floor(months / 12);
  const moduleMonths = months % 12;

  if (year > 0) {
    if (moduleMonths === 0) return `${year} yr`;

    return `${year} yr, ${moduleMonths} mos`;
  }

  return `${months} mos`;
}
