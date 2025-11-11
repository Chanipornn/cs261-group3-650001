CREATE TABLE dbo.best_seller (
    menu_id INT NOT NULL,             
    menu_name NVARCHAR(255) NOT NULL, 
    total_sales INT DEFAULT 0,        
    total_sales_amount INT DEFAULT 0,
    last_updated DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (menu_id)
);