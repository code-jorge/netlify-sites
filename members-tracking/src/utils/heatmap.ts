import { Committer, Member } from "../services/api";

export interface HeatmapData<T> {
  days: string[];
  items: T[];
  activity: Record<string, T[]>;
}

export const processHeatmapData = <T extends { id: string }>(
  data: { date: string; items: T[] }[],
  startDate: Date | null,
  endDate: Date | null,
  parseDate: (dateStr: string) => Date
): HeatmapData<T> => {
  if (!data) return { days: [], items: [], activity: {} };

  // Sort data so that older dates come first and recent dates last
  const sortedData = data.slice().sort((a, b) => {
    return parseDate(a.date).getTime() - parseDate(b.date).getTime();
  });

  // Get all unique items across all days
  const allItemsMap = new Map<string, T>();
  sortedData.forEach(dayData => {
    dayData.items.forEach(item => {
      if (!allItemsMap.has(item.id)) {
        allItemsMap.set(item.id, item);
      }
    });
  });

  const items = Array.from(allItemsMap.values());
  // Build a continuous list of day strings covering the full range (fills any gaps)
  const formatDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  let days: string[] = [];

  if (startDate && endDate) {
    // build range strictly from the provided dates
    const cur = new Date(startDate);
    while (cur <= endDate) {
      days.push(formatDateStr(cur));
      cur.setDate(cur.getDate() + 1);
    }
  } else if (sortedData.length) {
    // fall back to min/max dates from data
    const startLoop = parseDate(sortedData[0].date);
    const endLoop = parseDate(sortedData[sortedData.length - 1].date);
    const cur = new Date(startLoop);
    while (cur <= endLoop) {
      days.push(formatDateStr(cur));
      cur.setDate(cur.getDate() + 1);
    }
  }

  const activity: Record<string, T[]> = {};
  sortedData.forEach(dayData => {
    activity[dayData.date] = dayData.items;
  });

  return { days, items, activity };
};

export const processMemberHeatmapData = (
  memberData: Array<{ date: string; members: Member[] }> | undefined,
  startDate: Date | null,
  endDate: Date | null,
  parseDate: (dateStr: string) => Date
): HeatmapData<Member> => {
  if (!memberData) return { days: [], items: [], activity: {} };
  
  const transformedData = memberData.map(dayData => ({
    date: dayData.date,
    items: dayData.members
  }));
  
  return processHeatmapData(transformedData, startDate, endDate, parseDate);
};

export const processContributorHeatmapData = (
  committerData: Array<{ date: string; committers: Committer[] }>,
  startDate: Date | null,
  endDate: Date | null,
  parseDate: (dateStr: string) => Date
): HeatmapData<Committer> => {
  if (!committerData) return { days: [], items: [], activity: {} };
  const dayMap = new Map<string, Committer[]>();
  committerData.forEach(snapshot => {
    snapshot.committers.forEach(committer => {
      if (!committer.last_seen) return;
      const dayStr = committer.last_seen.split('T')[0];
      const dayDate = parseDate(dayStr);
      if (startDate && dayDate < startDate) return;
      if (endDate && dayDate > endDate) return;
      const list = dayMap.get(dayStr) || [];
      list.push(committer);
      dayMap.set(dayStr, list);
    });
  });


  // Transform map into array sorted chronologically
  const transformedData = Array.from(dayMap.entries())
    .map(([date, committers]) => ({ date, items: committers }))
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
  return processHeatmapData(transformedData, startDate, endDate, parseDate);
};

export const filterDataByDateRange = <T>(
  data: { memberData?: { date: string; members: T[] }[]; committerData?: { date: string; contributors: T[] }[] } | null,
  startDate: Date | null,
  endDate: Date | null,
  parseDate: (dateStr: string) => Date,
  dataType: 'member' | 'contributor' = 'member'
) => {
  if (!data) return null;

  // If no date range selected, return all data
  if (!startDate && !endDate) {
    return data;
  }

  const sourceData = dataType === 'member' ? data.memberData : data.committerData;
  if (!sourceData) return null;

  // Filter data based on date range
  const filteredData = sourceData.filter(dayData => {
    const dayDate = parseDate(dayData.date);
    
    if (startDate && endDate) {
      return dayDate >= startDate && dayDate <= endDate;
    } else if (startDate) {
      return dayDate >= startDate;
    } else if (endDate) {
      return dayDate <= endDate;
    }
    
    return true;
  });

  return dataType === 'member' 
    ? { memberData: filteredData }
    : { committerData: filteredData };
};