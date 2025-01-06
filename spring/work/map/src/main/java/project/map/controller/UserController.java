package project.map.controller;

import java.security.AuthProvider;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import project.map.dto.ResponseDTO;
import project.map.dto.UserDTO;
import project.map.entity.UserEntity;
import project.map.security.TokenProvider;
import project.map.service.UserService;

@RequestMapping
@RestController
public class UserController {

	@Autowired
	private UserService service;

	@GetMapping("/mypage")
	public ResponseEntity<?> getUserInfo(@AuthenticationPrincipal String userId) {
		UserDTO user = service.toDTO(service.getById(userId)); 
		ResponseDTO<UserDTO> response = ResponseDTO.<UserDTO>builder().value(user).build();
		return ResponseEntity.ok(response);
	}

	// 회원가입
	@PostMapping(value = "/signup", consumes = "multipart/form-data")
	public ResponseEntity<?> registerUser(@RequestParam("id") String id, @RequestParam("password") String password,
			@RequestParam("userName") String userName, @RequestParam("email") String email,
			@RequestParam("profilePhoto") MultipartFile profilePhoto) {
		try {
			// DTO 객체 생성
			UserDTO dto = new UserDTO(id, password, userName, email);
			// profilePhoto 처리
			service.create(dto, profilePhoto);
			return ResponseEntity.ok().build();
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원가입 중 문제가 발생했습니다.");
		}

	}

	// 로그인
	@PostMapping("/signin")
	public ResponseEntity<?> authenticate(@RequestBody UserDTO dto) {
		UserDTO user = service.getByCredentials(dto.getId(), dto.getPassword());
		if (user != null) {
			ResponseDTO<UserDTO> response = ResponseDTO.<UserDTO>builder().value(user).build();
			return ResponseEntity.ok(response);

		} else {
			ResponseDTO responseDTO = ResponseDTO.builder().error("Login failed").build();
			return ResponseEntity.badRequest().body(responseDTO);

		}

	}

	// 중복체크
	@GetMapping("/check")
	public ResponseEntity<?> duplicate(@RequestParam("id") String id) {
		return ResponseEntity.ok(service.duplicate(id));
	}

	// 회원정보 수정
	@PutMapping
	public ResponseEntity<?> modify(@AuthenticationPrincipal String userId,
			@RequestParam(value = "password", required = false) String password,
			@RequestParam("userName") String userName, @RequestParam("email") String email,
			@RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhoto) {
		// DTO 객체 생성
		UserDTO dto = new UserDTO(userId, password, userName, email);
		service.modify(userId, dto, profilePhoto);
		return ResponseEntity.ok("회원정보 수정완료");

	}

	// 회원정보 삭제
	@DeleteMapping
	public ResponseEntity<?> delete(@AuthenticationPrincipal String userId) {
		String message = service.delete(userId);
		ResponseDTO response = ResponseDTO.builder().value(message).build();
		return ResponseEntity.ok(response);

	}

}
