import React, { useState, useEffect } from 'react';
import { getLatestDay, formatDate, formatISODate, getCurrentDateRange } from '../utils/date';
import { flattenContributorData, filterContributorsBySearchAndDay } from '../utils/data';
import { formatProvider, getPlatformTextColor } from '../utils/platform';
import PlatformIcon from '../components/PlatformIcon';
import DatePicker from '../components/DatePicker';
import { Search, GitBranch, Calendar } from 'lucide-react';
import { useMembers } from '../hooks/useMembers';
import { useAvailableDates } from '../hooks/useDates';
import { getMemberDisplayNameWithFallback } from '../utils/member';

const ContributorsTable: React.FC = () => {

  const [, end] = getCurrentDateRange();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState<Date | null>(end);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: memberDetails = [], isLoading, error } = useMembers();
  const { data: availableDates = [] } = useAvailableDates();

  const committerInfo = memberDetails.map(({ date, data }) => ({
    date,
    committers: data.committers,
  }));

  const latestDay = getLatestDay(availableDates);

  // Set selected day to latest day when data loads
  useEffect(() => {
    if (latestDay && !selectedDay) {
      setSelectedDay(latestDay);
    }
  }, [latestDay, selectedDay]);

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

  const allContributors = flattenContributorData(committerInfo);
  const filteredContributors = filterContributorsBySearchAndDay(allContributors, searchTerm, selectedDay);

  const handleDateSelect = (date: Date) => {
    setSelectedDay(date);
    setShowDatePicker(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <GitBranch className="w-7 h-7 mr-3 text-green-600" />
              Contributors Directory
            </h2>
            <p className="text-gray-600 mt-1">
              Manage and view all code contributors across different platforms
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search contributors by handle or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative ml-auto">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">{formatDate(selectedDay)}</span>
            </button>
            <DatePicker
              isVisible={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              onSelect={handleDateSelect}
              selectedDate={null}
              otherDate={null}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              availableDates={availableDates}
              isDateInRange={() => true}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contributor
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Seen
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredContributors.map((contributor) => (
              <tr key={contributor.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-gray-100 ${getPlatformTextColor(contributor.provider)}`}>
                      <PlatformIcon platform={contributor.provider} className="w-5 h-5" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        @{contributor.provider_slug}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {formatProvider(contributor.provider)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {contributor.member ? (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <img
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                          src={contributor.member.avatar}
                          alt="Matched user"
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm text-gray-900">{getMemberDisplayNameWithFallback(contributor.member)}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 italic">No match</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatISODate(contributor.last_seen)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredContributors.length === 0 && (
          <div className="text-center py-12">
            <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No contributors found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContributorsTable;