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

    // First create the transfer using Mobile Money API
    const createResponse = await fetch('https://sandbox.intasend.com/api/v1/payment/mobile-money/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('INTASEND_SECRET_KEY')}`
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        amount: amount,
        currency: "KES",
        provider: "mpesa"
      })
    })

    if (!createResponse.ok) {
      const errorData = await createResponse.text()
      console.error('Transfer creation failed:', errorData)
      throw new Error(`Transfer creation failed: ${errorData}`)
    }

    const createData = await createResponse.json()
    console.log('Transfer created:', createData)

    if (!createData.id) {
      throw new Error('No transfer ID received from transfer creation')
    }

    // Then process the transfer
    const processResponse = await fetch(`https://sandbox.intasend.com/api/v1/payment/${createData.id}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('INTASEND_SECRET_KEY')}`
      }
    })

    if (!processResponse.ok) {
      const errorData = await processResponse.text()
      console.error('Transfer processing failed:', errorData)
      throw new Error(`Transfer processing failed: ${errorData}`)
    }

    const processData = await processResponse.json()
    console.log('Transfer processed:', processData)

    return new Response(JSON.stringify(processData), {
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