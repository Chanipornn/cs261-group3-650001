package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="Menu")
public class Menu {
	@Id
	@Column(name = "menu_id")
	private int menu_id;
	@Column(name = "name")
	private String name;
	@Column(name = "category_id")
	private int category_id;
	@Column(name = "price")
	private int price;
	@Column(name = "allow_notes")
	private String allow_notes;
}
