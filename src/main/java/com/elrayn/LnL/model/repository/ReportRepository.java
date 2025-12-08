package com.elrayn.LnL.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.elrayn.LnL.model.entity.Report;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long>{
}
