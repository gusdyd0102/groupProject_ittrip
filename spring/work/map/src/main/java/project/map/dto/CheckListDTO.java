package project.map.dto;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.map.entity.CheckListEntity;
import project.map.entity.TripEntity;
import project.map.entity.UserEntity;
import project.map.service.TripService;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class CheckListDTO {
	
	@Data
    @NoArgsConstructor
    @AllArgsConstructor
	public static class Items{
		private Integer id;
		private String text;
		private boolean checked;
		
		public Items(Integer id, String text, Boolean checked) {
	        this.id = id;
	        this.text = text;
	        this.checked = checked;
	    }
	}
	private Integer idx;
	private List<Items> items;
	private String userId;		//UserEntity의 id
	private String tripTitle;	//TripEntity의 title
	
	
	public CheckListDTO(CheckListEntity entity) {
		this.userId = entity.getUser().getId();
		this.tripTitle = entity.getTrip().getTitle();
	}
	
//	public static CheckListDTO fromEntity(CheckListEntity entity) {
//        return CheckListDTO.builder()
//                .idx(entity.getIdx())
//                .items(tripService.parseItems(entity.getItems()))
//                .tripTitle(entity.getTrip() != null ? entity.getTrip().getTitle() : null)
//                .userId(entity.getUser() != null ? entity.getUser().getId().toString() : null)
//                .build();
//    }
	
	public CheckListEntity toEntity(UserEntity user, TripEntity trip) {
        return CheckListEntity.builder()    
                .user(user) // UserEntity 설정
                .trip(trip) // TripEntity 설정
                .build();
    }
}
