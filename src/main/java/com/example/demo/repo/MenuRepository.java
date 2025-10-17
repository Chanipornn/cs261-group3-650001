package com.example.demo.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.Menu;

public interface MenuRepository extends JpaRepository<Menu, Long> { }