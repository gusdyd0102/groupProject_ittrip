package project.map.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.map.entity.AreaEntity;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class AreaDTO {
	
	private String signguCd;
	private String areaCd;
	private String areaNm;
	private String signguNm;
	
	private List<AreaDTO> list; 
	
	public AreaDTO(final AreaEntity entity) {
		this.signguCd = entity.getSignguCd();
		this.areaCd = entity.getAreaCd();
		this.areaNm = entity.getAreaNm();
		this.signguNm = entity.getSignguNm();
	}

}
