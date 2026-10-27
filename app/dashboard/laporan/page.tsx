'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

type Kelas = { id: number; nama_kelas: string }
type Siswa = { id: number; nama: string; nisn: string }
type Rekap = {
  hadir: number
  sakit: number
  izin: number
  alpha: number
}

export default function LaporanPage() {
  const [kelas, setKelas] = useState<Kelas[]>([])
  const [selectedKelas, setSelectedKelas] = useState('')
  
  // Default bulan ini (format: YYYY-MM)
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7)) 
  
  const [siswa, setSiswa] = useState<Siswa[]>([])
  const [rekap, setRekap] = useState<Record<number, Rekap>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('kelas').select('*').then(({ data }) => setKelas(data || []))
  }, [])

  async function fetchLaporan() {
    if (!selectedKelas || !bulan) return
    setLoading(true)

    // 1. Ambil data siswa di kelas tersebut
    const { data: dataSiswa } = await supabase
      .from('siswa')
      .select('id, nama, nisn')
      .eq('kelas_id', selectedKelas)
      .eq('status', 'aktif')
      .order('nama')
    
    setSiswa(dataSiswa || [])

    if (!dataSiswa || dataSiswa.length === 0) {
      setRekap({})
      setLoading(false)
      return
    }

    // 2. Ambil data absensi di bulan tersebut
    const startDate = `${bulan}-01`
    const endDate = `${bulan}-31` // PostgreSQL handle auto-end of month

    const { data: dataAbsensi } = await supabase
      .from('absensi')
      .select('siswa_id, status')
      .eq('kelas_id', selectedKelas)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate)

    // 3. Hitung rekap per siswa
    const mapRekap: Record<number, Rekap> = {}
    
    dataSiswa.forEach(s => {
      mapRekap[s.id] = { hadir: 0, sakit: 0, izin: 0, alpha: 0 }
    })

    dataAbsensi?.forEach(a => {
      if (mapRekap[a.siswa_id]) {
        if (a.status === 'hadir') mapRekap[a.siswa_id].hadir++
        if (a.status === 'sakit') mapRekap[a.siswa_id].sakit++
        if (a.status === 'izin') mapRekap[a.siswa_id].izin++
        if (a.status === 'alpha') mapRekap[a.siswa_id].alpha++
      }
    })

    setRekap(mapRekap)
    setLoading(false)
  }

  function exportExcel() {
    const dataExport = siswa.map((s) => ({
      NISN: s.nisn,
      Nama: s.nama,
      Hadir: rekap[s.id]?.hadir || 0,
      Sakit: rekap[s.id]?.sakit || 0,
      Izin: rekap[s.id]?.izin || 0,
      Alpha: rekap[s.id]?.alpha || 0,
    }))

    const ws = XLSX.utils.json_to_sheet(dataExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Absensi')
    XLSX.writeFile(wb, `Rekap_Absensi_${bulan}.xlsx`)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Tombol Print disembunyiin pas di-print */}
      <div className="print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Laporan Absensi</h1>
            <p className="text-gray-500 text-sm mt-1">Rekap kehadiran siswa per bulan.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
            >
              <option value="">-- Pilih Kelas --</option>
              {kelas.map((k) => (
                <option key={k.id} value={k.id}>{k.nama_kelas}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
            <input
              type="month"
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>
          <button
            onClick={fetchLaporan}
            disabled={!selectedKelas || !bulan}
            className="bg-gray-800 hover:bg-gray-900 text-white font-medium px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            Tampilkan
          </button>
        </div>
      </div>

      {/* Area yang bakal di-print */}
      {siswa.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 print:shadow-none print:p-0">
          
          {/* Header Surat (Cuma muncul pas di-print) */}
          <div className="hidden print:block text-center mb-8">
            <h2 className="text-xl font-bold uppercase">Rekap Absensi Siswa</h2>
            <p className="text-gray-600">PKBM Digital - Bulan: {bulan}</p>
            <hr className="my-4 border-black" />
          </div>

          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700 print:bg-transparent">
              <tr>
                <th className="px-4 py-3 border border-gray-300 font-semibold w-12 text-center">No</th>
                <th className="px-4 py-3 border border-gray-300 font-semibold">NISN</th>
                <th className="px-4 py-3 border border-gray-300 font-semibold">Nama Siswa</th>
                <th className="px-4 py-3 border border-gray-300 font-semibold text-center">Hadir</th>
                <th className="px-4 py-3 border border-gray-300 font-semibold text-center">Sakit</th>
                <th className="px-4 py-3 border border-gray-300 font-semibold text-center">Izin</th>
                <th className="px-4 py-3 border border-gray-300 font-semibold text-center">Alpha</th>
              </tr>
            </thead>
            <tbody>
              {siswa.map((s, i) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 border border-gray-300 text-center">{i + 1}</td>
                  <td className="px-4 py-3 border border-gray-300">{s.nisn}</td>
                  <td className="px-4 py-3 border border-gray-300 font-medium">{s.nama}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center font-bold text-green-600 print:text-black">
                    {rekap[s.id]?.hadir || 0}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center font-bold text-yellow-600 print:text-black">
                    {rekap[s.id]?.sakit || 0}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center font-bold text-blue-600 print:text-black">
                    {rekap[s.id]?.izin || 0}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center font-bold text-red-600 print:text-black">
                    {rekap[s.id]?.alpha || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tanda Tangan (Cuma muncul pas di-print) */}
          <div className="hidden print:flex justify-end mt-16">
            <div className="text-center">
              <p className="mb-20">Mengetahui,<br/>Kepala Sekolah</p>
              <p className="font-bold underline">Bapak/Ibu Kepala PKBM</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end print:hidden">
             <button
              onClick={exportExcel}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
            >
              📊 Export Excel
            </button>
            <button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
            >
              🖨️ Cetak Laporan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}