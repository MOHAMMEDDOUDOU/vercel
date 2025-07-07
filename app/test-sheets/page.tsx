"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { CheckCircle, AlertCircle, Loader2, Repeat } from "lucide-react"

export default function TestSheetsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [orderId, setOrderId] = useState("test-order-123")
  const [orderNumber, setOrderNumber] = useState("NW-test-order-123")

  const testGoogleSheets = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log('🧪 بدء اختبار Google Sheets...')
      
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          orderNumber: orderNumber
        }),
      })

      const data = await response.json()
      
      console.log('📊 نتيجة الاختبار:', data)
      
      if (response.ok && data.success) {
        setResult({ success: true, data, skipped: data.skipped })
        if (data.skipped) {
          toast.success('⚠️ الطلب موجود بالفعل في Google Sheets')
        } else {
          toast.success('✅ تم اختبار Google Sheets بنجاح!')
        }
      } else {
        setResult({ success: false, error: data.error || data.details })
        toast.error('❌ فشل في اختبار Google Sheets')
      }
    } catch (error) {
      console.error('❌ خطأ في الاختبار:', error)
      setResult({ success: false, error: error instanceof Error ? error.message : 'خطأ غير معروف' })
      toast.error('❌ حدث خطأ في الاختبار')
    } finally {
      setLoading(false)
    }
  }

  const testDuplicatePrevention = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log('🔄 بدء اختبار منع التكرار...')
      
      // الإرسال الأول
      const response1 = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderNumber }),
      })
      const data1 = await response1.json()
      
      console.log('📊 نتيجة الإرسال الأول:', data1)
      
      // الإرسال الثاني (يجب أن يتم تخطيه)
      const response2 = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderNumber }),
      })
      const data2 = await response2.json()
      
      console.log('📊 نتيجة الإرسال الثاني:', data2)
      
      if (data1.success && data2.success && data2.skipped) {
        setResult({ 
          success: true, 
          firstSend: data1, 
          secondSend: data2,
          duplicatePrevention: true
        })
        toast.success('✅ اختبار منع التكرار نجح!')
      } else {
        setResult({ 
          success: false, 
          firstSend: data1, 
          secondSend: data2,
          error: 'فشل في اختبار منع التكرار'
        })
        toast.error('❌ فشل في اختبار منع التكرار')
      }
    } catch (error) {
      console.error('❌ خطأ في اختبار منع التكرار:', error)
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'خطأ غير معروف' 
      })
      toast.error('❌ حدث خطأ في اختبار منع التكرار')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">اختبار Google Sheets</h1>
          <p className="text-xl text-gray-600">اختبار الاتصال وإرسال البيانات إلى Google Sheets</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* بيانات الاختبار */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                بيانات الاختبار
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Order ID</Label>
                <Input 
                  value={orderId} 
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="test-order-123"
                />
              </div>
              <div>
                <Label>Order Number</Label>
                <Input 
                  value={orderNumber} 
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="NW-test-order-123"
                />
              </div>
            </CardContent>
          </Card>

          {/* أزرار الاختبار */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                اختبارات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testGoogleSheets}
                disabled={loading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الاختبار...
                  </>
                ) : (
                  'اختبار إرسال واحد'
                )}
              </Button>

              <Button 
                onClick={testDuplicatePrevention}
                disabled={loading}
                className="w-full h-12 bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الاختبار...
                  </>
                ) : (
                  <>
                    <Repeat className="w-4 h-4 mr-2" />
                    اختبار منع التكرار
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* النتيجة */}
        {result && (
          <Card className="mt-8 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                نتيجة الاختبار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              
              {result.duplicatePrevention && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">✅ اختبار منع التكرار نجح!</h4>
                  <p className="text-green-700 text-sm">
                    • الإرسال الأول: تم بنجاح<br/>
                    • الإرسال الثاني: تم تخطيه (الطلب موجود بالفعل)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* معلومات إضافية */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle>معلومات إضافية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">المتغيرات البيئية المطلوبة:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• GOOGLE_SERVICE_ACCOUNT_EMAIL</li>
                  <li>• GOOGLE_PRIVATE_KEY</li>
                  <li>• GOOGLE_SHEET_ID</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">أعمدة Google Sheets:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>A: التاريخ والوقت</li>
                  <li>B: رقم الطلب</li>
                  <li>C: اسم العميل</li>
                  <li>D: الهاتف</li>
                  <li>E: الولاية</li>
                  <li>F: البلدية</li>
                  <li>G: نوع التوصيل</li>
                  <li>H: الكمية</li>
                  <li>I: حالة الطلب</li>
                  <li>J: اسم المنتج</li>
                  <li>K: الحجم</li>
                  <li>L: سعر المنتج</li>
                  <li>M: سعر التوصيل</li>
                  <li>N: المجموع الكلي</li>
                  <li>O: ملاحظات</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">ميزات جديدة:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• منع التكرار التلقائي</li>
                  <li>• التحقق من وجود الطلب</li>
                  <li>• رسائل تتبع مفصلة</li>
                  <li>• معالجة الأخطاء المحسنة</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 