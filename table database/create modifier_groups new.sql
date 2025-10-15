CREATE TABLE modifier_groups (
    modifier_group_id INT IDENTITY(1,1) PRIMARY KEY,  -- ใช้ Identity เพื่อให้เลขเพิ่มอัตโนมัติ
    group_name NVARCHAR(120) NOT NULL,                 -- ชื่อกลุ่มตัวเลือก เช่น ข้าว, ไข่, ความหวาน
    description NVARCHAR(255) NOT NULL,                -- คำอธิบายเกี่ยวกับตัวเลือก
    created_at DATETIME DEFAULT GETDATE()              -- วันที่สร้าง (ค่า default จะเป็นวันเวลาปัจจุบัน)
);