import React, { useRef } from "react";
import * as _ from "lodash";
import data from "@/app/result.json";

import { HOST, SITE_THEME_COLOR } from "@/app/config";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconButton, useMediaQuery, useTheme } from "@mui/material";
import {
  Chart,
  GoogleChartWrapper,
  ReactGoogleChartEvent,
} from "react-google-charts";
import moment from "moment";

export default function Timeline({
  setTimelineEpisodeState,
  setFullImageSrc,
  isGifMode,
  setGifRangeStartEnd,
  setGifStartImageSrc,
  setGifEndImageSrc,
  setSegmentId,
  segmentIdRef,
  setFrameRangeStartEnd,
  setCurrentFrame,
}: {
  setTimelineEpisodeState: React.Dispatch<string>;
  setFullImageSrc: React.Dispatch<string>;
  isGifMode: boolean;
  setGifRangeStartEnd: React.Dispatch<[number, number]>;
  setGifStartImageSrc: React.Dispatch<string>;
  setGifEndImageSrc: React.Dispatch<string>;
  setSegmentId: React.Dispatch<number>;
  segmentIdRef: React.MutableRefObject<number>;
  setFrameRangeStartEnd: React.Dispatch<[number, number]>;
  setCurrentFrame: React.Dispatch<number>;
}) {
  const sg = data.result[segmentIdRef.current];
  const pos = sg.segment_id;
  const slice = getTimelineSlice(pos);
  const sliceRef = useRef(slice);
  sliceRef.current = slice;
  const isGifModeRef = useRef(isGifMode);
  isGifModeRef.current = isGifMode;
  const colors = [
    "#264c99",
    "#a52a0d",
    "#bf7200",
    "#0c7012",
    "#720072",
    "#007294",
    "#b72153",
    "#4c7f00",
    "#8a2222",
    "#244a6f",
    "#723372",
    "#197f72",
    "#7f7f0c",
    "#4c2699",
    "#ac5600",
    "#680505",
    "#4b0c4d",
    "#256d49",
    "#3f577c",
    "#2c2e81",
    "#895619",
    "#10a017",
    "#8a0e62",
    "#d30b79",
    "#754227",
    "#7e930e",
    "#1f5969",
    "#4c6914",
    "#8e7b0e",
    "#084219",
    "#57270c",
  ];
  const currentIndex = slice.findIndex((e) => {
    return sg.segment_id === e.segment_id;
  });
  const timeline = [
    [
      { type: "string", id: "sentence" },
      { type: "string", id: "text" },
      { type: "string", id: "style", role: "style" },
      { type: "string", role: "tooltip" },
      { type: "number", id: "Start" },
      { type: "number", id: "End" },
    ],
    ...slice.map((e, i) => [
      "台詞",
      (sg.segment_id === e.segment_id ? "> " : "") + e.text,
      colors[e.frame_start % colors.length],
      `<div style="padding: 4px">${e.text}</br>${e.frame_start}~${e.frame_end}</br>${formatFrameStamp(e.frame_start)}~${formatFrameStamp(e.frame_end)}</div>`,
      (e.frame_start / 23.98) * 1000,
      (e.frame_end / 23.98) * 1000,
    ]),
  ];

  const setNewSegment = (seg: any) => {
    const newSegmentId = seg.segment_id;
    if (newSegmentId >= 0 && newSegmentId < data.result.length) {
      sliceRef.current = getTimelineSlice(newSegmentId);
      setSegmentId(newSegmentId);
      segmentIdRef.current = newSegmentId;
    }
    setTimelineEpisodeState(seg.episode);
    if (isGifModeRef.current === true) {
      setGifRangeStartEnd([seg.frame_start, seg.frame_end]);
      setGifStartImageSrc(
        `${HOST}/image?frame=${seg.frame_start}&episode=${seg.episode}`,
      );
      setGifEndImageSrc(
        `${HOST}/image?frame=${seg.frame_end}&episode=${seg.episode}`,
      );
    } else {
      setFullImageSrc(
        `${HOST}/image?frame=${seg.frame_start}&episode=${seg.episode}`,
      );
    }
    setFrameRangeStartEnd([seg.frame_start, seg.frame_end]);
    setCurrentFrame(seg.frame_start);
  };

  const selectHandler = function ({
    chartWrapper,
    google,
  }: {
    chartWrapper: GoogleChartWrapper;
    google: any;
  }) {
    const chart = chartWrapper.getChart();
    const selection = chart.getSelection()[0]["row"];
    const seg = sliceRef.current[selection];
    setNewSegment(seg);
  };

  const selectEvent: ReactGoogleChartEvent = {
    eventName: "select",
    callback: selectHandler,
  };

  const theme = useTheme();
  const large: boolean = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <div style={{ background: "white" }}>
      <Chart
        style={{ marginTop: "8px" }}
        chartType="Timeline"
        data={timeline}
        options={{
          timeline: {
            groupByRowLabel: true,
          },
          tooltip: {
            isHtml: true,
          },
          avoidOverlappingGridLines: false,
        }}
        width="100dvw"
        height="100px"
        chartEvents={[selectEvent]}
      />
      <div
        style={{
          position: "fixed",
          bottom: large ? "2dvh" : "5dvh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <IconButton
          style={{ background: SITE_THEME_COLOR, color: "white" }}
          onClick={() => {
            const next = Math.min(
              Math.max(currentIndex - 2, 0),
              sliceRef.current.length,
            );
            setNewSegment(sliceRef.current[next]);
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <IconButton
          onClick={() => {
            const next = Math.min(
              Math.max(currentIndex + 2, 0),
              sliceRef.current.length,
            );
            setNewSegment(sliceRef.current[next]);
          }}
          style={{
            background: SITE_THEME_COLOR,
            color: "white",
            marginLeft: "32px",
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </div>
    </div>
  );
}

function getTimelineSlice(segmentId: number): any[] {
  const offset = 3;
  //clamp
  const start = Math.min(Math.max(segmentId - offset, 0), data.result.length);
  const end = Math.min(Math.max(segmentId + offset + 1, 0), data.result.length);
  const slice = data.result.slice(start, end);
  const textlessAndTextful: any[] = [];
  slice.forEach((e) => {
    textlessAndTextful.push(e);
    const textlessStart = e.frame_end + 1;
    const next = e.segment_id + 1;

    if (next > 0 && next < data.result.length) {
      const textlessEnd = data.result[next].frame_start - 1;
      if (textlessEnd > textlessStart) {
        textlessAndTextful.push({
          episode: e.episode,
          text: "",
          frame_start: textlessStart,
          frame_end: textlessEnd,
          segment_id: -1,
        });
      }
    }
  });
  return textlessAndTextful as any[];
}

function formatFrameStamp(frame: number): string {
  return moment.utc((frame / 23.98) * 1000).format("HH:mm:ss.SSS");
}
