import Link from 'next/link'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* NAVBAR ATAS */}
      <header className="bg-white shadow-sm sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo & Nama Sekolah */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                P
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 leading-tight">PKBM Digital</h1>
                <p className="text-xs text-gray-500">Pusat Kegiatan Belajar Masyarakat</p>
              </div>
            </Link>

            {/* Menu Navigasi */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium">Beranda</Link>
              <Link href="#profil" className="text-gray-600 hover:text-blue-600 font-medium">Profil</Link>
              <Link href="#program" className="text-gray-600 hover:text-blue-600 font-medium">Program</Link>
              <Link href="/daftar" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition shadow-sm">
                Daftar PPDB
              </Link>
              <Link href="/login" className="text-gray-400 hover:text-gray-700 text-sm">
                Login Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-grow">
        {children}
      </main>

      {/* FOOTER SERIUS */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            
            {/* 1. Profil Singkat */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  P
                </div>
                <h2 className="text-xl font-bold">PKBM Digital</h2>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Pusat Kegiatan Belajar Masyarakat yang menyediakan pendidikan kesetaraan Paket A, B, dan C dengan sistem pembelajaran fleksibel dan inklusif.
              </p>
              {/* Sosmed */}
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-sm hover:bg-blue-600 transition">IG</a>
                <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-sm hover:bg-blue-600 transition">YT</a>
                <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-sm hover:bg-blue-600 transition">FB</a>
              </div>
            </div>

            {/* 2. Tautan Cepat */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-yellow-400">Tautan Cepat</h3>
              <ul className="text-gray-400 text-sm space-y-3">
                <li><Link href="/" className="hover:text-white transition">Beranda</Link></li>
                <li><Link href="#profil" className="hover:text-white transition">Profil Sekolah</Link></li>
                <li><Link href="#program" className="hover:text-white transition">Program Belajar</Link></li>
                <li><Link href="/daftar" className="hover:text-white transition">Pendaftaran PPDB</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Login Guru / Admin</Link></li>
              </ul>
            </div>

            {/* 3. Hubungi Kami */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-yellow-400">Hubungi Kami</h3>
              <ul className="text-gray-400 text-sm space-y-4">
                <li className="flex gap-3 items-start">
                  <span className="text-lg">📍</span>
                  <span>Jl Al Ikhlas, RT.4/RW.7, Dusun IV, Kembangan, Kec. Bukateja, Kabupaten Purbalingga, Jawa Tengah 53382</span>
                </li>
                <li className="flex gap-3 items-center">
                  <span className="text-lg">📞</span>
                  <span>0812-8870-1853</span>
                </li>
                <li className="flex gap-3 items-center">
                  <span className="text-lg">✉️</span>
                  <span>info@pkbm-digital.sch.id</span>
                </li>
              </ul>
            </div>

            {/* 4. Google Maps */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-yellow-400">Lokasi Sekolah</h3>
              <div className="w-full h-40 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                {/* GANTI SRC IFRAME DI BAWAH INI DENGAN LINK GOOGLE MAPS SEKOLAH LU */}
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1663.3586039596328!2d109.44581257852388!3d-7.448012207473214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6551b7914f1913%3A0x809b19cd487155e!2sPKBM%20Sentosa%20Bukateja!5e0!3m2!1sid!2sid!4v1793086510480!5m2!1sid!2sid"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

          </div>

          {/* Garis Pemisah & Copyright */}
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; 2026 PKBM Digital. Hak Cipta Dilindungi.</p>
            <p>Dibuat dengan ❤️ untuk Pendidikan Indonesia.</p>
          </div>

        </div>
      </footer>
      
    </div>
  )
}