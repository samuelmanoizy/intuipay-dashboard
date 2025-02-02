import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { IntaSend } from 'npm:intasend-node'

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

    // Format phone number (ensure it starts with 254)
    let formattedPhone = phoneNumber.replace(/^\+/, '').replace(/^0/, '254')
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone
    }

    console.log('Processing M-Pesa withdrawal:', { formattedPhone, amount })

    try {
      // Initialize IntaSend SDK
      const intasend = new IntaSend({
        token: Deno.env.get('INTASEND_TEST_SECRET_KEY'),
        publishable_key: 'ISPubKey_test_c54e1f70-0859-4c79-b912-de3b3ae02e42',
        test: true
      })

      // Create payout instance
      const payouts = intasend.payouts()
      
      // Process the payout
      const response = await payouts.mpesa({
        currency: 'KES',
        requires_approval: 'NO', // Set to auto-approve transactions
        transactions: [{
          name: 'Customer Withdrawal', // Generic name since we don't collect it
          account: formattedPhone,
          amount: amount.toString(),
          narrative: 'Wallet Withdrawal'
        }]
      })

      console.log('IntaSend payout response:', response)

      return new Response(
        JSON.stringify({ success: true, data: response }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } catch (apiError) {
      console.error('IntaSend API error:', apiError)
      return new Response(
        JSON.stringify({ error: `IntaSend API error: ${apiError.message || 'Error processing withdrawal'}` }),
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