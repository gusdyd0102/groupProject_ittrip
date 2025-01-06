import React, { useContext, useState, useEffect } from "react";
import "../css/EntirePlan.css";
import '../css/Reset.css'
import { Link } from "react-router-dom";
import Map from "../components/Map";
import Plus2 from "../img/plus2.svg"
import { API_BASE_URL } from "../service/api-config";
import AddData from "../components/AddData";
import { ProjectContext } from "../context/ProjectContext";
import axios from "axios";


const EntirePlan = () => {

    const { logData, setDeparture, setStopOverList, setDestination, dayChecks, setDayChecks, selectedDay ,departure,destination,stopOverList} = useContext(ProjectContext);



    const [trips, setTrips] = useState([]);  //{idx,title,startDate,lastDate} 
    const [maps, setMaps] = useState([]);    //{days,startPlace,startAddress,goalPlace,goalAddress,wayPoints} 
    const [checkList, setCheckList] = useState([]);     //{id,text,checked} 

    const [isReadOnly, setIsReadOnly] = useState(true);

    const [currentTitle, setCurrentTitle] = useState(null);

    useEffect(() => {
        if (!isReadOnly) {
            alert("수정 모드")
        }
    }, [isReadOnly])


    useEffect(() => {
        console.log("trip객체: " + JSON.stringify(trips));
        console.log("map객체: " + JSON.stringify(maps));
        console.log("checkList객체 : " + JSON.stringify(checkList))
    }, [trips, maps, checkList])


    

    useEffect(() => {
        // API 호출
        const fetchTrips = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/3`, {
                    headers: logData.headers                        //getMapping에선 header와 param을 명시해줘야한다고 함. (logData만 쓰니 인식 못 함)
                });
                console.log("response:" + JSON.stringify(response.data.data));
                setTrips(response.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTrips();
    }, []);


    const fetchMapCheck = async(trip) => {

        debugger;
        setCurrentIdx(()=>trip.idx);

        

        try {
            
            const response = await axios.get(`${API_BASE_URL}/4/${trip.title}`, {
                headers: logData.headers
                
            });

            const startDate = new Date(trip.startDate);
            const endDate = new Date(trip.lastDate);

            const diffTime = endDate - startDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            const daysArray = Array.from({ length: diffDays }, (_, index) => `Day ${index + 1}`);

            setDayChecks([...daysArray]);

            console.log("Mapresponse:", JSON.stringify(response.data[0].mapObject));
             
            
            const flatMapObjects = response.data.map(item => item.mapObject).flat();
            setMaps(flatMapObjects);
            
            setDeparture({ title: response.data[0].mapObject[selectedDay].startPlace, address: response.data[0].mapObject[selectedDay].startAddress, latlng:response.data[0].mapObject[selectedDay].startPoint })
            setDestination({ title: response.data[0].mapObject[selectedDay].goalPlace, address: response.data[0].mapObject[selectedDay].goalAddress, latlng:response.data[0].mapObject[selectedDay].goalPoint})
            setStopOverList([...response.data[0].mapObject[selectedDay].wayPoints])


            // setStopOverList({title: ,address:})
            // setDestination({title: ,address:})
            //   setMaps(response.data.mapObject);
            
        } catch (err) {
            console.log("err"+err)
        }

        try {
            setCheckList([]);
            const response = await axios.get(`${API_BASE_URL}/5`, {
                headers: logData.headers,
                params: {
                    tripTitle: trip.title
                },
            });
            setCheckList(() => (response.data.items));
        } catch (err) {
            alert("checkList 추가를 안 해놔서 axios에러는 뜨지만 문제 x ");
        }
    }

    const putMapCheck = async () => {
        //maps put
        debugger;
        try {
            const response = await axios.put(
                `${API_BASE_URL}/2`,
                {
                    tripTitle: currentTitle,
                    mapObject: maps
                },
                {
                    headers: logData.headers
                }
            );
        } catch (err) {
            alert("put Map 에러");
        }

        //checkList put
        try {
            const response = await axios.put(
                `${API_BASE_URL}/3`,
                {
                    tripTitle: currentTitle,
                    items: checkList
                },
                {
                    headers: logData.headers
                }
            );
        } catch (err) {
            alert("put CheckList 에러");
        }
        setIsReadOnly(() => !isReadOnly)
    }

    const deleteTrip = async (idx) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/1/${idx}`)
            setTrips((prevTrips) => prevTrips.filter((trip) => trip.idx !== idx));
            alert("삭제 완료")
            window.location.reload();
        } catch (err) {
            alert("삭제 실패");
        }
    }

    const handleTripTitleChange = (e, trip) => {
        setTrips((prevTrips) =>
            prevTrips.map((t) =>
                t.idx === trip.idx ? { ...t, title: e.target.value } : t
            )
        );
    };

    const handleCheckboxChange = (id) => {
        setCheckList((prevCheckList) =>
            prevCheckList.map((item) =>
                item.id === id ? { ...item, checked: !item.checked } : item
            )
        );
    };

    const handleCheckListTextChange = (id, value) => {
        setCheckList((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, text: value } : item
            )
        );
    };

    const addCheckList = () => {
        setCheckList((prev) =>
            [...prev, { id: Date.now(), text: '', checked: false }])
    }

    const deleteCheckList = (id) => {
        setCheckList((prev) =>
            prev.filter((item) =>
                item.id !== id
            )
        )
    }

    return (
        <div className='myPlan'>
            <h2 style={{textAlign:'center', marginBottom:0}}>내 일정 보기</h2>
            <div className="myPlanContainer">
                <div className="mapFrame">
                    <Map />
                </div>
                <div className="planFrame">
                    <div className="newTripBt">
                        {isReadOnly ? (
                            <button onClick={() => setIsReadOnly(!isReadOnly)}>수정하기</button>
                        ) 
                        : (
                            <button onClick={() => putMapCheck()}>수정완료</button>
                            )
                        }
                    </div>
                    <div className="tripList myPlanContent">
                        <h3>여행목록</h3>
                        <ul>
                            {trips.map(trip => (
                                <li key={trip.idx}>
                                    <input readOnly={isReadOnly} onClick={() => fetchMapCheck(trip)} onChange={(e) => handleTripTitleChange(e, trip)} value={trip.title}/>
                                        {/*해당 title로 map을 띄워주는 get요청을 onclick에 담을 것 , 해당 title의 end-start 로 day갯수도 띄워줘야함함*/ }
                                    <button onClick={() => deleteTrip(trip.idx)}>삭제</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="tripRoute myPlanContent">
                        <h3>여행경로</h3>
                        <div>
                            {isReadOnly ? maps && maps.length > 0 &&
                                <>
                                    <input readOnly={isReadOnly} value={departure.title}/>
                                    <ul>
                                        {stopOverList.map((point) => (
                                            <li key={point.id}>
                                                <input readOnly={isReadOnly} value={point.value}/>
                                            </li>
                                        ))}
                                    </ul>
                                    <input readOnly={isReadOnly} value={destination.title}/>
                                </> : <AddData />
                            }
                        </div>
                    </div>
                    <div className="tripCheck myPlanContent">
                        <h3>체크리스트</h3>
                        <ul>
                            {checkList.map((list) => (
                                <li key={list.id}>
                                    <input type="checkbox" checked={list.checked} readOnly={isReadOnly} onChange={() => handleCheckboxChange(list.id)}/>
                                    <input value={list.text} readOnly={isReadOnly} onChange={(e) => handleCheckListTextChange(list.id, e.target.value)}/>
                                    {!isReadOnly && <button onClick={() => deleteCheckList(list.id)}>삭제</button>}
                                </li>
                            ))}
                        </ul>
                        {!isReadOnly && <button onClick={() => addCheckList()}>추가</button>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EntirePlan;