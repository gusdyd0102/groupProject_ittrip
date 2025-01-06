import React, { useEffect, useState } from "react";
import "../css/MainTest.css"
import banner2 from "../img/MainPage/banner/banner2.jpg";
import local1 from "../img/MainPage/local1.gif";
import local2 from "../img/MainPage/local2.gif";
import local3 from "../img/MainPage/local3.gif";
import local4 from "../img/MainPage/local4.gif";
import local5 from "../img/MainPage/local5.gif";
import local6 from "../img/MainPage/local6.gif";
import local7 from "../img/MainPage/local7.gif";
import local8 from "../img/MainPage/local8.png";
//icon
import house from "../img/Icon/house2.png"
import food from "../img/Icon/food2.png"
import spot from "../img/Icon/spot2.png"
import { API_BASE_URL } from "../service/api-config";
import axios from "axios";
import Modal from "../components/Modal";

const Maintest = () => {

    const [img, setImg] = useState();
    // 지역명에대한 state
    const [select, setSelect] = useState("");
    // areaCd state 
    const [areaCd, setAreaCd] = useState("");

    //시군구 이름
    const [signguNm, setSignguNm] = useState([])

    // 모달표시여부 state
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 지역배열
    const [subRegions, setSubRegions] = useState([]);

    // 설명
    const [explain, setExplain] = useState({});

    // 모달 지역명 헤더 
    const [header, setHeader] = useState();

    // 추천지 렌더여부
    const [recommend, setRecommend] = useState(false);

    const [recButton, setRecButton] = useState(
        {
            all: [], food: [],
            lodgment: [], spot: []
        }


    )

    const [currentView, setCurrentView] = useState("all");
    // 지역 코드 
    const regionData = {
        충청도: [
            { name: "충청북도", areaCd: "43", header: "충북" },
            { name: "충청남도", areaCd: "44", header: "충남" },
            { name: "세종시", areaCd: "36", header: "세종" },
            { name: "대전광역시", areaCd: "30", header: "대전" },
        ],
        경상도: [
            { name: "경상북도", areaCd: "47", header: "경북" },
            { name: "경상남도", areaCd: "48", header: "경남" },
            { name: "대구광역시", areaCd: "27", header: "대구" },
            { name: "울산광역시", areaCd: "31", header: "울산" },
            { name: "부산광역시", areaCd: "26", header: "부산" },
        ],
        전라도: [
            { name: "전라북도", areaCd: "52", header: "전북" },
            { name: "전라남도", areaCd: "46", header: "전남" },
            { name: "광주광역시", areaCd: "29", header: "광주" },
        ],
    };

    const regionClick = (region) => {
        setSubRegions(regionData[region]); // 하위 지역 데이터 설정
        setIsModalOpen(true);
        setSelect(region)
        setImg()
    };
    
    useEffect(() => {
        if (areaCd) {
            const requestAreaNm = async () => {
                try {
                    // Axios 요청 (비동기 처리)
                    const response = await axios.get(`${API_BASE_URL}/1`, {
                        params: { areaCd: areaCd },
                    });
                    // 응답 데이터 확인
                    // state의 상태 업데이트
                    setSignguNm(response.data.data);
                    // 데이터가 성공적으로 설정된 후 팝업창 열기
                    setIsModalOpen(true);
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };
            requestAreaNm();
        } //if end
    }, [areaCd]) // useEffect end

    useEffect(()=>{
        console.log(signguNm);
    },[signguNm])

    const requestData = async (item) => {
        try {
            // API 요청
            const response = await axios.get(`${API_BASE_URL}/123`, {
                params: {
                    signguNm: item,
                    areaNm: select
                },
            });
            // console.log("Response Data:", response.data.response.body.items.item);
            const items = response.data.response.body.items.item

            setRecButton((prevState) => ({
                ...prevState,
                all: items,
                food: items.filter((data) => data.rlteCtgryLclsNm === "음식"),
                lodgment: items.filter((data) => data.rlteCtgryLclsNm === "숙박"),
                spot: items.filter((data) => data.rlteCtgryLclsNm === "관광지"),
            }));


            // 필요한 추가 작업 수행
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };


    useEffect(() => {
        if (recButton.all.length === 0) return;
        setRecommend(true);
        console.log(recButton.all)
    }, [recButton])

    

    return (
        <div id="main">
            {/* 큰 배너 */}
            <div id="bigbanner">
                <img src={banner2} alt="banner" />
            </div>
            
            {/* 지역 4개 */}
            <div className="localSet">
                <div className="localtrip">
                    <div className="localName">
                        <p className="localEnglish">SEOUL</p>
                        <p className="localKorea">서울</p>
                    </div>
                    <div className="localImg"
                        onClick={() => {
                            setAreaCd("11");
                            setSelect("서울특별시");
                            setImg(local1)
                            setHeader("서울")
                            setExplain({
                                explain: "서울은 현대적이고 전통적인 매력을 모두 갖춘 도시로, 고궁과 전통 시장, 쇼핑과 음식이 풍성한 명소, 북촌 한옥마을, 경복궁, 남산타워 등 " +
                                    "다양한 명소가 방문객을 맞이합니다.",
                                english: "SEOUL"
                            })
                        }}>
                        <img src={local1} alt="서울" />
                    </div>
                </div>

                <div className="localtrip">
                    <div className="localName">
                        <p className="localEnglish">GYEONGGI</p>
                        <p className="localKorea">경기</p>
                    </div>
                    <div className="localImg"
                        onClick={() => {
                            setAreaCd("41");
                            setSelect("경기도");
                            setImg(local2)
                            setHeader("경기")
                            setExplain({
                                explain: "경기도는 아름다운 자연과 풍성한 문화유산을 자랑하는 여행지로, 서울 근교에서 쉽게 접근할 수 있습니다. 인기 있는 명소로는 수원 화성, 가평" +
                                    "의 북한강, 파주의 DMZ가 있습니다.",
                                english: "GYEONGGI"
                            })
                        }}>
                        <img src={local2} alt="경기" />
                    </div>
                </div>

                <div className="localtrip">
                    <div className="localName">
                        <p className="localEnglish">INCHEON</p>
                        <p className="localKorea">인천</p>
                    </div>
                    <div className="localImg"
                        onClick={() => {
                            setAreaCd("28");
                            setSelect("인천광역시");
                            setImg(local3)
                            setHeader("인천")
                            setExplain({
                                explain: "인천은 아름다운 바다와 다양한 문화가 어우러진 도시로, 차이나타운과 송도 국제도시가 유명합니다. 또한, 인천공항을 중심으로 편리한 교통과 풍" +
                                    "성한 쇼핑, 맛집도 즐길 수 있는 여행지입니다.",
                                english: "INCHEON"
                            })

                        }}>
                        <img src={local3} alt="인천" />
                    </div>
                </div>

                <div className="localtrip">
                    <div className="localName">
                        <p className="localEnglish">GANGWON</p>
                        <p className="localKorea">강원</p>
                    </div>
                    <div className="localImg"
                        onClick={() => {
                            setAreaCd("51");
                            setSelect("강원도");
                            setImg(local4)
                            setHeader("강원")
                            setExplain({
                                explain: "강원도는 청정 자연과 아름다운 산과 바다가 어우러진 곳으로, 설악산과 동해의 해변이 유명합니다. 하이킹, 스키, 해양 스포츠 등 다양한 활동" +
                                    "을 즐기며 자연의 매력을 만끽할 수 있는 여행지입니다.",
                                English: "Kangwon"
                            })


                        }}>
                        <img src={local4} alt="강원" />
                    </div>
                </div>
            </div>

            {/* 지역 4개 */}
            <div className="localSet">
                <div className="localtrip">
                    <div className="localName">
                        <p className="localEnglish">CHUNCHEONG</p>
                        <p className="localKorea">충청</p>
                    </div>
                    <div className="localImg"
                        onClick={() => {
                            regionClick("충청도");
                            setImg(local5)
                            setHeader("충청도")
                            setExplain({
                                explain: "충청도는 고즈넉한 전통과 자연의 아름다움이 어우러진 지역으로, 공주와 부여의 역사 유적지와 청풍호수의 경치가 유명합니다. 또한, 맛있는 음식" +
                                    "과 다양한 축제들이 있어 여행객들에게 풍성한 경험을 제공합니다.",
                                english: "CHUNCHEONG"
                            })
                        }}>
                        <img src={local5} alt="충청도" />
                    </div>
                </div>

                <div className="localtrip">
                    <div className="localName">
                        <p className="localEnglish">JEOLLA</p>
                        <p className="localKorea">전라</p>
                    </div>
                    <div className="localImg"
                        onClick={() => {
                            regionClick("전라도");
                            setImg(local6)
                            setHeader("전라도")
                            setExplain({
                                explain: "전라도는 풍부한 역사와 문화유산을 자랑하는 지역으로, 전주 한옥마을과 광주 문화가 유명합니다. 또한, 맛있는 음식과 아름다운 자연 경관, 특" +
                                    "히 남해안의 섬들이 매력적인 여행지입니다.",
                                english: "JEOLLA"
                            })
                        }}>

                        <img src={local6} alt="전라도" />
                    </div>
                </div>

                <div className="localtrip">
                    <div className="localName">
                        <p className="localEnglish">GYEONGSANG</p>
                        <p className="localKorea">경상</p>
                    </div>
                    <div className="localImg"
                        onClick={() => {
                            regionClick("경상도");
                            setImg(local7)
                            setHeader("경상도")
                            setExplain({
                                explain: "경상도는 풍부한 역사와 자연을 자랑하는 지역으로, 부산의 해변과 경주의 고대 유적이 매력적입니다. 전통적인 문화와 맛있는 음식도 함께 즐길 " +
                                    "수 있어 여행하기 좋은 곳입니다.",
                                english: "GYEONGSANG"
                            })
                        }}>
                        <img src={local7} alt="경상도" />
                    </div>
                </div>

                <div className="localtrip">
                    <div className="localName">
                        <p className="localEnglish">JEJU</p>
                        <p className="localKorea">제주</p>
                    </div>
                    <div className="localImg"
                        onClick={() => {
                            setAreaCd("50");
                            setSelect("제주도");
                            setImg(local8)
                            setHeader("제주도")
                            setExplain({
                                explain: "제주도는 아름다운 자연경관과 독특한 문화가 어우러진 섬으로, 한라산과 해변, 오름을 탐험할 수 있습니다. 신선한 해산물과 전통적인 음식도 즐" +
                                    "기며 휴식을 취하기 좋은 여행지입니다.",
                                english: "JEJU"
                            })
                        }}>
                        <img src={local8} alt="제주" />
                    </div>
                </div>
            </div>


            <Modal
                className="mainModal"
                isOpen={isModalOpen} // 모달 열림 여부
                onClose={() => {
                    setIsModalOpen(false)
                    setAreaCd("")
                    setSignguNm("")
                    setHeader("")
                    setRecommend(false);
                    console.log(areaCd, signguNm)
                }} // 닫기 함수
                content={!recommend ?
                    (<div className="mainLocal">
                        <div className="siGun">
                            <div className="siGunText">
                                <div className="siGunTitle">
                                    <p className="seoulKo">{header}</p>
                                    <p className="seoulEn" >{explain.english}</p>
                                </div>
                                <p>{explain.explain}</p>
                            </div>

                            <div className="siGunImg">
                                <img src={img} alt="지역이미지" />
                            </div>
                        </div>
                        <div className="tripSelect">
                            <p>여행할 곳을 선택해 주세요.</p>
                            <div className="guSelect">
                                {signguNm && signguNm.length > 0 ? (
                                    signguNm.map((item, index) => (
                                        <button className="guBt"
                                            key={index}
                                            onClick={() => requestData(item)}
                                        >{item}</button>
                                    )
                                    )) : (subRegions.map((item, index) => (
                                            <button className="guBt" key={index}
                                                onClick={() => {
                                                    setSelect(item.name);
                                                    setAreaCd(item.areaCd);
                                                    setHeader(item.header)
                                                }}  
                                            >
                                                {item.name}
                                            </button>
                                        ))
                                    )}
                            </div>
                        </div>
                    </div>) :
                    (
                    <div className="categoryAll">
                        <div className="categoryBtns">
                            {/* 버튼 클릭으로 currentView 변경 */}
                            <button onClick={() => setCurrentView("all")}>전체</button>
                            <button onClick={() => setCurrentView("lodgment")}>숙박</button>
                            <button onClick={() => setCurrentView("food")}>음식</button>
                            <button onClick={() => setCurrentView("spot")}>관광지</button>
                        </div>
                        {/* 조건부 렌더링 */}
                        <div  className="categoryList">
                            {(currentView === "all" || currentView === "lodgment" || currentView ==="food" || currentView === "spot") && (
                                <>
                                {/* <h3>전체</h3> */}
                                    {recButton[currentView].map((item, index) => (
                                        <div key={index} className="listContents">
                                            <div className="icon">
                                                <> {item.rlteCtgryLclsNm ==="관광지" ?  <img src={spot} alt="관광지"/> : item.rlteCtgryLclsNm === "숙박" ? <img src={house} alt="숙박"/> :  <img src={food} alt="음식" className="food"/>}</>
                                            </div>
                                            <div className="listInfo">
                                                <p><span className="suggestName">이름</span> <span className="suggestData suggestStyle">{item.rlteTatsNm}</span> </p>
                                                <p><span className="suggestName">주소</span> <span className="suggestData">{item.rlteBsicAdres}</span> </p>
                                                <p><span className="suggestName"> 태마</span> <span className="suggestData">{item.rlteCtgrySclsNm}</span> </p>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>)
                } // 내용 (데이터 기반 버튼 생성)
                actions={[
                    {
                        label: "돌아가기",
                        onClick: () => {
                            setIsModalOpen(false);
                            setAreaCd("");
                            setSignguNm("")
                            setHeader("")
                            setRecommend(false);
                            setCurrentView("all")
                        },
                        className: "close-button",

                    },
                ]} // 모달 하단 버튼들
            />
        </div>
    );
};

export default Maintest;
