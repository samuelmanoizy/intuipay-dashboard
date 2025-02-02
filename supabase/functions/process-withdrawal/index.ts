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

    // Initialize IntaSend SDK with test credentials
    const intasend = new IntaSend({
      token: Deno.env.get('INTASEND_TEST_SECRET_KEY'),
      publishable_key: 'ISPubKey_test_c54e1f70-0859-4c79-b912-de3b3ae02e42',
      test: true
    })

    // Create payout instance and process the withdrawal
    const payouts = intasend.payouts()
    const response = await payouts.mpesa({
      currency: 'KES',
      requires_approval: 'NO',
      transactions: [{
        name: 'Customer Withdrawal',
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

  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error processing withdrawal',
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})