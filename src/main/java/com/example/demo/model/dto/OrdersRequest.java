package com.example.demo.model.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdersRequest {
	@NotEmpty(message = "order_id")
	private int order_id;
	@NotEmpty(message = "order_time")
	private LocalDateTime order_date;
	@NotEmpty(message = "total_amount")
	private int total_amount;
	@NotEmpty(message = "payment_status")
	private String payment_status;
	
	public int getOrder_id() {
		return order_id;
	}
	public void setOrder_id(int order_id) {
		this.order_id = order_id;
	}
	public String getPayment_status() {
		return payment_status;
	}
	public void setPayment_status(String payment_status) {
		this.payment_status = payment_status;
	}
}
