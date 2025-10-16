package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="MenuCategory")

public class MenuCategory {
	@Id
	@Column(columnDefinition = "category_id")
	private int category_id;
	@Column(columnDefinition = "category_name")
	private String category_name;
}
