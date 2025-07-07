"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Loader2, ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from "lucide-react"
import { WILAYAS_COMMUNES } from "@/lib/wilayas-communes"
import { SearchableSelect } from "@/components/searchable-select"
import { supabase } from "@/lib/supabase"
import { use } from "react"

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
  stock?: number
  inStock: boolean
  featured: boolean
  isNew: boolean
  isBestSeller: boolean
}

const WILAYAS = Object.keys(WILAYAS_COMMUNES)

export default function CasquetteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { addToCart } = useCart()
  const { toast } = useToast()

  // استمارة الطلب
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [wilaya, setWilaya] = useState("")
  const [commune, setCommune] = useState("")
  const [deliveryType, setDeliveryType] = useState<"home" | "office">("home")
  const [shippingCost, setShippingCost] = useState(0)
  const [calculatingShipping, setCalculatingShipping] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true)
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single()
      setProduct(data)
      setLoading(false)
      if (data && data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0])
      if (data && data.colors && data.colors.length > 0) setSelectedColor(data.colors[0])
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/placeholder.svg?height=300&width=300",
      size: selectedSize,
      quantity: quantity,
    })

    toast({
      title: "تم إضافة المنتج",
      description: `تم إضافة ${quantity} من ${product.name} إلى السلة`,
    })
  }

  // Get communes for selected wilaya
  const communes = wilaya ? WILAYAS_COMMUNES[wilaya as keyof typeof WILAYAS_COMMUNES] || [] : []

  // التحقق من المخزون المتاح
  const availableStock = product?.stock || 0
  const isInStock = availableStock > 0
  const maxQuantity = Math.min(availableStock, 10) // حد أقصى 10 قطع للطلب الواحد

  // تحديث الكمية عند تغيير المخزون
  useEffect(() => {
    if (product && quantity > maxQuantity) {
      setQuantity(maxQuantity)
    }
  }, [product, maxQuantity, quantity])

  useEffect(() => {
    if (wilaya && deliveryType) {
      calculateShipping()
    }
  }, [wilaya, deliveryType, quantity])

  useEffect(() => {
    setCommune("")
  }, [wilaya])

  const calculateShipping = async () => {
    setCalculatingShipping(true)
    try {
      const response = await fetch("/api/zr-express/calculate-shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wilaya,
          deliveryType,
          quantity,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setShippingCost(data.shippingCost)
      }
    } catch (error) {
      console.error("Error calculating shipping:", error)
    } finally {
      setCalculatingShipping(false)
    }
  }

  const handleOrder = async () => {
    // التحقق من المخزون قبل إنشاء الطلب
    if (!isInStock) {
      toast({
        title: "المنتج غير متوفر",
        description: "عذراً، هذا المنتج غير متوفر حالياً في المخزون",
        variant: "destructive",
      })
      return
    }

    if (quantity > availableStock) {
      toast({
        title: "كمية غير متوفرة",
        description: `لا توجد كمية كافية في المخزون. تبقى ${availableStock} حبات فقط.`,
        variant: "destructive",
      })
      return
    }

    if (!selectedSize || !customerName || !customerPhone || !wilaya || (deliveryType === "home" && !commune)) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }
    setLoading(true)
    try {
      const orderData = {
        customerName,
        customerPhone,
        wilaya,
        commune: deliveryType === "home" ? commune : "",
        address: deliveryType === "home" ? commune : wilaya,
        products: [
          {
            name: product.name,
            size: selectedSize,
            quantity,
            price: product.price,
          },
        ],
        deliveryType,
        shippingCost,
        totalAmount: product.price * quantity + shippingCost,
      }
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })
      const result = await response.json()
      if (result.success) {
        // إرسال الطلب إلى Google Sheets
        try {
          console.log("📊 إرسال الطلب إلى Google Sheets:", result.orderId)
          const sheetsResponse = await fetch('/api/sheets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              orderId: result.orderId,
              orderNumber: result.orderNumber
            }),
          })
          
          const sheetsResult = await sheetsResponse.json()
          if (sheetsResult.success) {
            if (sheetsResult.skipped) {
              console.log("⚠️ الطلب موجود بالفعل في Google Sheets")
            } else {
              console.log("✅ تم إرسال الطلب إلى Google Sheets بنجاح")
            }
          } else {
            console.error("❌ فشل في إرسال الطلب إلى Google Sheets:", sheetsResult.error)
          }
        } catch (sheetsError) {
          console.error('❌ فشل في إرسال الطلب إلى Google Sheets', sheetsError)
        }

        toast({
          title: "تم تأكيد طلبك! 🎉",
          description: "تم حفظ طلبك بنجاح! سيتم التواصل معك قريباً لتأكيد الطلب.",
        })
        router.push(`/order-confirmation?orderId=${result.orderId}&orderNumber=${result.orderNumber}`)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في إنشاء الطلب",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totalPrice = product ? product.price * quantity + shippingCost : 0

  // Navigation functions
  const nextImage = () => {
    if (product && product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product && product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        prevImage()
      } else if (event.key === "ArrowRight") {
        nextImage()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [product])

  if (loading) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/deh3ejeph/image/upload/v1750722801/new_photo_uetrbs.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#1C1C1C",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>
        <div className="relative z-10 text-white text-xl">جاري تحميل المنتج...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/deh3ejeph/image/upload/v1750722801/new_photo_uetrbs.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#1C1C1C",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">المنتج غير موجود</h1>
          <Link href="/products/casquettes">
            <Button className="bg-orange-500 hover:bg-orange-600">العودة للقبعات</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-orange-600 transition-colors">
                الرئيسية
              </Link>
              <span>/</span>
              <Link href="/products" className="hover:text-orange-600 transition-colors">
                المنتجات
              </Link>
              <span>/</span>
              <Link href="/products/casquettes" className="hover:text-orange-600 transition-colors">
                القبعات
              </Link>
              <span>/</span>
              <span className="text-gray-900">{product?.name}</span>
            </div>
          </nav>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image Section */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden">
                <Image
                  src={product.images[currentImageIndex] || "/placeholder.svg"}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="w-full h-auto max-h-[800px] object-contain cursor-pointer"
                  priority
                  onClick={nextImage}
                />

                {/* Navigation Buttons */}
                {product.images && product.images.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300 backdrop-blur-sm"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300 backdrop-blur-sm"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                      {currentImageIndex + 1} / {product.images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 bg-white ${
                        currentImageIndex === index
                          ? "border-orange-500 shadow-lg scale-105"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        width={96}
                        height={96}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Product Info & Order Form */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product?.name}</h1>
                {/* Price */}
                <div className="flex items-center mb-6">
                  <span className="text-3xl font-bold text-orange-600">{product?.price?.toLocaleString()} دج</span>
                  {product?.originalPrice && (
                    <span className="text-xl text-gray-400 line-through mr-3">
                      {product.originalPrice?.toLocaleString()} دج
                    </span>
                  )}
                </div>
                {/* Description */}
                <p className="text-gray-700 leading-relaxed mb-6">{product?.description}</p>
                {/* Features */}
                {Array.isArray(product?.features) && product.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">المميزات:</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* Order Form */}
              <Card className="border-2 border-orange-200 shadow-xl bg-gradient-to-br from-white to-orange-50">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl flex items-center justify-center">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    اطلب الآن
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Color Selection */}
                  {product?.colors && product.colors.length > 0 && (
                    <div>
                      <Label className="text-base font-semibold text-gray-900 mb-3 block">اللون *</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {product.colors.map((color: string, index: number) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`py-3 px-4 border rounded-lg transition-all duration-300 font-medium text-sm ${
                              selectedColor === color
                                ? "border-orange-500 bg-orange-500 text-white shadow-lg scale-105"
                                : "border-gray-300 hover:border-orange-300 hover:bg-orange-50"
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Size Selection */}
                  {product?.sizes && product.sizes.length > 0 && (
                    <div>
                      <Label className="text-base font-semibold text-gray-900 mb-3 block">المقاس *</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {product.sizes.map((size: string, index: number) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`py-3 px-2 border rounded-lg transition-all duration-300 font-medium ${
                              selectedSize === size
                                ? "border-orange-500 bg-orange-500 text-white shadow-lg scale-105"
                                : "border-gray-300 hover:border-orange-300 hover:bg-orange-50"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Quantity */}
                  <div>
                    <Label htmlFor="quantity" className="text-base font-semibold text-gray-900 mb-3 block">
                      الكمية *
                    </Label>
                    <div className="flex items-center justify-center space-x-4 bg-gray-50 rounded-lg p-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                      >
                        -
                      </button>
                      <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                        className="w-20 text-center font-bold text-lg"
                        min="1"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName" className="text-base font-semibold text-gray-900 mb-2 block">
                        الاسم الكامل *
                      </Label>
                      <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="أدخل اسمك الكامل"
                        className="border-orange-200 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone" className="text-base font-semibold text-gray-900 mb-2 block">
                        رقم الهاتف *
                      </Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0555123456"
                        className="border-orange-200 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  {/* Wilaya */}
                  <div>
                    <Label className="text-base font-semibold text-gray-900 mb-2 block">الولاية *</Label>
                    <SearchableSelect
                      options={WILAYAS}
                      value={wilaya}
                      onChange={setWilaya}
                      placeholder="ابحث واختر الولاية"
                      searchPlaceholder="ابحث عن الولاية..."
                      className="border-orange-200 focus:border-orange-500"
                    />
                  </div>
                  {/* Delivery Type */}
                  <div>
                    <Label className="text-base font-semibold text-gray-900 mb-3 block">نوع التوصيل *</Label>
                    <Select value={deliveryType} onValueChange={(value: "home" | "office") => setDeliveryType(value)}>
                      <SelectTrigger className="border-orange-200 focus:border-orange-500">
                        <SelectValue placeholder="اختر نوع التوصيل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">
                          <div className="flex items-center">
                            <Truck className="ml-2 h-4 w-4 text-orange-500" />
                            <div>
                              <div className="font-medium">توصيل للمنزل</div>
                              <div className="text-xs text-gray-500">التوصيل إلى عنوان منزلك</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="office">
                          <div className="flex items-center">
                            <Truck className="ml-2 h-4 w-4 text-orange-500" />
                            <div>
                              <div className="font-medium">توصيل لمكتب ZR Express</div>
                              <div className="text-xs text-gray-500">استلام من مكتب التوصيل</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Commune (if home delivery) */}
                  {deliveryType === "home" && (
                    <div>
                      <Label className="text-base font-semibold text-gray-900 mb-2 block">البلدية *</Label>
                      <SearchableSelect
                        options={communes}
                        value={commune}
                        onChange={setCommune}
                        placeholder="ابحث واختر البلدية"
                        searchPlaceholder="ابحث عن البلدية..."
                        className="border-orange-200 focus:border-orange-500"
                      />
                    </div>
                  )}
                  {/* Shipping Cost */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">سعر التوصيل:</span>
                    <span className="text-orange-600 font-bold">
                      {shippingCost ? `${shippingCost.toLocaleString()} دج` : "-"}
                    </span>
                  </div>
                  {/* Total Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-bold text-lg">المجموع الكلي:</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {totalPrice ? `${totalPrice.toLocaleString()} دج` : "-"}
                    </span>
                  </div>
                  {/* Order Button */}
                  <Button
                    onClick={handleOrder}
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg mt-4 text-lg flex items-center justify-center"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    ) : (
                      <ShoppingCart className="mr-2 h-5 w-5" />
                    )}
                    تأكيد الطلب
                  </Button>

                  <div className="text-center text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
                    💰 الدفع عند الاستلام • 📦 سيتم التواصل معك لتأكيد الطلب • 🔄 إمكانية الاستبدال
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
