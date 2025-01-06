package project.map.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.map.entity.TripEntity;
import project.map.entity.UserEntity;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class TripDTO {
	
	private Integer idx;
	private String title;
	 @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
	private LocalDate startDate;
	 @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
	private LocalDate lastDate;
	private String userId;
	
	public TripDTO(TripEntity entity){
		this.idx = entity.getIdx();
		this.title = entity.getTitle();
		this.startDate = entity.getStartDate();
		this.lastDate = entity.getLastDate();
		this.userId = entity.getUser().getId(); 
	}
	   
   
}
