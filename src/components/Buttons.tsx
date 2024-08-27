import React from "react";
import '../style/global.css'
import { NextIcon, PrevIcon } from "./Icons";


interface ButtonProps {
  onNextClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  onPrevClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  style?: React.CSSProperties;
}

export const NextButton = ({
  style,
  onNextClick,
}: ButtonProps) => {
  return (
    <div
      id="carousel-buttons"
      style={{
        background: 'White',
        borderRadius: '50%',
        boxShadow: '0px 0px 5px rgb(104 112 118 / 0.4)',
        height: 40,
        minWidth: 0,
        padding: 0,
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: 'translate(50%,-50%)',
        width: 40,
        zIndex: 1,
        ...style,
      }}
    >
      <a
        href='javascript:;'
        style={{
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          alignItems:'center',
          width: '100%',
        }}
        onClick={onNextClick}
      >
        <NextIcon color="black" size={18}  />
      </a>
    </div>
  )
}

export const PrevButton = ({
  style,
  onPrevClick,
}: ButtonProps) => {
  return (
    <div
      id="carousel-buttons"
      style={{
        display:'flex',
        background: 'White',
        borderRadius: '50%',
        boxShadow: '0px 0px 5px rgb(104 112 118 / 0.4)',
        height: 40,
        left: 0,
        minWidth: 0,
        padding: 0,
        position: 'absolute',
        top: '50%',
        transform: 'translate(-50%,-50%)',
        width: 40,
        zIndex: 1,
        ...style,
      }}
    >
      <a
        href='javascript:;'
        style={{
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          alignItems:'center',
          width: '100%',
        }}
        onClick={onPrevClick}
      >
        <PrevIcon color="black" size={18}  />
      </a>
    </div>
  )
}
