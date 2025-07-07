export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from "next/server"

// أسعار التوصيل المؤقتة (حتى نحصل عليها من ZR Express)
const TEMP_SHIPPING_RATES = {
  "01": { name: "أدرار", price: 800 },
  "02": { name: "الشلف", price: 600 },
  "03": { name: "الأغواط", price: 700 },
  "04": { name: "أم البواقي", price: 500 },
  "05": { name: "باتنة", price: 500 },
  "06": { name: "بجاية", price: 600 },
  "07": { name: "بسكرة", price: 600 },
  "08": { name: "بشار", price: 900 },
  "09": { name: "البليدة", price: 400 },
  "10": { name: "البويرة", price: 500 },
  "16": { name: "الجزائر", price: 400 },
  "31": { name: "وهران", price: 600 },
  "25": { name: "قسنطينة", price: 600 },
  "23": { name: "عنابة", price: 700 },
}

export async function POST(request: NextRequest) {
  try {
    const { wilayaCode, quantity = 1 } = await request.json()

    if (!wilayaCode) {
      return NextResponse.json({ error: "Wilaya code is required" }, { status: 400 })
    }

    // الحصول على سعر التوصيل
    const wilayaInfo = TEMP_SHIPPING_RATES[wilayaCode as keyof typeof TEMP_SHIPPING_RATES]

    if (!wilayaInfo) {
      return NextResponse.json({ error: "Wilaya not supported" }, { status: 400 })
    }

    // حساب السعر (يمكن إضافة رسوم إضافية حسب الكمية)
    let shippingCost = wilayaInfo.price

    // إضافة رسوم إضافية للكميات الكبيرة
    if (quantity > 2) {
      shippingCost += (quantity - 2) * 50 // 50 دج لكل قطعة إضافية
    }

    return NextResponse.json({
      success: true,
      wilayaName: wilayaInfo.name,
      shippingCost: shippingCost,
      quantity: quantity,
    })
  } catch (error) {
    console.error("Shipping cost calculation error:", error)
    return NextResponse.json(
      {
        error: "Failed to calculate shipping cost",
      },
      { status: 500 },
    )
  }
}
