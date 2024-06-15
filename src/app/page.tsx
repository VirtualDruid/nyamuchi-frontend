"use client";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { VirtuosoGrid, Virtuoso, GridComponents } from "react-virtuoso";
import * as _ from "lodash";
import moment from "moment";

import data from './result.json';

import CloseIcon from '@mui/icons-material/Close';
import { Tooltip, Slider, Chip } from "@mui/material";

import "./style.css";
const episodes = [
  "*", "1-3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"
]
const HOST = 'https://anon-tokyo.com';
const CDN = 'https://cdn.anon-tokyo.com';
//const API = 'https://api.anon-tokyo.com'
export default function Home() {

  const [segment, setSegment] = useState({ episode: "", frame_current: -1, frame_start: -1, farme_end: -1 })


  const [keyword, setKeyword] = useState("");
  const handleKeywordOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    setKeyword(e.currentTarget.value);
  }
  const [resultList, setResultList] = useState<any[]>([])

  const [episode, setEpisode] = useState("*");
  const handleEpisodeOnChange = (e: React.FormEvent<HTMLSelectElement>) => {
    setEpisode(e.currentTarget.value);
    setSegment({ ...segment, episode: episode })
  }

  const debounceFetchResultList = useCallback(
    _.debounce((keyword: string, episode: string) => {
      if (keyword.length !== 0) {
        getSearchResultList(keyword, episode).then((r) => {
          //console.log(keyword);
          //console.log(r);
          setResultList(r);
        })
      } else {
        setResultList([]);
      }

    }, 200), [])


  useEffect(() => {
    debounceFetchResultList(keyword, episode);
  }, [keyword, episode]);

  //const [fullImage, setFullImage] = useState({ isVisible: false, episode: "", src: "", start: 0, end: 0 });
  const [fullImageSrc, setFullImageSrc] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const [currentFrame, setCurrentFrame] = useState(segment.frame_current);


  return (
    <>
      <div style={{ position: "relative", width: "100%", height: "100%", backgroundColor: "rgb(51, 129, 175)" }}>

        <SearchResult resultList={resultList} setFullImageSrc={setFullImageSrc} setIsVisible={setIsVisible} setSegment={setSegment} setCurrentFrame={setCurrentFrame} />
        <div style={{ position: "fixed", top: "0px" }}>
          <input style={{ position: "relative", padding: "0.5rem", opacity: "0.7", top: "20px", left: "20px" }} placeholder="輸入台詞" value={keyword} onChange={handleKeywordOnChange}></input>
          <select style={{ position: "relative", padding: "0.5rem", opacity: "0.7", top: "20px", left: "20px" }} onChange={handleEpisodeOnChange}>
            {episodes.map((e) => { return <option value={e} key={e}>{e}</option> })}
          </select>
        </div>
        <FullImageContainer
          fullImageSrc={fullImageSrc}
          setFullImageSrc={setFullImageSrc}
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          segment={segment}
          setSegment={setSegment}
          currentFrame={currentFrame}
          setCurrentFrame={setCurrentFrame}>

        </FullImageContainer>

      </div>
    </>
  );
}

