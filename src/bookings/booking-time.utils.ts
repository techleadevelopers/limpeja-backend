// src/bookings/booking-time.utils.ts

/**
 * Calcula a data/hora exata em São Paulo considerando fuso horário e horário de verão.
 * Aceita scheduledTime como string (HH:mm) ou Date.
 */
export function calculateScheduledAtInSaoPaulo(
  dateValue: string | number | Date,
  timeHHmm?: string | Date | null, // Tipagem atualizada para aceitar Date
): Date {
  const d = new Date(dateValue);
  let finalTimeStr = '00:00';

  // Lógica para normalizar o tempo para o formato HH:mm
  if (timeHHmm instanceof Date) {
    // Extrai HH:mm do objeto Date (ISO string: 2023-10-27T14:30:00Z -> 14:30)
    finalTimeStr = timeHHmm.toISOString().split('T')[1].substring(0, 5);
  } else if (typeof timeHHmm === 'string') {
    // Se for uma string completa (ISO), extrai a parte do tempo
    if (timeHHmm.includes('T')) {
      finalTimeStr = timeHHmm.split('T')[1].substring(0, 5);
    } else {
      finalTimeStr = timeHHmm;
    }
  }

  const [hhRaw, mmRaw] = finalTimeStr
    .split(':')
    .map((n) => parseInt(n, 10));

  const hh = Number.isFinite(hhRaw) ? hhRaw : 0;
  const mm = Number.isFinite(mmRaw) ? mmRaw : 0;

  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  const tz = 'America/Sao_Paulo';

  const t = Date.UTC(y, m, day, hh, mm, 0, 0);
  let guess = new Date(t);

  // Ajuste iterativo de fuso horário
  for (let i = 0; i < 2; i++) {
    const off = tzOffsetMinutes(guess, tz);
    const corrected = Date.UTC(y, m, day, hh, mm, 0, 0) - off * 60000;
    guess = new Date(corrected);
  }

  return guess;
}

function tzOffsetMinutes(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== 'literal') map[p.type] = p.value;

  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );

  return (asUtc - date.getTime()) / 60000;
}

export interface BookingScheduleInfo {
  scheduledDate: Date | string;
  scheduledTime?: string | Date | null;
  scheduledStart?: Date | string | null;
  startedAt?: Date | string | null;
  durationMinutes?: number | null;
}

export function calculateExpectedEnd(info: BookingScheduleInfo): Date {
  const base =
    info.startedAt instanceof Date
      ? info.startedAt
      : typeof info.startedAt === 'string'
        ? new Date(info.startedAt)
        : info.scheduledStart instanceof Date
          ? info.scheduledStart
          : typeof info.scheduledStart === 'string'
            ? new Date(info.scheduledStart)
            : calculateScheduledAtInSaoPaulo(info.scheduledDate, info.scheduledTime);

  const durationMinutes = Number.isFinite(info.durationMinutes ?? NaN)
    ? info.durationMinutes!
    : 60;

  return new Date(base.getTime() + durationMinutes * 60 * 1000);
}

export function formatScheduledTime(value?: string | Date | null): string {
  if (!value) return '00:00';
  if (value instanceof Date) {
    // Retorna HH:mm
    return value.toISOString().slice(11, 16);
  }
  if (typeof value === 'string') {
    if (value.includes('T')) {
      const [, timePart] = value.split('T');
      return timePart.slice(0, 5);
    }
    return value;
  }
  return '00:00';
}

export function scheduledTimeToMinutes(value?: string | Date | null): number {
  const hhmm = formatScheduledTime(value);
  const [hh, mm] = hhmm.split(':').map((n) => parseInt(n, 10) || 0);
  return hh * 60 + mm;
}