"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const TIKTOK_TRANSITION_MS = 720;

function wrapIndex(index, total) {
  if (total === 0) {
    return 0;
  }

  return (index + total) % total;
}

function getLayoutMode(width) {
  if (width <= 640) {
    return "mobile";
  }

  if (width <= 1100) {
    return "tablet";
  }

  return "desktop";
}

// Each viewport mode maps every card into one reusable depth state so cards
// can transition between layers without changing the underlying video data.
function getCardPosition(index, activeIndex, total, layoutMode) {
  const forward = wrapIndex(index - activeIndex, total);

  if (layoutMode === "mobile") {
    return forward === 0 ? "center" : "hidden";
  }

  if (layoutMode === "tablet") {
    if (forward === 0) {
      return "center";
    }

    if (forward === 1) {
      return "right";
    }

    if (forward === total - 1) {
      return "left";
    }

    return "hidden";
  }

  if (forward === 0) {
    return "center";
  }

  if (forward === 1) {
    return "right";
  }

  if (forward === 2) {
    return "outer-right";
  }

  if (forward === total - 1) {
    return "left";
  }

  if (forward === total - 2) {
    return "outer-left";
  }

  return "hidden";
}

export default function TikTokStackedCarousel({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [layoutMode, setLayoutMode] = useState(() =>
    typeof window === "undefined" ? "desktop" : getLayoutMode(window.innerWidth)
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState("idle");
  const [outgoingCenterIndex, setOutgoingCenterIndex] = useState(null);
  const [readyVideoIds, setReadyVideoIds] = useState(() => new Set());
  const transitionTimeoutRef = useRef(null);
  const swipeStartRef = useRef(null);
  const frameRefs = useRef(new Map());

  const positionedCards = useMemo(
    () =>
      items.map((item, index) => ({
        ...item,
        index,
        position: getCardPosition(index, activeIndex, items.length, layoutMode)
      })),
    [activeIndex, items, layoutMode]
  );

  const playableCardIndexes = useMemo(() => {
    const indexes = new Set([activeIndex]);

    if (outgoingCenterIndex !== null) {
      indexes.add(outgoingCenterIndex);
    }

    return indexes;
  }, [activeIndex, outgoingCenterIndex]);

  function setFrameRef(index, node) {
    if (node) {
      frameRefs.current.set(index, node);
      return;
    }

    frameRefs.current.delete(index);
  }

  function postPlayerCommand(index, type) {
    const frame = frameRefs.current.get(index);

    frame?.contentWindow?.postMessage(
      { type, value: undefined, "x-tiktok-player": true },
      "*"
    );
  }

  useEffect(() => {
    function syncLayoutMode() {
      setLayoutMode(getLayoutMode(window.innerWidth));
    }

    syncLayoutMode();
    window.addEventListener("resize", syncLayoutMode);

    return () => {
      window.removeEventListener("resize", syncLayoutMode);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  function moveCarousel(step) {
    if (isAnimating || items.length < 2) {
      return;
    }

    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current);
    }

    postPlayerCommand(activeIndex, "pause");

    setIsAnimating(true);
    setTransitionDirection(step > 0 ? "next" : "prev");
    setOutgoingCenterIndex(activeIndex);
    setActiveIndex((current) => wrapIndex(current + step, items.length));

    transitionTimeoutRef.current = window.setTimeout(() => {
      setIsAnimating(false);
      setTransitionDirection("idle");
      setOutgoingCenterIndex(null);
    }, TIKTOK_TRANSITION_MS);
  }

  function beginSwipe(clientX, clientY) {
    swipeStartRef.current = { clientX, clientY };
  }

  function completeSwipe(clientX, clientY) {
    if (!swipeStartRef.current || isAnimating) {
      swipeStartRef.current = null;
      return;
    }

    const deltaX = clientX - swipeStartRef.current.clientX;
    const deltaY = clientY - swipeStartRef.current.clientY;

    swipeStartRef.current = null;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
      return;
    }

    moveCarousel(deltaX < 0 ? 1 : -1);
  }

  useEffect(() => {
    const activeItem = items[activeIndex];

    if (!activeItem || !readyVideoIds.has(activeItem.videoId)) {
      return;
    }

    postPlayerCommand(activeIndex, "mute");
    postPlayerCommand(activeIndex, "play");

    if (outgoingCenterIndex !== null) {
      postPlayerCommand(outgoingCenterIndex, "pause");
      postPlayerCommand(outgoingCenterIndex, "mute");
    }
  }, [activeIndex, items, outgoingCenterIndex, readyVideoIds]);

  useEffect(() => {
    if (items.length === 0) {
      return undefined;
    }

    function handleTikTokPlayerMessage(event) {
      if (!event.data || typeof event.data !== "object" || event.data["x-tiktok-player"] !== true) {
        return;
      }

      const activeFrame = frameRefs.current.get(activeIndex);

      if (!activeFrame || event.source !== activeFrame.contentWindow) {
        return;
      }

      if (event.data.type === "onPlayerReady") {
        setReadyVideoIds((current) => {
          const next = new Set(current);
          next.add(items[activeIndex].videoId);
          return next;
        });

        activeFrame.contentWindow?.postMessage(
          { type: "mute", value: undefined, "x-tiktok-player": true },
          "*"
        );
        activeFrame.contentWindow?.postMessage(
          { type: "play", value: undefined, "x-tiktok-player": true },
          "*"
        );
      }

      if (event.data.type === "onStateChange" && event.data.value === 0) {
        moveCarousel(1);
      }
    }

    window.addEventListener("message", handleTikTokPlayerMessage);

    return () => {
      window.removeEventListener("message", handleTikTokPlayerMessage);
    };
  }, [activeIndex, isAnimating, items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="tiktok-fan-shell reveal">
      <button
        aria-label="Show previous TikTok video"
        className="tiktok-arrow tiktok-arrow-left"
        disabled={isAnimating}
        onClick={() => moveCarousel(-1)}
        type="button"
      >
        <ChevronLeft size={22} />
      </button>

      <div
        aria-live="polite"
        className={
          isAnimating
            ? `tiktok-fan-stage is-animating is-${transitionDirection}`
            : "tiktok-fan-stage"
        }
        data-layout={layoutMode}
        onPointerDown={(event) => {
          if (event.pointerType === "touch" || (event.pointerType === "mouse" && event.button !== 0)) {
            return;
          }

          beginSwipe(event.clientX, event.clientY);
        }}
        onPointerUp={(event) => {
          if (event.pointerType === "touch") {
            return;
          }

          completeSwipe(event.clientX, event.clientY);
        }}
        onPointerCancel={() => {
          swipeStartRef.current = null;
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];

          if (touch) {
            beginSwipe(touch.clientX, touch.clientY);
          }
        }}
        onTouchEnd={(event) => {
          const touch = event.changedTouches[0];

          if (!touch) {
            swipeStartRef.current = null;
            return;
          }

          completeSwipe(touch.clientX, touch.clientY);
        }}
      >
        {positionedCards.map((item) => {
          const isCenter = item.position === "center";
          const isPreviewButton = item.position === "left" || item.position === "right";
          const shouldKeepVideoMounted = playableCardIndexes.has(item.index);
          const showLivePlayer =
            shouldKeepVideoMounted &&
            (item.index === outgoingCenterIndex || (isCenter && readyVideoIds.has(item.videoId)));

          const cardClassName = [
            "tiktok-fan-card",
            `is-${item.position}`,
            item.index === activeIndex ? "is-active-card" : "",
            item.index === outgoingCenterIndex ? "is-outgoing-card" : "",
            shouldKeepVideoMounted ? "has-live-player" : "",
            showLivePlayer ? "is-live-visible" : "is-preview-visible"
          ]
            .filter(Boolean)
            .join(" ");

          const previewContent = (
            <>
              <div className="tiktok-card-live">
                {shouldKeepVideoMounted ? (
                  <iframe
                    ref={(node) => setFrameRef(item.index, node)}
                    allow="autoplay; encrypted-media; fullscreen"
                    className="tiktok-frame"
                    loading="lazy"
                    src={`https://www.tiktok.com/player/v1/${item.videoId}?autoplay=1&muted=1&loop=0&controls=1&play_button=1&progress_bar=1&timestamp=1&description=0&music_info=0&rel=0`}
                    title={`TikTok video ${item.videoId}`}
                  />
                ) : null}
              </div>
              <div className="tiktok-card-preview">
                <div className="tiktok-preview-media">
                  <img alt={item.title} src={item.image} />
                </div>
                <div className="tiktok-preview-copy">
                  <span>{item.accent}</span>
                  <strong>{item.title}</strong>
                  <p>{item.views}</p>
                </div>
              </div>
            </>
          );

          if (isPreviewButton) {
            return (
              <button
                key={item.videoId}
                aria-label={`Show TikTok video: ${item.title}`}
                className={`${cardClassName} tiktok-preview-card`}
                data-position={item.position}
                disabled={isAnimating}
                onClick={() => moveCarousel(item.position === "left" ? -1 : 1)}
                type="button"
              >
                {previewContent}
              </button>
            );
          }

          return (
            <div
              key={item.videoId}
              className={isCenter ? cardClassName : `${cardClassName} tiktok-preview-card`}
              data-position={item.position}
              data-video-id={item.videoId}
            >
              {previewContent}
            </div>
          );
        })}
      </div>

      <button
        aria-label="Show next TikTok video"
        className="tiktok-arrow tiktok-arrow-right"
        disabled={isAnimating}
        onClick={() => moveCarousel(1)}
        type="button"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
}
