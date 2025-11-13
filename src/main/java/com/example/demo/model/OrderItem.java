package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "order_item")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_id")
    private Integer id;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "additional_price")
    private Double additionalPrice;

    @Column(name = "note_text")
    private String noteText;

    @Column(name = "menu_id")
    private Long menuId;

    @ManyToOne
    @JoinColumn(name = "menu_id", insertable = false, updatable = false)
    private Menu menu;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Orders order;

    public OrderItem() {}

    // ===== NOT STORED IN DB =====
    @Transient
    private String menuName;

    @Transient
    private Double menuPrice;

    // ===== GETTER & SETTER =====

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getAdditionalPrice() { return additionalPrice; }
    public void setAdditionalPrice(Double additionalPrice) { this.additionalPrice = additionalPrice; }

    public String getNoteText() { return noteText; }
    public void setNoteText(String noteText) { this.noteText = noteText; }

    public Long getMenuId() { return menuId; }
    public void setMenuId(Long menuId) { this.menuId = menuId; }

    public Menu getMenu() { return menu; }
    public void setMenu(Menu menu) { this.menu = menu; }

    public Orders getOrder() { return order; }
    public void setOrder(Orders order) { this.order = order; }

    public String getMenuName() { return menuName; }
    public void setMenuName(String menuName) { this.menuName = menuName; }

    public Double getMenuPrice() { return menuPrice; }
    public void setMenuPrice(Double menuPrice) { this.menuPrice = menuPrice; }
}
