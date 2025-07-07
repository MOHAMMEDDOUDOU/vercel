// إعداد ZR Express API
const ZR_EXPRESS_CONFIG = {
  baseUrl: "https://procolis.com/api_v1",
  token: process.env.ZR_EXPRESS_TOKEN || "a16ca0a3cefb4a9c728886f8572cd524d30569b67f3141ec722e600995c07a54",
  key: process.env.ZR_EXPRESS_KEY || "3adcb49b5f0147aaa68d84bfac7b8bb0",
}

// أسعار التوصيل الحقيقية من ZR Express
const SHIPPING_RATES = {
  أدرار: { home: 1400, office: 900 },
  الشلف: { home: 850, office: 450 },
  الأغواط: { home: 950, office: 550 },
  "أم البواقي": { home: 850, office: 450 },
  باتنة: { home: 900, office: 450 },
  بجاية: { home: 800, office: 450 },
  بسكرة: { home: 950, office: 550 },
  بشار: { home: 1100, office: 650 },
  البليدة: { home: 600, office: 400 },
  البويرة: { home: 700, office: 450 },
  تمنراست: { home: 1600, office: 1050 },
  تبسة: { home: 900, office: 450 },
  تلمسان: { home: 900, office: 500 },
  تيارت: { home: 850, office: 450 },
  "تيزي وزو": { home: 750, office: 450 },
  الجزائر: { home: 500, office: 400 },
  الجلفة: { home: 950, office: 500 },
  جيجل: { home: 900, office: 450 },
  سطيف: { home: 800, office: 450 },
  سعيدة: { home: 900, office: 450 },
  سكيكدة: { home: 900, office: 450 },
  "سيدي بلعباس": { home: 900, office: 450 },
  عنابة: { home: 850, office: 450 },
  قالمة: { home: 900, office: 450 },
  قسنطينة: { home: 800, office: 450 },
  المدية: { home: 800, office: 450 },
  مستغانم: { home: 900, office: 450 },
  المسيلة: { home: 850, office: 500 },
  معسكر: { home: 900, office: 450 },
  ورقلة: { home: 950, office: 600 },
  وهران: { home: 800, office: 450 },
  البيض: { home: 1100, office: 600 },
  "برج بوعريريج": { home: 800, office: 450 },
  بومرداس: { home: 700, office: 450 },
  الطارف: { home: 850, office: 450 },
  تيسمسيلت: { home: 900, office: 450 },
  الوادي: { home: 950, office: 600 },
  خنشلة: { home: 900, office: 450 },
  "سوق أهراس": { home: 900, office: 450 },
  تيبازة: { home: 700, office: 450 },
  ميلة: { home: 900, office: 450 },
  "عين الدفلى": { home: 900, office: 450 },
  النعامة: { home: 1100, office: 600 },
  "عين تموشنت": { home: 900, office: 450 },
  غرداية: { home: 950, office: 550 },
  غليزان: { home: 900, office: 450 },
  المغير: { home: 950, office: 450 },
  المنيعة: { home: 1000, office: 500 },
  "أولاد جلال": { home: 950, office: 550 },
  "بني عباس": { home: 1000, office: 500 },
  تيميمون: { home: 1400, office: 700 },
  توقرت: { home: 950, office: 600 },
  "عين صالح": { home: 1600, office: 800 },
  "عين قزام": { home: 1600, office: 800 },
}

// خريطة الولايات مع أرقامها في ZR Express
const WILAYA_IDS: Record<string, string> = {
  "أدرار": "1",
  "الشلف": "2", 
  "الأغواط": "3",
  "أم البواقي": "4",
  "باتنة": "5",
  "بجاية": "6",
  "بسكرة": "7",
  "بشار": "8",
  "البليدة": "9",
  "البويرة": "10",
  "تمنراست": "11",
  "تبسة": "12",
  "تلمسان": "13",
  "تيارت": "14",
  "تيزي وزو": "15",
  "الجزائر": "16",
  "الجلفة": "17",
  "جيجل": "18",
  "سطيف": "19",
  "سعيدة": "20",
  "سكيكدة": "21",
  "سيدي بلعباس": "22",
  "عنابة": "23",
  "قالمة": "24",
  "قسنطينة": "25",
  "المدية": "26",
  "مستغانم": "27",
  "المسيلة": "28",
  "معسكر": "29",
  "ورقلة": "30",
  "وهران": "31",
  "البيض": "32",
  "برج بوعريريج": "33",
  "بومرداس": "34",
  "الطارف": "35",
  "تيسمسيلت": "36",
  "الوادي": "37",
  "خنشلة": "38",
  "سوق أهراس": "39",
  "تيبازة": "40",
  "ميلة": "41",
  "عين الدفلى": "42",
  "النعامة": "43",
  "عين تموشنت": "44",
  "غرداية": "45",
  "غليزان": "46",
  "المغير": "47",
  "المنيعة": "48",
  "أولاد جلال": "49",
  "بني عباس": "50",
  "تيميمون": "51",
  "توقرت": "52",
  "عين صالح": "53",
  "عين قزام": "54",
}

// دالة لتطبيع اسم الولاية
function normalizeWilaya(wilaya: string) {
  return wilaya
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}

// دالة لتطبيع اسم البلدية
function normalizeCommune(commune: string) {
  return commune
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ًٌٍَُِّْ]/g, '') // إزالة التشكيل
    .replace(/\s+/g, ' ');
}

// دالة لحساب سعر التوصيل
export function calculateShippingCost(wilaya: string, deliveryType: "office" | "home", quantity = 1) {
  const rates = SHIPPING_RATES[wilaya as keyof typeof SHIPPING_RATES]
  if (!rates) {
    return deliveryType === "home" ? 800 : 450
  }

  let cost = rates[deliveryType]
  if (quantity > 1) {
    cost += (quantity - 1) * 50
  }

  return cost
}

