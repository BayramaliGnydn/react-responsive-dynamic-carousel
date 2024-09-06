import React from 'react';

interface IndicatorsProps {
  animation: string;
  containerRef: React.RefObject<HTMLDivElement>;
  count: number;
  current: number;
  renderedItemCount: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  setCurrentTranslate: (arg: number) => void;
  style?: React.CSSProperties;
  timer: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  totalItemWidth: number;
  currentStyle?:React.CSSProperties;
}

const Indicators = ({
  count,
  current,
  totalItemWidth,
  setCurrentIndex,
  setCurrentTranslate,
  containerRef,
  animation,
  timer,
  renderedItemCount,
  style,
  currentStyle,
}: IndicatorsProps) => {
  const array = Array.from({ length: count - renderedItemCount + 1 }, (_, i) => i + 1)
  const onIndicatorClick = (index: number) =>
    setCurrentIndex(() => {
      if (timer.current) {
        clearInterval(timer.current)
      }
      let newTranslate = index * totalItemWidth
      setCurrentTranslate(newTranslate)
      if (containerRef.current) {
        containerRef.current.style.transition = animation
        containerRef.current.style.transform = `translate3d(-${newTranslate}px,0,0)`
      }
      return index
    })
    
  return (
    <div style={{ bottom: '5%', gap: '5px', left: '50%', position: 'absolute', transform: 'translateX(-50%)', zIndex: 99, display:'flex' }}>
      {array.map((_, index) => (
        <button
          key={index}
          style={{
            cursor:'pointer',
            background: 'White',
            border: '1px solid black',
            bottom: -10,
            boxShadow: '0px 0px 5px rgb(104 112 118 / 0.8)',
            borderRadius: '50%',
            height: 15,
            minWidth: 0,
            opacity: 0.4,
            padding: 0,
            width: 15,
            ...style,
            ...(current === index ? currentStyle ? currentStyle:{opacity:1}:{}),
          }}
          onClick={() => onIndicatorClick(index)}
        />
      ))}
    </div>
  )
}

export default Indicators
