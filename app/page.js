'use client'

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Home() {

  const router = useRouter()

  useEffect(() => {
    checkUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          router.push("/dashboard")
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function checkUser() {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      router.push("/dashboard")
    }
  }

  const login = async () => {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/dashboard`
      : 'http://localhost:3000/dashboard'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    })
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
      <div className="backdrop-blur-2xl bg-white/10 border border-white/20 p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-[400px] text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Smart Bookmark</h1>
        <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">Premium Bookmark Manager</p>

        <button
          onClick={login}
          className="w-full bg-white text-black py-3.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition touch-manipulation text-base"
        >
          Continue with Google
        </button>
      </div>
    </div>
  )
}
