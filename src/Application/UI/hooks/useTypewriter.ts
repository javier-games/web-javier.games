import React, { useCallback, useRef } from 'react';

export interface TypewriterConfig {
    /** Minimum delay in ms between characters (default: 50) */
    minDelay?: number;
    /** Maximum delay in ms between characters (default: 170) */
    maxDelay?: number;
    /** Ref tracking component visibility */
    visRef?: React.MutableRefObject<boolean>;
    /**
     * If true, stops the typing loop when visRef.current is false.
     * Use for prompts that should disappear mid-type (e.g. HelpPrompt).
     */
    stopWhenHidden?: boolean;
    /**
     * If true, key events (postMessage) are only emitted when visRef.current is true.
     * Typing still continues. Use for overlays that can type while off-screen (e.g. InfoOverlay).
     */
    keyOnlyWhenVisible?: boolean;
    /**
     * If provided, text is re-read from this ref on each character step.
     * Allows live-updating text (e.g. a clock that keeps ticking while typing).
     */
    liveRef?: React.MutableRefObject<string>;
}

/**
 * Shared typewriter hook. Returns a start(text, onComplete?) function that
 * types out the given text one character at a time, emitting keydown postMessages
 * so the terminal-style cursor animation stays in sync.
 *
 * @example
 * // HelpPrompt — stops typing when hidden
 * const type = useTypewriter(setHelpText, { visRef, stopWhenHidden: true, minDelay: 50, maxDelay: 170 });
 * type(HELP_TEXT);
 *
 * @example
 * // InfoOverlay — chains name → title → time
 * const typeName  = useTypewriter(setNameText,  { visRef, keyOnlyWhenVisible: true });
 * const typeTitle = useTypewriter(setTitleText, { visRef, keyOnlyWhenVisible: true });
 * const typeTime  = useTypewriter(setTimeText,  { visRef, keyOnlyWhenVisible: true, liveRef: timeRef });
 * typeName(NAME_TEXT, () => typeTitle(TITLE_TEXT, () => typeTime(time, onAllDone)));
 */
export function useTypewriter(
    setText: React.Dispatch<React.SetStateAction<string>>,
    config: TypewriterConfig = {}
): (text: string, onComplete?: () => void) => void {
    // Keep config in a ref so the recursive closure always sees the latest values
    // without needing to be recreated on every render.
    const configRef = useRef(config);
    configRef.current = config;

    return useCallback(
        (text: string, onComplete?: () => void) => {
            const {
                minDelay = 50,
                maxDelay = 170,
                visRef,
                stopWhenHidden = false,
                keyOnlyWhenVisible = false,
                liveRef,
            } = configRef.current;

            const step = (i: number, cur: string, base: string) => {
                // liveRef lets the text be updated externally mid-type (e.g. clock)
                const active = liveRef ? liveRef.current : base;

                // HelpPrompt mode: abort entirely when hidden
                if (stopWhenHidden && visRef && !visRef.current) return;

                if (i < active.length) {
                    setTimeout(() => {
                        const sendKey = keyOnlyWhenVisible
                            ? visRef?.current === true
                            : true;

                        if (sendKey) {
                            window.postMessage(
                                { type: 'keydown', key: `_AUTO_${active[i]}` },
                                '*'
                            );
                        }

                        setText(cur + active[i]);
                        step(i + 1, cur + active[i], base);
                    }, Math.random() * (maxDelay - minDelay) + minDelay);
                } else {
                    onComplete?.();
                }
            };

            step(0, '', text);
        },
        // setText is stable (React dispatch), so this callback is effectively
        // created once per component mount.
        [setText]
    );
}
