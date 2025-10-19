package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.PostConstruct;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(
		  origins = "*",
		  allowedHeaders = "*",
		  methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE, RequestMethod.OPTIONS}
		)

public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private MenuRepository menuRepository;

    // ✅ ล้างข้อมูลเก่าทุกครั้งที่รัน (ตามที่คุณตั้งใจไว้)
    @PostConstruct
    public void resetOrdersOnStartup() {
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        System.out.println("✅ Cleared all orders on startup!");
    }

    // ✅ ดึง Order ทั้งหมด
    @GetMapping
    public List<Orders> getAllOrders() {
        return orderRepository.findAll();
    }

    // ✅ ดึง Order ตาม ID
    @GetMapping("/{id}")
    public ResponseEntity<Orders> getOrderById(@PathVariable Integer id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ สร้างออเดอร์ใหม่ (ใช้ menuId เพื่อ lookup เมนูจาก DB)
    @PostMapping
    public Orders createOrder(@RequestBody Orders order) {
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                item.setOrder(order);

                // ✅ ใช้ menuId ดึงข้อมูลเมนูจริงจาก DB
                if (item.getMenuId() != null) {
                    menuRepository.findById(Long.valueOf(item.getMenuId()))
                            .ifPresent(item::setMenu);
                }
            }
        }

        // ✅ บันทึกออเดอร์ทั้งหมด (Cascade จะ save OrderItem ด้วย)
        Orders savedOrder = orderRepository.save(order);
        return savedOrder;
    }

    // ✅ ลบออเดอร์ตาม ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Integer id) {
        if (!orderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        orderRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ ลบทุกออเดอร์
    @DeleteMapping
    public ResponseEntity<Void> deleteAllOrders() {
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }
}
