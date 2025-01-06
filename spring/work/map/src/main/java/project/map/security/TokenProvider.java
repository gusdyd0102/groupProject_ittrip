package project.map.security;

import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import project.map.entity.UserEntity;

@Slf4j
@Service
public class TokenProvider {

	// SECRET_KEY_STRING 에 저장된 문자열은 서명부분에 들어갈 내용을 Base64로 인코딩해놓은 문자열이 일반적으로 사용된다
	// 비밀키는 보통 랜덤 바이트배열로 생선된다 .
	// Base64는 URL-safe 형식(Base64 URL 인코딩)으로 변환할 수 있어, 다양한 시스템 간에 키를 안전하게 전달할 수
	// 있습니다.
	// Base64는 데이터를 암호화하지 않으므로 보안적 이점은 없지만, 키를 사람이 읽을 수 없는 형태로 표현하여 실수로 노출되는 것을 어느
	// 정도 방지할 수 있습니다.

	private static final String SECRET_KEY_STRING = "YXNkanNhbGtkamFzbGpkYXNrbmRzYWprbmNhc3p4b2NqYXNjbmtseHpuY2tsc2FzZGphc2tsamRrbGF3aG5kcXdpZG5hc2RuYXNrbGRucXdrbGRuYXNrbGNuem1hc2RqaWFzb2RuYQ==";
	private static final byte[] SECRET_KEY = Base64.getDecoder().decode(SECRET_KEY_STRING);
	private static final Key key = Keys.hmacShaKeyFor(SECRET_KEY);

	public String create(UserEntity entity) {
		Date expiryDate = Date.from(Instant.now().plus(6, ChronoUnit.HOURS));

		String token = Jwts.builder()
				.signWith(key, SignatureAlgorithm.HS512)
				.setSubject(entity.getId())
				.setIssuer("map")
				.setIssuedAt(new Date())
				.setExpiration(expiryDate)
				.compact();
		
		log.info("Token created for user: {}", entity.getId());

		return token;
	}

	public String create(final Authentication authentication) {

		ApplicationOAuth2User userPrincipal = (ApplicationOAuth2User) authentication.getPrincipal();
		Date expiryDate = Date.from(Instant.now().plus(6, ChronoUnit.HOURS));


		String token = Jwts.builder()
				.signWith(key, SignatureAlgorithm.HS512)
				.setSubject(userPrincipal.getName()) // id가 반환됨
				.setIssuer("map") // 토큰 발행 주체
				.setIssuedAt(new Date()) // 토큰 발행 날짜
				.setExpiration(expiryDate) // exp
				.compact(); // 토큰을 . 으로 구분된 하나의 문자열로 만들어준다

		return token;
		

	}

	public String validateAndGetUserId(String token) {

		Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
		String userId = claims.getSubject();
		log.info("Token validated for user: {}", userId);
		return userId;

	}

}
