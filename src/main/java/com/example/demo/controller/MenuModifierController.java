package com.example.demo.controller;

import com.example.demo.model.MenuModifier;
import com.example.demo.model.Modifier;
import com.example.demo.repo.MenuModifierRepository;
import com.example.demo.repo.ModifierRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin
public class MenuModifierController {

    private final MenuModifierRepository menuModifierRepository;
    private final ModifierRepository modifierRepository;

    public MenuModifierController(MenuModifierRepository menuModifierRepository,
                                  ModifierRepository modifierRepository) {
        this.menuModifierRepository = menuModifierRepository;
        this.modifierRepository = modifierRepository;
    }

    // ==========================
    //   GET MODIFIERS BY MENU
    // ==========================
    @GetMapping("/{menuId}/modifiers")
    public List<ModifierDTO> getModifiersByMenu(@PathVariable Long menuId) {

        // ดึงความสัมพันธ์จาก menu_modifiers
        List<MenuModifier> mList = menuModifierRepository.findByMenuId(menuId);

        return mList.stream().map(mm -> {

            // load modifier จริง
            Modifier mod = modifierRepository.findById(mm.getModifierId()).orElse(null);
            if (mod == null) return null;

            // ส่ง DTO ให้หน้าเว็บ
            return new ModifierDTO(
                    mod.getId(),          // id
                    mod.getModifierName(),        // name
                    mod.getAdditionalPrice(),     // base price
                    mod.getIsAdditional(),        // is additional?
                    mm.getAdditionalPrice()       // extra price override
            );

        }).filter(Objects::nonNull).toList();
    }

    // ==========================
    //       DTO CLASS
    // ==========================
    public static class ModifierDTO {
        public Integer id;
        public String name;
        public Double basePrice;
        public Boolean isAdditional;
        public Double extraPrice;

        public ModifierDTO(Integer id, String name, Double basePrice, Boolean isAdditional, Double extraPrice) {
            this.id = id;
            this.name = name;
            this.basePrice = basePrice;
            this.isAdditional = isAdditional;
            this.extraPrice = extraPrice;
        }
    }
}
