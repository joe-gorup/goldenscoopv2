import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create admin user
    const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@goldenscoop.com',
      password: 'password',
      email_confirm: true
    })

    if (adminError && !adminError.message.includes('already registered')) {
      throw adminError
    }

    // Create manager user
    const { data: managerUser, error: managerError } = await supabaseAdmin.auth.admin.createUser({
      email: 'manager@goldenscoop.com',
      password: 'password',
      email_confirm: true
    })

    if (managerError && !managerError.message.includes('already registered')) {
      throw managerError
    }

    // Insert user profiles if they don't exist
    if (adminUser?.user) {
      await supabaseAdmin
        .from('users')
        .upsert({
          id: adminUser.user.id,
          email: 'admin@goldenscoop.com',
          name: 'Admin User',
          role: 'admin',
          is_active: true
        })
    }

    if (managerUser?.user) {
      await supabaseAdmin
        .from('users')
        .upsert({
          id: managerUser.user.id,
          email: 'manager@goldenscoop.com',
          name: 'Shift Manager',
          role: 'shift_manager',
          is_active: true
        })
    }

    return new Response(
      JSON.stringify({ message: 'Demo users created successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})