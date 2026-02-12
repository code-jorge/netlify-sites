import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { generateCalendarDays } from '../utils/date';

interface DatePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  selectedDate: Date | null;
  otherDate: Date | null;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  availableDates: Date[];
  isDateInRange: (date: Date, otherDate: Date | null) => boolean;
  minDate?: Date | null;
  maxDate?: Date | null;
}

const DatePicker: React.FC<DatePickerProps> = ({
  isVisible,
  onClose,
  onSelect,
  selectedDate,
  otherDate,
  currentMonth,
  setCurrentMonth,
  availableDates,
  isDateInRange,
  minDate = null,
  maxDate = null
}) => {
  if (!isVisible) return null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const calendarDays = generateCalendarDays(currentMonth, availableDates, selectedDate);

  return (
    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-6 z-20 min-w-80">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(new Date(year, month - 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-semibold text-lg">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(year, month + 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="w-10 h-10 text-sm font-medium text-gray-500 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((dayData) => {
          if (dayData.type === 'empty') {
            return <div key={dayData.key} className="w-10 h-10"></div>;
          }

          const isInValidRange = otherDate ? isDateInRange(dayData.date, otherDate) : true;
          const isWithinBounds = (!minDate || dayData.date >= minDate) && (!maxDate || dayData.date <= maxDate);
          const isDisabled = !isInValidRange || !isWithinBounds;

          return (
            <button
              key={dayData.key}
              onClick={() => !isDisabled && onSelect(dayData.date)}
              disabled={isDisabled}
              className={`relative w-10 h-10 text-sm rounded-full transition-colors font-medium ${
                dayData.isSelected
                  ? 'bg-blue-600 text-white'
                  : isDisabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-blue-100'
              }`}
            >
              {dayData.day}
              {dayData.isAvailable && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="w-full px-4 py-3 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DatePicker;