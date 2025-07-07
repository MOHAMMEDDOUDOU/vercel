import { Header } from "@/components/header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function OrderConfirmationLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* رسالة النجاح الرئيسية */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <Skeleton className="w-12 h-12 rounded-full" />
            </div>
            <Skeleton className="h-10 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto mb-6" />
            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-lg shadow-md border-2 border-green-200">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* معلومات الطلب */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <Skeleton className="h-6 w-40 bg-white/20" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="my-6">
                  <Skeleton className="h-px w-full" />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="w-5 h-5" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>

            {/* معلومات الاتصال والدعم */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <Skeleton className="h-6 w-32 bg-white/20" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <Skeleton className="h-5 w-24 mb-3" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>

                  <div>
                    <Skeleton className="h-5 w-20 mb-3" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* أزرار التنقل */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </div>

          {/* شعار الشركة */}
          <div className="text-center mt-12">
            <Skeleton className="w-48 h-12 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto mt-2" />
          </div>
        </div>
      </main>
    </div>
  )
}
