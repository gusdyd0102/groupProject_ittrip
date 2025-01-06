import React, { useState } from "react";
import "../css/AddRoot.css"


const AddRoot = () => {
  // 경유지 상태 관리: 초기값은 하나의 경유지 입력 칸
  const [stopovers, setStopovers] = useState([{ id: Date.now(), value: "" }]);

  // 새로운 경유지 입력 칸 추가
  const addStopover = () => {
    setStopovers([...stopovers, { id: Date.now(), value: "" }]);
  };

  // 경유지 입력 값 변경
  const handleChange = (id, event) => {
    const updatedStopovers = stopovers.map((stopover) =>
      stopover.id === id ? { ...stopover, value: event.target.value } : stopover
    );
    setStopovers(updatedStopovers);
  };

  // 특정 경유지 삭제
  const removeStopover = (id) => {
    setStopovers(stopovers.filter((stopover) => stopover.id !== id));
  };

  return (
    <div id="addRoot">
      <input className="rootAddInput" placeholder="출발지 입력" />
      
      {/* 경유지 입력칸들 */}
      {stopovers.map((stopover, index) => (
        <div key={stopover.id}>
          <input
            className="rootAddInput"
            placeholder="경유지 입력"
            value={stopover.value}
            onChange={(e) => handleChange(stopover.id, e)}
          />
          
          {/* 첫 번째 경유지일 경우 + 버튼, 그 외에는 - 버튼 */}
          {index === stopovers.length - 1 ? (
            <button className="addStopoverBt" onClick={addStopover}>+</button>
          ) : (
            <button className="removeStopBt" onClick={() => removeStopover(stopover.id)}>-</button>
          )}
        </div>
      ))}

      <input className="rootAddInput" placeholder="도착지 입력" />
    </div>
  );
};

export default AddRoot;