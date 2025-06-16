
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
    const { symbol } = await req.json()
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const alpacaApiKey = Deno.env.get('ALPACA_API_KEY')
    const alpacaSecretKey = Deno.env.get('ALPACA_SECRET_KEY')
    const alpacaBaseUrl = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets'

    if (!alpacaApiKey || !alpacaSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Alpaca API credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get latest trade data from Alpaca
    const alpacaResponse = await fetch(
      `${alpacaBaseUrl}/v2/stocks/${symbol}/trades/latest`,
      {
        headers: {
          'APCA-API-KEY-ID': alpacaApiKey,
          'APCA-API-SECRET-KEY': alpacaSecretKey,
        },
      }
    )

    if (!alpacaResponse.ok) {
      console.error('Alpaca API error:', await alpacaResponse.text())
      return new Response(
        JSON.stringify({ error: 'Failed to fetch stock price from Alpaca' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const alpacaData = await alpacaResponse.json()
    const price = alpacaData.trade?.price

    if (!price) {
      return new Response(
        JSON.stringify({ error: 'No price data available for this symbol' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        symbol: symbol.toUpperCase(),
        price: parseFloat(price),
        timestamp: alpacaData.trade?.timestamp || new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-stock-price function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
