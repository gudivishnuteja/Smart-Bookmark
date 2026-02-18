'use client'

import { useState } from "react"
import CategoryDropdown from "./CategoryDropdown"

export default function AddBookmarkForm({ onAdd }) {

  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [category, setCategory] = useState("General")

  function handleSubmit() {
    if (!title || !url) return

    const formattedUrl = url.startsWith("http")
      ? url
      : `https://${url}`

    onAdd({
      title,
      url: formattedUrl,
      category
    })

    setTitle("")
    setUrl("")
  }

  return (
    <div className="bg-white/10 border border-white/20 p-3 rounded-lg flex flex-wrap gap-2 items-center">

      <input
        placeholder="Title"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
        className="px-3 py-1 rounded bg-white/10 border border-white/20 text-xs outline-none flex-1"
      />

      <input
        placeholder="google.com"
        value={url}
        onChange={(e)=>setUrl(e.target.value)}
        className="px-3 py-1 rounded bg-white/10 border border-white/20 text-xs outline-none flex-1"
      />

      <CategoryDropdown
        value={category}
        onChange={setCategory}
      />

      <button
        onClick={handleSubmit}
        className="px-3 py-1 bg-white text-black rounded text-xs hover:scale-105 transition"
      >
        Add
      </button>

    </div>
  )
}
