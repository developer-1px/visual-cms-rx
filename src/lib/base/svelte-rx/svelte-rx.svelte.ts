import { Subject, filter, map, merge, shareReplay, type Observable, type OperatorFunction, type Subscription } from 'rxjs';

// computed 함수들을 export
export { computed, derive } from './computed.svelte';

interface Action<T = void> {
  type: string;
  (payload: T): ActionPayload<T>;
}

interface ActionPayload<T = void> {
  type: string;
  payload: T;
}

const actionSubject = new Subject<ActionPayload<unknown>>();
let actionCounter = 0;

// DevTool을 위한 액션 스트림 export
export const actionStream$ = actionSubject.asObservable();

// HMR을 위한 subscription 추적
const activeSubscriptions = new Set<Subscription>();

// HMR cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    console.log('[svelte-rx] HMR cleanup: unsubscribing', activeSubscriptions.size, 'subscriptions');
    activeSubscriptions.forEach(sub => sub.unsubscribe());
    activeSubscriptions.clear();
    stateObservables.clear();
    stateGetters.clear();
    // storeValues는 상태 유지를 위해 clear하지 않음
  });
}

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
    console.log('Store:', storeValues);
    console.groupEnd();
  }, 0);
}

interface PipeableStream<T, P> {
  pipe<R>(op: OperatorFunction<[T, P], R>): Observable<R>;
  pipe<A, B>(op1: OperatorFunction<[T, P], A>, op2: OperatorFunction<A, B>): Observable<B>;
  pipe<A, B, C>(op1: OperatorFunction<[T, P], A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C>;
  pipe(...operations: OperatorFunction<unknown, unknown>[]): Observable<unknown>;
}


type GetActionPayloads<T extends Action<unknown>[]> = {
  [K in keyof T]: T[K] extends Action<infer P> ? P : never;
}[number];

// 배열에서 값 타입들 추출
type GetPathValues<T extends readonly unknown[]> = {
  [K in keyof T]: T[K];
};

interface OnFunction<TState> {
  <P>(action: Action<P>): PipeableStream<TState, P>;
  <P>(action: Action<P>, mapper: (state: TState, payload: P) => TState): void;
  
  // computed 지원을 위한 오버로드 - PathProxy와 타입 추론 지원
  <TPath>(dependency: TPath, mapper: (value: TPath) => TState): void;
  
  // 배열 타입 추론
  <TPaths extends readonly unknown[]>(
    dependencies: TPaths,
    mapper: (...values: GetPathValues<TPaths>) => TState
  ): void;
  
  merge<T extends Action<unknown>[]>(...actions: T): PipeableStream<TState, GetActionPayloads<T>>;
  merge<T extends Action<unknown>[]>(...args: [...T, (state: TState, payload: GetActionPayloads<T>) => TState]): void;
  
  // combine 메서드 - 여러 경로를 명시적으로 결합
  combine<T1>(p1: T1, mapper: (v1: T1) => TState): void;
  combine<T1, T2>(
    p1: T1, p2: T2,
    mapper: (v1: T1, v2: T2) => TState
  ): void;
  combine<T1, T2, T3>(
    p1: T1, p2: T2, p3: T3,
    mapper: (v1: T1, v2: T2, v3: T3) => TState
  ): void;
  combine<T1, T2, T3, T4>(
    p1: T1, p2: T2, p3: T3, p4: T4,
    mapper: (v1: T1, v2: T2, v3: T3, v4: T4) => TState
  ): void;
  combine<T1, T2, T3, T4, T5>(
    p1: T1, p2: T2, p3: T3, p4: T4, p5: T5,
    mapper: (v1: T1, v2: T2, v3: T3, v4: T4, v5: T5) => TState
  ): void;
}

const stateObservables: Map<string, Observable<unknown>> = new Map();
const stateGetters: Map<string, () => unknown> = new Map();
export const storeValues: Record<string, any> = {};

// 스토어 변경 추적을 위한 버전
let storeVersion = $state(0);

// 상태 변경 알림을 위한 Subject
const stateChangeSubject = new Subject<{ path: string; value: any }>();
export const stateChange$ = stateChangeSubject.asObservable();

// ============= 유틸리티 함수 =============

// PathProxy를 string으로 변환
function extractPath(pathOrProxy: unknown): string {
  return typeof pathOrProxy === 'string' ? pathOrProxy : (pathOrProxy as any).toString();
}

// PathProxy인지 확인 (action이 아닌 경우)
function isPathLike(obj: unknown): boolean {
  return typeof obj === 'string' || 
    (obj !== null && typeof obj === 'object' && 'toString' in obj && !('type' in obj));
}

// Observable 생성 또는 기존 것 반환
function getOrCreateObservable<T>(path: string, factory: () => Observable<T>): Observable<T> {
  if (!stateObservables.has(path)) {
    stateObservables.set(path, factory().pipe(shareReplay(1)));
  }
  return stateObservables.get(path) as Observable<T>;
}


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
  
  // 스토어 버전 증가 (변경 추적)
  storeVersion++;
  
  // 상태 변경 알림
  stateChangeSubject.next({ path, value });
}


