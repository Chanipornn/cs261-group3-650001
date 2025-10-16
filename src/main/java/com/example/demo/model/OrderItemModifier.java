package com.example.demo.model;

public class OrderItemModifier {
	private Long id;
	private OrderItem orderItem;
	private Modifier modifier;
	
	public OrderItemModifier() {}
	
	public OrderItemModifier(Long id, OrderItem orderItem, Modifier modifier) {
		this.id = id;
		this.orderItem = orderItem;
		this.modifier = modifier;
	}
	
	public Long getId() { 
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public OrderItem getOrderItem() {
		return orderItem;
	}
	public void setOrderItem(OrderItem orderItem) {
		this.orderItem = orderItem;
	}
	public Modifier getModifier() {
		return modifier;
	}
	public void setModifier(Modifier modifier) {
		this.modifier = modifier;
	}
}
