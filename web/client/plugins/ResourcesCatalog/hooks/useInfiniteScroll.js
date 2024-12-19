/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef } from 'react';

const useInfiniteScroll = ({
    scrollContainer,
    shouldScroll = () => true,
    onLoad,
    offset = 200
}) => {
    const updateOnScroll = useRef({});
    updateOnScroll.current = () => {
        const scrollTop = scrollContainer
            ? scrollContainer.scrollTop
            : document.body.scrollTop || document.documentElement.scrollTop;
        const clientHeight = scrollContainer
            ? scrollContainer.clientHeight
            : window.innerHeight;
        const scrollHeight = scrollContainer
            ? scrollContainer.scrollHeight
            : document.body.scrollHeight || document.documentElement.scrollHeight;
        const isScrolled = scrollTop + clientHeight >= scrollHeight - offset;
        if (isScrolled && shouldScroll()) {
            onLoad();
        }
    };
    useEffect(() => {
        let target = scrollContainer || window;
        function onScroll() {
            updateOnScroll.current();
        }
        target.addEventListener('scroll', onScroll);
        return () => {
            target.removeEventListener('scroll', onScroll);
        };
    }, [scrollContainer]);
};

export default useInfiniteScroll;
