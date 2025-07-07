"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import { Truck, Building2, Loader2, Star, ShoppingCart, Check, ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { WILAYAS_COMMUNES } from "@/lib/wilayas-communes"
import { SearchableSelect } from "@/components/searchable-select"
import { supabase } from "@/lib/supabase"
import { use } from "react"

const WILAYAS = Object.keys(WILAYAS_COMMUNES)

export default function TShirtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<any>(null)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { t, isRTL } = useTranslation()

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [wilaya, setWilaya] = useState("")
  const [commune, setCommune] = useState("")
  const [deliveryType, setDeliveryType] = useState<"home" | "office">("home")
  const [shippingCost, setShippingCost] = useState(0)
  const [loading, setLoading] = useState(false)
  const [calculatingShipping, setCalculatingShipping] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      setLoadingProduct(true)
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single()
      setProduct(data)
      setLoadingProduct(false)
      if (data && data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0])
      if (data && data.colors && data.colors.length > 0) setSelectedColor(data.colors[0])
    }
    fetchProduct()
  }, [id])

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

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-xl">{t("loadingProducts")}</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t("productNotFound")}</h1>
          <Link href="/products/t-shirts">
            <Button>{t("backToTshirts")}</Button>
          </Link>
        </div>
      </div>
    )
  }

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

    if (
      !selectedSize ||
      !selectedColor ||
      !customerName ||
      !customerPhone ||
      !wilaya ||
      (deliveryType === "home" && !commune)
    ) {
      toast({
        title: t("missingInfo"),
        description: t("fillAllFields"),
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
            name: `${product.name} - ${selectedColor}`,
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
        title: t("error"),
        description: error instanceof Error ? error.message : t("error"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totalPrice = product.price * quantity + shippingCost

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <Header />

      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <div
              className={`flex items-center space-x-2 text-sm text-gray-600 ${isRTL ? "flex-row-reverse space-x-reverse" : ""}`}
            >
              <Link href="/" className="hover:text-orange-600 transition-colors">
                {t("home")}
              </Link>
              <span>/</span>
              <Link href="/products" className="hover:text-orange-600 transition-colors">
                {t("products")}
              </Link>
              <span>/</span>
              <Link href="/products/t-shirts" className="hover:text-orange-600 transition-colors">
                {t("tshirts")}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{product.name}</span>
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
                <div
                  className={`flex space-x-3 overflow-x-auto pb-2 ${isRTL ? "flex-row-reverse space-x-reverse" : ""}`}
                >
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

              {/* Product Info for Mobile */}
              <div className="xl:hidden bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

                {/* Stock Status */}
                <div className={`flex items-center mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  {isInStock ? (
                    <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                      <CheckCircle className={`h-4 w-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                      متوفر في المخزون ({availableStock} حبة)
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
                      <AlertCircle className={`h-4 w-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                      غير متوفر
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className={`flex items-center mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.rating || 4) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className={`text-sm text-gray-600 ${isRTL ? "ml-2" : "mr-2"}`}>
                    ({product.reviews || 0} {t("reviews")})
                  </span>
                </div>

                {/* Price */}
                <div className={`flex items-center mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-2xl font-bold text-orange-600">{product.price} دج</span>
                  {product.originalPrice && (
                    <span className={`text-lg text-gray-400 line-through ${isRTL ? "ml-3" : "mr-3"}`}>
                      {product.originalPrice} دج
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed text-sm">{product.description}</p>
              </div>
            </div>

            {/* Product Info & Order Form */}
            <div className="space-y-6">
              {/* Product Header - Desktop Only */}
              <div className="hidden xl:block bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

                {/* Stock Status */}
                <div className={`flex items-center mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  {isInStock ? (
                    <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-full text-sm font-medium">
                      <CheckCircle className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                      متوفر في المخزون ({availableStock} حبة)
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-full text-sm font-medium">
                      <AlertCircle className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                      غير متوفر
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className={`flex items-center mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(product.rating || 4) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className={`text-sm text-gray-600 ${isRTL ? "ml-2" : "mr-2"}`}>
                    ({product.reviews || 0} {t("reviews")})
                  </span>
                </div>

                {/* Price */}
                <div className={`flex items-center mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-3xl font-bold text-orange-600">{product.price} دج</span>
                  {product.originalPrice && (
                    <span className={`text-xl text-gray-400 line-through ${isRTL ? "ml-3" : "mr-3"}`}>
                      {product.originalPrice} دج
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>

                {/* Features */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">{t("features")}:</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Array.isArray(product.features) &&
                      product.features.map((feature: string, index: number) => (
                        <li
                          key={index}
                          className={`flex items-center text-gray-700 ${isRTL ? "flex-row-reverse" : ""}`}
                        >
                          <Check className={`w-4 h-4 text-green-500 ${isRTL ? "ml-2" : "mr-2"}`} />
                          {feature}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              {/* Order Form */}
              <Card className="border-2 border-orange-200 shadow-xl bg-gradient-to-br from-white to-orange-50">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl flex items-center justify-center">
                    <ShoppingCart className={`${isRTL ? "ml-2" : "mr-2"} h-5 w-5`} />
                    {t("orderNow")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Color Selection */}
                  <div>
                    <Label className="text-base font-semibold text-gray-900 mb-3 block">{t("color")} *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {product.colors &&
                        product.colors.map((color: string, index: number) => (
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

                  {/* Size Selection */}
                  <div>
                    <Label className="text-base font-semibold text-gray-900 mb-3 block">{t("size")} *</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {product.sizes &&
                        product.sizes.map((size: string, index: number) => (
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

                  {/* Quantity */}
                  <div>
                    <Label htmlFor="quantity" className="text-base font-semibold text-gray-900 mb-3 block">
                      {t("quantity")} *
                    </Label>
                    <div className="flex items-center justify-center space-x-4 bg-gray-50 rounded-lg p-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const newQuantity = Math.max(1, Number.parseInt(e.target.value) || 1)
                          setQuantity(Math.min(newQuantity, maxQuantity))
                        }}
                        className="w-20 text-center font-bold text-lg"
                        min="1"
                        max={maxQuantity}
                      />
                      <button
                        onClick={() => setQuantity(Math.min(quantity + 1, maxQuantity))}
                        className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantity >= maxQuantity}
                      >
                        +
                      </button>
                    </div>
                    {/* Stock Info */}
                    <div className="mt-2 text-sm text-gray-600 text-center">
                      {isInStock ? (
                        <span>الكمية المتاحة: {availableStock} حبة</span>
                      ) : (
                        <span className="text-red-600">غير متوفر في المخزون</span>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName" className="text-base font-semibold text-gray-900 mb-2 block">
                        {t("fullName")} *
                      </Label>
                      <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={t("enterFullName")}
                        className="border-orange-200 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone" className="text-base font-semibold text-gray-900 mb-2 block">
                        {t("phoneNumber")} *
                      </Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder={t("enterPhone")}
                        className="border-orange-200 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Wilaya */}
                  <div>
                    <Label className="text-base font-semibold text-gray-900 mb-2 block">{t("wilaya")} *</Label>
                    <SearchableSelect
                      options={WILAYAS}
                      value={wilaya}
                      onChange={setWilaya}
                      placeholder={t("searchWilaya")}
                      searchPlaceholder={t("searchWilaya")}
                      className="border-orange-200 focus:border-orange-500"
                    />
                  </div>

                  {/* Delivery Type */}
                  <div>
                    <Label className="text-base font-semibold text-gray-900 mb-3 block">{t("deliveryType")} *</Label>
                    <Select value={deliveryType} onValueChange={(value: "home" | "office") => setDeliveryType(value)}>
                      <SelectTrigger className="border-orange-200 focus:border-orange-500">
                        <SelectValue placeholder={t("selectDeliveryType")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">
                          <div className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}>
                            <Truck className={`${isRTL ? "mr-2" : "ml-2"} h-4 w-4 text-orange-500`} />
                            <div>
                              <div className="font-medium">{t("homeDelivery")}</div>
                              <div className="text-xs text-gray-500">{t("deliveryToHome")}</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="office">
                          <div className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}>
                            <Building2 className={`${isRTL ? "mr-2" : "ml-2"} h-4 w-4 text-orange-500`} />
                            <div>
                              <div className="font-medium">{t("officeDelivery")}</div>
                              <div className="text-xs text-gray-500">{t("deliveryToOffice")}</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Commune (only for home delivery) */}
                  {deliveryType === "home" && (
                    <div>
                      <Label className="text-base font-semibold text-gray-900 mb-2 block">{t("commune")} *</Label>
                      <Select value={commune} onValueChange={setCommune} disabled={!wilaya}>
                        <SelectTrigger className="border-orange-200 focus:border-orange-500">
                          <SelectValue placeholder={wilaya ? t("selectCommune") : t("selectWilayaFirst")} />
                        </SelectTrigger>
                        <SelectContent>
                          {communes.map((c, index) => (
                            <SelectItem key={`${c}-${index}`} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="bg-gradient-to-r from-gray-50 to-orange-50 p-6 rounded-xl border border-orange-200">
                    <h3 className="font-bold text-gray-900 mb-4 text-center">{t("orderSummary")}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">{t("price")}:</span>
                        <span className="font-semibold">{product.price * quantity} دج</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">{t("shippingCost")}:</span>
                        <span className="font-semibold">
                          {calculatingShipping ? <Loader2 className="h-4 w-4 animate-spin" /> : `${shippingCost} دج`}
                        </span>
                      </div>
                      <div className="border-t border-orange-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">{t("grandTotal")}:</span>
                          <span className="text-2xl font-bold text-orange-600">{totalPrice} دج</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Button */}
                  <Button
                    onClick={handleOrder}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || calculatingShipping || !isInStock}
                  >
                    {loading ? (
                      <>
                        <Loader2 className={`${isRTL ? "ml-2" : "mr-2"} h-5 w-5 animate-spin`} />
                        جاري إنشاء الطلب...
                      </>
                    ) : !isInStock ? (
                      <>
                        <AlertCircle className={`${isRTL ? "ml-2" : "mr-2"} h-6 w-6`} />
                        غير متوفر
                      </>
                    ) : (
                      <>
                        <ShoppingCart className={`${isRTL ? "ml-2" : "mr-2"} h-6 w-6`} />
                        {t("confirmOrder")} - {totalPrice} دج
                      </>
                    )}
                  </Button>

                  <div className="text-center text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
                    💰 {t("cashOnDelivery")} • 📦 سيتم التواصل معك لتأكيد الطلب • 🔄 {t("exchangePossible")}
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
