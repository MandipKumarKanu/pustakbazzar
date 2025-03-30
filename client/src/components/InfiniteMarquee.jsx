import React, { useRef, useEffect } from 'react';

const InfiniteMarquee = ({ 
  children, 
  speed = 60, 
  direction = 'left',
  pauseOnHover = true,
  className = '',
  fadeWidth = 100 
}) => {
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current || !scrollerRef.current) return;
    
    const scrollerContent = Array.from(scrollerRef.current.children);
    
    if (scrollerContent.length) {
      scrollerContent.forEach(item => {
        const duplicatedItem = item.cloneNode(true);
        duplicatedItem.setAttribute('aria-hidden', 'true');
        scrollerRef.current.appendChild(duplicatedItem);
      });
    }
    
    const directionFactor = direction === 'right' ? 1 : -1;
    
    let scrollDistance = 0;
    let animationId = null;
    let isPaused = false;
    
    const scrollAnimation = () => {
      if (!isPaused) {
        scrollDistance += speed / 60;
        
        if (scrollerRef.current) {
          const maxScroll = scrollerRef.current.scrollWidth / 2;
          
          if (scrollDistance >= maxScroll) {
            scrollDistance = 0;
          }
          
          scrollerRef.current.style.transform = `translateX(${directionFactor * scrollDistance}px)`;
        }
      }
      
      animationId = requestAnimationFrame(scrollAnimation);
    };
    
    animationId = requestAnimationFrame(scrollAnimation);
    
    if (pauseOnHover) {
      const handleMouseEnter = () => {
        isPaused = true;
      };
      
      const handleMouseLeave = () => {
        isPaused = false;
      };
      
      containerRef.current.addEventListener('mouseenter', handleMouseEnter);
      containerRef.current.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        cancelAnimationFrame(animationId);
        containerRef.current?.removeEventListener('mouseenter', handleMouseEnter);
        containerRef.current?.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [speed, direction, pauseOnHover, children]);
  
  return (
    <div 
      ref={containerRef} 
      className={`overflow-hidden relative ${className}`}
      style={{ position: 'relative' }}
    >
      <div 
        className="absolute left-0 top-0 h-full z-10 pointer-events-none"
        style={{ 
          width: fadeWidth,
          background: 'linear-gradient(to right, white, transparent)'
        }}
      />

      <div 
        className="absolute right-0 top-0 h-full z-10 pointer-events-none"
        style={{ 
          width: fadeWidth,
          background: 'linear-gradient(to left, white, transparent)'
        }}
      />

      <div 
        ref={scrollerRef}
        className="inline-flex"
        style={{ 
          whiteSpace: 'nowrap',
          willChange: 'transform'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default InfiniteMarquee;