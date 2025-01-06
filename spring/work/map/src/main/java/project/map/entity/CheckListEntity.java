package project.map.entity;



import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "check_list")
@Entity
public class CheckListEntity {
	
	@Id
	@Column(name = "idx")
	@GeneratedValue(strategy=GenerationType.AUTO)
    private Integer idx; // Primary Key

	@Column(name="items")
	private String items; 
	
	@OneToOne(cascade = CascadeType.MERGE)
   	 @JoinColumn(name = "trip_idx", referencedColumnName = "idx") // TripEntity의 만 매핑
    private TripEntity trip; // 외래 키 매핑
	
	@ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "user_id",referencedColumnName = "id",nullable=false) // 외래키: user_id
    private UserEntity user;
	
	
	
	
	
	
}
