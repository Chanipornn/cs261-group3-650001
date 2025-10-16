package com.example.demo.model;

import java.util.List;

public class Order {
	private Long id;
	private double totalPrice;
	private List<OrderItem> items;
	
	public Order() {}
	
	public Order(Long id, double totalPrice, List<OrderItem> items) {
		this.id = id;
		this.totalPrice = totalPrice;
		this.items = items;
	}
	
	public Long getId() { 
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public double getTotalPrice() {
		return totalPrice;
	}
	public void setTotalPrice(double totalPrice) {
		this.totalPrice = totalPrice;
	}
	public List<OrderItem> getItems() {
		return items;
	}
	public void setItems(List<OrderItem> items) {
		this.items = items;
	}
}
