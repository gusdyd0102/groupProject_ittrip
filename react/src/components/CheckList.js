import React, { useContext } from "react";
import "../css/CheckList.css";
import { ProjectContext } from "../context/ProjectContext";

function CheckList() {

  const { input, setInput, items, setItems} = useContext(ProjectContext);

  //POST API 하기 위해 필요한것 userId
  const addItem = async () => {
    setInput("");
    if (input.trim()) {
      const maxId = items.length > 0 ? Math.max(...items.map((item) => item.id || 0)) : 0;
      const newItem = { 
        id: maxId + 1, //가장 큰 id에 1을 더함
        text: input, 
        checked: false 
    };

    // 기존 items 배열에 새 항목 추가
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    }
  };

  const toggleItem = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const deleteItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="checklistAll">
      <h3>체크리스트</h3>
      <div className="checkInput">
        <input
          type="text"
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="체크 해야할 것이 있나요?"
        />
        <button className='addBtn' onClick={addItem}>추가</button>
      </div>
      <div className="checkContents">
        <ul className="checkUl" style={{ padding: 0 }}>
          {items.map((item) => (
            <li className="checkLi"key={item.id}>
              <input type="checkbox" checked={item.checked} onChange={() => toggleItem(item.id)}/>
              <span style={{textDecoration: item.checked ? "line-through" : "none",}}>
                {item.text}
              </span>
              <button className='addBtn' type="button" onClick={() => deleteItem(item.id)}>
                삭제
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CheckList;
