export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { productId, barcode } = await request.json()

    if (!productId || !barcode) {
      return NextResponse.json(
        { error: "معرف المنتج والباركود مطلوبان" },
        { status: 400 }
      )
    }

    console.log("🏷️ إضافة باركود للمنتج:", { productId, barcode })

    // التحقق من عدم وجود باركود مكرر
    const { data: existingProduct, error: checkError } = await supabase
      .from("products")
      .select("id")
      .eq("barcode", barcode)
      .neq("id", productId)
      .single()

    if (existingProduct) {
      return NextResponse.json(
        { error: "هذا الباركود مستخدم بالفعل" },
        { status: 400 }
      )
    }

    // إضافة الباركود للمنتج
    const { error } = await supabase
      .from("products")
      .update({ barcode })
      .eq("id", productId)

    if (error) {
      console.error("❌ خطأ في إضافة الباركود:", error)
      return NextResponse.json(
        { error: "فشل في إضافة الباركود" },
        { status: 500 }
      )
    }

    console.log("✅ تم إضافة الباركود بنجاح")
    return NextResponse.json({ success: true, message: "تم إضافة الباركود بنجاح" })

  } catch (error) {
    console.error("❌ خطأ في API إضافة الباركود:", error)
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    )
  }
} 