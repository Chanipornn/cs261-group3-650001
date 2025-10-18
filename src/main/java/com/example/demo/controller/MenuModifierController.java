package com.example.demo.controller;

import com.example.demo.model.MenuModifier;
import com.example.demo.model.Modifier;
import com.example.demo.repo.MenuModifierRepository;
import com.example.demo.repo.ModifierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class MenuModifierController {

    @Autowired
    private MenuModifierRepository menuModifierRepository;

    @Autowired
    private ModifierRepository modifierRepository;

    // GET /api/menu/{menuId}/modifiers
    @GetMapping("/menu/{menuId}/modifiers")
    public List<ModifierDTO> getModifiersByMenu(@PathVariable Long menuId) {

        List<MenuModifier> menuMods = menuModifierRepository.findByMenuId(menuId);

        return menuMods.stream().map(mm -> {
            Modifier mod = modifierRepository.findById(mm.getModifierId()).orElse(null);
            if (mod == null) return null;

            return new ModifierDTO(
                    mod.getId(),
                    mod.getName(),
                    mod.getGroupId(),
                    mod.getAdditionalPrice(),
                    mod.getIsAdditional(),
                    mm.getAdditionalPrice()
            );
        }).filter(dto -> dto != null).collect(Collectors.toList());
    }

    // GET /api/modifier-groups/{groupId} -> ดึง modifiers ตาม group
    @GetMapping("/modifier-groups/{groupId}")
    public List<Modifier> getModifiersByGroup(@PathVariable Long groupId){
        return modifierRepository.findByGroupId(groupId);
    }

    // DTO สำหรับ front-end
    public static class ModifierDTO {
        public Long id;
        public String name;
        public Long groupId;
        public Double basePrice;   // ราคาใน modifiers
        public Boolean isAdditional;
        public Double menuPrice;   // ราคาเฉพาะเมนู

        public ModifierDTO(Long id, String name, Long groupId, Double basePrice, Boolean isAdditional, Double menuPrice) {
            this.id = id;
            this.name = name;
            this.groupId = groupId;
            this.basePrice = basePrice;
            this.isAdditional = isAdditional;
            this.menuPrice = menuPrice;
        }
    }
}
