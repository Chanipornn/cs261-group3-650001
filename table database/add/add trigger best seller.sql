CREATE OR ALTER TRIGGER trg_best_seller_after_insert
ON dbo.order_item
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH S AS (
        SELECT 
            i.menu_id,
            MAX(m.name)                    AS menu_name,
            SUM(i.quantity)                AS qty,
            SUM(i.quantity * m.price)      AS amt
        FROM inserted i
        JOIN dbo.menu m ON m.menu_id = i.menu_id
        GROUP BY i.menu_id
    )
    MERGE dbo.best_seller AS T
    USING S
      ON T.menu_id = S.menu_id
    WHEN MATCHED THEN
        UPDATE SET
            T.menu_name          = S.menu_name,              -- เผื่อชื่อเมนูถูกแก้
            T.total_sales        = T.total_sales + S.qty,    -- บวกเพิ่มตามที่สั่ง
            T.total_sales_amount = T.total_sales_amount + S.amt,
            T.last_updated       = SYSUTCDATETIME()
    WHEN NOT MATCHED THEN
        INSERT (menu_id, menu_name, total_sales, total_sales_amount, last_updated)
        VALUES (S.menu_id, S.menu_name, S.qty, S.amt, SYSUTCDATETIME());
END
GO