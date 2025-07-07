export const runtime = 'nodejs';

import { NextResponse } from "next/server"
import { testZRExpressConnection } from "@/lib/zr-express-api"

export async function GET() {
  try {
    console.log("🔍 اختبار الاتصال بـ ZR Express...")
    
    const result = await testZRExpressConnection()
    
    console.log("📊 نتيجة اختبار الاتصال:", result)
    
    return NextResponse.json({
      success: result.success,
      data: result.data,
      status: result.status,
      error: result.error,
      message: result.success ? "الاتصال ناجح" : "فشل في الاتصال",
    })
  } catch (error) {
    console.error("💥 خطأ في اختبار الاتصال:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "خطأ في الخادم أثناء اختبار الاتصال",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
      },
      { status: 500 }
    )
  }
}
