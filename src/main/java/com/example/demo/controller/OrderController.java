package com.example.demo.controller;

import com.example.demo.dto.OrderItemDTO;
import com.example.demo.dto.OrdersResponseDTO;
import com.example.demo.model.Menu;
import com.example.demo.model.OrderItem;
import com.example.demo.model.OrderType;
import com.example.demo.model.Orders;
import com.example.demo.repo.MenuRepository;
import com.example.demo.repo.OrderRepository;
import com.example.demo.repo.OrderTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private OrderTypeRepository orderTypeRepository;

    // ล้างข้อมูลทุกครั้งที่รัน
    @PostConstruct
    public void resetOrdersOnStartup() {
        orderRepository.deleteAll();
    }

    // =============================
    // CREATE ORDER (POST)
    // =============================
    @PostMapping
    public ResponseEntity<OrdersResponseDTO> createOrder(@RequestBody Orders orderRequest) {

        double total = 0;

        if (orderRequest.getItems() != null) {
            for (OrderItem item : orderRequest.getItems()) {

                Menu menu = menuRepository.findById(item.getMenuId()).orElse(null);

                if (menu != null) {
                    total += (menu.getPrice() + item.getAdditionalPrice()) * item.getQuantity();
                }

                item.setOrder(orderRequest); // set parent
            }
        }

        orderRequest.setTotalAmount(total);

        Orders savedOrder = orderRepository.save(orderRequest);

        return ResponseEntity.ok(convertToDTO(savedOrder));
    }

    // =============================
    // GET ALL ORDERS
    // =============================
    @GetMapping
    public List<OrdersResponseDTO> getAllOrders() {
        List<Orders> orders = orderRepository.findAll();
        List<OrdersResponseDTO> responseList = new ArrayList<>();

        for (Orders order : orders) {
            responseList.add(convertToDTO(order));
        }
        return responseList;
    }

    // =============================
    // GET ORDER BY ID
    // =============================
    @GetMapping("/{id}")
    public ResponseEntity<OrdersResponseDTO> getOrderById(@PathVariable Integer id) {
        return orderRepository.findById(id)
                .map(order -> ResponseEntity.ok(convertToDTO(order)))
                .orElse(ResponseEntity.notFound().build());
    }

    // =============================
    // Convert Orders → DTO
    // =============================
    private OrdersResponseDTO convertToDTO(Orders order) {

        OrdersResponseDTO dto = new OrdersResponseDTO();
        dto.setId(order.getId());
        dto.setOrderDate(order.getFormattedOrderDate());
        dto.setOrderDateRaw(order.getOrderDateRaw().toString());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setOrderTypeId(order.getOrderTypeId());

        // ===== FIX: กัน orderTypeId = null =====
        Integer typeId = order.getOrderTypeId();
        String typeName = null;

        if (typeId != null) {
            OrderType type = orderTypeRepository.findById(typeId).orElse(null);
            if (type != null) {
                typeName = type.getType();
            }
        }

        dto.setOrderTypeName(typeName);

        // เติมรายการ orderItems
        List<OrderItemDTO> itemDTOList = new ArrayList<>();

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {

                Menu menu = menuRepository.findById(item.getMenuId()).orElse(null);

                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setId(item.getId());
                itemDTO.setMenuId(item.getMenuId());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setAdditionalPrice(item.getAdditionalPrice());
                itemDTO.setNoteText(item.getNoteText());

                if (menu != null) {
                    itemDTO.setMenuName(menu.getName());
                    itemDTO.setMenuPrice(menu.getPrice());
                }

                itemDTOList.add(itemDTO);
            }
        }

        dto.setItems(itemDTOList);

        return dto;
    }
}
