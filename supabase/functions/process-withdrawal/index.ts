import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const publicKey = 'ISPubKey_live_df8814b3-3787-42eb-8d25-c4a46391a0d4'
    const secretKey = Deno.env.get('INTASEND_SECRET_KEY')

    if (!secretKey) {
      console.error('IntaSend secret key not configured')
      return new Response(
        JSON.stringify({ 
          error: 'Payment provider configuration error',
          details: 'Secret key missing'
        }),
        { headers: corsHeaders, status: 500 }
      )
    }

    // Clean phone number to ensure only digits
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '')
    
    // Prepare the transaction payload
    const payload = {
      currency: 'KES',
      method: 'M-PESA',
      customer_id: cleanPhoneNumber,
      value: parseFloat(amount),
      account_no: cleanPhoneNumber
    }

    console.log('Preparing IntaSend request:', payload)

    try {
      // Make request to IntaSend API using their direct transfer endpoint
      const response = await fetch('https://sandbox.intasend.com/api/v1/send-money/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${secretKey}`,
          'X-API-KEY': publicKey
        },
        body: JSON.stringify(payload)
      })

      const responseText = await response.text()
      console.log('IntaSend API Raw Response:', responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse IntaSend response:', parseError)
        return new Response(
          JSON.stringify({
            error: 'Invalid response from payment provider',
            details: responseText.substring(0, 100)
          }),
          { headers: corsHeaders, status: 500 }
        )
      }

      if (!response.ok) {
        console.error('IntaSend API Error Response:', data)
        return new Response(
          JSON.stringify({ 
            error: data.message || 'Payment processing failed',
            details: data
          }),
          { headers: corsHeaders, status: response.status }
        )
      }

      console.log('IntaSend API Success Response:', data)
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