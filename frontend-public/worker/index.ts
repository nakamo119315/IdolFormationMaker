export interface Env {
  API_URL: string;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Debug endpoint
    if (url.pathname === '/_debug') {
      return new Response(JSON.stringify({
        API_URL: env.API_URL || 'NOT SET',
        hasAssets: !!env.ASSETS,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // API requests - proxy to backend
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env, url);
    }

    // Static assets
    return env.ASSETS.fetch(request);
  },
};

async function handleApiRequest(request: Request, env: Env, url: URL): Promise<Response> {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const apiUrl = env.API_URL || 'http://localhost:5059';
  const targetUrl = `${apiUrl}${url.pathname}${url.search}`;

  try {
    // Create clean headers (don't forward Host header from original request)
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.text()
        : undefined,
    });

    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    return newResponse;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Backend unavailable', details: String(error) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
