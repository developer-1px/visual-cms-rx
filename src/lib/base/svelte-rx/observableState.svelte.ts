import { type Observable, type Subscription } from 'rxjs';

// Creates a reactive state from an observable that changes based on a condition
export function observableState<T>(
  getObservable: () => Observable<T> | null,
  initialValue: T | null = null
) {
  let value = $state<T | null>(initialValue);
  let subscription: Subscription | null = null;
  let currentObservable: Observable<T> | null = null;
  
  $effect(() => {
    const observable = getObservable();
    
    // If same observable, skip
    if (observable === currentObservable) {
      return;
    }
    
    // Cleanup previous subscription
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
    
    currentObservable = observable;
    
    // If no observable, reset to initial value
    if (!observable) {
      value = initialValue;
      return;
    }
    
    // Subscribe to new observable
    subscription = observable.subscribe(v => {
      value = v;
    });
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
        subscription = null;
      }
      currentObservable = null;
    };
  });
  
  return () => value;
}