'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Kelas = { id: number; nama_kelas: string }

export default function PendaftaranPage() {
  const [loading, setLoading] = useState(false)
  const [sukses, setSukses] = useState(false)
  const [error, setError] = useState('')
  
  const [kelasList, setKelasList] = useState<Kelas[]>([])

  const [form, setForm] = useState({
    nisn: '',
    nama: '',
    kelas_id: '',
    jenis_kelamin: 'L',
    alamat: '',
    no_hp_ortu: '',
  })

  useEffect(() => {
    async function fetchKelas() {
      const { data } = await supabase.from('kelas').select('*').order('tingkat')
      setKelasList(data || [])
    }
    fetchKelas()
  }, [])

  // Validasi NISN (Hanya Angka)
  const handleNisnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    setForm({ ...form, nisn: val })
  }

  // Validasi Nama (Hanya Huruf & Spasi)
  const handleNamaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '')
    setForm({ ...form, nama: val })
  }

  // Validasi No HP (Hanya Angka)
  const handleHpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    setForm({ ...form, no_hp_ortu: val })
  }

  async function handleDaftar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.nisn.length < 4) {
      setError('NISN minimal harus 4 digit angka!')
      setLoading(false)
      return
    }
    if (form.no_hp_ortu.length < 10) {
      setError('Nomor HP minimal harus 10 digit angka!')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('siswa').insert({
      nisn: form.nisn,
      nama: form.nama,
      kelas_id: parseInt(form.kelas_id),
      jenis_kelamin: form.jenis_kelamin,
      alamat: form.alamat,
      no_hp_ortu: form.no_hp_ortu,
      status: 'pending',
    })

    if (error) {
      setError('Gagal mendaftar: ' + error.message)
      setLoading(false)
      return
    }

    setSukses(true)
    setLoading(false)
  }

  if (sukses) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pendaftaran Berhasil!</h1>
          <p className="text-gray-600 mb-6">
            Data Anda sudah masuk ke sistem kami sebagai <strong>Calon Siswa (Pending)</strong>. 
            Silakan datang ke kantor sekolah untuk verifikasi berkas agar status menjadi Aktif.
          </p>
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">Pendaftaran Siswa Baru</h1>
          <p className="text-gray-500 text-sm mt-1">PKBM Digital</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleDaftar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NISN *</label>
            <input
              type="text"
              required
              value={form.nisn}
              onChange={handleNisnChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Masukkan NISN"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
            <input
              type="text"
              required
              value={form.nama}
              onChange={handleNamaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Sesuai ijazah/akta"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Paket Belajar *</label>
            <select
              required
              value={form.kelas_id}
              onChange={(e) => setForm({ ...form, kelas_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="" disabled>-- Pilih Paket --</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>{k.nama_kelas}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="L"
                  checked={form.jenis_kelamin === 'L'}
                  onChange={(e) => setForm({ ...form, jenis_kelamin: 'L' })}
                  className="w-4 h-4 text-blue-600"
                />
                Laki-laki
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="P"
                  checked={form.jenis_kelamin === 'P'}
                  onChange={(e) => setForm({ ...form, jenis_kelamin: 'P' })}
                  className="w-4 h-4 text-blue-600"
                />
                Perempuan
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap *</label>
            <textarea
              required
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Alamat domisili saat ini"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No HP Orang Tua *</label>
            <input
              type="text"
              required
              value={form.no_hp_ortu}
              onChange={handleHpChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Contoh: 08123456789"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 mt-4"
          >
            {loading ? 'Mengirim Data...' : 'Daftar Sekarang'}
          </button>
        </form>
      </div>
    </main>
  )
}