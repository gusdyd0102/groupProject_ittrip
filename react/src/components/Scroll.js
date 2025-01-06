import React from "react";
const Scroll = ({title,list,style}) => {

    

    return (
        <div style={{ textAlign: "center" }}>
            <p style={{ color: "#F6A354",fontSize:"20px", paddingRight:"20px" }}>{title}</p>
            <div id="scroll"
                style={{
                    // width: "300px",
                    // height: "129px",
                    border: "2px solid #DADADA",
                    borderRight: "none",
                    borderLeft: "none",
                    overflowY: "auto",  // 세로 스크롤을 가능하게 함
                    padding: "10px",  // 내부 여백을 추가 (선택 사항)
                    ...style
                }}
            >
                {list}
            </div>
        </div>
    )
}

export default Scroll;