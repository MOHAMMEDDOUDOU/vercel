"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Scan, 
  Plus, 
  Search, 
  Package, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Loader2
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  barcode?: string
  category: string
  images: string[]
}

export default function BarcodeScannerPage() {
  const [scannedBarcode, setScannedBarcode] = useState("")
  const [manualBarcode, setManualBarcode] = useState("")
  const [foundProduct, setFoundProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [quantityToAdd, setQuantityToAdd] = useState(1)
  const [recentScans, setRecentScans] = useState<Array<{
    barcode: string
    productName: string
    quantity: number
    timestamp: Date
  }>>([])

  // البحث عن المنتج بالباركود
  const searchProductByBarcode = async (barcode: string) => {
    if (!barcode.trim()) return

    setLoading(true)
    try {
      console.log("🔍 البحث عن المنتج بالباركود:", barcode)
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("barcode", barcode.trim())
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          // المنتج غير موجود
          setFoundProduct(null)
          toast.error("المنتج غير موجود في قاعدة البيانات")
        } else {
          throw error
        }
      } else {
        setFoundProduct(data)
        toast.success(`تم العثور على: ${data.name}`)
        console.log("✅ المنتج الموجود:", data)
      }
    } catch (error) {
      console.error("❌ خطأ في البحث:", error)
      toast.error("خطأ في البحث عن المنتج")
      setFoundProduct(null)
    } finally {
      setLoading(false)
    }
  }

  // زيادة المخزون
  const increaseStock = async () => {
    if (!foundProduct || quantityToAdd <= 0) return

    setLoading(true)
    try {
      const newStock = foundProduct.stock + quantityToAdd
      
      console.log("📦 زيادة المخزون:", {
        productId: foundProduct.id,
        currentStock: foundProduct.stock,
        quantityToAdd,
        newStock
      })

      const { error } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", foundProduct.id)

      if (error) throw error

      // تحديث المنتج المحلي
      setFoundProduct({
        ...foundProduct,
        stock: newStock
      })

      // إضافة إلى السجل
      setRecentScans(prev => [{
        barcode: foundProduct.barcode || "",
        productName: foundProduct.name,
        quantity: quantityToAdd,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]) // الاحتفاظ بـ 10 عمليات فقط

      toast.success(`تم زيادة المخزون بـ ${quantityToAdd} قطعة`)
      console.log("✅ تم تحديث المخزون بنجاح")

      // إعادة تعيين الكمية
      setQuantityToAdd(1)
    } catch (error) {
      console.error("❌ خطأ في تحديث المخزون:", error)
      toast.error("فشل في تحديث المخزون")
    } finally {
      setLoading(false)
    }
  }

  // محاكاة مسح الباركود (للتطوير)
  const simulateBarcodeScan = () => {
    setScanning(true)
    // محاكاة تأخير المسح
    setTimeout(() => {
      const mockBarcodes = [
        "TSHIRT-BLK-L-001",
        "SALOPETTE-NOIR-M-002", 
        "CASQUETTE-BLANC-003",
        "GELIET-ROUGE-S-004"
      ]
      const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)]
      setScannedBarcode(randomBarcode)
      setManualBarcode(randomBarcode)
      searchProductByBarcode(randomBarcode)
      setScanning(false)
    }, 1000)
  }

  // البحث عند تغيير الباركود
  useEffect(() => {
    if (scannedBarcode) {
      searchProductByBarcode(scannedBarcode)
    }
  }, [scannedBarcode])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                العودة للإدارة
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">مسح الباركود</h1>
              <p className="text-gray-600">زيادة المخزون بمسح الباركود</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            <Package className="h-4 w-4 mr-1" />
            إدارة المخزون
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* مسح الباركود */}
          <Card className="border-2 border-orange-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Scan className="mr-2 h-5 w-5" />
                مسح الباركود
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* محاكاة المسح (للتطوير) */}
              <div className="text-center">
                <Button 
                  onClick={simulateBarcodeScan}
                  disabled={scanning}
                  className="w-full h-16 text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      جاري المسح...
                    </>
                  ) : (
                    <>
                      <Scan className="mr-2 h-6 w-6" />
                      محاكاة مسح الباركود
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  (للتطوير - يختار باركود عشوائي)
                </p>
              </div>

              <Separator />

              {/* إدخال يدوي */}
              <div>
                <Label htmlFor="manualBarcode" className="text-base font-semibold text-gray-900 mb-3 block">
                  إدخال الباركود يدوياً
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="manualBarcode"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    placeholder="أدخل الباركود هنا..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        searchProductByBarcode(manualBarcode)
                      }
                    }}
                  />
                  <Button 
                    onClick={() => searchProductByBarcode(manualBarcode)}
                    disabled={loading || !manualBarcode.trim()}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* الباركود الممسوح */}
              {scannedBarcode && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">الباركود الممسوح:</p>
                      <p className="text-lg font-mono text-green-800">{scannedBarcode}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* تفاصيل المنتج */}
          <Card className="border-2 border-blue-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                تفاصيل المنتج
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="mr-2 text-gray-600">جاري البحث...</span>
                </div>
              ) : foundProduct ? (
                <div className="space-y-4">
                  {/* معلومات المنتج */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-lg text-blue-900 mb-2">{foundProduct.name}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">الفئة:</span>
                        <span className="font-medium text-blue-800 mr-2">{foundProduct.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">السعر:</span>
                        <span className="font-medium text-blue-800 mr-2">{foundProduct.price} دج</span>
                      </div>
                      <div>
                        <span className="text-gray-600">المخزون الحالي:</span>
                        <span className={`font-bold mr-2 ${
                          foundProduct.stock > 10 ? "text-green-600" : 
                          foundProduct.stock > 0 ? "text-orange-600" : "text-red-600"
                        }`}>
                          {foundProduct.stock} قطعة
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">الباركود:</span>
                        <span className="font-mono text-blue-800 mr-2">{foundProduct.barcode}</span>
                      </div>
                    </div>
                  </div>

                  {/* زيادة المخزون */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3">زيادة المخزون</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Label htmlFor="quantity" className="text-sm text-green-700 mb-1 block">
                          الكمية المراد إضافتها
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={quantityToAdd}
                          onChange={(e) => setQuantityToAdd(Math.max(1, Number(e.target.value) || 1))}
                          min="1"
                          className="border-green-300 focus:border-green-500"
                        />
                      </div>
                      <Button
                        onClick={increaseStock}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            إضافة
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-green-600 mt-2">
                      المخزون الجديد سيكون: {foundProduct.stock + quantityToAdd} قطعة
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <AlertCircle className="h-8 w-8 mr-2" />
                  <span>لم يتم العثور على منتج</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* سجل المسح */}
        {recentScans.length > 0 && (
          <Card className="border-2 border-gray-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                سجل المسح الأخير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentScans.map((scan, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Plus className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{scan.productName}</p>
                        <p className="text-sm text-gray-500 font-mono">{scan.barcode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+{scan.quantity}</p>
                      <p className="text-xs text-gray-500">
                        {scan.timestamp.toLocaleTimeString('ar-SA')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 