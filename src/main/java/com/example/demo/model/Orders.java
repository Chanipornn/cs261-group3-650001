package com.example.demo.model;

import java.util.Date;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="Orders")
public class Orders {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int order_id;
	@Column(columnDefinition = "order_date")
	private Date order_date;
	@Column(columnDefinition = "total_amount")
	private int total_amount;
	@Column(columnDefinition = "payment_status")
	private String payment_status;
}