// دالة للحصول على جميع الولايات المتاحة
export function getAvailableWilayas() {
  return Object.keys(SHIPPING_RATES)
}

// دالة اختبار الاتصال
export async function testZRExpressConnection() {
  try {
    const response = await fetch(`${ZR_EXPRESS_CONFIG.baseUrl}/token`, {
      method: "GET",
      headers: {
        token: ZR_EXPRESS_CONFIG.token,
        key: ZR_EXPRESS_CONFIG.key,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    const data = await response.json()
    return {
      success: response.ok,
      data,
      status: response.status,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 0,
    }
  }
}

// دالة إنشاء الطلب الحقيقي في ZR Express
export async function createZRExpressOrder(orderData: {
  customerName: string
  customerPhone: string
  wilaya: string
  commune: string
  address: string
  products: Array<{
    name: string
    quantity: number
    price: number
    size?: string
  }>
  totalAmount: number
  shippingCost: number
  deliveryType: "home" | "office"
}) {
  // تطبيع اسم الولاية للبحث في الخريطة
  const normalizedWilaya = normalizeWilaya(orderData.wilaya);
  const wilayaId = WILAYA_IDS[normalizedWilaya] || WILAYA_IDS[orderData.wilaya] || "16";
  const trackingNumber = `NW${Date.now()}`;
  const productsDescription = orderData.products.map((p) => `${p.name}${p.size ? ` (${p.size})` : ''} x${p.quantity}`).join(" + ");

  // معالجة البلدية - فقط للتوصيل للمنزل
  let communeField = "";
  if (orderData.deliveryType === "home" && orderData.commune && orderData.commune.trim() !== "") {
    communeField = normalizeCommune(orderData.commune);
  } else if (orderData.deliveryType === "home") {
    // إذا كان التوصيل للمنزل ولكن لا توجد بلدية، استخدم الولاية
    communeField = normalizeWilaya(orderData.wilaya) || "";
  }

  const payload = {
    Colis: [
      {
        Tracking: trackingNumber,
        TypeLivraison: orderData.deliveryType === "home" ? "0" : "1",
        TypeColis: "0",
        Confrimee: "1",
        Client: orderData.customerName.trim(),
        MobileA: orderData.customerPhone.replace(/\s/g, ""),
        MobileB: "",
        Adresse: orderData.address.trim(),
        IDWilaya: wilayaId,
        Commune: communeField,
        Total: orderData.totalAmount.toString(),
        Note: "",
        TProduit: productsDescription,
        id_Externe: trackingNumber,
        Source: "NextWearDZ",
      },
    ],
  };

  console.log("📦 إرسال طلب إلى ZR Express:", {
    wilaya: orderData.wilaya,
    normalizedWilaya,
    wilayaId,
    deliveryType: orderData.deliveryType,
    commune: orderData.commune,
    communeField,
    trackingNumber,
    productsCount: orderData.products.length,
  });
  
  console.log("🔍 تفاصيل إضافية:", {
    originalWilaya: orderData.wilaya,
    normalizedWilaya,
    availableWilayas: Object.keys(WILAYA_IDS),
    foundWilayaId: WILAYA_IDS[normalizedWilaya] || WILAYA_IDS[orderData.wilaya],
    originalCommune: orderData.commune,
    normalizedCommune: communeField,
  });
  
  console.log("📦 البيانات المرسلة إلى ZR Express:", payload);

  const response = await fetch("https://procolis.com/api_v1/add_colis", {
    method: "POST",
    headers: {
      token: ZR_EXPRESS_CONFIG.token,
      key: ZR_EXPRESS_CONFIG.key,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.log("📦 استجابة ZR Express:", {
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ خطأ في ZR Express:", errorText);
    throw new Error(`ZR Express Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("✅ نجح إنشاء الطلب في ZR Express:", data);
  
  // التحقق من وجود أخطاء في الاستجابة
  if (data.Colis && data.Colis.length > 0) {
    const colis = data.Colis[0];
    if (colis.IDRetour !== "0" || colis.MessageRetour !== "Good") {
      console.error("❌ خطأ في ZR Express:", {
        IDRetour: colis.IDRetour,
        MessageRetour: colis.MessageRetour,
        wilaya: colis.IDWilaya,
        commune: colis.Commune
      });
      
      // بدلاً من رمي خطأ، نعيد البيانات مع رسالة الخطأ
      return {
        success: false,
        error: colis.MessageRetour,
        errorId: colis.IDRetour,
        trackingNumber: trackingNumber,
        data: data
      };
    }
  }
  
  return data;
}

export async function createZRExpressOrderNew(orderData: {
  firstName: string
  lastName: string
  phone: string
  address: string
  wilaya: string
  commune: string
  deliveryType: "home" | "office"
  productName: string
  quantity: number
  price: number
  codAmount: number
  weight: number
  notes?: string
  source?: string
  referenceId?: string
}) {
  const response = await fetch("https://api.zr-express.com/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.ZR_EXPRESS_TOKEN}`,
    },
    body: JSON.stringify({
      client: {
        first_name: orderData.firstName,
        last_name: orderData.lastName,
        phone: orderData.phone,
        address: orderData.address,
        wilaya: orderData.wilaya,
        commune: orderData.commune,
        "delivery-type": orderData.deliveryType,
      },
      order: {
        product_name: orderData.productName,
        quantity: orderData.quantity,
        price: orderData.price,
        cod_amount: orderData.codAmount,
        weight: orderData.weight,
        notes: orderData.notes || "",
      },
      metadata: {
        source: orderData.source || "nextweardz",
        reference_id: orderData.referenceId || "",
      }
    }),
  })

  const data = await response.json()
  return data
}
