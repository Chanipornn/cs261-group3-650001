package com.example.demo.model;

import java.util.List;

public class MenuCategory {
	private Long id;
	private String name;
	private List<Menu> menus;
	
	public MenuCategory() {}
	
	public MenuCategory(Long id, String name, List<Menu> menus) {
		this.id = id;
		this.name = name;
		this.menus = menus;
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
	public List<Menu> getMenus() {
		return menus;
	}
	public void setMenus(List<Menu> menus) {
		this.menus = menus;
	}
}
