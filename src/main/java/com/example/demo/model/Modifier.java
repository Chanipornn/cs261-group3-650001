package com.example.demo.model;

public class Modifier {
	private Long id;
	private String name;
	private double extraPrice;
	private ModifierGroup group;
	
	public Modifier() {}
	
	public Modifier(Long id, String name, double extraPrice, ModifierGroup group) {
		this.id = id;
		this.name = name;
		this.extraPrice = extraPrice;
		this.group = group;
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
	public double getExtraPrice() {
		return extraPrice;
	}
	public void setExtraPrice(double extraPrice) {
		this.extraPrice = extraPrice;
	}
	public ModifierGroup getGroup() {
		return group;
	}
	public void setGroup(ModifierGroup group) {
		this.group = group;
	}
}
