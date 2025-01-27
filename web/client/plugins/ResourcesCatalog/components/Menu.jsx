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
import FlexBox from './FlexBox';

/**
* @module components/Menu
*/

/**
 * Menu component
 * @name Menu
 * @prop {array} items list of menu item
 * @prop {string} containerClass css class of list container
 * @prop {string} childrenClass css class of item in list
 * @prop {string} query string to build the query url in case of link item
 * @prop {function} formatHref function to format the href in case of link item
 * @example
 *  <Menu items={items} />
 *
 */
const Menu = forwardRef(({
    items,
    containerClass,
    childrenClass,
    query,
    formatHref,
    size,
    alignRight,
    variant,
    resourceName,
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
            classNames={[containerClass]}
        >
            {items
                .map((item, idx) => {
                    return (
                        <li key={idx}>
                            <MenuItem
                                variant={item.variant || variant}
                                item={{ ...item, id: item.id || idx }}
                                size={item.size || size}
                                alignRight={alignRight}
                                menuItemsProps={{
                                    query,
                                    formatHref
                                }}
                                classItem={childrenClass}
                                resourceName={resourceName}
                                menuItemComponent={menuItemComponent}
                            />
                        </li>
                    );
                })}
        </FlexBox>
    );
});

Menu.propTypes = {
    items: PropTypes.array.isRequired,
    containerClass: PropTypes.string,
    childrenClass: PropTypes.string,
    query: PropTypes.object,
    formatHref: PropTypes.func

};

Menu.defaultProps = {
    items: [],
    query: {},
    user: undefined,
    formatHref: () => '#',
    containerClass: ''
};


export default Menu;
