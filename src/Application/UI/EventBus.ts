/**
 * UIEventBus — thin wrapper around DOM CustomEvents.
 *
 * Usage:
 *   const unsub = UIEventBus.on('myEvent', (data) => { ... });
 *   UIEventBus.dispatch('myEvent', { foo: 'bar' });
 *   unsub(); // removes the listener
 *
 * on() returns an unsubscribe function. Always call it when the
 * listener is no longer needed (useEffect cleanup, destroy(), etc.)
 * to prevent accumulation of stale listeners on the document.
 */
const UIEventBus = {
    on(event: string, callback: (...args: any[]) => any): () => void {
        const wrapper = (e: Event) => callback((e as CustomEvent).detail);
        document.addEventListener(event, wrapper);
        return () => document.removeEventListener(event, wrapper);
    },

    dispatch(event: string, data: any): void {
        document.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
};

export default UIEventBus;
