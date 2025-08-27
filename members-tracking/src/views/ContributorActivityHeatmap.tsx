import React, { useState } from 'react';
import { formatDate, parseDate, isDateInRange, formatDayShort, getCurrentDateRange } from '../utils/date';
import { processContributorHeatmapData } from '../utils/heatmap';
import { formatProvider, getPlatformColor } from '../utils/platform';
import PlatformIcon from '../components/PlatformIcon';
import DatePicker from '../components/DatePicker';
import { Activity, Calendar } from 'lucide-react';
import { useMembers } from '../hooks/useMembers';
import { useAvailableDates } from '../hooks/useDates';

const ContributorActivityHeatmap: React.FC = () => {

  const [start, end] = getCurrentDateRange();

  const [startDate, setStartDate] = useState<Date | null>(start);
  const [endDate, setEndDate] = useState<Date | null>(end);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: memberDetails = [], isLoading, error } = useMembers();
  const { data: availableDates = [] } = useAvailableDates();

  const committerInfo = memberDetails.map(({ date, data }) => ({
    date,
    committers: data.committers,
  }));

  const heatmapData = processContributorHeatmapData(committerInfo, startDate, endDate, parseDate);

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
        Error loading contributor data. Please try again.
      </div>
    );
  }

  const { days, items: committers, activity } = heatmapData;
  
  const dayWidth = 60;
  const contributorHeight = 60;
  const circleRadius = 8;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Activity className="w-7 h-7 mr-3 text-green-600" />
              Contributor Activity
            </h2>
            <p className="text-gray-600 mt-1">
              Visualize contributor activity patterns across different days
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
            
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                  setShowStartPicker(false);
                  setShowEndPicker(false);
                }}
                className="px-4 py-3 text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                Clear dates
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="relative h-full">
          <div className="overflow-auto" style={{ height: 'calc(100vh - 400px)', minHeight: '400px' }}>
            <div className="min-w-max">
              <div className="sticky top-0 bg-white z-10 border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center">
                  <div className="w-48 flex-shrink-0 sticky left-0 bg-white z-20"></div>
                  <div className="flex">
                    {days.map((day) => (
                      <div
                        key={day}
                        className="flex flex-col items-center justify-center"
                        style={{ width: dayWidth }}
                      >
                        <div className="text-xs font-medium text-gray-500 mb-1">
                          {formatDayShort(day)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {committers.map((committer) => (
                <div key={committer.id} className="flex items-center border-b border-gray-50 last:border-b-0">
                  <div className="w-48 flex-shrink-0 p-3 bg-gray-50 sticky left-0 z-10 border-r border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-gray-200">
                        <div style={{ color: getPlatformColor(committer.provider) }}>
                        <PlatformIcon platform={committer.provider} className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                        @{committer.provider_slug}
                      </p>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-600 capitalize truncate max-w-20">{formatProvider(committer.provider)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity dots and connecting lines */}
                <div className="relative" style={{ height: contributorHeight }}>
                  <svg
                    width={days.length * dayWidth}
                    height={contributorHeight}
                    className="absolute top-0 left-0"
                  >
                    {/* Connecting lines */}
                    {days.slice(0, -1).map((day, dayIndex) => {
                      const nextDay = days[dayIndex + 1];
                      
                      const currentDayContribs = activity[day] || [];
                      const nextDayContribs = activity[nextDay] || [];
                      const currentContributor = currentDayContribs.find(c => c.id === committer.id);
                      const nextContributor = nextDayContribs.find(c => c.id === committer.id);
                      
                      // Only draw lines if BOTH consecutive circles exist
                      if (!currentContributor || !nextContributor) return null;
                      
                      const x1 = dayIndex * dayWidth + dayWidth / 2 + circleRadius;
                      const x2 = (dayIndex + 1) * dayWidth + dayWidth / 2 - circleRadius;
                      const y = contributorHeight / 2;
                      
                      // Use platform color for the line
                      const lineColor = getPlatformColor(currentContributor.provider);
                      
                      return (
                        <line
                          key={`line-${dayIndex}`}
                          x1={x1}
                          y1={y}
                          x2={x2}
                          y2={y}
                          stroke={lineColor}
                          strokeWidth="2"
                        />
                      );
                    })}
                    
                    {/* Activity circles */}
                    {days.map((day, dayIndex) => {
                      // Get contributor data for this specific day
                      const dayContribs = activity[day] || [];
                      const dayContributor = dayContribs.find(c => c.id === committer.id);
                      
                      if (dayContributor) {
                        const cx = dayIndex * dayWidth + dayWidth / 2;
                        const cy = contributorHeight / 2;
                        const platformColor = getPlatformColor(dayContributor.provider);
                        
                        return (
                          <circle
                            key={`circle-${dayIndex}`}
                            cx={cx}
                            cy={cy}
                            r={circleRadius}
                            fill={platformColor}
                            stroke="white"
                            strokeWidth="2"
                            opacity={1}
                            className="transition-all duration-200 cursor-pointer drop-shadow-sm hover:opacity-80"
                            style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }}
                          >
                            <title>{`@${dayContributor.provider_slug} was active on ${day}`}</title>
                          </circle>
                        );
                      }
                      return null;
                    })}
                  </svg>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        {committers.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No contributor activity data available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContributorActivityHeatmap;