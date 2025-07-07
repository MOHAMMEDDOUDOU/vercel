export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from "next/server"
import { productService } from "@/lib/supabase"

// GET - جلب جميع المنتجات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")

    let products
    if (category) {
      products = await productService.getProductsByCategory(category)
    } else if (featured === "true") {
      products = await productService.getFeaturedProducts()
    } else {
      products = await productService.getAllProducts()
    }

    const stats = await productService.getProductStats()

    return NextResponse.json({
      success: true,
      products,
      stats,
      count: products.length,
    })
  } catch (error) {
    console.error("❌ خطأ في جلب المنتجات:", error)
    return NextResponse.json(
      {
        success: false,
        error: "فشل في جلب المنتجات",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
      },
      { status: 500 },
    )
  }
}

// POST - إضافة منتج جديد
export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()

    console.log("📦 إنشاء منتج جديد:", {
      name: productData.name,
      category: productData.category,
      price: productData.price,
    })

    const product = await productService.addProduct(productData)

    return NextResponse.json({
      success: true,
      product,
      message: "تم إضافة المنتج بنجاح",
    })
  } catch (error) {
    console.error("❌ خطأ في إضافة المنتج:", error)
    return NextResponse.json(
      {
        success: false,
        error: "فشل في إضافة المنتج",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
      },
      { status: 500 },
    )
  }
}

// PUT - تحديث منتج
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "معرف المنتج مطلوب",
        },
        { status: 400 },
      )
    }

    // تحويل الأسعار إلى أرقام إذا كانت موجودة
    if (updates.price !== undefined) {
      updates.price = Number.parseFloat(updates.price)
    }
    if (updates.original_price !== undefined) {
      updates.original_price = updates.original_price ? Number.parseFloat(updates.original_price) : null
    }

    // تحويل المخزون إلى رقم إذا كان موجوداً
    if (updates.stock !== undefined) {
      updates.stock = Number.parseInt(updates.stock) || 0
    }

    // تنظيف النصوص
    if (updates.name) {
      updates.name = updates.name.trim()
    }
    if (updates.description) {
      updates.description = updates.description.trim()
    }

    // تنظيف المصفوفات
    if (updates.images) {
      updates.images = Array.isArray(updates.images) ? updates.images.filter((img: string) => img.trim()) : []
    }
    if (updates.sizes) {
      updates.sizes = Array.isArray(updates.sizes) ? updates.sizes.filter((s: string) => s.trim()) : []
    }
    if (updates.colors) {
      updates.colors = Array.isArray(updates.colors) ? updates.colors.filter((c: string) => c.trim()) : []
    }

    const product = await productService.updateProduct(id, updates)

    return NextResponse.json({
      success: true,
      data: product,
      message: "تم تحديث المنتج بنجاح - سيظهر التحديث في الموقع فوراً!",
    })
  } catch (error) {
    console.error("خطأ في تحديث المنتج:", error)
    return NextResponse.json(
      {
        success: false,
        error: "فشل في تحديث المنتج",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
      },
      { status: 500 },
    )
  }
}

// DELETE - حذف منتج
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "معرف المنتج مطلوب",
        },
        { status: 400 },
      )
    }

    await productService.deleteProduct(id)

    return NextResponse.json({
      success: true,
      message: "تم حذف المنتج بنجاح - سيختفي من الموقع فوراً!",
    })
  } catch (error) {
    console.error("خطأ في حذف المنتج:", error)
    return NextResponse.json(
      {
        success: false,
        error: "فشل في حذف المنتج",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
      },
      { status: 500 },
    )
  }
}
