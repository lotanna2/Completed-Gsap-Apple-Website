import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);
import { useEffect, useRef, useState } from "react";

import { hightlightsSlides } from "../constants"; // array of objects to display the videos and texts 
import { pauseImg, playImg, replayImg } from "../utils";

const VideoCarousel = () => {
  const videoRef = useRef([]); // elements that keeps track of the video we're on 
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);

  // video and indicator
  const [video, setVideo] = useState({ // we would answer all these questions periodically for the website
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });

  const [loadedData, setLoadedData] = useState([]); // for the state of the video
  const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video; 

  useGSAP(() => {
    // slider animation to move the video out of the screen and bring the next video in
    gsap.to("#slider", {
      transform: `translateX(${-100 * videoId}%)`,
      duration: 2,
      ease: "power2.inOut", // show visualizer https://gsap.com/docs/v3/Eases
    });

    // video animation to play the video when it is in the view
    gsap.to("#video", {
      scrollTrigger: {
        trigger: "#video", // video id
        toggleActions: "restart none none none", // when it first comes into view
      },
      onComplete: () => {
        setVideo((pre) => ({
          ...pre,
          startPlay: true,
          isPlaying: true, // all this is meant to set the video to start playing
        }));
      },
    });
  }, [isEnd, videoId]);

  useEffect(() => {
    let currentProgress = 0; // where are we in our video playing journey
    let span = videoSpanRef.current; // getting the span element of the currently playing video

    if (span[videoId]) {
      // animation to move the indicator (the span gotten of thw current video)
      let anim = gsap.to(span[videoId], {
        onUpdate: () => { // what happens when the anim updates
          // get the progress of the video
          const progress = Math.ceil(anim.progress() * 100);

          if (progress != currentProgress) {
            currentProgress = progress;

            // set the width of the progress bar
            gsap.to(videoDivRef.current[videoId], {
              width:
                window.innerWidth < 760
                  ? "10vw" // mobile
                  : window.innerWidth < 1200
                  ? "10vw" // tablet
                  : "4vw", // laptop
            });

            // set the background color of the progress bar
            gsap.to(span[videoId], {
              width: `${currentProgress}%`,
              backgroundColor: "white",
            });
          }
        },

        // when the video is ended, replace the progress bar with the indicator and change the background color
        onComplete: () => {
          if (isPlaying) {
            gsap.to(videoDivRef.current[videoId], {
              width: "12px",
            });
            gsap.to(span[videoId], {
              backgroundColor: "#afafaf",
            });
          }
        },
      });

      if (videoId == 0) {
        anim.restart();
      }

      // update the progress bar
      const animUpdate = () => {
        anim.progress(
          videoRef.current[videoId].currentTime /
            hightlightsSlides[videoId].videoDuration
        );
      };

      if (isPlaying) {
        // ticker to update the progress bar
        gsap.ticker.add(animUpdate);
      } else {
        // remove the ticker when the video is paused (progress bar is stopped)
        gsap.ticker.remove(animUpdate);
      }
    }
  }, [videoId, startPlay]);

  useEffect(() => {
    if (loadedData.length > 3) {
      if (!isPlaying) {
        videoRef.current[videoId].pause();
      } else {
        startPlay && videoRef.current[videoId].play();
      }
    }
  }, [startPlay, videoId, isPlaying, loadedData]);

  // vd id is the id for every video until id becomes number 3
  const handleProcess = (type, i) => {
    switch (type) { // handles the process of the videos
      case "video-end":
        setVideo((pre) => ({ ...pre, isEnd: true, videoId: i + 1 })); // video-end takes you to the next video
        break;

      case "video-last":
        setVideo((pre) => ({ ...pre, isLastVideo: true })); // last video is the end 
        break;

      case "video-reset":
        setVideo((pre) => ({ ...pre, videoId: 0, isLastVideo: false })); // videoID is set to 0 and set islastvideo to faulse
        break; 

      case "pause":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;

      case "play":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;

      default:
        return video;
    }
  };

  const handleLoadedMetaData = (i, e) => setLoadedData((pre) => [...pre, e]); // this handles the loadedmeta data function to allow the videos to start playing from the useEffect

  return (
    <>
      <div className="flex items-center">
        {hightlightsSlides.map((list, i) => ( //the highlight slide is mapping through the video and text data 
          <div key={list.id} id="slider" className="sm:pr-20 pr-10" > 
            <div className="video-carousel_container" // entire contianer for the courousel areas
            >
              <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black" // the black rectangle where the video goes 
              >
                <video // the video tag calling the videos
                  id="video" // for targetting it
                  playsInline={true}
                  className={`${
                    list.id === 2 && "translate-x-44"
                  } pointer-events-none`}
                  preload="auto" // preload class
                  muted
                  ref={(el) => (videoRef.current[i] = el)} // we're finding a specific index within the videoRef array and setting it to the VIDEO element 
                  onEnded={() => // handles the what happens when the video ends
                    i !== 3 // '3' is the length of the video
                      ? handleProcess("video-end", i)
                      : handleProcess("video-last")
                  }
                  onPlay={() => // handles when the video is playing 
                    setVideo((pre) => ({ ...pre, isPlaying: true }))
                  }
                  onLoadedMetadata={(e) => handleLoadedMetaData(i, e)} // this triggers the  const handleLoadedMetaData > then the useEffect
                >
                  <source src={list.video} type="video/mp4" />
                </video>
              </div>

              <div className="absolute top-12 left-[5%] z-10" // div for text untop of it
              >
                {list.textLists.map((text, i) => ( // this displays text, passing through the list 
                  <p key={i} className="md:text-2xl text-xl font-medium" // stying for the text
                  >
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative flex-center mt-10">
        <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full" // makes the round rectangle pill
        >
          {videoRef.current.map((_, i) => ( // mapping through the videRefs for every video
            <span
              key={i}
              className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
              ref={(el) => (videoDivRef.current[i] = el)} // whenever we have a new element, add it to the Ref
            >
              <span
                className="absolute h-full w-full rounded-full"
                ref={(el) => (videoSpanRef.current[i] = el)}
              />
            </span>
          ))}
        </div>

        <button className="control-btn" // the button that handles the pause and replay
        > 
          <img
            src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
            alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
            onClick={
              isLastVideo
                ? () => handleProcess("video-reset")
                : !isPlaying
                ? () => handleProcess("play")
                : () => handleProcess("pause")
            }
          />
        </button>
      </div>
    </>
  );
};

export default VideoCarousel;
