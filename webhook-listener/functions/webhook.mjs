import { getStore } from '@netlify/blobs';

export default async (req) => {

  try {
    const webhookData = await req.json();

    // Get the blob store
    const store = getStore('webhooks');

    // Create a unique key using timestamp and random string
    const timestamp = Date.now();
    const key = `webhook-${timestamp}-${Math.random().toString(36).substring(7)}`;

    // Store the webhook data with metadata
    const dataToStore = {
      id: key,
      timestamp,
      receivedAt: new Date().toISOString(),
      data: webhookData
    };

    await store.set(key, JSON.stringify(dataToStore));

    return new Response(JSON.stringify({
      success: true,
      id: key,
      message: 'Webhook received and stored'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
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
  path: '/api/webhook'
};
