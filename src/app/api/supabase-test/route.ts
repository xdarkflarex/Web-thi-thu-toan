import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anon) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing Supabase environment variables',
          details: {
            NEXT_PUBLIC_SUPABASE_URL: url ? 'present' : 'missing',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: anon ? 'present' : 'missing',
          },
        },
        { status: 500 }
      )
    }

    const supabase = createClient(url, anon)

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Unknown server error' },
      { status: 500 }
    )
  }
}


