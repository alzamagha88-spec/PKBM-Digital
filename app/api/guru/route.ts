import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// KONEKSI ADMIN (Hanya jalan di server, SERVICE_ROLE_KEY aman di sini)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const { email, password, nama } = await request.json()

    // 1. Bikin akun login di sistem Auth Supabase
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nama: nama } // Trigger database kita bakal otomatis bikin profil dari sini
    })

    if (userError) throw userError

    // 2. Daftarin juga ke tabel 'guru' biar muncul di halaman Data Guru
    const { error: guruError } = await supabaseAdmin
      .from('guru')
      .insert({ id: userData.user.id, status: 'aktif' })

    if (guruError) throw guruError

    return NextResponse.json({ message: 'Guru berhasil ditambahkan' }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}