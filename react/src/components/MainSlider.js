import { SwiperSlide } from "swiper/react";
import ImgSliderData from "../img/test/ImgSliderData";
import Swiper from "swiper";
import { Autoplay, Navigation, Pagination} from "swiper/modules";

const Slider = () => {
    return(
        <Swiper
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={"auto"}
            spaceBetween={10}				//슬라이드 간격
            autoplay={{
                delay: 100,				//자동 시간
                disableOnInteraction: false,//스와이프 후 자동재생
            }} 
            loop={true}					//반복
            height={800}
            pagination={{ type: "fraction" }}
            navigation={true}
            modules={[Autoplay, Pagination, Navigation]} //modules에 기능 넣기
        >
            {ImgSliderData?.map((slideData) => {
                return (
                <SwiperSlide key={slideData.id}>
                    <img src={slideData.src} alt="slideImg"/>
                </SwiperSlide>
                );
            })}
        </Swiper>
    )
}

export default Slider;