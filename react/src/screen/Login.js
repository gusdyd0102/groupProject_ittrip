import React, { useState } from "react";
import "../css/Login.css"
import '../css/Reset.css'
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import Logo from "../components/Logo";
import Kakao from "../img/Logo/kakao.png";
import Naver from '../img/Logo/naver.svg'
import Google from '../img/Logo/google.svg'
import axios from "axios";
import { ProjectContext } from "../context/ProjectContext";
import { API_BASE_URL } from "../service/api-config";
import Modal from "../components/Modal";
import useModal from "../context/useModal";

const Login = () => {

    //useState
    const { setLoginSuccess, setUserData } = useContext(ProjectContext); // setUserData 추가
    const [logInfo, setLogInfo] = useState({ id : '', password : ''});
    
    const {
        isModalOpen,
        modalTitle,
        modalMessage,
        modalActions,
        openModal,
        closeModal,
    } = useModal();

    //navigate
    const navigate = useNavigate();
    const handleChange = (e) => {
        setLogInfo({ ...logInfo, [e.target.name]: e.target.value });
    }

   
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/signin`, logInfo);
            setLoginSuccess(true);
            if (response.data && response.data.value.token){
                const token = response.data.value.token;
                localStorage.setItem("token", token);
                const userData = response.data.value // response 의 
                setUserData(userData);  // 로그인한 사용자 정보를 context에 저장
                openModal({
                    title: "로그인 성공",
                    message:"환영합니다.",
                    actions : [{label : "확인", onClick: () => {closeModal(); navigate("/")} }],
                })
            } else {
                openModal({
                    title: "",
                    message: "로그인 실패: 서버에서 올바른 데이터를 못받음",
                    actions : [{label : "확인", onClick: closeModal}],
                })
                return;
            }
        } catch (error) {
            if (error.response) {
                openModal({
                    title: "",
                    message: "회원정보와 일치하지 않습니다.",
                    actions : [{label : "확인", onClick: closeModal}],
                })
                return;
            } 
        }
    }

    //소셜로그인
    const socialLogin = (e, provider) => {
        e.preventDefault();
        // window.localStorage.origin : 현재웹페이지의 origin --> origin  : http://localhost:3000 ----프로토콜, 도메인, 포트번호 를 합친것을 origin이라고 한다.
        window.location.href = API_BASE_URL + "/auth/authorize/" + provider + "?redirect_url=" + window.location.origin;

    }
    return (
        <div id="login">
            <div className="logoImg">
                <Logo />
            </div>
            <div className="login_container container">
                <form onSubmit={handleLogin}>
                    <div className="login_contents">
                        <h2 className="title">로그인</h2>
                        <div>
                            <input name="id" type="text" onChange={handleChange} placeholder="아이디"/>
                        </div>
                        <div>
                            <input name="password" type="password" onChange={handleChange} placeholder="비밀번호" />
                        </div>
                        <div className="loginBtns">
                            <button className="loginBt" type="submit">로그인</button>
                            <button className="kakaoBt socialBtn" type="button" onClick={ (e) => socialLogin(e,"kakao")}>
                                <img src={Kakao} alt="kakao" style={{width:"20px",marginRight:'3px'}} />
                                카카오 로그인
                            </button>
                            <button className="naverBt socialBtn" type="button" onClick={ (e) => socialLogin(e,"naver")}><img src={Naver} style={{width:"15px",marginRight:'7px'}}/>네이버 로그인</button>
                            <button className="googleBt socialBtn" type="button" onClick={ (e) => socialLogin(e,"google")} ><img src={Google} style={{width:"17px",marginRight:'16px'}}/>구글 로그인</button>
                        </div>
                    </div>

                </form>
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={modalTitle}
                    content={<p>{modalMessage}</p>}
                    actions={modalActions}
                />
            </div>
        </div>
    )
}
export default Login;