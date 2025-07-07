export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Dynamic import for googleapis
let sheets: any = null;

async function getSheets() {
  if (!sheets) {
    const { google } = await import('googleapis');
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    sheets = google.sheets({ version: 'v4', auth });
  }
  return sheets;
}

// إعداد Supabase
const supabaseUrl = "https://qsmakqtmedwchbgjevod.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbWFrcXRtZWR3Y2hiZ2pldm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDM0ODEsImV4cCI6MjA2NjcxOTQ4MX0.itt0vx_pR7P5_RA0oVFUFOI8Ni-kADltLojtrstjbTo";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// جدول أسعار التوصيل حسب الولاية ونوع التوصيل
const SHIPPING_PRICES: Record<string, { home: number, office: number }> = {
  "ADRAR": { home: 1400, office: 900 },
  "CHLEF": { home: 850, office: 450 },
  "LAGHOUAT": { home: 950, office: 550 },
  "OUM EL BOUAGHI": { home: 850, office: 450 },
  "BATNA": { home: 900, office: 450 },
  "BEJAIA": { home: 800, office: 450 },
  "BISKRA": { home: 950, office: 550 },
  "BECHAR": { home: 1100, office: 650 },
  "BLIDA": { home: 600, office: 400 },
  "BOUIRA": { home: 700, office: 450 },
  "TAMANRASSET": { home: 1600, office: 1050 },
  "TEBESSA": { home: 900, office: 450 },
  "TLEMCEN": { home: 900, office: 500 },
  "TIARET": { home: 850, office: 450 },
  "TIZI OUZOU": { home: 750, office: 450 },
  "ALGER": { home: 500, office: 300 },
  "DJELFA": { home: 950, office: 500 },
  "JIJEL": { home: 900, office: 450 },
  "SETIF": { home: 800, office: 450 },
  "SAIDA": { home: 900, office: 0 },
  "SKIKDA": { home: 900, office: 450 },
  "SIDI BEL ABBESS": { home: 900, office: 450 },
  "ANNABA": { home: 850, office: 450 },
  "GUELMA": { home: 900, office: 450 },
  "CONSTANTINE": { home: 800, office: 450 },
  "MEDEA": { home: 800, office: 450 },
  "MOSTAGANEM": { home: 900, office: 450 },
  "M'SILA": { home: 850, office: 500 },
  "MASCARA": { home: 900, office: 450 },
  "OUARGLA": { home: 950, office: 600 },
  "ORAN": { home: 800, office: 450 },
  "EL BAYADH": { home: 1100, office: 600 },
  "BORDJ BOU ARERRIDJ": { home: 800, office: 450 },
  "BOUMERDES": { home: 700, office: 450 },
  "ET TARF": { home: 850, office: 450 },
  "TISSEMSILT": { home: 900, office: 0 },
  "EL OUED": { home: 950, office: 600 },
  "KHENCHELA": { home: 900, office: 450 },
  "SOUK AHRAS": { home: 900, office: 450 },
  "TIPAZA": { home: 700, office: 450 },
  "MILA": { home: 900, office: 450 },
  "AIN DEFLA": { home: 900, office: 450 },
  "NAAMA": { home: 1100, office: 450 },
  "AIN TEMOUCHENT": { home: 900, office: 450 },
  "GHARDAIA": { home: 950, office: 550 },
  "RELIZANE": { home: 900, office: 450 },
  "M'GHAIR": { home: 950, office: 0 },
  "EL MENIA": { home: 1000, office: 0 },
  "OULED DJELLAL": { home: 950, office: 550 },
  "BENI ABBES": { home: 1000, office: 0 },
  "TIMIMOUN": { home: 1400, office: 0 },
  "TOUGGOURT": { home: 950, office: 600 },
  "IN SALAH": { home: 1600, office: 0 },
  "IN GUEZZAM": { home: 1600, office: 0 },
}

