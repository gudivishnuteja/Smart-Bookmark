'use client'

function getDomain(url) {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return u.hostname.replace('www.', '')
  } catch {
    return 'link'
  }
}

function getInitials(domain) {
  const parts = domain.split('.')
  if (parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return domain.slice(0, 2).toUpperCase()
}

function formatDateAdded(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

export default function BookmarkCard({ bookmark, onDelete, onEdit, onClick }) {
  const domain = getDomain(bookmark.url)
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

  return (
    <div
      onClick={() => onClick?.(bookmark)}
      className="group relative w-[350px] max-w-full bg-white rounded-2xl p-4 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer flex items-center gap-4"
    >
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(bookmark.id)
          }}
          className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
          aria-label="Delete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit?.(bookmark)
          }}
          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition"
          aria-label="Edit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      </div>

      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden relative">
        <img
          src={favicon}
          alt=""
          className="w-6 h-6 object-contain"
          onError={(e) => {
            e.target.style.display = 'none'
            const fallback = e.target.parentElement?.querySelector('.favicon-fallback')
            if (fallback) fallback.classList.remove('hidden')
          }}
        />
        <span className="favicon-fallback hidden absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-600">
          {getInitials(domain)}
        </span>
      </div>

      <div className="flex-1 min-w-0 pr-12">
        <h3 className="font-bold text-gray-900 truncate leading-tight">
          {bookmark.title || 'Untitled'}
        </h3>
        <p className="text-sm text-gray-500 truncate mt-1">
          {domain}
        </p>
        {bookmark.created_at && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            {formatDateAdded(bookmark.created_at)}
          </p>
        )}
      </div>
    </div>
  )
}
