'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// UDAH DITAMBAHIN MENU KELAS & PROFIL
const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Data Siswa', href: '/dashboard/siswa', icon: '👨‍🎓' },
  { name: 'Data Guru', href: '/dashboard/guru', icon: '👨‍🏫' },
  { name: 'Data Kelas', href: '/dashboard/kelas', icon: '🏫' },
  { name: 'Absensi', href: '/dashboard/absensi', icon: '📅' },
  { name: 'Laporan', href: '/dashboard/laporan', icon: '📄' },
  { name: 'Profil & Sandi', href: '/dashboard/profil', icon: '⚙️' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function cekUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)
      setLoading(false)
    }
    cekUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center">Memuat...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-blue-900 text-white z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} print:hidden`}>
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold">PKBM Digital</h1>
          <p className="text-blue-300 text-xs mt-1">Sistem Informasi Sekolah</p>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${pathname === item.href ? 'bg-blue-700 text-white font-medium' : 'text-blue-100 hover:bg-blue-800'}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800">
          <div className="text-xs text-blue-300 mb-2 truncate">{user?.email}</div>
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg transition">
            🚪 Logout
          </button>
        </div>
      </aside>
      <div className="lg:ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-30 print:hidden">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 text-2xl">☰</button>
            <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.email?.[0]?.toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}