package project.map.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DirectionsResponseDTO {

	private Route route ;

	@Data
	public static class Route{
		private  List<Traoptimal> traoptimal ;
	}
	
	@Data
	public static class Traoptimal{
		private Summary summary ;
		private List<List<Double>> path ;
	}
	
	@Data
	public static class Summary{
		private Integer distance;
		private Integer duration;
		private Integer tollFare;
		private Integer fuelPrice;
		
	}
	 
	
}