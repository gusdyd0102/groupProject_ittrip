package project.map.controller;

import java.io.Console;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.hibernate.internal.build.AllowSysOut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;
import project.map.dto.AreaDTO;
import project.map.dto.CheckListDTO;
import project.map.dto.CheckListDTO.Items;
import project.map.dto.MapDTO;
import project.map.dto.MapDTO.MapObject;
import project.map.dto.ResponseDTO;
import project.map.dto.TripDTO;
import project.map.entity.AreaEntity;
import project.map.entity.CheckListEntity;
import project.map.entity.MapEntity;
import project.map.entity.TripEntity;
import project.map.entity.UserEntity;
import project.map.repository.AreaRepository;
import project.map.repository.CheckListRepository;
import project.map.repository.MapRepository;
import project.map.repository.TripRepository;
import project.map.repository.UserRepository;
import project.map.service.TripService;

@RestController
@RequestMapping
@Slf4j
public class TripController {

	@Autowired
	private TripService tripService;
	@Autowired
	private TripRepository tripRepository;
	@Autowired
	private MapRepository mapRepository;
	@Autowired
	private CheckListRepository checkListRepository;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private AreaRepository areaRepository;
	
	static String myTitle ;

	// 메인페이지 areaCd를 통해 SignguNm 모달위에 매핑
	@GetMapping("/1")
	public ResponseEntity<?> getSignguNm(@RequestParam(name = "areaCd") String areaCd) {

		try {
			System.out.println("areaCd: " + areaCd);
			List<String> dtos = tripService.getSignguNms(areaCd);
			ResponseDTO<String> response = ResponseDTO.<String>builder().data(dtos).build();
			System.out.println(response);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			e.printStackTrace(); // 에러 로그 출력
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Server Error");
		}
	}


	// ------------------ GET -----------------------
	// !!!!!!!!Get방식에는 @RequestParam을 권장한다고 하니 나중에 교체할지도!!!!!
	// TripEntity 객체들 반환(여행목록에 여행리스트)
	// 만약 @RequestParam으로 쓰면 (@RequestParam String userId)
	@GetMapping("/3")
	public ResponseEntity<?> getTrips(@AuthenticationPrincipal String userId) { // requestParam 으로 userId를 받지않고
		List<TripEntity> list = tripService.getTrips(userId);
		System.out.println("list : " + list);
		List<TripEntity> updatedList = list.stream().map(data -> {
			String updatedTitle = tripService.titleFromDB(data.getTitle());
			return TripEntity.builder().idx(data.getIdx()).startDate(data.getStartDate()).lastDate(data.getLastDate())
					.title(updatedTitle).user(data.getUser()).build();
		}).collect(Collectors.toList());
		System.out.println("updatedlist: " + updatedList);
		List<TripDTO> dtos = updatedList.stream().map(TripDTO::new).toList();
		ResponseDTO<TripDTO> response = ResponseDTO.<TripDTO>builder().data(dtos).build();
		return ResponseEntity.ok(response);
	}

	// MapEntity 객체들 반환(userId와 title을 통해서 map객체(days,start정보 등등 받아옴))
	// 만약 @RequestParam으로 쓰면 (@RequestParam String userId,@RequestParam String
	// title)
	@GetMapping("/4/{tripTitle}")
	public ResponseEntity<?> getMaps(@AuthenticationPrincipal String userId,
			@PathVariable(name = "tripTitle") String tripTitle) {
		String title = tripService.titleToDB(userId, tripTitle);
		List<MapEntity> list = tripService.getMaps(userId, title);
		TripEntity trip = tripRepository.getByTitle(title);
		trip.setTitle(tripService.titleFromDB(title));
		List<MapDTO> updatedList = list.stream().map(data -> new MapDTO(data)) // MapEntity를 MapDTO로 변환
				.collect(Collectors.toList());
		return ResponseEntity.ok(updatedList);
		
	}

	@GetMapping("/5")
	public ResponseEntity<?> getCheckList(@AuthenticationPrincipal String userId,
			@RequestParam(name = "tripTitle") String tripTitle) {
		String title = tripService.titleToDB(userId, tripTitle);
		String items = tripService.getCheckLists(userId, title);
		Integer foundIdx = tripService.getIdxByItems(items);
		CheckListEntity entity = CheckListEntity.builder().idx(foundIdx).items(items).build();
		List<Items> list = tripService.parseItems(entity.getItems());
		CheckListDTO dto = CheckListDTO.builder().idx(foundIdx).items(list).build();
		return ResponseEntity.ok(dto);
	}

//	}

