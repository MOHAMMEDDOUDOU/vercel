"use client"

import { MessageCircle } from "lucide-react"

export function WhatsAppFloat() {
  const phoneNumber = "+213542063094"
  const message = "مرحبا، أريد الاستفسار عن المنتجات المتوفرة في NEXTWEARDZ"

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button onClick={handleClick} className="whatsapp-float group" aria-label="تواصل معنا عبر واتساب">
        <MessageCircle className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          تواصل معنا عبر واتساب
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </button>
    </div>
  )
}
