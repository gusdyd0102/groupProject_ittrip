package project.map.dto;

import java.util.Arrays;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.map.dto.CheckListDTO.Items;
import project.map.entity.MapEntity;
import project.map.entity.TripEntity;
import project.map.entity.UserEntity;
import project.map.service.TripService;



@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class MapDTO {
		
//		private String tripTitle;		//TripEntity의 title
	
		private List<MapObject> mapObject;
		
		@Data
		@NoArgsConstructor
		@AllArgsConstructor
		public static class MapObject{
			private int days;
		    private String startPlace;
		    private String startAddress;
		    private String startPoint;
		    private String goalPlace;
		    private String goalAddress;
		    private String goalPoint;
		    private List<WayPointDTO> wayPoints;

		}
		  
		@Data
		@NoArgsConstructor
		@AllArgsConstructor
	    public static class WayPointDTO {
	        private String id;
	        private String value;
	        private String address;
	        private String latlng;
	    }
	    
		public MapDTO(MapEntity entity) {
			
		
//			this.tripTitle = entity.getTrip().getTitle();
			
			this.mapObject = List.of(new MapObject(
			        entity.getDays(),
			        entity.getStartPlace(),
			        entity.getStartAddress(),
			        entity.getStartPoint(),
			        entity.getGoalPlace(),
			        entity.getGoalAddress(),
			        entity.getGoalPoint(),
			        TripService.parseWaypoints(entity.getWaypoint())
					));
		}	       

	
}