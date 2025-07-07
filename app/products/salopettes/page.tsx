"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useProductsByCategory } from "@/hooks/use-products"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default function SalopettesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { products, loading, error } = useProductsByCategory("salopettes")

  const handleOrderNow = (product: any) => {
    router.push(`/products/salopettes/${product.id}`)
  }

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
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-black"
          >
            ← العودة
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">LES SALOPETTES</h1>
            <p className="text-gray-300">مجموعة متنوعة من السالوبيت العصري</p>
          </div>
          <div className="w-20"></div> {/* مساحة فارغة للتوازن */}
        </div>
        {/* Products Grid */}
        {loading ? (
          <div className="text-center text-xl py-16">جاري تحميل المنتجات...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-16">حدث خطأ أثناء جلب المنتجات</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group overflow-hidden border-gray-700 hover:border-orange-500 transition-all duration-300 bg-gray-900/90 backdrop-blur-sm"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <Link href={`/products/salopettes/${product.id}`}>
                      <div className="aspect-[4/5] bg-white flex items-center justify-center overflow-hidden">
                        <Image
                          src={product.images?.[0] || "/placeholder.svg?height=300&width=300"}
                          alt={product.name}
                          width={300}
                          height={375}
                          className="object-cover object-center w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </Link>
                    {product.featured && (
                      <Badge className="absolute top-4 right-4 bg-orange-500 hover:bg-orange-600 text-white z-10">
                        مميز
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 text-white truncate">{product.name}</h3>
                    <div className="flex items-center mb-2">
                      <span className="text-2xl font-bold text-orange-500">{product.price} دج</span>
                      {product.original_price && (
                        <span className="text-lg text-gray-400 line-through mr-2">{product.original_price} دج</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 truncate">{product.description}</p>
                    <Button
                      onClick={() => router.push(`/products/salopettes/${product.id}`)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg mt-2"
                    >
                      اطلب الآن
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
