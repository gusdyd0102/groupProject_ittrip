package project.map.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import project.map.dto.AreaDTO;
import project.map.dto.PublicDataDTO;
import project.map.repository.AreaRepository;
import project.map.service.TripService;

@RestController
public class LocalRecController {

	private final WebClient webClient;

	@Autowired
	private TripService service;

	private String serviceKey = "vLo5QchUev0eMI0EfQEAAhaA8KcbKibBBFb7Ypbv1eSPl4kxhJ/g3bBPjmrlTlk8lwphxZUfqR7Ic5zYSwND2g==";
	private String mobileOs = "WEB";
	private String mobileApp = "AppTest";
	private String baseYm = "202407";
	private String numOfRows = "60";
	private String json = "json";

	public LocalRecController(WebClient webClient) {
		this.webClient = webClient;
	}

	@GetMapping("/123")
	public ResponseEntity<?> getPublicData(@RequestParam(name = "signguNm") String signguNm,
			@RequestParam(name = "areaNm") String areaNm) {
		AreaDTO dto = service.getCd(areaNm,signguNm);
		try {
			String uri = UriComponentsBuilder
					.fromHttpUrl("http://apis.data.go.kr/B551011/TarRlteTarService/areaBasedList")
					.queryParam("serviceKey", serviceKey).queryParam("MobileOS", mobileOs)
					.queryParam("MobileApp", mobileApp).queryParam("baseYm", baseYm)
					.queryParam("areaCd", dto.getAreaCd()).queryParam("signguCd", dto.getSignguCd())
					.queryParam("numOfRows", numOfRows).queryParam("_type", json).build(false) // 추가적인 URL 인코딩 방지
					.toUriString();

			System.out.println("Generated URI: " + uri); // 디버깅용

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