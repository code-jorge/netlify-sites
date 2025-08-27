import React, { useState } from 'react';
import { useMembers } from '../hooks/useMembers';
import { formatDate, isDateInRange } from '../utils/date';
import { generateExportFilename, downloadJsonData } from '../utils/data';
import DatePicker from '../components/DatePicker';
import { Download, Calendar, Database } from 'lucide-react';
import { useAvailableDates } from '../hooks/useDates';

const DataExport: React.FC = () => {

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState<Date | null>(thirtyDaysAgo);
  const [endDate, setEndDate] = useState<Date | null>(today);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());


    const { data: memberDetails = [], isLoading, error } = useMembers();
    const { data: availableDates = [] } = useAvailableDates();

  const handleDateSelect = (date: Date, isStart: boolean) => {
    if (isStart) {
      if (!endDate || isDateInRange(date, endDate)) {
        setStartDate(date);
        if (endDate && date > endDate) {
          setEndDate(null);
        }
      }
      setShowStartPicker(false);
    } else {
      if (!startDate || isDateInRange(date, startDate)) {
        setEndDate(date);
        if (startDate && date < startDate) {
          setStartDate(null);
        }
      }
      setShowEndPicker(false);
    }
  };

  const handleDownload = () => {
    if (!memberDetails) return;

    const filename = generateExportFilename(startDate, endDate, 'member-data');
    downloadJsonData(memberDetails, filename);
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        Error loading member data. Please try again.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Database className="w-7 h-7 mr-3 text-green-600" />
              Data Export
            </h2>
            <p className="text-gray-600 mt-1">
              Export your member data in JSON format for external analysis
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => {
                  setShowStartPicker(!showStartPicker);
                  setShowEndPicker(false);
                }}
                className="flex items-center px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium">Start: {formatDate(startDate)}</span>
              </button>
              <DatePicker
                isVisible={showStartPicker}
                onClose={() => setShowStartPicker(false)}
                onSelect={(date) => handleDateSelect(date, true)}
                selectedDate={startDate}
                otherDate={endDate}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                availableDates={availableDates}
                isDateInRange={isDateInRange}
                maxDate={endDate}
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => {
                  setShowEndPicker(!showEndPicker);
                  setShowStartPicker(false);
                }}
                className="flex items-center px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium">End: {formatDate(endDate)}</span>
              </button>
              <DatePicker
                isVisible={showEndPicker}
                onClose={() => setShowEndPicker(false)}
                onSelect={(date) => handleDateSelect(date, false)}
                selectedDate={endDate}
                otherDate={startDate}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                availableDates={availableDates}
                isDateInRange={isDateInRange}
                minDate={startDate}
                
              />
            </div>
          </div>
        </div>
      </div>

      {!startDate || !endDate ? (
        <div className="p-6 text-center">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Please select both start and end dates to enable data export.</p>
        </div>
      ) : (
        <div className="p-12 flex items-center justify-center">
          <button
            onClick={handleDownload}
            disabled={!startDate || !endDate}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Download className="w-5 h-5 mr-2" />
            Download JSON
          </button>
        </div>
      )}
    </div>
  );
};

export default DataExport;