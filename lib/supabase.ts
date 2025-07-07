import { createClient } from "@supabase/supabase-js"

// قاعدة البيانات الجديدة للطلبات
const supabaseUrl = "https://qsmakqtmedwchbgjevod.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbWFrcXRtZWR3Y2hiZ2pldm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDM0ODEsImV4cCI6MjA2NjcxOTQ4MX0.itt0vx_pR7P5_RA0oVFUFOI8Ni-kADltLojtrstjbTo"

// إنشاء عميل Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// نوع البيانات للمنتج
export interface Product {
  id: string
  name: string
  price: number
  original_price?: number
  description?: string
  category: "salopettes" | "t-shirts" | "casquettes" | "geliet"
  sizes: string[]
  colors: string[]
  images: string[]
  in_stock: boolean
  featured: boolean
  stock: number
  barcode?: string
  created_at: string
  updated_at: string
}

// نوع البيانات للطلب
export interface Order {
  id?: number
  customer_name: string
  phone_number: string
  size: string
  quantity: number
  product_name: string
  price: number
  shipping_cost: number
  total_amount: number
  status?: "pending" | "confirmed" | "processing" | "cancelled"
  wilaya?: string
  commune?: string
  "delivery-type"?: string
  created_at?: string
}

// خدمات الطلبات
export const orderService = {
  // إضافة طلب جديد
  async createOrder(orderData: Omit<Order, "id" | "created_at">): Promise<Order> {
    try {
      console.log("💾 حفظ الطلب في قاعدة البيانات:", orderData)

      // التأكد من وجود قيم للأعمدة المطلوبة
      const orderWithDefaults = {
        ...orderData,
        price: orderData.price || 0,
        shipping_cost: orderData.shipping_cost || 0,
        total_amount: orderData.total_amount || 0,
      }

      const { data, error } = await supabase.from("orders").insert([orderWithDefaults]).select().single()

      if (error) {
        console.error("❌ خطأ في حفظ الطلب:", error)
        throw error
      }

      console.log("✅ تم حفظ الطلب بنجاح:", data)
      return data
    } catch (error) {
      console.error("💥 خطأ في createOrder:", error)
      throw error
    }
  },

  // إضافة عدة طلبات (للطلبات التي تحتوي على منتجات متعددة)
  async createMultipleOrders(orders: Omit<Order, "id" | "created_at">[]): Promise<Order[]> {
    try {
      console.log("💾 حفظ طلبات متعددة في قاعدة البيانات:", orders.length, "طلب")

      // التأكد من وجود قيم للأعمدة المطلوبة لكل طلب
      const ordersWithDefaults = orders.map(order => ({
        ...order,
        price: order.price || 0,
        shipping_cost: order.shipping_cost || 0,
        total_amount: order.total_amount || 0,
      }))

      const { data, error } = await supabase.from("orders").insert(ordersWithDefaults).select()

      if (error) {
        console.error("❌ خطأ في حفظ الطلبات:", error)
        throw error
      }

      console.log("✅ تم حفظ الطلبات بنجاح:", data.length, "طلب")
      return data
    } catch (error) {
      console.error("💥 خطأ في createMultipleOrders:", error)
      throw error
    }
  },

  // جلب جميع الطلبات
  async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("❌ خطأ في جلب الطلبات:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("💥 خطأ في getAllOrders:", error)
      return []
    }
  },

  // جلب طلبات عميل معين
  async getOrdersByPhone(phoneNumber: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("phone_number", phoneNumber)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ خطأ في جلب طلبات العميل:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("💥 خطأ في getOrdersByPhone:", error)
      return []
    }
  },

  // جلب طلب واحد بواسطة ID
  async getOrderById(id: number): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        console.error("❌ خطأ في جلب الطلب:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("💥 خطأ في getOrderById:", error)
      return null
    }
  },

  // حذف طلب
  async deleteOrder(id: number): Promise<void> {
    try {
      const { error } = await supabase.from("orders").delete().eq("id", id)

      if (error) {
        console.error("❌ خطأ في حذف الطلب:", error)
        throw error
      }

      console.log("✅ تم حذف الطلب بنجاح")
    } catch (error) {
      console.error("💥 خطأ في deleteOrder:", error)
      throw error
    }
  },

  // تحديث حالة الطلب
  async updateOrderStatus(id: number, status: "pending" | "confirmed" | "processing" | "cancelled"): Promise<Order> {
    try {
      console.log(`🔄 تحديث حالة الطلب ${id} إلى: ${status}`)

      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("❌ خطأ في تحديث حالة الطلب:", error)
        throw error
      }

      console.log("✅ تم تحديث حالة الطلب بنجاح:", data)
      return data
    } catch (error) {
      console.error("💥 خطأ في updateOrderStatus:", error)
      throw error
    }
  },

  // إحصائيات الطلبات
  async getOrderStats() {
    try {
      const { data, error } = await supabase.from("orders").select("product_name, quantity, created_at")

      if (error) {
        console.error("❌ خطأ في جلب إحصائيات الطلبات:", error)
        return {
          total: 0,
          totalQuantity: 0,
          byProduct: {},
          today: 0,
        }
      }

      const today = new Date().toDateString()
      const stats = {
        total: data.length,
        totalQuantity: data.reduce((sum, order) => sum + order.quantity, 0),
        byProduct: {} as Record<string, number>,
        today: data.filter((order) => new Date(order.created_at).toDateString() === today).length,
      }

      data.forEach((order) => {
        stats.byProduct[order.product_name] = (stats.byProduct[order.product_name] || 0) + order.quantity
      })

      return stats
    } catch (error) {
      console.error("💥 خطأ في getOrderStats:", error)
      return {
        total: 0,
        totalQuantity: 0,
        byProduct: {},
        today: 0,
      }
    }
  },

  // الاشتراك في التحديثات المباشرة للطلبات
  subscribeToOrders(callback: (payload: any) => void) {
    return supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, callback)
      .subscribe()
  },
}

