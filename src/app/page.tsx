"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as _ from "lodash";

import data from "./result.json";
import data_a from "./result_a.json"
import { EPISODE_CHOICE, SITE_THEME_COLOR_1, HINT_LINK, HOST, SITE_THEME_COLOR_2 } from "./config";
import { Checkbox, Chip, NoSsr } from "@mui/material";

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
import dynamic from "next/dynamic";

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

  const [episodeChoice, setEpisodeChoice]: [string, React.Dispatch<string>] = useState(
    () =>
      _.isString(pageStateRef.current.episode)
        ? pageStateRef.current.episode
        : "*",
  );
  const handleEpisodeChoiceOnChange = (e: React.FormEvent<HTMLSelectElement>) => {
    setEpisodeChoice(e.currentTarget.value);
    //setSegment({ ...segment, episode: episode })
    const color = e.currentTarget.value.includes("AveMujica") ? SITE_THEME_COLOR_2 : SITE_THEME_COLOR_1;
    setThemeColor(color);
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
    debounceFetchResultList(keyword, episodeChoice);
  }, [keyword, episodeChoice]);

  const [fullImageSrc, setFullImageSrc] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const [currentFrame, setCurrentFrame] = useState(-1);

  const [segmentId, setSegmentId] = useState(0);

  //episode can be "*" wildcard, but timeline needs to be specific episode
  const [timelineEpisodeState, setTimelineEpisodeState] = useState(EPISODE_CHOICE[1]);

  const [frameRangeStartEnd, setFrameRangeStartEnd] = useState([-1, -1] as [
    number,
    number,
  ]);

  const segmentIdRef = useRef(0);

  useEffect(() => {
    const state = {
      keyword: keyword,
      episode: episodeChoice,
    };
    clearExternalParam();
    mergePageState(state, pageStateRef);

    if (appendPageState) {
      setPageStateToUrlHash(pageStateRef);
    } else {
      clearPageStateFromUrlHash();
    }

    //console.log(JSON.stringify(pageStateRef.current));
  }, [keyword, episodeChoice, appendPageState]);
  const [themeColor, setThemeColor]: [string, React.Dispatch<string>] = useState(episodeChoice.includes("AveMujica") ? SITE_THEME_COLOR_2 : SITE_THEME_COLOR_1);
  return (
    <NoSsr>
      <div
        id="root-container"
        style={{
          position: "relative",
          width: "100dvw",
          height: "100dvh",
          backgroundColor: themeColor,
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
            onChange={handleEpisodeChoiceOnChange}
          >
            {EPISODE_CHOICE.map((e) => {
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

/* function match(item: any, keyword: string, episode: string) {
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
}*/

/*function match(item: any, keyword: string, episode: string) {
  let ep: boolean = episode === "*" ? true : item.episode === episode;
  let text = item.text as string;
  let text_sim = item.text_sim as string;
  let textMatch = text.toLowerCase().includes(keyword.toLowerCase());
  let textSimMatch = text_sim.toLowerCase().includes(keyword.toLowerCase());
  return (ep && (textMatch || textSimMatch)) === true;
}*/

function lowerCaseContainsKeyword(item: any, keyword: string): boolean {
  let text = item.text;
  let textMatch = text.toLowerCase().includes(keyword.toLowerCase());
  return textMatch === true;
}

async function getSearchResultList(keyword: string, episode: string): Promise<any[]> {
  return await Promise.resolve(data_a as any).then(function (d) {
    let result: any[] = [];
    console.log(keyword);
    if (episode.includes("*")) {
      //wildcard
      EPISODE_CHOICE.forEach((choice) => {
        if (choice.includes(episode.replace("*", ""))) {
          let matched: any[] = (d[choice] ?? []).filter((row: any) => lowerCaseContainsKeyword(row, keyword));
          result = result.concat(matched);
        }
      })
    } else {
      //specific episode
      let matched: any[] = d[episode].filter((row: any) => lowerCaseContainsKeyword(row, keyword));
      result = result.concat(matched);
    }
    console.log(JSON.stringify(result));
    return Promise.resolve(
      result
    );
  });
}

