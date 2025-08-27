import React, { useState } from 'react';
import { useMembers } from '../hooks/useMembers';
import { getMemberDisplayName, getMemberDisplayNameWithFallback } from '../utils/member';
import { getRoleColor, getRoleDisplayName } from '../utils/role';
import { formatDate, parseDate, isDateInRange, formatDayShort, getCurrentDateRange } from '../utils/date';
import { processMemberHeatmapData } from '../utils/heatmap';
import MemberAvatar from '../components/MemberAvatar';
import DatePicker from '../components/DatePicker';
import { Activity, Calendar } from 'lucide-react';
import { useAvailableDates } from '../hooks/useDates';

const ActivityHeatmap: React.FC = () => {

  const [start, end] = getCurrentDateRange();
  
  const [startDate, setStartDate] = useState<Date | null>(start);
  const [endDate, setEndDate] = useState<Date | null>(end);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: memberDetails = [], isLoading, error } = useMembers();
  const { data: availableDates = [] } = useAvailableDates();

  const memberInfo = memberDetails.map(({ date, data }) => ({
    date,
    members: data.members,
  }));

  const heatmapData = processMemberHeatmapData(memberInfo, startDate, endDate, parseDate);

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
        Error loading member data. Please try again.
      </div>
    );
  }

  const { days, items: members } = heatmapData;
  
  const dayWidth = 60;
  const memberHeight = 60;
  const circleRadius = 8;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Activity className="w-7 h-7 mr-3 text-purple-600" />
              Member Activity
            </h2>
            <p className="text-gray-600 mt-1">
              Visualize member activity patterns across different days
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
                maxDate={endDate}
                isDateInRange={isDateInRange}
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
                minDate={startDate}
                isDateInRange={isDateInRange}
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
            {members.map((member) => (
              <div key={member.id} className="flex items-center border-b border-gray-50 last:border-b-0">
                  <div className="w-48 flex-shrink-0 p-3 bg-gray-50 sticky left-0 z-10 border-r border-gray-200">
                  <div className="flex items-center space-x-3">
                    <MemberAvatar member={member} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate max-w-32 text-gray-900">
                        {getMemberDisplayNameWithFallback(member)}
                      </p>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-600 truncate max-w-24">{getRoleDisplayName(member.role)}</span>
                        {member.pending && (
                          <span className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative" style={{ height: memberHeight }}>
                  <svg
                    width={days.length * dayWidth}
                    height={memberHeight}
                    className="absolute top-0 left-0"
                  >
                    {/* Connecting lines */}
                    {days.slice(0, -1).map((day, dayIndex) => {
                      const nextDay = days[dayIndex + 1];
                      const currentDayData = memberInfo.find(d => d.date === day);
                      const nextDayData = memberInfo.find(d => d.date === nextDay);
                      const currentMember = currentDayData?.members.find(m => m.id === member.id);
                      const nextMember = nextDayData?.members.find(m => m.id === member.id);
                      if (!currentMember || !nextMember) return null;
                      const x1 = dayIndex * dayWidth + dayWidth / 2 + circleRadius;
                      const x2 = (dayIndex + 1) * dayWidth + dayWidth / 2 - circleRadius;
                      const y = memberHeight / 2;
                      const startingColor = getRoleColor(currentMember.role);
                      return (
                        <line
                          key={`line-${dayIndex}`}
                          x1={x1}
                          y1={y}
                          x2={x2}
                          y2={y}
                          stroke={startingColor}
                          strokeWidth="2"
                        />
                      );
                    })}
                    {/* Activity circles */}
                    {days.map((day, dayIndex) => {
                      const dayData = memberInfo.find(d => d.date === day);
                      const dayMember = dayData?.members.find(m => m.id === member.id);
                      if (dayMember) {
                        const cx = dayIndex * dayWidth + dayWidth / 2;
                        const cy = memberHeight / 2;
                        const isPending = dayMember?.pending;
                        const memberRole = dayMember.role;
                        return (
                          <circle
                            key={`circle-${dayIndex}`}
                            cx={cx}
                            cy={cy}
                            r={circleRadius}
                            fill={getRoleColor(memberRole)}
                            stroke="white"
                            strokeWidth="2"
                            opacity={isPending ? 0.4 : 1}
                            className="transition-all duration-200 cursor-pointer drop-shadow-sm hover:opacity-80"
                            style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }}
                          >
                            <title>{`${getMemberDisplayName(dayMember)} was active on ${day}${isPending ? ' (Pending)' : ''} - ${getRoleDisplayName(memberRole)}`}</title>
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
        {members.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No activity data available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityHeatmap;