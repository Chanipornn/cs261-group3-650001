CREATE TABLE modifier_groups (
    modifier_group_id INT IDENTITY(1,1) PRIMARY KEY,
    group_name NVARCHAR(120) NOT NULL,
    description NVARCHAR(255) NULL
);
GO