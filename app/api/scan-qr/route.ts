export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// POST - مسح QR Code وزيادة المخزون
export async function POST(request: NextRequest) {
  try {
    const { qrCode } = await request.json()

    if (!qrCode || !qrCode.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "QR Code مطلوب",
        },
        { status: 400 },
      )
    }

    console.log("🔍 مسح QR Code:", qrCode)

    // البحث عن المنتج بالباركود
    const { data: product, error: searchError } = await supabase
      .from("products")
      .select("*")
      .eq("barcode", qrCode.trim())
      .single()

    if (searchError || !product) {
      console.log("❌ لم يتم العثور على المنتج:", searchError)
      return NextResponse.json(
        {
          success: false,
          error: "لم يتم العثور على المنتج",
          details: searchError?.message || "المنتج غير موجود",
        },
        { status: 404 },
      )
    }

    console.log("✅ تم العثور على المنتج:", product.name)

    // زيادة المخزون
    const newStock = (product.stock || 0) + 1
    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", product.id)

    if (updateError) {
      console.error("❌ خطأ في تحديث المخزون:", updateError)
      return NextResponse.json(
        {
          success: false,
          error: "فشل في تحديث المخزون",
          details: updateError.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ تم زيادة المخزون:", product.stock, "→", newStock)

    return NextResponse.json({
      success: true,
      message: `تم زيادة مخزون ${product.name} إلى ${newStock}`,
      product: {
        ...product,
        stock: newStock,
      },
    })
  } catch (error) {
    console.error("❌ خطأ في معالجة QR Code:", error)
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ أثناء معالجة QR Code",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
      },
      { status: 500 },
    )
  }
} 