package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Entity
@Table(name = "orders")
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer id;

    @Column(name = "order_date")
    private LocalDateTime orderDate = LocalDateTime.now(); // default timestamp

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "order_type_id")
    private Integer orderTypeId;

    // ดึงชื่อประเภทออเดอร์ (เช่น DINE-IN / TAKE AWAY)
    @ManyToOne
    @JoinColumn(name = "order_type_id", insertable = false, updatable = false)
    private OrderType orderType;

    @JsonManagedReference
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;

    public Orders() {}

    // ===== TIME FORMAT แบบไทย =====

    @JsonProperty("orderDate")
    public String getFormattedOrderDate() {
        if (orderDate == null) return null;

        DateTimeFormatter thaiFormat =
                DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", Locale.ENGLISH);

        return orderDate.format(thaiFormat) + " น.";
    }

    // ===== ORDER TYPE NAME =====

    @JsonProperty("orderTypeName")
    public String getOrderTypeName() {
        return (orderType != null) ? orderType.getType() : null;
    }

    // ====== GETTER & SETTER ======

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public LocalDateTime getOrderDateRaw() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Integer getOrderTypeId() {
        return orderTypeId;
    }

    public void setOrderTypeId(Integer orderTypeId) {
        this.orderTypeId = orderTypeId;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;

        if (items != null) {
            items.forEach(i -> i.setOrder(this));
        }
    }
}
