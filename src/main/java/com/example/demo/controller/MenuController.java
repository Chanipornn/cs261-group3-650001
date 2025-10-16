package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.demo.model.Menu;
import com.example.demo.repo.MenuRepository;
import java.util.List;

@RestController
public class MenuController {
	@Autowired
	private MenuRepository menuRepository;
	
	@GetMapping
	public List<Menu> getAllMenu() {
		return menuRepository.findAll();
	}
	
	@PostMapping
	public Menu createOrder(@RequestBody Menu menu) {
		return menuRepository.save(menu);
	}
}
