package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "modifiers")
public class Modifier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "modifier_id")
    private Long id;

    @Column(name = "modifier_group_id")
    private Long groupId;

    @Column(name = "modifier_name")
    private String name;

    @Column(name = "additional_price")
    private Double additionalPrice;

    @Column(name = "is_additional")
    private Boolean isAdditional;

    @Column(name = "created_at")
    private String createdAt;

    public Modifier() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getAdditionalPrice() { return additionalPrice; }
    public void setAdditionalPrice(Double additionalPrice) { this.additionalPrice = additionalPrice; }

    public Boolean getIsAdditional() { return isAdditional; }
    public void setIsAdditional(Boolean isAdditional) { this.isAdditional = isAdditional; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
