package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="OrderItemModifier")
public class OrderItemModifier {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int order_item_modifier_id;
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(columnDefinition = "order_item_id")
	private int order_item_id;
	@Column(columnDefinition = "modifier_id")
	private int modifier_id;
	@Column(columnDefinition = "note_text")
	private String note_text;
}