	// ----------------- GET ----------------------------

	// ----------------- POST ---------------------------

	// trip객체 : 제목,출발일,도착일 db저장
	@PostMapping("/1")
	public void postTrips(@AuthenticationPrincipal String userId, @RequestBody TripDTO dto) {
		UserEntity user = userRepository.findById(userId).get();
		String titleToCheck = tripService.titleToDB(userId,dto.getTitle());
		myTitle = tripService.titleConfirm(titleToCheck);
		TripEntity entity = TripEntity.builder().title(myTitle).startDate(dto.getStartDate())
				.lastDate(dto.getLastDate()).user(user).build();
		tripRepository.save(entity);
	}
	// 111/제목(2)
	// map객체 저장
	@PostMapping("/2")
	public void postMaps(@AuthenticationPrincipal String userId, @RequestBody MapDTO dto) {
		UserEntity user = userRepository.findById(userId).get();
		TripEntity trip = tripRepository.getByTitle(myTitle);
		
		System.out.println("dto::::::::"+dto);
        
		StringBuilder waypointsBuilder;
		for (MapDTO.MapObject mapObject : dto.getMapObject()) {
			waypointsBuilder = new StringBuilder();
			int days = mapObject.getDays();
			String startPlace = mapObject.getStartPlace().replaceAll("</?[^>]+>", "");
			String startAddress = mapObject.getStartAddress();
			String startPoint = mapObject.getStartPoint();
			String goalPlace = mapObject.getGoalPlace().replaceAll("</?[^>]+>", "");
			String goalAddress = mapObject.getGoalAddress();
			String goalPoint = mapObject.getGoalPoint();

			for (MapDTO.WayPointDTO wayPoint : mapObject.getWayPoints()) {
				waypointsBuilder.append(wayPoint.getId()).append(":")
						.append(wayPoint.getValue().replaceAll("</?[^>]+>", "")).append(":")
						.append(wayPoint.getAddress()).append(":")
						.append(wayPoint.getLatlng()).
						append("|");
			}
			if (waypointsBuilder.length() > 0) {
				waypointsBuilder.setLength(waypointsBuilder.length() - 1);
			}
			String waypoints = waypointsBuilder.toString();

			MapEntity entity = MapEntity.builder().user(user).trip(trip).days(days).startPlace(startPlace)
					.startAddress(startAddress).startPoint(startPoint).goalPlace(goalPlace).goalAddress(goalAddress).goalPoint(goalPoint).waypoint(waypoints)
					.build();
			System.out.println(entity);
			mapRepository.save(entity);

		}

	}

	// checkList객체 저장
		@PostMapping("/3")
		public void postCheckList(@AuthenticationPrincipal String userId, @RequestBody CheckListDTO dto) {
			UserEntity user = userRepository.findById(userId).get();
			TripEntity trip = tripRepository.getByTitle(myTitle);
			CheckListEntity entity = CheckListEntity.builder().user(user).trip(trip).
					items(dto.getItems().stream().map(item -> item.getId() + ":" + item.getText() + ":" + item.isChecked()) // 문자열 변환 예시
                    .collect(Collectors.joining("|"))) // 리스트 -> 문자열 합치기
            .build();
			checkListRepository.save(entity) ;	
		}

	// ----------------- POST ---------------------------
	// ----------------- PUT ---------------------------

	@PutMapping("/1")
	public void putTrip(@AuthenticationPrincipal String userId, @RequestBody TripDTO dto) {
		UserEntity user = userRepository.findById(userId).get();
		String titleToCheck = tripService.titleToDB(userId, dto.getTitle());
		String confirmedTitle = tripService.titleConfirm(titleToCheck);
		TripEntity entity = TripEntity.builder().idx(dto.getIdx()) // GetMapping에서 idx를 받았기에 다시 가져온 idx로 trip을 구분하여 수정
				.title(confirmedTitle).startDate(dto.getStartDate()).lastDate(dto.getLastDate()).user(user).build();
		tripRepository.save(entity);
	}

