package com.example.demo.repo;

import com.example.demo.model.MenuModifier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuModifierRepository extends JpaRepository<MenuModifier, MenuModifier.CompositeKey> {

    List<MenuModifier> findByMenuId(Long menuId);
}
