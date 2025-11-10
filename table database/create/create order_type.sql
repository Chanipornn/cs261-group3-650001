CREATE TABLE dbo.order_type (
    order_type_id INT IDENTITY(1,1) PRIMARY KEY,   -- ระบุ id สำหรับประเภทการสั่งซื้อ
    order_type_name NVARCHAR(100) NOT NULL,         -- ชื่อประเภทการสั่งซื้อ (เช่น ทานที่ร้าน, กลับบ้าน)
);