// API Proxy - forwards requests to backend via Cloudflare Tunnel
export const onRequest: PagesFunction<{ API_URL: string }> = async (context) => {
  const { request, env, params } = context;

  // Get API URL from environment variable
  const apiUrl = env.API_URL || 'http://localhost:5059';

  // Build the target URL
  const path = Array.isArray(params.path) ? params.path.join('/') : params.path || '';
  const url = new URL(request.url);
  const targetUrl = `${apiUrl}/api/${path}${url.search}`;

  // Forward the request
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.text()
      : undefined,
  });

  // Return the response with CORS headers
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', '*');

  return newResponse;
};

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
