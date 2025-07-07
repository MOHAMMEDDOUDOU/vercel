"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Truck, Shield, Headphones, ArrowRight, Building2, Package } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

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

export default function HomePage() {
  const { t, isRTL } = useTranslation()

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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section - Reduced height */}
        <section className="relative min-h-screen sm:min-h-[80vh] flex items-center justify-center overflow-hidden pt-16 sm:pt-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://res.cloudinary.com/deh3ejeph/image/upload/v1750722801/new_photo_uetrbs.png')`,
              backgroundColor: "#1C1C1C",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto">
              {/* Main Hero Content */}
              <div className="text-center mb-12 animate-fade-in-up">
                {/* Logo - Made Bigger */}
                <div className="mb-10 mt-6">
                  <Image
                    src="https://res.cloudinary.com/deh3ejeph/image/upload/v1750720949/Screenshot_2025-06-23_at_22.03.01-removebg-preview_agpwrw.png"
                    alt="NEXTWEARDZ Logo"
                    width={800}
                    height={300}
                    className="mx-auto h-32 sm:h-40 md:h-48 lg:h-60 w-auto"
                  />
                </div>

                {/* Two Buttons Side by Side */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                  <Link href="/products">
                    <Button className="btn-secondary text-lg px-10 py-4 group shadow-xl">
                      <Package
                        className={`${isRTL ? "ml-2" : "mr-2"} h-6 w-6 group-hover:rotate-12 transition-transform duration-300`}
                      />
                      {isRTL ? "عرض جميع المنتجات" : t("products")}
                      <ArrowRight
                        className={`${isRTL ? "mr-2" : "ml-2"} h-6 w-6 group-hover:translate-x-1 transition-transform duration-300`}
                      />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Smaller About Section */}
              <div className="relative mb-12 animate-slide-in-right">
                <div className="relative bg-white/95 backdrop-blur-sm rounded-xl shadow-md p-4 sm:p-6 lg:p-8 border border-gray-200">
                  <div className="text-center">
                    {/* Simple Icon */}
                    <div className="inline-block mb-4">
                      <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center shadow-md">
                        <Building2 className="h-6 w-6 text-yellow-500" />
                      </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                      {isRTL ? "من نحن" : t("currentLanguage") === "fr" ? "Qui sommes-nous" : "About Us"}
                    </h2>

                    {/* Simple Description */}
                    <div className="space-y-4 max-w-3xl mx-auto">
                      <p className="text-base text-gray-700 leading-relaxed">
                        {isRTL ? (
                          <>
                            نحن متجر <span className="text-yellow-600 font-semibold">NEXTWEARDZ</span>، متخصصون في توفير
                            ملابس العمل عالية الجودة
                          </>
                        ) : t("currentLanguage") === "fr" ? (
                          <>
                            Nous sommes <span className="text-yellow-600 font-semibold">NEXTWEARDZ</span>, spécialisés
                            dans la fourniture de vêtements de travail de haute qualité
                          </>
                        ) : (
                          <>
                            We are <span className="text-yellow-600 font-semibold">NEXTWEARDZ</span>, specialized in
                            providing high-quality work clothing
                          </>
                        )}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-center mb-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                            <span className="font-semibold text-gray-800">
                              {isRTL ? "مبادئنا" : t("currentLanguage") === "fr" ? "Nos principes" : "Our Principles"}
                            </span>
                          </div>
                          <p className="text-center">
                            {isRTL
                              ? "نلتزم بتوفير منتجات عالية الجودة تلبي احتياجات العمال والمهنيين"
                              : t("currentLanguage") === "fr"
                                ? "Nous nous engageons à fournir des produits de haute qualité qui répondent aux besoins des travailleurs et des professionnels"
                                : "We are committed to providing high-quality products that meet the needs of workers and professionals"}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-center mb-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                            <span className="font-semibold text-gray-800">
                              {isRTL ? "أهدافنا" : t("currentLanguage") === "fr" ? "Nos objectifs" : "Our Goals"}
                            </span>
                          </div>
                          <p className="text-center">
                            {isRTL
                              ? "نسعى لأن نكون الخيار الأول للعمال والشركات في الحصول على ملابس العمل"
                              : t("currentLanguage") === "fr"
                                ? "Nous aspirons à être le premier choix pour les travailleurs et les entreprises pour obtenir des vêtements de travail"
                                : "We strive to be the first choice for workers and companies to get work clothes"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Features - Reduced spacing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
                {[
                  {
                    icon: Truck,
                    title: isRTL
                      ? "سياسة الاستبدال والاسترجاع"
                      : t("currentLanguage") === "fr"
                        ? "Politique d'échange et de retour"
                        : "Exchange and Return Policy",
                    description: isRTL
                      ? "إمكانية الاستبدال والاسترجاع خلال 7 أيام من تاريخ الاستلام"
                      : t("currentLanguage") === "fr"
                        ? "Possibilité d'échange et de retour dans les 7 jours suivant la réception"
                        : "Exchange and return within 7 days of receipt",
                    color: "from-blue-400 to-blue-600",
                  },
                  {
                    icon: Shield,
                    title: isRTL
                      ? "ضمان الجودة"
                      : t("currentLanguage") === "fr"
                        ? "Garantie de qualité"
                        : "Quality Guarantee",
                    description: isRTL
                      ? "منتجات عالية الجودة تلبي معايير السلامة المهنية"
                      : t("currentLanguage") === "fr"
                        ? "Produits de haute qualité répondant aux normes de sécurité professionnelle"
                        : "High-quality products meeting professional safety standards",
                    color: "from-green-400 to-green-600",
                  },
                  {
                    icon: Headphones,
                    title: isRTL ? "دعم 24/7" : t("currentLanguage") === "fr" ? "Support 24/7" : "24/7 Support",
                    description: isRTL
                      ? "خدمة عملاء متاحة على مدار الساعة للإجابة على استفساراتكم"
                      : t("currentLanguage") === "fr"
                        ? "Service client disponible 24h/24 pour répondre à vos questions"
                        : "Customer service available 24/7 to answer your questions",
                    color: "from-yellow-400 to-yellow-600",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="text-center p-6 bg-black rounded-3xl shadow-lg transform hover:scale-105 transition-all duration-300 group hover:shadow-white/20 hover:shadow-2xl border-2 border-gray-800 hover:border-white/30"
                    style={{
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 0 30px rgba(255, 255, 255, 0.3), 0 10px 25px rgba(0, 0, 0, 0.3)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.3)"
                    }}
                  >
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-full mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-white">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Only on homepage */}
      <Footer />

      <WhatsAppFloat />
    </div>
  )
}
