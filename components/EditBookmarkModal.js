'use client'

import { useState, useEffect } from "react"
import CategoryDropdown from "./CategoryDropdown"

export default function EditBookmarkModal({ open, onClose, bookmark, onUpdate }) {

  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [category, setCategory] = useState("General")

  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title || "")
      setUrl(bookmark.url || "")
      setCategory(bookmark.category || "General")
    }
  }, [bookmark, open])

  function handleSubmit() {
    if (!title || !url || !bookmark) return

    const formattedUrl = url.startsWith("http")
      ? url
      : `https://${url}`

    onUpdate(bookmark.id, {
      title,
      url: formattedUrl,
      category
    })

    onClose()
  }

  if (!open || !bookmark) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#1e1e2e] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-white">Edit Bookmark</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Title</label>
            <input
              placeholder="Bookmark title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/20 text-white placeholder-gray-500 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">URL</label>
            <input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/20 text-white placeholder-gray-500 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Folder</label>
            <CategoryDropdown value={category} onChange={setCategory} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