	@PutMapping("/2")
	public void putMap(@AuthenticationPrincipal String userId,@PathVariable(name="tripTitle") String tripTitle, @RequestBody MapDTO dto) {
		String title = tripService.titleToDB(userId, tripTitle);
		TripEntity trip = tripRepository.getByTitle(title);
		UserEntity user = userRepository.findById(userId).get();
		List<MapEntity> mapList = tripService.getMaps(userId, title);

		System.out.println("Mapdto : "+dto);
		System.out.println("mapList"+mapList);
		StringBuilder waypointsBuilder;
		MapEntity entity;
		List<MapDTO.MapObject> mapObjects = dto.getMapObject();

		int mapSize = mapList.size();
		int objectSize = dto.getMapObject().size();

		if (mapSize == objectSize) { // days갯수가 수정됨
			// 그대로 진행
		} else if (mapSize > objectSize) { // days 갯수 줄어듬 5개->3개면 i=[4],[3] 삭제해야함
			for (int i = mapSize - 1; i >= objectSize; i--) {
				MapEntity removeEntity = mapList.get(i);
				mapList.remove(i);
				mapRepository.delete(removeEntity);
			}
		} else { // days 갯수 늘어남 3->5개면 2개 추가해야함
			for (int i = objectSize; i < mapSize; i++) {
				entity = new MapEntity();
				mapList.add(entity);
			}
		}

		for (int i = 0; i < objectSize; i++) {
			waypointsBuilder = new StringBuilder();
			int days = mapObjects.get(i).getDays();
			String startPlace = mapObjects.get(i).getStartPlace().replaceAll("</?[^>]+>", "");
			String startAddress = mapObjects.get(i).getStartAddress();
			String startPoint = mapObjects.get(i).getStartPoint();
			String goalPlace = mapObjects.get(i).getGoalPlace().replaceAll("</?[^>]+>", "");
			String goalAddress = mapObjects.get(i).getGoalAddress();
			String goalPoint = mapObjects.get(i).getGoalPoint();

			for (MapDTO.WayPointDTO wayPoint : mapObjects.get(i).getWayPoints()) {
				waypointsBuilder.append(wayPoint.getId()).append(":")
						.append(wayPoint.getValue().replaceAll("</?[^>]+>", "")).append(":")
						.append(wayPoint.getAddress()).append(":")
						.append(wayPoint.getLatlng())
						.append("|");
			}
			if (waypointsBuilder.length() > 0) {
				waypointsBuilder.setLength(waypointsBuilder.length() - 1);
			}
			String waypoints = waypointsBuilder.toString();

			MapEntity currentEntity = mapList.get(i);

			currentEntity.setUser(user);
			currentEntity.setTrip(trip);
			currentEntity.setDays(days);
			currentEntity.setStartPlace(startPlace);
			currentEntity.setStartAddress(startAddress);
			currentEntity.setStartPoint(startPoint);
			currentEntity.setGoalPlace(goalPlace);
			currentEntity.setGoalAddress(goalAddress);
			currentEntity.setWaypoint(waypoints);

			mapRepository.save(currentEntity);
		}
	}

	@PutMapping("/3")
	public ResponseEntity<?> putCheckList(@AuthenticationPrincipal String userId, @RequestBody CheckListDTO dto) {
		UserEntity user = userRepository.findById(userId).get();
		String title = tripService.titleToDB(userId, dto.getTripTitle());
		TripEntity trip = tripRepository.getByTitle(title);
		System.out.println("checkDTO"+dto);
		CheckListEntity entity = CheckListEntity.builder().user(user).trip(trip)
				.items(dto.getItems().stream().map(item -> item.getId() + ":" + item.getText() + ":" + item.isChecked()) // 문자열
																															// 변환
																															// 예시
						.collect(Collectors.joining("|"))) // 리스트 -> 문자열 합치기
				.build();
		checkListRepository.save(entity);
		return ResponseEntity.ok("수정 성공");
	}

	// ----------------- PUT ---------------------------
	// ----------------- DELETE -------------------------
	@DeleteMapping("/1/{idx}")
	public void deleteTrip(@PathVariable("idx") Integer idx) { // pathVariable 어노테이션 사용시 { } 안에들어간 값과 idx 매개변수를 인식하기위해서는
																// 어노테이션 뒤 같은 이름을 명시해야 한다 .
		tripRepository.deleteById(idx);
	}

	// trip객체 제외하곤 굳이 삭제할 거 없어보임.
	@DeleteMapping("/2/{idx}")
	public void deleteMap(@PathVariable Integer idx) {
		mapRepository.deleteById(idx);
	}

	@DeleteMapping("/3/{idx}")
	public void deleteCheckList(@PathVariable Integer idx) {
		checkListRepository.deleteById(idx);
	}
	// ----------------- DELETE -------------------------

}