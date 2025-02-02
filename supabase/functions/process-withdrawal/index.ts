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

    // Format phone number to match IntaSend requirements (254XXXXXXXXX)
    let formattedPhone = phoneNumber.replace(/^\+/, '').replace(/^0/, '254')
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone
    }

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
          narrative: "Withdrawal",
          customer_email: "customer@example.com", // Required by IntaSend
          customer_first_name: "Customer", // Required by IntaSend
          customer_last_name: "Name" // Required by IntaSend
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('IntaSend API error response:', errorData)
        throw new Error(`IntaSend API error: ${response.status} ${response.statusText}\n${errorData}`)
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