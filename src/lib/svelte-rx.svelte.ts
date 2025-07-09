import { Subject, filter, map, scan, merge, shareReplay, type Observable, type OperatorFunction } from 'rxjs';

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
  
  // 액션 처리 후 잠시 대기하여 모든 reducer가 실행되도록 함
  setTimeout(() => {
    console.log('Store:', JSON.stringify(storeValues, null, 2));
    console.groupEnd();
  }, 0);
}

interface PipeableStream<T, P> {
  pipe<R>(op: OperatorFunction<[T, P], R>): Observable<R>;
  pipe<A, B>(op1: OperatorFunction<[T, P], A>, op2: OperatorFunction<A, B>): Observable<B>;
  pipe<A, B, C>(op1: OperatorFunction<[T, P], A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C>;
  pipe(...operations: OperatorFunction<any, any>[]): Observable<any>;
}

type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type GetActionPayloads<T extends Action<any>[]> = {
  [K in keyof T]: T[K] extends Action<infer P> ? P : never;
}[number];

interface OnFunction<TState> {
  <P>(action: Action<P>): PipeableStream<TState, P>;
  <P>(action: Action<P>, mapper: (state: TState, payload: P) => TState): void;
  
  merge<T extends Action<any>[]>(...actions: T): PipeableStream<TState, GetActionPayloads<T>>;
  merge<T extends Action<any>[]>(...args: [...T, (state: TState, payload: GetActionPayloads<T>) => TState]): void;
}

export const stateObservables: Map<string, Observable<any>> = new Map();
const stateGetters: Map<string, () => any> = new Map();
const storeValues: Record<string, any> = {};

export function getCurrentState(path: string): any {
  const parts = path.split('.');
  let current = storeValues;
  for (const part of parts) {
    current = current[part];
  }
  return current;
}

function setCurrentState(path: string, value: any): void {
  const parts = path.split('.');
  let current = storeValues;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  const prevState = current[parts[parts.length - 1]];
  current[parts[parts.length - 1]] = value;
  
  console.log(`[${path}]:`, prevState, '→', value);
}

export function reducer<T>(
  path: string | { toString(): string },
  initialValue: T,
  setupFn: (on: OnFunction<T>) => void
) {
  // path가 객체면 toString() 호출
  const pathString = typeof path === 'string' ? path : path.toString();
  
  // 초기값을 store에 설정
  setCurrentState(pathString, initialValue);
  
  const streams: Observable<T>[] = [];
  
  // 스트림을 수집하는 헬퍼 함수
  const collectStream = (stream$: Observable<T>) => {
    streams.push(stream$);
  };
  
  const on: OnFunction<T> = Object.assign(
    function <P>(action: Action<P>, mapper?: (state: T, payload: P) => T) {
      // 매퍼 함수가 제공되면 바로 처리
      if (mapper) {
        const stream$ = actionSubject.pipe(
          filter(actionPayload => actionPayload.type === action.type),
          filter((_): _ is ActionPayload<P> => true),
          map((actionPayload: ActionPayload<P>) => {
            const currentState = getCurrentState(pathString) as T;
            return mapper(currentState, actionPayload.payload);
          })
        ) as Observable<T>;
        
        collectStream(stream$);
        return;
      }
      
      // 매퍼가 없으면 pipe 가능한 객체 반환
      return {
        pipe: (...operators: any[]) => {
          const stream$ = actionSubject.pipe(
            filter(actionPayload => actionPayload.type === action.type),
            filter((_): _ is ActionPayload<P> => true),
            map((actionPayload: ActionPayload<P>) => {
              const currentState = getCurrentState(pathString) as T;
              return [currentState, actionPayload.payload] as [T, P];
            }),
            ...(operators as [])
          ) as Observable<T>;
          
          collectStream(stream$);
          return stream$;
        }
      };
    },
    {
      merge<P extends Action<any>[]>(...args: P | [...P, (state: T, payload: GetActionPayloads<P>) => T]) {
        // 마지막 인자가 함수인지 확인
        const lastArg = args[args.length - 1];
        const isMapperProvided = typeof lastArg === 'function' && !('type' in lastArg);
        
        if (isMapperProvided) {
          const actions = args.slice(0, -1) as P;
          const mapper = lastArg as (state: T, payload: GetActionPayloads<P>) => T;
          const actionTypes = actions.map(action => action.type);
          
          const stream$ = actionSubject.pipe(
            filter(actionPayload => actionTypes.includes(actionPayload.type)),
            map((actionPayload: ActionPayload<GetActionPayloads<P>>) => {
              const currentState = getCurrentState(pathString) as T;
              return mapper(currentState, actionPayload.payload);
            })
          ) as Observable<T>;
          
          collectStream(stream$);
          return;
        }
        
        // 매퍼가 없으면 pipe 가능한 객체 반환
        const actions = args as P;
        const actionTypes = actions.map(action => action.type);
        return {
          pipe: (...operators: any[]) => {
            const stream$ = actionSubject.pipe(
              filter(actionPayload => actionTypes.includes(actionPayload.type)),
              map((actionPayload: ActionPayload<GetActionPayloads<P>>) => {
                const currentState = getCurrentState(pathString) as T;
                return [currentState, actionPayload.payload] as [T, GetActionPayloads<P>];
              }),
              ...(operators as [])
            ) as Observable<T>;
            
            collectStream(stream$);
            return stream$;
          }
        };
      }
    }
  );
  
  // setupFn 실행 (내부에서 on(...).pipe(...) 호출됨)
  setupFn(on);
  
  // 모든 스트림 구독하고 상태 업데이트
  const state$ = merge(...streams).pipe(
    map(newState => {
      setCurrentState(pathString, newState);
      return newState;
    }),
    shareReplay(1)
  );
  
  stateObservables.set(pathString, state$);
  
  // getter를 만들어서 저장 (memoization)
  if (!stateGetters.has(pathString)) {
    let value = $state<T>(initialValue);
    
    // 구독 설정
    state$.subscribe(newValue => {
      value = newValue;
    });
    
    const getter = () => value;
    stateGetters.set(pathString, getter);
  }
  
  // 항상 같은 getter 반환
  return stateGetters.get(pathString) as () => T;
}