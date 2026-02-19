'use client'

import { useState, useRef, useEffect } from "react"

export default function SortDropdown({ value, onChange }) {

  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  const options = [
    { label: "Alphabetical", value: "alphabet" },
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" }
  ]

  const selected = options.find(o => o.value === value)

  // ✅ close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative w-full sm:w-44 text-sm z-[9999] min-w-0">

      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 min-h-[44px] rounded-lg touch-manipulation 
                   bg-black/50 backdrop-blur-md 
                   border border-cyan-400/40 
                   text-white flex justify-between items-center
                   hover:border-cyan-400 transition"
      >
        Sort: {selected?.label}
        <span className={`transition ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-full 
                        bg-[#0f172a] border border-cyan-400/40 
                        rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.4)] 
                        animate-fadeIn">

          {options.map(option => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={`px-4 py-2 cursor-pointer transition
                ${value === option.value 
                  ? "bg-cyan-500/20 text-cyan-300" 
                  : "hover:bg-cyan-500/10 text-white"}`}
            >
              {option.label}
            </div>
          ))}

        </div>
      )}

    </div>
  )
}
