"use client"

import { Header } from "@/components/header"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { Minus, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const handleCheckout = () => {
    if (!user) {
      // Redirect to login
      window.location.href = "/login"
      return
    }

    // Process checkout (cash on delivery)
    clearCart()
    router.push(`/order-confirmation?orderId=cart-${Date.now()}&orderNumber=CART-${Date.now()}`)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-8">السلة</h1>
            <div className="max-w-md mx-auto">
              <p className="text-gray-600 mb-8">السلة فارغة</p>
              <Link href="/products">
                <Button className="bg-orange-500 hover:bg-orange-600">تصفح المنتجات</Button>
              </Link>
            </div>
          </div>
        </main>

        <WhatsAppFloat />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-12">السلة</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-gray-600">{item.price} دج</p>
                        {item.size && <p className="text-sm text-gray-500">المقاس: {item.size}</p>}
                        {item.color && <p className="text-sm text-gray-500">اللون: {item.color}</p>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>{total} دج</span>
                  </div>
                  <div className="flex justify-between">
                    <span>التوصيل:</span>
                    <span>مجاني</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>الإجمالي:</span>
                      <span>{total} دج</span>
                    </div>
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handleCheckout}>
                    تأكيد الطلب (الدفع عند الاستلام)
                  </Button>
                  <p className="text-sm text-gray-600 text-center">الدفع عند الاستلام متاح في جميع أنحاء الجزائر</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <WhatsAppFloat />
    </div>
  )
}
