# دليل النشر على Vercel

## المتغيرات البيئية المطلوبة

### 1. Google Sheets API
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id
```

### 2. Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. Resend (للإيميلات)
```
RESEND_API_KEY=your-resend-api-key
```

### 4. ZR Express API (اختياري)
```
ZR_EXPRESS_API_KEY=your-zr-express-api-key
ZR_EXPRESS_API_URL=https://api.zrexpress.dz
```

## خطوات النشر

### 1. إعداد Google Cloud Project
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد أو اختر مشروع موجود
3. فعّل Google Sheets API
4. أنشئ Service Account جديد
5. حمّل ملف JSON للمفاتيح
6. شارك Google Sheet مع Service Account email

### 2. إعداد Supabase
1. اذهب إلى [Supabase](https://supabase.com/)
2. أنشئ مشروع جديد
3. انسخ URL و API Keys
4. أنشئ الجداول المطلوبة (orders, products)

### 3. رفع المشروع إلى GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repository.git
git push -u origin main
```

### 4. النشر على Vercel
1. اذهب إلى [Vercel](https://vercel.com/)
2. اضغط "New Project"
3. اختر المستودع من GitHub
4. أضف المتغيرات البيئية المذكورة أعلاه
5. اضغط "Deploy"

## إعدادات Vercel المطلوبة

### Framework Preset
- Next.js

### Build Command
```
pnpm build
```

### Output Directory
```
.next
```

### Install Command
```
pnpm install
```

## استكشاف الأخطاء

### مشكلة googleapis
إذا ظهرت رسالة "v0 doesn't support previewing code using googleapis":
1. تأكد من إضافة `runtime = 'nodejs'` في جميع ملفات API
2. تأكد من صحة المتغيرات البيئية
3. تحقق من سجلات Vercel

### مشكلة المتغيرات البيئية
1. تأكد من إضافة جميع المتغيرات المطلوبة
2. تأكد من صحة القيم
3. تأكد من عدم وجود مسافات إضافية

### مشكلة البناء
1. تحقق من سجلات البناء في Vercel
2. تأكد من صحة الكود
3. تأكد من تثبيت جميع التبعيات

## ملاحظات مهمة

- تأكد من أن Google Service Account لديه صلاحيات الكتابة على Google Sheets
- تأكد من أن Google Sheets API مفعل في مشروع Google Cloud
- المشروع يستخدم Supabase كقاعدة بيانات
- تم تكوين المشروع ليعمل مع Vercel بدون مشاكل
- جميع ملفات API تم تكوينها لتعمل مع Node.js runtime 