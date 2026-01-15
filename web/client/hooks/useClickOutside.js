/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef } from 'react';

/**
 * Hook to detect clicks outside of a component
 * @param {function} callback - Function to call when a click outside is detected
 * @param {boolean} isActive - Whether the hook should be active (default: true)
 * @returns {object} ref - React ref to attach to the element
 * @example
 * function Component() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const ref = useClickOutside(() => setIsOpen(false), isOpen);
 *   return (
 *     <div ref={ref}>
 *       {isOpen && <div>Content</div>}
 *     </div>
 *   );
 * }
 */
const useClickOutside = (callback, isActive = true) => {
    const ref = useRef(null);

    useEffect(() => {
        if (!isActive) {
            return () => {};
        }

        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback(event);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [callback, isActive]);

    return ref;
};

export default useClickOutside;
