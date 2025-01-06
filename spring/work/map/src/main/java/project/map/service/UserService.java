package project.map.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import project.map.dto.UserDTO;
import project.map.entity.UserEntity;
import project.map.repository.UserRepository;
import project.map.security.TokenProvider;

@Service
@Slf4j
public class UserService {

	@Autowired
	private UserRepository repository;

	@Autowired
	private TokenProvider tokenProvider;

	private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	// 유저 전체조회 (테스트 전용 )
	public List<UserDTO> getAll() {
		List<UserEntity> entities = repository.findAll();
		List<UserDTO> dtos = entities.stream().map(UserDTO::new).collect(Collectors.toList());
		return dtos;
	}

	// 유저 id로 조회
	public UserEntity getById(String userId) {
		UserEntity entity = repository.findById(userId)
				.orElseThrow(() -> new RuntimeException("해당 ID를 가진 유저가 존재하지 않습니다."));
		return entity;
	}

	// 유저 생성
	public void create(UserDTO dto, MultipartFile profilePhoto) {
		try {
			// 필수 필드 검증
			if (dto.getId() == null || dto.getPassword() == null || dto.getUserName() == null
					|| dto.getEmail() == null) {
				throw new IllegalArgumentException("모든 필드는 null이 될 수 없습니다. 필수 값을 확인해주세요.");
			}

			// 이미지 파일 처리 (업로드 디렉토리 설정)
			// 현재 작업 디렉토리 기반으로 업로드 디렉토리 설정
			String uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "profilePhotos").toString();

			// 업로드 디렉토리가 없다면 생성
			File uploadDirectory = new File(uploadDir);
			if (!uploadDirectory.exists()) {
				uploadDirectory.mkdirs(); // 디렉토리 생성
			}

			if (profilePhoto != null && !profilePhoto.isEmpty()) {
				// 파일 이름을 현재 시간 기반으로 고유하게 생성
				String fileName = System.currentTimeMillis() + "_" + profilePhoto.getOriginalFilename();
				// 파일 객체 생성
				File file = new File(uploadDir + File.separator + fileName);
				// 파일 저장
				profilePhoto.transferTo(file);
				// 저장된 파일 이름을 DTO에 반영
				String profilePhotoPath = "/uploads/profilePhotos/" + fileName;
				dto.setProfilePhoto(profilePhotoPath);
			}

			// UserEntity 빌드
			UserEntity entity = toEntity(dto);
			final String userId = entity.getId();

			if (repository.existsById(userId)) {
				log.warn("UserId already exist {}", userId);
				throw new RuntimeException("UserName alredy exist");
			}
			// 엔티티 저장
			repository.save(entity);
			
		} catch (Exception e) {
			// 예외 발생 시 로그를 남기고 사용자 정의 예외를 던짐

			throw new RuntimeException("유저 생성에 실패했습니다: " + e.getMessage(), e);
		}
	}

	// signin을 위한 userId , password 검증
	public UserDTO getByCredentials(String userId, String password) {
		UserEntity entity = repository.findById(userId)
				.orElseThrow(() -> new UsernameNotFoundException("User not found"));
		if (passwordEncoder.matches(password, entity.getPassword())) {
			final String token = tokenProvider.create(entity);
			UserDTO dto = toDTO(entity);
			dto.setToken(token);
			return dto;
		} else {
			throw new RuntimeException("아이디 또는 비밀번호가 일치하지 않습니다 .");
		}

	}

	// 회원정보 수정 ////비밀번호 ,프로필사진
	@Transactional

	public void modify(String userId, UserDTO dto, MultipartFile profilePhoto) {
		UserEntity entity = repository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("User with ID " + userId + " not found"));

		// 이미지 파일 처리 (업로드 디렉토리 설정)
		// 현재 작업 디렉토리 기반으로 업로드 디렉토리 설정
		String uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "profilePhotos").toString();


		// 업로드 디렉토리가 없다면 생성
		File uploadDirectory = new File(uploadDir);
		if (!uploadDirectory.exists()) {
			uploadDirectory.mkdirs(); // 디렉토리 생성
		}
		if (profilePhoto != null && !profilePhoto.isEmpty()) {
			// 파일 이름을 현재 시간 기반으로 고유하게 생성
			String fileName = System.currentTimeMillis() + "_" + profilePhoto.getOriginalFilename();
			// 파일 객체 생성
			File file = new File(uploadDir + File.separator + fileName);
			// 파일 저장
			try {
				profilePhoto.transferTo(file);
			} catch (IOException e) {
				e.printStackTrace();
			}
			// 저장된 파일 이름을 DTO에 반영
			String profilePhotoPath = "/uploads/profilePhotos/" + fileName;
			dto.setProfilePhoto(profilePhotoPath);
		}

		entity.setPassword(passwordEncoder.encode(dto.getPassword()));
		entity.setUserName(dto.getUserName());
		entity.setEmail(dto.getEmail());
		if (profilePhoto == null) {
			repository.save(entity);
		} else {
			entity.setProfilePhoto(dto.getProfilePhoto());
			repository.save(entity);
		}

	}

	// 회원 삭제
	@Transactional
	public String delete(String userId) {
		UserEntity entity = repository.findById(userId).get();
		repository.delete(entity);
		return "삭제 완료";
	}

	// 중복체크
	public boolean duplicate(String Id) {
		if (repository.existsById(Id)) {
			return true;
		}
		return false;
	}

	// dto -> entity
	public UserEntity toEntity(UserDTO dto) {
		return UserEntity.builder().id(dto.getId()).password(passwordEncoder.encode(dto.getPassword())) // 비밀번호 암호화
				.userName(dto.getUserName()).email(dto.getEmail()).profilePhoto(dto.getProfilePhoto())
				.authProvider(null).build();

	}

	// entity -> dto
	public UserDTO toDTO(UserEntity entity) {

		return UserDTO.builder().id(entity.getId()).userName(entity.getUserName()).email(entity.getEmail())
				.signupDate(entity.getSignupDate()).profilePhoto(entity.getProfilePhoto())
				.authProvider(entity.getAuthProvider()).build();

	}

}