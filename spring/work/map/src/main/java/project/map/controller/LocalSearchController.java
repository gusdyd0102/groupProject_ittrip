package project.map.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import project.map.dto.LocalSearchResponseDTO;

@RestController
public class LocalSearchController {

	
	private String requestUrl = "https://openapi.naver.com/v1/search/local.json";
	
	@Value("${localSearch.api.key.id}")
	private String clientId;
	
	@Value("${localSearch.api.key.secret}")
	private String clientSecret;
	
	private final WebClient webClient;

	public LocalSearchController(WebClient.Builder webClientBuilder) {
		this.webClient = webClientBuilder.baseUrl(requestUrl).build();
	}

	@GetMapping("/local")
	public ResponseEntity<?> getLocalData(@RequestParam(name = "query") String query) {
	    try {
	        
	        LocalSearchResponseDTO response = webClient.get().uri(uriBuilder -> uriBuilder
	                .queryParam("query", query)
	                .queryParam("display", 5)
	                .queryParam("start", 1)
	                .queryParam("sort", "random")
	                .build())
	                .header("X-Naver-Client-Id", clientId)
	                .header("X-Naver-Client-Secret", clientSecret)
	                .retrieve()
	                .bodyToMono(LocalSearchResponseDTO.class)
	                .block();

	        List<LocalSearchResponseDTO.Items> filteredItems = response.getItems().stream()
	                .filter(item -> !item.getTitle().contains("번출구")) // 조건: 제목에 "번출구" 포함하면 제외
	                .collect(Collectors.toList());
			
			 response.setItems(filteredItems);

		     return ResponseEntity.ok(response);
			
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
		}
	}
}
