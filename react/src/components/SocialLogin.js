import { useContext, useEffect } from "react";
import { ProjectContext } from "../context/ProjectContext";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import { API_BASE_URL } from "../service/api-config";

const SocialLogin = () => {
    const { setLoginSuccess, setUserData } = useContext(ProjectContext);
    const navigate = useNavigate();

    useEffect(() => {
        const getUrlParameter = (name) => {
            let search = window.location.search;
            let params = new URLSearchParams(search);
            return params.get(name);
        };

        const token = getUrlParameter("token");
        console.log('토큰 파싱 : ' + token);

        if (token) {
            // 로컬 스토리지에 토큰 저장
            localStorage.setItem("token", token);

            // 사용자 정보 가져오기 (API 호출)
            UserInfo(token);
        } else {
            alert("로그인 할 수 없습니다.");
            navigate("/login");
        }
    }, [navigate]);

    const UserInfo = async (token) => {
        try {

            const response = await axios.get(`${API_BASE_URL}/mypage`, {
                headers: {
                    "Authorization": `Bearer ${token}`  // Authorization 헤더에 토큰 삽입
                    }
                }
            );
            console.log("서버 응답:", response.data);
            if (response.data && response.data.value) {
                setUserData(response.data.value); // 사용자 정보가 성공적으로 반환되면 context에 저장
                setLoginSuccess(true); // 로그인 성공 상태 설정
                alert("로그인 성공");
                navigate("/"); // 홈으로 리디렉션
            } else {
                throw new Error("서버 응답 구조가 예상과 다릅니다.");
            }
        } catch (error) {
            console.error("사용자 정보 가져오기 실패:", error);
            alert("사용자 정보를 가져올 수 없습니다.");
            navigate("/login"); // 실패시 로그인 페이지로 리디렉션
        }
    };

    return null; // 렌더링은 필요 없음 (navigate()가 리디렉션을 처리)
};

export default SocialLogin;
