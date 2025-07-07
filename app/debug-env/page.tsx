"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Eye, EyeOff } from "lucide-react"

export default function DebugEnvPage() {
  const [showSecrets, setShowSecrets] = useState(false)
  const [envStatus, setEnvStatus] = useState<any>(null)

  const checkEnvironment = async () => {
    try {
      const response = await fetch('/api/debug-env')
      const data = await response.json()
      setEnvStatus(data)
    } catch (error) {
      setEnvStatus({ error: 'فشل في فحص المتغيرات البيئية' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">تشخيص المتغيرات البيئية</h1>
          <p className="text-xl text-gray-600">فحص إعدادات Google Sheets API</p>
        </div>

        <div className="space-y-6">
          {/* زر الفحص */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                فحص المتغيرات البيئية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={checkEnvironment}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                بدء الفحص
              </Button>
            </CardContent>
          </Card>

          {/* نتائج الفحص */}
          {envStatus && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {envStatus.error ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  نتائج الفحص
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {envStatus.error ? (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-red-800 font-semibold">❌ {envStatus.error}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* حالة المتغيرات */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">GOOGLE_SERVICE_ACCOUNT_EMAIL</span>
                        <Badge variant={envStatus.hasEmail ? "default" : "destructive"}>
                          {envStatus.hasEmail ? "موجود" : "مفقود"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">GOOGLE_PRIVATE_KEY</span>
                        <Badge variant={envStatus.hasKey ? "default" : "destructive"}>
                          {envStatus.hasKey ? "موجود" : "مفقود"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">GOOGLE_SHEET_ID</span>
                        <Badge variant={envStatus.hasSheetId ? "default" : "destructive"}>
                          {envStatus.hasSheetId ? "موجود" : "مفقود"}
                        </Badge>
                      </div>
                    </div>

                    {/* تفاصيل المتغيرات */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSecrets(!showSecrets)}
                        >
                          {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {showSecrets ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                        </Button>
                      </div>

                      {showSecrets && (
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold mb-2">GOOGLE_SERVICE_ACCOUNT_EMAIL:</h4>
                            <div className="bg-gray-100 p-2 rounded text-sm font-mono break-all">
                              {envStatus.email || "غير محدد"}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">GOOGLE_PRIVATE_KEY:</h4>
                            <div className="bg-gray-100 p-2 rounded text-sm font-mono break-all">
                              {envStatus.keyPreview || "غير محدد"}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">GOOGLE_SHEET_ID:</h4>
                            <div className="bg-gray-100 p-2 rounded text-sm font-mono break-all">
                              {envStatus.sheetId || "غير محدد"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* نصائح */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">نصائح للتصحيح:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {!envStatus.hasEmail && (
                          <li>• تأكد من إضافة GOOGLE_SERVICE_ACCOUNT_EMAIL في ملف .env.local</li>
                        )}
                        {!envStatus.hasKey && (
                          <li>• تأكد من إضافة GOOGLE_PRIVATE_KEY في ملف .env.local</li>
                        )}
                        {!envStatus.hasSheetId && (
                          <li>• تأكد من إضافة GOOGLE_SHEET_ID في ملف .env.local</li>
                        )}
                        <li>• تأكد من إعادة تشغيل الخادم بعد تعديل ملف .env.local</li>
                        <li>• تأكد من أن ملف .env.local موجود في مجلد المشروع الرئيسي</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 