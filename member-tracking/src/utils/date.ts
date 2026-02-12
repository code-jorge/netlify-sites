type CalendarDay = {
  type: 'empty'; 
  key: string; 
} | {
  type: 'day'; 
  key: string | number; 
  day: number; 
  date: Date; 
  dateStr: string; 
  isAvailable: boolean; 
  isSelected: boolean 
}

export const getCurrentDateRange = (): [Date, Date] => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 30);
  return [start, end];
}

export const formatDate = (date: Date | null): string => {
  if (!date) return 'Select date';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDayShort = (dateStr: string): string => {
  const [, month, day] = dateStr.split('-');
  return `${day}/${month}`;
};

export const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

export const isSameDay = (dateA: Date, dateB: Date): boolean => {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

export const isDateInRange = (date: Date, otherDate: Date | null): boolean => {
  if (!otherDate) return true;
  const diffTime = Math.abs(date.getTime() - otherDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 35;
};

export const getLatestDay = (data: Date[]): Date | null => {
  if (data.length === 0) return null;
  const sortedDays = data.sort((a, b) => b.getTime() - a.getTime());
  return sortedDays[0];
};


export const formatISODate = (isoString: string): string => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const generateCalendarDays = (
  currentMonth: Date, 
  availableDates: Date[], 
  selectedDate: Date | null
): CalendarDay[] => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: CalendarDay[] = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({ type: 'empty', key: `empty-${i}` });
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    const isAvailable = availableDates.some(d => 
      d.getDate() === date.getDate() && 
      d.getMonth() === date.getMonth() && 
      d.getFullYear() === date.getFullYear()
    );
    const isSelected = selectedDate && 
      date.getDate() === selectedDate.getDate() && 
      date.getMonth() === selectedDate.getMonth() && 
      date.getFullYear() === selectedDate.getFullYear();

    days.push({
      type: 'day',
      key: day,
      day,
      date,
      dateStr,
      isAvailable,
      isSelected: isSelected ?? false
    });
  }

  return days;
};