export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from "next/server"
import { orderService, supabase } from "@/lib/supabase"
import { calculateShippingCost } from "@/lib/zr-express-api"

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    console.log("📦 إنشاء طلب جديد:", {
      customer: orderData.customerName,
      phone: orderData.customerPhone,
      wilaya: orderData.wilaya,
      commune: orderData.commune,
      deliveryType: orderData.deliveryType,
      products: orderData.products?.length || 0,
      total: orderData.totalAmount,
    })

    // تم تعطيل إرسال الطلب إلى ZR Express مؤقتاً
    // يمكن إعادة تفعيله لاحقاً عند الحاجة
    /*
    const zrResult = await createZRExpressOrder({
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      wilaya: orderData.wilaya,
      commune: orderData.commune,
      address: orderData.address,
      products: orderData.products,
      totalAmount: orderData.totalAmount,
      shippingCost: orderData.shippingCost,
      deliveryType: orderData.deliveryType,
    })
    */

    // إنشاء رقم طلب محلي
    const orderNumber = `NW-${Date.now()}`

    console.log("💾 حفظ الطلب في قاعدة البيانات المحلية...")

    // حفظ الطلب في قاعدة البيانات Supabase
    try {
      const ordersToSave = orderData.products.map((product: any) => {
        // حساب تكلفة التوصيل لكل منتج
        const shippingCost = calculateShippingCost(
          orderData.wilaya || "الجزائر",
          orderData.deliveryType || "home",
          product.quantity
        )
        
        // حساب السعر الإجمالي للمنتج
        const productPrice = product.price || 0
        const productTotal = productPrice * product.quantity
        
        // حساب المجموع النهائي (سعر المنتج + تكلفة التوصيل)
        const totalAmount = productTotal + shippingCost

        return {
        customer_name: orderData.customerName,
        phone_number: orderData.customerPhone.replace(/\s/g, ""),
        size: product.size || "غير محدد",
        quantity: product.quantity,
        product_name: product.name,
          price: productPrice,
          shipping_cost: shippingCost,
          total_amount: totalAmount,
          status: "processing", // الطلبات الجديدة تكون قيد المعالجة
          wilaya: orderData.wilaya || "غير محدد",
          commune: orderData.commune || "",
          "delivery-type": orderData.deliveryType || "home",
        }
      })

      console.log("📝 البيانات المراد حفظها:", ordersToSave)
      console.log("🔍 نوع البيانات:", typeof ordersToSave)
      console.log("🔍 طول المصفوفة:", ordersToSave.length)

      const savedOrders = await orderService.createMultipleOrders(ordersToSave)
      console.log("✅ تم حفظ الطلب في قاعدة البيانات:", savedOrders.length, "عنصر")
      console.log("📊 تفاصيل الطلبات المحفوظة:", savedOrders)

      // إضافة تأخير صغير لضمان أن Real-time يعمل
      await new Promise((resolve) => setTimeout(resolve, 100))

      return NextResponse.json({
        success: true,
        orderId: savedOrders[0]?.id,
        orderNumber: orderNumber,
        trackingNumber: null, // لا يوجد رقم تتبع حالياً
        message: "تم حفظ طلبك بنجاح! سيتم التواصل معك قريباً لتأكيد الطلب.",
        zrExpressSuccess: false, // تم تعطيل ZR Express مؤقتاً
        databaseSuccess: true,
        savedOrdersCount: savedOrders.length,
        savedOrders: savedOrders,
      })
    } catch (dbError) {
      console.error("❌ فشل في حفظ الطلب في قاعدة البيانات:", dbError)

      return NextResponse.json(
        {
          success: false,
          error: "فشل في حفظ الطلب في قاعدة البيانات",
          details: dbError instanceof Error ? dbError.message : "خطأ غير معروف",
          zrExpressSuccess: false,
          databaseSuccess: false,
          databaseError: dbError instanceof Error ? dbError.message : "خطأ غير معروف",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("💥 خطأ عام في API orders:", error)

    return NextResponse.json(
      {
        success: false,
        error: "خطأ في الخادم أثناء إنشاء الطلب",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
        zrExpressSuccess: false,
        databaseSuccess: false,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")
    const orderId = searchParams.get("orderId")

    // إذا تم تمرير orderId، جلب طلب معين
    if (orderId) {
      try {
        const order = await orderService.getOrderById(parseInt(orderId))
        if (order) {
          return NextResponse.json({
            success: true,
            order,
          })
        } else {
          return NextResponse.json(
            {
              success: false,
              error: "الطلب غير موجود",
            },
            { status: 404 },
          )
        }
      } catch (error) {
        console.error("❌ خطأ في جلب الطلب:", error)
        return NextResponse.json(
          {
            success: false,
            error: "فشل في جلب الطلب",
            details: error instanceof Error ? error.message : "خطأ غير معروف",
          },
          { status: 500 },
        )
      }
    }

    // جلب الطلبات حسب رقم الهاتف أو جميع الطلبات
    let orders
    if (phone) {
      orders = await orderService.getOrdersByPhone(phone)
    } else {
      orders = await orderService.getAllOrders()
    }

    const stats = await orderService.getOrderStats()

    return NextResponse.json({
      success: true,
      orders,
      stats,
      count: orders.length,
    })
  } catch (error) {
    console.error("❌ خطأ في جلب الطلبات:", error)
    return NextResponse.json(
      {
        success: false,
        error: "فشل في جلب الطلبات",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
      },
      { status: 500 },
    )
  }
}
