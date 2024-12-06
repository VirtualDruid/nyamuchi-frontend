"use client";
import React, { forwardRef } from "react";
import { VirtuosoGrid, Virtuoso, GridComponents } from "react-virtuoso";
import * as _ from "lodash";
import moment from "moment";

import { HOST, CDN, SITE_THEME_COLOR, THUMB_PATH } from "@/app/config";
import { Tooltip, Chip } from "@mui/material";

export default function SearchResult({
  resultList,
  setTimelineEpisodeState,
  setFullImageSrc,
  setIsVisible,
  setSegmentId,
  segmentIdRef,
  setFrameRangeStartEnd: setFrameStartEnd,
  setCurrentFrame,
}: {
  resultList: any[];
  setTimelineEpisodeState: React.Dispatch<string>;
  setFullImageSrc: React.Dispatch<string>;
  setIsVisible: React.Dispatch<boolean>;
  setSegmentId: React.Dispatch<number>;
  segmentIdRef: React.MutableRefObject<number>;
  setFrameRangeStartEnd: React.Dispatch<[number, number]>;
  setCurrentFrame: React.Dispatch<number>;
}) {
  return (
    <>
      <VirtuosoGrid
        useWindowScroll
        style={{ height: "100%" }}
        totalCount={resultList.length}
        data={resultList}
        components={gridComponents as GridComponents}
        itemContent={(index, r) => (
          <ItemWrapper
            index={index}
            result={r}
            setTimelineEpisodeState={setTimelineEpisodeState}
            setFullImageSrc={setFullImageSrc}
            setIsVisible={setIsVisible}
            setSegmentId={setSegmentId}
            segmentIdRef={segmentIdRef}
            setFrameStartEnd={setFrameStartEnd}
            setCurrentFrame={setCurrentFrame}
          ></ItemWrapper>
        )}
      />

      <style>{`html, body, #root { margin: 0; padding: 0 }`}</style>
    </>
  );
}

//rgb(51, 129, 175)
const ItemWrapper = ({
  index,
  result,
  setTimelineEpisodeState,
  setFullImageSrc,
  setIsVisible,
  //setSegment,
  setSegmentId,
  segmentIdRef,
  setFrameStartEnd,
  setCurrentFrame,
}: {
  index: number;
  result: any;
  setTimelineEpisodeState: React.Dispatch<string>;
  setFullImageSrc: React.Dispatch<string>;
  setIsVisible: React.Dispatch<boolean>;
  //setSegment: React.Dispatch<any>,
  setSegmentId: React.Dispatch<number>;
  segmentIdRef: React.MutableRefObject<number>;
  setFrameStartEnd: React.Dispatch<[number, number]>;
  setCurrentFrame: React.Dispatch<number>;
}) => (
  <div style={{ width: "inherit" }}>
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexWrap: "nowrap",
        width: "inherit",
        maxHeight: "calc(16px + 1.6rem)",
        textOverflow: "ellipsis",
        background: "rgba(0, 0, 0, 0.3)",
      }}
    >
      <span
        style={{
          padding: "4px",
          fontSize: "0.8rem",
          color: "white",
          maxLines: "1",
          textOverflow: "ellipsis",
        }}
      >{`${index}`}</span>
      <span
        style={{
          padding: "4px",
          fontSize: "0.8rem",
          color: SITE_THEME_COLOR,
          maxLines: "1",
          textOverflow: "ellipsis",
        }}
      >{`${result.episode}`}</span>
      <span
        style={{
          padding: "4px",
          fontSize: "0.8rem",
          color: "red",
          maxLines: "1",
          textOverflow: "ellipsis",
        }}
      >{`${result.frame_start} ~ ${result.frame_end}`}</span>
      <span
        style={{
          padding: "4px",
          fontSize: "0.8rem",
          color: "white",
          maxLines: "1",
          textOverflow: "ellipsis",
        }}
      >{`${formatFrameStamp(result.frame_start)}`}</span>
    </div>

    <Tooltip title={<h1 style={{ fontSize: "18px" }}>{result.text}</h1>} arrow>
      <img
        className="result-item"
        onClick={function (e) {
          //initial set
          setTimelineEpisodeState(result.episode);
          setFullImageSrc(
            `${HOST}/image?frame=${result.frame_start}&episode=${result.episode}`,
          );
          setIsVisible(true);
          setSegmentId(result.segment_id);
          setFrameStartEnd([result.frame_start, result.frame_end]);
          setCurrentFrame(result.frame_start);
          segmentIdRef.current = result.segment_id;
        }}
        loading="lazy"
        src={`${CDN}/thumb/${THUMB_PATH}/${result.episode}__${result.frame_start}.jpg`}
      />
    </Tooltip>
  </div>
);

const gridComponents = {
  List: forwardRef(
    (
      { style, children, ...props }: { style: any; children: any },
      ref: any,
    ) => (
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
    ),
  ),
  Item: ({ children }: { children: any }) => (
    <div className="result-item">{children}</div>
  ),
};

function formatFrameStamp(frame: number): string {
  return moment.utc((frame / 23.98) * 1000).format("HH:mm:ss.SSS");
}
