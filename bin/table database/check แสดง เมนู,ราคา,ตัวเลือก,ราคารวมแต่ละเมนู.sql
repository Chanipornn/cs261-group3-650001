-- เลือกข้อมูลเมนูที่ผู้ใช้เลือก
SELECT m.menu_id, m.name AS menu_name, m.price AS menu_price
FROM dbo.menu m
WHERE m.menu_id IN (5, 56, 77, 78); -- กะเพราหมูกรอบ (ID 5), ชาพีช (ID 56), บัวลอย (ID 77), ปาท่องโก๋(ID 78)

-- เลือกตัวเลือกเสริมที่ผู้ใช้เลือก
SELECT mo.modifier_id, mo.modifier_name, mo.additional_price
FROM dbo.modifiers mo
WHERE mo.modifier_id IN (5, 14, 36, 35); -- ไข่เจียว (ID 5), ความหวาน 25% (ID 14), ชีสดิป (ID 6),ไข่ (ID 36), สังขยา(ID 35)

-- คำนวณยอดรวม
SELECT 
    m.name AS menu_name, 
    m.price AS menu_price,
    STRING_AGG(mo.modifier_name, ', ') AS modifiers,  -- รวมชื่อของตัวเลือกเสริม
    SUM(m.price + ISNULL(mo.additional_price, 0)) AS total_price -- คำนวณยอดรวมราคา
FROM dbo.menu m
LEFT JOIN dbo.menu_modifiers mm ON m.menu_id = mm.menu_id
LEFT JOIN dbo.modifiers mo ON mm.modifier_id = mo.modifier_id
WHERE m.menu_id IN (5, 56, 77, 78)  -- เมนูที่ผู้ใช้เลือก
AND mo.modifier_id IN (5, 14, 36, 35)  -- ตัวเลือกเสริมที่ผู้ใช้เลือก
GROUP BY m.name, m.price;