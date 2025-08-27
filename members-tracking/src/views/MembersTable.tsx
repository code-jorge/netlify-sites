import React, { useState, useEffect } from 'react';
import { useMembers } from '../hooks/useMembers';
import { getMemberDisplayName } from '../utils/member';
import { getRoleDisplayName } from '../utils/role';
import { flattenMemberData, filterMembersBySearchAndDay } from '../utils/data';
import MemberAvatar from '../components/MemberAvatar';
import DatePicker from '../components/DatePicker';
import { Search, Users, Calendar } from 'lucide-react';
import { useAvailableDates } from '../hooks/useDates';
import { formatDate, getCurrentDateRange, getLatestDay } from '../utils/date';

const MembersTable: React.FC = () => {
  
  const [, end] = getCurrentDateRange();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState<Date | null>(end);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const { data: memberDetails = [], isLoading, error } = useMembers();
  const { data: availableDates = [] } = useAvailableDates();

  const memberInfo = memberDetails.map(({ date, data }) => ({
    date,
    members: data.members,
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
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

  const allMembers = flattenMemberData(memberInfo);
  const filteredMembers = filterMembersBySearchAndDay(allMembers, searchTerm, selectedDay, getMemberDisplayName);

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
              <Users className="w-7 h-7 mr-3 text-blue-600" />
              Members Directory
            </h2>
            <p className="text-gray-600 mt-1">
              Manage and view all registered members across different days
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search members by name or email..."
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
                Member
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <MemberAvatar member={member} size="md" />
                    </div>
                    <div className="ml-4">
                      <div className={`text-sm font-medium ${
                        member.full_name ? 'text-gray-900' : 'text-gray-400 italic'
                      }`}>
                        {getMemberDisplayName(member)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{member.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">
                      {getRoleDisplayName(member.role)}
                    </span>
                    {member.pending && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                        Pending
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No members found matching your criteria.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default MembersTable;