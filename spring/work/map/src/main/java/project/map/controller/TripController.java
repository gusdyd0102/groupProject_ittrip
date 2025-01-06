package project.map.controller;

import java.util.List;
import java.util.stream.Collectors;

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

import jakarta.transaction.Transactional;
import project.map.dto.CheckListDTO;
import project.map.dto.CheckListDTO.Items;
import project.map.dto.MapDTO;
import project.map.dto.ResponseDTO;
import project.map.dto.TripDTO;
import project.map.entity.CheckListEntity;
import project.map.entity.MapEntity;
import project.map.entity.TripEntity;
import project.map.entity.UserEntity;
import project.map.repository.CheckListRepository;
import project.map.repository.MapRepository;
import project.map.repository.TripRepository;
import project.map.repository.UserRepository;
import project.map.service.TripService;

@RestController
@RequestMapping
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

   
   static String myTitle ;

   // 메인페이지 areaCd를 통해 SignguNm 모달위에 매핑
   @GetMapping("/signgunms")
   public ResponseEntity<?> getSignguNm(@RequestParam(name = "areaCd") String areaCd) {

      try {
         List<String> dtos = tripService.getSignguNms(areaCd);
         ResponseDTO<String> response = ResponseDTO.<String>builder().data(dtos).build();
         return ResponseEntity.ok(response);
      } catch (Exception e) {
         e.printStackTrace(); // 에러 로그 출력
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Server Error");
      }
   }


   // ------------------ GET -----------------------
   @GetMapping("/trips")
   public ResponseEntity<?> getTrips(@AuthenticationPrincipal String userId) { // requestParam 으로 userId를 받지않고
      List<TripEntity> list = tripService.getTrips(userId);
      List<TripDTO> dtos = list.stream().map(TripDTO::new).toList();
      ResponseDTO<TripDTO> response = ResponseDTO.<TripDTO>builder().data(dtos).build();
      return ResponseEntity.ok(response);
   }

   @GetMapping("/maps/{tripIdx}")
   public ResponseEntity<?> getMaps(
         @AuthenticationPrincipal String userId,
         @PathVariable(name = "tripIdx") Integer tripIdx) {
      List<MapEntity> list = tripService.getMaps(userId, tripIdx);
      List<MapDTO> updatedList = list.stream().map(data -> new MapDTO(data)) // MapEntity를 MapDTO로 변환
            .collect(Collectors.toList());
      return ResponseEntity.ok(updatedList);   
   }

   @GetMapping("/checklist/{tripIdx}")
   public ResponseEntity<?> getCheckList(
         @AuthenticationPrincipal String userId,
         @PathVariable(name = "tripIdx") Integer tripIdx) {
      CheckListEntity entity  = tripService.getCheckLists(userId, tripIdx);
      List<Items> list = tripService.parseItems(entity.getItems());
      CheckListDTO dto = CheckListDTO.builder().items(list).build();
      return ResponseEntity.ok(dto);
   }
   // ----------------- GET ----------------------------
   // ----------------- POST ---------------------------

   // trip객체 : 제목,출발일,도착일 db저장
   @PostMapping("/trips")
   public void postTrips(@AuthenticationPrincipal String userId, @RequestBody TripDTO dto) {
      UserEntity user = userRepository.findById(userId).get();
      myTitle = tripService.titleConfirm(dto.getTitle(),userId);
      TripEntity entity = TripEntity.builder().title(myTitle).startDate(dto.getStartDate())
            .lastDate(dto.getLastDate()).user(user).build();
      tripRepository.save(entity);
   }
   // map객체 저장
   @PostMapping("/maps")
   public void postMaps(@AuthenticationPrincipal String userId, @RequestBody MapDTO dto) {
      UserEntity user = userRepository.findById(userId).get();
      Integer tripIdx = tripRepository.getIdxByTitleAndUserId(myTitle,userId);
      TripEntity trip = tripRepository.getByIdx(tripIdx);
      
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
         
         mapRepository.save(entity);

      }

   }

   // checkList객체 저장
      @PostMapping("/checklist")
      public void postCheckList(@AuthenticationPrincipal String userId, @RequestBody CheckListDTO dto) {
         UserEntity user = userRepository.findById(userId).get();
         Integer tripIdx = tripRepository.getIdxByTitleAndUserId(myTitle,userId);
         TripEntity trip = tripRepository.getByIdx(tripIdx);
         CheckListEntity entity = CheckListEntity.builder().user(user).trip(trip).
               items(dto.getItems().stream().map(item -> item.getId() + ":" + item.getText() + ":" + item.isChecked()) // 문자열 변환 예시
                    .collect(Collectors.joining("|"))) // 리스트 -> 문자열 합치기
            .build();
         checkListRepository.save(entity) ;   
      }

   // ----------------- POST ---------------------------
   // ----------------- PUT ---------------------------

   @PutMapping("/trip")
   public void putTrip(@AuthenticationPrincipal String userId, @RequestBody TripDTO dto) {
      UserEntity user = userRepository.findById(userId).get();
      TripEntity entity = tripRepository.getByIdx(dto.getIdx());
      String confirmedTitle = tripService.titleConfirm(dto.getTitle(),userId);
      entity.setUser(user);
      entity.setTitle(confirmedTitle);
      entity.setStartDate(dto.getStartDate());
      entity.setLastDate(dto.getLastDate());
      
      tripRepository.save(entity);
   }

   @Transactional
   @PutMapping("/maps")
   public void putMap(@AuthenticationPrincipal String userId, @RequestBody MapDTO dto) {
      TripEntity trip = tripRepository.getByIdx(dto.getTripIdx());
      UserEntity user = userRepository.findById(userId).get();
      List<MapEntity> mapList = tripService.getMaps(userId, dto.getTripIdx());
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
         for (int i = mapSize; i < objectSize; i++) {
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
         currentEntity.setGoalPoint(goalPoint);         
         currentEntity.setWaypoint(waypoints);

         mapRepository.save(currentEntity);
         
         
      }
   }

   @Transactional
   @PutMapping("/checklist")
   public ResponseEntity<?> putCheckList(@AuthenticationPrincipal String userId, @RequestBody CheckListDTO dto) {
      UserEntity user = userRepository.findById(userId).get();
      TripEntity trip = tripRepository.getByIdx(dto.getTripIdx());
      CheckListEntity entity = tripService.getCheckLists(userId, dto.getTripIdx());
            
      String items =  dto.getItems().stream().map(item -> item.getId() + ":" + item.getText() + ":" + item.isChecked())                                                                                              
      .collect(Collectors.joining("|"));
      entity.setUser(user);
      entity.setTrip(trip);
      entity.setItems(items);
      checkListRepository.save(entity);
      return ResponseEntity.ok("수정 성공");
   }
   // ----------------- PUT ---------------------------
   // ----------------- DELETE -------------------------
   @DeleteMapping("/trip/{idx}")
   public void deleteTrip(@PathVariable("idx") Integer idx) { // pathVariable 어노테이션 사용시 { } 안에들어간 값과 idx 매개변수를 인식하기위해서                                    
      tripRepository.deleteById(idx);
   }

   // ----------------- DELETE -------------------------

}