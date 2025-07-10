import { Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, share } from 'rxjs/operators';
import { createBoundingRectObservable } from './createBoundingRectObservable';
import { toRelativeCoordinates } from './coordinates';

/**
 * 요소의 상대 좌표를 추적하는 Observable 생성
 * resize, mutation, scroll 등 모든 변화를 감지하여 컨테이너 기준 상대 좌표 반환
 * 
 * @param element - 추적할 요소
 * @param container - 기준이 되는 컨테이너 요소
 * @returns 컨테이너 기준 상대 좌표를 emit하는 Observable
 */
export function createRelativeBoundingRectObservable(
  element: HTMLElement,
  container: HTMLElement
): Observable<DOMRect> {
  const elementRect$ = createBoundingRectObservable(element);
  const containerRect$ = createBoundingRectObservable(container);
  
  return combineLatest([elementRect$, containerRect$]).pipe(
    map(([elementRect, containerRect]) => 
      toRelativeCoordinates(elementRect, containerRect)
    ),
    distinctUntilChanged((a, b) => 
      a.left === b.left && 
      a.top === b.top && 
      a.width === b.width && 
      a.height === b.height
    ),
    share() // shareReplay(1) 대신 share() 사용하여 구독자가 없을 때 자동 정리
  );
}