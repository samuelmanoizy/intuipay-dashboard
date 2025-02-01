import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber, amount } = await req.json()
    
    const transactions = [{
      account: phoneNumber,
      amount: amount.toString()
    }]

    const response = await fetch('https://sandbox.intasend.com/api/v1/payment/transfer/', {
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

    const data = await response.json()

    // Approve the transfer
    if (data.tracking_id) {
      const approveResponse = await fetch(`https://sandbox.intasend.com/api/v1/payment/transfer/${data.tracking_id}/approve/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('INTASEND_SECRET_KEY')}`
        }
      })
      
      const approveData = await approveResponse.json()
      return new Response(JSON.stringify(approveData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})