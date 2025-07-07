-- إضافة أعمدة الأسعار إلى جدول الطلبات
-- قم بتنفيذ هذا السكريبت في Supabase SQL Editor

-- إضافة عمود سعر المنتج
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price numeric DEFAULT 0;

-- إضافة عمود تكلفة التوصيل
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost numeric DEFAULT 0;

-- إضافة عمود المجموع النهائي
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount numeric DEFAULT 0;

-- إضافة تعليقات على الأعمدة
COMMENT ON COLUMN orders.price IS 'سعر المنتج الواحد';
COMMENT ON COLUMN orders.shipping_cost IS 'تكلفة التوصيل للطلب';
COMMENT ON COLUMN orders.total_amount IS 'المجموع النهائي (سعر المنتج × الكمية + تكلفة التوصيل)';

-- التحقق من إضافة الأعمدة
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('price', 'shipping_cost', 'total_amount')
ORDER BY column_name; 