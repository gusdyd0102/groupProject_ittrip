import React, { useContext } from "react";
import DatePicker from "react-datepicker";
import { ProjectContext } from "../context/ProjectContext";
import { addDays } from "date-fns";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import "../css/Reset.css";
import "../css/DateCheck.css";

const DateCheck = () => {
  const { tripDates, setTripDates, tripTitle, setTripTitle } = useContext(ProjectContext);
  return (
    <div className="tripPlan_content">
      <div className="tripTitle">
        <label>
          여행 제목
          <input type="text" name="tripTitle" value={tripTitle} onChange={(e) => setTripTitle(e.target.value)} placeholder="여행 제목을 입력해주세요"/>
        </label>
      </div>
      <div className="tripDates">
        <div className="dateContents">
          <h3 style={{ marginTop: 0 }}>여행 기간</h3>
          <DatePicker
            className="datePicker"
            selected={tripDates.startDate}
            onChange={(dates) => {
              const [start, end] = dates;
              setTripDates({
                startDate: start,
                endDate: end,
              });
            }}
            startDate={tripDates.startDate}
            endDate={tripDates.endDate}
            minDate={new Date()}
            maxDate={tripDates.startDate ? addDays(tripDates.startDate, 9) : null}
            selectsRange
            dateFormat="yyyy-MM-dd"
            locale={ko}
            inline
          />
          {tripDates.startDate && tripDates.endDate && (
            <div className="dateCheckResult">
              <p>출발 날짜 : {tripDates.startDate.toLocaleDateString("ko-KR")}</p>
              <p>도착 날짜 : {tripDates.endDate.toLocaleDateString("ko-KR")}</p>
            </div>
          )
          }
        </div>
      </div>
    </div>
  )
}

export default DateCheck;