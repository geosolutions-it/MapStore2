/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useRef, useEffect } from 'react';
/**
 * check if a component is still mounted
 * @example
 * @return {func} function that accept as argument a callback, the callback is triggered only if the component is mounted
 * function Component({ update }) {
 *  const isMounted = useIsMounted();
 *  const [count, setCount] = useState(0);
 *  useEffect(() => {
 *      request().then(() =>
 *          isMounted(() => {
 *              setCount(prevCount => prevCount + 1)
 *          })
 *      );
 *  }, [update]);
 *  return <div>{count}</div>;
 * }
 */
const useIsMounted = () => {
    const isMounted = useRef();
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);
    return (callback) => {
        if (callback && isMounted.current) {
            callback(!!isMounted.current);
        }
        return !!isMounted.current;
    };
};
export default useIsMounted;
