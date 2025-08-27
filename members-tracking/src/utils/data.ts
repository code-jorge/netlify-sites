import { Committer, Member } from "../services/api";
import { isSameDay, parseDate } from "./date";

export const filterMembersBySearchAndDay = (
  members: (Member & { date: string })[],
  searchTerm: string,
  selectedDay: Date | null,
  getMemberDisplayName: (member: Member) => string
) => {
  if (!selectedDay) return [];
  const search = searchTerm.toLowerCase();
  return members.filter(member => {
    const name = getMemberDisplayName(member).toLowerCase();
    const email = member.email.toLowerCase();
    const matchesSearch = name.includes(search) || email.includes(search);
    const matchesDay = isSameDay(parseDate(member.date), selectedDay);
    return matchesSearch && matchesDay;
  });
};

export const filterContributorsBySearchAndDay = (
  committers: (Committer & { date: string })[],
  searchTerm: string,
  selectedDay: Date | null
) => {
  if (!selectedDay) return [];
  const search = searchTerm.toLowerCase();
  return committers.filter(committer => {
    const handle = committer.provider_slug.toLowerCase();
    const email = committer.member?.email.toLowerCase();
    const matchesSearch = handle.includes(search) || (email && email.includes(search));
    const matchesDay = isSameDay(parseDate(committer.date), selectedDay);
    return matchesSearch && matchesDay;
  });
};

export const flattenMemberData = (memberData: Array<{ date: string; members: Member[] }>) => {
  return memberData?.flatMap(dayData => 
    dayData.members.map(member => ({
      ...member,
      date: dayData.date
    }))
  ) || [];
};

export const flattenContributorData = (committerData: Array<{ date: string; committers: Committer[] }>) => {
  return committerData?.flatMap(dayData => 
    dayData.committers.map(committer => ({
      ...committer,
      date: dayData.date
    }))
  ) || [];
};

export const generateExportFilename = (startDate: Date | null, endDate: Date | null, baseFilename: string = 'member-data'): string => {
  let filename = baseFilename;
  if (startDate && endDate) {
    const startStr = startDate.toLocaleDateString('en-GB').replace(/\//g, '-');
    const endStr = endDate.toLocaleDateString('en-GB').replace(/\//g, '-');
    filename = `${baseFilename}-${startStr}-to-${endStr}`;
  } else if (startDate) {
    const startStr = startDate.toLocaleDateString('en-GB').replace(/\//g, '-');
    filename = `${baseFilename}-from-${startStr}`;
  } else if (endDate) {
    const endStr = endDate.toLocaleDateString('en-GB').replace(/\//g, '-');
    filename = `${baseFilename}-until-${endStr}`;
  }
  return filename;
};

export const downloadJsonData = (data: any, filename: string) => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};