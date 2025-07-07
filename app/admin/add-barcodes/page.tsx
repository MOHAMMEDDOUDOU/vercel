"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  QrCode, 
  Plus, 
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  Eye
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import Link from "next/link"
import QRCode from "qrcode"

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  barcode?: string
}

export default function AddBarcodesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [barcodeInputs, setBarcodeInputs] = useState<Record<string, string>>({})
  const [showBarcode, setShowBarcode] = useState<string | null>(null)
  const qrCodeRef = useRef<HTMLCanvasElement>(null)

  // جلب المنتجات
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name")

      if (error) throw error

      setProducts(data || [])
      
      // تهيئة حقول الباركود
      const inputs: Record<string, string> = {}
      data?.forEach(product => {
        inputs[product.id] = product.barcode || ""
      })
      setBarcodeInputs(inputs)
    } catch (error) {
      console.error("❌ خطأ في جلب المنتجات:", error)
      toast.error("فشل في جلب المنتجات")
    } finally {
      setLoading(false)
    }
  }

  // حفظ الباركود
  const saveBarcode = async (productId: string, barcode: string) => {
    if (!barcode.trim()) {
      toast.error("الباركود مطلوب")
      return
    }

    setSaving(true)
    try {
      // التحقق من عدم وجود باركود مكرر
      const { data: existingProduct, error: checkError } = await supabase
        .from("products")
        .select("id, name")
        .eq("barcode", barcode.trim())
        .neq("id", productId)
        .single()

      if (existingProduct) {
        toast.error(`هذا الباركود مستخدم بالفعل للمنتج: ${existingProduct.name}`)
        return
      }

      // حفظ الباركود
      const { error } = await supabase
        .from("products")
        .update({ barcode: barcode.trim() })
        .eq("id", productId)

      if (error) throw error

      // تحديث المنتج المحلي
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, barcode: barcode.trim() }
          : product
      ))

      toast.success("تم حفظ الباركود بنجاح")
      console.log("✅ تم حفظ الباركود:", { productId, barcode })
    } catch (error) {
      console.error("❌ خطأ في حفظ الباركود:", error)
      toast.error("فشل في حفظ الباركود")
    } finally {
      setSaving(false)
    }
  }

  // إنشاء باركود تلقائي
  const generateBarcode = (product: Product) => {
    const category = product.category.toUpperCase()
    const name = product.name.replace(/\s+/g, '-').toUpperCase()
    const randomId = Math.random().toString(36).substr(2, 6).toUpperCase()
    const barcode = `${category}-${name}-${randomId}`
    
    // تحديث الحقل
    setBarcodeInputs(prev => ({
      ...prev,
      [product.id]: barcode
    }))
    
    return barcode
  }

  // عرض الباركود
  const showBarcodeModal = (barcode: string) => {
    setShowBarcode(barcode)
    // إنشاء QR Code بعد عرض المودال
    setTimeout(() => {
      if (qrCodeRef.current) {
        try {
          QRCode.toCanvas(qrCodeRef.current, barcode, {
            width: 200,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF"
            }
          })
        } catch (error) {
          console.error("❌ خطأ في إنشاء QR Code:", error)
        }
      }
    }, 100)
  }

  // تحميل QR Code كصورة
  const downloadBarcode = () => {
    if (qrCodeRef.current && showBarcode) {
      const canvas = qrCodeRef.current
      const link = document.createElement("a")
      link.download = `qrcode-${showBarcode}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  // حفظ جميع الباركود
  const saveAllBarcodes = async () => {
    setSaving(true)
    try {
      let savedCount = 0
      
      for (const [productId, barcode] of Object.entries(barcodeInputs)) {
        if (barcode.trim()) {
          await saveBarcode(productId, barcode.trim())
          savedCount++
        }
      }

      toast.success(`تم حفظ ${savedCount} باركود بنجاح`)
    } catch (error) {
      console.error("❌ خطأ في حفظ الباركودات:", error)
      toast.error("فشل في حفظ بعض الباركودات")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                العودة للإدارة
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إضافة باركود للمنتجات</h1>
              <p className="text-gray-600">إنشاء باركود فريد لكل منتج لاستخدامه في نظام إدارة المخزون</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            <QrCode className="h-4 w-4 mr-1" />
            نظام الباركود
          </Badge>
        </div>

        {/* تعليمات */}
        <Card className="border-2 border-blue-200 bg-blue-50 shadow-xl mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-blue-800">
              <QrCode className="mr-2 h-5 w-5" />
              أهمية الباركود في نظام الإنتاج
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-900 mb-2">🎯 الغرض من الباركود:</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• كل منتج يحتاج باركود فريد</li>
                  <li>• عند إنتاج قطعة جديدة، مسح الباركود يزيد المخزون تلقائياً</li>
                  <li>• تتبع دقيق للمخزون والإنتاج</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-blue-900 mb-2">📋 خطوات العمل:</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• أضف باركود لكل منتج</li>
                  <li>• اطبع الباركود من صفحة الطباعة</li>
                  <li>• استخدم الباركود في صفحة المسح عند الإنتاج</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المنتجات</p>
                  <p className="text-2xl font-bold text-blue-600">{products.length}</p>
                </div>
                <QrCode className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">المنتجات مع باركود</p>
                  <p className="text-2xl font-bold text-green-600">
                    {products.filter(p => p.barcode).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">بدون باركود</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {products.filter(p => !p.barcode).length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* قائمة المنتجات */}
        <Card className="border-2 border-gray-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <QrCode className="mr-2 h-5 w-5" />
                قائمة المنتجات
              </CardTitle>
              <Button 
                onClick={saveAllBarcodes}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                حفظ جميع الباركود
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="mr-2 text-gray-600">جاري تحميل المنتجات...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>الفئة: {product.category}</span>
                            <span>السعر: {product.price} دج</span>
                            <span>المخزون: {product.stock}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {product.barcode ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              له باركود
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              بدون باركود
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={barcodeInputs[product.id] || ""}
                        onChange={(e) => setBarcodeInputs(prev => ({
                          ...prev,
                          [product.id]: e.target.value
                        }))}
                        placeholder="أدخل الباركود..."
                        className="w-48 font-mono text-sm"
                      />
                      <Button
                        onClick={() => {
                          const barcode = generateBarcode(product)
                          showBarcodeModal(barcode)
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <QrCode className="h-3 w-3 mr-1" />
                        توليد
                      </Button>
                      {barcodeInputs[product.id] && (
                        <Button
                          onClick={() => showBarcodeModal(barcodeInputs[product.id])}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          عرض
                        </Button>
                      )}
                      <Button
                        onClick={() => saveBarcode(product.id, barcodeInputs[product.id] || "")}
                        disabled={saving || !barcodeInputs[product.id]?.trim()}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {saving ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Save className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* مودال عرض الباركود */}
        {showBarcode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">باركود المنتج</h3>
                <Button
                  onClick={() => setShowBarcode(null)}
                  variant="outline"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
              <div className="text-center space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg flex justify-center items-center">
                  <canvas ref={qrCodeRef} style={{ maxWidth: '200px', maxHeight: '200px', width: 'auto', height: 'auto' }}></canvas>
                </div>
                <p className="font-mono text-sm text-gray-600">{showBarcode}</p>
                <div className="flex space-x-2">
                  <Button
                    onClick={downloadBarcode}
                    className="flex-1"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    تحميل
                  </Button>
                  <Button
                    onClick={() => setShowBarcode(null)}
                    className="flex-1"
                  >
                    إغلاق
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 