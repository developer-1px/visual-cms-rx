import { Subject, filter, map, scan, merge, shareReplay, type Observable } from 'rxjs';

interface Action<T = void> {
  type: string;
  (payload: T): ActionPayload<T>;
}

interface ActionPayload<T = void> {
  type: string;
  payload: T;
}

const actionSubject = new Subject<ActionPayload<any>>();
let actionCounter = 0;

export function action<T = void>(type: string): Action<T> {
  const actionCreator = (payload: T) => ({ type, payload });
  actionCreator.type = type;
  return actionCreator as Action<T>;
}

export function dispatch<T>(action: ActionPayload<T>): void {
  actionCounter++;
  console.group(`#${actionCounter}: ${action.type}`);
  console.log('Payload:', action.payload);
  actionSubject.next(action);
  console.groupEnd();
}

type OnFunction = <T>(action: Action<T>) => Observable<T>;

const rootState: Record<string, any> = {};

type Updater<T> = (state: T) => T;

export function reducer<T>(
  path: string,
  initialValue: T,
  setupFn: (on: OnFunction) => Observable<T | Updater<T>>[]
): Observable<T> {
  const on: OnFunction = <T>(action: Action<T>) => {
    return actionSubject.pipe(
      filter(payload => payload.type === action.type),
      filter((payload): payload is ActionPayload<T> => true),
      map(payload => payload.payload)
    ) as Observable<T>;
  };
  
  const streams = setupFn(on);
  
  return merge(...streams).pipe(
    scan((state, value) => {
      const newState = typeof value === 'function' ? (value as Updater<T>)(state) : value;
      console.log(`[${path}]:`, state, '→', newState);
      return newState;
    }, initialValue),
    shareReplay(1)
  );
}