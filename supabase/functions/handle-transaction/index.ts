import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TransactionRequest {
  amount: number
  type: 'deposit' | 'withdrawal'
  phone?: string
  name?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get the user from the authorization header
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    // Get the request body
    const { amount, type, phone, name }: TransactionRequest = await req.json()

    // Validate the request
    if (!amount || !type) {
      throw new Error('Missing required fields')
    }

    // Insert the transaction record
    const { data: transaction, error: insertError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        amount,
        type,
        recipient_phone: phone,
        recipient_name: name,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting transaction:', insertError)
      throw new Error('Failed to create transaction')
    }

    // Initialize IntaSend API
    const intasendApiKey = Deno.env.get('INTASEND_API_KEY')
    if (!intasendApiKey) {
      throw new Error('IntaSend API key not configured')
    }

    // Make request to IntaSend API
    const intasendUrl = type === 'withdrawal' 
      ? 'https://sandbox.intasend.com/api/v1/payment/mpesa-withdraw/'
      : 'https://sandbox.intasend.com/api/v1/payment/mpesa-stk-push/'

    const response = await fetch(intasendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${intasendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: phone,
        amount: amount,
        name: name,
        currency: 'KES'
      }),
    })

    const intasendResponse = await response.json()

    // Update transaction status based on IntaSend response
    const status = response.ok ? 'approved' : 'failed'
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({ status })
      .eq('id', transaction.id)

    if (updateError) {
      console.error('Error updating transaction:', updateError)
      throw new Error('Failed to update transaction status')
    }

    return new Response(
      JSON.stringify({ 
        success: response.ok,
        data: intasendResponse,
        transaction: transaction
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.ok ? 200 : 400
      }
    )

  } catch (error) {
    console.error('Error processing transaction:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})