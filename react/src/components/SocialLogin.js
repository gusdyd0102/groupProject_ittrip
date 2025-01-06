import { useContext, useEffect } from "react";
import { ProjectContext } from "../context/ProjectContext";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import Modal from "./Modal";
import useModal from "../context/useModal";

const SocialLogin = () => {
    const { setLoginSuccess, setUserData, logData } = useContext(ProjectContext);
    const navigate = useNavigate();
    const {
        isModalOpen,
        modalTitle,
        modalMessage,
        modalActions,
        openModal,
        closeModal,
      } = useModal();
    useEffect(() => {
        const getUrlParameter = (name) => {
            let search = window.location.search;
            let params = new URLSearchParams(search);
            return params.get(name);
        };
        const token = getUrlParameter("token");
        if (token) {
            localStorage.setItem("token", token);
            UserInfo(token);
        } else {
           openModal({
            message:"로그인을 할 수 없습니다.",
            actions:[{label:"확인", onClick:()=>{closeModal();navigate("/login");}}],
           })
        }
    }, [navigate]);

    const UserInfo = async (token) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/mypage`, {
                headers: {
                    "Authorization": `Bearer ${token}`  // Authorization 헤더에 토큰 삽입
                    }
                }
            );
            if (response.data && response.data.value) {
                setUserData(response.data.value); // 사용자 정보가 성공적으로 반환되면 context에 저장
                setLoginSuccess(true); // 로그인 성공 상태 설정
                openModal({
                    message:"로그인 성공",
                    actions:[{label:"확인", onClick:()=>{closeModal();navigate("/");}}],
                })
            } else {
                throw new Error("서버 응답 구조가 예상과 다릅니다.");
            }
        } catch (error) {
            openModal({
                message:"사용자 정보를 가져올 수 없습니다.",
                actions:[{label:"확인", onClick:()=>{closeModal();navigate("/login");}}],
            })
        }
    };

    return (
        <>
        <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            title={modalTitle}
            content={modalMessage}
            actions={modalActions}
        />
        </>
    ); // 렌더링은 필요 없음 (navigate()가 리디렉션을 처리)
};

export default SocialLogin;
