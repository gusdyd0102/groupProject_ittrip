package project.map.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import project.map.dto.AreaDTO;
import project.map.entity.AreaEntity;

@Repository
public interface AreaRepository extends JpaRepository<AreaEntity, String> {

	// areaCd를 통해 database에  areaCd 에 해당하는 모든 시군구Nm를 반환한다 .
   @Query("select t.signguNm from AreaEntity t where t.areaCd = ?1")
   List<String> findByAreaCd(String areaCd);

   // areaNm(지역명) 과 suignguNm(시,군,구 이름) 에 해당하는 엔티티를 반환한다 . 
   @Query("select t from AreaEntity t where t.areaNm = ?1  and t.signguNm = ?2")
   AreaEntity findByAreaNmSignguNm(String areaNm, String signguNm);

}
