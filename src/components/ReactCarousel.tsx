import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
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
  containerStyle = { gap: '15px' },
  carouselTransformAnimation = 'transform 300ms',
  prevButtonStyle,
  nextButtonStyle,
  renderButton,
  indicatorsStyle,
  renderIndicators,
  autoPlay,
  extraWidth = 0,
  recalculationTime = 100,
  autoPlayTime = 2000,
  props,
  tolerance = 100,
  step,
  buttonSize,
}: ReactCarouselProps) => {
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [currentTranslate, setCurrentTranslate] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemWidth, setItemWidth] = useState(0)
  const [gapWidth, setGapWidth] = useState(0)
  const [renderedItemCount, setRenderedItemCount] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const itemRef = useRef<HTMLDivElement>(null)
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
      if (typeof document !== 'undefined') {
        document.querySelector('body')!.style.overflowY = 'hidden' // touch eventi başlayınca scroll durur
      }
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
          if (diff < 0 && prevIndex < data.length - 1) {
            newIndex = prevIndex + 1
          }
          else if (diff > 0 && prevIndex > 0) {
            newIndex = prevIndex - 1
          }
        }

        const boxWidth = boxRef.current!.clientWidth
        const offset = (boxWidth - itemWidth) / 2
        /* offset: mobil carousel için bir önceki ve bir sonraki elementin
         gözükmesi için sag sol boşluk */

        let newTranslate = -newIndex * (itemWidth + gapWidth) +
          offset - (containerStyle.padding ? parseInt(containerStyle.padding as string) : 0)
        /* kullanıcının verdiği padding değerine göre yeni translate hesaplaması */

        if (newIndex === data.length - renderedItemCount) {
          newTranslate += offset -
            (containerStyle.padding ? parseInt(containerStyle.padding as string) : 0)
        }
        else if (newIndex === 0) {
          newTranslate -= offset -
            (containerStyle.padding ? parseInt(containerStyle.padding as string) : 0)
        }
        if (containerRef.current) {
          containerRef.current.style.transition = carouselTransformAnimation
          containerRef.current.style.transform = `translate3d(${newTranslate}px,0,0)`
        }
        setCurrentTranslate(newTranslate)
        return newIndex
      })
    }
    if (typeof document !== 'undefined') {
      document.querySelector('body')!.style.overflowY = ''
      scrolling.current = false
      touchAngle.current = null
    }
  }

  useEffect(() => {
    if (typeof window !== undefined) {
      viewportWidth.current = window.innerWidth
      resizeCalc()
      window.addEventListener('resize', debouncedResize)
    }
    return () =>
      window.removeEventListener('resize', debouncedResize)
  }, [])

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

  const debouncedResize = useCallback(() => {
    if (callerTimeout.current) {
      clearTimeout(callerTimeout.current)
    }
    callerTimeout.current = setTimeout(() => {
      const currentViewportWidth = window.innerWidth
      if (currentViewportWidth !== viewportWidth.current) {
        resizeCalc()
        viewportWidth.current = currentViewportWidth
      }
    }, recalculationTime)
  }, [])

  const resizeCalc = () => {
    if (itemRef.current && boxRef.current && containerRef.current) {
      const itemW = itemRef.current.clientWidth
      setItemWidth(itemW) // alt component width
      boxRef.current.style.width = '100%'
      const maxWidth = boxRef.current.clientWidth - (renderButton ? 80 : 0)
      let renderedItem = renderedItemCount
      if (maxItem !== 1) {
        const calculatedItemCount =
          Math.floor(maxWidth / itemW) // ekrana sığan maximum eleman sayısı
        renderedItem /* renderlanacak eleman sayısı */ = maxItem < calculatedItemCount ?
          maxItem : calculatedItemCount
        setRenderedItemCount(renderedItem === 0 ? 1 : renderedItem)
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
          const cTranslate = prev * (itemW + gapWidth) // mevcut translate hesaplaması (gap + item)
          containerRef.current.style.transform = `translate3d(-${cTranslate}px,0,0)`
          containerRef.current.style.transition = 'none'
          setCurrentTranslate(cTranslate)
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
                newTranslate = (newIndex * (itemWidth + gapWidth) - offset) * -1
              }
            else if(prevIndex + 1 === data.length - 1){
                newTranslate = (newIndex * (itemWidth + gapWidth) - 2*offset) * -1
              }
            else{
                newTranslate = ((newIndex * (itemWidth + gapWidth)) - offset )* -1
              }
          }
          else{
            newTranslate = (newIndex * (itemWidth + gapWidth)) * -1
          }
          //atanan yeni indexe ait translate hesaplaması
        }
      }
      setCurrentTranslate(newTranslate)
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
      let newTranslate = (prevIndex - (step ?? 1)) * (itemWidth + gapWidth)

      setCurrentTranslate(newTranslate)

      if (containerRef.current) {
        containerRef.current.style.transition = carouselTransformAnimation
        containerRef.current.style.transform = `translate3d(-${newTranslate}px,0,0)`
      }

      return prevIndex - (step ?? 1)
    })

  const onNextClick = () =>
    setCurrentIndex((prevIndex) => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current)
      }//kullanıcı ileri butonuna tıklarsa autoplay durur

      let newTranslate = (prevIndex + (step ?? 1)) * (itemWidth + gapWidth)

      setCurrentTranslate(newTranslate)

      if (containerRef.current) {
        containerRef.current.style.transition = carouselTransformAnimation
        containerRef.current.style.transform = `translate3d(-${newTranslate}px,0,0)`
      }

      return prevIndex + (step ?? 1)
    })

  return (
    <div ref={boxRef} style={{ position: 'relative', width: '100%' }} id='react-carousel'>
      <div
        style={{ display: 'flex', height: 'fit-content', overflow: 'hidden', position: 'static', width: '100%' }}
      >
        {renderButton && (
          <>
            {currentIndex < data?.length -
              renderedItemCount &&
              (
                <NextButton style={nextButtonStyle} onNextClick={onNextClick} size={buttonSize} />
              )}
            {currentIndex != 0 && (
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
          ref={containerRef}
          style={{ display: 'flex',width:'100%', willChange: 'transform',...(data.length < renderedItemCount ? {justifyContent:'center'}:{justifyContent:'start'}), ...containerStyle }}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
        >
         {data?.map((item: any, index: number) => (
            <div key={index} ref={itemRef} style={maxItem === 1 ? { flex: `0 0 100%` } : {}}>
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
