package project.map.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import project.map.dto.DirectionsResponseDTO;

@RestController
public class DirectionController {

	private String apiUrl = "https://naveropenapi.apigw.ntruss.com/map-direction-15/v1/driving";// Directions 15 요청 서버
																								// url
	// https://naveropenapi.apigw.ntruss.com/map-direction-15
	@Value("${naver.api.key.id}") // client-id
	private String apiKeyId;

	@Value("${naver.api.key.secret}") // client-secret
	private String apiKeySecret;

	private final WebClient webClient;

	public DirectionController(WebClient.Builder webClientBuilder) {
		this.webClient = webClientBuilder.baseUrl(apiUrl).build(); 
	}

	@GetMapping("/directions/nowaypoint")
	public ResponseEntity<?> getDirectionsNoWayPoint(
			@RequestParam(name = "start") String start, 																					
			@RequestParam(name = "goal") String goal
	) { 
		try {

			DirectionsResponseDTO response = webClient.get().uri(uriBuilder -> uriBuilder 
					.queryParam("start", start)
					.queryParam("goal", goal).build()).header("x-ncp-apigw-api-key-id", apiKeyId)
					.header("x-ncp-apigw-api-key", apiKeySecret).retrieve().bodyToMono(DirectionsResponseDTO.class)
					.block(); 
		
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
		}
	}

	@GetMapping("/directions/withwaypoint") 
	public ResponseEntity<?> getDirectionsWithWayPoints(
			@RequestParam(name = "start") String start,
			@RequestParam(name = "waypoints") String wayPoints,
			@RequestParam(name = "goal") String goal
	) {
		try {
			DirectionsResponseDTO response = webClient.get().uri(uriBuilder -> uriBuilder // uri를 빌드(파라미터들,헤더)
					.queryParam("start", start).queryParam("waypoints", wayPoints).queryParam("goal", goal).build())
					.header("x-ncp-apigw-api-key-id", apiKeyId).header("x-ncp-apigw-api-key", apiKeySecret).retrieve()
					.bodyToMono(DirectionsResponseDTO.class) // mono (0개 또는 1개) 로 반환
					.block(); // block -> ResponseEntity로 반환하기 위해 씀
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
		}
	}

}
