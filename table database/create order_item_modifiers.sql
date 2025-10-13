CREATE TABLE order_item_modifiers (
    order_item_modifier_id INT IDENTITY(1,1) PRIMARY KEY,
    order_item_id INT NOT NULL,  -- เชื่อมกับ order_items
    modifier_id INT NOT NULL,  -- เชื่อมกับ modifiers
    FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id),
    FOREIGN KEY (modifier_id) REFERENCES modifiers(modifier_id)
);
--แสดงรหัสที่ลูกค้าสั่งใน order_items
--modifier_id คือ รหัสของตัวเลือกเสริม เช่น ไข่ดาว ไข่เจียว ความหวาน รสชาติ