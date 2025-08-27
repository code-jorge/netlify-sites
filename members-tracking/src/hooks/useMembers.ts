import { useQuery } from '@tanstack/react-query';
import { Committer, fetchMembersData, Member } from '../services/api';

export type MemberInfo = Array<{
  date: string;
  data: {
    members: Member[];
    committers: Committer[];
  };
}>;

export const useMembers = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['members', startDate || 'no-start-date', endDate || 'no-end-date'],
    queryFn: () => {
      return fetchMembersData(startDate, endDate)
        .then(({ snapshots }) => {
          const enhancedSnapshots = snapshots.map(snapshot => ({
            date: snapshot.date,
            data: {
              members: snapshot.data.members,
              committers: snapshot.data.committers.map(committer => ({
                ...committer,
                member: snapshot.data.members.find(member => member.id === committer.member_id) || null
              }))
            }
          }));
          return enhancedSnapshots;
        });
    }
  });
};