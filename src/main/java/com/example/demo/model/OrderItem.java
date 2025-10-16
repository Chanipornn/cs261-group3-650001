package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="OrderItem")
public class OrderItem {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int order_item_id;
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(columnDefinition = "order_id")
	private int order_id;
	@Column(columnDefinition = "menu_id")
	private int menu_id;
	@Column(columnDefinition = "quantity")
	private int quantity;
	@Column(columnDefinition = "additional_price")
	private int additional_price;
	@Column(columnDefinition = "note_text")
	private String note_text;
}
