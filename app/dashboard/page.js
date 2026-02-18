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

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) fetchBookmarks()
  }, [user])

  async function checkUser() {
    const { data } = await supabase.auth.getUser()
    if (!data.user) window.location.href = "/"
    else setUser(data.user)
  }

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

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a2e] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Smart Bookmarks App</h1>
          <div className="flex items-center gap-4">
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
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                placeholder="Search bookmarks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium">
                    {user?.user_metadata?.full_name?.[0] || 'U'}
                  </span>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-lg hover:bg-white/5 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 py-2 w-48 bg-[#252538] border border-white/10 rounded-lg shadow-xl z-50">
                      <button
                        onClick={() => { logout(); setMenuOpen(false) }}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 border-r border-white/10 py-6 px-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Folders</h2>
          <nav className="space-y-1">
            {FOLDERS.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${
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

        {/* Main content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              List Bookmarks
            </h2>
            <SortDropdown value={sort} onChange={setSort} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-start">
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
