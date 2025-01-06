package project.map.security;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;


//SimpleUrlAuthenticationSuccessHandler
//인증 성공 후 사용자를 처리하는데 사용되는 클래스
//
@Slf4j
@Component
@AllArgsConstructor
public class OAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
	
	private static final String LOCAL_REDIRECT_URL = "http://ittrip.life";
	
	@Autowired
	TokenProvider tokenProvider ;
	
	//토큰을 생성하고, 반환하는 기능
	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {
		String token = tokenProvider.create(authentication);
		
		 
		
		response.getWriter().write(token);
		log.info("token {}",token);
		
		//쿠키 불러와서 사용하기
		Optional<Cookie> oCookie = Arrays.stream(request.getCookies()).filter(cookie -> cookie.getName().equals("redirect_url")).findFirst();
		
		//
		Optional<String> redirectUri = oCookie.map(Cookie :: getValue);
		
		
		//강제로 리다이텍트 함
		//orElseGet(()-> LOCAL_REDIRECT_URL) 
		//Optional객체가 값이 있으면 해당 값을 반환하고, 없으면 orElseGet()에 제공된
		//함수가 실행되어 그 결과를 반환한다.
		response.sendRedirect(redirectUri.orElseGet(()-> LOCAL_REDIRECT_URL)+"/socialLogin?token="+token);
	}
}