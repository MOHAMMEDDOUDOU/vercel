"use client"

console.log("✅ ملف checkout/page.tsx تم تحميله");

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useCart } from "@/components/cart-provider"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Truck, Building2, CheckCircle, AlertTriangle } from "lucide-react"
import { WILAYAS_COMMUNES } from "@/lib/wilayas-communes"

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    wilaya: "",
    commune: undefined as string | undefined,
    address: "",
    deliveryType: "home" as "home" | "office",
  })

  const [shippingCost, setShippingCost] = useState(0)
  const [loading, setLoading] = useState(false)
  const [calculatingShipping, setCalculatingShipping] = useState(false)

  // حساب سعر التوصيل عند تغيير الولاية أو نوع التوصيل
  useEffect(() => {
    if (formData.wilaya && formData.deliveryType) {
      calculateShipping()
    }
  }, [formData.wilaya, formData.deliveryType, items])

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  // التحقق من وجود منتجات في السلة
  useEffect(() => {
    if (items.length === 0) {
      router.push("/products")
    }
  }, [items, router])

  const calculateShipping = async () => {
    setCalculatingShipping(true)
    try {
      const response = await fetch("/api/zr-express/calculate-shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wilaya: formData.wilaya,
          deliveryType: formData.deliveryType,
          quantity: items.reduce((sum, item) => sum + item.quantity, 0),
        }),
      })

      const data = await response.json()
      if (data.success) {
        setShippingCost(data.shippingCost)
      } else {
        // استخدام سعر افتراضي في حالة فشل الحساب
        const defaultCost = formData.deliveryType === "home" ? 800 : 450
        setShippingCost(defaultCost)
        toast({
          title: "تنبيه",
          description: `تم استخدام سعر توصيل افتراضي: ${defaultCost} دج`,
        })
      }
    } catch (error) {
      // في حالة فشل حساب التوصيل، نستخدم سعر افتراضي
      const defaultCost = formData.deliveryType === "home" ? 800 : 450
      setShippingCost(defaultCost)
      console.error("Error calculating shipping:", error)
    } finally {
      setCalculatingShipping(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("🚩 handleSubmit تم استدعاؤها");
    e.preventDefault()
    setLoading(true)
    console.log("🚩 بدأ تنفيذ handleSubmit");

    try {
      // التحقق من صحة البيانات
      if (!formData.customerName.trim()) {
        console.log("❌ الاسم الكامل مطلوب");
        throw new Error("الاسم الكامل مطلوب")
      }
      if (!formData.customerPhone.trim()) {
        console.log("❌ رقم الهاتف مطلوب");
        throw new Error("رقم الهاتف مطلوب")
      }
      if (!formData.wilaya) {
        console.log("❌ الولاية مطلوبة");
        throw new Error("الولاية مطلوبة")
      }
      if (
        formData.deliveryType === "home" &&
        (!formData.commune || formData.commune === "0" || formData.commune === "")
      ) {
        console.log("❌ البلدية مطلوبة للتوصيل للمنزل");
        throw new Error("البلدية مطلوبة للتوصيل للمنزل")
      }
      if (!formData.address.trim()) {
        console.log("❌ العنوان مطلوب");
        throw new Error("العنوان مطلوب")
      }

      // تحضير بيانات الطلب
      const orderData = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.replace(/\s/g, ""),
        wilaya: formData.wilaya,
        commune: formData.commune || "",
        address: formData.address.trim(),
        products: items.map((item) => ({
          name: item.name,
          size: item.size || "غير محدد",
          quantity: item.quantity,
          price: item.price,
        })),
        shippingCost,
        totalAmount: total + shippingCost,
        deliveryType: formData.deliveryType,
      }
      console.log("🚩 بيانات الطلب إلى Supabase:", orderData);

      // إرسال الطلب إلى API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()
      console.log("🚩 نتيجة حفظ الطلب في Supabase:", result);

      if (result.success) {
        // إظهار رسالة نجاح
        toast({
          title: "تم تأكيد طلبك! 🎉",
          description: `رقم الطلب: ${result.orderNumber}`,
          duration: 4000,
        });

        // مسح السلة
        clearCart();

        // التوجيه إلى صفحة التأكيد
        router.push(
          `/order-confirmation?orderId=${result.orderId || "unknown"}&orderNumber=${result.orderNumber || "unknown"}`,
        );
      } else {
        console.log("❌ فشل في إنشاء الطلب في Supabase:", result.error);
        throw new Error(result.error || "فشل في إنشاء الطلب");
      }
    } catch (error) {
      console.error("خطأ في إنشاء الطلب:", error)
      toast({
        title: "خطأ في إنشاء الطلب",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const availableCommunes = formData.wilaya
    ? WILAYAS_COMMUNES[formData.wilaya as keyof typeof WILAYAS_COMMUNES] || []
    : []

  useEffect(() => {
    console.log("✅ يتم تنفيذ return في صفحة checkout")
  });

  if (!user || items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-12">تأكيد الطلب</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* نموذج البيانات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-orange-500" />
                  بيانات التوصيل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="customerName">الاسم الكامل *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                      required
                      placeholder="أدخل اسمك الكامل"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerPhone">رقم الهاتف *</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, customerPhone: e.target.value }))}
                      required
                      placeholder="0555123456"
                      className="mt-1"
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerEmail">البريد الإلكتروني (اختياري)</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData((prev) => ({ ...prev, customerEmail: e.target.value }))}
                      placeholder="example@email.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="wilaya">الولاية *</Label>
                    <Select
                      value={formData.wilaya}
                      onValueChange={(value) => {
                        setFormData((prev) => ({ ...prev, wilaya: value, commune: undefined }))
                      }}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر الولاية" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(WILAYAS_COMMUNES).map((wilaya) => (
                          <SelectItem key={wilaya} value={wilaya}>
                            {wilaya}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.deliveryType === "home" && (
                    <div>
                      <Label htmlFor="commune">البلدية</Label>
                      <Select
                        value={formData.commune || ""}
                        onValueChange={(value) => {
                          setFormData((prev) => ({ ...prev, commune: value }))
                        }}
                        disabled={!formData.wilaya}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={formData.wilaya ? "اختر البلدية" : "اختر الولاية أولاً"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCommunes.map((commune: string) => (
                            <SelectItem key={commune} value={commune}>
                              {commune}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="address">العنوان التفصيلي *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                      required
                      placeholder="أدخل عنوانك بالتفصيل (الحي، الشارع، رقم المنزل)"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>نوع التوصيل *</Label>
                    <RadioGroup
                      value={formData.deliveryType}
                      onValueChange={(value: "home" | "office") =>
                        setFormData((prev) => ({ ...prev, deliveryType: value }))
                      }
                      className="mt-3"
                    >
                      <div className="flex items-center space-x-3 space-x-reverse p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="home" id="home" />
                        <Label htmlFor="home" className="flex items-center cursor-pointer flex-1">
                          <Truck className="ml-2 h-5 w-5 text-orange-500" />
                          <div>
                            <div className="font-medium">توصيل للمنزل</div>
                            <div className="text-sm text-gray-500">التوصيل إلى عنوان منزلك</div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="office" id="office" />
                        <Label htmlFor="office" className="flex items-center cursor-pointer flex-1">
                          <Building2 className="ml-2 h-5 w-5 text-orange-500" />
                          <div>
                            <div className="font-medium">توصيل للمكتب (Stop Desk)</div>
                            <div className="text-sm text-gray-500">استلام من مكتب التوصيل</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg font-semibold"
                    disabled={
                      loading ||
                      calculatingShipping ||
                      !formData.wilaya ||
                      !formData.customerName ||
                      !formData.customerPhone ||
                      !formData.address ||
                      (formData.deliveryType === "home" &&
                        (!formData.commune || formData.commune === "0" || formData.commune === ""))
                    }
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        جاري إنشاء الطلب...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        تأكيد الطلب - {total + shippingCost} دج
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* ملخص الطلب */}
            <Card>
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* المنتجات */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.size && `المقاس: ${item.size} • `}الكمية: {item.quantity}
                        </div>
                      </div>
                      <span className="font-semibold">{item.price * item.quantity} دج</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span className="font-semibold">{total} دج</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>سعر التوصيل:</span>
                    <div className="text-left">
                      {calculatingShipping ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className="font-semibold">{shippingCost} دج</span>
                      )}
                    </div>
                  </div>

                  {formData.wilaya && formData.deliveryType && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      📍 {formData.wilaya} - {formData.deliveryType === "home" ? "توصيل للمنزل" : "توصيل للمكتب"}
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>الإجمالي:</span>
                      <span className="text-orange-600">{total + shippingCost} دج</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-sm font-medium text-green-800">الدفع عند الاستلام</div>
                  <div className="text-xs text-green-600 mt-1">ادفع عندما تستلم طلبك</div>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-orange-800 mb-1">📦 معلومات التوصيل</div>
                  <div className="text-xs text-orange-600">
                    • سيتم حفظ طلبك في نظامنا
                    <br />• سيتم التواصل معك خلال 24 ساعة
                    <br />• مدة التوصيل: 2-5 أيام عمل حسب الولاية
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">ملاحظة</span>
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    سيتم حفظ طلبك محلياً وسيقوم فريقنا بمراجعته والتواصل معك لتأكيد التفاصيل
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
