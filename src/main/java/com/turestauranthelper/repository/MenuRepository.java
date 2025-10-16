package com.turestauranthelper.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.turestauranthelper.model.Menu;

public interface MenuRepository extends JpaRepository<Menu, Long> { }
