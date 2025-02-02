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

    // Format transactions for IntaSend API
    const transactions = [{
      account: phoneNumber,
      amount: amount.toString()
    }]

    console.log('Processing M-Pesa withdrawal:', { phoneNumber, amount })

    try {
      // Make initial transfer request to IntaSend API using test secret key
      const response = await fetch('https://sandbox.intasend.com/api/v1/payment/transfer/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('INTASEND_TEST_SECRET_KEY')}`
        },
        body: JSON.stringify({
          currency: "KES",
          transactions: transactions
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('IntaSend API error:', errorData)
        throw new Error(`IntaSend API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('IntaSend transfer initiation response:', data)

      // Check if we got a tracking ID
      if (!data.tracking_id) {
        throw new Error('No tracking ID received from IntaSend')
      }

      console.log('Approving M-Pesa transfer with tracking ID:', data.tracking_id)
      
      // Approve the transfer
      const approveResponse = await fetch(
        `https://sandbox.intasend.com/api/v1/payment/transfer/${data.tracking_id}/approve/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('INTASEND_TEST_SECRET_KEY')}`
          }
        }
      )

      if (!approveResponse.ok) {
        const errorData = await approveResponse.text()
        console.error('IntaSend approval error:', errorData)
        throw new Error(`IntaSend approval error: ${approveResponse.status} ${approveResponse.statusText}`)
      }
      
      const approveData = await approveResponse.json()
      console.log('M-Pesa transfer approval response:', approveData)

      // Check transfer status
      const statusResponse = await fetch(
        `https://sandbox.intasend.com/api/v1/payment/transfer/${data.tracking_id}/status/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('INTASEND_TEST_SECRET_KEY')}`
          }
        }
      )

      if (!statusResponse.ok) {
        const errorData = await statusResponse.text()
        console.error('IntaSend status check error:', errorData)
        throw new Error(`IntaSend status check error: ${statusResponse.status} ${statusResponse.statusText}`)
      }

      const statusData = await statusResponse.json()
      console.log('M-Pesa transfer status:', statusData)

      return new Response(
        JSON.stringify({ success: true, data: { ...approveData, status: statusData } }),
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