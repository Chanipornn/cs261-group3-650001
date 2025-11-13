package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "order_type")
public class OrderType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_type_id")
    private Integer id;

    @Column(name = "order_type_name")
    private String type;

    public OrderType() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
