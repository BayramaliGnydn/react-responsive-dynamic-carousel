import React from "react";
import { NextIcon, PrevIcon } from "./Icons";


interface ButtonProps {
  onNextClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  onPrevClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  style?: React.CSSProperties;
  size?: number;
}

export const NextButton = ({
  style,
  onNextClick,
  size,
}: ButtonProps) => {
  return (
    <div
      id="carousel-buttons"
      style={{
        background: 'White',
        color:'black',
        borderRadius: '50%',
        boxShadow: '0px 0px 5px rgb(104 112 118 / 0.4)',
        height: size ?? 40,
        minWidth: 0,
        padding: 0,
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: 'translate(50%,-50%)',
        width: size ?? 40,
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
          color:'inherit',
        }}
        onClick={onNextClick}
      >
        <NextIcon color='inherit' size={size ? size / 2 : 18}  />
      </a>
    </div>
  )
}

export const PrevButton = ({
  style,
  onPrevClick,
  size
}: ButtonProps) => {
  return (
    <div
      id="carousel-buttons"
      style={{
        display:'flex',
        background: 'White',
        borderRadius: '50%',
        color:'black',
        boxShadow: '0px 0px 5px rgb(104 112 118 / 0.4)',
        height: size ?? 40,
        left: 0,
        minWidth: 0,
        padding: 0,
        position: 'absolute',
        top: '50%',
        transform: 'translate(-50%,-50%)',
        width: size ?? 40,
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
          color:'inherit',
        }}
        onClick={onPrevClick}
      >
        <PrevIcon color="inherit" size={size ? size / 2 : 18}   />
      </a>
    </div>
  )
}
