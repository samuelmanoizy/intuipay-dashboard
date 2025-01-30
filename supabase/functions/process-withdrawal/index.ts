import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WithdrawalRequest {
  account: string;
  amount: string;
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
      throw new Error('Amount and phone number are required')
    }

    const transactions = [{
      account: phoneNumber,
      amount: amount.toString()
    }]

    // IntaSend API endpoint
    const url = 'https://sandbox.intasend.com/api/v1/payment/transfer'
    const publicKey = Deno.env.get('INTASEND_API_KEY')
    const secretKey = Deno.env.get('INTASEND_SECRET_KEY')

    if (!publicKey || !secretKey) {
      throw new Error('IntaSend API keys not configured')
    }

    // Make request to IntaSend API
    const response = await fetch(url, {
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

    // Log the response for debugging
    console.log('IntaSend API Response:', data)

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.ok ? 200 : 400
      }
    )

  } catch (error) {
    console.error('Withdrawal processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})