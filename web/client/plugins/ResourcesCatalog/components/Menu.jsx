/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {forwardRef} from 'react';
import PropTypes from 'prop-types';
import MenuItem from './MenuItem';
import FlexBox from '../../../components/layout/FlexBox';

/**
 * Menu component
 * @name Menu
 * @prop {object[]} items list of menu item
 * @prop {string} className custom class name
 * @prop {string} size button size, one of `xs`, `sm`, `md` or `xl`
 * @prop {bool} alignRight align the dropdown menu to the right
 * @prop {string} variant style for the button, one of `undefined`, `default` or `primary`
 * @prop {any} menuItemComponent a default component to be passed as a prop to a custom `item.Component`
 */
const Menu = forwardRef(({
    items,
    size,
    alignRight,
    variant,
    className,
    menuItemComponent,
    ...props
}, ref) => {

    return (
        <FlexBox
            centerChildrenVertically
            gap="sm"
            {...props}
            component="ul"
            ref={ref}
            className={className}
        >
            {items
                .map((item, idx) => {
                    return (
                        <MenuItem
                            key={idx}
                            variant={item.variant || variant}
                            item={{ ...item, id: item.id !== undefined ? item.id : idx }}
                            size={item.size || size}
                            alignRight={alignRight}
                            menuItemComponent={menuItemComponent}
                        />
                    );
                })}
        </FlexBox>
    );
});

Menu.propTypes = {
    items: PropTypes.array,
    size: PropTypes.string,
    alignRight: PropTypes.bool,
    variant: PropTypes.string,
    className: PropTypes.string,
    menuItemComponent: PropTypes.any
};

Menu.defaultProps = {
    items: []
};

export default Menu;
