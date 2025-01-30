import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { IntaSend } from 'npm:intasend-node'

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

    // Validate input
    if (!amount || !phoneNumber) {
      throw new Error('Amount and phone number are required')
    }

    // Initialize IntaSend client
    const intasend = new IntaSend({
      token: Deno.env.get("INTASEND_API_KEY"),
      publishableKey: "ISPubKey_live_df8814b3-3787-42eb-8d25-c4a46391a0d4",
      test: false, // Set to false for live mode
    })

    // Clean phone number to ensure only digits
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '')

    console.log('Initiating payout with IntaSend Node SDK')
    
    const payouts = intasend.payouts()
    
    // First create the payout request
    const payoutResponse = await payouts.mpesa({
      currency: 'KES',
      requires_approval: 'NO', // Auto-approve transactions
      transactions: [{
        name: 'Customer',
        account: cleanPhoneNumber,
        amount: amount.toString(),
        narrative: 'Wallet withdrawal'
      }]
    })

    console.log('Payout response:', payoutResponse)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: payoutResponse
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error processing withdrawal:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Failed to process withdrawal',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})