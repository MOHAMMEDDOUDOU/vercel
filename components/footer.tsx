"use client"

import Link from "next/link"
import Image from "next/image"

// TikTok Logo Component
const TikTokIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z" />
  </svg>
)

// WhatsApp Logo Component
const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
  </svg>
)

export function Footer() {
  const handleTikTokClick = () => {
    window.open("https://www.tiktok.com/@nextweardz", "_blank")
  }

  const handleWhatsAppClick = () => {
    const phoneNumber = "+213542063094"
    const message = "مرحبا، أريد الاستفسار عن المنتجات المتوفرة في NEXTWEARDZ"
    const url = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  return (
    <footer className="gradient-dark text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/20 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <Image
                src="https://res.cloudinary.com/deh3ejeph/image/upload/v1750720949/Screenshot_2025-06-23_at_22.03.01-removebg-preview_agpwrw.png"
                alt="NEXTWEARDZ Logo"
                width={140}
                height={45}
                className="h-12 w-auto filter brightness-0 invert mx-auto"
              />
            </Link>
            <p className="text-gray-300 leading-relaxed text-center">
              متجرك الأول للملابس العصرية والأنيقة. نقدم أفضل المنتجات بجودة عالية وأسعار مناسبة.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6 text-center">
            <h3 className="text-xl font-bold text-gradient">روابط سريعة</h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "الرئيسية" },
                { href: "/products", label: "المنتجات" },
                { href: "/about", label: "من نحن" },
                { href: "/contact", label: "اتصل بنا" },
              ].map((link) => (
                <li key={link.href} className="flex justify-center">
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 transform scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info - Updated with Social Media Buttons */}
          <div className="space-y-6 text-center">
            <h3 className="text-xl font-bold text-gradient">تواصل معنا</h3>
            <div className="space-y-4">
              {/* WhatsApp Button */}
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full justify-center"
              >
                <WhatsAppIcon />
                تواصل معنا عبر واتساب
              </button>

              {/* TikTok Button */}
              <button
                onClick={handleTikTokClick}
                className="flex items-center gap-3 bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full justify-center"
              >
                <TikTokIcon />
                تابعنا على تيك توك
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section - Centered Copyright */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="text-center">
            <p className="text-gray-400">© 2025 NEXTWEARDZ. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
