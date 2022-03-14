/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {forwardRef, useEffect, useMemo, useState} from 'react';
import {Button, SplitButton} from 'react-bootstrap';
import classNames from 'classnames';


import './TSplitButton.css';

export const TSplitButtonPaged = forwardRef(({ disabled, id, visible, onClick, glyph, active, className = "square-button-md", rawItems, children, onItemClick, ...props }, ref) => {
    if (!visible) return false;
    const [page, setPage] = useState({});
    const [isShown, setIsShown] = useState(false);

    useEffect(() => {
        setPage({});
        if (!Array.isArray(children)) {
            throw new Error('TSplitButtonPaged expects children to be an array of objects that represent groups of items');
        }
    }, [rawItems]);

    const elements = useMemo(() => {
        const items = [];
        children.forEach((group, idx) => {
            const pages = group?.pageSize > 0 ? Math.ceil(group.items.length / group.pageSize) : 1;
            const isVisible = group.visible || typeof group?.visible === 'undefined';
            if (isVisible && group.items.length) {
                const p = page[idx] ?? 1;
                const slice = group.pageSize ? group.items.slice(group.pageSize * (p - 1), group.pageSize * p) : group.items;
                items.push(...[
                    ...(group.header ? [group.header] : []),
                    ...(slice.map((item) => React.cloneElement(item, { onClick: () => onItemClick(item.props.id) }))),
                    ...(pages > 1 ? [<div className="split-button-pagination">
                        <Button className="pagination-previous" disabled={p === 1} onClick={() => setPage({...page, [idx]: p - 1})}>&larr;</Button>
                        <Button className="pagination-next" disabled={p === pages} onClick={() => setPage({...page, [idx]: p + 1})}>&rarr;</Button>
                    </div>] : [])
                ]);
            }
        });
        return items;
    }, [rawItems, page]);

    const onToggleHandler = (isOpen, e, metadata) => {
        if  (metadata.source === 'select') {
            !e && setIsShown(true);
            e && setIsShown(isOpen);
        }
        if  (metadata.source === 'click' && e) {
            setIsShown(isOpen);
        }
    };

    return (<SplitButton ref={ref} {...props} bsStyle={active ? "success" : "primary"} disabled={disabled} id={`fg-${id}`}
        className={classNames({
            'split-button': true,
            [className]: true
        })}
        open={isShown}
        onToggle={onToggleHandler}
        onClick={() => !disabled && onClick()}
    >
        {elements}
    </SplitButton>
    );
});


export default TSplitButtonPaged;
