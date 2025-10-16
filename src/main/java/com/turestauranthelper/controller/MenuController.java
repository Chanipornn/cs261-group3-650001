package com.turestauranthelper.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.*;
import com.turestauranthelper.model.Menu;
import com.turestauranthelper.repository.MenuRepository;

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
}