function getShippingCost(wilaya: string, deliveryType: string) {
  // تطابق الاسم بأي شكل
  const entry = Object.entries(SHIPPING_PRICES).find(([key]) => wilaya.trim().toUpperCase().includes(key))
  if (entry) {
    const prices = entry[1]
    if (deliveryType === 'office') return prices.office || 0
    return prices.home || 0
  }
  // إذا لم توجد الولاية نعيد قيمة افتراضية
  return 1000
}

// دالة للتحقق من وجود الطلب في Google Sheets
async function checkOrderExists(orderId: string, orderNumber: string, customerData?: { name?: string, phone?: string }): Promise<{ exists: boolean, rowIndex?: number }> {
  try {
    console.log('🔍 التحقق من وجود الطلب في Google Sheets:', { orderId, orderNumber, customerData })
    
    // جلب جميع البيانات من Google Sheets
    const sheetsInstance = await getSheets();
    const response = await sheetsInstance.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:O',
    });

    const rows = response.data.values || [];
    console.log(`📊 عدد الصفوف في Google Sheets: ${rows.length}`)

    // البحث عن الطلب في العمود B (رقم الطلب) والعمود C (اسم العميل) والعمود D (رقم الهاتف)
    for (let i = 1; i < rows.length; i++) { // تخطي الصف الأول (العناوين)
      const row = rows[i];
      const sheetOrderNumber = row[1]; // العمود B - رقم الطلب
      const customerName = row[2]; // العمود C - اسم العميل
      const phoneNumber = row[3]; // العمود D - رقم الهاتف
      
      // البحث بعدة طرق:
      // 1. تطابق رقم الطلب مباشرة
      // 2. تطابق ID الطلب
      // 3. تطابق اسم العميل + رقم الهاتف (للتأكد من أنه نفس الطلب)
      
      if (sheetOrderNumber === orderNumber || 
          sheetOrderNumber === orderId || 
          sheetOrderNumber === `NW-${orderId}` ||
          sheetOrderNumber.includes(orderId.toString())) {
        console.log('⚠️ الطلب موجود بالفعل في Google Sheets في الصف:', i + 1, 'برقم:', sheetOrderNumber)
        return { exists: true, rowIndex: i + 1 };
      }
      
      // دالة مساعدة لتطبيع رقم الهاتف
      const normalizePhone = (phone: string) => {
        return phone.replace(/^0+/, '').replace(/\D/g, '');
      };
      
      // البحث باستخدام بيانات العميل إذا كانت متوفرة
      if (customerData && customerData.name && customerData.phone) {
        const normalizedSheetPhone = normalizePhone(phoneNumber);
        const normalizedCustomerPhone = normalizePhone(customerData.phone);
        
        if (customerName === customerData.name && normalizedSheetPhone === normalizedCustomerPhone) {
          console.log('⚠️ الطلب موجود بالفعل في Google Sheets في الصف:', i + 1, 'باستخدام بيانات العميل')
          return { exists: true, rowIndex: i + 1 };
        }
      }
      
      // البحث باستخدام ID الطلب في رقم الطلب (لحالات مثل NW-1751839825845)
      if (sheetOrderNumber.includes(`NW-`) && customerData && customerData.name && customerData.phone) {
        const normalizedSheetPhone = normalizePhone(phoneNumber);
        const normalizedCustomerPhone = normalizePhone(customerData.phone);
        
        // التحقق من أن هذا هو نفس الطلب باستخدام بيانات العميل
        if (customerName === customerData.name && normalizedSheetPhone === normalizedCustomerPhone) {
          console.log('⚠️ الطلب موجود بالفعل في Google Sheets في الصف:', i + 1, 'باستخدام بيانات العميل (رقم مختلف)')
          return { exists: true, rowIndex: i + 1 };
        }
      }
      
      // البحث باستخدام timestamp في رقم الطلب
      if (sheetOrderNumber.includes(`NW-`) && customerData && customerData.name && customerData.phone) {
        const normalizedSheetPhone = normalizePhone(phoneNumber);
        const normalizedCustomerPhone = normalizePhone(customerData.phone);
        
        // استخراج timestamp من رقم الطلب (مثل 1751839825845)
        const timestampMatch = sheetOrderNumber.match(/NW-(\d+)/);
        if (timestampMatch && customerName === customerData.name && normalizedSheetPhone === normalizedCustomerPhone) {
          console.log('⚠️ الطلب موجود بالفعل في Google Sheets في الصف:', i + 1, 'باستخدام timestamp:', timestampMatch[1])
          return { exists: true, rowIndex: i + 1 };
        }
      }
    }

    console.log('✅ الطلب غير موجود في Google Sheets - يمكن الإضافة')
    return { exists: false };
  } catch (error) {
    console.error('❌ خطأ في التحقق من وجود الطلب:', error)
    // في حالة الخطأ، نفترض أن الطلب غير موجود لتجنب فقدان البيانات
    return { exists: false };
  }
}

