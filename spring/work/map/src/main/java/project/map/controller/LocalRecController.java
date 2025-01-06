package project.map.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import project.map.dto.AreaDTO;
import project.map.dto.PublicDataDTO;
import project.map.service.TripService;

@RestController
public class LocalRecController {

	private final WebClient webClient;

	@Autowired
	private TripService service;

	@Value("${publicData_ServiceKey}")
	private String serviceKey ;

	public LocalRecController(WebClient webClient) {
		this.webClient = webClient;
	}

	@GetMapping("/public")
	public ResponseEntity<?> getPublicData(
			@RequestParam(name = "signguNm") String signguNm,
			@RequestParam(name = "areaNm") String areaNm) {
		AreaDTO dto = service.getCd(areaNm,signguNm);
		try {
			String uri = UriComponentsBuilder
					.fromHttpUrl("http://apis.data.go.kr/B551011/TarRlteTarService/areaBasedList")
					.queryParam("serviceKey", serviceKey).queryParam("MobileOS", "WEB")
					.queryParam("MobileApp", "ittrip").queryParam("baseYm","202409")
					.queryParam("areaCd", dto.getAreaCd()).queryParam("signguCd", dto.getSignguCd())
					.queryParam("numOfRows", "60").queryParam("_type", "json").build(false) // 추가적인 URL 인코딩 방지
					.toUriString();

			PublicDataDTO response = webClient.get().uri(uri).accept(MediaType.APPLICATION_JSON) // XML 형식 요청 명시
					.retrieve().bodyToMono(PublicDataDTO.class) // 응답을 DTO로 매핑
					.block();		
			
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
		}
	}
}