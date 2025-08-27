import { useQuery } from '@tanstack/react-query';
import { fetchMemberDates } from '../services/api';
import { parseDate } from '../utils/date';

export const useAvailableDates = () => {
  return useQuery<Date[], Error>({
    queryKey: ['member-dates'],
    queryFn: async () => {
      const dates = await fetchMemberDates();
      return dates.map(parseDate);
    },
  });
};