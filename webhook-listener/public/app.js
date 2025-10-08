const PAGE_SIZE = 10;

let currentPage = 1;

const loadWebhooks = async (page = 1) => {
  try {
    const response = await fetch(`/api/get-webhooks?page=${page}&limit=${PAGE_SIZE}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Failed to load webhooks');
    displayWebhooks(result.data);
    updatePagination(result.pagination);
    updateStats(result.pagination);
  } catch (error) {
    displayError(error.message);
  }
};

const displayWebhooks = (webhooks) => {
  const content = document.getElementById('content');
  const errorContainer = document.getElementById('error-container');
  errorContainer.innerHTML = '';
  if (webhooks.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="icon">📭</div>
        <div>No webhooks received yet</div>
        <div style="margin-top: 10px; font-size: 14px; opacity: 0.8;">
          Send a POST request to /api/webhook to get started
        </div>
      </div>
    `;
    return;
  }

  const webhooksHtml = webhooks.map(webhook => `
    <div class="webhook-card">
      <div class="webhook-header">
        <span class="webhook-id">${webhook.id}</span>
        <span class="webhook-time">${new Date(webhook.receivedAt).toLocaleString()}</span>
      </div>
      <div class="json-viewer">
        <pre>${JSON.stringify(webhook.data, null, 2)}</pre>
      </div>
    </div>
  `).join('');
  content.innerHTML = `<div class="webhooks-list">${webhooksHtml}</div>`;
};

const updatePagination = (pagination) => {
  currentPage = pagination.page;
  document.getElementById('currentPage').textContent = currentPage;
  document.getElementById('prevBtn').disabled = currentPage === 1;
  document.getElementById('nextBtn').disabled = !pagination.hasMore;
};

const updateStats = (pagination) => {
  const stats = document.getElementById('stats');
  const start = (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(start + pagination.limit - 1, pagination.total);

  if (pagination.total === 0) stats.textContent = 'No webhooks';
  else stats.textContent = `Showing ${start}-${end} of ${pagination.total} webhooks`;
};

const displayError = (message) => {
  const errorContainer = document.getElementById('error-container');
  errorContainer.innerHTML = `<div class="error">⚠️ Error: ${message}</div>`;
  const content = document.getElementById('content');
  content.innerHTML = '';
};

const nextPage = () => loadWebhooks(currentPage + 1);
const previousPage = () => loadWebhooks(currentPage - 1);

// Load initial data
loadWebhooks(1);

// Auto-refresh every 30 seconds
setInterval(() => loadWebhooks(currentPage), 30000);
