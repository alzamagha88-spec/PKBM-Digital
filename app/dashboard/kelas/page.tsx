'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Kelas = { id: number; nama_kelas: string; tingkat: string }

export default function KelasPage() {
  const [kelas, setKelas] = useState<Kelas[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  
  const [form, setForm] = useState({ nama_kelas: '', tingkat: 'A' })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase.from('kelas').select('*').order('tingkat')
    setKelas(data || [])
    setLoading(false)
  }

  function openTambah() {
    setEditId(null)
    setForm({ nama_kelas: '', tingkat: 'A' })
    setShowModal(true)
  }

  function openEdit(k: Kelas) {
    setEditId(k.id)
    setForm({ nama_kelas: k.nama_kelas, tingkat: k.tingkat || 'A' })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editId) {
      await supabase.from('kelas').update(form).eq('id', editId)
    } else {
      await supabase.from('kelas').insert(form)
    }
    setShowModal(false)
    fetchData()
  }

  async function handleHapus(id: number, nama: string) {
    if (!confirm(`Yakin hapus kelas "${nama}"? Siswa di kelas ini akan kehilangan kelasnya.`)) return
    await supabase.from('kelas').delete().eq('id', id)
    fetchData()
  }

  if (loading) return <div className="text-gray-500">Memuat...</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Kelas</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola Paket A, B, dan C.</p>
        </div>
        <button onClick={openTambah} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          + Tambah Kelas
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Nama Kelas / Paket</th>
              <th className="px-4 py-3 font-semibold">Tingkat</th>
              <th className="px-4 py-3 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kelas.map((k) => (
              <tr key={k.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{k.nama_kelas}</td>
                <td className="px-4 py-3">Paket {k.tingkat}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => openEdit(k)} className="text-blue-600 hover:text-blue-800 mr-3">✏️ Edit</button>
                  <button onClick={() => handleHapus(k.id, k.nama_kelas)} className="text-red-600 hover:text-red-800">🗑️ Hapus</button>
                </td>
              </tr>
            ))}
            {kelas.length === 0 && (
              <tr><td colSpan={3} className="text-center py-6 text-gray-400">Belum ada data kelas.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Kelas' : 'Tambah Kelas'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas</label>
                <input
                  type="text" required value={form.nama_kelas}
                  onChange={(e) => setForm({...form, nama_kelas: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cth: Paket B - Rombel 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Paket</label>
                <select value={form.tingkat} onChange={(e) => setForm({...form, tingkat: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="A">Paket A (Setara SD)</option>
                  <option value="B">Paket B (Setara SMP)</option>
                  <option value="C">Paket C (Setara SMA)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg transition">Batal</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}