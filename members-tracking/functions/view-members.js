import { getStore } from '@netlify/blobs';
import { parseDate, formatDate, addDays, error, success } from './utils.js';

export default async (request) => {
  const url = new URL(request.url);
  const startDateParam = url.searchParams.get('startDate');
  const endDateParam = url.searchParams.get('endDate');

  let startDate, endDate;

  // Parse and validate dates
  if (startDateParam && endDateParam) {
    startDate = parseDate(startDateParam);
    endDate = parseDate(endDateParam);
    if (!startDate || !endDate) return error("Use YYYY-MM-DD format.");
    // Check if dates are more than 40 days apart
    const daysDiff = Math.abs((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (daysDiff > 40) return error("Date range cannot exceed 40 days.");
  } else if (startDateParam) {
    // Only startDate provided, create 40-day window
    startDate = parseDate(startDateParam);
    if (!startDate) return error("Use YYYY-MM-DD format.");
    endDate = addDays(startDate, 40);
  } else if (endDateParam) {
    // Only endDate provided, create 40-day window backwards
    endDate = parseDate(endDateParam);
    if (!endDate) return error("Use YYYY-MM-DD format.");
    startDate = addDays(endDate, -40);
  } else {
    // No dates provided, use last 30 days as default
    const today = new Date();
    endDate = today;
    startDate = addDays(today, -30);
  }

  // Ensure startDate is before endDate
  if (startDate > endDate) {
    [startDate, endDate] = [endDate, startDate];
  }
  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);
  console.log(`Querying members data from ${startDateStr} to ${endDateStr}`);

  // Query blob storage
  const store = getStore('members');

  try {
    // List all blobs under the "snapshots/" prefix
    const { blobs } = await store.list();
    const snapshots = [];
    for (const { key } of blobs) {
      // Check if the snapshot is within the requested date range
      if (key < startDateStr || key > endDateStr) continue; 
      // Fetch the snapshot body
      const info = await store.get(key, { type: 'json' });
      if (!info) continue;
      snapshots.push({ date: key, data: info });
    }
    // Sort snapshots newest first
    snapshots.sort((a, b) => b.date.localeCompare(a.date));
    return success({
      dateRange: { startDate: startDateStr, endDate: endDateStr },
      totalSnapshots: snapshots.length,
      snapshots
    });
  } catch (err) {
    return error(`Blob storage error: ${err.message}`, 500);
  }
};
