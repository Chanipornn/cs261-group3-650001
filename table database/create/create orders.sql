CREATE TABLE orders (
    order_id INT IDENTITY(1,1) PRIMARY KEY, --idการสั่ง
    order_date DATETIME DEFAULT GETDATE(),--วันที่
    total_amount DECIMAL(10,2) DEFAULT 0, --ยอดรวม
    payment_status NVARCHAR(50) DEFAULT 'Unpaid'  -- เช่น 'Paid', 'Unpaid'
);