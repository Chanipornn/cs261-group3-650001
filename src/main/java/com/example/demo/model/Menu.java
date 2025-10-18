package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "menu")
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "menu_id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "category_id")
    private int categoryId;

    @Column(name = "price")
    private double price;

    @Column(name = "allow_notes")
    private boolean allowNotes;
    
    @Column(name = "image")
    private String image;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    public boolean isAllowNotes() {
        return allowNotes;
    }

    public void setAllowNotes(boolean allowNotes) {
        this.allowNotes = allowNotes;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
    
    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
    
}