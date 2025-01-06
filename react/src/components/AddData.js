import axios from "axios";
import React, { useState, useContext, useEffect } from "react";
import { ProjectContext } from "../context/ProjectContext";
import Modal from "./Modal";
import useModal from "../context/useModal";
import "../css/AddData.css";

const AddData = ({ width }) => {
  //입력된 데이터를 저장할 배열
  const [data, setData] = useState([]);
  //여러 개의 input을 관리하는 배열
  const [res, setRes] = useState([]);
  //모달창 분리 하기 위해 만든 상태
  const [isNewModal, setIsNewModal] = useState(false);
  //context 활용
  const {
    departure,
    setDeparture,
    stopOverList,
    setStopOverList,
    destination,
    setDestination,
    selectedDay,
    mapObject,
    setMapObject,
    setStopOverCount,
    stopOverCount,
    setRouteType,
    setRouteSaved,
    setFlag
  } = useContext(ProjectContext);
  const [prevLength, setPrevLength] = useState(0);
  //모달창 사용
  const {
    isModalOpen,
    modalTitle,
    modalActions,
    modalMessage,
    openModal,
    closeModal,
  } = useModal();

  useEffect(() => {
    setStopOverCount(() => stopOverList.length);
  }, [stopOverList]);

  //경로저장하기 버튼을 눌름
  const putObject = () => {
    if (stopOverList.length - 1 >= prevLength || stopOverList !== "") {
      const foundData = mapObject.find((data) => data.days === selectedDay + 1);
      if (foundData) {
        if (
          foundData.StartAddress !== departure.address ||
          JSON.stringify(foundData.wayPoints) !==
            JSON.stringify(stopOverList) ||
          foundData.goalAddress !== destination.address
        ) {
          const newArr = mapObject.filter(
            (data) => data.days !== selectedDay + 1
          );
          setMapObject([...newArr]);
        }
      }
      setMapObject((prevMapObject) => [
        ...prevMapObject,
        {
          days: selectedDay + 1,
          startPlace: departure?.title || "", // 방어적으로 title 확인
          startAddress: departure?.address || "",
          startPoint: departure?.latlng || "",
          goalPlace: destination?.title || "",
          goalAddress: destination?.address || "",
          goalPoint: destination?.latlng || "",
          wayPoints: stopOverList || [],
        },
      ]);
      setRouteSaved(true);
      openModal({
        title: `Day ${selectedDay + 1}`,
        message: `${selectedDay + 1}일 여행 계획이 저장되었습니다.`,
        actions: [{ label: "확인", onClick: closeModal }],
      });
    }
  };

  //출발,도착,경유 타입에 따라서 저장 방식 달라짐
  const handleCheck = (item, type) => {
    setIsNewModal(false);
    setRouteSaved(true);
    switch (type) {
      case "departure":
        setDeparture({ title: item.title, address: item.address });
        setRouteType(type);
        setStopOverCount((prev) => prev+1);
        break;
      case "destination":
        setDestination({ title: item.title, address: item.address });
        setRouteType(type);
        setStopOverCount((prev) => prev+1);
        break;
      case "stopOver":
        if (stopOverCount == 0) {
          setStopOverList((prevList) => [
            ...prevList.slice(1),
            { id: Date.now(), value: item.title, address: item.address },
          ]);
        } else {
          setStopOverList((prevList) => [
            ...prevList.slice(0, -1),
            { id: Date.now(), value: item.title, address: item.address },
          ]);
        }
        setRouteType(type);
        setStopOverCount((prev) => prev + 1);
        break;
      default:
        console.log("handleCheck switch 케이스 쪽 오류");
    }
    closeModal();
    openModal({
      message: `${
        type === "stopOver"
          ? "경유지가"
          : type === "departure"
          ? "출발지가"
          : "도착지가"
      } 추가되었습니다.`,
      actions: [{ label: "확인", onClick: closeModal }],
    });
  };

  //좌표저장
  const handlecoordinate = () => {
    
    if (departure.address === "" || destination.address === "") {
      openModal({
        title: "오류",
        message: "출발지와 도착지를 입력해주세요.",
        actions: [{ label: "확인", onClick: closeModal }],
      });
      return;
    }
    if (stopOverList.some((list) => list.address === "")) {
      setRouteSaved(false);
      openModal({
        title: "오류",
        message: "경유지를 입력해주세요.",
        actions: [{ label: "확인", onClick: closeModal }],
      });
      return;
    }
    putObject();
    setFlag(true);
    
  };

  const handleSearch = async (value, updateState, modalTitle) => {
    if (!value) {
      setRes([]);
      openModal({
        message: `${modalTitle}를 입력해주세요.`,
        actions: [
          { label: "확인", onClick: closeModal, className: "cancel-button" },
        ],
      });
      return;
    } else {
      try {
        const newData = [...data, value];
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/local`,
          {
            params: { query: value },
          }
        );
        setRes(response.data.items);
        setData(newData);
        updateState(value);
        setIsNewModal(true);
        openModal({
          title: modalTitle,
          message: "재검색 해주세요.",
          actions: [{ label: "확인", onClick: closeModal }],
        });
      } catch (error) {
        console.error(`검색 handleSearch 쪽 오류 : ${error}`);
        alert("handleSearch 검색 오류");
      }
    }
  };
  //경유지 추가 버튼
  const plusBtnClicked = () => {
    setStopOverList([
      ...stopOverList,
      { id: Date.now(), value: "", address: "" },
    ]);
    setRouteSaved(false);
  };

  const handleStopOverChange = (id, value) => {
    setStopOverList(
      stopOverList.map((stopOver) =>
        stopOver.id === id ? { ...stopOver, value } : stopOver
      )
    );
  };

  //경유지 삭제 버튼
  const removeStopOver = (id) => {
    setStopOverList(stopOverList.filter((stopOver) => stopOver.id !== id));
    setStopOverCount((prev) => prev - 1);
  };

  return (
    <div className="addData">
      <div className="departSearch">
        <input
          type="text"
          placeholder="출발지를 검색하세요."
          value={departure.title?.replace(/<\/?[^>]+(>|$)/g, "") || ""}
          onChange={(e) =>
            setDeparture((prev) => ({ ...prev, title: e.target.value }))
          }
        />
        <button
          className="addDataBtns"
          type="button"
          onClick={() => handleSearch(departure.title, setDeparture, "출발지")}
        >
          출발
        </button>
      </div>
      {stopOverList.map((stopOver) => (
        <div className="stopOverSearch" key={stopOver.id}>
          <input
            type="text"
            placeholder="경유지를 입력하세요."
            value={stopOver.value.replace(/<\/?[^>]+(>|$)/g, "")}
            onChange={(e) => handleStopOverChange(stopOver.id, e.target.value)}
          />
          <button
            className="addDataBtns"
            type="button"
            onClick={() =>
              handleSearch(
                stopOver.value,
                (value) =>
                  setStopOverList((prevList) =>
                    prevList.map((item) =>
                      item.id === stopOver.id ? { ...item, value } : item
                    )
                  ),
                "경유지"
              )
            }
          >
            경유
          </button>
          <button
            className="removeBtn"
            type="button"
            onClick={() => removeStopOver(stopOver.id)}
          >
            삭제
          </button>
        </div>
      ))}
      {departure.title && destination.title && stopOverList.length < 15 && (
        <div className="plusBtn">
          <button type="button" onClick={plusBtnClicked}>
            경유지 추가
          </button>
        </div>
      )}
      <div className="destinateSearch">
        <input
          type="text"
          placeholder="도착지를 검색하세요."
          value={destination.title?.replace(/<\/?[^>]+(>|$)/g, "") || ""}
          onChange={(e) =>
            setDestination((prev) => ({ ...prev, title: e.target.value }))
          }
        />
        <button
          className="addDataBtns"
          type="button"
          onClick={() =>
            handleSearch(destination.title, setDestination, "도착지")
          }
        >
          도착
        </button>
      </div>
      <button className="saveBtn" type="button" onClick={handlecoordinate}>
        경로 저장하기
      </button>
      <Modal
        className="newTripModal"
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        content={
          <div className="searchList">
            {isNewModal ? (
              res.length > 0 ? (
                <ul>
                  {res.map((item, index) => (
                    <li key={item.title}>
                      <span className="listNumber">{index + 1}</span>
                      <p className="listTitle">
                        {item.title.replace(/<\/?[^>]+(>|$)/g, "")}
                      </p>
                      {modalTitle === "출발지" && (
                        <button className="addressBtn" onClick={() => handleCheck(item, "departure")}>
                          {item.address}
                        </button>
                      )}
                      {modalTitle === "도착지" && (
                        <button className="addressBtn" onClick={() => handleCheck(item, "destination")}>
                          {item.address}
                        </button>
                      )}
                      {modalTitle === "경유지" && (
                        <button className="addressBtn" onClick={() => handleCheck(item, "stopOver")}>
                          {item.address}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>검색 결과가 없습니다.</p>
              )
            ) : (
              modalMessage
            )}
          </div>
        }
        actions={modalActions}
        // [{label:"확인", onClick:()=>{setRes([]); closeModal();}}]
      />
    </div>
  );
};
export default AddData;
