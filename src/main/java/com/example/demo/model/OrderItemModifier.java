package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "OrderItemModifier")
public class OrderItemModifier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_modifier_id")
    private Integer orderItemModifierId;

    @ManyToOne
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;

    @ManyToOne
    @JoinColumn(name = "modifier_id")
    private Modifier modifier;

    @Column(name = "note_text")
    private String noteText;
}
