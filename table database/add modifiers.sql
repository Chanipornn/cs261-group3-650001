INSERT INTO modifiers (modifier_group_id, modifier_name, additional_price, is_additional)
VALUES
(1, 'Normal Plate', 0, 0),
(1, 'Rice Pot', 40, 1),  -- เพิ่มโถข้าว 40 บาท

-- เพิ่มตัวเลือกสำหรับไข่
(2, 'Normal', 0, 0),
(2, 'Special', 10, 1),
(2, 'Fried Egg', 10, 1),
(2, 'Sunny Side Up', 10, 1),
(2, 'Boiled Egg', 10, 1),
(2, 'Soft Boiled Egg', 10, 1),

--ขนาดจาน
(3, 'Normal', 0, 0),
(3, 'Special', 10, 1),     -- เพิ่มพิเศษ 10 บาท

-- เพิ่มตัวเลือกสำหรับความหวาน (เครื่องดื่ม)
(4, '125%', 0, 0),
(4, '100%', 0, 0),
(4, '75%', 0, 0),
(4, '50%', 0, 0),
(4, '25%', 0, 0),

-- เพิ่มตัวเลือกสำหรับเนย (ปังปิ้ง)
(5, 'Sugar Butter', 0, 0),
(5, 'Sweetened Condensed Milk Butter', 0, 0),
(5, 'Sugar Butter with Milk', 5, 1),
(5, 'Double Chocolate', 5, 1),

-- เพิ่มตัวเลือกสำหรับไอศกรีม
(6, 'Chocolate', 0, 0),
(6, 'Thai Tea', 0, 0),
(6, 'Strawberry', 0, 0),
(6, 'Blueberry', 0, 0),

-- เพิ่มตัวเลือกสำหรับชีสดิป
(7, 'Add Cheese Dip', 10, 1),

-- เพิ่มตัวเลือกสำหรับเค้กลาวา
(8, 'Chocolate', 0, 0),
(8, 'Thai Tea', 0, 0),
(8, 'Strawberry', 0, 0),
(8, 'Blueberry', 0, 0),

-- เพิ่มตัวเลือกสำหรับเค้กหน้านิ่ม
(9, 'Chocolate', 0, 0),
(9, 'Thai Tea', 0, 0),
(9, 'Strawberry', 0, 0),
(9, 'Blueberry', 0, 0),

-- เพิ่มตัวเลือกสำหรับปาท่องโก๋
(10, 'No Dipping Sauce', 0, 0),
(10, 'Sweetened Condensed Milk', 0, 0),  -- ไม่คิดเงิน
(10, 'Custard', 5, 1),    -- คิดเงิน

-- เพิ่มตัวเลือกสำหรับบัวลอย
(11, 'Add Egg', 10, 1);  -- คิดเพิ่ม 10 บาท