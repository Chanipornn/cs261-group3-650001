WITH OrderDetails AS (
    SELECT 
        oi.menu_id, 
        m.name AS menu_name, 
        oi.quantity, 
        mo.modifier_name, 
        mo.additional_price,
        m.price AS menu_price,
        oi.quantity * (m.price + ISNULL(mo.additional_price, 0)) AS total_price_per_item,  -- คำนวณราคารวมของแต่ละรายการ
        oi.order_id,
        oi.note_text -- ใช้ชื่อคอลัมน์ที่ถูกต้องคือ note_text
    FROM dbo.order_item oi
    LEFT JOIN dbo.menu m ON oi.menu_id = m.menu_id
    LEFT JOIN dbo.order_item_modifier oim ON oi.order_item_id = oim.order_item_id
    LEFT JOIN dbo.modifiers mo ON oim.modifier_id = mo.modifier_id
    WHERE oi.order_id = 6 -- เปลี่ยนตาม order_id ที่ต้องการ
)
-- แสดงรายการเมนูพร้อมตัวเลือกเสริม
SELECT od.menu_name, 
       od.quantity, 
       od.modifier_name, 
       od.menu_price, 
       ISNULL(od.additional_price, 0) AS modifier_price,  -- แสดงราคาที่เพิ่มจากตัวเลือกเสริม
       od.total_price_per_item,
       od.note_text -- แสดงข้อความที่ลูกค้าพิมพ์ใน note_text
FROM OrderDetails AS od

UNION ALL
-- แสดงยอดรวมทั้งหมดของออเดอร์ในแถวถัดไป
SELECT 'Total Order Price', 
       NULL, 
       NULL, 
       NULL, 
       NULL,  -- ไม่มีราคาตัวเลือกเสริมในบรรทัดรวมทั้งหมด
       SUM(od.total_price_per_item),  -- รวมยอดทั้งหมด
       NULL  -- ไม่มีข้อความในบรรทัดรวมทั้งหมด
FROM OrderDetails AS od;