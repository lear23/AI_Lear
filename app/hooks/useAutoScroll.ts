import { useEffect, RefObject } from 'react';

export const useAutoScroll = (ref: RefObject<HTMLElement>, deps: unknown[]) => {
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, deps);
};
