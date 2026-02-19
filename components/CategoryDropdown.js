'use client'

import { useState, useRef, useEffect } from "react"

export default function CategoryDropdown({ value, onChange }) {

  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const categories = ["General", "Reading List", "Work", "Personal"]

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative w-32 text-sm">

      {/* Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2.5 min-h-[44px] bg-gray-800 border border-white/20 rounded-lg text-white flex justify-between items-center touch-manipulation"
      >
        {value}
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-gray-900 border border-white/20 rounded shadow-xl z-[9999]">

          {categories.map(cat => (
            <div
              key={cat}
              onClick={() => {
                onChange(cat)
                setOpen(false)
              }}
              className="px-3 py-2.5 min-h-[44px] flex items-center hover:bg-gray-700 cursor-pointer text-white transition touch-manipulation"
            >
              {cat}
            </div>
          ))}

        </div>
      )}

    </div>
  )
}
