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

    // Create the M-Pesa withdrawal request
    const createResponse = await fetch('https://payment.intasend.com/api/v1/payment/mpesa-stk/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('INTASEND_SECRET_KEY')}`
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        amount: amount,
        currency: "KES",
        method: "M-PESA",
        api_ref: Date.now().toString(),
        narrative: "Withdrawal via M-Pesa"
      })
    })

    if (!createResponse.ok) {
      const errorData = await createResponse.text()
      console.error('Payment creation failed:', errorData)
      throw new Error(`Payment creation failed: ${errorData}`)
    }

    const createData = await createResponse.json()
    console.log('Payment created:', createData)

    if (!createData.invoice_id) {
      throw new Error('No invoice ID received from payment creation')
    }

    // Process the M-Pesa withdrawal
    const processResponse = await fetch(`https://payment.intasend.com/api/v1/payment/${createData.invoice_id}/process/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('INTASEND_SECRET_KEY')}`
      }
    })

    if (!processResponse.ok) {
      const errorData = await processResponse.text()
      console.error('Payment processing failed:', errorData)
      throw new Error(`Payment processing failed: ${errorData}`)
    }

    const processData = await processResponse.json()
    console.log('Payment processed:', processData)

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