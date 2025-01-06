package project.map.security;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Paths;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
import project.map.entity.UserEntity;
import project.map.repository.UserRepository;

//DefaultOAuth2UserService
//시큐리티에서 기본으로 제공하는 OAuth2로그인시 사용자의 정보를 처리하는 서비스 클래스이다.
//OAuth2 인증이 성공하면 스프링 시큐리티는 이 클래스를 이용해 OAuth2 제공자(naver ,kakao , google)로부터 
//사용자의 정보를 가져오고, 이를 기반으로 어플리케이션에서 인증된 사용자 객체를 생성한다.
@Slf4j
@Service
public class OAuthUserServiceImpl extends DefaultOAuth2UserService {

	@Autowired
	private UserRepository repository;


	private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();


	public OAuthUserServiceImpl() {
		super();
	}

	@Override
	public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
		// DefaultOAuth2UserService의 기존 loadUser를 호출한다.
		// 이 메서드가 user-info-uri를 이용해 사용자 정보를 가져오는 부분이다.
		final OAuth2User oAuth2User = super.loadUser(userRequest);
		try {
			log.info("OAuth2User attributes {} ", new ObjectMapper().writeValueAsString(oAuth2User.getAttributes()));
		} catch (Exception e) {
			log.error("Error serializing OAuth2User attributes", e);
		}
		
		
		String userId = null;
		String email =null;
		String profilePhoto = null;
		String userName =null;
		// 현재 사용자가 어떤 OAuth2 제공자를 통해 로그인했는지 이름을 반환한다.


		final String authProvider = userRequest.getClientRegistration().getClientName();

		if (authProvider.equals("Kakao")) {
		    Map<String, Object> response = (Map<String, Object>) oAuth2User.getAttributes().get("properties");
		    userId = String.valueOf(oAuth2User.getAttributes().get("id"));
		    if (response != null) {
		        userName = (String) response.get("nickname");  // 카카오의 nickname을 사용자의 이름으로
		        profilePhoto = (String) response.get("profile_image");  // 프로필 사진
		    }
		    Map<String, Object> kakaoAccount = (Map<String, Object>) oAuth2User.getAttributes().get("kakao_account");
		    if (kakaoAccount != null) {
		        email = (String) kakaoAccount.get("email");  // 이메일 추출
		    }
		} else if (authProvider.equals("naver")) {
			// Naver에서 name을 가져오기 위해 'response' 필드를 찾습니다.
			Map<String, Object> response = (Map<String, Object>) oAuth2User.getAttributes().get("response");
			if (response != null) {
				userId = (String) response.get("id"); // 'response' 객체에서 'id' 추출
				email = (String) response.get("email"); 
				profilePhoto = (String) response.get("profile_image");
				userName = (String) response.get("name"); 
			}
		} else {
			userId = (String) oAuth2User.getAttributes().get("sub");
			email = (String) oAuth2User.getAttributes().get("email"); 
			profilePhoto = (String) oAuth2User.getAttributes().get("picture");
			userName = (String) oAuth2User.getAttributes().get("name"); 
		}

		if (!repository.existsById(userId)) {
			// 비밀번호를 인코딩하여 저장
			String encodedPassword = passwordEncoder.encode("1234"); // 기본 비밀번호 "1234"
			
			// 사진 파일의 path 추출
			String uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "profilePhotos").toString();
            File uploadDirectory = new File(uploadDir);
            if (!uploadDirectory.exists()) {
                uploadDirectory.mkdirs(); // 디렉토리 생성
            }

            String localProfilePhotoPath = null;
            if (profilePhoto != null && !profilePhoto.isEmpty()) {
                try {
                    localProfilePhotoPath = downloadImage(profilePhoto, uploadDir); // 프로필 사진 다운로드 및 저장
                } catch (Exception e) {
                    log.error("Error downloading profile photo: {}", e.getMessage());
                }
            }
			
			
			
			
			
			repository.save(UserEntity.builder()
					.id(userId)
					.email(email)
					.password(encodedPassword) // 인코딩된 비밀번호 저장
					.authProvider(authProvider)
					.profilePhoto(localProfilePhotoPath)
					.userName(userName)
					.build());
		}

		log.info("Successfully pulled user info username {} authProvider {} image {}", userId, authProvider,
				profilePhoto);
		return new ApplicationOAuth2User(userId, oAuth2User.getAttributes());
	}
	/**
     * 소셜 로그인에서 받은 이미지 URL을 로컬 디렉토리에 저장하는 메서드.
     *
     * param imageUrl  이미지 URL
     * param uploadDir 로컬 저장 디렉토리 경로
     * return 저장된 파일의 로컬 경로
     * throws Exception 파일 다운로드 또는 저장 오류 발생 시 예외 처리
     */
    private String downloadImage(String imageUrl, String uploadDir) throws Exception {
        // 파일 이름 생성 (현재 시간 기반)
        String fileName = System.currentTimeMillis() + "_" + imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
        String filePath = Paths.get(uploadDir, fileName).toString();

        // URL에서 이미지 다운로드 및 로컬 저장
        URL url = new URL(imageUrl);
        try (InputStream inputStream = url.openStream();
             FileOutputStream outputStream = new FileOutputStream(filePath)) {

            byte[] buffer = new byte[2048];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
        }

        return "/uploads/profilePhotos/" + fileName; // 로컬 경로 반환
    }
}
	
	
	
