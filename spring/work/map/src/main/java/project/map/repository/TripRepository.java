package project.map.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import project.map.entity.TripEntity;

@Repository
public interface TripRepository extends JpaRepository<TripEntity, Integer> {

		//user_Id를 기반으로 trip 정보 가져오기 
		@Query("select t from TripEntity t where t.user.id = ?1 order by t.idx")
		List<TripEntity> getTripsByUserId(String userId);
	
		boolean existsByTitleAndUserId(String title, String userId);
		
		@Query("select t from TripEntity t where t.idx = ?1")
		TripEntity getByIdx(Integer idx);
		
		//updateTitle에서 idx로 구분하여 타이틀을 수정하기 위해
		@Query("select t.idx from TripEntity t where t.title =?1 and t.user.id = ?2")
		Integer getIdxByTitleAndUserId(String title ,String userId);
		
		
		
//		
		
}
