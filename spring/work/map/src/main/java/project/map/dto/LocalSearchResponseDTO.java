package project.map.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocalSearchResponseDTO {

	private List<Items> items;

	@Data
	public static class Items {
		private String title;
		private String address;
		private String roadAddress;	
		private String mapx;
		private String mapy;
	}
}
