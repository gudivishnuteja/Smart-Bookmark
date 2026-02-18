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
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: "http://localhost:3000/dashboard"
      }
    })
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="backdrop-blur-2xl bg-white/10 border border-white/20 p-12 rounded-3xl shadow-2xl w-[400px] text-center">
        <h1 className="text-4xl font-bold mb-4">Smart Bookmark</h1>
        <p className="text-gray-400 mb-8">Premium Bookmark Manager</p>

        <button
          onClick={login}
          className="w-full bg-white text-black py-3 rounded-2xl font-semibold hover:scale-105 transition"
        >
          Continue with Google
        </button>
      </div>
    </div>
  )
}
