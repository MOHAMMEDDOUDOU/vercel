"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

export default function ProductsPage() {
  const router = useRouter()
  const { t } = useTranslation()

  const categories = [
    {
      name: "LES SALOPETTES",
      href: "/products/salopettes",
      image:
        "https://res.cloudinary.com/deh3ejeph/image/upload/v1750720949/Screenshot_2025-06-23_at_22.03.01-removebg-preview_agpwrw.png",
      bgImage: "https://res.cloudinary.com/deh3ejeph/image/upload/v1750797740/sallopetes_rcvdta.jpg",
    },
    {
      name: "T-SHIRTS",
      href: "/products/t-shirts",
      image:
        "https://res.cloudinary.com/deh3ejeph/image/upload/v1750720949/Screenshot_2025-06-23_at_22.03.01-removebg-preview_agpwrw.png",
      bgImage: "https://res.cloudinary.com/deh3ejeph/image/upload/v1750798910/t-shirt1_yp8m5o.png",
    },
    {
      name: "LES CASQUETTES",
      href: "/products/casquettes",
      image:
        "https://res.cloudinary.com/deh3ejeph/image/upload/v1750720949/Screenshot_2025-06-23_at_22.03.01-removebg-preview_agpwrw.png",
      bgImage: "https://res.cloudinary.com/deh3ejeph/image/upload/v1750722801/new_photo_uetrbs.png",
    },
    {
      name: "GILETS",
      href: "/products/geliet",
      image:
        "https://res.cloudinary.com/deh3ejeph/image/upload/v1750720949/Screenshot_2025-06-23_at_22.03.01-removebg-preview_agpwrw.png",
      bgImage: "https://res.cloudinary.com/deh3ejeph/image/upload/v1750798348/gielet_qf2ill.jpg",
    },
  ]

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url('https://res.cloudinary.com/deh3ejeph/image/upload/v1750722801/new_photo_uetrbs.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#1C1C1C",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="border-orange-500 text-orange-400 hover:bg-orange-50 hover:text-orange-600 px-6 py-3 bg-transparent"
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            {t("backToHome")}
          </Button>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{t("products").toUpperCase()}</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t("currentLanguage") === "ar"
              ? "اكتشف مجموعتنا الحصرية من الملابس عالية الجودة"
              : t("currentLanguage") === "fr"
                ? "Découvrez notre collection exclusive de vêtements de qualité premium"
                : "Discover our exclusive collection of premium quality clothing"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <Link key={index} href={category.href}>
              <Card className="group cursor-pointer overflow-hidden border-2 border-gray-700 hover:border-orange-500 transition-all duration-300 transform hover:scale-105 bg-gray-900/90 backdrop-blur-sm">
                <CardContent
                  className="p-0 relative h-80"
                  style={{
                    backgroundImage: `url('${category.bgImage}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                  <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="mb-6">
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        width={120}
                        height={120}
                        className="mx-auto filter brightness-0 invert group-hover:brightness-100 group-hover:invert-0 transition-all duration-300"
                      />
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-orange-400 transition-colors duration-300">
                      {category.name}
                    </h2>

                    <div className="w-16 h-1 bg-orange-500 group-hover:w-24 transition-all duration-300"></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
