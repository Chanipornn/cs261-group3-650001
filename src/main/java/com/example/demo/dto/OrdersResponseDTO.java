package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import java.util.List;

@JsonPropertyOrder({
        "orderTypeName",
        "id",
        "orderDate",
        "paymentStatus",
        "totalAmount",
        "orderTypeId",
        "items",
        "orderDateRaw"
})
public class OrdersResponseDTO {

    private Integer id;
    private String orderDate;
    private String paymentStatus;
    private Double totalAmount;

    private Integer orderTypeId;
    private String orderTypeName;

    private String orderDateRaw;

    private List<OrderItemDTO> items;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(String orderDate) {
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

    public String getOrderTypeName() {
        return orderTypeName;
    }

    public void setOrderTypeName(String orderTypeName) {
        this.orderTypeName = orderTypeName;
    }

    public String getOrderDateRaw() {
        return orderDateRaw;
    }

    public void setOrderDateRaw(String orderDateRaw) {
        this.orderDateRaw = orderDateRaw;
    }

    public List<OrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDTO> items) {
        this.items = items;
    }
}
