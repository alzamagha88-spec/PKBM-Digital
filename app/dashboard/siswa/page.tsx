'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

type Siswa = {
  id: number
  nisn: string
  nama: string
  kelas_id: number | null
  jenis_kelamin: 'L' | 'P' | null
  alamat: string | null
  no_hp_ortu: string | null
  status: string
}

type Kelas = {
  id: number
  nama_kelas: string
}

export default function SiswaPage() {
  const [siswa, setSiswa] = useState<Siswa[]>([])
  const [kelas, setKelas] = useState<Kelas[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  
  const [form, setForm] = useState({
    nisn: '',
    nama: '',
    kelas_id: '',
    jenis_kelamin: 'L' as 'L' | 'P',
    alamat: '',
    no_hp_ortu: '',
    status: 'aktif',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: siswaData, error: siswaErr } = await supabase
      .from('siswa')
      .select('*')
      .order('nama')
    const { data: kelasData } = await supabase.from('kelas').select('*')

    if (siswaErr) {
      console.error('Error fetch siswa:', siswaErr)
    } else {
      setSiswa(siswaData || [])
    }
    setKelas(kelasData || [])
    setLoading(false)
  }

  function openTambah() {
    setEditId(null)
    setForm({
      nisn: '',
      nama: '',
      kelas_id: '',
      jenis_kelamin: 'L',
      alamat: '',
      no_hp_ortu: '',
      status: 'aktif',
    })
    setShowModal(true)
  }

  function openEdit(s: Siswa) {
    setEditId(s.id)
    setForm({
      nisn: s.nisn,
      nama: s.nama,
      kelas_id: s.kelas_id?.toString() || '',
      jenis_kelamin: (s.jenis_kelamin || 'L') as 'L' | 'P',
      alamat: s.alamat || '',
      no_hp_ortu: s.no_hp_ortu || '',
      status: s.status,
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      nisn: form.nisn,
      nama: form.nama,
      kelas_id: form.kelas_id ? parseInt(form.kelas_id) : null,
      jenis_kelamin: form.jenis_kelamin,
      alamat: form.alamat || null,
      no_hp_ortu: form.no_hp_ortu || null,
      status: form.status,
    }

    if (editId) {
      const { error } = await supabase.from('siswa').update(payload).eq('id', editId)
      if (error) return alert('Error: ' + error.message)
    } else {
      const { error } = await supabase.from('siswa').insert(payload)
      if (error) return alert('Error: ' + error.message)
    }

    setShowModal(false)
    fetchData()
  }

  async function handleHapus(id: number, nama: string) {
    if (!confirm(`Yakin hapus siswa "${nama}"?`)) return
    const { error } = await supabase.from('siswa').delete().eq('id', id)
    if (error) return alert('Error: ' + error.message)
    fetchData()
  }

  function exportExcel() {
    const dataExport = siswa.map((s) => ({
      NISN: s.nisn,
      Nama: s.nama,
      Kelas: kelas.find((k) => k.id === s.kelas_id)?.nama_kelas || '-',
      'Jenis Kelamin': s.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      Alamat: s.alamat || '-',
      'No HP Ortu': s.no_hp_ortu || '-',
      Status: s.status,
    }))

    const ws = XLSX.utils.json_to_sheet(dataExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa')
    XLSX.writeFile(wb, `Data_Siswa_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const filtered = siswa.filter(
    (s) =>
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.nisn.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="text-gray-500">Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Siswa</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total: {siswa.length} siswa
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportExcel}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
          >
            📊 Export Excel
          </button>
          <button
            onClick={openTambah}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
          >
            + Tambah Siswa
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <input
          type="text"
          placeholder="🔍 Cari nama atau NISN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">No</th>
                <th className="px-4 py-3 text-left font-semibold">NISN</th>
                <th className="px-4 py-3 text-left font-semibold">Nama</th>
                <th className="px-4 py-3 text-left font-semibold">Kelas</th>
                <th className="px-4 py-3 text-left font-semibold">JK</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    {search ? 'Siswa tidak ditemukan' : 'Belum ada data siswa'}
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{s.nisn}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{s.nama}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {kelas.find((k) => k.id === s.kelas_id)?.nama_kelas || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.jenis_kelamin || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.status === 'aktif' ? 'bg-green-100 text-green-700' :
                        s.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-blue-600 hover:text-blue-800 mr-3 text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleHapus(s.id, s.nama)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit/Tambah */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editId ? 'Edit Siswa' : 'Tambah Siswa'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NISN *
                </label>
                <input
                  type="text"
                  value={form.nisn}
                  onChange={(e) => setForm({ ...form, nisn: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kelas
                </label>
                <select
                  value={form.kelas_id}
                  onChange={(e) => setForm({ ...form, kelas_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {kelas.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama_kelas}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kelamin
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="L"
                      checked={form.jenis_kelamin === 'L'}
                      onChange={(e) => setForm({ ...form, jenis_kelamin: 'L' })}
                    />
                    Laki-laki
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="P"
                      checked={form.jenis_kelamin === 'P'}
                      onChange={(e) => setForm({ ...form, jenis_kelamin: 'P' })}
                    />
                    Perempuan
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat
                </label>
                <textarea
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No HP Orang Tua
                </label>
                <input
                  type="text"
                  value={form.no_hp_ortu}
                  onChange={(e) => setForm({ ...form, no_hp_ortu: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="pending">Pending (Calon Siswa)</option>
                  <option value="aktif">Aktif</option>
                  <option value="lulus">Lulus</option>
                  <option value="mutasi">Mutasi</option>
                  <option value="keluar">Keluar</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
                >
                  {editId ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}