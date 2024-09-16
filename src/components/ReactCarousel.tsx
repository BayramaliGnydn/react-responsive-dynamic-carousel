import React, { useCallback, useEffect, useRef, useState } from 'react'
import Indicators from './Indicators';
import { NextButton, PrevButton } from './Buttons';
import '../style/index.css'

interface ReactCarouselProps {
  Component: React.ElementType;
  autoPlay?: boolean;
  autoPlayTime?: number;
  carouselTransformAnimation?: string;
  containerStyle?:  React.CSSProperties;
  data: any;
  extraWidth?: number;
  indicatorsStyle?:  {style?:React.CSSProperties,currentStyle?:React.CSSProperties};
  maxItem?: number;
  nextButtonStyle?:  React.CSSProperties;
  prevButtonStyle?: React.CSSProperties;
  props?: any;
  recalculationTime?: number;
  renderButton?: boolean;
  renderIndicators?: boolean;
  tolerance?: number;
  step?: number;
  buttonSize?: number;
}

const ReactCarousel = ({
  data,
  Component,
  maxItem = 4,
  containerStyle,
  carouselTransformAnimation = 'transform 300ms',
  prevButtonStyle,
  nextButtonStyle,
  renderButton,
  indicatorsStyle,
  renderIndicators,
  autoPlay,
  extraWidth = 0,
  recalculationTime = 500,
  autoPlayTime = 2000,
  props,
  tolerance = 100,
  step = 1,
  buttonSize,
}: ReactCarouselProps) => {
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [currentTranslate, setCurrentTranslate] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemWidth, setItemWidth] = useState(0)
  const [gapWidth, setGapWidth] = useState(0)
  const [renderedItemCount, setRenderedItemCount] = useState(1)
  const [transformFactor,setTransformFactor] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const callerTimeout = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoPlayTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const viewportWidth = useRef<number | null>(null)
  const touchAngle = useRef<number | null>(null)
  const scrolling = useRef<boolean | null>(false)

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (itemWidth === 0) {
      return
    }
    const touchDownX = event.touches[0].clientX
    const touchDownY = event.touches[0].clientY
    setStartX(touchDownX)
    setStartY(touchDownY)
    if (containerRef.current) {
      containerRef.current.style.transition = 'none'
    }
  }, [itemWidth])

  const handleTouchMove = (event: React.TouchEvent) => {
    if (itemWidth === 0) {
      return
    }
    const touchX = event.touches[0].clientX
    const touchY = event.touches[0].clientY
    const diffX = (touchX - startX) / 1.5
    const diffY = (touchY - startY) / 1.5
    if (touchAngle.current === null) {
      touchAngle.current =
        Math.atan2(Math.abs(diffY), Math.abs(diffX)) * (180 / Math.PI) //touchmove açısı
    }

    if (touchAngle.current < 45) {
      scrolling.current = true
    }
    else {
      scrolling.current = false
    }

    if (containerRef.current && scrolling.current) {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current)
      } //kullanıcı touch eventi başlatırsa autoplay durur
      containerRef.current.style.transform = `translate3d(${currentTranslate + diffX}px,0,0)`
    }
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (itemWidth === 0) {
      return
    }
    if (scrolling.current) {
      const touchEnd = event.changedTouches[0].clientX
      const diff = touchEnd - startX
      setCurrentIndex((prevIndex) => {
        let newIndex = prevIndex
        if (Math.abs(diff) > tolerance) {
          if (diff * -transformFactor < 0 && prevIndex < data.length - 1) {
            newIndex = prevIndex + 1
          }
          else if (diff * -transformFactor > 0 && prevIndex > 0) {
            newIndex = prevIndex - 1
          }
        }

        const boxWidth = boxRef.current!.clientWidth
        const offset = (boxWidth - itemWidth) / 2
        /* offset: mobil carousel için bir önceki ve bir sonraki elementin
         gözükmesi için sag sol boşluk */
        let newTranslate = newIndex * (itemWidth + gapWidth) + -offset
        /* kullanıcının verdiği padding değerine göre yeni translate hesaplaması */
        if (newIndex === data.length - renderedItemCount) {
          newTranslate += -offset 
        }
        else if (newIndex === 0) {
          newTranslate -= -offset
        }
        if (containerRef.current) {
          containerRef.current.style.transition = carouselTransformAnimation
          containerRef.current.style.transform = `translate3d(${newTranslate * transformFactor}px,0,0)`
        }
        setCurrentTranslate(newTranslate * transformFactor)
        return newIndex
      })
    }
    if (typeof document !== 'undefined') {
      scrolling.current = false
      touchAngle.current = null
    }
  }

  useEffect(() => {
    const opts: AddEventListenerOptions & EventListenerOptions = { passive: false };
    if (typeof window !== 'undefined') {
      viewportWidth.current = window.innerWidth
      resizeCalc()
      window.addEventListener('resize', debouncedResize)
      window.addEventListener('touchmove', stopScroll, opts);
    }
    return () =>{
      window.removeEventListener('resize', debouncedResize)
      window.removeEventListener('touchmove', stopScroll, opts)
    }
  }, [containerRef.current?.children[0].clientWidth])

  useEffect(() => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current)
    }
    if (autoPlay && itemWidth > 0 && data.length > renderedItemCount) {
      autoPlayTimer.current = setInterval(autoPlayFunc, autoPlayTime)
    }
    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current)
      }
    }
  }, [itemWidth,renderedItemCount])

  const stopScroll = (event:TouchEvent) => {
    if(scrolling.current){
      event.preventDefault()
    }
    return false
  }

  const debouncedResize = useCallback(() => {
    if (callerTimeout.current) {
      clearTimeout(callerTimeout.current)
    }
    callerTimeout.current = setTimeout(() => {
      const currentViewportWidth = window.innerWidth
      if (currentViewportWidth !== viewportWidth.current) {
        viewportWidth.current = currentViewportWidth
        resizeCalc()
      }
    }, recalculationTime)
  }, [])

  const resizeCalc = () => {
    if (boxRef.current && containerRef.current && viewportWidth.current) {
      let transformF = -1
      if(document.dir === 'rtl'){
        transformF = 1
        setTransformFactor(transformF)
      }
      const itemW = containerRef.current.children[0].clientWidth
      setItemWidth(itemW) // alt component width
      boxRef.current.style.width = '100%'
      const maxWidth = boxRef.current.clientWidth - ((renderButton && viewportWidth.current > 650) ? 80 : 0)
      let renderedItem = renderedItemCount
      if (maxItem !== 1) {
        const calculatedItemCount =
          Math.floor(maxWidth / itemW) // ekrana sığan maximum eleman sayısı
        renderedItem /* renderlanacak eleman sayısı */ = maxItem < calculatedItemCount ?
          maxItem : calculatedItemCount
        setRenderedItemCount(renderedItem === 0 || viewportWidth.current < 650 ? 1 : renderedItem)
      }//maxItem 1 değilse renderlanacak item sayısı belirleme
      const gapWidth = parseFloat(containerRef.current.style.gap)
      setGapWidth(gapWidth) // renderlanan elemanlar arası boşluk
      if (boxRef.current.clientWidth > 650 && maxItem !== 1) {
        boxRef.current.style.width = `calc(${itemW * renderedItem + ((renderedItem - 1) * gapWidth)
          + extraWidth}px)` // carousel width hesaplaması
      }
      /*650pxden büyükse ve maxItem 1 değilse carousel width değişir,tam tersi durumda 100% kalır */

      setCurrentIndex((prev) => {
        if (containerRef.current) {
          const offset = (boxRef.current!.clientWidth - itemW) / 2
          const cTranslate = prev * (itemW + gapWidth) + (
            viewportWidth.current! < 650 && prev !== 0 && prev !== data.lenght - renderedItemCount ? -offset : 0) // mevcut translate hesaplaması (gap + item)
          containerRef.current.style.transform = `translate3d(${cTranslate * transformF}px,0,0)`
          containerRef.current.style.transition = 'none'
          setCurrentTranslate(cTranslate * transformF)
        }
        return prev
      })
    }}

  const autoPlayFunc = () =>
    setCurrentIndex((prevIndex) => {
      let newIndex
      let newTranslate
      if (prevIndex === data.length - 1) {
        newIndex = 0
        newTranslate = 0
        //tekli gösterimde mevcut datanın sonuna geldiyse ise ilk indexe döner
      }
      else {
        if (data.length === renderedItemCount + prevIndex - (viewportWidth.current! < 650 ? 1 : 0)) {
          newIndex = 0
          newTranslate = 0
          //çoklu gösterimde renderlanan item sayısı mevcut datanın sonuna geldiyse ilk indexe döner
        }
        else {
          newIndex = prevIndex + 1
          if(maxItem > 1 && viewportWidth?.current! < 650 ){
            const boxWidth = boxRef.current!.clientWidth
            const offset = (boxWidth - itemWidth) / 2
            if(prevIndex === 0){
                newTranslate = (newIndex * (itemWidth + gapWidth) - offset) * transformFactor
              }
            else if(prevIndex + 1 === data.length - 1){
                newTranslate = (newIndex * (itemWidth + gapWidth) - 2*offset) * transformFactor
              }
            else{
                newTranslate = ((newIndex * (itemWidth + gapWidth)) - offset )* transformFactor
              }
          }
          else{
            newTranslate = (newIndex * (itemWidth + gapWidth)) * transformFactor
          }
          //atanan yeni indexe ait translate hesaplaması
        }
      }
      setCurrentTranslate(newTranslate * transformFactor)
      if (containerRef.current) {
        containerRef.current.style.transition = carouselTransformAnimation
        containerRef.current.style.transform = `translate3d(${newTranslate}px,0,0)`
      }

      return newIndex
    })

  const onPrevClick = () =>
    setCurrentIndex((prevIndex) => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current)
      }//kullanıcı geri butonuna tıklarsa autoplay durur
      let newTranslate = (prevIndex - step * -transformFactor) * (itemWidth + gapWidth)

      setCurrentTranslate(newTranslate * transformFactor)

      if (containerRef.current) {
        containerRef.current.style.transition = carouselTransformAnimation
        containerRef.current.style.transform = `translate3d(${newTranslate * transformFactor}px,0,0)`
      }
      return prevIndex - step * -transformFactor
    })

  const onNextClick = () =>
    setCurrentIndex((prevIndex) => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current)
      }//kullanıcı ileri butonuna tıklarsa autoplay durur

      let newTranslate = (prevIndex + step * -transformFactor) * (itemWidth + gapWidth)

      setCurrentTranslate(newTranslate * transformFactor)

      if (containerRef.current) {
        containerRef.current.style.transition = carouselTransformAnimation
        containerRef.current.style.transform = `translate3d(${newTranslate * transformFactor}px,0,0)`
      }

      return prevIndex + step * -transformFactor
    })

  return (
    <div ref={boxRef} style={{ position: 'relative', width: '100%' }} id='react-carousel'>
      <div
        style={{ display: 'flex', height: 'fit-content', overflow: 'hidden', position: 'static', width: '100%' }}
      >
        {renderButton && (
          <>
            {((currentIndex < data?.length -
              renderedItemCount && document.dir !== 'rtl') || (currentIndex != 0 && document.dir === 'rtl'))  &&
              (
                <NextButton style={nextButtonStyle} onNextClick={onNextClick} size={buttonSize} />
              )}
            {((currentIndex != 0 && document.dir !== 'rtl') || (currentIndex < data?.length -
              renderedItemCount && document.dir==='rtl')) && (
              <PrevButton style={prevButtonStyle} onPrevClick={onPrevClick} size={buttonSize} />
            )}
          </>
        )}
        {renderIndicators && (
          <Indicators
            animation={carouselTransformAnimation}
            containerRef={containerRef}
            count={data?.length}
            current={currentIndex}
            renderedItemCount={renderedItemCount}
            setCurrentIndex={setCurrentIndex}
            setCurrentTranslate={setCurrentTranslate}
            style={indicatorsStyle?.style}
            currentStyle={indicatorsStyle?.currentStyle}
            timer={autoPlayTimer}
            totalItemWidth={itemWidth + gapWidth}
          />
        )}
        <div
          id='container'
          ref={containerRef}
          style={{ display: 'flex',width:'100%', willChange: 'transform',...((data.length < renderedItemCount || data.length < 2) ? {justifyContent:'center'}:{justifyContent:'start'}), ...{gap:'15px',...containerStyle}}}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
        >
         {data?.map((item: any, index: number) => (
            <div key={index} style={maxItem === 1 ? { flex: `0 0 100%` } : {}}>
              <Component
                {...item}
                {...props}
                currentIndex={currentIndex}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReactCarousel
