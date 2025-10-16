package com.example.demo.repo;

import com.example.demo.model.Menu;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Integer> {
	//List<Order> findByFirstName(String firstName);

	//List<Order> findByEmailContaining(String keyword);
}
