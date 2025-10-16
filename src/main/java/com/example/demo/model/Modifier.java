package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="Modifier")
public class Modifier {
	@Id
	@Column(columnDefinition = "menu_id")
	private int menu_id;
	@Column(columnDefinition = "modifier_group_id")
	private int modifier_group_id;
	@Column(columnDefinition = "modifier_name")
	private String modifier_name;
	@Column(columnDefinition = "additional_price")
	private int additional_price;
	@Column(columnDefinition = "is_additional")
	private int is_additional;
}
