package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@Entity
@Table(name = "OrderItem")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "order"})
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_id")
    private Integer orderItemId;

    // ใช้รับค่า menuId จาก frontend
    @Transient
    private Integer menuId;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "additional_price")
    private Integer additionalPrice;

    @Column(name = "note_text")
    private String noteText;

    // ✅ เชื่อมกับเมนู
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "menu_id", referencedColumnName = "menu_id")
    private Menu menu;

    // ✅ เชื่อมกับออเดอร์
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Orders order;

    public void setOrder(Orders order) {
        this.order = order;
    }

    // ✅ Getter/Setter ของ menuId
    public Integer getMenuId() {
        return menuId;
    }

    public void setMenuId(Integer menuId) {
        this.menuId = menuId;
    }

    // ✅ Getter/Setter ของ Menu (เพิ่มส่วนนี้!)
    public Menu getMenu() {
        return menu;
    }

    public void setMenu(Menu menu) {
        this.menu = menu;
    }
}