function FullImageContainer({ fullImageSrc, setFullImageSrc, isVisible, setIsVisible, segment, setSegment, currentFrame, setCurrentFrame }:
  {
    fullImageSrc: string,
    setFullImageSrc: React.Dispatch<any>,
    isVisible: boolean,
    setIsVisible: React.Dispatch<any>,
    segment: any,
    setSegment: React.Dispatch<any>,
    currentFrame: number,
    setCurrentFrame: React.Dispatch<any>
  }) {
  const debounceChangeCurrentFrame = useCallback(
    _.debounce((frame, episode) => {
      setFullImageSrc(`${HOST}/image?frame=${frame}&episode=${episode}`);
    }, 300),
    [])
  const handleCurrentFrameOnChange = (_:Event, value: number | number[], activeThumb: number) => {
    debounceChangeCurrentFrame(value, segment.episode);
    setCurrentFrame(value);
  }

  const handleFullImageOnChange = (e:Event) => {
    setFullImageSrc("");
    setIsVisible(false);
    setCurrentFrame(0);
  }
  return (
    <div style={{
      position: "fixed",
      top: "0px", left: "0px",
      width: "100%", height: "100%",
      display: "flex",
      alignContent: "center",
      justifyContent: "center",
      //transform: "translate(50%, 50%)",
      background: "rgba(0,0,0,0.5)",
      userSelect: "none",
      WebkitUserSelect: "none",
      msUserSelect: "none",
      visibility: isVisible ? "visible" : "hidden"
    }}>

      <div style={{
        width: "100dvw",
        height: "100dvw"
      }}>
        
        <img className="full-image" src={fullImageSrc} loading="lazy" />

        <CloseIcon
          onClick={handleFullImageOnChange}
          className="close-button" />
        <Slider
          sx={{
            '& .MuiSlider-thumb': {
              color: "rgb(51, 129, 175)"
            },
            '& .MuiSlider-track': {
              color: "rgb(51, 129, 175)",
              height: 8
            },
            '& .MuiSlider-rail': {
              color: "white",
              height: 20
            },
            '& .MuiSlider-active': {
              color: "rgb(51, 129, 175)"
            },
            '& .MuiSlider-mark': {
              color: "black",
              height: 2,
              width: 2
            },
            '& .MuiSlider-markActive': {
              color: "white",
              height: 2,
              width: 2
            }
          }}
          onChange={handleCurrentFrameOnChange}
          valueLabelDisplay="auto"
          style={{ marginLeft: "10dvw", marginRight: "10dvw", marginTop: "10dvh", width: "80dvw", height: "0px" }}
          value={currentFrame}
          marks
          step={1}
          min={segment.frame_start}
          max={segment.frame_end} />

        <Chip style={{ marginLeft: "10dvw" }} color="primary" sx={{ '& .MuiSlider-colorPrimary': "rgb(51, 129, 175)" }} label={`${currentFrame - segment.frame_start}/${segment.frame_end - segment.frame_start}`} />

      </div>


    </div>)
}
const gridComponents = {
  List: forwardRef(({ style, children, ...props }: { style: any, children: any }, ref: any) => (
    <div
      ref={ref}
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        ...style,
      }}
    >
      {children}
    </div>
  )),
  Item: ({ children }: { children: any }) => (
    <div className="result-item">
      {children}
    </div>
  )
}

function formatFrameStamp(frame: number): string {
  return moment.utc(frame / 23.98 * 1000).format("HH:mm:ss.SSS");
}
//rgb(51, 129, 175)
const ItemWrapper = ({ index, result, setFullImageSrc, setIsVisible, setSegment, setCurrentFrame }:
  {
    index: number,
    result: any,
    setFullImageSrc: React.Dispatch<any>,
    setIsVisible: React.Dispatch<any>,
    setSegment: React.Dispatch<any>,
    setCurrentFrame: React.Dispatch<any>
  }) => (
  <div style={{ width: "inherit" }}>

    <div style={{
      position: "absolute",
      display: "flex",
      flexWrap: "nowrap",
      width: "inherit",
      maxHeight: "calc(16px + 1.6rem)",
      textOverflow: "ellipsis",
      background: "rgba(0, 0, 0, 0.3)"
    }}>
      <span style={{ padding: "4px", fontSize: "0.8rem", color: "white", maxLines: "1", textOverflow: "ellipsis" }}>{`${index}`}</span>
      <span style={{ padding: "4px", fontSize: "0.8rem", color: "rgb(51, 129, 175)", maxLines: "1", textOverflow: "ellipsis" }}>{`${result.episode}`}</span>
      <span style={{ padding: "4px", fontSize: "0.8rem", color: "red", maxLines: "1", textOverflow: "ellipsis" }}>{`${result.frame_start} ~ ${result.frame_end}`}</span>
      <span style={{ padding: "4px", fontSize: "0.8rem", color: "white", maxLines: "1", textOverflow: "ellipsis" }}>{`${formatFrameStamp(result.frame_start)}`}</span>
    </div>

    <Tooltip title={<h1 style={{ fontSize: "18px" }}>{result.text}</h1>} arrow>
      <img className="result-item"
        onClick={function (e) {
          //initial set
          setFullImageSrc(`${HOST}/image?frame=${result.frame_start}&episode=${result.episode}`);
          setSegment({ episode: result.episode, frame_current: result.frame_start, frame_start: result.frame_start, frame_end: result.frame_end })
          setIsVisible(true);
          setCurrentFrame(result.frame_start);
        }}
        loading="lazy"
        src={`${CDN}/thumb/thumb/${result.episode}__${result.frame_start}.jpg`} />
    </Tooltip>

  </div>
);
/*
<div style={{ padding: "4px", background: "rgba(0, 0, 0, 0.3)", fontWeight: "900", color: "white", fontSize: "0.7rem" }}>{`${index}`}</div>
      <div style={{ padding: "4px", background: "rgba(0, 0, 0, 0.3)", fontSize: "0.7rem", color: "rgb(51, 129, 175)" }}>{`${result.episode}`}</div>
      <div style={{ padding: "4px", background: "rgba(0, 0, 0, 0.3)", fontSize: "0.7rem", color: "red" }}>{`${result.frame_start} ~ ${result.frame_end}`}</div>
      <div style={{ maxWidth:"25%", padding: "4px", background: "rgba(1.0, 0, 0, 0.3)", fontSize: "0.7rem", color: "white", textOverflow: "ellipsis" }}>{`${formatFrameStamp(result.frame_start)}`}</div>
 */
