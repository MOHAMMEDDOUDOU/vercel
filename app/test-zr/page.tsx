"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function TestZRPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState({
    customerName: "أحمد محمد",
    customerPhone: "0770123456",
    wilaya: "الجزائر",
    commune: "الحراش",
    address: "شارع الرئيسي، رقم 123",
    deliveryType: "home" as "home" | "office",
    products: [{ name: "تيشيرت كلاسيك", quantity: 1, price: 2500, size: "L" }],
    totalAmount: 2500,
    shippingCost: 500,
  })

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/zr-express/test-connection")
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error: "خطأ في الاتصال" })
    } finally {
      setLoading(false)
    }
  }

  const testOrderCreation = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/zr-express/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error: "خطأ في إنشاء الطلب" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">اختبار ZR Express</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* اختبار الاتصال */}
        <Card>
          <CardHeader>
            <CardTitle>اختبار الاتصال</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testConnection} disabled={loading} className="w-full">
              {loading ? "جاري الاختبار..." : "اختبار الاتصال"}
            </Button>
          </CardContent>
        </Card>

        {/* اختبار إنشاء الطلب */}
        <Card>
          <CardHeader>
            <CardTitle>اختبار إنشاء الطلب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>اسم العميل</Label>
              <Input
                value={orderData.customerName}
                onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input
                value={orderData.customerPhone}
                onChange={(e) => setOrderData({ ...orderData, customerPhone: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>الولاية</Label>
              <Select value={orderData.wilaya} onValueChange={(value) => setOrderData({ ...orderData, wilaya: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الجزائر">الجزائر</SelectItem>
                  <SelectItem value="وهران">وهران</SelectItem>
                  <SelectItem value="قسنطينة">قسنطينة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>البلدية</Label>
              <Input
                value={orderData.commune}
                onChange={(e) => setOrderData({ ...orderData, commune: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>نوع التوصيل</Label>
              <Select value={orderData.deliveryType} onValueChange={(value: "home" | "office") => setOrderData({ ...orderData, deliveryType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">توصيل للمنزل</SelectItem>
                  <SelectItem value="office">توصيل للمكتب</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={testOrderCreation} disabled={loading} className="w-full">
              {loading ? "جاري إنشاء الطلب..." : "إنشاء طلب تجريبي"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* النتائج */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle>النتيجة</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
