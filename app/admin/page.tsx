"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle,
  Clock,
  Package,
  Edit,
  Star,
  Eye,
  EyeOff,
  ShoppingBag,
  AlertCircle,
  AlertTriangle,
  MessageCircle,
  Phone,
} from "lucide-react"
import { orderService, productService, type Order, type Product } from "@/lib/supabase"
import { useProducts } from "@/hooks/use-products"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import QRCode from "qrcode"

// بيانات الدخول
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "nextwear2024"

export default function AdminPage() {
  // حماية دخول بسيطة
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [loginError, setLoginError] = useState("")

  // الطلبات
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("connecting")
  const [stats, setStats] = useState({
    total: 0,
    totalQuantity: 0,
    byProduct: {} as Record<string, number>,
    today: 0,
  })

  // المنتجات
  const { products, loading: productsLoading, addProduct, updateProduct, deleteProduct, refetch } = useProducts()
  const [productStats, setProductStats] = useState({
    total: 0,
    byCategory: {} as Record<string, number>,
    featured: 0,
    inStock: 0,
    averagePrice: 0,
    totalStock: 0,
    lowStock: 0,
  })

  // إدارة المنتجات
  const [showAddProductDialog, setShowAddProductDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])

  const [productForm, setProductForm] = useState({
    name: "",
    price: 0,
    original_price: 0,
    description: "",
    category: "t-shirts" as "salopettes" | "t-shirts" | "casquettes" | "geliet",
    sizes: [] as string[],
    colors: [] as string[],
    images: [] as string[],
    in_stock: true,
    featured: false,
    stock: 0,
  })

  // قائمة المقاسات المتاحة
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]

  // توليد QR Code




  // جلب الطلبات
  const fetchOrders = async () => {
    try {
      setLoading(true)
      console.log("🔄 جاري جلب الطلبات...")
      
      const ordersData = await orderService.getAllOrders()
      const statsData = await orderService.getOrderStats()
      
      console.log("📦 الطلبات المجلوبة:", ordersData)
      console.log("📊 الإحصائيات:", statsData)
      
      setOrders(ordersData)
      setFilteredOrders(ordersData)
      setStats(statsData)
      setConnectionStatus("connected")
    } catch (error) {
      console.error("❌ خطأ في جلب الطلبات:", error)
      toast.error("فشل في جلب الطلبات")
      setConnectionStatus("disconnected")
    } finally {
      setLoading(false)
    }
  }

  // جلب إحصائيات المنتجات
  const fetchProductStats = async () => {
    try {
      const stats = await productService.getProductStats()
      setProductStats(stats)
    } catch (error) {
      toast.error("فشل في جلب إحصائيات المنتجات")
    }
  }

  // إعداد Real-time updates
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
      fetchProductStats()

      // الاشتراك في التحديثات المباشرة للطلبات
      const ordersSubscription = orderService.subscribeToOrders((payload) => {
        console.log("🔄 تحديث مباشر للطلبات:", payload)
        
        // إعادة جلب الطلبات عند أي تغيير
        setTimeout(() => {
          fetchOrders()
        }, 500) // تأخير صغير لضمان حفظ البيانات
        
        if (payload.eventType === "INSERT") {
          toast.success("طلب جديد تم إضافته!")
        } else if (payload.eventType === "DELETE") {
          toast.info("تم حذف طلب")
        } else if (payload.eventType === "UPDATE") {
          toast.info("تم تحديث طلب")
        }
      })

      // الاشتراك في التحديثات المباشرة للمنتجات
      const productsSubscription = productService.subscribeToProducts((payload) => {
        console.log("🔄 تحديث مباشر للمنتجات:", payload)
        
        // إعادة جلب المنتجات عند أي تغيير
        setTimeout(() => {
          refetch()
          fetchProductStats()
        }, 500)
        
        if (payload.eventType === "INSERT") {
          toast.success("منتج جديد تم إضافته!")
        } else if (payload.eventType === "DELETE") {
          toast.info("تم حذف منتج")
        } else if (payload.eventType === "UPDATE") {
          toast.info("تم تحديث منتج")
        }
      })

      // إعادة المحاولة التلقائية كل 30 ثانية
      const interval = setInterval(() => {
        if (connectionStatus === "disconnected") {
          console.log("🔄 إعادة محاولة الاتصال...")
          fetchOrders()
        }
      }, 30000)

      return () => {
        ordersSubscription.unsubscribe()
        productsSubscription.unsubscribe()
        clearInterval(interval)
      }
    }
  }, [isAuthenticated, connectionStatus])

  // حذف طلب
  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
      return
    }
    
    try {
      await orderService.deleteOrder(orderId)
      toast.success("تم حذف الطلب بنجاح")
      fetchOrders() // إعادة جلب الطلبات
    } catch (error) {
      toast.error("فشل في حذف الطلب")
    }
  }

  // تحديث حالة الطلب
  const handleUpdateOrderStatus = async (orderId: number, status: "pending" | "confirmed" | "processing" | "cancelled") => {
    try {
      // منع النقر المزدوج
      const buttonId = `status-${orderId}-${status}`
      const button = document.getElementById(buttonId) as HTMLButtonElement
      if (button) {
        button.disabled = true
        button.textContent = "جاري التحديث..."
      }

      console.log("🔄 بدء تحديث حالة الطلب:", { orderId, status })

      // إذا كانت الحالة "مؤكد"، أرسل الطلب إلى ZR Express
      if (status === "confirmed") {
        const order = orders.find(o => o.id === orderId)
        console.log("🔍 البحث عن الطلب:", { orderId, ordersCount: orders.length })
        console.log("🔍 الطلب الموجود:", order)
        if (order) {
          try {
            console.log("📦 إرسال الطلب إلى ZR Express:", {
              orderId: order.id,
              customerName: order.customer_name,
              customerPhone: order.phone_number,
              wilaya: order.wilaya,
              commune: order.commune,
              deliveryType: order["delivery-type"],
              productName: order.product_name,
              quantity: order.quantity,
              size: order.size
            })
            
            const requestData = {
              orderId: order.id,
              customerName: order.customer_name,
              customerPhone: order.phone_number,
              wilaya: order.wilaya || "غير محدد",
              commune: order.commune || "",
              address: order.wilaya || order.commune || "غير محدد",
              products: [{
                name: order.product_name,
                quantity: order.quantity,
                price: order.price || 0,
                size: order.size,
              }],
              deliveryType: order["delivery-type"] || "home",
              shippingCost: order.shipping_cost || 0,
              totalAmount: order.total_amount || 0,
            };
            
            console.log("📦 البيانات المرسلة إلى ZR Express:", requestData);
            
            const response = await fetch("/api/zr-express/create-order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestData),
            })

            const result = await response.json()
            
            if (result.success) {
              toast.success(`تم تأكيد الطلب وإرساله إلى ZR Express بنجاح! رقم التتبع: ${result.trackingNumber || "غير متوفر"}`)
            } else {
              toast.error(`فشل في إرسال الطلب إلى ZR Express: ${result.error}`)
              // إعادة تفعيل الزر
              if (button) {
                button.disabled = false
                button.textContent = getStatusText(status)
              }
              return // لا تحدث الحالة إذا فشل الإرسال
            }
          } catch (zrError) {
            console.error("❌ خطأ في إرسال الطلب إلى ZR Express:", zrError)
            toast.error("فشل في إرسال الطلب إلى ZR Express")
            // إعادة تفعيل الزر
            if (button) {
              button.disabled = false
              button.textContent = getStatusText(status)
            }
            return // لا تحدث الحالة إذا فشل الإرسال
          }
        }
      }

      await orderService.updateOrderStatus(orderId, status)
      
      console.log("🔄 تحديث حالة الطلب:", { orderId, status })
      
      // تحديث حالة الطلب في Google Sheets
      try {
        const order = orders.find(o => o.id === orderId)
        if (order) {
          console.log("📊 تحديث حالة الطلب في Google Sheets:", order.id, status)
          const sheetsResponse = await fetch('/api/sheets', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              orderId: order.id,
              orderNumber: `NW-${order.id}`,
              status: status
            }),
          })
          
          const sheetsResult = await sheetsResponse.json()
          if (sheetsResult.success) {
            console.log("✅ تم تحديث حالة الطلب في Google Sheets بنجاح")
          } else {
            console.error("❌ فشل في تحديث حالة الطلب في Google Sheets:", sheetsResult.error)
          }
        }
      } catch (sheetsError) {
        console.error('❌ فشل في تحديث حالة الطلب في Google Sheets', sheetsError)
      }
      
      // إرسال الطلب إلى Google Sheets فقط إذا لم يكن موجوداً
      if (status === "confirmed") {
        try {
          const order = orders.find(o => o.id === orderId)
          if (order) {
            // التحقق من وجود الطلب في Google Sheets أولاً
            console.log("🔍 التحقق من وجود الطلب في Google Sheets:", order.id)
            const checkResponse = await fetch('/api/sheets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                orderId: order.id,
                orderNumber: `NW-${order.id}`
              }),
            })
            
            const checkResult = await checkResponse.json()
            if (checkResult.success) {
              if (checkResult.skipped) {
                console.log("⚠️ الطلب موجود بالفعل في Google Sheets - تم تخطي الإرسال")
                toast.info("الطلب موجود بالفعل في Google Sheets")
              } else {
                console.log("✅ تم إرسال الطلب إلى Google Sheets بنجاح")
                toast.success("تم إرسال الطلب إلى Google Sheets بنجاح")
              }
            } else {
              console.error("❌ فشل في إرسال الطلب إلى Google Sheets:", checkResult.error)
              toast.error("فشل في إرسال الطلب إلى Google Sheets")
            }
          } else {
            console.error("❌ لم يتم العثور على الطلب:", orderId)
          }
        } catch (err) {
          console.error('❌ فشل في إرسال الطلب إلى Google Sheets', err)
          toast.error("فشل في إرسال الطلب إلى Google Sheets")
        }
      } else {
        console.log("📝 الحالة غير مؤكدة - لا يتم إرسال الطلب إلى Google Sheets:", status)
      }
      
      // إذا كانت الحالة "مؤكد"، تحديث المخزون
      if (status === "confirmed") {
        const order = orders.find(o => o.id === orderId)
        if (order) {
          try {
            // البحث عن المنتج وتحديث المخزون
            const product = products.find(p => p.name === order.product_name)
            if (product) {
              const currentStock = product.stock ?? 0
              const newStock = Math.max(0, currentStock - order.quantity)
              await updateProduct(product.id, { stock: newStock })
              toast.success(`تم تحديث المخزون: ${product.name} - الكمية المتبقية: ${newStock}`)
            }
          } catch (stockError) {
            console.error("❌ خطأ في تحديث المخزون:", stockError)
            toast.error("فشل في تحديث المخزون")
          }
        }
      }
      
      toast.success(`تم تحديث حالة الطلب إلى: ${getStatusText(status)}`)
      fetchOrders() // إعادة جلب الطلبات
    } catch (error) {
      console.error("❌ خطأ في تحديث حالة الطلب:", error)
      toast.error("فشل في تحديث حالة الطلب")
    } finally {
      // إعادة تفعيل جميع الأزرار
      const buttons = document.querySelectorAll(`[id^="status-${orderId}-"]`) as NodeListOf<HTMLButtonElement>
      buttons.forEach(btn => {
        btn.disabled = false
        const statusFromId = btn.id.split('-')[2] as "pending" | "confirmed" | "processing" | "cancelled"
        btn.textContent = getStatusText(statusFromId)
      })
    }
  }

  // الحصول على نص الحالة بالعربية
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "قيد الانتظار"
      case "confirmed":
        return "مؤكد"
      case "processing":
        return "قيد المعالجة"
      case "cancelled":
        return "ملغي"
      default:
        return "غير محدد"
    }
  }

  // الحصول على لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "confirmed":
        return "bg-green-500 hover:bg-green-600"
      case "processing":
        return "bg-blue-500 hover:bg-blue-600"
      case "cancelled":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  // تطبيق تصفية الحالة
  const applyStatusFilter = (filter: string) => {
    setStatusFilter(filter)
    if (filter === "all") {
      setFilteredOrders(orders)
    } else {
      const filtered = orders.filter(order => order.status === filter || (!order.status && filter === "confirmed"))
      setFilteredOrders(filtered)
    }
  }

  // إدارة المنتجات
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      price: product.price,
      original_price: product.original_price || 0,
      description: product.description || "",
      category: product.category,
      sizes: product.sizes || [],
      colors: product.colors || [],
      images: product.images || [],
      in_stock: product.in_stock,
      featured: product.featured,
      stock: product.stock ?? 0,
    })
    setSelectedSizes(product.sizes || [])
    setShowAddProductDialog(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      return
    }
    
    try {
      await deleteProduct(productId)
      toast.success("تم حذف المنتج بنجاح")
      refetch() // إعادة جلب المنتجات
    } catch (error) {
      toast.error("فشل في حذف المنتج")
    }
  }

  const handleSaveProduct = async () => {
    try {
      // التحقق من البيانات المطلوبة
      if (!productForm.name.trim()) {
        toast.error("اسم المنتج مطلوب")
        return
      }

      if (productForm.price <= 0) {
        toast.error("السعر يجب أن يكون أكبر من صفر")
        return
      }

      // تحديث المقاسات من القائمة المختارة
      const updatedProductForm = {
        ...productForm,
        sizes: selectedSizes
      }

      console.log("📦 محاولة حفظ المنتج:", updatedProductForm)
      console.log("📏 المقاسات المختارة:", selectedSizes)

      if (editingProduct) {
        console.log("🔄 تحديث منتج موجود:", editingProduct.id)
        await updateProduct(editingProduct.id, updatedProductForm)
        toast.success("تم تحديث المنتج بنجاح")
      } else {
        console.log("➕ إضافة منتج جديد")
        await addProduct(updatedProductForm)
        toast.success("تم إضافة المنتج بنجاح")
      }
      setShowAddProductDialog(false)
      setEditingProduct(null)
      setSelectedSizes([])
      setProductForm({
        name: "",
        price: 0,
        original_price: 0,
        description: "",
        category: "t-shirts",
        sizes: [],
        colors: [],
        images: [],
        in_stock: true,
        featured: false,
        stock: 0,
      })
      refetch() // إعادة جلب المنتجات
    } catch (error) {
      console.error("❌ خطأ في حفظ المنتج:", error)
      toast.error(`فشل في حفظ المنتج: ${error instanceof Error ? error.message : "خطأ غير معروف"}`)
    }
  }

  // شاشة تسجيل الدخول
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundImage: `url('https://res.cloudinary.com/deh3ejeph/image/upload/v1750722801/new_photo_uetrbs.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="bg-black/80 backdrop-blur-sm rounded-xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center border border-gray-700">
          <Image src="https://res.cloudinary.com/deh3ejeph/image/upload/v1750720949/Screenshot_2025-06-23_at_22.03.01-removebg-preview_agpwrw.png" alt="NEXTWEARDZ Logo" width={180} height={60} className="mb-6" />
          <h2 className="text-2xl font-bold mb-4 text-white">تسجيل دخول الأدمن</h2>
          <form
            onSubmit={e => {
              e.preventDefault()
              if (loginForm.username === ADMIN_USERNAME && loginForm.password === ADMIN_PASSWORD) {
                setIsAuthenticated(true)
                setLoginError("")
              } else {
                setLoginError("اسم المستخدم أو كلمة المرور غير صحيحة")
              }
            }}
            className="w-full space-y-4"
          >
            <input
              type="text"
              placeholder="اسم المستخدم"
              className="w-full border border-gray-600 bg-black/50 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500 transition-colors"
              value={loginForm.username}
              onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="كلمة المرور"
              className="w-full border border-gray-600 bg-black/50 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500 transition-colors"
              value={loginForm.password}
              onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            {loginError && <div className="text-red-400 text-sm text-center">{loginError}</div>}
            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition">دخول</button>
          </form>
        </div>
      </div>
    )
  }

  // الصفحة الرئيسية للأدمن
  return (
    <div className="min-h-screen bg-gray-50 p-4" style={{
      backgroundImage: `url('https://res.cloudinary.com/deh3ejeph/image/upload/v1750722801/new_photo_uetrbs.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image 
              src="https://res.cloudinary.com/deh3ejeph/image/upload/v1750720949/Screenshot_2025-06-23_at_22.03.01-removebg-preview_agpwrw.png" 
              alt="NEXTWEARDZ Logo" 
              width={180} 
              height={60} 
              className="mb-2"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم الشاملة</h1>
              <p className="text-gray-600 mt-1">إدارة الطلبات والمنتجات مع التحديث اللحظي</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {/* مؤشر حالة الاتصال */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === "connected" ? "bg-green-500" : 
                connectionStatus === "connecting" ? "bg-yellow-500" : "bg-red-500"
              }`}></div>
              <span className="text-sm text-gray-600">
                {connectionStatus === "connected" ? "متصل" : 
                 connectionStatus === "connecting" ? "جاري الاتصال" : "غير متصل"}
              </span>
            </div>
            <Button onClick={fetchOrders} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              تحديث
            </Button>
            <Button 
              onClick={() => {
                setShowAddProductDialog(true)
                setEditingProduct(null)
                setSelectedSizes([])
                setProductForm({
                  name: "",
                  price: 0,
                  original_price: 0,
                  description: "",
                  category: "t-shirts",
                  sizes: [],
                  colors: [],
                  images: [],
                  in_stock: true,
                  featured: false,
        stock: 0,
                })
              }} 
              variant="outline" 
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة منتج
            </Button>

          </div>
        </div>



        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الكمية</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalQuantity}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">طلبات اليوم</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.today}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المنتجات</p>
                  <p className="text-2xl font-bold text-purple-600">{productStats.total}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">المنتجات المميزة</p>
                  <p className="text-2xl font-bold text-yellow-600">{productStats.featured}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المخزون</p>
                  <p className="text-2xl font-bold text-emerald-600">{productStats.totalStock}</p>
                </div>
                <Package className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">مخزون منخفض</p>
                  <p className="text-2xl font-bold text-orange-600">{productStats.lowStock}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <TabsTrigger value="orders">إدارة الطلبات</TabsTrigger>
            <TabsTrigger value="products">إدارة المنتجات</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    جميع الطلبات ({filteredOrders.length})
                  </CardTitle>
                  {orders.length > 0 && (
                    <p className="text-sm text-gray-600">
                      آخر تحديث: {new Date().toLocaleString("ar-DZ")}
                    </p>
                  )}
                  
                  {/* أزرار تصفية الحالة */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">تصفية الطلبات حسب الحالة:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <Button
                        onClick={() => applyStatusFilter("all")}
                        variant={statusFilter === "all" ? "default" : "outline"}
                        size="sm"
                        className={`${statusFilter === "all" ? "bg-gray-800 hover:bg-gray-900 text-white" : "bg-white hover:bg-gray-50"} font-medium shadow-sm transition-all duration-200 h-14`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xl">📋</span>
                          <span className="text-sm font-semibold">الكل</span>
                          <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs font-bold">
                            {orders.length}
                          </span>
                        </div>
                      </Button>
                      <Button
                        onClick={() => applyStatusFilter("pending")}
                        variant={statusFilter === "pending" ? "default" : "outline"}
                        size="sm"
                        className={`${statusFilter === "pending" ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border-yellow-300"} font-medium shadow-sm transition-all duration-200 h-14`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xl">⏳</span>
                          <span className="text-sm font-semibold">قيد الانتظار</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusFilter === "pending" ? "bg-yellow-200 text-yellow-800" : "bg-yellow-200 text-yellow-800"}`}>
                            {orders.filter(o => o.status === "pending").length}
                          </span>
                        </div>
                      </Button>
                      <Button
                        onClick={() => applyStatusFilter("confirmed")}
                        variant={statusFilter === "confirmed" ? "default" : "outline"}
                        size="sm"
                        className={`${statusFilter === "confirmed" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-50 hover:bg-green-100 text-green-800 border-green-300"} font-medium shadow-sm transition-all duration-200 h-14`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xl">✅</span>
                          <span className="text-sm font-semibold">مؤكد</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusFilter === "confirmed" ? "bg-green-200 text-green-800" : "bg-green-200 text-green-800"}`}>
                            {orders.filter(o => o.status === "confirmed" || !o.status).length}
                          </span>
                        </div>
                      </Button>
                      <Button
                        onClick={() => applyStatusFilter("processing")}
                        variant={statusFilter === "processing" ? "default" : "outline"}
                        size="sm"
                        className={`${statusFilter === "processing" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300"} font-medium shadow-sm transition-all duration-200 h-14`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xl">🔄</span>
                          <span className="text-sm font-semibold">قيد المعالجة</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusFilter === "processing" ? "bg-blue-200 text-blue-800" : "bg-blue-200 text-blue-800"}`}>
                            {orders.filter(o => o.status === "processing").length}
                          </span>
                        </div>
                      </Button>
                      <Button
                        onClick={() => applyStatusFilter("cancelled")}
                        variant={statusFilter === "cancelled" ? "default" : "outline"}
                        size="sm"
                        className={`${statusFilter === "cancelled" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-50 hover:bg-red-100 text-red-800 border-red-300"} font-medium shadow-sm transition-all duration-200 h-14`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xl">❌</span>
                          <span className="text-sm font-semibold">ملغي</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusFilter === "cancelled" ? "bg-red-200 text-red-800" : "bg-red-200 text-red-800"}`}>
                            {orders.filter(o => o.status === "cancelled").length}
                          </span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500">جاري تحميل الطلبات...</p>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-500">
                        {statusFilter === "all" ? "لا توجد طلبات بعد" : `لا توجد طلبات بحالة: ${getStatusText(statusFilter)}`}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredOrders.map((order) => (
                          <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                            {/* Header with status indicator */}
                            <div className={`h-2 ${
                              order.status === "pending" ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                              order.status === "confirmed" || !order.status ? "bg-gradient-to-r from-green-400 to-emerald-500" :
                              order.status === "processing" ? "bg-gradient-to-r from-blue-400 to-cyan-500" :
                              order.status === "cancelled" ? "bg-gradient-to-r from-red-400 to-pink-500" :
                              "bg-gradient-to-r from-gray-400 to-slate-500"
                            }`}></div>
                            
                            <div className="p-6">
                              {/* Customer Info Section */}
                              <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                      <span className="text-white font-bold text-xl">
                                        {order.customer_name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
                                      order.status === "pending" ? "bg-yellow-500" :
                                      order.status === "confirmed" || !order.status ? "bg-green-500" :
                                      order.status === "processing" ? "bg-blue-500" :
                                      order.status === "cancelled" ? "bg-red-500" :
                                      "bg-gray-500"
                                    }`}>
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                  </div>
                                  
                              <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{order.customer_name}</h3>
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                                        <Phone className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">{order.phone_number}</span>
                              </div>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => window.open(`tel:${order.phone_number}`, "_blank")}
                                          size="sm"
                                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 h-8 shadow-md"
                                          title="اتصال مباشر"
                                        >
                                          <Phone className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          onClick={() => window.open(`https://wa.me/213${order.phone_number.replace(/\s/g, "")}`, "_blank")}
                                          size="sm"
                                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 h-8 shadow-md"
                                          title="تواصل عبر واتساب"
                                        >
                                          <MessageCircle className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full w-fit">
                                      <Clock className="w-3 h-3" />
                                      <span>{order.created_at && new Date(order.created_at).toLocaleString("ar-DZ")}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Status Badge */}
                                <div className="text-right">
                                  <Badge 
                                    variant="default" 
                                    className={`${order.status ? getStatusColor(order.status) : "bg-green-500"} text-white font-bold px-4 py-2 text-sm shadow-lg`}
                                  >
                                    {order.status ? getStatusText(order.status) : "مؤكد"}
                                  </Badge>
                                </div>
                              </div>
                              
                              {/* Order Details */}
                              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-6">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                  <Package className="w-5 h-5 text-blue-600" />
                                  تفاصيل الطلب
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Package className="w-4 h-4 text-blue-600" />
                                      </div>
                                      <span className="font-semibold text-gray-700 text-sm">المنتج</span>
                                    </div>
                                    <p className="text-gray-900 font-bold text-sm">{order.product_name}</p>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <span className="text-purple-600 font-bold text-sm">📏</span>
                                      </div>
                                      <span className="font-semibold text-gray-700 text-sm">المقاس</span>
                                    </div>
                                    <p className="text-gray-900 font-bold text-sm">{order.size}</p>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <span className="text-orange-600 font-bold text-sm">🔢</span>
                                      </div>
                                      <span className="font-semibold text-gray-700 text-sm">الكمية</span>
                                    </div>
                                    <p className="text-gray-900 font-bold text-sm">{order.quantity}</p>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <span className="text-green-600 font-bold text-sm">🆔</span>
                                      </div>
                                      <span className="font-semibold text-gray-700 text-sm">رقم الطلب</span>
                                    </div>
                                    <p className="text-gray-900 font-bold text-sm">#{order.id}</p>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <span className="text-indigo-600 font-bold text-sm">🏛️</span>
                                      </div>
                                      <span className="font-semibold text-gray-700 text-sm">الولاية</span>
                                    </div>
                                    <p className="text-gray-900 font-bold text-sm">{order.wilaya || "غير محدد"}</p>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                        <span className="text-teal-600 font-bold text-sm">🏘️</span>
                                      </div>
                                      <span className="font-semibold text-gray-700 text-sm">البلدية</span>
                                    </div>
                                    <p className="text-gray-900 font-bold text-sm">{order.commune || "غير محدد"}</p>
                                  </div>
                                </div>
                                
                                {/* معلومات التوصيل */}
                                {(order.wilaya || order.commune || order["delivery-type"]) && (
                                  <div className="mt-4 bg-gradient-to-r from-teal-50 to-indigo-50 rounded-lg p-3 border border-teal-200">
                                    <h5 className="font-semibold text-teal-800 mb-2 flex items-center gap-2">
                                      <span className="text-teal-600">🚚</span>
                                      معلومات التوصيل
                                    </h5>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                      {order.wilaya && (
                              <div className="flex items-center gap-2">
                                          <span className="text-teal-600 font-medium">الولاية:</span>
                                          <span className="text-gray-800 font-bold">{order.wilaya}</span>
                                        </div>
                                      )}
                                      {order.commune && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-teal-600 font-medium">البلدية:</span>
                                          <span className="text-gray-800 font-bold">{order.commune}</span>
                                        </div>
                                      )}
                                      {order["delivery-type"] && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-teal-600 font-medium">نوع التوصيل:</span>
                                          <span className="text-gray-800 font-bold">
                                            {order["delivery-type"] === "home" ? "توصيل منزلي" : 
                                             order["delivery-type"] === "office" ? "توصيل مكتب" : 
                                             order["delivery-type"]}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                  <span className="text-sm font-medium text-gray-600">تغيير الحالة:</span>
                                  <div className="flex gap-2">
                                    <Button
                                      id={`status-${order.id}-pending`}
                                      onClick={() => order.id && handleUpdateOrderStatus(order.id, "pending")}
                                      size="sm"
                                      className={`${order.status === "pending" ? "bg-yellow-600 ring-2 ring-yellow-300" : "bg-yellow-500 hover:bg-yellow-600"} text-white px-3 py-2 transition-all duration-200 shadow-md`}
                                      title="قيد الانتظار"
                                    >
                                      <Clock className="w-4 h-4 mr-1" />
                                      قيد الانتظار
                                    </Button>
                                    <Button
                                      id={`status-${order.id}-confirmed`}
                                      onClick={() => order.id && handleUpdateOrderStatus(order.id, "confirmed")}
                                      size="sm"
                                      className={`${order.status === "confirmed" || !order.status ? "bg-green-600 ring-2 ring-green-300" : "bg-green-500 hover:bg-green-600"} text-white px-3 py-2 transition-all duration-200 shadow-md`}
                                      title="مؤكد"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                  مؤكد
                                    </Button>
                                    <Button
                                      id={`status-${order.id}-processing`}
                                      onClick={() => order.id && handleUpdateOrderStatus(order.id, "processing")}
                                      size="sm"
                                      className={`${order.status === "processing" ? "bg-blue-600 ring-2 ring-blue-300" : "bg-blue-500 hover:bg-blue-600"} text-white px-3 py-2 transition-all duration-200 shadow-md`}
                                      title="قيد المعالجة"
                                    >
                                      <RefreshCw className="w-4 h-4 mr-1" />
                                      قيد المعالجة
                                    </Button>
                                    <Button
                                      id={`status-${order.id}-cancelled`}
                                      onClick={() => order.id && handleUpdateOrderStatus(order.id, "cancelled")}
                                      size="sm"
                                      className={`${order.status === "cancelled" ? "bg-red-600 ring-2 ring-red-300" : "bg-red-500 hover:bg-red-600"} text-white px-3 py-2 transition-all duration-200 shadow-md`}
                                      title="ملغي"
                                    >
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      ملغي
                                    </Button>
                                  </div>
                                </div>
                                
                                <Button
                                  onClick={() => order.id && handleDeleteOrder(order.id)}
                                  size="sm"
                                  variant="destructive"
                                  title="حذف الطلب"
                                  className="bg-red-500 hover:bg-red-600 shadow-md"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  حذف الطلب
                                </Button>
                              </div>
                            </div>
                              </div>
                        ))}
                              </div>
                      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">✅</span>
                              </div>
                            <div>
                              <p className="text-sm font-semibold text-green-800">
                                تم العثور على {filteredOrders.length} طلب بنجاح
                              </p>
                              {statusFilter !== "all" && (
                                <p className="text-xs text-green-600">
                                  مفلترة حسب: {getStatusText(statusFilter)}
                                </p>
                              )}
                              </div>
                            </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">آخر تحديث</p>
                            <p className="text-xs font-medium text-gray-700">
                              {new Date().toLocaleTimeString("ar-DZ")}
                            </p>
                          </div>
                      </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">إدارة المنتجات</h2>
              <Button onClick={() => setShowAddProductDialog(true)} className="bg-green-600 hover:bg-green-700 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                إضافة منتج جديد
              </Button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsLoading ? (
                <div className="col-span-full text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">جاري تحميل المنتجات...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500">لا توجد منتجات بعد</p>
                  <Button onClick={() => setShowAddProductDialog(true)} className="mt-4">
                    إضافة أول منتج
                  </Button>
                </div>
              ) : (
                products.map((product) => (
                  <Card key={product.id} className="overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="relative">
                      <img
                        src={product.images[0] || "/placeholder.jpg"}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {product.featured && (
                          <Badge variant="default" className="bg-yellow-500">
                            <Star className="w-3 h-3 mr-1" />
                            مميز
                          </Badge>
                        )}
                        {product.in_stock ? (
                          <Badge variant="default" className="bg-green-500">
                            متوفر
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-red-500">
                            نفذ
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-orange-600">{product.price} دج</span>
                        {product.original_price && (
                          <span className="text-lg text-gray-400 line-through">{product.original_price} دج</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-600">الفئة:</span>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-600">المقاسات:</span>
                        <div className="flex gap-1">
                          {product.sizes?.slice(0, 3).map((size) => (
                            <Badge key={size} variant="outline" className="text-xs">
                              {size}
                            </Badge>
                          ))}
                          {product.sizes?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.sizes.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-600">المخزون:</span>
                        <Badge 
                          variant={(product.stock ?? 0) > 0 ? "default" : "destructive"} 
                          className={(product.stock ?? 0) > 0 ? "bg-green-500" : "bg-red-500"}
                        >
                          {product.stock ?? 0} قطعة
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditProduct(product)}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          تعديل
                        </Button>
                        <Button
                          onClick={() => handleDeleteProduct(product.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* نافذة إضافة/تعديل المنتج */}
      <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم المنتج *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="اسم المنتج"
                />
              </div>
              <div>
                <Label htmlFor="category">الفئة *</Label>
                <Select value={productForm.category} onValueChange={(value: any) => setProductForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t-shirts">تيشيرت</SelectItem>
                    <SelectItem value="casquettes">كاسكيت</SelectItem>
                    <SelectItem value="salopettes">سالوبيت</SelectItem>
                    <SelectItem value="geliet">جليت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">السعر *</Label>
                <Input
                  id="price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                  placeholder="السعر"
                />
              </div>
              <div>
                <Label htmlFor="original_price">السعر الأصلي</Label>
                <Input
                  id="original_price"
                  type="number"
                  value={productForm.original_price}
                  onChange={(e) => setProductForm(prev => ({ ...prev, original_price: Number(e.target.value) }))}
                  placeholder="السعر الأصلي (اختياري)"
                />
              </div>
              <div>
                <Label htmlFor="stock">الكمية المتوفرة *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={productForm.stock}
                  onChange={(e) => setProductForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                  placeholder="الكمية"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="وصف المنتج"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sizes">المقاسات المتاحة</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-2">
                    {availableSizes.map((size) => (
                      <div key={size} className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id={`size-${size}`}
                          checked={selectedSizes.includes(size)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSizes([...selectedSizes, size])
                            } else {
                              setSelectedSizes(selectedSizes.filter(s => s !== size))
                            }
                          }}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <Label htmlFor={`size-${size}`} className="text-sm cursor-pointer">
                          {size}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedSizes.length > 0 && (
                  <div className="mt-2">
                    <Label className="text-sm text-gray-600">المقاسات المختارة:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSizes.map((size) => (
                        <Badge key={size} variant="outline" className="text-xs">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="colors">الألوان (مفصولة بفواصل)</Label>
                <Input
                  id="colors"
                  value={productForm.colors.join(", ")}
                  onChange={(e) => setProductForm(prev => ({ 
                    ...prev, 
                    colors: e.target.value.split(",").map(s => s.trim()).filter(s => s) 
                  }))}
                  placeholder="أحمر, أزرق, أخضر"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="images">روابط الصور (كل صورة في سطر منفصل)</Label>
              <textarea
                id="images"
                defaultValue={productForm.images.join("\n")}
                onChange={(e) => setProductForm(prev => ({ 
                  ...prev, 
                  images: e.target.value.split("\n").map(s => s.trim()).filter(s => s) 
                }))}
                placeholder={`https://example.com/image1.jpg
https://example.com/image2.jpg
https://example.com/image3.jpg`}
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-mono text-sm"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="in_stock"
                  checked={productForm.in_stock}
                  onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, in_stock: checked }))}
                />
                <Label htmlFor="in_stock">متوفر في المخزون</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={productForm.featured}
                  onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">منتج مميز</Label>
              </div>
            </div>



            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowAddProductDialog(false)
                setSelectedSizes([])
              }}>
                إلغاء
              </Button>
              <Button onClick={handleSaveProduct}>
                {editingProduct ? "تحديث المنتج" : "إضافة المنتج"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  )
}
