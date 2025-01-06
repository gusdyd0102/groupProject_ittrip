package project.map.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import project.map.entity.CheckListEntity;


@Repository
public interface CheckListRepository extends JpaRepository<CheckListEntity, Integer>{

		//userId와 tripTitle을 기반으로 checklist 가져오기
		@Query("select t from CheckListEntity t where t.user.id = ?1 and t.trip.idx = ?2")
		CheckListEntity getCheckListByUserIdAndTripIdx(String id , Integer tripIdx);

		//items를 통해 idx가져오기
		@Query("select t.idx from CheckListEntity t where t.items = ?1")
		Integer getIdxByItems(String items);
}
