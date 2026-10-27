'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProfilPage() {
  const [passwordBaru, setPasswordBaru] = useState('')
  const [konfirmasi, setKonfirmasi] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  async function handleGantiPassword(e: React.FormEvent) {
    e.preventDefault()
    setMsg({ type: '', text: '' })

    if (passwordBaru !== konfirmasi) {
      return setMsg({ type: 'error', text: 'Password baru dan konfirmasi tidak cocok!' })
    }
    if (passwordBaru.length < 6) {
      return setMsg({ type: 'error', text: 'Password minimal 6 karakter!' })
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: passwordBaru })
    setLoading(false)

    if (error) {
      setMsg({ type: 'error', text: error.message })
    } else {
      setMsg({ type: 'success', text: '✅ Password berhasil diubah!' })
      setPasswordBaru('')
      setKonfirmasi('')
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan Akun</h1>
        <p className="text-gray-500 text-sm mt-1">Ganti password Anda secara berkala untuk keamanan.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {msg.text && (
          <div className={`p-3 mb-4 rounded-lg text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleGantiPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
            <input
              type="password"
              required
              value={passwordBaru}
              onChange={(e) => setPasswordBaru(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
            <input
              type="password"
              required
              value={konfirmasi}
              onChange={(e) => setKonfirmasi(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ulangi password baru"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Password'}
          </button>
        </form>
      </div>
    </div>
  )
}