import Login from "./screen/Login";
import EntirePlan from "./screen/EntirePlan";
import Header from "./components/Header";
import {Route, Routes, useNavigate } from "react-router-dom";
import Map from "./components/Map";
import SignUp from "./screen/SignUp";
import AddData from "./components/AddData";
import AddRoot from "./components/AddRoot";
// import { ProjectProvider } from "./context/ProjectContext";
import MyPage from "./screen/MyPage";
import NewTrip from "./screen/NewTrip";
import SocialLogin from "./components/SocialLogin";
import CheckList from "./components/CheckList";
import Main from "./screen/Main";
import { useContext, useEffect } from "react";
import useModal from "./context/useModal";
import Modal from "./components/Modal";
import { ProjectContext } from "./context/ProjectContext";
function App() {
  const {
    isModalOpen,
    openModal,
    closeModal,
    modalTitle,
    modalMessage,
    modalActions,
  } = useModal();

  const { setLoginSuccess } = useContext(ProjectContext);
  const navigate = useNavigate();
  useEffect(() => {
    function checkTokenExpiration() {
      const token = window.localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1])); // JWT의 payload 디코딩
        const expirationTime = payload.exp * 1000; // exp는 초 단위, 밀리초로 변환
        if (Date.now() > expirationTime) {
          // 토큰이 만료되었다면 삭제
          localStorage.removeItem("token");
          setLoginSuccess(false);
          openModal({
            message: "세션이 만료되었습니다. 다시 로그인해주세요.",
            actions:[{label:"확인", onClick:()=>{closeModal();navigate("/login");}}]
          })
        }
      }
    }

    checkTokenExpiration();
  }, [navigate]);
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/addData" element={<AddData />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/entireplan" element={<EntirePlan />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/test" element={<AddRoot />} />
        <Route path="/newtrip" element={<NewTrip />} />
        <Route path="/map" element={<Map />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/socialLogin" element={<SocialLogin />} />
        <Route path="/checklist" element={<CheckList />} />
      </Routes>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        content={modalMessage}
        actions={modalActions}
      />
    </>
  );
}

export default App;
