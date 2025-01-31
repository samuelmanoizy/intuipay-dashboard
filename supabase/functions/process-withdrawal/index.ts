import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber, amount } = await req.json()
    console.log('Processing withdrawal:', { phoneNumber, amount })

    const INTASEND_SECRET_KEY = Deno.env.get('INTASEND_SECRET_KEY')
    if (!INTASEND_SECRET_KEY) {
      throw new Error('IntaSend secret key not configured')
    }

    // Create the M-Pesa withdrawal request using the live API
    const createResponse = await fetch('https://sandbox.intasend.com/api/v1/payment/mpesa-b2c/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INTASEND_SECRET_KEY}`,
        'X-IntaSend-Api-Version': '1',
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        amount: amount,
        currency: "KES",
        narrative: "Withdrawal via M-Pesa",
        api_ref: `withdrawal_${Date.now()}`
      })
    })

    const responseText = await createResponse.text()
    console.log('Raw create response:', responseText)

    if (!createResponse.ok) {
      console.error('Payment creation failed:', responseText)
      throw new Error(`Payment creation failed: ${responseText}`)
    }

    const createData = JSON.parse(responseText)
    console.log('Payment created:', createData)

    if (!createData.invoice?.id) {
      throw new Error('No invoice ID received')
    }

    return new Response(JSON.stringify(createData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Withdrawal processing error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})