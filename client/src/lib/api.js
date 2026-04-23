class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Custom event for session expiry — AuthContext listens to this
function emitSessionExpired() {
  window.dispatchEvent(new CustomEvent('session-expired'));
}

// Track server wake-up for cold start detection
let serverWakingUp = false;

function emitServerWaking(waking) {
  if (serverWakingUp !== waking) {
    serverWakingUp = waking;
    window.dispatchEvent(new CustomEvent('server-waking', { detail: { waking } }));
  }
}

export async function api(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  // Auto-retry once on network error (handles cold start)
  let res;
  let attempt = 0;
  const maxAttempts = 2;

  while (attempt < maxAttempts) {
    try {
      res = await fetch(`/api/v1${endpoint}`, config);
      emitServerWaking(false);
      break;
    } catch (err) {
      attempt++;
      if (attempt === 1) {
        // First failure — server might be waking up from sleep
        emitServerWaking(true);
        // Wait 3 seconds then retry
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        // Second failure — real network issue
        emitServerWaking(false);
        throw new ApiError('Server is not responding. Please check your connection.', 0);
      }
    }
  }

  if (!res.ok) {
    // Session expired — clear token and notify
    if (res.status === 401 && token) {
      localStorage.removeItem('token');
      emitSessionExpired();
    }

    const err = await res.json().catch(() => ({ error: 'Something went wrong' }));

    // Rate limit hit — show full-screen countdown overlay
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('retry-after') || res.headers.get('ratelimit-reset') || '60', 10);
      window.dispatchEvent(new CustomEvent('rate-limit', {
        detail: { message: err.error, retryAfter: isNaN(retryAfter) ? 60 : retryAfter },
      }));
    }

    throw new ApiError(err.error || 'Request failed', res.status, err.details);
  }

  return res.json();
}

export { ApiError };
