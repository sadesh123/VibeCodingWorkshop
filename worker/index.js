/**
 * Cloudflare Worker — serves contact details at runtime.
 * DO NOT change the variable names or the response shape.
 *
 * Part 1: reads from .env (CONTACT_EMAIL, CONTACT_PHONE)
 * Part 2: EPM blocks Claude Code from reading .env — Worker still works
 * Part 3: values move to AWS Secrets Manager via Secrets Hub
 */

export default {
  async fetch(request, env) {
    // CORS — allow the Cloudflare Pages frontend (and localhost dev)
    const origin = request.headers.get('Origin') || ''
    const allowed =
      origin.startsWith('http://localhost') ||
      origin.endsWith('.pages.dev') ||
      origin.endsWith('.workers.dev')

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowed ? origin : '',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const url = new URL(request.url)

    if (url.pathname === '/contact') {
      const payload = {
        email: env.CONTACT_EMAIL ?? 'yourname@gmail.com',
        phone: env.CONTACT_PHONE ?? '+65 9000 0000',
      }

      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      })
    }

    return new Response('Not found', { status: 404, headers: corsHeaders })
  },
}
