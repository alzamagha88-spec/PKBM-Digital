'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Kelas = { id: number; nama_kelas: string }
type Siswa = { id: number; nama: string }

export default function AbsensiPage() {
  const [kelas, setKelas] = useState<Kelas[]>([])
  const [selectedKelas, setSelectedKelas] = useState('')
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0])
  const [siswa, setSiswa] = useState<Siswa[]>([])
  const [absensi, setAbsensi] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchKelas()
  }, [])

  async function fetchKelas() {
    const { data } = await supabase.from('kelas').select('*')
    setKelas(data || [])
  }

  async function fetchSiswa() {
    if (!selectedKelas) return
    setLoading(true)
    setMessage('')
    
    // 1. Ambil data siswa di kelas tersebut yang statusnya AKTIF
    const { data: dataSiswa } = await supabase
      .from('siswa')
      .select('id, nama')
      .eq('kelas_id', selectedKelas)
      .eq('status', 'aktif')
      .order('nama')
    
    setSiswa(dataSiswa || [])

    // 2. Cek apakah absensi untuk tanggal & kelas ini sudah pernah diisi
    const { data: dataAbsensi } = await supabase
      .from('absensi')
      .select('siswa_id, status')
      .eq('kelas_id', selectedKelas)
      .eq('tanggal', tanggal)

    const mapAbsensi: Record<number, string> = {}
    
    // Kalau udah ada, tampilkan yang lama. Kalau belum, set default 'hadir'
    dataSiswa?.forEach((s) => {
      const existing = dataAbsensi?.find((a) => a.siswa_id === s.id)
      mapAbsensi[s.id] = existing ? existing.status : 'hadir'
    })

    setAbsensi(mapAbsensi)
    setLoading(false)
  }

  function handleStatusChange(siswaId: number, status: string) {
    setAbsensi((prev) => ({ ...prev, [siswaId]: status }))
  }

  async function simpanAbsensi() {
    if (!selectedKelas || siswa.length === 0) return
    setLoading(true)

    // Siapin data buat di-insert
    const payload = siswa.map((s) => ({
      siswa_id: s.id,
      kelas_id: parseInt(selectedKelas),
      tanggal: tanggal,
      status: absensi[s.id] || 'hadir',
    }))

    // Hapus dulu data di tanggal & kelas itu (biar kalau edit, nggak dobel)
    const { error: delError } = await supabase
      .from('absensi')
      .delete()
      .eq('kelas_id', selectedKelas)
      .eq('tanggal', tanggal)

    if (delError) {
      alert('Gagal reset absensi: ' + delError.message)
      setLoading(false)
      return
    }

    // Insert data yang baru
    const { error: insError } = await supabase.from('absensi').insert(payload)

    if (insError) {
      alert('Gagal simpan absensi: ' + insError.message)
    } else {
      setMessage('✅ Absensi berhasil disimpan!')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Absensi Siswa</h1>
        <p className="text-gray-500 text-sm mt-1">Pilih kelas dan tanggal untuk mulai absen.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Pilih Kelas --</option>
            {kelas.map((k) => (
              <option key={k.id} value={k.id}>{k.nama_kelas}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={fetchSiswa}
          disabled={!selectedKelas}
          className="bg-gray-800 hover:bg-gray-900 text-white font-medium px-6 py-2 rounded-lg transition disabled:opacity-50"
        >
          Tampilkan
        </button>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 font-medium">
          {message}
        </div>
      )}

      {siswa.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold w-12 text-center">No</th>
                  <th className="px-4 py-3 font-semibold">Nama Siswa</th>
                  <th className="px-4 py-3 font-semibold text-center">Hadir</th>
                  <th className="px-4 py-3 font-semibold text-center">Sakit</th>
                  <th className="px-4 py-3 font-semibold text-center">Izin</th>
                  <th className="px-4 py-3 font-semibold text-center">Alpha</th>
                </tr>
              </thead>
              <tbody>
                {siswa.map((s, i) => (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-center text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{s.nama}</td>
                    {['hadir', 'sakit', 'izin', 'alpha'].map((status) => (
                      <td key={status} className="px-4 py-3 text-center">
                        <input
                          type="radio"
                          name={`status-${s.id}`}
                          checked={absensi[s.id] === status}
                          onChange={() => handleStatusChange(s.id, status)}
                          className="w-5 h-5 cursor-pointer accent-blue-600"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
            <button
              onClick={simpanAbsensi}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Absensi'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}