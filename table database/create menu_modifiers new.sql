CREATE TABLE dbo.menu_modifiers (
    menu_id INT,
    modifier_id INT,
    additional_price DECIMAL(10, 2) DEFAULT 0,
    PRIMARY KEY(menu_id, modifier_id),
    FOREIGN KEY(menu_id) REFERENCES dbo.menu(menu_id),
    FOREIGN KEY(modifier_id) REFERENCES dbo.modifiers(modifier_id)
);