export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from "next/server"
import { productService } from "@/lib/supabase"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productData = await request.json()
    const productId = params.id

    console.log("📝 تحديث منتج:", {
      id: productId,
      name: productData.name,
      category: productData.category,
    })

    const product = await productService.updateProduct(productId, productData)

    return NextResponse.json({
      success: true,
      product,
      message: "تم تحديث المنتج بنجاح",
    })
  } catch (error) {
    console.error("❌ خطأ في تحديث المنتج:", error)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id

    console.log("🗑️ حذف منتج:", productId)

    await productService.deleteProduct(productId)

    return NextResponse.json({
      success: true,
      message: "تم حذف المنتج بنجاح",
    })
  } catch (error) {
    console.error("❌ خطأ في حذف المنتج:", error)
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
