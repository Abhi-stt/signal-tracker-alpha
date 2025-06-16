
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header to extract user info
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user from the JWT token
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { symbol, buyAbove, sellBelow } = await req.json()

    if (!symbol || !buyAbove || !sellBelow) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: symbol, buyAbove, sellBelow' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get current price from Alpaca
    const alpacaApiKey = Deno.env.get('ALPACA_API_KEY')
    const alpacaSecretKey = Deno.env.get('ALPACA_SECRET_KEY')
    const alpacaBaseUrl = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets'

    let currentPrice = null
    if (alpacaApiKey && alpacaSecretKey) {
      try {
        const alpacaResponse = await fetch(
          `${alpacaBaseUrl}/v2/stocks/${symbol}/trades/latest`,
          {
            headers: {
              'APCA-API-KEY-ID': alpacaApiKey,
              'APCA-API-SECRET-KEY': alpacaSecretKey,
            },
          }
        )

        if (alpacaResponse.ok) {
          const alpacaData = await alpacaResponse.json()
          currentPrice = parseFloat(alpacaData.trade?.price || 0)
        }
      } catch (error) {
        console.error('Error fetching price from Alpaca:', error)
      }
    }

    // Insert the tracked stock
    const { data, error } = await supabaseClient
      .from('tracked_stocks')
      .insert({
        user_id: user.id,
        symbol: symbol.toUpperCase(),
        buy_above: buyAbove,
        sell_below: sellBelow,
        last_price: currentPrice,
        status: 'watching'
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting tracked stock:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to track stock' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ stock: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in track-stock function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
