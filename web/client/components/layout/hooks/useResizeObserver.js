import { useRef, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';

const DEFAULT_KEYS = ['width', 'height'];

const useResizeObserver = ({
    onResize = () => {},
    watch = DEFAULT_KEYS,
    debounceTime = 100
} = {}) => {
    const elementRef = useRef(null);
    const prevRef = useRef({});

    const debouncedResize = useMemo(
        () =>
            debounce((element) => {
                if (!element) return;

                const rect = element.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                const values = {
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    left: rect.left,
                    right: viewportWidth - rect.right,
                    bottom: viewportHeight - rect.bottom
                };

                const changed = {};

                watch.forEach((key) => {
                    const value = values[key];
                    if (prevRef.current[key] !== value) {
                        changed[key] = value;
                    }
                });

                if (Object.keys(changed).length > 0) {
                    prevRef.current = {
                        ...prevRef.current,
                        ...changed
                    };
                    onResize(changed);
                }
            }, debounceTime),
        [onResize, watch, debounceTime]
    );

    useEffect(() => {
        const element = elementRef.current;
        if (!element || watch.length === 0) return null;

        const observer = new ResizeObserver(() => {
            debouncedResize(element);
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
            debouncedResize.cancel();
        };
    }, [debouncedResize, watch]);

    return elementRef;
};

export default useResizeObserver;
