import "../css/Map.css";
import React, { useEffect, useContext, useState } from "react";
import { ProjectContext } from "../context/ProjectContext";
import useModal from "../context/useModal";
import Modal from "./Modal";
import axios from "axios";

const Map = () => {
  const {
    tripDates,
    routeType,
    mapObject,
    stopOverCount,
    path,
    setPath,
    stopOverList,
    setStopOverList,
    departure,
    setDeparture,
    destination,
    setDestination,
    selectedDay,
    setSelectedDay,
    dayChecks,
    setDayChecks,
    routeSaved,
    distance,
    setDistance,
    duration,
    setDuration,
    flag,
    setFlag

  } = useContext(ProjectContext);

  const {
    isModalOpen,
    openModal,
    closeModal,
    modalTitle,
    modalMessage,
    modalActions,
  } = useModal();

  const [dayBoolean, setDayBoolean] = useState([]);

  function formatDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    return `${hours}시 ${minutes}분 ${seconds}초`;
  }
  function formatDistance(meters) {
    if (meters >= 1000) {
      const kilometers = (meters / 1000).toFixed(1);
      return `${kilometers}km`;
    } else {
      return `${meters}m`;
    }
  }

  useEffect(() => {
    const convertXY = () => {
      switch (routeType) {
        case "departure":
          if (!departure.address) {
            return;
          }
          window.naver.maps.Service.geocode(
            {
              query: departure.address,
            },
            (status, response) => {
              if (status === window.naver.maps.Service.Status.ERROR) {
                openModal({
                  title: "주소 오류",
                  message: "주소를 찾을 수 없습니다.",
                });
                return;
              }
              const result = response.v2;
              const latlng = `${result.addresses[0].x},${result.addresses[0].y}`;
              setDeparture((prev) => ({
                ...prev,
                latlng: latlng, // 원하는 latlng 값
              }));
            }
          );

          break;

        case "destination":
          if (!destination.address) {
            return;
          }
          window.naver.maps.Service.geocode(
            {
              query: destination.address,
            },
            (status, response) => {
              if (status === window.naver.maps.Service.Status.ERROR) {
                openModal({
                  title: "주소 오류",
                  message: "주소를 찾을 수 없습니다.",
                  actions: [{ label: "확인", onClick: closeModal }],
                });
                return;
              }
              const result = response.v2;
              const latlng = `${result.addresses[0].x},${result.addresses[0].y}`;
              setDestination((prev) => ({
                ...prev,
                latlng: latlng, // 원하는 latlng 값
              }));
            }
          );
          break;

        case "stopOver":
          if (stopOverList.length > 0) {
            const num = stopOverList.length - 1;
            const stopOverAddress = stopOverList[num].address;
            if (!stopOverAddress) {
              return;
            }
            window.naver.maps.Service.geocode(
              {
                query: stopOverList[num].address,
              },
              (status, response) => {
                if (status === window.naver.maps.Service.Status.ERROR) {
                  openModal({
                    title: "주소 오류",
                    message: "주소를 찾을 수 없습니다.",
                    actions: [{ label: "확인", onClick: closeModal }],
                  });
                  return;
                }
                const result = response.v2;
                const latlng = `${result.addresses[0].x},${result.addresses[0].y}`;
                setStopOverList((prev) =>
                  prev.map((item, index) =>
                    index === num ? { ...item, latlng: latlng } : item
                  )
                );
              }
            );
          }
          break;

        default:
          break;
      }
    };
    convertXY();
  }, [routeType, stopOverCount]);

  useEffect(() => {
    if (tripDates && tripDates.startDate && tripDates.endDate) {
      const startDate = new Date(tripDates.startDate);
      const endDate = new Date(tripDates.endDate);

      const diffTime = endDate - startDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const daysArray = Array.from(
        { length: diffDays },
        (_, index) => `Day ${index + 1}`
      );
      const booleanArray = new Array(daysArray.length).fill(false);
      booleanArray[0] = true;
      setDayBoolean([...booleanArray]);
      setDayChecks([...daysArray]);
    }
  }, [tripDates]);

  useEffect(() => {
    const foundData = mapObject.find((data) => data.days === selectedDay + 1);
    if (foundData) {
      setDeparture({
        title: foundData.startPlace,
        address: foundData.startAddress,
        latlng: foundData.startPoint,
      });
      setStopOverList([...foundData.wayPoints]);
      setDestination({
        title: foundData.goalPlace,
        address: foundData.goalAddress,
        latlng: foundData.goalPoint,
      });
      setFlag(true);
    }else{
      setFlag(false);
    }
  }, [selectedDay]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.REACT_APP_NAVER_MAPS_API_KEY_ID}&submodules=geocoder`;
    script.async = true;
    script.onload = () => {
      if (window.naver && window.naver.maps) {
        const map = new window.naver.maps.Map("map-container", {
          center: new window.naver.maps.LatLng(37.5665, 126.978),
          zoom: 11,
        });

        const infoWindow = new window.naver.maps.InfoWindow({
          anchorSkew: true,
          pixelOffset: new window.naver.maps.Point(10, -10),
        });

        const createMarker = (latlng, obj, data, index) => {
          let iconUrl;
          if (obj === data.startPoint) {
            // Departure icon
            iconUrl = require("../img/marker/start.png");
          } else if (obj === data.goalPoint) {
            // Destination icon
            iconUrl = require("../img/marker/Goal.png");
          } else {
            // Waypoint icon
            iconUrl = require(`../img/marker/${index + 1}.png`);
          }

          // 마커 객체 생성
          const marker = new window.naver.maps.Marker({
            position: latlng,
            map: map,
            icon: {
              url: iconUrl,
              size: new window.naver.maps.Size(48, 48), // 마커 크기 설정
              anchor: new window.naver.maps.Point(25, 40),
              // 이미지 크기 비율 맞추기 (background-size로 크기 조정)
              backgroundSize: "contain", // 또는 'cover'를 사용하여 이미지 비율을 맞출 수 있습니다.
            },
          });
          // 마커 클릭 이벤트 등록
          window.naver.maps.Event.addListener(marker, "click", () => {
            if (infoWindow.getMap()) {
              infoWindow.close();
            } else {
              if (data.startPoint === obj) {
                const place = data.startPlace;
                const address = data.startAddress;
                infoWindow.setContent(`<div style="padding:10px;">
                    <h2>${place} </h2>
                    <h5>주소:${address} </h5>
                     </div>`);
                infoWindow.open(map, marker);
              } else if (data.goalPoint === obj) {
                const place = data.goalPlace;
                const address = data.goalAddress;
                infoWindow.setContent(`<div style="padding:10px;">
                    <h2>${place} </h2>
                    <h5>주소:${address} </h5>
                     </div>`);
                infoWindow.open(map, marker);
              } else if (data.address === obj) {
                const place = data.value;
                const address = obj;
                infoWindow.setContent(`<div style="padding:10px;">
                    <h2>${place} </h2>
                    <h5>주소:${address} </h5>
                     </div>`);
                infoWindow.open(map, marker);
              }
            }
          });
          window.naver.maps.Event.addListener(map, "click", () => {
            infoWindow.close();
          });
          return marker;
        };

        // 날짜가 변경될 때마다 마커와 폴리라인 업데이트
        const updateMapForDay = () => {
          const selectedData = mapObject.find(
            (data) => data.days === selectedDay + 1
          ); // selectedDay에 맞는 데이터 찾기
          if (selectedData) {
            const { startPoint, goalPoint, wayPoints } = selectedData;

            let markers = [];

            // 출발지 마커 추가
            const departureLatLng = new window.naver.maps.LatLng(
              startPoint.split(",")[1],
              startPoint.split(",")[0]
            );
            markers.push(
              createMarker(
                departureLatLng,
                selectedData.startPoint,
                selectedData
              )
            );

            // 도착지 마커 추가
            const destinationLatLng = new window.naver.maps.LatLng(
              goalPoint.split(",")[1],
              goalPoint.split(",")[0]
            );
            markers.push(
              createMarker(
                destinationLatLng,
                selectedData.goalPoint,
                selectedData
              )
            );
            // 경유지 마커 추가
            if (wayPoints && wayPoints.length > 0) {
              wayPoints.forEach((wayPoint, index) => {
                const wayPointLatLng = new window.naver.maps.LatLng(
                  wayPoint.latlng.split(",")[1],
                  wayPoint.latlng.split(",")[0]
                );
                markers.push(
                  createMarker(
                    wayPointLatLng,
                    wayPoint.address,
                    wayPoint,
                    index
                  )
                );
              });
            }

            var bounds = new window.naver.maps.LatLngBounds();
            for (var i = 0; i < markers.length; i++) {
              bounds.extend(markers[i].getPosition());
            }

            // 폴리라인 생성
            const pathCoordinates = path.map(
              ([longitude, latitude]) =>
                new window.naver.maps.LatLng(latitude, longitude)
            );
            const polyline = new window.naver.maps.Polyline({
              path: pathCoordinates, // 경로 (LatLng 객체 배열)
              strokeColor: "#ff5f23", // 폴리라인 색상
              strokeWeight: 4, // 선 두께
              strokeOpacity: 0.8, // 선의 불투명도
            });
            map.fitBounds(bounds);
            const currentZoom = map.getZoom();
            map.setZoom(currentZoom - 1);

            polyline.setMap(map);
          }
        };

        updateMapForDay();
      }
    };

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [selectedDay, departure, destination, stopOverList, mapObject, path]);

  useEffect(() => {
    if (mapObject) {
      const foundObject = mapObject.find(
        (data) => data.days === selectedDay + 1
      );
      const dirReq = async () => {
        if (foundObject) {
          if (foundObject.wayPoints) {
            try {
              const latlngArray = foundObject.wayPoints.map((prev) => {
                return prev.latlng;
              });
              const lnglatString = latlngArray.join("|");
              const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/directions/withwaypoint`,
                {
                  params: {
                    start: foundObject.startPoint,
                    goal: foundObject.goalPoint,
                    waypoints: lnglatString,
                  },
                }
              );
              setPath(response.data.route.traoptimal[0].path);
              setDuration(
                formatDuration(
                  response.data.route.traoptimal[0].summary.duration
                )
              );
              setDistance(
                formatDistance(
                  response.data.route.traoptimal[0].summary.distance
                )
              );

            } catch (error) {
              console.error(error);
            }
          } else {
            try {
              const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/directions/nowaypoint`,
                {
                  params: {
                    start: foundObject.startPoint,
                    goal: foundObject.goalPoint,
                  },
                }
              );
              setPath(response.data.route.traoptimal[0].path);
              setDuration(
                formatDuration(
                  response.data.route.traoptimal[0].summary.duration
                )
              );
              setDistance(
                formatDistance(
                  response.data.route.traoptimal[0].summary.distance
                )
              );
            } catch (error) {
              
              alert("경유지없는 디렉션 에러");
            }
          }
        }
      };
      dirReq();
    }
  }, [mapObject, selectedDay]);

  const handleDayClick = (day) => {
    const afterSet = () => {
      setDeparture({ title: "", address: "" });
      setStopOverList([]);
      setDestination({ title: "", address: "" });
      setSelectedDay(day);
      setDayBoolean((prev) => {
        const updatedDayBoolean = [...prev];
        updatedDayBoolean[selectedDay] = false;
        updatedDayBoolean[day] = true;
        return updatedDayBoolean;
      });
    };

    if (
      !routeSaved ||
      !mapObject.find((data) => data.days === selectedDay + 1)
    ) {
      openModal({
        message: "저장이 안된 일정이 있습니다. 넘어가시겠습니까?",
        actions: [
          {
            label: "확인",
            onClick: () => {
              afterSet();
              closeModal();
            },
            className: "confirm-button",
          },
          {
            label: "뒤로가기",
            onClick: closeModal,
            className: "cancel-button",
          },
        ],
      });
    } else {
      afterSet();
    }
  };

  return (
    <div id="mapPlan">
      <div id="map-container"></div>
      <div id="dayFrame">
        {dayChecks.map((item, index) => (
          <div id="dayChecks" key={index}>
            <input
              type="button"
              disabled={dayBoolean[index]}
              onClick={() => handleDayClick(index)}
              value={item}
            />
          </div>
        ))}
      </div>
      {flag && duration && distance && (
        <div className="duration">
          <p>소요시간 : {duration}</p>
          <p>여행거리 : {distance}</p>
        </div>
      )      
      }
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        content={modalMessage}
        actions={modalActions}
      />
    </div>
  );
};

export default Map;
