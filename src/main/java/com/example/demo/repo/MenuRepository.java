package com.example.demo.repo;

import com.example.demo.model.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface MenuRepository extends JpaRepository<Menu, Integer>{

}
