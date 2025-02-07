/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useRef, useEffect } from 'react';

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
