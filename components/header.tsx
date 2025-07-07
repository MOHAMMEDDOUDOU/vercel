"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { useTranslation } from "@/hooks/use-translation"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { currentLanguage, changeLanguage, t, isRTL } = useTranslation()

  const languages = [
    { code: "ar" as const, name: "العربية", flag: "🇩🇿" },
    { code: "fr" as const, name: "Français", flag: "🇫🇷" },
    { code: "en" as const, name: "English", flag: "🇺🇸" },
  ]

  const currentLanguageData = languages.find((lang) => lang.code === currentLanguage) || languages[0]

  const handleLanguageChange = (language: { code: "ar" | "fr" | "en"; name: string; flag: string }) => {
    changeLanguage(language.code)
  }

  const navigationItems = [
    { href: "/", label: t("home") },
    { href: "/products", label: t("products") },
  ]

  return (
    <header className="gradient-header shadow-modern-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className={`flex items-center justify-between w-full ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
          {/* Language Switcher & Mobile Menu - الآن في اليسار */}
          <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-4" : "space-x-4"}`}>
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-xl p-2 flex items-center space-x-2"
                >
                  <Globe className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm">{currentLanguageData.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-white border border-gray-200 shadow-lg">
                {languages.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => handleLanguageChange(language)}
                    className={`flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                      currentLanguage === language.code ? "bg-gray-50" : ""
                    }`}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span className="text-sm font-medium">{language.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-white/20 rounded-xl p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Desktop Navigation - في الوسط */}
          <nav className="hidden lg:flex items-center space-x-8 xl:space-x-12 absolute left-1/2 transform -translate-x-1/2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/90 hover:text-white font-semibold text-sm lg:text-base xl:text-lg transition-all duration-300 hover:scale-105 relative group px-3 lg:px-4 py-2 lg:py-3 rounded-xl hover:bg-white/10"
              >
                {item.label}
                <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-orange-400 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </Link>
            ))}
          </nav>

          {/* Logo - الآن في اليمين */}
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <Image
                src="https://res.cloudinary.com/deh3ejeph/image/upload/v1750720949/Screenshot_2025-06-23_at_22.03.01-removebg-preview_agpwrw.png"
                alt="NEXTWEARDZ Logo"
                width={140}
                height={45}
                className="h-8 sm:h-10 lg:h-12 w-auto transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/20 animate-fade-in-up max-h-screen overflow-y-auto">
            <nav className="flex flex-col space-y-2 mt-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white/90 hover:text-white font-semibold py-4 px-6 rounded-xl hover:bg-white/10 transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
