"use client"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Package, Truck, Phone } from "lucide-react"

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-600 mb-2">تم تأكيد طلبك بنجاح! 🎉</h1>
            <p className="text-gray-600">تم إرسال طلبك إلى ZR Express وسيتم التواصل معك قريباً</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                تفاصيل الطلب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderId && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">رقم الطلب</div>
                  <div className="font-mono font-semibold">{orderId}</div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Phone className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="font-semibold text-blue-800">التواصل</div>
                  <div className="text-sm text-blue-600">خلال 24 ساعة</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <Package className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="font-semibold text-orange-800">التحضير</div>
                  <div className="text-sm text-orange-600">1-2 يوم عمل</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Truck className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="font-semibold text-green-800">التوصيل</div>
                  <div className="text-sm text-green-600">2-5 أيام عمل</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">الخطوات التالية:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">
                    1
                  </span>
                  سيتواصل معك فريق ZR Express لتأكيد بيانات التوصيل
                </li>
                <li className="flex items-start">
                  <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">
                    2
                  </span>
                  سيتم تحضير طلبك وتجهيزه للشحن
                </li>
                <li className="flex items-start">
                  <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">
                    3
                  </span>
                  ستحصل على رقم تتبع لمراقبة حالة الطلب
                </li>
                <li className="flex items-start">
                  <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">
                    4
                  </span>
                  استلم طلبك وادفع عند الاستلام
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <Link href="/">
              <Button className="bg-orange-500 hover:bg-orange-600 mr-4">العودة للصفحة الرئيسية</Button>
            </Link>
            <Link href="/products">
              <Button variant="outline">تصفح المزيد من المنتجات</Button>
            </Link>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
            <p>
              <strong>هل تحتاج مساعدة؟</strong>
              <br />
              تواصل معنا عبر WhatsApp أو اتصل بخدمة العملاء
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
