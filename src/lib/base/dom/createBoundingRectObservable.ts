import { Observable, merge, fromEvent, animationFrameScheduler } from 'rxjs';
import { map, throttleTime, distinctUntilChanged, share } from 'rxjs/operators';

export function createBoundingRectObservable(element: HTMLElement): Observable<DOMRect> {
  // ResizeObserver Observable
  const resize$ = new Observable<void>(subscriber => {
    const resizeObserver = new ResizeObserver(() => subscriber.next());
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  });
  
  // MutationObserver Observable
  const mutation$ = new Observable<void>(subscriber => {
    const mutationObserver = new MutationObserver(() => subscriber.next());
    mutationObserver.observe(element, {
      childList: true,
      characterData: true,
      subtree: true
    });
    return () => mutationObserver.disconnect();
  });
  
  // Window resize Observable
  const windowResize$ = fromEvent(window, 'resize');
  
  // Scroll Observable (capture phase)
  const scroll$ = fromEvent(window, 'scroll', { capture: true });
  
  // Merge all observables and get rect
  return merge(resize$, mutation$, windowResize$, scroll$).pipe(
    throttleTime(0, animationFrameScheduler),
    map(() => element.getBoundingClientRect()),
    distinctUntilChanged((a, b) => 
      a.x === b.x && 
      a.y === b.y && 
      a.width === b.width && 
      a.height === b.height
    ),
    share() // shareReplay(1) 대신 share() 사용하여 구독자가 없을 때 자동 정리
  );
}