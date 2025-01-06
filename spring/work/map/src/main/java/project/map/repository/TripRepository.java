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

//		지우지 마세요
//		//user_Id를 기반으로 가져온 trip에서 title 변경하기
//		@Transactional
//		@Modifying
//		@Query("update TripEntity t SET t.title = ?1 where t.idx = ?2")
//		TripEntity updateTitleByIdx(String title,Integer idx);
		
		//타이틀 중복여부 확인
		boolean existsByTitle(String title);
		
		@Query("select t from TripEntity t where t.title = ?1")
		TripEntity getByTitle(String title);
		
		//updateTitle에서 idx로 구분하여 타이틀을 수정하기 위해
		@Query("select t.idx from TripEntity t where t.title = ?1")
		Integer getidxByTitle(String title);
		
		String getTitleByIdx (Integer idx);
		
		//idx를 통해 TripEntity반환
		TripEntity findAllByIdx(Integer idx);
		
}
