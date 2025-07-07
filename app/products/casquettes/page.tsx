"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ArrowLeft } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/hooks/use-toast"
import { useProductsByCategory } from "@/hooks/use-products"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  description: string
  category: string
  sizes: string[]
  colors: string[]
  images: string[]
  inStock: boolean
  featured: boolean
}

export default function CasquettesPage() {
  const router = useRouter()
  const { addItem } = useCart()
  const { toast } = useToast()
  const { products, loading, error } = useProductsByCategory("casquettes")

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "/placeholder.svg?height=300&width=300",
      size: product.sizes?.[0] || "M",
    })
    toast({
      title: "تم إضافة المنتج",
      description: `تم إضافة ${product.name} إلى السلة`,
    })
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
            className="border-orange-500 text-orange-400 hover:bg-orange-50 hover:text-orange-600 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            عودة
          </Button>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">LES CASQUETTES</h1>
            <p className="text-gray-300">مجموعة متنوعة من القبعات العصرية</p>
          </div>
          <div className="w-20"></div>
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
                    <Link href={`/products/casquettes/${product.id}`}>
                      <div className="aspect-square overflow-hidden">
                        <Image
                          src={product.images?.[0] || "/placeholder.svg?height=300&width=300"}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    {product.featured && (
                      <Badge className="absolute top-4 right-4 bg-green-500 hover:bg-green-600 text-white z-10">مميز</Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 text-white">{product.name}</h3>
                    <div className="flex items-center mb-4">
                      <span className="text-2xl font-bold text-orange-500">{product.price} دج</span>
                      {product.original_price && (
                        <span className="text-lg text-gray-400 line-through mr-2">{product.original_price} دج</span>
                      )}
                    </div>
                    <Button onClick={() => router.push(`/products/casquettes/${product.id}`)} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg mt-4">
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
