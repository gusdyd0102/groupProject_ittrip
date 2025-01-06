import React, { useContext, useState } from "react";
import "../css/HamburgerMenu.css"; // CSS 파일
import { Link, useNavigate } from "react-router-dom";
import { ProjectContext } from "../context/ProjectContext";
import Modal from "./Modal";
import useModal from "../context/useModal";
import DateCheck from "./DateCheck";
const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {loginSuccess, setLoginSuccess,tripTitle, setTripTitle, tripDates, setTripDates,} = useContext(ProjectContext);
  const navigate = useNavigate();

  const {
    isModalOpen,
    openModal,
    closeModal,
    modalTitle,
    modalMessage,
    modalActions,
  } = useModal();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const openDateCheck = (e) => {
    e.preventDefault();
    if(loginSuccess){
      setTripTitle("");
      setTripDates({});
      openModal({
        message: <DateCheck/>,
        actions: [{label:"저장", onClick:handleNewPlanSubmit}]
      })
    }else{
      openModal({
        className : "modal-default",
        title: "로그인",
        message: "로그인이 필요한 서비스 입니다.",
        actions: [{label:"확인", onClick:()=>{closeModal(); navigate("/login");}}]
      })
    }
  }
  const handleNewPlanSubmit = (e) => {
    e.preventDefault();
    if (!tripTitle || !tripDates.startDate || !tripDates.endDate) {
      openModal({
        title: "입력 오류",
        message: "여행 일정을 입력해주세요.",
        actions: [{ label: "확인", onClick: closeModal, className: "cancle-button" }],
      });
      return;
    } else {
      openModal({
        title: "저장 완료",
        message: "여행 일정이 저장되었습니다.",
        actions: [{ label: "확인", onClick:()=>{closeModal(); navigate("/newtrip");}}],
      });
    }
  };
  //로그아웃 버튼 클릭시 함수
  const handleLogout = () => {
    setLoginSuccess(false);
    localStorage.removeItem("token");
    closeModal();
    navigate("/login");
  };
  //로그아웃 전용 모달창
  const openLogoutModal = () => {
    openModal({
      title: "로그아웃",
      message: "로그아웃 하시겠습니까?",
      actions: [
        {label: "로그아웃",onClick: handleLogout,className: "logout-button"},
        {label: "취소", onClick: closeModal, className: "cancle-button"},
      ],
    });
  };
  return (
    <>
      <div className={`backdrop ${isOpen ? "show" : ""}`} onClick={() => setIsOpen(false)} />
      <div className="hamburger-menu">
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
        <nav className={`hbgMenu ${isOpen ? "open" : ""}`}>
          <ul>
            <li>
              <Link to="/" onClick={toggleMenu}>Main</Link>
            </li>
            <li>
              <Link to="/entireplan" onClick={toggleMenu}>My Plan</Link>
            </li>
            <li>
              <Link to="/newtrip" onClick={(e)=>{toggleMenu(); openDateCheck(e);}}>New Trip</Link>
            </li>
            <li>
              <Link className="mypage" to={"/mypage"} onClick={toggleMenu}>MYPAGE</Link>
            </li>
            {loginSuccess ? (
              <>
                <li>
                  <Link to={"/"} onClick={()=>{toggleMenu();openLogoutModal();}}>LOGOUT</Link>
                </li>
                <li>
                  <Link className="mypage" to={"/mypage"} onClick={toggleMenu}>MYPAGE</Link>
                </li>
              </>
              ) : (
                <>
                  <li>
                    <Link to={"/login"} onClick={toggleMenu}>LOGIN</Link>
                  </li>
                  <li>
                    <Link to={"/signup"} onClick={toggleMenu}>SIGNUP</Link>
                  </li>
                </>
              )}
          </ul>
        </nav>
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={modalTitle}
          content={modalMessage}
          actions={modalActions}
        />
      </div>
    </>
  );
};

export default HamburgerMenu;
