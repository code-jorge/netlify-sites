import { getStore } from '@netlify/blobs';

export default async (req) => {

  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    // Get the blob store
    const store = getStore('webhooks');

    // Get all blob entries using listBlobs
    const allBlobs = [];
    const { blobs } = await store.list();

    for (const blob of blobs) {
      const value = await store.get(blob.key);
      if (value) allBlobs.push(JSON.parse(value));
    }

    // Sort by timestamp (newest first)
    allBlobs.sort((a, b) => b.timestamp - a.timestamp);

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBlobs = allBlobs.slice(startIndex, endIndex);

    return new Response(JSON.stringify({
      success: true,
      data: paginatedBlobs,
      pagination: {
        page,
        limit,
        total: allBlobs.length,
        totalPages: Math.ceil(allBlobs.length / limit),
        hasMore: endIndex < allBlobs.length
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error retrieving webhooks:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/get-webhooks',
  method: 'GET'
};
