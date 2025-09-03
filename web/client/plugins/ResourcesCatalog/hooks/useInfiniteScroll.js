/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef } from 'react';

/**
 * provides infinite scroll controls on a selected component
 * @param {node} props.scrollContainer scroll container node target, default `window`
 * @param {func} props.shouldScroll check if the container should scroll and add new content
 * @param {func} props.onLoad callback to load new content
 * @param {number} props.offset value in px as threshold to trigger a new load request
 * @example
 * function ScrollableComponent() {
 *  const ref = useRef();
 *  const [page, setPage] = useState(1);
 *  const [loading, setLoading] = useState(false);
 *  const [isNextPageAvailable, setIsNextPageAvailable] = useState(false);
 *  const [records, setRecords] = useState([]);
 *  const isMounted = useIsMounted();
 *  useInfiniteScroll({
 *      scrollContainer: ref.current,
 *      shouldScroll: () => !loading && isNextPageAvailable,
 *      onLoad: () => {
 *          setPage(page + 1);
 *      }
 *  });
 *  useEffect(() => {
 *      setLoading(true);
 *      request({ page })
 *          .then((response) => isMounted(() => {
 *              setIsNextPageAvailable(response.isNextPageAvailable);
 *              setRecords(page === 1 ? response.records : [...records, ...response.records]);
 *          }))
 *          .finally(() => isMounted(() => {
 *              setLoading(false);
 *          }));
 *  }, [page]);
 *  return (
 *      <ul ref={ref} style={{ height: 200, overflow: 'auto' }}>
 *          {records.map((record, idx) => <li key={idx}>{idx}</li>)}
 *      </ul>
 *  );
 * }
 */
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
