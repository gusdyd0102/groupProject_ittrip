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

	@Value("${naver.api.url}")
	private String apiUrl = "https://naveropenapi.apigw.ntruss.com/map-direction-15/v1/driving";// Directions 15 요청 서버
																								// url
	// https://naveropenapi.apigw.ntruss.com/map-direction-15
	@Value("${naver.api.key.id}") // client-id
	private String apiKeyId = "wz3pjcepky";

	@Value("${naver.api.key.secret}") // client-secret
	private String apiKeySecret = "d21JDzBXMkx7E6P5KQJ0qyPf3W4jfj2e4lRZMgzQ";

	private final WebClient webClient;

	public DirectionController(WebClient.Builder webClientBuilder) {
		this.webClient = webClientBuilder.baseUrl(apiUrl).build(); // baseurl 요청 서버 location으로 정해놓기
	}

	@GetMapping("/1234")
	public ResponseEntity<?> getDirectionsWithWayPoints(@RequestParam(name = "start") String start, // 127.74645%2C37.64424
																									// 형태로 보내야함
//            @RequestParam(name = "waypoints") String wayPoints,
			@RequestParam(name = "goal") String goal
	// 기본값 trafast
	) {
		 System.out.println("start:"+start);
		 System.out.println("goal:"+ goal);
		 
		try {

			DirectionsResponseDTO response = webClient.get().uri(uriBuilder -> uriBuilder // uri를 빌드(파라미터들,헤더)
					.queryParam("start", start)
//                        .queryParam("waypoints", wayPoints)
					.queryParam("goal", goal).build()).header("x-ncp-apigw-api-key-id", apiKeyId)
					.header("x-ncp-apigw-api-key", apiKeySecret).retrieve().bodyToMono(DirectionsResponseDTO.class) // mono
																													// (0개
																													// 또는
																													// 1개)
																													// 로
																													// 반환
					.block(); // block -> ResponseEntity로 반환하기 위해 씀

			System.out.println(response);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
		}
			
		
		
	}




	@GetMapping("/12345") // baseurl에 포함시키려했으나 권장하지 않는대서 여기에 넣음
	public ResponseEntity<?> getDirections(@RequestParam(name = "start") String start, // 127.74645%2C37.64424 형태로 보내야함
			@RequestParam(name = "waypoints") String wayPoints, @RequestParam(name = "goal") String goal
	// 기본값 trafast
	) {
		try {

			DirectionsResponseDTO response = webClient.get().uri(uriBuilder -> uriBuilder // uri를 빌드(파라미터들,헤더)
					.queryParam("start", start).queryParam("waypoints", wayPoints).queryParam("goal", goal).build())
					.header("x-ncp-apigw-api-key-id", apiKeyId).header("x-ncp-apigw-api-key", apiKeySecret).retrieve()
					.bodyToMono(DirectionsResponseDTO.class) // mono (0개 또는 1개) 로 반환
					.block(); // block -> ResponseEntity로 반환하기 위해 씀

			System.out.println("start:"+start);
			 System.out.println("goal:"+ goal);
			 System.out.println("response"+response);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));

		}
	}

}

