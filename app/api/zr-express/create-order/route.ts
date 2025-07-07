export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from "next/server"
import { createZRExpressOrder } from "@/lib/zr-express-api"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    console.log("📦 إنشاء طلب جديد في ZR Express:", {
      customer: orderData.customerName,
      phone: orderData.customerPhone,
      wilaya: orderData.wilaya,
      products: orderData.products?.length || 0,
      total: orderData.totalAmount,
    })

    // جلب بيانات الطلب من قاعدة البيانات لاستخدام القيم المحفوظة
    let orderFromDB = null
    if (orderData.orderId) {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderData.orderId)
        .single()
      
      if (!error && orders) {
        orderFromDB = orders
        console.log("✅ تم جلب بيانات الطلب من قاعدة البيانات:", orderFromDB)
      }
    }

    // استخدام القيم المحفوظة في قاعدة البيانات إذا كانت متوفرة
    const finalShippingCost = orderFromDB?.shipping_cost || orderData.shippingCost || 0
    const finalTotalAmount = orderFromDB?.total_amount || orderData.totalAmount || 0

    console.log("💰 الأسعار المستخدمة:", {
      shippingCost: finalShippingCost,
      totalAmount: finalTotalAmount,
      source: orderFromDB ? "database" : "request"
    })

    // إنشاء الطلب في ZR Express
    const zrResult = await createZRExpressOrder({
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      wilaya: orderData.wilaya,
      address: orderData.address,
      commune: orderData.commune || "",
      products: orderData.products,
      deliveryType: orderData.deliveryType,
      shippingCost: finalShippingCost,
      totalAmount: finalTotalAmount,
    })

    console.log("✅ نتيجة ZR Express:", zrResult)

    // التحقق من نجاح العملية
    if (zrResult.success === false) {
      return NextResponse.json({
        success: false,
        error: `خطأ في ZR Express: ${zrResult.error}`,
        errorId: zrResult.errorId,
        trackingNumber: zrResult.trackingNumber,
        details: zrResult.data,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      orderId: zrResult.id || zrResult.tracking_number,
      trackingNumber: zrResult.tracking_number || zrResult.id,
      message: zrResult.message || "تم إنشاء الطلب بنجاح",
      data: zrResult,
    })
  } catch (error) {
    console.error("💥 خطأ في API create-order:", error)

    return NextResponse.json(
      {
        success: false,
        error: "خطأ في الخادم أثناء إنشاء الطلب",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
      },
      { status: 500 },
    )
  }
}
