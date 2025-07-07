import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const key = process.env.GOOGLE_PRIVATE_KEY
    const sheetId = process.env.GOOGLE_SHEET_ID

    const hasEmail = !!email
    const hasKey = !!key
    const hasSheetId = !!sheetId

    // معاينة للـ private key (أول 50 حرف فقط)
    const keyPreview = key ? `${key.substring(0, 50)}...` : null

    return NextResponse.json({
      hasEmail,
      hasKey,
      hasSheetId,
      email: hasEmail ? email : null,
      keyPreview: hasKey ? keyPreview : null,
      sheetId: hasSheetId ? sheetId : null,
      allSet: hasEmail && hasKey && hasSheetId
    })

  } catch (error) {
    return NextResponse.json({
      error: 'فشل في فحص المتغيرات البيئية',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 })
  }
} 