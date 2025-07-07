"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  QrCode, 
  Printer,
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

export default function PrintBarcodesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
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
    } catch (error) {
      console.error("❌ خطأ في جلب المنتجات:", error)
      toast.error("فشل في جلب المنتجات")
    } finally {
      setLoading(false)
    }
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

  // طباعة الباركودات المختارة
  const printSelectedBarcodes = () => {
    if (selectedProducts.length === 0) {
      toast.error("الرجاء اختيار منتجات للطباعة")
      return
    }

    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id) && p.barcode)
    
    if (selectedProductsData.length === 0) {
      toast.error("المنتجات المختارة ليس لها باركود")
      return
    }

    // إنشاء نافذة طباعة
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error("فشل في فتح نافذة الطباعة")
      return
    }

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>طباعة الباركودات</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            direction: rtl;
            background: white;
          }
          .barcode-container {
            display: inline-block;
            margin: 15px;
            padding: 15px;
            border: 2px solid #333;
            text-align: center;
            page-break-inside: avoid;
            background: white;
            min-width: 200px;
            max-width: 250px;
          }
          .product-name {
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 16px;
            color: #333;
          }
          .product-info {
            font-size: 12px;
            color: #666;
            margin-bottom: 15px;
            line-height: 1.4;
          }
          .barcode {
            margin: 15px 0;
            background: white;
            padding: 10px;
            border: 1px solid #ddd;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .barcode canvas {
            max-width: 180px;
            max-height: 180px;
            width: auto;
            height: auto;
          }
          .barcode-text {
            font-family: monospace;
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-top: 10px;
            background: #f8f8f8;
            padding: 5px;
            border-radius: 3px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f8f8;
            border-radius: 8px;
          }
          .header h1 {
            color: #333;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            color: #666;
            margin: 5px 0 0 0;
            font-size: 14px;
          }
          @media print {
            .barcode-container {
              page-break-inside: avoid;
              break-inside: avoid;
              border: 2px solid #000;
            }
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>باركودات المنتجات</h1>
          <p>نظام إدارة المخزون - NextWear</p>
          <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        ${selectedProductsData.map(product => `
          <div class="barcode-container">
            <div class="product-name">${product.name}</div>
            <div class="product-info">
              الفئة: ${product.category}<br>
              السعر: ${product.price} دج<br>
              المخزون: ${product.stock} قطعة
            </div>
            <div class="barcode">
              <canvas id="qrcode-${product.id}"></canvas>
            </div>
            <div class="barcode-text">${product.barcode}</div>
          </div>
        `).join('')}
        <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js"></script>
        <script>
          ${selectedProductsData.map(product => `
            QRCode.toCanvas(document.getElementById("qrcode-${product.id}"), "${product.barcode}", {
              width: 200,
              margin: 2,
              color: {
                dark: "#000000",
                light: "#FFFFFF"
              }
            });
          `).join('')}
        </script>
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  // اختيار/إلغاء اختيار جميع المنتجات
  const toggleAllProducts = () => {
    if (selectedProducts.length === products.filter(p => p.barcode).length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.filter(p => p.barcode).map(p => p.id))
    }
  }

  // اختيار/إلغاء اختيار منتج واحد
  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const productsWithBarcode = products.filter(p => p.barcode)
  const productsWithoutBarcode = products.filter(p => !p.barcode)

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
              <h1 className="text-3xl font-bold text-gray-900">طباعة باركود المنتجات</h1>
              <p className="text-gray-600">طباعة الباركودات لاستخدامها في نظام إدارة المخزون والإنتاج</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            <Printer className="h-4 w-4 mr-1" />
            طباعة الباركود
          </Badge>
        </div>

        {/* تعليمات */}
        <Card className="border-2 border-green-200 bg-green-50 shadow-xl mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-green-800">
              <Printer className="mr-2 h-5 w-5" />
              خطوات طباعة الباركود للإنتاج
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs">1</div>
                <div>
                  <p className="font-medium text-green-900">اختر المنتجات</p>
                  <p className="text-green-700">حدد المنتجات التي تريد طباعة باركود لها</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs">2</div>
                <div>
                  <p className="font-medium text-green-900">اطبع الباركودات</p>
                  <p className="text-green-700">اضغط "طباعة المختار" لطباعة الباركودات</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs">3</div>
                <div>
                  <p className="font-medium text-green-900">استخدم في الإنتاج</p>
                  <p className="text-green-700">مسح الباركود عند إنتاج قطعة جديدة</p>
                </div>
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
                  <p className="text-sm text-gray-600">مع باركود</p>
                  <p className="text-2xl font-bold text-green-600">{productsWithBarcode.length}</p>
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
                  <p className="text-2xl font-bold text-orange-600">{productsWithoutBarcode.length}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* أزرار التحكم */}
        <Card className="border-2 border-gray-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Printer className="mr-2 h-5 w-5" />
                طباعة الباركودات
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={toggleAllProducts}
                  variant="outline"
                  size="sm"
                  className="text-white border-white hover:bg-white hover:text-gray-700"
                >
                  {selectedProducts.length === productsWithBarcode.length ? "إلغاء الكل" : "اختيار الكل"}
                </Button>
                <Button 
                  onClick={printSelectedBarcodes}
                  disabled={selectedProducts.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  طباعة المختار ({selectedProducts.length})
                </Button>
              </div>
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
                {/* المنتجات مع باركود */}
                {productsWithBarcode.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-700">
                      المنتجات مع باركود ({productsWithBarcode.length})
                    </h3>
                    <div className="space-y-2">
                      {productsWithBarcode.map((product) => (
                        <div key={product.id} className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <Checkbox
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={() => toggleProduct(product.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>الفئة: {product.category}</span>
                                  <span>السعر: {product.price} دج</span>
                                  <span>المخزون: {product.stock}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  له باركود
                                </Badge>
                                <Button
                                  onClick={() => showBarcodeModal(product.barcode!)}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  عرض
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* المنتجات بدون باركود */}
                {productsWithoutBarcode.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-orange-700">
                      المنتجات بدون باركود ({productsWithoutBarcode.length})
                    </h3>
                    <div className="space-y-2">
                      {productsWithoutBarcode.map((product) => (
                        <div key={product.id} className="flex items-center space-x-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>الفئة: {product.category}</span>
                                  <span>السعر: {product.price} دج</span>
                                  <span>المخزون: {product.stock}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="destructive">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  بدون باركود
                                </Badge>
                                <Link href="/admin/add-barcodes">
                                  <Button variant="outline" size="sm" className="text-xs">
                                    <QrCode className="h-3 w-3 mr-1" />
                                    إضافة باركود
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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