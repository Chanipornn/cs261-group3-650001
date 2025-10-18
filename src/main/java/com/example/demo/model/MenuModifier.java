package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "menu_modifiers")
public class MenuModifier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "menu_id")
    private Long menuId;

    @Column(name = "modifier_id")
    private Long modifierId;

    @Column(name = "additional_price")
    private Double additionalPrice;

    public MenuModifier() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMenuId() { return menuId; }
    public void setMenuId(Long menuId) { this.menuId = menuId; }

    public Long getModifierId() { return modifierId; }
    public void setModifierId(Long modifierId) { this.modifierId = modifierId; }

    public Double getAdditionalPrice() { return additionalPrice; }
    public void setAdditionalPrice(Double additionalPrice) { this.additionalPrice = additionalPrice; }
}
