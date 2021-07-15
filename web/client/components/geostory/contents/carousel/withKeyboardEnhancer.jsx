/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {createRef, useEffect} from 'react';
import findIndex from 'lodash/findIndex';

export default (Component) => (props) => {
    const cardRef = createRef();
    const onTraverseCard = (e) => {
        const currentIndex = findIndex(props.items, ({id}) => id === props.selectedId);
        if ([37, 38].includes(e.keyCode)) {
            let id;
            if (e.keyCode === 37) {
                id = props.items?.[currentIndex === 0 ? 0 : currentIndex - 1]?.id;
            } else {
                id = props.items?.[currentIndex === props.items.length - 1 ? currentIndex : currentIndex + 1]?.id;
            }
            props.update(`sections[{"id":"${props.sectionId}"}].contents[{"id":"${id}"}].carouselToggle`, true);
        }
    };
    const onClickCard = () => {
        props.update(`sections[{"id":"${props.sectionId}"}].contents[{"id":"${props.id}"}].carouselToggle`, true);
    };
    useEffect(() => {
        const [element] = document.getElementsByClassName('items-wrapper');
        element?.addEventListener('keydown', onTraverseCard);
        element?.addEventListener('onclick', onClickCard);
        return () => {
            element?.removeEventListener('keydown', onTraverseCard);
            element?.removeEventListener('onclick', onClickCard);
        };
    }, [onClickCard]);
    return <Component ref={cardRef} {...props} onClick={onClickCard} />;
};
