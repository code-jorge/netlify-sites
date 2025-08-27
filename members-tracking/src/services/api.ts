export interface Member {
  id: string;
  email: string;
  full_name: string;
  avatar: string;
  role: string;
  pending: boolean;
  last_activity_date: string;
}

export interface Committer {
  id: string;
  provider: string;
  member_id: string;
  provider_slug: string;
  match_method: string;
  last_seen: string;
  member: Member | null;
}

export interface MembersResponse {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  totalSnapshots: number;
  snapshots: Array<{
    date: string;
    data: {
      members: Member[];
      committers: Committer[];
    };
  }>;
}

export const fetchMembersData = async (startDate?: string, endDate?: string): Promise<MembersResponse> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const res = await fetch(`/api/view-members?${params}`);
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch members');
  }
  
  return await res.json();
};

export const fetchMemberDates = async (): Promise<string[]> => {
  const res = await fetch('/api/list-members');
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch member dates');
  }
  return await res.json();
};
