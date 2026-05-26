"use client";

import { useEffect, useRef, useState } from "react";

type AnimationType = "fadeIn" | "slideUp" | "slideLeft" | "slideRight" | "scaleIn" | "flipIn";

interface Props {
  children: React.ReactNode;
  type?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

const animations: Record<AnimationType, string> = {
  fadeIn: "opacity-0 translate-y-0",
  slideUp: "opacity-0 translate-y-10",
  slideLeft: "opacity-0 translate-x-10",
  slideRight: "opacity-0 -translate-x-10",
  scaleIn: "opacity-0 scale-95",
  flipIn: "opacity-0 rotate-3",
};

export default function AnimateOnScroll({
  children,
  type = "slideUp",
  delay = 0,
  duration = 500,
  className = "",
  threshold = 0.15,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${animations[type]} ${visible ? "opacity-100 translate-x-0 translate-y-0 scale-100 rotate-0" : ""} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function StaggerChildren({
  children,
  type = "slideUp",
  staggerDelay = 100,
  duration = 400,
  className = "",
  threshold = 0.1,
}: {
  children: React.ReactNode;
  type?: AnimationType;
  staggerDelay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? (children as React.ReactElement[]).map((child, idx) => (
            <div
              key={idx}
              className={`transition-all ease-out ${animations[type]} ${visible ? "opacity-100 translate-x-0 translate-y-0 scale-100 rotate-0" : ""}`}
              style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${visible ? idx * staggerDelay : 0}ms`,
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
