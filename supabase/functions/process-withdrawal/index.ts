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
    // Parse request body
    const requestData = await req.json()
    const { phoneNumber, amount } = requestData
    
    // Validate input
    if (!phoneNumber || !amount) {
      return new Response(
        JSON.stringify({ error: 'Phone number and amount are required' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Format phone number to include country code if not present
    const formattedPhone = phoneNumber.startsWith('+') ? 
      phoneNumber : 
      phoneNumber.startsWith('254') ? 
        `+${phoneNumber}` : 
        `+254${phoneNumber.replace(/^0+/, '')}`

    console.log('Processing M-Pesa withdrawal:', { formattedPhone, amount })

    try {
      // Make transfer request to IntaSend API using the correct endpoint for M-Pesa
      const response = await fetch('https://sandbox.intasend.com/api/v1/payment/mpesa-stk-push/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('INTASEND_TEST_SECRET_KEY')}`
        },
        body: JSON.stringify({
          phone_number: formattedPhone,
          amount: amount.toString(),
          currency: "KES",
          api_ref: crypto.randomUUID(),
          narrative: "Withdrawal"
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('IntaSend API error:', errorData)
        throw new Error(`IntaSend API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('IntaSend transfer response:', data)

      // Check if we got a checkout ID
      if (!data.checkout_id) {
        throw new Error('No checkout ID received from IntaSend')
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } catch (apiError) {
      console.error('IntaSend API error:', apiError)
      return new Response(
        JSON.stringify({ error: apiError.message || 'Error processing withdrawal' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: 'Invalid request format' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})