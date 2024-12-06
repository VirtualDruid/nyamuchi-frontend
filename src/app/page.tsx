"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as _ from "lodash";

import data from "@/app/result.json";
import { episodes, SITE_THEME_COLOR, HINT_LINK } from "./config";
import { Chip, NoSsr } from "@mui/material";

import SearchResult from "@/app/components/SearchResult";
import FullImageContainer from "@/app/components/image-container/FullImageContainer";

import "@/app/style.css";
import {
  clearExternalParam,
  clearPageStateFromUrlHash,
  containAnyHash,
  getPageStateFromUrlHash,
  mergePageState,
  setPageStateToUrlHash,
} from "./url-hash";
import { AddLinkOutlined } from "@mui/icons-material";

/* const episodes = [
  "*", "1-3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"
]
const HOST = 'https://anon-tokyo.com';
const CDN = 'https://cdn.anon-tokyo.com';

const SITE_THEME_COLOR = '#3381AF';
const THUMB_PATH = "thumb" */

//const API = 'https://api.anon-tokyo.com'

export default function Home() {
  const hasAnyHash = containAnyHash();
  //const [segment, setSegment] = useState({ episode: "", frame_current: -1, frame_start: -1, frame_end: -1, segment_id: -1, is_visible: false});
  const [appendPageState, setAppendPageState]: [
    boolean,
    React.Dispatch<boolean>,
  ] = useState(false);
  const pageStateRef = useRef(getPageStateFromUrlHash());
  const [keyword, setKeyword]: [string, React.Dispatch<string>] = useState(
    () =>
      _.isString(pageStateRef.current.keyword)
        ? pageStateRef.current.keyword
        : "",
  );
  const handleKeywordOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    setKeyword(e.currentTarget.value);
  };
  const [resultList, setResultList] = useState<any[]>([]);

  const [episode, setEpisode]: [string, React.Dispatch<string>] = useState(
    () =>
      _.isString(pageStateRef.current.episode)
        ? pageStateRef.current.episode
        : "*",
  );
  const handleEpisodeOnChange = (e: React.FormEvent<HTMLSelectElement>) => {
    setEpisode(e.currentTarget.value);
  };

  const debounceFetchResultList = useCallback(
    _.debounce((keyword: string, episode: string) => {
      if (keyword.length !== 0) {
        getSearchResultList(keyword, episode).then((r) => {
          setResultList(r);
        });
      } else {
        setResultList([]);
      }
    }, 200),
    [],
  );

  useEffect(() => {
    debounceFetchResultList(keyword, episode);
  }, [keyword, episode]);

  const [fullImageSrc, setFullImageSrc] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const [currentFrame, setCurrentFrame] = useState(-1);

  const [segmentId, setSegmentId] = useState(0);

  //episode can be "*" wildcard, but timeline needs to be specific episode
  const [timelineEpisodeState, setTimelineEpisodeState] = useState(episodes[1]);

  const [frameRangeStartEnd, setFrameRangeStartEnd] = useState([-1, -1] as [
    number,
    number,
  ]);

  const segmentIdRef = useRef(0);

  useEffect(() => {
    const state = {
      keyword: keyword,
      episode: episode,
    };
    clearExternalParam();
    mergePageState(state, pageStateRef);

    if (appendPageState) {
      setPageStateToUrlHash(pageStateRef);
    } else {
      clearPageStateFromUrlHash();
    }

    //console.log(JSON.stringify(pageStateRef.current));
  }, [keyword, episode, appendPageState]);

  return (
    <NoSsr>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: SITE_THEME_COLOR,
        }}
      >
        <SearchResult
          resultList={resultList}
          setTimelineEpisodeState={setTimelineEpisodeState}
          setFullImageSrc={setFullImageSrc}
          setIsVisible={setIsVisible}
          setSegmentId={setSegmentId}
          segmentIdRef={segmentIdRef}
          setFrameRangeStartEnd={setFrameRangeStartEnd}
          setCurrentFrame={setCurrentFrame}
        />
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "20px",
            display: "flex",
          }}
        >
          <input
            style={{
              position: "relative",
              padding: "0.5rem",
              opacity: "0.7",
              maxWidth: "25dvw",
            }}
            placeholder="輸入台詞"
            value={keyword}
            onChange={handleKeywordOnChange}
          />
          <select
            style={{ position: "relative", padding: "0.5rem", opacity: "0.7" }}
            onChange={handleEpisodeOnChange}
          >
            {episodes.map((e) => {
              return (
                <option value={e} key={e}>
                  {e}
                </option>
              );
            })}
          </select>

          <div
            style={{
              background: "white",
              opacity: "0.7",
              marginLeft: "1dvw",
              alignContent: "center",
              justifyContent: "center",
              paddingLeft: "1dvw",
              paddingRight: "1dvw",
            }}
          >
            <AddLinkOutlined />
            <input
              id="check-box-append-page-state"
              type="checkbox"
              checked={appendPageState}
              onChange={(e) => setAppendPageState(e.currentTarget.checked)}
            />
          </div>
        </div>
        <Chip
          style={{ position: "absolute", top: "20px", right: "20px" }}
          sx={{ backgroundColor: "white", opacity: "0.7" }}
          label={
            <a href={HINT_LINK} target="_blank">
              {"說明"}
            </a>
          }
        />

        {
          <FullImageContainer
            timelineEpisodeState={timelineEpisodeState}
            setTimelineEpisodeState={setTimelineEpisodeState}
            fullImageSrc={fullImageSrc}
            setFullImageSrc={setFullImageSrc}
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            setSegmentId={setSegmentId}
            segmentIdRef={segmentIdRef}
            frameRangeStartEnd={frameRangeStartEnd}
            setFrameRangeStartEnd={setFrameRangeStartEnd}
            currentFrame={currentFrame}
            setCurrentFrame={setCurrentFrame}
          ></FullImageContainer>
        }
      </div>
    </NoSsr>
  );
}

function match(item: any, keyword: string, episode: string) {
  let ep: boolean = episode === "*" ? true : item.episode === episode;
  let text = item.text as string;
  let text_sim = item.text_sim as string;
  let textMatch = text.toLowerCase().includes(keyword.toLowerCase());
  let textSimMatch = text_sim.toLowerCase().includes(keyword.toLowerCase());
  return (ep && (textMatch || textSimMatch)) === true;
}

async function getSearchResultList(keyword: string, episode: string) {
  return await Promise.resolve(data.result as any[]).then(function (r) {
    return Promise.resolve(
      r.filter((item: any) => match(item, keyword, episode)),
    );
  });
}
