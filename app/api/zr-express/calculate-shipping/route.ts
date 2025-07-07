export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from "next/server"
import { calculateShippingCost } from "@/lib/zr-express-api"

export async function POST(request: NextRequest) {
  try {
    const { wilaya, deliveryType, quantity = 1 } = await request.json()

    if (!wilaya || !deliveryType) {
      return NextResponse.json(
        {
          success: false,
          error: "الولاية ونوع التوصيل مطلوبان",
        },
        { status: 400 },
      )
    }

    const shippingCost = calculateShippingCost(wilaya, deliveryType, quantity)

    return NextResponse.json({
      success: true,
      shippingCost,
      wilaya,
      deliveryType,
      quantity,
    })
  } catch (error) {
    console.error("Error calculating shipping:", error)
    return NextResponse.json(
      {
        success: false,
        error: "فشل في حساب سعر التوصيل",
      },
      { status: 500 },
    )
  }
}
