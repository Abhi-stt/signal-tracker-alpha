
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

    const alpacaApiKey = Deno.env.get('ALPACA_API_KEY')
    const alpacaSecretKey = Deno.env.get('ALPACA_SECRET_KEY')
    const alpacaBaseUrl = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets'

    if (!alpacaApiKey || !alpacaSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Alpaca API credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all tracked stocks that are still watching
    const { data: trackedStocks, error: fetchError } = await supabaseClient
      .from('tracked_stocks')
      .select('*')
      .eq('status', 'watching')

    if (fetchError) {
      console.error('Error fetching tracked stocks:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tracked stocks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!trackedStocks || trackedStocks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No stocks being tracked', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Checking signals for ${trackedStocks.length} stocks`)
    let updatedCount = 0

    // Group stocks by symbol to avoid duplicate API calls
    const symbolGroups = trackedStocks.reduce((acc, stock) => {
      if (!acc[stock.symbol]) {
        acc[stock.symbol] = []
      }
      acc[stock.symbol].push(stock)
      return acc
    }, {} as Record<string, typeof trackedStocks>)

    for (const [symbol, stocks] of Object.entries(symbolGroups)) {
      try {
        // Get current price from Alpaca
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
          console.error(`Alpaca API error for ${symbol}:`, await alpacaResponse.text())
          continue
        }

        const alpacaData = await alpacaResponse.json()
        const currentPrice = parseFloat(alpacaData.trade?.price || 0)

        if (!currentPrice) {
          console.log(`No price data for ${symbol}`)
          continue
        }

        // Check each stock for this symbol
        for (const stock of stocks) {
          let newStatus = 'watching'
          let signalTriggered = null

          if (currentPrice >= stock.buy_above) {
            newStatus = 'buy_signal'
            signalTriggered = new Date().toISOString()
            console.log(`Buy signal triggered for ${symbol} at $${currentPrice}`)
          } else if (currentPrice <= stock.sell_below) {
            newStatus = 'sell_signal'
            signalTriggered = new Date().toISOString()
            console.log(`Sell signal triggered for ${symbol} at $${currentPrice}`)
          }

          // Update the stock record
          const { error: updateError } = await supabaseClient
            .from('tracked_stocks')
            .update({
              last_price: currentPrice,
              status: newStatus,
              signal_triggered: signalTriggered,
              updated_at: new Date().toISOString()
            })
            .eq('id', stock.id)

          if (updateError) {
            console.error(`Error updating stock ${stock.id}:`, updateError)
          } else {
            updatedCount++
          }
        }

      } catch (error) {
        console.error(`Error processing ${symbol}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Signals checked successfully',
        updated: updatedCount,
        total: trackedStocks.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in check-signals function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
