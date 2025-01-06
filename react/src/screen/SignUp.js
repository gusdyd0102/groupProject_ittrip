import '../css/SignUp.css';
import '../css/Reset.css';
import Logo from "../components/Logo";
import React,{useState, useRef, useContext} from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Modal from '../components/Modal';
import useModal from '../context/useModal';
import { ProjectContext } from '../context/ProjectContext';
import { useMediaQuery } from "react-responsive";

const SignUp = () => {
    const [formData, setFormData] = useState({
        id : '',
        password : '',
        userName : '',
        email : '',
        profilePhoto : null,
    })
     //비밀번호 확인 상태만 따로 관리 (용도 : 입력한 비밀번호와 비교 용도)
    const [idCheckBtn, setIdCheckBtn] = useState(false);
    const [userPwdConfirm, setUserPwdConfirm] = useState('');
    const inputImgRef = useRef(null);
    const navigate = useNavigate();

    //반응형 준비
    const isDesktop = useMediaQuery({ query: "(min-width: 1024px)"});
    const isTablet = useMediaQuery({ query: "(min-width: 431px) and (max-width: 1024px)" });
    const isMobile = useMediaQuery({ query: "(max-width: 430px)" });
    const {imagePreview, setImagePreview} = useContext(ProjectContext);

    //모달창 구현 영역
    const {
        isModalOpen,
        modalTitle,
        modalMessage,
        modalActions,
        openModal,
        closeModal,
    } = useModal();
    
    

    //핸들러
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
    };

    const handleProfileClick = () => {
        // 버튼 클릭 시 숨겨진 input 요소 클릭
        // 버튼 스타일을 위해서 적용
        if (inputImgRef.current) {
            inputImgRef.current.click();
        }
    };

     //handleProfileClick 함수가 실행되면 자동 클릭되어 실행됌
     const ImageUpload = (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({
                ...prev,
                profilePhoto: file.name,
            }));
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    //중복 아이디 체크
    const idCheck = async() => {
        try {
            if(formData.id === '') {
                openModal({
                    title: "",
                    message:"아이디를 입력하세요",
                    actions : [{label : "확인", onClick: closeModal}],
                })
                return;
            }else{
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/check`,{
                    params :   {id : formData.id}} )
                if(response.data){
                    openModal({
                        title: "",
                        message:"중복된 아이디 입니다.",
                        actions : [{label : "확인", onClick: closeModal}],
                    })
                    return;
                }else{
                    openModal({
                        title: "",
                        message:"사용 가능한 아이디 입니다.",
                        actions : [{label : "확인", onClick: closeModal}],
                    })
                    setIdCheckBtn(true);
                }
            }

        } catch (error) {

            if(error.response){
                const { message, status } = error.response.data;
                openModal({
                    title: "",
                    message:`중복 체크 함수 Error 상태 ${status}: ${message}`,
                    actions : [{label : "확인", onClick: closeModal}],
                })
                return;
            } else {
                openModal({
                    title: "",
                    message:'중복 체크 함수 쪽 에러남 스프링 연결 확인',
                    actions : [{label : "확인", onClick: closeModal}],
                })
            }
        }
    }

   
    // 회원가입 버튼
const signUp = async(e) => {
    e.preventDefault();
    // FormData 객체를 생성하여 formData와 이미지 파일을 함께 서버로 전송
    const formDataToSend = new FormData();
    for (let key in formData) {
        formDataToSend.append(key, formData[key]);
    }
    
    // 이미지 파일도 FormData에 추가
    if (imagePreview) {
        const imageFile = document.querySelector('input[type="file"]').files[0];
        formDataToSend.append('profilePhoto', imageFile);
    }

    //보내주는 formData에 빈값 체크
    const emptyValue = Object.keys(formData).find((key) => {
        const value = formData[key];
        return  typeof value === 'string' && value.trim() === '';
    });
    const emailRegEx = /^[A-Za-z0-9]([-_.]?[A-Za-z0-9])*@[A-Za-z0-9]([-_.]?[A-Za-z0-9])*\.[A-Za-z]{2,3}$/;
    if(emptyValue){
        openModal({
            title:"입력오류",
            message:"빈값이 존재합니다. 확인 후 다시 시도하세요.",
            actions:[{label: "확인", onClick:closeModal}],
        })
        return;
    }else if(userPwdConfirm === ''){
        openModal({
            title:"비밀번호 오류",
            message:"비밀번호 확인란을 입력해주세요.",
            actions:[{label: "확인", onClick:closeModal}],
        })
        return;
    }else if(formData.password !== userPwdConfirm){
        openModal({
            title:"비밀번호 오류",
            message:"비밀번호가 일치하지 않습니다.",
            actions:[{label: "확인", onClick:closeModal}],
        })
        return;
    }else if(!idCheckBtn){
        openModal({
            title:"아이디 확인",
            message:"중복체크 해야합니다.",
            actions:[{label: "확인", onClick:closeModal}],
        })
        return;
    }else if(!emailRegEx.test(formData.email)){
        openModal({
            title:"이메일 오류",
            message:"이메일을 확인해주세요.",
            actions:[{label: "확인", onClick:closeModal}],
        })
        return;
    }else{
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/signup`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data' 

                }
            });

            if(response.status === 200){
                openModal({
                    title:"가입 성공",
                    message:"환영합니다!.",
                    actions:[{label: "확인", onClick:closeModal}],
                })
                setTimeout(() => {window.location.href = "/login";}, 1000);
            }
        } catch (error) {
            if(error.response){
                openModal({
                    title:"",
                    message:"프로필 사진을 설정해주세요.",
                    actions:[{label: "확인", onClick:closeModal}],
                })
            } else {
                openModal({
                    title:"연결 오류",
                    message:"스프링 연결 상태를 확인하세요.",
                    actions:[{label: "확인", onClick:closeModal}],
                })
            }
        }
    }
};
const returnToMain = () => {
    navigate("/");
    window.location.reload();
}


