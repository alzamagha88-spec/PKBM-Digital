'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function LandingPage() {
  const [stats, setStats] = useState({ siswa: 0, guru: 0 })

  // Ngambil data statistik asli dari Supabase
  useEffect(() => {
    async function fetchStats() {
      const { count: countSiswa } = await supabase
        .from('siswa')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aktif')

      const { count: countGuru } = await supabase
        .from('guru')
        .select('*', { count: 'exact', head: true })

      setStats({
        siswa: countSiswa || 0,
        guru: countGuru || 0,
      })
    }
    fetchStats()
  }, [])

  return (
    <div className="bg-gray-50">
      {/* 1. HERO SECTION (Banner Utama) */}
      <section className="relative bg-blue-900 text-white">
        {/* Gambar Background (Bisa diganti nanti pakai foto gedung sekolah asli) */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center text-center">
          <span className="bg-yellow-500 text-blue-900 text-sm font-bold px-4 py-1 rounded-full mb-6">
            Penerimaan Peserta Didik Baru Telah Dibuka!
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Selamat Datang di <br className="hidden md:block" />
            <span className="text-yellow-400">PKBM Digital</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl">
            Raih ijazah setara SD, SMP, dan SMA dengan sistem pembelajaran yang fleksibel, inklusif, dan berkarakter.
          </p>
          <div className="flex gap-4">
            <Link href="/daftar" className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold px-8 py-4 rounded-lg text-lg transition shadow-lg">
              Daftar Sekarang
            </Link>
            <a href="#profil" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold px-8 py-4 rounded-lg text-lg transition">
              Lihat Profil
            </a>
          </div>
        </div>
      </section>

      {/* 2. SAMBUTAN KEPALA SEKOLAH (Persis Referensi) */}
      <section id="profil" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            
            {/* Foto & Bingkai Kuning-Biru */}
            <div className="relative flex justify-center">
              {/* Bingkai Biru */}
              <div className="absolute inset-0 bg-blue-700 translate-x-4 translate-y-4 rounded-lg"></div>
              {/* Bingkai Kuning */}
              <div className="absolute inset-0 border-4 border-yellow-400 -translate-x-4 -translate-y-4 rounded-lg"></div>
              {/* Gambar (Ganti src nanti pakai foto bapak lu) */}
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop" 
                alt="Kepala Sekolah" 
                className="relative z-10 w-full max-w-sm rounded-lg shadow-xl object-cover aspect-[3/4]"
              />
            </div>

            {/* Teks Sambutan */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sambutan Kepala Sekolah</h2>
              <div className="w-20 h-1 bg-yellow-400 mb-6"></div>
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Assalaamu'alaikum Warahmatullahi Wabarakatuh.</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Puji syukur kita panjatkan ke hadirat Tuhan Yang Maha Esa. Selamat datang di website resmi PKBM Digital. Website ini kami hadirkan sebagai jembatan informasi antara sekolah, peserta didik, dan masyarakat luas.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Kami berkomitmen untuk terus memberikan pelayanan pendidikan terbaik, menciptakan lingkungan belajar yang inklusif, serta mencetak lulusan yang siap bersaing di era digital.
              </p>
              <div>
                <p className="font-bold text-gray-900">Bapak/Ibu Kepala PKBM</p>
                <p className="text-gray-500 text-sm">Pendiri & Pengelola</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. STATISTIK SEKOLAH (Otomatis dari Database) */}
      <section className="py-16 bg-blue-900 relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Data Statistik Sekolah</h2>
            <p className="text-blue-200 mt-2">Informasi jumlah pendidik dan peserta didik secara real-time</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-yellow-500 rounded-xl p-8 text-center text-blue-900 shadow-lg">
              <div className="text-5xl mb-4">👨‍🎓</div>
              <div className="text-4xl font-extrabold mb-2">{stats.siswa}</div>
              <div className="font-semibold uppercase tracking-wide text-sm">Siswa Aktif</div>
            </div>
            
            <div className="bg-yellow-500 rounded-xl p-8 text-center text-blue-900 shadow-lg">
              <div className="text-5xl mb-4">👨‍🏫</div>
              <div className="text-4xl font-extrabold mb-2">{stats.guru}</div>
              <div className="font-semibold uppercase tracking-wide text-sm">Tenaga Pendidik</div>
            </div>

            <div className="bg-yellow-500 rounded-xl p-8 text-center text-blue-900 shadow-lg">
              <div className="text-5xl mb-4">🏫</div>
              <div className="text-4xl font-extrabold mb-2">3</div>
              <div className="font-semibold uppercase tracking-wide text-sm">Program Paket</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROGRAM BELAJAR (Paket A, B, C) */}
      <section id="program" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Program Pembelajaran</h2>
            <div className="w-20 h-1 bg-yellow-400 mx-auto mt-4 mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">Kami menyediakan tiga program pendidikan kesetaraan yang diakui negara.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Paket A */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Paket A</h3>
              <p className="text-sm text-blue-600 font-semibold mb-4">Setara Sekolah Dasar (SD)</p>
              <p className="text-gray-600 text-sm leading-relaxed">Program pendidikan dasar untuk membekali peserta didik dengan kemampuan dasar literasi dan numerasi.</p>
            </div>

            {/* Paket B */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Paket B</h3>
              <p className="text-sm text-blue-600 font-semibold mb-4">Setara Sekolah Menengah Pertama (SMP)</p>
              <p className="text-gray-600 text-sm leading-relaxed">Mempersiapkan lulusan yang memiliki pengetahuan, keterampilan, dan sikap sebagai warga negara yang baik.</p>
            </div>

            {/* Paket C */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Paket C</h3>
              <p className="text-sm text-blue-600 font-semibold mb-4">Setara Sekolah Menengah Atas (SMA)</p>
              <p className="text-gray-600 text-sm leading-relaxed">Mempersiapkan peserta didik untuk melanjutkan ke jenjang pendidikan tinggi atau dunia kerja.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}