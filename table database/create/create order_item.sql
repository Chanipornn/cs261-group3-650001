CREATE TABLE dbo.order_item (
    order_item_id INT IDENTITY(1,1) PRIMARY KEY, 
    additional_price DECIMAL(10, 2) DEFAULT 0, 
    note_text NVARCHAR(255) DEFAULT NULL, 
    quantity INT DEFAULT 1, 
    menu_id INT,  
    order_id INT,  
    CONSTRAINT FK_menu_id FOREIGN KEY (menu_id) REFERENCES dbo.menu(menu_id), 
    CONSTRAINT FK_order_id FOREIGN KEY (order_id) REFERENCES dbo.orders(order_id) 
);