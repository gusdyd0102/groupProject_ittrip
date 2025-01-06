import React, { useContext, useEffect, useState } from "react";
import "../css/Header.css";
import "../css/Reset.css";
import logo from "../img/Logo/logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { ProjectContext } from "../context/ProjectContext";
import Modal from "./Modal";
import useModal from "../context/useModal";
import DateCheck from "./DateCheck";

const Header = () => {
  const {
    loginSuccess,
    setLoginSuccess,
    token,
    tripTitle,
    tripDates,
    initObject
  } = useContext(ProjectContext);
  const navigate = useNavigate();

  const [isNewPlanModal, setIsNewPlanModal] = useState(false);

  //modal창 상태
  const { isModalOpen, openModal, closeModal, modalTitle, modalMessage, modalActions } = useModal();

  useEffect(() => {
    if (token && !loginSuccess) {
      setLoginSuccess(true);
    }
  }, [token]);

  //로그아웃 버튼 클릭시 함수
  const handleLogout = () => {
    setLoginSuccess(false);
    localStorage.removeItem("token");
    closeModal();
    navigate("/login");
  };

  //로그아웃 전용 모달창
  const openLogoutModal = () => {
    setIsNewPlanModal(false);
    openModal({
      title: "로그아웃",
      message: "로그아웃 하시겠습니까?",
      actions: [ 
        { label: "로그아웃", onClick: handleLogout, className: "logout-button"},
        { label: "취소", onClick: closeModal, className: "cancle-button" },
      ],
    });
  };

  const handleNewPlanSubmit = (e) => {
    setIsNewPlanModal(false);
    e.preventDefault();
    // setSavedBtnClicked(true);
    if (!tripTitle || !tripDates.startDate || !tripDates.endDate){
      openModal({
        title:"입력 오류",
        message:"여행 일정을 입력해주세요.",
        actions:[{ label:"확인", onClick:closeModal, className:"cancle-button"}],
      })
      return;
    }else{
      openModal({
        title: "저장 완료",
        message: "여행 일정이 저장되었습니다.",
        actions: [
          {
            label: "확인",
            onClick: () => {
              closeModal();
              initObject();
              navigate("/newTrip"); // 상태를 닫고 이동
            },
            className: "confirm-button",
          },
        ],})
    }
  };

  const openNewPlanModal = (e) => {
    e.preventDefault();
    setIsNewPlanModal(true);
    initObject();
    openModal({});
  };

  const closeModalWithReset = () => {
    setIsNewPlanModal(false);
    closeModal();
  };

  //Link to부분은 화면 확인을 위해 임시로 넣은 주소입니다.
  return (
    <div className="header">
      <Link className="logo" to={"/"} >
        <img className="headerLogo" src={logo} alt="Logo" onClick={() => {window.location.href = "/";}}/>
      </Link>
      <nav className="menuBar">
        <Link className="menu" to={"/checklist"}>CheckList</Link>
        <Link className="menu" to={"/entireplan"}>My Plan</Link>
        <Link className="menu" onClick={openNewPlanModal}> New Plan</Link>
      </nav>
      <div className="headerBtn">
        {loginSuccess ? (
            <div>
              <Link className="logout" onClick={openLogoutModal}>LOGOUT</Link>
              <Link className="mypage" to={"/mypage"}>MYPAGE</Link>
            </div>
        ) : (
          <div>
            <Link className="login" to={"/login"}>LOGIN</Link>
            <Link className="signup" to={"/signup"}>SIGNUP</Link>
          </div>
            
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModalWithReset}
        title={isNewPlanModal ? "새로운 여행 계획" : modalTitle }
        className={isNewPlanModal ? "modal-trip-plan" : "modal-default"}
        content={
          isNewPlanModal ? (
            <DateCheck/>
          ) : (
            modalMessage
          )
        }
        actions={
          isNewPlanModal
            ? [
                {
                  label: "저장",
                  onClick: handleNewPlanSubmit,
                  className: "save-button",
                },
                {
                  label: "취소",
                  onClick: closeModal,
                  className: "cancel-button",
                },
              ]
            : modalActions
        }
      />
    </div>
  );
};

export default Header;
