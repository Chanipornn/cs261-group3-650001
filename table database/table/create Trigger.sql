CREATE TRIGGER trg_update_best_seller
ON dbo.order_item
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @changed TABLE (menu_id INT);

    INSERT INTO @changed (menu_id)
    SELECT menu_id FROM inserted
    UNION
    SELECT menu_id FROM deleted;

    DELETE FROM dbo.best_seller
    WHERE menu_id IN (SELECT menu_id FROM @changed);

    INSERT INTO dbo.best_seller (menu_id, menu_name, total_sales, total_sales_amount, last_updated)
    SELECT 
        oi.menu_id,
        m.name AS menu_name,
        SUM(oi.quantity) AS total_sales,
        SUM(oi.quantity * (m.price + ISNULL(oi.additional_price, 0))) AS total_sales_amount,
        GETDATE() AS last_updated
    FROM dbo.order_item oi
    JOIN dbo.menu m ON oi.menu_id = m.menu_id
    WHERE oi.menu_id IN (SELECT menu_id FROM @changed)
    GROUP BY oi.menu_id, m.name;
END;
