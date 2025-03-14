import PropTypes from 'prop-types';

/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { DropdownButton, MenuItem, Glyphicon } from 'react-bootstrap';
import Message from '../I18N/Message';
import tooltip from "../misc/enhancers/tooltip";

const TDropdownButton = tooltip(DropdownButton);
function UserMenuItem({
    href,
    glyph,
    msgId,
    text,
    onClick
}) {
    return (<>
        <MenuItem {...(href ? { href } : {})} onClick={onClick}>
            <Glyphicon glyph={glyph} />{  msgId ? <Message msgId={msgId} /> : text}
        </MenuItem>
    </>
    );
}


UserMenuItem.propTypes = {
    href: PropTypes.string,
    onClick: PropTypes.func,
    glyph: PropTypes.string,
    msgId: PropTypes.string,
    text: PropTypes.string,
    children: PropTypes.node
};

const UserMenu = (props) => {
    const {
        menuItems,
        bsStyle,
        tooltipPosition,
        className,
        id,
        title,
        hidden,
        user
    } = props;


    if (hidden) return null;

    return (
        <TDropdownButton
            id={id}
            noCaret
            pullRight
            bsStyle={bsStyle}
            title={<Glyphicon glyph="user"/>}
            tooltipId="user.userMenu"
            tooltipPosition={tooltipPosition}
            className={className}
        >
            {title}
            {menuItems.map((entry, key) => {
                if (entry.type === 'divider') {
                    return <MenuItem key={key} divider />;
                }
                const href = entry.path ? `#${entry.path}` : null;
                if (entry.Component) {
                    return (
                        <entry.Component
                            key={entry.name || key}
                            itemComponent={UserMenuItem}
                        />
                    );
                }
                return (
                    <UserMenuItem
                        key={entry.name || key}
                        href={href}
                        glyph={entry.glyph}
                        msgId={entry.msgId}
                        text={entry.name}
                    />
                );
            })}
        </TDropdownButton>
    );
};

UserMenu.propTypes = {
    menuItems: PropTypes.array,
    bsStyle: PropTypes.string,
    tooltipPosition: PropTypes.string,
    className: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.node,
    user: PropTypes.object,
    hidden: PropTypes.bool
};

UserMenu.defaultProps = {
    menuItems: [],
    bsStyle: "primary",
    tooltipPosition: "bottom",
    className: "user-menu",
    id: "user-menu",
    title: null,
    user: {},
    hidden: false
};

export default UserMenu;
