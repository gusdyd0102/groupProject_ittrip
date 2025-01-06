package project.map.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "area")
@Entity		
public class AreaEntity {		//공공데이터 관련 엔티티
	
	
	@Id
	@Column(name = "signgu_cd", length = 5)
	private String signguCd;		//시군구코드
	
	@Column(name = "area_cd", length = 2)
	private String areaCd;			//지역코드
	
	@Column(name = "area_nm", length = 10)
	private String areaNm;			//지역이름 ex)인천광역시
	
	@Column(name = "signgu_nm", length = 10)
	private String signguNm;		//시군구이름 ex)부평구
	
}
