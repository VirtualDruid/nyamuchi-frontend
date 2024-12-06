import React, { useCallback } from "react";
import * as _ from "lodash";
import { useState } from "react";

import { HOST, SITE_THEME_COLOR } from "@/app/config";
import CloseIcon from "@mui/icons-material/Close";
import {
  Tooltip,
  Slider,
  Chip,
  Switch,
  FormControlLabel,
  Button,
  Input,
  useMediaQuery,
  useTheme,
  NoSsr,
} from "@mui/material";

import "@/app/style.css";
import { ArrowDownward, FastForward, FastRewind } from "@mui/icons-material";

import Timeline from "./Timeline";

//because we are using window.location.hash to get page state
//this has to be full client side to prevent mismatch

export default function FullImageContainer({
  timelineEpisodeState,
  setTimelineEpisodeState,
  fullImageSrc,
  setFullImageSrc,
  isVisible,
  setIsVisible,
  setSegmentId,
  segmentIdRef,
  frameRangeStartEnd,
  setFrameRangeStartEnd,
  currentFrame,
  setCurrentFrame,
}: {
  timelineEpisodeState: string;
  setTimelineEpisodeState: React.Dispatch<string>;
  fullImageSrc: string;
  setFullImageSrc: React.Dispatch<string>;
  isVisible: boolean;
  setIsVisible: React.Dispatch<boolean>;
  setSegmentId: React.Dispatch<number>;
  segmentIdRef: React.MutableRefObject<number>;
  frameRangeStartEnd: [number, number];
  setFrameRangeStartEnd: React.Dispatch<[number, number]>;
  currentFrame: number;
  setCurrentFrame: React.Dispatch<number>;
}) {
  const [isGifMode, setIsGifMode] = useState(false);
  const [gifStartImageSrc, setGifStartImageSrc] = useState("");
  const [gifEndImageSrc, setGifEndImageSrc] = useState("");
  const [gifRangeStartEnd, setGifRangeStartEnd] = useState([-1, -1] as [
    number,
    number,
  ]);

  const theme = useTheme();
  const large: boolean = useMediaQuery(theme.breakpoints.up("sm"));

  const debounceChangeCurrentFrame = useCallback(
    _.debounce((frame: number, episode: string) => {
      setFullImageSrc(`${HOST}/image?frame=${frame}&episode=${episode}`);
    }, 300),
    [],
  );
  const debounceChangeGifStart = useCallback(
    _.debounce((frame: number, episode: string) => {
      setGifStartImageSrc(`${HOST}/image?frame=${frame}&episode=${episode}`);
    }, 300),
    [],
  );
  const debounceChangeGifEnd = useCallback(
    _.debounce((frame: number, episode: string) => {
      setGifEndImageSrc(`${HOST}/image?frame=${frame}&episode=${episode}`);
    }, 300),
    [],
  );

  const handleSliderOnChange = (
    _: Event,
    value: number | number[],
    activeThumb: number,
  ) => {
    if (isGifMode === true) {
      debounceChangeGifStart((value as number[])[0], timelineEpisodeState);
      debounceChangeGifEnd((value as number[])[1], timelineEpisodeState);
      setGifRangeStartEnd(value as [number, number]);
    } else {
      debounceChangeCurrentFrame(value as number, timelineEpisodeState);
      setCurrentFrame(value as number);
    }
  };

  const handleGifStartInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const start = parseInt(event.target.value);
    debounceChangeGifStart(start, timelineEpisodeState);
    //const end = gifRangeStartEnd[1];
    //const delta = Math.max(start, end) - Math.min(start, end);
    setGifRangeStartEnd([start, gifRangeStartEnd[1]]);
  };

  const handleGifEndInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const end = parseInt(event.target.value);
    debounceChangeGifEnd(end, timelineEpisodeState);
    //const start = gifRangeStartEnd[0];
    //const delta = Math.max(start, end) - Math.min(start, end);
    setGifRangeStartEnd([gifRangeStartEnd[0], end]);
  };

  const handleIsGifModeOnChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setIsGifMode(event.target.checked);
    if (event.target.checked === true) {
      setGifRangeStartEnd([...frameRangeStartEnd]);
      setGifStartImageSrc(
        `${HOST}/image?frame=${frameRangeStartEnd[0]}&episode=${timelineEpisodeState}`,
      );
      setGifEndImageSrc(
        `${HOST}/image?frame=${frameRangeStartEnd[1]}&episode=${timelineEpisodeState}`,
      );
    }
  };

  const handleGifGenerateOnClick = (
    event: React.UIEvent<HTMLButtonElement>,
  ) => {
    setFullImageSrc(
      `${HOST}/gif?start=${gifRangeStartEnd[0]}&end=${gifRangeStartEnd[1]}&episode=${timelineEpisodeState}`,
    );
  };

  const handleReverseOnClick = (event: React.UIEvent<HTMLButtonElement>) => {
    setGifStartImageSrc(
      `${HOST}/image?frame=${gifRangeStartEnd[1]}&episode=${timelineEpisodeState}`,
    );
    setGifEndImageSrc(
      `${HOST}/image?frame=${gifRangeStartEnd[0]}&episode=${timelineEpisodeState}`,
    );
    setGifRangeStartEnd([gifRangeStartEnd[1], gifRangeStartEnd[0]]);
  };

  //const segment = data.result[segmentId];

  const delta = Math.abs(gifRangeStartEnd[0] - gifRangeStartEnd[1]);

  const isGifValidRange: boolean =
    delta <= 240 && gifRangeStartEnd[0] >= 0 && gifRangeStartEnd[1] >= 1;

  const sliderMin = frameRangeStartEnd[0] + (isGifMode ? -120 : 0);
  const sliderMinClamp = Math.max(sliderMin, 0);
  const sliderMax = frameRangeStartEnd[1] + (isGifMode ? 120 : 0);
  const sliderMaxClamp = sliderMax;

  const isReverse: boolean = gifRangeStartEnd[0] > gifRangeStartEnd[1];

  const preventScrollChangeInput = (e: React.WheelEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).blur();
    e.stopPropagation();
    e.preventDefault();
  };
  return (
    <NoSsr>
      <div
        style={{
          position: "fixed",
          top: "0px",
          left: "0px",
          width: "100%",
          height: "100%",
          display: "flex",
          alignContent: "center",
          justifyContent: "center",
          //transform: "translate(50%, 50%)",
          background: "rgba(0, 0, 0, 0.5)",
          userSelect: "none",
          WebkitUserSelect: "none",
          msUserSelect: "none",
          visibility: isVisible === true ? "visible" : "hidden",
        }}
      >
        <div
          style={{
            width: "100dvw",
            height: "100dvw",
          }}
        >
          <div
            className="image-container"
            style={{
              background: "black",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              id="gif-start-end-container"
              style={{
                marginLeft: isGifMode ? "0.5dvw" : "0dvw",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <FormControlLabel
                className="gif-mode-switch"
                sx={{
                  "& .MuiFormControlLabel-label": {
                    color: isGifMode ? "red" : "white",
                  },
                }}
                control={
                  <Switch
                    checked={isGifMode}
                    onChange={handleIsGifModeOnChange}
                  />
                }
                label={isGifMode ? "GIF ON" : "GIF OFF"}
              />

              <img
                id="gif-start-frame"
                src={gifStartImageSrc}
                className={
                  isGifMode && isVisible
                    ? "gif-start-end-frame-image-visible"
                    : "gif-start-end-frame-image-hidden"
                }
                loading="lazy"
              />

              <Input
                id="input-gif-start"
                className={
                  isGifMode
                    ? "gif-start-end-input-visible"
                    : "gif-start-end-input-hidden"
                }
                style={{
                  background: "white",
                  color: isGifValidRange ? "black" : "red",
                }}
                type="number"
                value={gifRangeStartEnd[0]}
                error={isGifValidRange === false}
                onWheel={preventScrollChangeInput}
                onChange={handleGifStartInputChange}
              />

              <img
                id="gif-end-frame"
                src={gifEndImageSrc}
                className={
                  isGifMode && isVisible
                    ? "gif-start-end-frame-image-visible"
                    : "gif-start-end-frame-image-hidden"
                }
                loading="lazy"
              />

              <Input
                id="input-gif-end"
                className={
                  isGifMode
                    ? "gif-start-end-input-visible"
                    : "gif-start-end-input-hidden"
                }
                style={{
                  background: "white",
                  color: isGifValidRange ? "black" : "red",
                }}
                type="number"
                value={gifRangeStartEnd[1]}
                error={isGifValidRange === false}
                onWheel={preventScrollChangeInput}
                onChange={handleGifEndInputChange}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Button
                variant="contained"
                color={isGifValidRange ? "primary" : "error"}
                sx={{
                  backgroundColor: "white",
                  color: "black",
                }}
                onClick={handleGifGenerateOnClick}
                endIcon={isGifValidRange ? <ArrowDownward /> : <CloseIcon />}
                disabled={isGifValidRange === false}
                className={
                  isGifMode && isVisible
                    ? "generate-button-visible"
                    : "generate-button-hidden"
                }
              >
                {"點擊產生GIF (最多10秒/240幀)"}
              </Button>

              <img
                id="result-image"
                className={isGifMode ? "full-image-gif-mode-on" : "full-image"}
                src={fullImageSrc}
                loading="lazy"
              />

              <Button
                variant="contained"
                sx={{
                  backgroundColor: "white",
                  color: "black",
                }}
                startIcon={isReverse ? <FastRewind /> : <FastForward />}
                onClick={handleReverseOnClick}
                className={
                  isGifMode && isVisible
                    ? "generate-button-visible"
                    : "generate-button-hidden"
                }
              >
                {`倒轉 ${gifRangeStartEnd[0]} ~ ${gifRangeStartEnd[1]} (${(
                  delta / 24
                ).toFixed(3)}秒 / ${delta}幀)`}
              </Button>
            </div>
            <CloseIcon
              className="close-button"
              sx={{
                width: "10dvh",
                height: "10dvh",
              }}
              onClick={function (e) {
                setFullImageSrc("");
                setIsVisible(false);
                setIsGifMode(false);
                //setSegment({is_visible: false, ...segment})
                setCurrentFrame(0);
              }}
            />
          </div>

          {
            <Tooltip
              title={`${frameRangeStartEnd[0]}~${frameRangeStartEnd[1]} ${currentFrame}`}
            >
              <Chip
                style={{
                  position: large ? "absolute" : "relative",
                  left: large ? "0dvw" : "45dvw",
                }}
                sx={{ backgroundColor: SITE_THEME_COLOR, color: "white" }}
                label={`${currentFrame - frameRangeStartEnd[0]}/${
                  frameRangeStartEnd[1] - frameRangeStartEnd[0]
                }`}
              />
            </Tooltip>
          }
          <Slider
            id="frame-slider"
            sx={{
              "& .MuiSlider-thumb": {
                color: SITE_THEME_COLOR,
              },
              "& .MuiSlider-track": {
                color: SITE_THEME_COLOR,
                height: 8,
              },
              "& .MuiSlider-rail": {
                color: "white",
                height: 20,
              },
              "& .MuiSlider-active": {
                color: SITE_THEME_COLOR,
              },
              "& .MuiSlider-mark": {
                color: "black",
                height: 2,
                width: 2,
              },
              "& .MuiSlider-markActive": {
                color: "white",
                height: 2,
                width: 2,
              },
              "& .MuiSlider-valueLabel": {
                backgroundColor: SITE_THEME_COLOR,
                color: "white",
              },
            }}
            onChange={handleSliderOnChange}
            valueLabelDisplay="on"
            style={{
              marginTop: "7dvh",
              marginLeft: "10dvw",
              marginRight: "10dvw",
              width: "80dvw",
              height: "0px",
            }}
            value={isGifMode ? gifRangeStartEnd : currentFrame}
            marks
            step={1}
            min={sliderMinClamp}
            max={sliderMaxClamp}
          />

          <Timeline
            setTimelineEpisodeState={setTimelineEpisodeState}
            setFullImageSrc={setFullImageSrc}
            isGifMode={isGifMode}
            setGifRangeStartEnd={setGifRangeStartEnd}
            setGifStartImageSrc={setGifStartImageSrc}
            setGifEndImageSrc={setGifEndImageSrc}
            setSegmentId={setSegmentId}
            setCurrentFrame={setCurrentFrame}
            setFrameRangeStartEnd={setFrameRangeStartEnd}
            segmentIdRef={segmentIdRef}
          />
        </div>
      </div>
    </NoSsr>
  );
}
