package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "modifiers")
public class Modifier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "modifier_id")
    private Long id;

    @Column(name = "name")
    private String name;

    // group_id ใน DB จริงไหม? ถ้ามีให้แก้ตามนี้
    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "additional_price")
    private Double additionalPrice;

    @Column(name = "is_additional")
    private Boolean isAdditional;

    // ถ้ามี price ด้วยให้เพิ่มกลับมา
    @Column(name = "price")
    private Double price;

    // GETTERS & SETTERS

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
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

    public void setIsAdditional(Boolean additional) {
        isAdditional = additional;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}
