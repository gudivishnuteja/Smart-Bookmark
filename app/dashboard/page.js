'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import AddBookmarkModal from "@/components/AddBookmarkModal"
import EditBookmarkModal from "@/components/EditBookmarkModal"
import BookmarkCard from "@/components/BookmarkCard"
import SortDropdown from "@/components/SortDropdown"
import * as XLSX from "xlsx"

const FOLDERS = [
  { id: 'all', label: 'All Bookmarks', icon: 'settings' },
  { id: 'General', label: 'General', icon: 'folder' },
  { id: 'Reading List', label: 'Reading List', icon: 'docs' },
  { id: 'Work', label: 'Work', icon: 'briefcase' },
  { id: 'Personal', label: 'Personal', icon: 'person' },
]

export default function Dashboard() {

  const [bookmarks, setBookmarks] = useState([])
  const [user, setUser] = useState(null)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("alphabet")
  const [selectedFolder, setSelectedFolder] = useState("all")
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Wait for Supabase to process OAuth callback (hash with access_token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user)
        } else if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
          // Don't redirect if URL has OAuth tokens (Supabase still processing)
          const hasAuthHash = typeof window !== 'undefined' &&
            /[#&](access_token|refresh_token)=/.test(window.location.hash)
          if (hasAuthHash) return

          const { data } = await supabase.auth.getSession()
          if (!data.session) window.location.href = "/"
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) fetchBookmarks()
  }, [user])

  async function fetchBookmarks() {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    setBookmarks(data || [])
  }

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  async function addBookmark(newBookmark) {
    if (!user) return

    await supabase.from('bookmarks').insert([
      {
        ...newBookmark,
        user_id: user.id,
        favorite: false,
        pinned: false,
        click_count: 0
      }
    ])

    fetchBookmarks()
  }

  async function deleteBookmark(id) {
    await supabase.from('bookmarks').delete().eq('id', id)
    fetchBookmarks()
  }

  async function updateBookmark(id, { title, url, category }) {
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`
    await supabase
      .from('bookmarks')
      .update({ title, url: formattedUrl, category })
      .eq('id', id)
    fetchBookmarks()
    setEditModalOpen(false)
    setEditingBookmark(null)
  }

  async function incrementClick(id, count) {
    const { error } = await supabase
      .from('bookmarks')
      .update({ click_count: (count || 0) + 1 })
      .eq('id', id)
    if (!error) fetchBookmarks()
  }

  function exportExcel() {
    const formatted = bookmarks.map(b => ({
      Title: b.title,
      URL: b.url,
      Category: b.category,
      Pinned: b.pinned ? "Yes" : "No",
      Favorite: b.favorite ? "Yes" : "No",
      Clicks: b.click_count || 0,
      Created: b.created_at
    }))

    const ws = XLSX.utils.json_to_sheet(formatted)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Bookmarks")
    XLSX.writeFile(wb, "bookmarks.xlsx")
  }

  let filtered = bookmarks.filter((b) => {
    const matchesSearch = (b.title || "").toLowerCase().includes(search.toLowerCase())
    const matchesFolder = selectedFolder === 'all' || (b.category || 'General') === selectedFolder
    return matchesSearch && matchesFolder
  })

  filtered.sort((a, b) => {
    if ((a.pinned || false) !== (b.pinned || false)) {
      return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
    }
    if (sort === "alphabet")
      return (a.title || "").localeCompare(b.title || "")
    if (sort === "newest")
      return new Date(b.created_at || 0) - new Date(a.created_at || 0)
    if (sort === "oldest")
      return new Date(a.created_at || 0) - new Date(b.created_at || 0)
    return 0
  })

  const handleBookmarkClick = (bookmark) => {
    incrementClick(bookmark.id, bookmark.click_count)
    window.open(bookmark.url, '_blank')
  }

  const selectFolder = (id) => {
    setSelectedFolder(id)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a2e] text-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Header */}
      <header className="border-b border-white/10 px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/5 transition touch-manipulation"
                aria-label="Open menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <h1 className="text-base sm:text-xl font-semibold truncate">Smart Bookmarks</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => setAddModalOpen(true)}
                className="md:hidden p-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition touch-manipulation"
                aria-label="Add bookmark"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-medium">{user?.user_metadata?.full_name?.[0] || 'U'}</span>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-lg hover:bg-white/5 transition touch-manipulation"
                  aria-label="Account menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                    <div className="absolute right-0 top-full mt-1 py-2 w-52 bg-[#252538] border border-white/10 rounded-lg shadow-xl z-[110]">
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); logout() }}
                        className="w-full px-4 py-3 min-h-[48px] text-left text-base font-medium text-red-400 hover:bg-white/10 active:bg-white/15 rounded-lg touch-manipulation flex items-center gap-3"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
              >
                Add New Bookmark
              </button>
              <button
                onClick={exportExcel}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-medium transition"
              >
                Export
              </button>
            </div>
            <div className="relative flex-1 min-w-0 max-w-full md:max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                placeholder="Search bookmarks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 md:py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 outline-none focus:border-blue-500/50 text-base"
              />
            </div>
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={exportExcel}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-sm font-medium transition touch-manipulation"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar - desktop always visible, mobile as drawer */}
        <aside
          className={`
            fixed md:relative inset-y-0 left-0 z-50 w-full sm:w-72 md:w-56 max-w-sm md:max-w-none
            border-r border-white/10 py-6 px-5 bg-[#1a1a2e]
            transform transition-transform duration-200 ease-out
            md:transform-none md:flex-shrink-0
            ${sidebarOpen ? 'translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="flex items-center justify-between mb-4 md:mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Folders</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400"
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <nav className="space-y-1">
            {FOLDERS.map((folder) => (
              <button
                key={folder.id}
                onClick={() => selectFolder(folder.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition touch-manipulation ${
                  selectedFolder === folder.id
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {folder.icon === 'folder' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                )}
                {folder.icon === 'settings' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                )}
                {folder.icon === 'docs' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                )}
                {folder.icon === 'briefcase' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                )}
                {folder.icon === 'person' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{folder.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content - hidden when mobile sidebar is open so Sort doesn't appear inside drawer */}
        <main
          className={`
            flex-1 p-4 sm:p-6 md:p-8 overflow-auto min-w-0
            md:block
            ${sidebarOpen ? 'hidden md:block' : 'block'}
          `}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-lg font-semibold">
              List Bookmarks
            </h2>
            <SortDropdown value={sort} onChange={setSort} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
            {filtered.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onDelete={deleteBookmark}
                onEdit={(b) => { setEditingBookmark(b); setEditModalOpen(true) }}
                onClick={handleBookmarkClick}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p>No bookmarks yet.</p>
              <button
                onClick={() => setAddModalOpen(true)}
                className="mt-2 text-blue-400 hover:text-blue-300"
              >
                Add your first bookmark
              </button>
            </div>
          )}
        </main>
      </div>


      <AddBookmarkModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={addBookmark}
      />

      <EditBookmarkModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingBookmark(null) }}
        bookmark={editingBookmark}
        onUpdate={updateBookmark}
      />
    </div>
  )
}
