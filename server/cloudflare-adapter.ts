// Cloudflare Pages Functions for API routes
export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Set environment variables from Cloudflare
  if (env.DATABASE_URL) {
    process.env.DATABASE_URL = env.DATABASE_URL;
  }
  if (env.SESSION_SECRET) {
    process.env.SESSION_SECRET = env.SESSION_SECRET || 'fallback-secret-for-dev';
  }
  if (env.NODE_ENV) {
    process.env.NODE_ENV = env.NODE_ENV;
  }

  // Only handle API routes
  if (!url.pathname.startsWith('/api/')) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    // Import the Express app dynamically to avoid top-level await issues
    const { createApiApp } = await import('./app');
    const app = await createApiApp();

    // Create Express-compatible request/response objects
    const req = {
      method: request.method,
      url: url.pathname + url.search,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams.entries()),
      headers: Object.fromEntries(request.headers.entries()),
      body: request.body ? await request.text() : undefined,
      get: function(header: string) {
        return this.headers[header.toLowerCase()];
      }
    };

    return new Promise((resolve) => {
      const res = {
        statusCode: 200,
        headers: {} as Record<string, string>,
        body: '',
        locals: {},
        status: function(code: number) { 
          this.statusCode = code; 
          return this; 
        },
        json: function(data: any) {
          this.headers['Content-Type'] = 'application/json';
          this.body = JSON.stringify(data);
          resolve(new Response(this.body, { 
            status: this.statusCode, 
            headers: this.headers 
          }));
          return this;
        },
        send: function(data: any) {
          this.body = typeof data === 'string' ? data : JSON.stringify(data);
          if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = typeof data === 'string' ? 'text/plain' : 'application/json';
          }
          resolve(new Response(this.body, { 
            status: this.statusCode, 
            headers: this.headers 
          }));
          return this;
        },
        setHeader: function(name: string, value: string) {
          this.headers[name] = value;
          return this;
        },
        sendStatus: function(code: number) {
          this.statusCode = code;
          resolve(new Response('', { status: code, headers: this.headers }));
          return this;
        },
        cookie: function() { return this; },
        clearCookie: function() { return this; },
        on: function() { return this; }
      };

      // Handle the request with Express app
      app(req as any, res as any, () => {
        resolve(new Response('Not Found', { status: 404 }));
      });
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}