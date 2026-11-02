"use client";

import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import { scrollDeltaForDrag, scrollEdges, thumbMetrics } from "./scroll-thumb";

const HIDE_DELAY_MS = 1000;

/**
 * 기본 스크롤바 대신 얇은 막대를 보여주는 세로 스크롤 영역. 위·아래에 가려진 내용이 있으면 그쪽 경계에 페이드를 깔아, 헤더·하단에 선을 두지 않는다. 오른쪽 14px(막대 최대 폭 10px + 4px)는 스크롤되지 않는 막대 자리라 내용이 막대 밑에 깔리지 않고, 그 위에서 휠을 굴려도 스크롤되지 않는다. 스크롤하거나 마우스를 올리면 막대가 보이고, 막대를 눌러 끌어야 스크롤된다.
 * viewportClassName에 flex-col-reverse를 주면 아래부터 쌓이는 영역으로 알아서 계산한다.
 * 쓸 때: 화면 안의 세로 스크롤 영역 (메인 본문, 설정 본문, 채팅 칸, 시트 본문). PRD R0-7, ADR-0015.
 * 쓰지 않을 때: 가로 스크롤 → 직접 overflow-x-auto.
 * @example
 * <ScrollArea className="flex-1" viewportClassName="flex flex-col-reverse p-4"><div>{messages}</div></ScrollArea>
 */
const ScrollArea = ({
  className = "",
  viewportClassName = "",
  children,
}: {
  className?: string;
  viewportClassName?: string;
  children: ReactNode;
}) => {
  const viewport = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const topFade = useRef<HTMLDivElement>(null);
  const bottomFade = useRef<HTMLDivElement>(null);
  const reversed = useRef(false);
  const frame = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hovering = useRef(false);
  const dragY = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);

  const update = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = viewport.current;
      const bar = thumb.current;
      if (!el || !bar) return;
      const box = {
        scrollTop: el.scrollTop,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        reversed: reversed.current,
      };
      const metrics = thumbMetrics(box);
      const edges = scrollEdges(box);
      if (topFade.current) topFade.current.style.opacity = edges.top ? "1" : "0";
      if (bottomFade.current) bottomFade.current.style.opacity = edges.bottom ? "1" : "0";
      bar.style.display = metrics ? "" : "none";
      if (metrics) {
        bar.style.height = `${metrics.size}px`;
        bar.style.transform = `translateY(${metrics.offset}px)`;
      }
    });
  };

  const scheduleHide = () => {
    clearTimeout(hideTimer.current);
    if (hovering.current || dragY.current !== null) return;
    hideTimer.current = setTimeout(() => setVisible(false), HIDE_DELAY_MS);
  };

  const measure = useEffectEvent(() => {
    const el = viewport.current;
    if (el) reversed.current = getComputedStyle(el).flexDirection === "column-reverse";
    update();
  });

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const resize = new ResizeObserver(() => measure());
    const observeAll = () => {
      resize.disconnect();
      resize.observe(el);
      for (const child of el.children) resize.observe(child);
    };
    const mutation = new MutationObserver(() => {
      observeAll();
      measure();
    });
    observeAll();
    mutation.observe(el, { childList: true });
    measure();
    return () => {
      resize.disconnect();
      mutation.disconnect();
      cancelAnimationFrame(frame.current);
      clearTimeout(hideTimer.current);
    };
  }, []);

  const onScroll = () => {
    update();
    setVisible(true);
    scheduleHide();
  };

  return (
    <div
      className={`relative min-h-0 ${className}`}
      onPointerEnter={() => {
        hovering.current = true;
        clearTimeout(hideTimer.current);
        setVisible(true);
      }}
      onPointerLeave={() => {
        hovering.current = false;
        scheduleHide();
      }}
    >
      <div ref={viewport} onScroll={onScroll} className={`mr-3.5 h-full overflow-y-auto ${viewportClassName}`}>
        {children}
      </div>
      <div
        ref={topFade}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 right-3.5 h-6 bg-linear-to-b from-background to-background/0 opacity-0 transition-opacity duration-200"
      />
      <div
        ref={bottomFade}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 right-3.5 bottom-0 h-6 bg-linear-to-t from-background to-background/0 opacity-0 transition-opacity duration-200"
      />
      <div
        ref={thumb}
        aria-hidden
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          dragY.current = e.clientY;
          setDragging(true);
        }}
        onPointerMove={(e) => {
          const el = viewport.current;
          if (dragY.current === null || !el) return;
          const delta = e.clientY - dragY.current;
          dragY.current = e.clientY;
          el.scrollTop += scrollDeltaForDrag(delta, {
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
            size: e.currentTarget.offsetHeight,
          });
        }}
        onPointerUp={() => {
          dragY.current = null;
          setDragging(false);
          scheduleHide();
        }}
        onPointerCancel={() => {
          dragY.current = null;
          setDragging(false);
          scheduleHide();
        }}
        className={`absolute top-0 right-0.5 touch-none rounded-full bg-muted/50 transition-[opacity,width] duration-300 ${
          visible || dragging ? "opacity-100" : "opacity-0"
        } ${dragging ? "w-2.5" : "w-1.5"}`}
      />
    </div>
  );
};

export { ScrollArea };
