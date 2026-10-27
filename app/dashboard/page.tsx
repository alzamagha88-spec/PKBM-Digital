'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    siswa: 0,
    guru: 0,
    absensiHariIni: 0,
    laporanBulanIni: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      // 1. Hitung Total Siswa (yang statusnya aktif)
      const { count: countSiswa } = await supabase
        .from('siswa')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aktif')

      // 2. Hitung Total Guru
      const { count: countGuru } = await supabase
        .from('guru')
        .select('*', { count: 'exact', head: true })

      // 3. Siapin tanggal hari ini & tanggal awal/akhir bulan (buat filter)
      const today = new Date().toISOString().split('T')[0]
      
      const firstDay = new Date()
      firstDay.setDate(1)
      const firstDayStr = firstDay.toISOString().split('T')[0]
      
      const lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0)
      const lastDayStr = lastDay.toISOString().split('T')[0]

      // 4. Hitung Absensi Hari Ini
      const { count: countAbsen } = await supabase
        .from('absensi')
        .select('*', { count: 'exact', head: true })
        .eq('tanggal', today)

      // 5. Hitung Total Absensi Bulan Ini (sebagai "Laporan Bulan Ini")
      const { count: countLaporan } = await supabase
        .from('absensi')
        .select('*', { count: 'exact', head: true })
        .gte('tanggal', firstDayStr)
        .lte('tanggal', lastDayStr)

      setStats({
        siswa: countSiswa || 0,
        guru: countGuru || 0,
        absensiHariIni: countAbsen || 0,
        laporanBulanIni: countLaporan || 0,
      })
      
      setLoading(false)
    }

    fetchStats()
  }, [])

  // Kartu statistik (bisa diklik biar langsung pindah ke halamannya)
  const statCards = [
    { title: 'Total Siswa Aktif', value: stats.siswa, icon: '👨‍🎓', href: '/dashboard/siswa' },
    { title: 'Total Guru', value: stats.guru, icon: '👨‍🏫', href: '/dashboard/guru' },
    { title: 'Absensi Hari Ini', value: stats.absensiHariIni, icon: '📅', href: '/dashboard/absensi' },
    { title: 'Data Bulan Ini', value: stats.laporanBulanIni, icon: '📄', href: '/dashboard/laporan' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-8">
        <h1 className="text-3xl font-bold">🎉 Selamat Datang!</h1>
        <p className="text-blue-100 mt-2">
          Ini dashboard admin PKBM Digital. Pantau data sekolah Anda dari sini.
        </p>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Link key={i} href={card.href}>
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer border border-transparent hover:border-blue-300">
              <div className="text-3xl mb-2">{card.icon}</div>
              <div className="text-3xl font-bold text-gray-800">
                {loading ? '...' : card.value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{card.title}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-yellow-800 mb-1">
            🚧 Ada Pendaftar Baru?
          </h3>
          <p className="text-yellow-700 text-sm">
            Cek menu Data Siswa untuk melihat pendaftar PPDB online dan ubah statusnya jadi "Aktif".
          </p>
        </div>
        <Link 
          href="/dashboard/siswa" 
          className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-medium px-4 py-2 rounded-lg transition text-sm whitespace-nowrap"
        >
          Cek Data Siswa
        </Link>
      </div>
    </div>
  )
}