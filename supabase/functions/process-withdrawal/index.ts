import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { amount, phoneNumber } = await req.json()
    console.log('Received withdrawal request:', { amount, phoneNumber })

    // Validate input
    if (!amount || !phoneNumber) {
      return new Response(
        JSON.stringify({ 
          error: 'Amount and phone number are required',
          details: { amount, phoneNumber }
        }),
        { headers: corsHeaders, status: 400 }
      )
    }

    // IntaSend API configuration
    const publicKey = Deno.env.get('INTASEND_API_KEY')
    const secretKey = Deno.env.get('INTASEND_SECRET_KEY')

    if (!publicKey || !secretKey) {
      console.error('IntaSend API keys not configured')
      return new Response(
        JSON.stringify({ 
          error: 'Payment provider configuration error',
          details: 'API keys missing'
        }),
        { headers: corsHeaders, status: 500 }
      )
    }

    // Prepare the transaction payload
    const transactions = [{
      account: phoneNumber,
      amount: amount.toString()
    }]

    console.log('Preparing IntaSend request:', {
      currency: 'KES',
      transactions,
      requires_approval: 'NO'
    })

    try {
      // Make request to IntaSend API - using production endpoint
      const response = await fetch('https://payment.intasend.com/api/v1/payment/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secretKey}`,
          'X-IntaSend-Public-API-Key': publicKey
        },
        body: JSON.stringify({
          currency: 'KES',
          transactions,
          requires_approval: 'NO'
        })
      })

      const data = await response.json()
      console.log('IntaSend API Response:', data)

      if (!response.ok) {
        return new Response(
          JSON.stringify({ 
            error: data.message || 'Payment processing failed',
            details: data
          }),
          { headers: corsHeaders, status: response.status }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: data
        }),
        { headers: corsHeaders }
      )
    } catch (fetchError) {
      console.error('IntaSend API request failed:', fetchError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to communicate with payment provider',
          details: fetchError.message
        }),
        { headers: corsHeaders, status: 500 }
      )
    }

  } catch (error) {
    console.error('Withdrawal processing error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { headers: corsHeaders, status: 500 }
    )
  }
})