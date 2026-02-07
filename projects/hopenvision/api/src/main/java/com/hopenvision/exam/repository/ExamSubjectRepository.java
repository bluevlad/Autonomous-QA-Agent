package com.hopenvision.exam.repository;

import com.hopenvision.exam.entity.ExamSubject;
import com.hopenvision.exam.entity.ExamSubjectId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamSubjectRepository extends JpaRepository<ExamSubject, ExamSubjectId> {

    List<ExamSubject> findByExamCdOrderBySortOrder(String examCd);

    List<ExamSubject> findByExamCdAndIsUse(String examCd, String isUse);

    void deleteByExamCd(String examCd);
}
