CREATE TABLE menu_categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    category_name NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);