package project.map.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import project.map.entity.MapEntity;


@Repository
public interface MapRepository extends JpaRepository<MapEntity, Integer>{
	
		//user_Id와 trip_title을 기반으로 위치정보 가져오기
		@Query("select t from MapEntity t where t.user.id = ?1 and t.trip.idx = ?2")
		List<MapEntity> getLocation(String id , Integer tripIdx);
		
}
