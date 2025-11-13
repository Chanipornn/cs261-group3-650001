package com.example.demo.controller;

import com.example.demo.model.BestSeller;
import com.example.demo.repo.BestSellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/best-seller")
@CrossOrigin("*")
public class BestSellerController {

    @Autowired
    private BestSellerRepository bestSellerRepository;

    // BEST SELLER 10 อันดับแรก
    @GetMapping
    public List<BestSeller> getTop10() {
        return bestSellerRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getTotalSales() - a.getTotalSales()) // เรียงยอดขาย DESC
                .limit(10)                                              // เอาแค่ 10 อันดับ
                .toList();
    }
}
