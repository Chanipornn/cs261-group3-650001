package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="ModifierGroup")
public class ModifierGroup {
	@Id
	@Column(columnDefinition = "menu_id")
	private int menu_id;
	@Column(columnDefinition = "name")
	private String name;
	@Column(columnDefinition = "category_id")
	private int category_id;
	@Column(columnDefinition = "price")
	private int price;
	@Column(columnDefinition = "allow_notes")
	private String allow_notes;
}
