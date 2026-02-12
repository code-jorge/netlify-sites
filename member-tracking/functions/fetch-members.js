import { getStore } from '@netlify/blobs';
import { error, success, formatDate } from './utils.js';

const formatMember = (m) => ({
  id: m.id,
  email: m.email,
  full_name: m.full_name,
  avatar: m.avatar,
  role: m.role,
  pending: m.pending,
  last_activity_date: m.last_activity_date
});

const formatCommitter = (c) => ({
  id: c.id,
  provider: c.provider,
  member_id: c.member_id,
  provider_slug: c.provider_slug,
  match_method: c.match_method,
  last_seen: c.last_seen
});

const getMembers = async (accountId, authToken) => {
  const baseUrl = `https://api.netlify.com/api/v1/${accountId}/members`;
  const headers = { Authorization: `Bearer ${authToken}` };
  let page = 1;
  const all = [];
  while (true) {
    const res = await fetch(`${baseUrl}?page=${page}`, { headers });
    if (!res.ok) throw new Error(`Members API error: ${res.status}`);
    const batch = await res.json();
    all.push(...batch.map(formatMember));
    if (batch.length < 100) break; // last page
    page += 1;
  }
  return all;
};

const getCommitters = async (accountId, authToken) => {
  const baseUrl = `https://api.netlify.com/api/v1/${accountId}/committers`;
  const headers = { Authorization: `Bearer ${authToken}` };
  const all = [];
  const res = await fetch(`${baseUrl}`, { headers });
  if (!res.ok) throw new Error(`Committers API error: ${res.status}`);
  const batch = await res.json();
  all.push(...batch.map(formatCommitter));
  return all;
};

export default async (request, context) => {
  // Get env vars for Netlify API
  console.log("We are getting started");
  const NETLIFY_API_TOKEN = Netlify.env.get('NETLIFY_API_TOKEN');
  console.log("We have the API token");
  const NETLIFY_ACCOUNT_ID = context.account?.id || '5e21500276ee6f05945b848b';
  console.log("We have the account ID");
  if (!NETLIFY_API_TOKEN) return error("Missing NETLIFY_API_TOKEN env var");
  if (!NETLIFY_ACCOUNT_ID) return error("Missing account ID in context");

  console.log("Fetching Netlify members...");

  let members, committers;
  try {
    members = await getMembers(NETLIFY_ACCOUNT_ID, NETLIFY_API_TOKEN);
    console.log(`Found ${members.length} members`);
    committers = await getCommitters(NETLIFY_ACCOUNT_ID, NETLIFY_API_TOKEN);
    console.log(`Found ${committers.length} committers`);
  } catch (err) {
    console.error(err);
    return error(err.message);
  }
  // Save / merge daily snapshot
  const key = formatDate(new Date());
  const store = getStore('members');
  try {
    let mergedMembers = members;
    let mergedCommitters = committers;

    // Check if a snapshot already exists for today
    const existing = await store.get(key, { type: 'json' });
    if (existing) {
      // Merge members by id (prefer latest)
      const memberMap = new Map();
      for (const m of existing.members || []) memberMap.set(m.id, m);
      for (const m of members) memberMap.set(m.id, m); // overwrite/insert
      mergedMembers = Array.from(memberMap.values());

      // Merge committers by id
      const committerMap = new Map();
      for (const c of existing.committers || []) committerMap.set(c.id, c);
      for (const c of committers) committerMap.set(c.id, c);
      mergedCommitters = Array.from(committerMap.values());
    }
    await store.setJSON(key, { members: mergedMembers, committers: mergedCommitters });
    return success({ ok: true, date: key, memberCount: mergedMembers.length, committerCount: mergedCommitters.length });
  } catch (e) {
    return error(`Blob store error: ${e.message}`);
  }
};
