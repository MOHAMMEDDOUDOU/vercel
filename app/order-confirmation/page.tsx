"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, Phone, MessageCircle, ShoppingBag, Home, AlertCircle, Headphones, Star, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useProducts } from "@/hooks/use-products"
import Image from "next/image"

export default function OrderConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [orderLoading, setOrderLoading] = useState(true)
  const { products, loading } = useProducts()

  const orderId = searchParams.get("orderId")
  const orderNumber = searchParams.get("orderNumber")

  // جلب بيانات الطلب الحالي
  useEffect(() => {
    const fetchOrderData = async () => {
      if (orderId) {
        try {
          const response = await fetch(`/api/orders?orderId=${orderId}`)
          const data = await response.json()
          if (data.success) {
            setCurrentOrder(data.order)
          }
        } catch (error) {
          console.error("خطأ في جلب بيانات الطلب:", error)
        } finally {
          setOrderLoading(false)
        }
      } else {
        setOrderLoading(false)
      }
    }

    fetchOrderData()
  }, [orderId])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // تصفية المنتجات لعرض 6 منتجات عشوائية (باستثناء المنتج المطلوب)
  const suggestedProducts = products
    .filter(product => {
      // استبعاد المنتج الذي تم شراؤه
      if (currentOrder && product.name === currentOrder.product_name) {
        return false
      }
      return product.in_stock
    })
    .slice(0, 6)



  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* رسالة النجاح الرئيسية */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">تم استلام طلبك بنجاح! 🎉</h1>
            <p className="text-xl text-gray-600 mb-6">شكراً لك على ثقتك في NEXTWEARDZ</p>

            {orderNumber && (
              <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-lg shadow-md border-2 border-green-200">
                <span className="text-gray-600">رقم الطلب:</span>
                <Badge variant="outline" className="text-lg font-bold text-green-700 bg-green-50">
                  {orderNumber}
                </Badge>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* معلومات الطلب */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  ماذا يحدث الآن؟
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full flex-shrink-0">
                      <span className="text-green-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">تم استلام طلبك</h3>
                      <p className="text-gray-600 text-sm">تم حفظ طلبك في نظامنا بنجاح ووصل إلى فريق المبيعات</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full flex-shrink-0">
                      <span className="text-orange-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">سيتم التواصل معك</h3>
                      <p className="text-gray-600 text-sm">
                        خلال 24 ساعة سيتصل بك أحد ممثلي المبيعات لتأكيد الطلب وتفاصيل التوصيل
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">تحضير وشحن الطلب</h3>
                      <p className="text-gray-600 text-sm">بعد التأكيد، سيتم تحضير طلبك وشحنه إلى عنوانك المحدد</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">الوقت المتوقع للتواصل</span>
                  </div>
                  <p className="text-blue-800 text-sm">
                    سيتم التواصل معك خلال 24 ساعة من الآن (أيام العمل: السبت - الخميس)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* معلومات الاتصال والدعم */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="w-5 h-5" />
                  تحتاج مساعدة؟
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-600" />
                      اتصل بنا
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-sm">📞</span>
                        <span className="text-sm">213542063094</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-sm">📞</span>
                        <span className="text-sm">+213 540 44 73 74</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      واتساب
                    </h3>
                    <Button
                      onClick={() => window.open("https://wa.me/213542063094", "_blank")}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      تواصل عبر واتساب
                    </Button>
                  </div>

                  <Separator />

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      نصائح مهمة
                    </h4>
                    <ul className="text-yellow-800 text-sm space-y-1">
                      <li>• احتفظ برقم الطلب للمراجعة</li>
                      <li>• تأكد من أن هاتفك متاح للرد</li>
                      <li>• راجع عنوان التوصيل المحدد</li>
                      <li>• الدفع عند الاستلام فقط</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* المنتجات المقترحة */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">منتجات مقترحة لك</h2>
              <p className="text-gray-600">اكتشف المزيد من منتجاتنا المميزة</p>
            </div>

            {(loading || orderLoading) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : suggestedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.images?.[0] || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.featured && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-yellow-500 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            مميز
                          </Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <Button
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 hover:bg-gray-100"
                          onClick={() => router.push(`/products/${product.category}/${product.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          عرض المنتج
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors overflow-hidden">
                        <span className="block truncate">{product.name}</span>
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-orange-600">
                            {product.price?.toLocaleString()} دج
                          </span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {product.original_price.toLocaleString()} دج
                            </span>
                          )}
                        </div>
                        <Badge variant={product.in_stock ? "default" : "secondary"} className="text-xs">
                          {product.in_stock ? "متوفر" : "غير متوفر"}
                        </Badge>
                      </div>
                      {product.description && (
                        <p className="text-sm text-gray-600 mt-2 overflow-hidden">
                          <span className="block truncate">{product.description}</span>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد منتجات متاحة حالياً</p>
              </div>
            )}

            {suggestedProducts.length > 0 && (
              <div className="text-center mt-8">
                <Button
                  onClick={() => router.push("/products")}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  عرض جميع المنتجات
                </Button>
              </div>
            )}
          </div>

          {/* أزرار التنقل */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button
              onClick={() => router.push("/products")}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              متابعة التسوق
            </Button>
            <Button onClick={() => router.push("/")} size="lg" variant="outline" className="px-8">
              <Home className="w-5 h-5 mr-2" />
              العودة للرئيسية
            </Button>
          </div>

          {/* شعار الشركة */}
          <div className="text-center mt-12">
            <div className="w-48 h-12 mx-auto bg-gray-200 rounded flex items-center justify-center opacity-60">
              <span className="text-gray-500 font-bold">NEXTWEARDZ</span>
            </div>
            <p className="text-gray-500 text-sm mt-2">شكراً لاختيارك NEXTWEARDZ</p>
          </div>
        </div>
      </main>
    </div>
  )
}
