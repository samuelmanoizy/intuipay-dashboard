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
    const payload = {
      currency: 'KES',
      transactions: [{
        account: phoneNumber,
        amount: parseFloat(amount).toFixed(2), // Ensure proper number format
        method: "M-PESA" // Specify the payment method
      }],
      callback_url: "", // Optional callback URL
      notification_email: "", // Optional notification email
      requires_approval: "NO"
    }

    console.log('Preparing IntaSend request:', payload)

    try {
      // Make request to IntaSend API
      const response = await fetch('https://sandbox.intasend.com/api/v1/payment/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secretKey}`,
          'X-IntaSend-Public-API-Key': publicKey
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
            details: responseText.substring(0, 100) // Log first 100 chars of response
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