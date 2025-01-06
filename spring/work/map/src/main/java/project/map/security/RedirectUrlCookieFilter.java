package project.map.security;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class RedirectUrlCookieFilter extends OncePerRequestFilter {
	public static final String REDIRECT_URI_PARAM="redirect_url";
	private static final int MAX_AGE =180;
	
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		if(request.getRequestURI().startsWith("/auth/authorize")) {
			try {
				log.info("request uri {}",request.getRequestURI());
				//요청 파라미터에서 redirect_url
				String redirectUrl = request.getParameter(REDIRECT_URI_PARAM);
				
				//key와 value를 가진 쿠키를 생성
				Cookie cookie = new Cookie(REDIRECT_URI_PARAM,redirectUrl);
				//setPath : 쿠키가 어느경로에서 유효한가 
				//root경로로 설정해놓으면 어플리케이션의 모든페이지
				cookie.setPath("/");
				//httpOnly : 자바스크립트에서 쿠키를 수정할 수 없도록 하는 옵션
				cookie.setHttpOnly(true);
				//setMaxAge : 쿠키의 유효시간 180초
     			cookie.setMaxAge(MAX_AGE);
			} catch (Exception e) {
				logger.error("Could not set user authentication in security context", e);
				log.info("Unauthorized request");
			}//catch
		}//if
		
		
		filterChain.doFilter(request, response);
	}
}
