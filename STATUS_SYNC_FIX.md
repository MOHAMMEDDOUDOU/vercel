# مزامنة حالة الطلب مع Google Sheets

## المشكلة

عند تغيير حالة الطلب في لوحة التحكم، لا تتغير الحالة تلقائياً في Google Sheets.

## الحل المطبق

### 1. إضافة دالة تحديث الحالة في API ✅

#### دالة `updateOrderStatus` في `app/api/sheets/route.ts`:
```typescript
async function updateOrderStatus(orderId: string, orderNumber: string, newStatus: string): Promise<boolean> {
  // البحث عن الطلب في Google Sheets
  const { exists, rowIndex } = await checkOrderExists(orderId, orderNumber)
  
  if (!exists || !rowIndex) {
    return false;
  }
  
  // تحديث حالة الطلب في العمود I (الحالة)
  const range = `Sheet1!I${rowIndex}`;
  const values = [[newStatus]];
  
  const response = await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
  
  return true;
}
```

### 2. إضافة دالة PUT في API ✅

#### دالة `PUT` في `app/api/sheets/route.ts`:
```typescript
export async function PUT(request: NextRequest) {
  const { orderId, orderNumber, status } = await request.json();
  
  // تحديث حالة الطلب في Google Sheets
  const success = await updateOrderStatus(orderId, orderNumber, status)
  
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
}
```

### 3. تحديث صفحة الإدارة ✅

#### في `app/admin/page.tsx` - دالة `handleUpdateOrderStatus`:
```typescript
// تحديث حالة الطلب في Google Sheets
try {
  const order = orders.find(o => o.id === orderId)
  if (order) {
    console.log("📊 تحديث حالة الطلب في Google Sheets:", order.id, status)
    const sheetsResponse = await fetch('/api/sheets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        orderId: order.id,
        orderNumber: `NW-${order.id}`,
        status: status
      }),
    })
    
    const sheetsResult = await sheetsResponse.json()
    if (sheetsResult.success) {
      console.log("✅ تم تحديث حالة الطلب في Google Sheets بنجاح")
    } else {
      console.error("❌ فشل في تحديث حالة الطلب في Google Sheets:", sheetsResult.error)
    }
  }
} catch (sheetsError) {
  console.error('❌ فشل في تحديث حالة الطلب في Google Sheets', sheetsError)
}
```

### 4. تحسين دالة البحث عن الطلب ✅

#### تحديث دالة `checkOrderExists`:
```typescript
async function checkOrderExists(orderId: string, orderNumber: string): Promise<{ exists: boolean, rowIndex?: number }> {
  // البحث عن الطلب وإرجاع رقم الصف إذا وجد
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const sheetOrderNumber = row[1];
    
    if (sheetOrderNumber === orderNumber || 
        sheetOrderNumber === orderId || 
        sheetOrderNumber === `NW-${orderId}`) {
      return { exists: true, rowIndex: i + 1 };
    }
  }
  
  return { exists: false };
}
```

## سير العملية الجديد

### 1. تغيير حالة الطلب في لوحة التحكم
```
🔄 ضغط زر تغيير الحالة
📝 تحديث الحالة في Supabase
📊 تحديث الحالة في Google Sheets
✅ عرض رسالة النجاح
```

### 2. الحالات المدعومة
- **pending** → قيد الانتظار
- **confirmed** → مؤكد
- **processing** → قيد المعالجة
- **cancelled** → ملغي

## رسائل التتبع

### عند التحديث الناجح
```
📊 تحديث حالة الطلب في Google Sheets: {orderId} {status}
✅ تم تحديث حالة الطلب في Google Sheets بنجاح
```

### عند فشل التحديث
```
❌ فشل في تحديث حالة الطلب في Google Sheets: {error}
```

## الاختبار

### 1. اختبار تغيير الحالة
- اذهب إلى `/admin`
- اختر طلب موجود في Google Sheets
- غير الحالة (مثل: قيد الانتظار → مؤكد)
- تحقق من Google Sheets

### 2. اختبار جميع الحالات
- جرب جميع الحالات: pending, confirmed, processing, cancelled
- تأكد من تحديث العمود I في Google Sheets

### 3. اختبار الطلبات غير الموجودة
- جرب تغيير حالة طلب غير موجود في Google Sheets
- يجب أن يعطي رسالة خطأ مناسبة

## الفوائد

### 1. مزامنة تلقائية
- تحديث فوري للحالة في Google Sheets
- لا حاجة للتدخل اليدوي
- تتبع كامل للتغييرات

### 2. دقة البيانات
- نفس الحالة في Supabase و Google Sheets
- تجنب التناقضات
- مصدر واحد للحقيقة

### 3. سهولة الإدارة
- واجهة واحدة لإدارة الطلبات
- تحديثات فورية
- شفافية كاملة

## النتيجة النهائية

- ✅ **مزامنة تلقائية** لحالة الطلب مع Google Sheets
- ✅ **تحديث فوري** عند تغيير الحالة في لوحة التحكم
- ✅ **دعم جميع الحالات** (pending, confirmed, processing, cancelled)
- ✅ **رسائل واضحة** للمستخدم
- ✅ **معالجة الأخطاء** المحسنة

**الآن حالة الطلب تتغير تلقائياً في Google Sheets عند تغييرها في لوحة التحكم!** 🎉 