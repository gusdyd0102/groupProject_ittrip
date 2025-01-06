import React, { useContext, useState, useEffect, useRef } from "react";
import '../css/MyPage.css'
import axios from "axios";
import Modal from "../components/Modal";
import useModal from "../context/useModal";
import { useNavigate } from "react-router-dom";
import { ProjectContext } from "../context/ProjectContext";
import { useMediaQuery } from "react-responsive";

const MyPage = () => {
    
    //state
    const [userData, setUserData] = useState({});
    const [passwordConfirm, setPasswordConfirm] = useState(''); //비밀번호 확인 상태만 따로 저장 (비교용도)

    const [ImgPreview, setImgPreview] = useState(`${process.env.REACT_APP_API_BASE_URL}${userData.profilePhoto}`); //그냥로그인 프로필
    //ref
    const inputImgRef = useRef(null);
    //context
    const { setLoginSuccess, token, logData } = useContext(ProjectContext);
    //navigate
    const navigate = useNavigate();
    //modal 사용
    const {
        isModalOpen,
        modalTitle,
        modalMessage,
        modalActions,
        openModal,
        closeModal,
    } = useModal();

    //반응형 준비
    const isDesktop = useMediaQuery({ query: "(min-width: 1024px)"});
    const isTablet = useMediaQuery({ query: "(min-width: 431px) and (max-width: 1024px)" });
    const isMobile = useMediaQuery({ query: "(max-width: 430px)" });
    useEffect(()=>{
        console.log(userData);
    },[userData])

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/mypage`, logData);
                setUserData(response.data.value);
                setImgPreview(`${process.env.REACT_APP_API_BASE_URL}${response.data.value.profilePhoto}`);
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };
        fetchUserInfo();
    }, [token])

    //회원 삭제
    const handleDeleteAccount = async () => {

        const userDelete = async() => {
            try {
                await axios.delete(`${process.env.REACT_APP_API_BASE_URL}`, {headers: {Authorization: `Bearer ${token}`}});
                window.localStorage.removeItem("token");
                setLoginSuccess(false);
                openModal({
                    title: "회원탈퇴",
                    message: "탈퇴 되었습니다.",
                    actions: [{ label: "확인", onClick: () => { closeModal(); setTimeout(() => navigate("/login"), 500) } }],
                })

            } catch (error) {
                console.error("회원 삭제 실패:", error);
                alert("회원 삭제 중 오류가 발생했습니다.");
            }
        }
        openModal({
            title: "회원탈퇴",
            message:"정말로 회원 탈퇴를 진행하시겠습니까?",
            actions: [
                {label: "확인",onClick:userDelete},
                {label:"돌아가기", onClick:closeModal,}
            ]
        })
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProfileClick = () => {
        if (inputImgRef.current) {
            inputImgRef.current.click();
        }
    };

    const ImageUpload = (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        if (file) {
            setUserData((prev) => ({
                ...prev,
                profilePhoto: file,
            }));
            const reader = new FileReader();
            reader.onload = () => {

                setImgPreview(reader.result)
            };
            reader.readAsDataURL(file);
        }
    }

    //회원 수정

    const modify = async (e) => {
        e.preventDefault();
        const emptyValue = Object.keys(userData).find((key) => {
            const value = userData[key];
            return typeof value === 'string' && value.trim() === '';
        });
        if(userData.authProvider === null && userData.password === null){
            openModal({
                title: "비밀번호 오류",
                message: "비밀번호를 입력해주세요.",
                actions: [{ label: "확인", onClick: () => closeModal() }],
            });
            return;
        }
        if (userData.authProvider === null && userData.password !== passwordConfirm) {
            openModal({
                title: "비밀번호 오류",
                message: "비밀번호가 일치하지 않습니다.",
                actions: [{ label: "확인", onClick: () => closeModal() }],
            });
            return;
        }
        if (emptyValue) {
            openModal({
                title: "입력오류",
                message: "빈값이 존재합니다. 확인 후 다시 시도하세요.",
                actions: [{ label: "확인", onClick: closeModal }],
            })
            return;
        }

        try {
            const formData = new FormData();
            formData.append("id", userData.id);
            formData.append("userName", userData.userName);
            formData.append("email", userData.email);
            formData.append("password", userData.password);

            if (userData.profilePhoto instanceof File ) {
                formData.append("profilePhoto", userData.profilePhoto);
            }else if(userData.profilePhoto){
                formData.append("profilePhoto", null);
            }

            const response = await axios.put(`${process.env.REACT_APP_API_BASE_URL}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            if (response.status === 200) {
                openModal({
                    title: "수정 성공",
                    message: "정보가 수정되었습니다.",
                    actions: [{ label: "확인", onClick: () => { closeModal(); setTimeout(() => navigate("/")) } }],
                })
            }
        } catch (error) {
            if (error.response) {
                const { message, status } = error.response.data;
                openModal({
                    title: "수정 실패",
                    message: `실패함 상태 : ${status} : ${message}`,
                    actions: [{ label: "확인", onClick: () => { closeModal(); setTimeout(() => navigate("/mypage")) } }],
                })
            } else {
                openModal({
                    title: "연결 오류",
                    message: "스프링 연결 상태를 확인하세요.",
                    actions: [{ label: "확인", onClick: closeModal }],
                })
            }
        }
    }
    return (
        <div className={`myPage ${isDesktop ? "desktop" : isTablet ? "tablet" : "mobile"}`}>
            <div className="myPage_container">
                <h2 style={{ marginBottom:'20px'}}>마이 페이지</h2>
                <div className="myPageContents">
                    <div id="profileFrame">
                        <div className="UserImg">

                            <img src={ImgPreview} alt="프로필 사진" />
                        </div>
                        <button type="button" className='profileChangeBtn' onClick={handleProfileClick}>프로필 사진</button>
                        <input name="profilePhoto" type="file" accept="image/*" ref={inputImgRef} onChange={ImageUpload} />
                    </div>
                    <div id="myInfoFrame">
                        <form onSubmit={(e) => modify(e)}>
                            <div id="myInfo">
                                <div className="infoInput">
                                    <label for="userId">ID : </label>
                                    <input name="id" id="userId" value={userData.id} readOnly />
                                </div>
                                {userData.authProvider !== null ? '' : (
                                    <>
                                        <div className="infoInput">
                                            <label for="pwd">비밀번호 : </label>
                                            <input name="password" id="pwd" type="password" value={userData.password} onChange={handleInputChange} />
                                        </div>
                                        <div className="infoInput">
                                            <label for="pwdcf">비밀번호 확인 : </label>
                                            <input id="pwdcf" type="password" onChange={(e) => setPasswordConfirm(e.target.value)} value={passwordConfirm} />
                                        </div>
                                    </>

                                )}
                                <div className="infoInput">
                                    <label for="name">이름 : </label>
                                    <input name="userName" id="name" value={userData.userName} onChange={handleInputChange} />
                                </div>
                                <div className="infoInput">
                                    <label for="userEmail">이메일 : </label>
                                    <input name="email" id="userEmail" value={userData.email} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="myPageBtns">
                                <button type="submit">내정보 수정</button>
                                <button type="button" onClick={handleDeleteAccount}>회원 탈퇴</button>
                            </div>
                        </form>
                    </div>
                </div>

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
export default MyPage;