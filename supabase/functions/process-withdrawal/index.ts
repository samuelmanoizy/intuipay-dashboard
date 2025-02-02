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

    // Make initial transfer request to IntaSend API
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

    const data = await response.json()
    console.log('IntaSend transfer initiation response:', data)

    // Check if we got a tracking ID
    if (data.tracking_id) {
      console.log('Approving M-Pesa transfer with tracking ID:', data.tracking_id)
      
      // Approve the transfer (similar to $transfer->approve() in PHP)
      const approveResponse = await fetch(
        `https://sandbox.intasend.com/api/v1/payment/transfer/${data.tracking_id}/approve/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('INTASEND_TEST_SECRET_KEY')}`
          }
        }
      )
      
      const approveData = await approveResponse.json()
      console.log('M-Pesa transfer approval response:', approveData)

      // Check transfer status (similar to $transfer->status() in PHP)
      const statusResponse = await fetch(
        `https://sandbox.intasend.com/api/v1/payment/transfer/${data.tracking_id}/status/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('INTASEND_TEST_SECRET_KEY')}`
          }
        }
      )

      const statusData = await statusResponse.json()
      console.log('M-Pesa transfer status:', statusData)

      return new Response(
        JSON.stringify({ ...approveData, status: statusData }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error processing M-Pesa withdrawal:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})