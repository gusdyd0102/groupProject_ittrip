import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/NewTrip.css";
import Plus2 from "../img/plus2.svg";
import Map from "../components/Map.js";
import AddData from "../components/AddData.js";
import CheckList from "../components/CheckList.js";
import axios from "axios";
import Modal from "../components/Modal.js";
import useModal from "../context/useModal.js";
import { ProjectContext } from "../context/ProjectContext.js";
import { API_BASE_URL } from "../service/api-config.js";
import { format } from "date-fns";

const NewTrip = () => {
 
  const navigate = useNavigate();
  const { isModalOpen, openModal, closeModal, modalTitle, modalMessage, modalActions } = useModal();
  const { tripTitle, tripDates, logData,items,mapObject,initObject,setSelectedDay,dayChecks } = useContext(ProjectContext);
  const formattedStartDate = format(tripDates.startDate, "yyyy-MM-dd");
  const formattedEndDate = format(tripDates.endDate, "yyyy-MM-dd");

  useEffect(() => {
    const handleRefreshAttempt = (e) => {
      e.preventDefault();
      openModal({
        title: "초기화 경고",
        message: "새로고침하면 데이터가 초기화됩니다. 계속하시겠습니까?",
        actions: [
          {
            label: "확인",
            onClick: () => {
              closeModal();
              navigate("/")
              window.location.reload();
            },
            className: "confirm-btn",
          },
          {
            label: "취소",
            onClick: closeModal,
            className: "cancel-btn",
          },
        ],
      });
    };
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === "r") || e.key === "F5") {
        e.preventDefault();
        handleRefreshAttempt(e);
      }
    };
    // 뒤로가기 감지
    const handlePopState = (e) => {
      e.preventDefault();
      handleRefreshAttempt(e);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.history.pushState(null, "", window.location.href); // 현재 상태 저장
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [openModal, closeModal]);


  const allAxios = async() => {
    try {
      const response1 = await axios.post(`${API_BASE_URL}/1`,{title: tripTitle,startDate: formattedStartDate,lastDate: formattedEndDate,},logData);
      const response2 = await axios.post(`${API_BASE_URL}/2`,{tripTitle: tripTitle,mapObject : mapObject},logData);
      const response3 = await axios.post(`${API_BASE_URL}/3`,{tripTitle: tripTitle,items : items},logData);

      if(response1.status !== 200){alert("post1 에러");}
      if(response2.status !== 200){
        alert("post2 에러");
      }else{
        initObject();
        setSelectedDay(0);
      }
      if(response3.status !== 200){
        alert("post3 에러");
      }else{
        openModal({
          title:"저장 성공",
          message:"여행 일정이 저장되었습니다.",
          actions:[{label:"확인", onClick: () => {closeModal(); navigate("/entireplan")}}]
        })
      }
    } catch (error) {
      alert("그외의 에러");
    }
    
  }
  const buttonClicked = () => {
    if(mapObject.length !== dayChecks.length){
      const mapConfirm = window.confirm("저장하지 않은 날짜가 있습니다. 저장하시겠습니까?");
      if (!mapConfirm) {
        return;
      }
      openModal({
        title:"에러",
        message:"저장하지 않은 날짜가 있습니다. 저장하시겠습니까?",
        actions:[
          {label:"확인", onClick: allAxios, className: "confirm-btn",},
          {label:"돌아가기", onClick: closeModal, className: "cancel-btn",}
        ]
      })
    }else{
      openModal({
        title:"저장",
        message:"저장하시겠습니까?",
        actions:[
          {label:"확인", onClick: allAxios, className: "confirm-btn",},
          {label:"돌아가기", onClick: closeModal, className: "cancel-btn",}
        ]
      })
    }
   
  };

  return (
    <div className="newTrip">
      <h2 >새로운 여행 하기</h2>
      <div><p className="tripTitle1">"{tripTitle}"을 계획해봐요!</p></div>
      {/* 경로설정 부분 */}
      <div id="rootSet">
        <h3 style={{ color: "#F6A354", marginTop: "25px", fontSize:'22px'}}>경로 설정</h3>
        {/* 지도, 경로추가부분 */}

        <div id="locationFrame">
          <div id="newMap">
            <Map/>
          </div>
          <div id="addDirectionFrame">
            <AddData width="200px"/>
            {/* <MapWithData /> */}
          </div>
        </div>
        <div id="checkAndEnd">
          <div id="checkListFrame">
            <h3 style={{ color: "#F6A354", marginTop: 0 ,fontSize:'22px' }}>체크리스트</h3>
            <div id='checkList'>
              <CheckList />
            </div>
          </div>
          <div id="endBtFrame">
            <p style={{color: "#F6A354", fontSize:'25px', marginBottom:'5px'}}>Happy Your Trip!</p>
            <p style={{color: "#828282", marginBottom:'20px'}}>일정계획이 완료되면 아래 버튼을 눌러주세요</p>
            <button id="newEnd" onClick={buttonClicked}>
              새로운 여행 추가
              <img src={Plus2} width="25px" style={{ marginLeft: "15px"  }} alt="새로운 여행"/>
            </button>
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

export default NewTrip;
