package com.example.demo.model;

public class Menu {
	private Long id;
	private String name;
	private double price;
	private MenuCategory category;
	
	public Menu() {}
	
	public Menu(Long id, String name, double price, MenuCategory category) {
		this.id = id;
		this.name = name;
		this.price = price;
		this.category = category;
	}
	
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
	public double getPrice() {
		return price;
	}
	public void setPrice(double price) {
		this.price = price;
	}
	public MenuCategory getCategory() {
		return category;
	}
	public void setCategory(MenuCategory category) {
		this.category = category;
	}
	
}
