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

    // Validate input
    if (!amount || !phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Amount and phone number are required' }),
        { headers: corsHeaders, status: 400 }
      )
    }

    // IntaSend API configuration
    const publicKey = Deno.env.get('INTASEND_API_KEY')
    const secretKey = Deno.env.get('INTASEND_SECRET_KEY')

    if (!publicKey || !secretKey) {
      console.error('IntaSend API keys not configured')
      return new Response(
        JSON.stringify({ error: 'Payment provider configuration error' }),
        { headers: corsHeaders, status: 500 }
      )
    }

    // Prepare the transaction payload
    const transactions = [{
      account: phoneNumber,
      amount: amount.toString()
    }]

    // Make request to IntaSend API
    const response = await fetch('https://sandbox.intasend.com/api/v1/payment/transfer', {
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
      throw new Error(data.message || 'Payment processing failed')
    }

    return new Response(
      JSON.stringify(data),
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Withdrawal processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: corsHeaders, status: 500 }
    )
  }
})