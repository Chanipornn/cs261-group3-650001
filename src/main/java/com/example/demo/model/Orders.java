package com.example.demo.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="Orders")
public class Orders {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Integer order_id;
	@Column(name = "order_date")
	private LocalDateTime order_date = LocalDateTime.now();
	@Column(name = "total_amount")
	private int total_amount;
	@Column(name = "payment_status")
	private String payment_status;
}
