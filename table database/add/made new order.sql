-- สร้างการสั่งซื้อใหม่
INSERT INTO dbo.orders (order_date, total_amount, payment_status)
VALUES (GETDATE(), 0, 'Unpaid');  -- ใช้เวลาปัจจุบันและยอดรวม 0 (รอคำนวณทีหลัง)