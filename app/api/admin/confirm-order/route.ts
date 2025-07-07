export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from "next/server"
import { orderService } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📝 البيانات المستلمة لتأكيد الطلب:", body)

    // التحقق من البيانات المطلوبة
    const requiredFields = ["customer_name", "phone_number", "product_name", "quantity"]
    const missingFields = requiredFields.filter((field) => !body[field])

    if (missingFields.length > 0) {
      console.error("❌ البيانات المطلوبة مفقودة:", missingFields)
      return NextResponse.json(
        {
          success: false,
          error: `البيانات المطلوبة مفقودة: ${missingFields.join(", ")}`,
          missingFields,
        },
        { status: 400 },
      )
    }

    // تنظيف وتحضير البيانات
    const orderData = {
      customer_name: body.customer_name.trim(),
      phone_number: body.phone_number.trim(),
      size: body.size?.trim() || "",
      quantity: Number.parseInt(body.quantity) || 1,
      product_name: body.product_name.trim(),
    }

    console.log("💾 البيانات المعدة لحفظ الطلب:", orderData)

    // حفظ الطلب في قاعدة البيانات
    const order = await orderService.createOrder(orderData)
    console.log("✅ تم إنشاء الطلب:", order)

    return NextResponse.json({
      success: true,
      data: order,
      message: "تم تأكيد الطلب بنجاح - سيظهر في قائمة الطلبات فوراً!",
    })
  } catch (error) {
    console.error("❌ خطأ في تأكيد الطلب:", error)
    return NextResponse.json(
      {
        success: false,
        error: "فشل في تأكيد الطلب",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
      },
      { status: 500 },
    )
  }
}