return(
    <div className={`signUp ${isDesktop ? "desktop" : isTablet ? "tablet" : "mobile"}`}>
        <div className="logoImg">
            <Logo/>
        </div>
        <div className="signUp_container">
            <div className="signUp_contents">
                <h2 className="title">회원가입</h2>
                <form className='sigup_formData' onSubmit={(e) => signUp(e)}>
                    <div className='profilePhoto'>
                        {imagePreview !== null? (
                            <div className='photoImg'>
                                <img src={imagePreview} alt="preview"/>
                            </div>    
                        ) : ''}
                        <button type="button" className='profileChangeBtn'  onClick={handleProfileClick}>프로필 사진</button>
                        <input name="profilePhoto" type="file" accept="image/*" ref={inputImgRef} onChange={ImageUpload}/>
                    </div>
                    <div className='signUp_id'>
                        <input name="id" type="text" placeholder='아이디를 입력하세요.' onChange= {(e) => {handleInputChange(e);setIdCheckBtn(false)}} value={formData.id}/>
                        <button type="button" onClick={idCheck}>중복체크</button>
                    </div>
                    <div>
                        <input name="password" type="password" placeholder='비밀번호를 입력하세요.' onChange={handleInputChange} value={formData.password}/>
                    </div>
                    <div>
                        <input type="password" placeholder='비밀번호 확인.' onChange={(e)=>setUserPwdConfirm(e.target.value)}/>
                    </div>
                    <div>
                        <input name="userName" type="text" placeholder='이름을 입력하세요.' onChange={handleInputChange} value={formData.userName}/>
                    </div>
                    <div>
                        <input name="email" type="email" placeholder='이메일을 입력하세요' onChange={handleInputChange} value={formData.email}/>
                        
                    </div>
                    <div className="sigUp_Btns">
                        <button className="sigupBtn" type="submit">회원가입</button>
                        <button className="backBtn" type="button" onClick={returnToMain}>돌아가기</button>
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
    </div>
    )
}
export default SignUp;