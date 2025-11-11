CREATE TRIGGER trg_update_best_seller
ON dbo.order_item
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    -- ลบข้อมูลใน best_seller ที่ไม่ถูกต้อง
    DELETE FROM dbo.best_seller WHERE menu_id IN (SELECT menu_id FROM inserted);

    -- คำนวณยอดขายรวมของเมนูใหม่ที่มีการเพิ่ม/แก้ไข
    INSERT INTO dbo.best_seller (menu_id, menu_name, total_sales, total_sales_amount, last_updated)
    SELECT 
        oi.menu_id, 
        m.name AS menu_name, 
        SUM(oi.quantity) AS total_sales, 
        SUM(oi.quantity * (m.price + ISNULL(oi.additional_price, 0))) AS total_sales_amount, 
        GETDATE() AS last_updated
    FROM 
        dbo.order_item oi
    JOIN 
        dbo.menu m ON oi.menu_id = m.menu_id
    GROUP BY 
        oi.menu_id, m.name;
END;