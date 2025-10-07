import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface InteractionRecord {
  project_id: string;
  ai_service_id: string;
  tokens_used: number;
  cost_in_cents: number;
  request_details?: string;
  response_details?: string;
  timestamp?: string; // ISO string
}

interface SyncInteractionsRequest {
  interactions: InteractionRecord[];
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    // Get authentication token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Parse request body
    const body: SyncInteractionsRequest = await req.json();

    const { interactions } = body;
    if (!Array.isArray(interactions) || interactions.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid interactions array' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Validate each interaction
    const validInteractions = interactions.filter(interaction => {
      return (
        interaction.project_id &&
        interaction.ai_service_id &&
        interaction.tokens_used !== undefined &&
        interaction.cost_in_cents !== undefined
      );
    });

    if (validInteractions.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid interactions to sync' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Prepare data for insert
    const insertData = validInteractions.map(interaction => ({
      project_id: interaction.project_id,
      ai_service_id: interaction.ai_service_id,
      tokens_used: interaction.tokens_used,
      cost_in_cents: interaction.cost_in_cents,
      request_details: interaction.request_details,
      response_details: interaction.response_details,
      timestamp: interaction.timestamp ? new Date(interaction.timestamp).toISOString() : undefined,
    }));

    // Insert interactions in a transaction (Supabase handles batch inserts)
    const { data, error: insertError } = await supabase
      .from('interactions')
      .insert(insertData)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({
          error: 'Failed to sync interactions',
          details: insertError.message,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced: data?.length || 0,
        total_requested: interactions.length,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
