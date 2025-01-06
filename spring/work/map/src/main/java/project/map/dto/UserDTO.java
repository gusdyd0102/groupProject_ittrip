package project.map.dto;

import java.util.Date;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.map.entity.UserEntity;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
	private String token ; // 토큰인증방식 사용시 사용될 토큰
	private String id; // 회원아이디(식별자)
	private String password; // 비밀번호
	private String userName ; // 이름
	private String email; // 이메일
	private String profilePhoto; // 프로필사진
	private Date signupDate; // 회원가입 날짜 
	private String authProvider ; // 소셜로그인 공급자
	
	public UserDTO(UserEntity entity) {
		this.id = entity.getId() ;
		this.userName = entity.getUserName() ;
		this.email = entity.getEmail() ;
		this.signupDate = entity.getSignupDate();
		this .profilePhoto = entity.getProfilePhoto() ;
	}
	
	 public UserDTO(String id, String password, String userName, String email) {
	        this.id = id;
	        this.password = password;
	        this.userName = userName;
	        this.email = email;
	    }
	
}

