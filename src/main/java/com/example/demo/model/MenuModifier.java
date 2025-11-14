package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "menu_modifiers")
@IdClass(MenuModifier.CompositeKey.class)  
public class MenuModifier {

    @Id
    @Column(name = "menu_id")
    private Long menuId;

    @Id
    @Column(name = "modifier_id")
    private Long modifierId;

    @Column(name = "additional_price")
    private Double additionalPrice;

    public static class CompositeKey implements java.io.Serializable {
        private Long menuId;
        private Long modifierId;

        public CompositeKey() {}

        public CompositeKey(Long menuId, Long modifierId) {
            this.menuId = menuId;
            this.modifierId = modifierId;
        }
    }

    // GETTER & SETTER

    public Long getMenuId() { return menuId; }
    public void setMenuId(Long menuId) { this.menuId = menuId; }

    public Long getModifierId() { return modifierId; }
    public void setModifierId(Long modifierId) { this.modifierId = modifierId; }

    public Double getAdditionalPrice() { return additionalPrice; }
    public void setAdditionalPrice(Double additionalPrice) { this.additionalPrice = additionalPrice; }
}
