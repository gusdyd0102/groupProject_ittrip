import React, { useContext } from "react";
import '../css/MainLocal.css'
import local1 from '../img/MainPage/local1.gif'
import { ProjectContext } from "../context/ProjectContext";


const MainLocal = ({localInfo}) => {
    // const {signguNm , setSignguNm} = useContext(ProjectContext);

    //임시 구 정보 (API로 대체 예정)
    return (
        <div id="mainLocal">
            <div id="siGun">
                <div id="siGunText">
                    <div>
                        <p id="seoulKo">{localInfo.localKorea}</p>
                        <p id="seoulEn">{localInfo.localEnglish}</p>
                    </div>
                    <p>{localInfo.explain}</p>
                </div>
                <div id="siGunImg">
                    <img src={localInfo.images} style={{ width: '355px', height: '355px' }} alt="이미지" />
                </div>
            </div>

            <div id="tripSelect">
                <p>여행할 곳을 선택해 주세요</p>
                <div id="guSelect">
                    {/* {signguNm.map((gu, index)=>(<button key={index} className="guBt">{gu}</button>))} */}
                </div>
            </div>
        </div>
    );
};

export default MainLocal;
