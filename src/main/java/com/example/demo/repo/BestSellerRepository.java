package com.example.demo.repo;

import com.example.demo.model.BestSeller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BestSellerRepository extends JpaRepository<BestSeller, Integer> {
}
