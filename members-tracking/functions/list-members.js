import { getStore } from '@netlify/blobs';
import { error, success } from './utils.js';

export default async () => {
  try {
    const members = getStore('members');
    if (!members) return success([]);
    const { blobs } = await members.list();
    const dates = blobs.map(blob => blob.key);
    return success(dates);
  } catch (err) {
    return error(err.message, 500);
  }
};
