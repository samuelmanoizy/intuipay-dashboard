import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { IntaSend } from 'npm:intasend-node'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }

  try {
    console.log('Processing withdrawal request...')
    const { amount, phoneNumber } = await req.json()
    console.log('Request data:', { amount, phoneNumber })

    // Validate input
    if (!amount || !phoneNumber) {
      throw new Error('Amount and phone number are required')
    }

    // Clean phone number to ensure only digits
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '')
    
    const apiKey = Deno.env.get("INTASEND_API_KEY")
    const secretKey = Deno.env.get("INTASEND_SECRET_KEY")
    
    if (!apiKey || !secretKey) {
      throw new Error('IntaSend configuration is missing')
    }

    console.log('Initializing IntaSend client...')
    const intasend = new IntaSend({
      token: apiKey,
      publishableKey: secretKey,
      test: false
    })

    console.log('Creating payout request...')
    const payouts = intasend.payouts()
    
    const payoutData = {
      currency: 'KES',
      requires_approval: 'NO',
      transactions: [{
        name: 'Customer',
        account: cleanPhoneNumber,
        amount: parseFloat(amount).toFixed(2),
        narrative: 'Wallet withdrawal'
      }]
    }
    
    console.log('Sending payout request with data:', payoutData)
    const payoutResponse = await payouts.mpesa(payoutData)
    console.log('Payout response:', payoutResponse)

    // Approve the transaction automatically
    const approvalResponse = await payouts.approve(payoutResponse)
    console.log('Approval response:', approvalResponse)

    return new Response(
      JSON.stringify({
        success: true,
        data: approvalResponse
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing withdrawal:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Failed to process withdrawal',
        details: error.message
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500 
      }
    )
  }
})