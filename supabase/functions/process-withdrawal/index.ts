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
    console.log('Processing withdrawal:', { phoneNumber, amount })

    const transactions = [{
      account: phoneNumber,
      amount: amount.toString()
    }]

    // First create the transfer using live API
    const createResponse = await fetch('https://sandbox.intasend.com/api/v1/send-money/initiate/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('INTASEND_SECRET_KEY')}`
      },
      body: JSON.stringify({
        currency: "KES",
        transactions: transactions
      })
    })

    if (!createResponse.ok) {
      const errorData = await createResponse.text()
      console.error('Transfer creation failed:', errorData)
      throw new Error(`Transfer creation failed: ${errorData}`)
    }

    const createData = await createResponse.json()
    console.log('Transfer created:', createData)

    if (!createData.invoice.id) {
      throw new Error('No invoice ID received from transfer creation')
    }

    // Then approve the transfer using live API
    const approveResponse = await fetch(`https://sandbox.intasend.com/api/v1/send-money/${createData.invoice.id}/process/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('INTASEND_SECRET_KEY')}`
      }
    })

    if (!approveResponse.ok) {
      const errorData = await approveResponse.text()
      console.error('Transfer approval failed:', errorData)
      throw new Error(`Transfer approval failed: ${errorData}`)
    }

    const approveData = await approveResponse.json()
    console.log('Transfer approved:', approveData)

    return new Response(JSON.stringify(approveData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Withdrawal processing error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})