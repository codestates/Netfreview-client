import axios from 'axios';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';

import BannerSlide from './BannerSlide';
import 'swiper/swiper.scss';
import 'swiper/components/navigation/navigation.scss';
import 'swiper/components/pagination/pagination.scss';
import 'swiper/components/scrollbar/scrollbar.scss';
import '../scss/Banner.scss';

type VideoInfo = {
  id: number;
  title: string;
  description: string;
  bannerUrl: string;
};

type BestReviewerInfo = {
  nickname: string;
  videoId: number;
};
function Banner() {
  SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);
  const {
    videoInfoList: { top5VideoList, lessReviewVidList },
    status,
  } = useSelector((state: RootState) => state.mainVideo);

  const [topVideo, setTopVideo] = useState<VideoInfo>({
    id: 0,
    title: '',
    description: '',
    bannerUrl: '',
  });
  const [lessVideo, setLessVideo] = useState<VideoInfo>({
    id: 0,
    title: '',
    description: '',
    bannerUrl: '',
  });
  const [bestReviewer, setBestReviewer] = useState<BestReviewerInfo>({
    nickname: '',
    videoId: 0,
  });

  useEffect(() => {
    axios
      .get('reviews/reviewKing')
      .then((res) => {
        const { user, video } = res.data;
        setBestReviewer({ nickname: user.nickname, videoId: video.id });
      })
      .catch((e) => console.log(e.response));
    if (status === 'idle') {
      top5VideoList && setTopVideo(top5VideoList[0]);
      lessReviewVidList && setLessVideo(lessReviewVidList[0]);
    }
    return () => {
      axios
        .get('reviews/reviewKing')
        .then((res) => {
          const { user, video } = res.data;
          setBestReviewer({ nickname: user.nickname, videoId: video.id });
        })
        .catch((e) => console.log(e.response));
      if (status === 'idle') {
        top5VideoList && setTopVideo(top5VideoList[0]);
        lessReviewVidList && setLessVideo(lessReviewVidList[0]);
      }
    };
  }, [top5VideoList, lessReviewVidList, status]);

  const autoPlay = {
    delay: 1000,
    disableOnInteraction: true,
  };
  return (
    <Swiper
      className="swiper-container"
      spaceBetween={0}
      slidesPerView={1}
      navigation //*
      pagination={{ clickable: true }} //*
      // onSwiper={(swiper) => console.log(swiper)}
      // onSlideChange={() => console.log('slide change')}
      loop={true}
      autoplay={{
        delay: 1000,
        disableOnInteraction: false,
      }}
      // style={{ height: '555px' }}
    >
      <div className="slide-container">
        <SwiperSlide data-swiper-autoplay="2000">
          <BannerSlide subTitle="넷프리뷰의 NO.1" video={topVideo} />
        </SwiperSlide>
        <SwiperSlide data-swiper-autoplay="2000">
          <BannerSlide subTitle="당신의 리뷰가 필요한" video={lessVideo} />
        </SwiperSlide>
        <SwiperSlide data-swiper-autoplay="2000">
          <section
            className="banner"
            style={{
              backgroundImage: `url(/images/banner3_bestReview.jpg)`,
            }}
          >
            <div className="bg-color">
              <div className="banner__container banner3">
                <article>
                  <p className="banner__subtitle banner3">
                    넷플리뷰 베스트 리뷰상
                  </p>
                  <h1 className="banner__title banner3">
                    {bestReviewer.nickname}
                  </h1>
                  <p className="banner__synopsis banner3">
                    넷플리뷰어들이 뽑은 베스트 리뷰어의 리뷰가 궁금하다면?!
                  </p>
                  <Link to={`/review/${bestReviewer.videoId}/?page=1`}>
                    <button className="btn-banner3">리뷰보러가기</button>
                  </Link>
                </article>
              </div>
            </div>
          </section>
        </SwiperSlide>
      </div>
      {/* <div className="swiper-button-wrap">
        <div className="swiper-button-next"></div>
        <div className="swiper-button-prev"></div>
      </div> */}
    </Swiper>
  );
}

export default Banner;
