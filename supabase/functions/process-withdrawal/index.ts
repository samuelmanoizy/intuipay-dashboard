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
    const createResponse = await fetch('https://payment.intasend.com/api/v1/send-money/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INTASEND_SECRET_KEY}`,
        'X-IntaSend-Api-Version': '1',
      },
      body: JSON.stringify({
        provider: "mpesa-till",
        currency: "KES",
        transactions: [{
          name: "Customer Withdrawal",
          phone_number: phoneNumber,
          amount: amount,
          narrative: "Withdrawal via M-Pesa"
        }]
      })
    })

    const responseText = await createResponse.text()
    console.log('Raw create response:', responseText)

    if (!createResponse.ok) {
      console.error('Transfer creation failed:', responseText)
      throw new Error(`Transfer creation failed: ${responseText}`)
    }

    const createData = JSON.parse(responseText)
    console.log('Transfer created:', createData)

    if (!createData.id) {
      throw new Error('No transfer ID received')
    }

    // Process the M-Pesa withdrawal using the live API
    const processResponse = await fetch(`https://payment.intasend.com/api/v1/send-money/${createData.id}/process/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INTASEND_SECRET_KEY}`,
        'X-IntaSend-Api-Version': '1',
      }
    })

    const processResponseText = await processResponse.text()
    console.log('Raw process response:', processResponseText)

    if (!processResponse.ok) {
      console.error('Transfer processing failed:', processResponseText)
      throw new Error(`Transfer processing failed: ${processResponseText}`)
    }

    const processData = JSON.parse(processResponseText)
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