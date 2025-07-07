"use client"

import { useState, useEffect } from "react"
import { translations, type Language, type TranslationKey } from "@/lib/translations"

export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("ar")
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // قراءة اللغة من localStorage عند تحميل الصفحة
    const savedLanguage = localStorage.getItem("site_lang") as Language
    if (savedLanguage && ["ar", "fr", "en"].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage)
      // تطبيق اللغة على HTML
      document.documentElement.lang = savedLanguage
      document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr"
    }
    setIsInitialized(true)
  }, [])

  const changeLanguage = (newLanguage: Language) => {
    setCurrentLanguage(newLanguage)
    localStorage.setItem("site_lang", newLanguage)

    // تحديث اتجاه الصفحة
    document.documentElement.lang = newLanguage
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr"

    // إعادة تحميل الصفحة لتطبيق التغييرات
    window.location.reload()
  }

  const t = (key: TranslationKey): string => {
    if (!isInitialized) return key
    return translations[currentLanguage]?.[key] || translations.ar[key] || key
  }

  const isRTL = currentLanguage === "ar"

  return {
    currentLanguage,
    changeLanguage,
    t,
    isRTL,
    isInitialized,
  }
}
