-- คำนวณยอดรวม พร้อมแสดงชื่อเมนู สิ่งที่เพิ่ม ราคา ราคารวม และจำนวนที่สั่ง
SELECT 
    m.name AS menu_name, 
    STRING_AGG(mo.modifier_name, ', ') AS modifiers,  -- รวมชื่อของตัวเลือกเสริม
    m.price AS menu_price,  -- ราคาของเมนู
    SUM(m.price + ISNULL(mo.additional_price, 0)) AS total_price, -- ราคารวม
    COUNT(mm.menu_id) AS quantity  -- จำนวนที่สั่ง
FROM dbo.menu m
LEFT JOIN dbo.menu_modifiers mm ON m.menu_id = mm.menu_id
LEFT JOIN dbo.modifiers mo ON mm.modifier_id = mo.modifier_id
WHERE m.menu_id IN (5, 56, 56, 77, 78)  -- เมนูที่ผู้ใช้เลือก
AND mo.modifier_id IN (5, 15, 14, 36, 35)  -- ตัวเลือกเสริมที่ผู้ใช้เลือก
GROUP BY m.name, m.price;