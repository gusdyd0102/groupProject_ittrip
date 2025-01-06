import axios from "axios";
import {API_BASE_URL} from './api-config'

//api : 호출할 api 경로
//method : HTTP 메서드(GET,POST,PUT,DELETE)
//request : 요청이 담을 데이터(주로 POST,PUT 요청에 사용)
export async function call(api,method,request){

    let headers=new Headers({
        "Content-Type":"application/json"
    })

    //로컬스토리지에서 ACCESS TOKEN 가져오기
    const accessToken = localStorage.getItem("ACCESS_TOKEN") //토큰을
    if(accessToken && accessToken !== null){
        headers.append("Authorization","Bearer "+accessToken); //헤더에 추가해줘  "Bearer " 띄어쓰기해야 잘라서 사용가능
    }


    //기본 옵션 설정
    let option = {
        headers:headers,
        url : API_BASE_URL + api,
        method : method,
        //headers : { //요청 헤더 설정
        //    "Content-Type" : "application/json"}
    }
    //request가 존재하는 경우 : POST,PUT,DELETE 와 같은 GET 이외의 요청일때
    //요청 본문에 데이터를 담아 보낸다.
    if(request){
        //객체 형테로 전달된 데이터를 JSON문자열로 변환하여 서버에 전송한다.
        option.data=JSON.stringify(request);
    }
    //axios(option) : 앞서 설정한 option 객체를 사용하여 axios로 Http 요청을 보낸다.
    return await axios(option)
    //요청이 성공적으로 처리된 경우 실행되는 코드
    .then(response=>{
        //서버에서 반환한 실제 데이터를 반환하여, 이 데이터를 호출한 쪽에서 사용할 수 있도록 한다.
        return response.data;  //responce --{error: null,data}
    })
    //요청중에 오류가 발생한 경우 실행되는 코드
    .catch(error =>{
        //에러가 발생하면, 이를 console.log로 출력하거나 디버깅하거나 문제를 파악할 수 있도록 한다.
        console.log("http error");
        console.log(error.status);//상태코드
        //상태코드가 403일때 login으로 리다이렉트하면된다.
        if(error.status===403){
            window.location.href="/login";
        }
    })
} //call end

//로그인
export function signin(userDTO){
    return call("/signin","POST",userDTO)  //userDTO를 백엔드에 보내주겠다.
        .then((response)=>{
            console.log("response: " , response);
            //alert("로그인 토큰 : " + response.token);
            if(response.token){ //null이 아니면 true
                //로컬 스토리지에 토큰 저장
                localStorage.setItem("ACCESS_TOKEN",response.token); //(Key,Value)로 저장
                //강제 이동
                window.location.href="/";
            }
        })
} //signin end

//로그아웃
export function signout(){
    localStorage.setItem("ACCESS_TOKEN",null);
    window.location.href="/login"
}

//회원생성
export function signup(userDTO){
    return call("/signup","POST",userDTO)
}

export function socialLogin(provider){
    // window.localStorage.origin : 현재웹페이지의 origin --> origin  : http://localhost:5000 ----프로토콜, 도메인, 포트번호 를 합친것을 origin이라고 한다.
    window.location.href=API_BASE_URL + "/auth/authorize/"+provider+"?redirect_url="+window.location.origin; 
}