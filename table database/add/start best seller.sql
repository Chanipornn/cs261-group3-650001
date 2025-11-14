INSERT INTO best_seller (menu_id, menu_name, total_sales, last_updated, total_sales_amount)
VALUES
-- ใส่ค่าเริ่มต้นขายดี
(1, N'ผัดผงกะหรี่ปลาหมึก', 3, GETDATE(), 210.0),
(2, N'ชาไทย', 2, GETDATE(), 70.0),
(3, N'บัวลอย', 1, GETDATE(), 65.0)