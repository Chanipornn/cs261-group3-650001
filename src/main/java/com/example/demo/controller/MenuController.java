package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.*;
import com.example.demo.model.Menu;
import com.example.demo.repo.MenuRepository;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class MenuController {

    @Autowired
    private MenuRepository repo;

    // ดึงเมนูทั้งหมดจากฐานข้อมูล
    @GetMapping
    public List<Menu> getAllMenu() {
        return repo.findAll();
    }
    // ดึงข้อมูลตาม id
    @GetMapping("/{id}")
    public Menu getMenuById(@PathVariable Long id) {
        return repo.findById(id).orElse(null);
    }

}