// خدمات المنتجات
export const productService = {
  // جلب جميع المنتجات
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("خطأ في جلب المنتجات:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("خطأ في getAllProducts:", error)
      return []
    }
  },

  // جلب المنتجات حسب الفئة
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", category)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("خطأ في جلب المنتجات حسب الفئة:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("خطأ في getProductsByCategory:", error)
      return []
    }
  },

  // جلب المنتجات المميزة
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("خطأ في جلب المنتجات المميزة:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("خطأ في getFeaturedProducts:", error)
      return []
    }
  },

  // جلب منتج واحد
  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

      if (error) {
        console.error("خطأ في جلب المنتج:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("خطأ في getProductById:", error)
      return null
    }
  },

  // إضافة منتج جديد
  async addProduct(product: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
    console.log("🔄 بدء إضافة المنتج في Supabase:", product)

    try {
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            ...product,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("❌ خطأ Supabase في إضافة المنتج:", error)
        throw new Error(`خطأ في قاعدة البيانات: ${error.message}`)
      }

      if (!data) {
        console.error("❌ لم يتم إرجاع بيانات المنتج")
        throw new Error("فشل في إنشاء المنتج - لم يتم إرجاع البيانات")
      }

      console.log("✅ تم إضافة المنتج بنجاح في Supabase:", data)
      return data
    } catch (error) {
      console.error("💥 خطأ في addProduct service:", error)
      throw error
    }
  },

  // تحديث منتج
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("خطأ في تحديث المنتج:", error)
      throw error
    }

    return data
  },

  // حذف منتج
  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("خطأ في حذف المنتج:", error)
      throw error
    }
  },

  // البحث في المنتجات
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("خطأ في البحث:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("خطأ في searchProducts:", error)
      return []
    }
  },

  // الاشتراك في التحديثات المباشرة
  subscribeToProducts(callback: (payload: any) => void) {
    return supabase
      .channel("products-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, callback)
      .subscribe()
  },

  // إحصائيات المنتجات
  async getProductStats() {
    try {
      const { data, error } = await supabase.from("products").select("category, price, featured, in_stock, stock")

      if (error) {
        console.error("خطأ في جلب الإحصائيات:", error)
        return {
          total: 0,
          byCategory: {},
          featured: 0,
          inStock: 0,
          averagePrice: 0,
          totalStock: 0,
          lowStock: 0,
        }
      }

      const stats = {
        total: data.length,
        byCategory: {} as Record<string, number>,
        featured: data.filter((p) => p.featured).length,
        inStock: data.filter((p) => p.in_stock).length,
        averagePrice: data.length > 0 ? data.reduce((sum, p) => sum + p.price, 0) / data.length : 0,
        totalStock: data.reduce((sum, p) => sum + (p.stock || 0), 0),
        lowStock: data.filter((p) => (p.stock || 0) <= 5).length,
      }

      data.forEach((product) => {
        stats.byCategory[product.category] = (stats.byCategory[product.category] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error("خطأ في getProductStats:", error)
      return {
        total: 0,
        byCategory: {},
        featured: 0,
        inStock: 0,
        averagePrice: 0,
        totalStock: 0,
        lowStock: 0,
      }
    }
  },
}
