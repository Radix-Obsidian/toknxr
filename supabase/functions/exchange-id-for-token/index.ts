import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { create, getNumericDate } from 'https://deno.land/x/djwt/mod.ts'

interface ExchangeIdForTokenRequest {
  machine_id: string
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Parse request body
    const body: ExchangeIdForTokenRequest = await req.json()

    const { machine_id } = body
    if (!machine_id || typeof machine_id !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid machine_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // For simplicity, we'll generate a JWT for the machine_id as the user ID
    // In a real implementation, you might validate against a user_sessions table
    // or check if the machine_id is associated with an authenticated user

    // Get Supabase configuration
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create JWT payload similar to Supabase auth
    const payload = {
      aud: 'authenticated',
      exp: getNumericDate(60 * 60 * 24 * 7), // 7 days
      sub: machine_id, // Use machine_id as the user ID
      email: `${machine_id}@cli.local`, // Fake email for Supabase
      app_metadata: {
        provider: 'cli',
        providers: ['cli']
      },
      user_metadata: {
        machine_id: machine_id
      },
      role: 'authenticated'
    }

    // Create JWT using the service role key as secret
    const token = await create({ alg: 'HS256', typ: 'JWT' }, payload, serviceRoleKey)

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})