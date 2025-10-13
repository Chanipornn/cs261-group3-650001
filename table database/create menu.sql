CREATE TABLE menu (
    menu_id INT PRIMARY KEY,               
    name NVARCHAR(255) NOT NULL,           -- ชื่อเมนู
    category_id INT NOT NULL,              -- หมวดหมู่ (1=อาหาร, 2=เครื่องดื่ม, 3=ของทานเล่น)
    price DECIMAL(10,2) NOT NULL,          -- ราคา
    created_at DATETIME DEFAULT GETDATE(), -- วันที่สร้าง
    FOREIGN KEY (category_id) REFERENCES menu_categories(category_id)
);