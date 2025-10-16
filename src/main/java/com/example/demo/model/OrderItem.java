package com.example.demo.model;

import java.util.List;

public class OrderItem {
	private Long id;
	private Order order;
	private Menu menu;
	private int quantity;
	private double price;
	private List<OrderItemModifier> modifiers;
	
	public OrderItem() {}
	
	public OrderItem(Long id, Order order, Menu menu, int quantity, double price, List<OrderItemModifier> modifiers) {
		this.id = id;
		this.order = order;
		this.menu = menu;
		this.quantity = quantity;
		this.price = price;
		this.modifiers = modifiers;
	}
	
	public Long getId() { 
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Order getOrder() { 
		return order;
	}
	public void setOrder(Order order) {
		this.order = order;
	}
	public Menu getMenu() { 
		return menu;
	}
	public void setMenu(Menu menu) {
		this.menu = menu;
	}
	public int getQuantity() { 
		return quantity;
	}
	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}
	public double getPrice() { 
		return price;
	}
	public void setPrice(double price) {
		this.price = price;
	}
	public List<OrderItemModifier> setModifiers() {
		return modifiers;
	}
	public void getModifiers(List<OrderItemModifier> modifiers) {
		this.modifiers = modifiers;
	}
}
