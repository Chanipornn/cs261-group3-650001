package com.example.demo.model;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Data
@Entity
@Table(name = "Orders")
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer orderId;

    @Column(name = "order_date")
    private LocalDateTime orderDate = LocalDateTime.now();

    @Column(name = "total_amount")
    private Integer totalAmount;

    @Column(name = "payment_status")
    private String paymentStatus;
    
    @Column(name = "order_type_id")
    private Integer order_type_id;

    // ใช้ JsonManagedReference เพื่อกันวนซ้ำ
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems;


    // Getter ที่ถูกต้อง
    public List<OrderItem> getOrderItems() {
        return orderItems;
    }

    // Setter ที่ผูกความสัมพันธ์สองฝั่ง
    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
        if (orderItems != null) {
            for (OrderItem item : orderItems) {
                item.setOrder(this);
            }
        }
    }

}
