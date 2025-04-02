import PropTypes from 'prop-types';

/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useState} from 'react';
import { DropdownButton, MenuItem, Glyphicon } from 'react-bootstrap';
import Message from '../I18N/Message';
import tooltip from "../misc/enhancers/tooltip";
import ConfirmModal from '../misc/ResizableModal';

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
    const [isOpen, setIsOpen] = useState(false);
    const {
        menuItems,
        bsStyle,
        tooltipPosition,
        className,
        id,
        title,
        hidden,
        displayUnsavedDialog,
        onCloseUnsavedDialog,
        onLogoutConfirm,
        ...other
    } = props;

    if (hidden) return null;

    const handleItemClick = (onClick) => {
        setIsOpen(false);
        if (onClick) {
            onClick();
        }
    };

    return (
        <>
            <TDropdownButton
                id={id}
                noCaret
                pullRight
                bsStyle={bsStyle}
                title={<Glyphicon glyph="user"/>}
                tooltipId="user.userMenu"
                tooltipPosition={tooltipPosition}
                className={className}
                open={isOpen}
                onToggle={(open) => setIsOpen(open)}
            >
                {title ? <MenuItem header>{title}</MenuItem> : null}
                {menuItems.map((entry, key) => {
                    if (entry.type === 'divider') {
                        return <MenuItem key={key} divider />;
                    }
                    const href = entry.path ? `#${entry.path}` : null;
                    if (entry.Component) {
                        return (
                            <entry.Component
                                key={entry.name || key}
                                itemComponent={(properties) => (
                                    <UserMenuItem
                                        {...properties}
                                        onClick={() => handleItemClick(properties.onClick)}
                                    />
                                )}
                                {...other}
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
            <ConfirmModal
                show={displayUnsavedDialog || false}
                onClose={onCloseUnsavedDialog}
                title={<Message msgId="resources.maps.unsavedMapConfirmTitle" />}
                buttons={[{
                    bsStyle: "primary",
                    text: <Message msgId="resources.maps.unsavedMapConfirmButtonText" />,
                    onClick: onLogoutConfirm
                }, {
                    text: <Message msgId="resources.maps.unsavedMapCancelButtonText" />,
                    onClick: onCloseUnsavedDialog
                }]}
                fitContent
            >
                <div className="ms-detail-body">
                    <Message msgId="resources.maps.unsavedMapConfirmMessage" />
                </div>
            </ConfirmModal>
        </>

    );
};

UserMenu.propTypes = {
    menuItems: PropTypes.array,
    bsStyle: PropTypes.string,
    tooltipPosition: PropTypes.string,
    className: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.node,
    hidden: PropTypes.bool,
    displayUnsavedDialog: PropTypes.bool,
    onCloseUnsavedDialog: PropTypes.func,
    onLogoutConfirm: PropTypes.func
};

UserMenu.defaultProps = {
    menuItems: [],
    bsStyle: "primary",
    tooltipPosition: "bottom",
    className: "user-menu",
    id: "user-menu",
    title: null,
    hidden: false,
    displayUnsavedDialog: false,
    onCloseUnsavedDialog: () => {},
    onLogoutConfirm: ()=>{}
};

export default UserMenu;