// دالة لتحديث حالة الطلب في Google Sheets
async function updateOrderStatus(orderId: string, orderNumber: string, newStatus: string, customerData?: { name?: string, phone?: string }): Promise<boolean> {
  try {
    console.log('🔄 تحديث حالة الطلب في Google Sheets:', { orderId, orderNumber, newStatus, customerData })
    
    // البحث عن الطلب في Google Sheets
    const { exists, rowIndex } = await checkOrderExists(orderId, orderNumber, customerData)
    
    if (!exists || !rowIndex) {
      console.log('❌ الطلب غير موجود في Google Sheets - لا يمكن التحديث')
      return false;
    }
    
    // تحديث حالة الطلب في العمود I (الحالة)
    const range = `Sheet1!I${rowIndex}`;
    const values = [[newStatus]];
    
    const sheetsInstance = await getSheets();
    const response = await sheetsInstance.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    
    console.log('✅ تم تحديث حالة الطلب في Google Sheets بنجاح')
    console.log('📈 استجابة Google Sheets:', response.data)
    
    return true;
  } catch (error) {
    console.error('❌ خطأ في تحديث حالة الطلب في Google Sheets:', error)
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 بدء معالجة طلب Google Sheets...')
    
    // التحقق من المتغيرات البيئية
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL غير محدد')
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('GOOGLE_PRIVATE_KEY غير محدد')
    }
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID غير محدد')
    }

    console.log('✅ تم التحقق من المتغيرات البيئية')
    
    const { orderId, orderNumber } = await request.json();
    console.log('📦 بيانات الطلب المستلمة:', { orderId, orderNumber })
    
    if (!orderId) {
      throw new Error('orderId مطلوب')
    }
    
    // جلب بيانات الطلب من قاعدة البيانات
    console.log('🔍 جلب بيانات الطلب من قاعدة البيانات...')
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
    
    if (orderError || !orders || orders.length === 0) {
      console.error('❌ خطأ في جلب بيانات الطلب:', orderError)
      throw new Error(`فشل في جلب بيانات الطلب: ${orderError?.message || 'الطلب غير موجود'}`)
    }
    
    const order = orders[0]
    console.log('✅ تم جلب بيانات الطلب:', order)
    
    // التحقق من وجود الطلب في Google Sheets لمنع التكرار
    const finalOrderNumber = orderNumber || `NW-${order.id}`
    const { exists } = await checkOrderExists(order.id, finalOrderNumber, {
      name: order.customer_name,
      phone: order.phone_number
    })
    
    if (exists) {
      console.log('⚠️ الطلب موجود بالفعل في Google Sheets - تم تخطي الإرسال')
      return NextResponse.json({ 
        success: true, 
        message: 'الطلب موجود بالفعل في Google Sheets',
        skipped: true
      });
    }
    
    // استخدام القيم المحفوظة في جدول الطلبات
    const productPrice = order.price || 0
    const shippingCost = order.shipping_cost || 0
    const totalAmount = order.total_amount || 0
    
    console.log('💰 الأسعار المحفوظة:', {
      productPrice,
      shippingCost,
      totalAmount
    })
    
    // تنسيق البيانات للإرسال إلى Google Sheets
    const values = [
      [
        new Date().toLocaleString('ar-DZ'), // التاريخ والوقت
        finalOrderNumber, // رقم الطلب
        order.customer_name || 'غير محدد',
        order.phone_number || 'غير محدد',
        order.wilaya || 'غير محدد',
        order.commune || 'غير محدد',
        order['delivery-type'] || 'غير محدد',
        order.quantity || 0,
        order.status || 'pending',
        order.product_name || 'غير محدد', // اسم المنتج
        order.size || 'غير محدد', // الحجم
        productPrice, // سعر المنتج (محسوب)
        shippingCost, // سعر التوصيل (محسوب)
        totalAmount, // المجموع الكلي (محسوب)
        '', // ملاحظات إضافية
      ]
    ];

    console.log('📊 البيانات المجهزة للإرسال:', values)

    // إرسال البيانات إلى Google Sheets
    const sheetsInstance = await getSheets();
    const response = await sheetsInstance.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:O', // من العمود A إلى O (أضفنا 3 أعمدة جديدة)
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    console.log('✅ تم إرسال الطلب إلى Google Sheets بنجاح')
    console.log('📈 استجابة Google Sheets:', response.data)
    
    return NextResponse.json({ 
      success: true, 
      message: 'تم إرسال الطلب إلى Google Sheets بنجاح',
      updatedRange: response.data.updates?.updatedRange
    });

  } catch (error) {
    console.error('❌ خطأ في إرسال الطلب إلى Google Sheets:', error);
    
    // تفاصيل أكثر عن الخطأ
    let errorMessage = 'خطأ غير معروف'
    let errorDetails = ''
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.stack || ''
    }
    
    console.error('🔍 تفاصيل الخطأ:', {
      message: errorMessage,
      details: errorDetails,
      env: {
        hasEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
        hasSheetId: !!process.env.GOOGLE_SHEET_ID,
        emailLength: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.length || 0,
        keyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
        sheetIdLength: process.env.GOOGLE_SHEET_ID?.length || 0
      }
    })
    
    return NextResponse.json({ 
      error: 'فشل في إرسال الطلب إلى Google Sheets',
      details: errorMessage,
      debug: {
        hasEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
        hasSheetId: !!process.env.GOOGLE_SHEET_ID
      }
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 بدء تحديث حالة الطلب في Google Sheets...')
    
    // التحقق من المتغيرات البيئية
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL غير محدد')
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('GOOGLE_PRIVATE_KEY غير محدد')
    }
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID غير محدد')
    }

    console.log('✅ تم التحقق من المتغيرات البيئية')
    
    const { orderId, orderNumber, status } = await request.json();
    console.log('📦 بيانات تحديث الحالة:', { orderId, orderNumber, status })
    
    if (!orderId || !status) {
      throw new Error('orderId و status مطلوبان')
    }
    
    // جلب بيانات الطلب من قاعدة البيانات للحصول على معلومات العميل
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
    
    if (orderError || !orders || orders.length === 0) {
      console.error('❌ خطأ في جلب بيانات الطلب:', orderError)
      throw new Error(`فشل في جلب بيانات الطلب: ${orderError?.message || 'الطلب غير موجود'}`)
    }
    
    const order = orders[0]
    console.log('✅ تم جلب بيانات الطلب:', order)
    
    const finalOrderNumber = orderNumber || `NW-${orderId}`
    
    // تحديث حالة الطلب في Google Sheets مع بيانات العميل
    const success = await updateOrderStatus(orderId, finalOrderNumber, status, {
      name: order.customer_name,
      phone: order.phone_number
    })
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'تم تحديث حالة الطلب في Google Sheets بنجاح'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'فشل في تحديث حالة الطلب في Google Sheets'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('❌ خطأ في تحديث حالة الطلب في Google Sheets:', error);
    
    let errorMessage = 'خطأ غير معروف'
    
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json({ 
      error: 'فشل في تحديث حالة الطلب في Google Sheets',
      details: errorMessage
    }, { status: 500 });
  }
} 