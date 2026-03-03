/** Shared date/time and slot helpers for appointments */

/** YYYY-MM-DD for today */
export function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Parse "9:00 AM" / "1:30 PM" to 24h "09:00" / "13:30" */
export function parseTimeTo24(timeStr: string): string {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '09:00';
  let hour = Number(match[1]);
  const min = match[2];
  const pm = match[3].toUpperCase() === 'PM';
  if (pm && hour !== 12) hour += 12;
  if (!pm && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${min}`;
}

/** Add 1 hour to "HH:MM" */
export function addOneHour(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const next = (h + 1) % 24;
  return `${String(next).padStart(2, '0')}:${String(m ?? 0).padStart(2, '0')}`;
}

/** "HH:MM" to decimal hours for comparison */
export function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) + (m ?? 0) / 60;
}

/** Format "09:00"-"10:00" as "9:00 am - 10:00 am" */
export function formatTimeRange(start: string, end: string): string {
  const fmt = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const am = (h ?? 0) < 12;
    const h12 = (h ?? 0) % 12 || 12;
    return `${h12}:${String(m ?? 0).padStart(2, '0')} ${am ? 'am' : 'pm'}`;
  };
  return `${fmt(start)} - ${fmt(end)}`;
}

/** Format "09:00"-"10:00" with AM/PM (for modals) */
export function formatTimeRangeLong(start: string, end: string): string {
  const fmt = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const am = (h ?? 0) < 12;
    const h12 = (h ?? 0) % 12 || 12;
    return `${h12}:${String(m ?? 0).padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
  };
  return `${fmt(start)} - ${fmt(end)}`;
}

/** Format YYYY-MM-DD for display (e.g. "Mar 2, 2026") */
export function formatDateDisplay(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Stable key for dentist+slot (for Set/Map) */
export function slotKey(dentistId: number, slotIndex: number): string {
  return `${dentistId}-${slotIndex}`;
}
