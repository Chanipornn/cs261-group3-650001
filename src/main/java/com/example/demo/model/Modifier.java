package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "modifiers")
public class Modifier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "modifier_id")
    private Integer id;

    @Column(name = "modifier_name")   // 👈 ของจริงใน DB
    private String modifierName;

    @Column(name = "additional_price")
    private Double additionalPrice;

    @Column(name = "is_additional")
    private Boolean isAdditional;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    // GETTER & SETTER

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getModifierName() {
        return modifierName;
    }

    public void setModifierName(String modifierName) {
        this.modifierName = modifierName;
    }

    public Double getAdditionalPrice() {
        return additionalPrice;
    }

    public void setAdditionalPrice(Double additionalPrice) {
        this.additionalPrice = additionalPrice;
    }

    public Boolean getIsAdditional() {
        return isAdditional;
    }

    public void setIsAdditional(Boolean isAdditional) {
        this.isAdditional = isAdditional;
    }

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
