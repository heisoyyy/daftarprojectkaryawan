// src/utils/workdays.js

// Hitung jumlah hari kerja (exclude Sabtu/Minggu)
export function calculateWorkdays(start, end) {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate) || isNaN(endDate) || startDate > endDate) return 0;

  let count = 0;
  const iter = new Date(startDate);

  while (iter <= endDate) {
    const day = iter.getDay(); // 0 = Minggu, 6 = Sabtu
    if (day !== 0 && day !== 6) count++;
    iter.setDate(iter.getDate() + 1);
  }
  return count;
}

// Hitung end date dari start + durasi hari kerja
export function calculateEndDate(start, duration) {
  if (!start || !duration || duration < 1) return "";
  const startDate = new Date(start);
  if (isNaN(startDate)) return "";

  let added = 1;
  let current = new Date(startDate);

  // Kalau start bukan hari kerja → hitung mulai hari kerja berikutnya
  if (current.getDay() === 0 || current.getDay() === 6) {
    added = 0;
  }

  while (added < duration) {
    current.setDate(current.getDate() + 1);
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      added++;
    }
  }
  return current.toISOString().split("T")[0];
}
