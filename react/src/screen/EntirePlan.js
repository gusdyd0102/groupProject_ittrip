import React, { useContext, useState, useEffect } from "react";
import "../css/EntirePlan.css";
import "../css/Reset.css";
import Map from "../components/Map";
import AddData from "../components/AddData";
import { ProjectContext } from "../context/ProjectContext";
import axios from "axios";
import Modal from "../components/Modal";
import useModal from "../context/useModal";
import { useMediaQuery } from "react-responsive";

const EntirePlan = () => {
  const {
    logData,
    setDayChecks,
    selectedDay,
    departure,setDeparture,
    destination,setDestination,
    stopOverList,setStopOverList,
    isReadOnly,setIsReadOnly,
    mapObject,setMapObject,
    setRouteSaved,
    setFlag
  } = useContext(ProjectContext);

  const isDesktop = useMediaQuery({ query: "(min-width: 1024px)"});
  const isTablet = useMediaQuery({ query: "(min-width: 431px) and (max-width: 1024px)" });
  const isMobile = useMediaQuery({ query: "(max-width: 430px)" });

  const [trips, setTrips] = useState([]); //{idx,title,startDate,lastDate}
  const [checkList, setCheckList] = useState([]); //{id,text,checked}
  const [currentIdx, setCurrentIdx] = useState(null);

  const {
    isModalOpen,
    modalTitle,
    modalMessage,
    modalActions,
    openModal,
    closeModal,
  } = useModal();

  useEffect(() => {
    if (!isReadOnly) {
      openModal({
        title: "수정모드",
        message: "여행 일정이 수정가능합니다.",
        actions: [{ label: "확인", onClick: closeModal }],
      });
    }
  }, [isReadOnly]);

  useEffect(() => {
    // API 호출
    const fetchTrips = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/trips`,
          {
            headers: logData.headers, //getMapping에선 header와 param을 명시해줘야한다고 함. (logData만 쓰니 인식 못 함)
          }
        );
        setTrips(response.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrips();
    setMapObject([]);
  }, []);

  const fetchMapCheck = async (trip) => {
    setFlag(true)
    setCurrentIdx(() => trip.idx);
    setTitle(trip.title);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/maps/${trip.idx}`,
        {
          headers: logData.headers,
        }
      );
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.lastDate);

      const diffTime = endDate - startDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const daysArray = Array.from(
        { length: diffDays },
        (_, index) => `Day ${index + 1}`
      );

      setDayChecks([...daysArray]);

      const flatMapObjects = response.data.map((item) => item.mapObject).flat();
      setMapObject(flatMapObjects);
      setDeparture({
        title: response.data[0].mapObject[selectedDay].startPlace,
        address: response.data[0].mapObject[selectedDay].startAddress,
        latlng: response.data[0].mapObject[selectedDay].startPoint,
      });
      setDestination({
        title: response.data[0].mapObject[selectedDay].goalPlace,
        address: response.data[0].mapObject[selectedDay].goalAddress,
        latlng: response.data[0].mapObject[selectedDay].goalPoint,
      });
      setStopOverList([...response.data[0].mapObject[selectedDay].wayPoints]);
      setRouteSaved(true);
    } catch (err) {
      console.error(err);
    }

    try {
      setCheckList([]);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/checklist/${trip.idx}`,
        {
          headers: logData.headers,
        }
      );
      setCheckList(() => response.data.items);
    } catch (err) {
      console.log("현재 trip에 checkList 추가 안 해서 catch로 빠짐")
    }
  };

  const putMapCheck = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/maps`,
        { tripIdx: currentIdx, mapObject: mapObject },
        logData
      );
      openModal({
        message: "수정이 완료되었습니다.",
        actions: [{ label: "확인", onClick: closeModal }],
      });
    } catch (err) {
      console.log("put Map 에러");
    }

    //checkList put
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/checklist`,
        { tripIdx: currentIdx, items: checkList },
        logData
      );
    } catch (err) {
      console.log("put CheckList 에러");
    }
    setIsReadOnly(() => !isReadOnly);
  };

  const deleteTrip = async (idx) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/trip/${idx}`
      );
      setTrips((prevTrips) => prevTrips.filter((trip) => trip.idx !== idx));
      openModal({
        message: "삭제 완료",
        actions: [
          {
            label: "확인",
            onClick: () => {
              closeModal();
              window.location.reload();
            },
          },
        ],
      });
    } catch (err) {
      openModal({
        title:"실패",
        message : "삭제가 불가능합니다.",
        actions:[{label:"확인", onClick:closeModal()}]
      })
    }
  };

  const handleTripTitleChange = (e, trip) => {
    setTrips((prevTrips) =>
      prevTrips.map((t) =>
        t.idx === trip.idx ? { ...t, title: e.target.value } : t
      )
    );
  };

  const handleCheckboxChange = (id) => {
    setCheckList((prevCheckList) =>
      prevCheckList.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleCheckListTextChange = (id, value) => {
    setCheckList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text: value } : item))
    );
  };

  const addCheckList = () => {
    setCheckList((prev) => [
      ...prev,
      { id: Date.now(), text: "", checked: false },
    ]);
  };

  const deleteCheckList = (id) => {
    setCheckList((prev) => prev.filter((item) => item.id !== id));
  };
  // const title = trips.map((item) => item.title);
  const [title, setTitle] = useState("");
  return (
    <div className={`myPlan ${isDesktop ? "desktop" : isTablet ? "tablet" : "mobile"}`}>
      <h2 style={{ textAlign: "center", marginBottom: 0 }}>내 일정 보기</h2>
      <div className="tripTitle">
        {title !== "" ? (
          <p type="text" onChange={(e) => setTitle(e.target.value)}>
            " {title} "
          </p>
        ) : (
          ""
        )}
      </div>
      <div className="myPlanContainer">
        <div className="mapFrame">
          <Map />
        </div>
        <div className="planFrame">
          <div className="newTripBt">
            {isReadOnly ? (
              <button onClick={() => setIsReadOnly(!isReadOnly)}>
                수정하기
              </button>
            ) : (
              <button onClick={() => putMapCheck()}>수정완료</button>
            )}
          </div>
          <div className="tripList myPlanContent">
            <h3>여행목록</h3>
            <ul>
              {trips.map((trip) => (
                <li key={trip.idx}>
                  <input
                    readOnly={isReadOnly}
                    onClick={() => fetchMapCheck(trip)}
                    onChange={(e) => handleTripTitleChange(e, trip)}
                    value={trip.title}
                  />
                  {/*해당 title로 map을 띄워주는 get요청을 onclick에 담을 것 , 해당 title의 end-start 로 day갯수도 띄워줘야함함*/}
                  <button
                    className="addDataBtns"
                    onClick={() => deleteTrip(trip.idx)}
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="tripRoute myPlanContent">
            <h3>여행경로</h3>
            <div>
              {isReadOnly ? (
                mapObject &&
                mapObject.length > 0 && (
                  <>
                    <input readOnly={isReadOnly} value={departure.title} />
                    <ul>
                      {stopOverList.map((point) => (
                        <li key={point.id}>
                          <input
                            readOnly={isReadOnly}
                            value={point.value.replace(/<\/?[^>]+(>|$)/g, "")}
                          />
                        </li>
                      ))}
                    </ul>
                    <input readOnly={isReadOnly} value={destination.title} />
                  </>
                )
              ) : (
                <AddData />
              )}
            </div>
          </div>
          <div className="tripCheck myPlanContent">
            <h3>체크리스트</h3>
            <ul>
              {checkList.map((list) => (
                <li key={list.id}>
                  <input
                    type="checkbox"
                    checked={list.checked}
                    readOnly={isReadOnly}
                    onChange={() => handleCheckboxChange(list.id)}
                  />
                  <input
                    value={list.text}
                    readOnly={isReadOnly}
                    onChange={(e) =>
                      handleCheckListTextChange(list.id, e.target.value)
                    }
                  />
                  {!isReadOnly && (
                    <button
                      className="addDataBtns"
                      onClick={() => deleteCheckList(list.id)}
                    >
                      삭제
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {!isReadOnly && (
              <button className="addDataBtns" onClick={() => addCheckList()}>
                추가
              </button>
            )}
          </div>
        </div>
      </div>
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

export default EntirePlan;
