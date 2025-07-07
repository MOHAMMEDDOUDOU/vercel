# NextWear - متجر إلكتروني

## إعداد المشروع على Vercel

### المتغيرات البيئية المطلوبة

يجب إضافة المتغيرات البيئية التالية في إعدادات Vercel:

#### Google Sheets API
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id
```

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

#### Resend (للإيميلات)
```
RESEND_API_KEY=your-resend-api-key
```

### خطوات النشر على Vercel

1. **ربط المشروع بـ Vercel:**
   - ارفع المشروع إلى GitHub
   - اربط المستودع بـ Vercel
   - أضف المتغيرات البيئية المذكورة أعلاه

2. **إعدادات البناء:**
   - Framework Preset: Next.js
   - Build Command: `npm run build` أو `pnpm build`
   - Output Directory: `.next`

3. **إعدادات Runtime:**
   - تم تكوين المشروع ليعمل مع Node.js 18.x
   - تم إعداد googleapis للعمل في بيئة serverless

### ملاحظات مهمة

- تأكد من أن Google Service Account لديه صلاحيات الكتابة على Google Sheets
- تأكد من أن Google Sheets API مفعل في مشروع Google Cloud
- المشروع يستخدم Supabase كقاعدة بيانات
- تم تكوين المشروع ليعمل مع Vercel بدون مشاكل

### استكشاف الأخطاء

إذا واجهت مشاكل مع googleapis على Vercel:
1. تأكد من إضافة `runtime = 'nodejs'` في ملفات API
2. تأكد من صحة المتغيرات البيئية
3. تحقق من سجلات Vercel للخطأ المحدد

### الأوامر المحلية

```bash
# تثبيت التبعيات
pnpm install

# تشغيل المشروع محلياً
pnpm dev

# بناء المشروع
pnpm build

# تشغيل المشروع المبنى
pnpm start
``` 