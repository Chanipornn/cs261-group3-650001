CREATE TABLE modifiers (
    modifier_id INT IDENTITY(1,1) PRIMARY KEY,
    modifier_group_id INT NOT NULL,                    -- อ้างอิงจาก modifier_groups
    modifier_name NVARCHAR(120) NOT NULL,              -- ชื่อตัวเลือก เช่น ไข่ดาว, หวาน 100%
    additional_price DECIMAL(10,2) DEFAULT(0),         -- ราคาเพิ่ม
    is_additional BIT NOT NULL DEFAULT(0),             -- 1 = บวกเพิ่ม, 0 = ไม่บวก
    created_at DATETIME DEFAULT GETDATE(),             -- วันที่สร้าง
    CONSTRAINT FK_modifiers_groups FOREIGN KEY (modifier_group_id) REFERENCES modifier_groups(modifier_group_id)
);
