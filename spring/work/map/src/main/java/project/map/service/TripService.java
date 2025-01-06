package project.map.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import project.map.dto.AreaDTO;
import project.map.dto.CheckListDTO.Items;
import project.map.dto.MapDTO;
import project.map.entity.AreaEntity;
import project.map.entity.CheckListEntity;
import project.map.entity.MapEntity;
import project.map.entity.TripEntity;
import project.map.repository.AreaRepository;
import project.map.repository.CheckListRepository;
import project.map.repository.MapRepository;
import project.map.repository.TripRepository;

@Service
public class TripService {
	
	@Autowired
	private MapRepository mapRepository;
	@Autowired
	private TripRepository tripRepository;
	@Autowired
	private CheckListRepository checkListRepository;
	@Autowired
	private AreaRepository areaRepository;
	
	//--------------------데이터 가공----------------------------
	//경유지 String -> String[] (directions 15 요청에서 waypoints의 타입이 "|"로 구분된 String이라서 변환해주는 것)
	public String[] stringToMap(String wayPoints) {
		return wayPoints.split("|");
	}
	//경유지 String[] -> String (다시 React에서 배열로 사용해야 하기 때문)
	//체크리스트 String[] -> String
	public String mapToString(String[] waypoints) {
		return String.join("|", waypoints);
	}
	//DB에 title 넣을 때 ID/Title 형태로 가공하는 로직
	public String titleToDB(String userId,String title) {
		return userId+"/"+title;
	}
	//DB에서 title 가져올 때 ID/를 제거하는 로직
	public String titleFromDB(String title) {
		String[] arr = title.split("/");
		return arr[1];
	}
	//타이틀이 중복이면 (2),(3) 하나씩 증가(DB에 여행 하나를 저장하기 전에 중복을 확인해서 title값을 변경해주는 역할)
	public String titleConfirm(String title) {
	    int count = 2;
	    String newTitle = title;
	    while (tripRepository.existsByTitle(newTitle)) {
	        if (newTitle.matches(".*\\(\\d+\\)$")) {
	            // 이미 (숫자) 형식이 포함된 경우, 숫자를 증가시킴
	            newTitle = newTitle.replaceAll("\\(\\d+\\)$", "(" + count + ")");
	        } else {
	            // 처음으로 (2)를 추가
	            newTitle = title + "(" + count + ")";
	        }
	        count++;
	    }
	    return newTitle;
	}

	//---------------------------------------------------------
	
	//-------------------------메인페이지 기능---------------------
	//ex) 인천광역시를 누르면 인천시에 대한 부평구,남동구 등등의 리스트를 반환

	public List<String> getSignguNms(String areaCd){
		List<String> signguNm = areaRepository.findByAreaCd(areaCd) ;
		return signguNm;

	}
	
	// 시군구 이름으로 엔티티반환메서드 .
	public AreaDTO getCd(String areaNm, String signguNm){
		AreaEntity entity = areaRepository.findByAreaNmSignguNm(areaNm,signguNm);
		return new AreaDTO(entity);
	}
	
	
	//ex)이후 부평구를 누르면 인천광역시 부평구에 대한 areaCd,signguCd 반환 - 반환된 값으로 바로 공공데이터 요청을 할 것임
	public List<AreaEntity> getCds(String areaNm,String signguNm){
		return areaRepository.recommendByAddress(areaNm, signguNm);
	}
	//----------------------------------------------------------
	
	//userId 기반으로 trip객체들을 반환 (여행목록에 사용자가 설정한 여행리스트 렌더링)
	public List<TripEntity> getTrips(String userId){
		return tripRepository.getTripsByUserId(userId);
	}
	
//  지우지 마세요
//	//user_Id를 기반으로 가져온 trip에서 title 변경하기 (dto.gettitle=title,dto.getUserId()=userId,updatedTitle=사용자가 입력한 title)
//	public TripEntity updateTitle(String title,String updateTitle,String userId) {
//		String tempTitle = titleToDB(title,userId);		//DB에 저장된 title과 비교하기위해 가공
//		Integer idx = tripRepository.getidxByTitle(tempTitle);	//가공된 title로 idx 반환
//		TripEntity entity = tripRepository.findAllByIdx(idx);	//idx로 Trip객체 찾아서 반환
//		return tripRepository.updateTitleByIdx(updateTitle,idx);							
//	}
	
	//trip의 title을 받아서 MapEntity들 반환하기
	public List<MapEntity> getMaps(String userId,String title){
		return mapRepository.getLocation(userId, title);
		
	}
	
	//trip의 title을 받아서 CheckListEntity 반환하기
	public String getCheckLists(String userId,String title){
		return checkListRepository.getCheckListByUserIdAndTitle(userId, title);
	}
	
	public Integer getIdxByItems(String items) {
		return checkListRepository.getIdxByItems(items);
	}
	
	public List<Items> parseItems(String itemsString) {
	    List<Items> itemList = new ArrayList<>();
	    
	    // itemsString이 null 또는 빈 문자열이면 바로 반환
	    if (itemsString == null || itemsString.trim().isEmpty()) {
	        return itemList;
	    }

	    // ','를 기준으로 각 항목을 나눔
	    String[] itemArray = itemsString.split("\\|");
	    
	    for (String item : itemArray) {
	        // ':'로 구분하여 id, text, checked 값을 추출
	        String[] itemDetails = item.split(":");
	        if (itemDetails.length == 3) {
	            try {
	                Integer id = Integer.parseInt(itemDetails[0]);
	                String text = itemDetails[1];
	                boolean checked = Boolean.parseBoolean(itemDetails[2]);

	                // Items 객체 생성 후 리스트에 추가
	                itemList.add(new Items(id, text, checked));
	            } catch (NumberFormatException e) {
	                // id가 정수로 변환 불가한 경우 처리 (예외처리)
	                System.err.println("Invalid data format: " + item);
	            }
	        }
	    }
	    return itemList;
	}
	

	

	public static List<MapDTO.WayPointDTO> parseWaypoints(String waypoint) {
        if (waypoint == null || waypoint.isEmpty()) {
            return List.of();
        }

        return Arrays.stream(waypoint.split("\\|"))
            .map(entry -> {
                String[] parts = entry.split(":");
                if (parts.length == 4) {
                    return new MapDTO.WayPointDTO(parts[0], parts[1], parts[2],parts[3]);
                } else {
                    throw new IllegalArgumentException("Invalid waypoint format: " + entry);
                }
            })
            .toList();
    }


}