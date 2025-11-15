INSERT INTO best_seller (menu_id, menu_name, total_sales, last_updated, total_sales_amount)
VALUES
-- ใส่ค่าเริ่มต้นขายดี
(15, N'ผัดผงกะหรี่ปลาหมึก', 3, GETDATE(), 210.0),
(60, N'ชาไทย', 2, GETDATE(), 70.0),
(77, N'บัวลอย', 1, GETDATE(), 65.0)