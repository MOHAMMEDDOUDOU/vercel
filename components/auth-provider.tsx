"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface User {
  id: string
  email: string
  name: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

/* ------------------------------------------------------------------ */
/*  Default / fallback context – used when a component calls useAuth  */
/*  outside of <AuthProvider> (e.g. during prerender).                */
/* ------------------------------------------------------------------ */
const defaultAuthContext: AuthContextType = {
  user: null,
  loading: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/* ------------------------------------------------------------------ */
/*  <AuthProvider> – **stub only** (no real auth logic).              */
/* ------------------------------------------------------------------ */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay, then mark as finished.
    const timer = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(timer)
  }, [])

  const signIn = async () => {}
  const signUp = async () => {}
  const signOut = async () => setUser(null)

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */
export function useAuth(): AuthContextType {
  // If no provider found (e.g. during ISR / SSG) return the
  // default context instead of throwing – avoids build errors.
  return useContext(AuthContext) ?? defaultAuthContext
}
