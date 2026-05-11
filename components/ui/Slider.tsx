import React, { useRef } from 'react';

interface SliderProps {
  children: React.ReactNode;
  gap?: number;
}

const Slider: React.FC<SliderProps> = ({ children, gap = 12 }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    const width = ref.current.clientWidth;
    ref.current.scrollBy({ left: dir === 'right' ? width * 0.8 : -width * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div ref={ref} className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hidden" style={{ gap }}>
        {React.Children.map(children, (c, i) => (
          <div className="flex-shrink-0" style={{ minWidth: 240 }} key={i}>{c}</div>
        ))}
      </div>
      <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 bg-surface/70 p-2 rounded-full hidden sm:flex">
        ◀
      </button>
      <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 bg-surface/70 p-2 rounded-full hidden sm:flex">
        ▶
      </button>
    </div>
  );
};

export default Slider;
