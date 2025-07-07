"use client"

import { useState, useEffect } from "react"
import { productService, type Product } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await productService.getAllProducts()
      setProducts(data)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("فشل في تحميل المنتجات")
      toast({
        title: "خطأ",
        description: "فشل في تحميل المنتجات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()

    // الاشتراك في التحديثات المباشرة
    const subscription = productService.subscribeToProducts((payload) => {
      console.log("🔄 تحديث مباشر للمنتجات:", payload)

      if (payload.eventType === "INSERT") {
        setProducts((prev) => [payload.new, ...prev])
        toast({
          title: "منتج جديد",
          description: `تم إضافة ${payload.new.name}`,
        })
      } else if (payload.eventType === "UPDATE") {
        setProducts((prev) => prev.map((p) => (p.id === payload.new.id ? payload.new : p)))
        toast({
          title: "تم التحديث",
          description: `تم تحديث ${payload.new.name}`,
        })
      } else if (payload.eventType === "DELETE") {
        setProducts((prev) => prev.filter((p) => p.id !== payload.old.id))
        toast({
          title: "تم الحذف",
          description: `تم حذف ${payload.old.name}`,
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [toast])

  const addProduct = async (productData: Partial<Product>) => {
    console.log("🔄 بدء إضافة المنتج:", productData)

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      console.log("📡 استجابة الخادم:", response.status, response.statusText)

      const result = await response.json()
      console.log("📄 محتوى الاستجابة:", result)

      if (response.ok && result.success) {
        toast({
          title: "نجح ✅",
          description: result.message || "تم إضافة المنتج بنجاح",
        })
        console.log("✅ تم إضافة المنتج بنجاح:", result.data)
        return result.data
      } else {
        const errorMessage = result.error || `HTTP ${response.status}: ${response.statusText}`
        console.error("❌ فشل في إضافة المنتج:", errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("💥 خطأ في addProduct:", error)
      const errorMessage = error instanceof Error ? error.message : "خطأ غير معروف في الشبكة"

      toast({
        title: "خطأ ❌",
        description: `فشل في إضافة المنتج: ${errorMessage}`,
        variant: "destructive",
      })
      throw error
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    console.log("🔄 بدء تحديث المنتج:", id, updates)

    try {
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
      })

      console.log("📡 استجابة الخادم للتحديث:", response.status, response.statusText)

      const result = await response.json()
      console.log("📄 محتوى استجابة التحديث:", result)

      if (response.ok && result.success) {
        toast({
          title: "نجح ✅",
          description: result.message || "تم تحديث المنتج بنجاح",
        })
        console.log("✅ تم تحديث المنتج بنجاح:", result.data)
        return result.data
      } else {
        const errorMessage = result.error || `HTTP ${response.status}: ${response.statusText}`
        console.error("❌ فشل في تحديث المنتج:", errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("💥 خطأ في updateProduct:", error)
      const errorMessage = error instanceof Error ? error.message : "خطأ غير معروف في الشبكة"

      toast({
        title: "خطأ ❌",
        description: `فشل في تحديث المنتج: ${errorMessage}`,
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast({
            title: "نجح",
            description: "تم حذف المنتج بنجاح",
          })
        } else {
          throw new Error(result.error)
        }
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "خطأ",
        description: `فشل في حذف المنتج: ${error instanceof Error ? error.message : "خطأ غير معروف"}`,
        variant: "destructive",
      })
      throw error
    }
  }

  const refetch = () => {
    fetchProducts()
  }

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch,
  }
}

// Hook للمنتجات حسب الفئة
export function useProductsByCategory(category: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await productService.getProductsByCategory(category)
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطأ في جلب المنتجات")
        console.error("خطأ في useProductsByCategory:", err)
      } finally {
        setLoading(false)
      }
    }

    if (category) {
      fetchProducts()

      // الاشتراك في التحديثات المباشرة للفئة المحددة
      const subscription = productService.subscribeToProducts((payload) => {
        if (payload.eventType === "INSERT" && payload.new.category === category) {
          setProducts((prev) => [payload.new, ...prev])
        } else if (payload.eventType === "UPDATE" && payload.new.category === category) {
          setProducts((prev) => prev.map((p) => (p.id === payload.new.id ? payload.new : p)))
        } else if (payload.eventType === "DELETE" && payload.old.category === category) {
          setProducts((prev) => prev.filter((p) => p.id !== payload.old.id))
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [category])

  return { products, loading, error }
}

// Hook للمنتجات المميزة
export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await productService.getFeaturedProducts()
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطأ في جلب المنتجات المميزة")
        console.error("خطأ في useFeaturedProducts:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()

    // الاشتراك في التحديثات المباشرة للمنتجات المميزة
    const subscription = productService.subscribeToProducts((payload) => {
      if (payload.eventType === "INSERT" && payload.new.featured) {
        setProducts((prev) => [payload.new, ...prev])
      } else if (payload.eventType === "UPDATE") {
        if (payload.new.featured) {
          setProducts((prev) => {
            const exists = prev.find((p) => p.id === payload.new.id)
            if (exists) {
              return prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            } else {
              return [payload.new, ...prev]
            }
          })
        } else {
          setProducts((prev) => prev.filter((p) => p.id !== payload.new.id))
        }
      } else if (payload.eventType === "DELETE") {
        setProducts((prev) => prev.filter((p) => p.id !== payload.old.id))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { products, loading, error }
}
