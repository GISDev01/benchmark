package com.benchmark.PostgreSQL.repo;

import com.benchmark.PostgreSQL.domain.PostgreShape;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostgreRepository extends JpaRepository<PostgreShape, Integer> {

}
