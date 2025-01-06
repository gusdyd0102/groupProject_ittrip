package project.map.entity;



import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
@Table(name = "map")
@Entity
public class MapEntity {
	
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	@Column(name = "idx", nullable = false)
    private Integer idx; // Primary Key
	
	@Column(name = "start_place", nullable = false)
    private String startPlace;   // 출발지 상호명
	
	@Column(name = "start_address", nullable = false)
	private String startAddress;	//출발지 지번주소
	
	@Column(name = "start_point", nullable = false)
    private String startPoint;   // 출발지 좌표
	
	@Column(name = "goal_place", nullable = false)
    private String goalPlace;    // 목적지 상호명
	
	@Column(name = "goal_address", nullable = false)
	private String goalAddress;	// 목적지 지번주소
	
	@Column(name = "goal_point", nullable = false)
	private String goalPoint;	// 목적지 좌표
	
	@Column(name = "waypoint")
    private String waypoint; // 경유지 상호명
	
	@Column(name = "days", nullable = false , length = 10)
    private Integer days;       // 일자
    
	@ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "trip_idx", referencedColumnName = "idx") // TripEntity의 만 매핑
    private TripEntity trip; // 외래 키 매핑
    
	@ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "user_id",referencedColumnName = "id",nullable=false) // 외래키: user_id
    private UserEntity user;
	
	
}
