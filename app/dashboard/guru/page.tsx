'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx' // <-- IMPORT EXCEL

type Guru = {
  id: string
  nip: string | null
  mapel_utama: string | null
  jabatan: string | null
  no_hp: string | null
  status: string
  profiles: {
    nama: string
    email: string
  } | null
}

export default function GuruPage() {
  const [guru, setGuru] = useState<Guru[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  const [showEditModal, setShowEditModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  const [form, setForm] = useState({
    nama: '', email: '', password: '',
    nip: '', mapel_utama: '', jabatan: 'Guru', no_hp: '', status: 'aktif',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data, error } = await supabase
      .from('guru')
      .select(`
        id, nip, mapel_utama, jabatan, no_hp, status,
        profiles ( nama, email )
      `)
    
    if (!error) setGuru(data as any || [])
    setLoading(false)
  }

  // --- FUNGSI TAMBAH GURU (Panggil API Route) ---
  async function handleTambahGuru(e: React.FormEvent) {
    e.preventDefault()
    setAddLoading(true)

    const res = await fetch('/api/guru', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        nama: form.nama,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert('Gagal nambah guru: ' + data.error)
    } else {
      alert('Akun guru berhasil dibuat!')
      setShowAddModal(false)
      setForm({ ...form, email: '', password: '', nama: '' })
      fetchData()
    }
    setAddLoading(false)
  }

  // --- FUNGSI EDIT GURU ---
  function openEdit(g: Guru) {
    setEditId(g.id)
    setForm({
      nama: g.profiles?.nama || '',
      email: g.profiles?.email || '',
      password: '', 
      nip: g.nip || '',
      mapel_utama: g.mapel_utama || '',
      jabatan: g.jabatan || 'Guru',
      no_hp: g.no_hp || '',
      status: g.status,
    })
    setShowEditModal(true)
  }

  async function handleEditGuru(e: React.FormEvent) {
    e.preventDefault()
    
    const { error: errProfile } = await supabase
      .from('profiles').update({ nama: form.nama }).eq('id', editId)
    if (errProfile) return alert(errProfile.message)

    const { error: errGuru } = await supabase
      .from('guru').update({
        nip: form.nip || null, mapel_utama: form.mapel_utama || null,
        jabatan: form.jabatan, no_hp: form.no_hp || null, status: form.status,
      }).eq('id', editId)

    if (errGuru) return alert(errGuru.message)
    
    setShowEditModal(false)
    fetchData()
  }

  // --- FUNGSI EXPORT EXCEL GURU ---
  function exportExcel() {
    const dataExport = guru.map((g) => ({
      NIP: g.nip || '-',
      Nama: g.profiles?.nama || '-',
      Email: g.profiles?.email || '-',
      'Mapel Utama': g.mapel_utama || '-',
      Jabatan: g.jabatan || '-',
      'No HP': g.no_hp || '-',
      Status: g.status,
    }))

    const ws = XLSX.utils.json_to_sheet(dataExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data Guru')
    XLSX.writeFile(wb, `Data_Guru_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const filtered = guru.filter(
    (g) => (g.profiles?.nama || '').toLowerCase().includes(search.toLowerCase()) || (g.nip && g.nip.includes(search))
  )

  if (loading) return <div className="text-gray-500">Memuat data...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Guru</h1>
          <p className="text-gray-500 text-sm mt-1">Total: {guru.length} guru</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
          >
            + Tambah Akun Guru
          </button>
          <button
            onClick={exportExcel} // <-- TOMBOL EXPORT UDAH JALAN
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
          >
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <input
          type="text"
          placeholder="🔍 Cari nama atau NIP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Nama / Email</th>
                <th className="px-4 py-3 font-semibold">NIP</th>
                <th className="px-4 py-3 font-semibold">Mapel</th>
                <th className="px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{g.profiles?.nama || '-'}</div>
                    <div className="text-gray-500 text-xs">{g.profiles?.email || '-'}</div>
                  </td>
                  <td className="px-4 py-3">{g.nip || '-'}</td>
                  <td className="px-4 py-3">{g.mapel_utama || '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(g)} className="text-blue-600 hover:text-blue-800 text-sm">✏️ Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH GURU */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 p-6 text-white text-center">
              <h2 className="text-2xl font-bold">Buat Akun Guru Baru</h2>
              <p className="text-blue-100 text-sm mt-1">Akun ini bisa langsung dipakai login.</p>
            </div>
            <form onSubmit={handleTambahGuru} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input type="text" required value={form.nama} onChange={(e) => setForm({...form, nama: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama Guru" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="guru@sekolah.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Sementara *</label>
                <input type="text" required minLength={6} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Minimal 6 karakter" />
                <p className="text-xs text-gray-500 mt-1">Kasih tau password ini ke guru ybs.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition">Batal</button>
                <button type="submit" disabled={addLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50">
                  {addLoading ? 'Memproses...' : 'Buat Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT GURU */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Edit Data Guru</h2>
            </div>
            <form onSubmit={handleEditGuru} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required className="w-full px-3 py-2 border rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                <input type="text" value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mapel Utama</label>
                <input type="text" value={form.mapel_utama} onChange={(e) => setForm({ ...form, mapel_utama: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg transition">Batal</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}