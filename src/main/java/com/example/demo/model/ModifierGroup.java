package com.example.demo.model;

import java.util.List;

public class ModifierGroup {
	private Long id;
	private String groupName;
	private List<Modifier> modifiers;
	
	public ModifierGroup() {}
	
	public ModifierGroup(Long id, String groupName, List<Modifier> modifiers) {
		this.id = id;
		this.groupName = groupName;
		this.modifiers = modifiers;
	}
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getGroupName() {
		return groupName;
	}
	public void setGroupName(String groupName) {
		this.groupName = groupName;
	}
	public List<Modifier> getModifiers() {
		return modifiers;
	}
	public void setModifiers(List<Modifier> modifiers) {
		this.modifiers = modifiers;
	}
}