/*
<Tooltip title={<h1 style={{ fontSize: "18px" }}>{result.text}</h1>} arrow>
      <div style={{
        flex: 1,
        textAlign: "center",
        fontWeight: "900",
        fontSize: "16px",
        alignContent: "center",
        border: "1px dashed black",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }}>
        {`${result.text}`}
      </div>
    </Tooltip>
*/

function SearchResult({ resultList, setFullImageSrc, setIsVisible, setSegment, setCurrentFrame }:
  {
    resultList: any[],
    setFullImageSrc: React.Dispatch<any>,
    setIsVisible: React.Dispatch<any>,
    setSegment: React.Dispatch<any>,
    setCurrentFrame: React.Dispatch<any>
  }) {
  return (
    <>
      <VirtuosoGrid
        useWindowScroll
        style={{ height: "100%" }}
        totalCount={resultList.length}
        data={resultList}
        components={gridComponents as GridComponents}
        itemContent={(index, r) =>
        (<ItemWrapper
          index={index}
          result={r}
          setFullImageSrc={setFullImageSrc}
          setIsVisible={setIsVisible}
          setSegment={setSegment}
          setCurrentFrame={setCurrentFrame}>

        </ItemWrapper>)}
      />

      <style>{`html, body, #root { margin: 0; padding: 0 }`}</style>

    </>
  );
}


/*function SearchResult0({ keyword, episode, resultList }: { keyword: string, episode: string, resultList: any[] }) {
  //const [resultList, setResultList] = useState([])
  return (
    <Virtuoso className="!h-[100%]" data={resultList} itemContent={(index, result) => (<Result result={result} index={index} />)} />
  );
}*/

function Result({ result, index }: { result: any, index: number }) {
  return (<div className="result">{`${result.text}`}</div>)
}

function match(item: any, keyword: string, episode: string) {
  let ep: boolean = episode === '*' ? true : item.episode === episode;
  let text = item.text as string
  return (ep && text.toLowerCase().includes(keyword.toLowerCase())) === true;
}

/*async function getSearchResultList0(keyword: string, episode: string) {
  return await fetch(`${HOST}/api/search?keyword=${keyword}&episode=${episode}`)
    .then((r) => {
      if (r.ok) {
        return r.json();
      } else {
        return Promise.resolve({ result: [] })
      }

    });
}*/

async function getSearchResultList(keyword: string, episode: string) {
  return await Promise.resolve(data.result as any[]).then(function (r) {
    return Promise.resolve(r.filter((item: any) => match(item, keyword, episode)));
  });
}