export function reducer<T>(
  path: T, // path는 T 타입을 받음 - PathProxy가 이미 타입을 가지고 있으므로
  initialValue: T,
  setupFn: (on: OnFunction<T>) => void
): () => T {
  // path를 string으로 변환
  const pathString = extractPath(path);
  
  // setupFn을 먼저 실행해서 computed 여부 확인
  const tempOn: OnFunction<T> = Object.assign(
    function (...args: any[]) {
      const firstArg = args[0];
      // PathProxy 또는 string 확인
      const isPathLike = typeof firstArg === 'string' || (firstArg && typeof firstArg.toString === 'function' && !firstArg.type);
      
      if (isPathLike || Array.isArray(firstArg)) {
        // computed의 경우 초기값 계산
        if (!Array.isArray(firstArg)) {
          const mapper = args[1] as (value: any) => T;
          const path = extractPath(firstArg);
          const value = getCurrentState(path);
          initialValue = mapper(value);
        } else {
          const mapper = args[1] as (...values: any[]) => T;
          const paths = firstArg.map(extractPath);
          const values = paths.map(path => getCurrentState(path));
          initialValue = mapper(...values);
        }
      }
      return undefined as any;
    },
    { 
      merge: () => undefined as any,
      combine: (...args: any[]) => {
        // combine의 경우도 computed로 처리
        const mapper = args[args.length - 1] as (...values: any[]) => T;
        const paths = args.slice(0, -1).map(extractPath);
        const values = paths.map(path => getCurrentState(path));
        initialValue = mapper(...values);
        return undefined as any;
      }
    }
  );
  
  // 첫 번째 패스: computed 확인 및 초기값 계산
  setupFn(tempOn as any);
  
  // 초기값을 store에 설정
  setCurrentState(pathString, initialValue);
  
  const streams: Observable<T>[] = [];
  
  // 스트림을 수집하는 헬퍼 함수
  const collectStream = (stream$: Observable<T>) => {
    streams.push(stream$);
  };
  
  const on: OnFunction<T> = Object.assign(
    function (...args: any[]) {
      const firstArg = args[0];
      const secondArg = args[1];
      
      
      // Case 1: on(string or PathProxy, mapper) - single dependency computed
      if (isPathLike(firstArg) && typeof secondArg === 'function') {
        const dependency = extractPath(firstArg);
        const mapper = secondArg as (value: any) => T;
        
        const stream$ = stateChangeSubject.pipe(
          filter(change => change.path === dependency),
          map(change => mapper(change.value))
        ) as Observable<T>;
        
        collectStream(stream$);
        return undefined as any;
      }
      
      // Case 2: on(array of strings or PathProxies, mapper) - multiple dependencies computed
      if (Array.isArray(firstArg) && typeof secondArg === 'function') {
        const dependencies = firstArg.map(extractPath);
        const mapper = secondArg as (...values: any[]) => T;
        
        const stream$ = stateChangeSubject.pipe(
          filter(change => dependencies.some(dep => 
            dep.startsWith(change.path) || change.path.startsWith(dep)
          )),
          map(() => {
            const values = dependencies.map(dep => getCurrentState(dep));
            return mapper(...values);
          })
        ) as Observable<T>;
        
        collectStream(stream$);
        return undefined as any;
      }
      
      // Case 3: on(action) or on(action, mapper) - original action handling
      const action = firstArg as Action<any>;
      const mapper = secondArg as ((state: T, payload: any) => T) | undefined;
      
      // 매퍼 함수가 제공되면 바로 처리
      if (mapper) {
        const stream$ = actionSubject.pipe(
          filter(actionPayload => actionPayload.type === action.type),
          map((actionPayload: ActionPayload<any>) => {
            const currentState = getCurrentState(pathString) as T;
            return mapper(currentState, actionPayload.payload);
          })
        ) as Observable<T>;
        
        collectStream(stream$);
        return undefined as any;
      }
      
      // 매퍼가 없으면 pipe 가능한 객체 반환
      return {
        pipe: (...operators: any[]) => {
          const stream$ = actionSubject.pipe(
            filter(actionPayload => actionPayload.type === action.type),
            map((actionPayload: ActionPayload<any>) => {
              const currentState = getCurrentState(pathString) as T;
              return [currentState, actionPayload.payload] as [T, any];
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
          return undefined as any;
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
      },
      combine(...args: any[]) {
        // 마지막 인자는 항상 mapper 함수
        const mapper = args[args.length - 1] as (...values: any[]) => T;
        const paths = args.slice(0, -1).map(extractPath);
        
        // 배열 형태로 처리
        const stream$ = stateChangeSubject.pipe(
          filter(change => paths.some(path => 
            path.startsWith(change.path) || change.path.startsWith(path)
          )),
          map(() => {
            const values = paths.map(path => getCurrentState(path));
            return mapper(...values);
          })
        ) as Observable<T>;
        
        collectStream(stream$);
        return undefined as any;
      }
    }
  );
  
  // setupFn 실행 (내부에서 on(...).pipe(...) 호출됨)
  setupFn(on);
  
  // 모든 스트림 구독하고 상태 업데이트
  const state$ = getOrCreateObservable(pathString, () => 
    merge(...streams).pipe(
      map(newState => {
        setCurrentState(pathString, newState);
        return newState;
      })
    )
  );
  
  // getter를 만들어서 저장 (memoization)
  if (!stateGetters.has(pathString)) {
    let value = $state<T>(initialValue);
    
    // 구독 설정 및 추적
    const subscription = state$.subscribe((newValue: T) => {
      value = newValue;
    });
    activeSubscriptions.add(subscription);
    
    const getter = () => value;
    stateGetters.set(pathString, getter);
  }
  
  // 항상 같은 getter 반환
  return stateGetters.get(pathString) as () => T;
}