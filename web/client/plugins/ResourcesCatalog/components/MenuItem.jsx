/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Message from '../../../components/I18N/Message';
import HTML from '../../../components/I18N/HTML';
import { Dropdown, MenuItem as RBMenuItem } from 'react-bootstrap';
import MenuNavLink from './MenuNavLink';
import Icon from './Icon';
import Button from '../../../components/layout/Button';

/**
 * List of menu items for the `dropdown` type
 * @name DropdownMenuItems
 * @prop {object[]} items list of items
 */
const DropdownMenuItems = ({
    items
}) => {
    return <>
        {items
            .map((itm, idx) => {
                if (itm.Component) {
                    return (<itm.Component key={idx} variant="default" className={itm.className} showMessage />);
                }
                if (itm.type === 'divider') {
                    return <RBMenuItem key={idx} divider />;
                }
                const labelNode = itm.labelId ? <Message msgId={itm.labelId} /> : itm.label;
                return (
                    <React.Fragment key={idx}>
                        <RBMenuItem
                            href={itm.href}
                            style={itm.style}
                            as={itm?.items ? 'span' : 'a' }
                            target={itm.target}
                            className={itm.className}
                        >
                            {itm.glyph ? <Icon glyph={itm.glyph} type={itm.iconType}/> : null}
                            {itm.glyph && labelNode ? ' ' : null}
                            {labelNode}
                        </RBMenuItem>

                        {itm?.items && <div className="ms-nested-menu-items">
                            <DropdownMenuItems items={itm?.items}/>
                        </div>}
                    </React.Fragment>
                );
            })}
    </>;
};

/**
 * Menu item component
 * @name MenuItem
 * @prop {object} item the item menu
 * @prop {string} item.type menu type, one of `dropdown`, `link`, `logo`, `button`, `divider`, `placeholder` and `message`
 * @prop {string} item.Component custom component for the menu item, it has priority over the `type`
 * @prop {object[]} item.items list of items (`dropdown` type)
 * @prop {string} item.id menu item identifier (`dropdown` type)
 * @prop {string} item.noCaret hide the caret (`dropdown` type)
 * @prop {string} item.label label rendered as menu item content
 * @prop {string} item.labelId a message id rendered as menu item content, it has priority over label
 * @prop {string} item.href a url link for the menu item
 * @prop {string} item.target link html target attribute
 * @prop {string} item.style custom inline style
 * @prop {string} item.className custom class name
 * @prop {string} item.glyph glyph name
 * @prop {string} item.iconType glyph types (see `Icon` component)
 * @prop {string} item.square square style for button
 * @prop {string} item.tooltipId tooltip message id
 * @prop {string} item.src image source
 * @prop {node} containerNode the node to append the child element into a DOM
 * @prop {number} tabIndex define navigation order
 * @prop {string} size button size, one of `xs`, `sm`, `md` or `xl`
 * @prop {bool} alignRight align the dropdown menu to the right
 * @prop {string} variant style for the button, one of `undefined`, `default` or `primary`
 * @prop {any} menuItemComponent a default component to be passed as a prop to a custom `item.Component`
 */
const MenuItem = ({
    item,
    containerNode,
    tabIndex,
    size,
    alignRight,
    variant,
    menuItemComponent
}) => {

    const {
        id,
        type,
        label,
        labelId = '',
        items = [],
        href,
        style,
        Component,
        target,
        className,
        noCaret,
        glyph,
        iconType,
        square,
        tooltipId,
        src
    } = item || {};

    if (Component) {
        return <Component variant={variant} size={size} className={className} component={menuItemComponent}/>;
    }

    const labelNode = labelId ? <Message msgId={labelId} /> : label;

    if (type === 'dropdown') {
        return (<li>
            <Dropdown
                id={`ms-dropdown-${id}`}
                className={`${className ? ` ${className}` : ''}`}
                pullRight={alignRight}
            >
                <Dropdown.Toggle
                    id={ `ms-toggle-dropdown-${id}`}
                    bsStyle={variant}
                    tabIndex={tabIndex}
                    style={style}
                    bsSize={size}
                    noCaret={noCaret}
                >
                    {src
                        ? <img src={src} />
                        : (
                            <>
                                {glyph ? <Icon glyph={glyph} type={iconType}/> : null}
                                {glyph && labelNode ? ' ' : null}
                                {labelNode}
                            </>
                        )}
                </Dropdown.Toggle>
                {containerNode
                    ? createPortal(<Dropdown.Menu>
                        <DropdownMenuItems items={items} />
                    </Dropdown.Menu>, containerNode.parentNode)
                    : <Dropdown.Menu>
                        <DropdownMenuItems items={items} />
                    </Dropdown.Menu>}
            </Dropdown>
        </li>);
    }

    if (type === 'link') {
        return (<li>
            <MenuNavLink href={href} target={target}>
                {glyph ? <Icon glyph={glyph} type={iconType}/> : null}
                {glyph && labelNode ? ' ' : null}
                {labelNode}
            </MenuNavLink>
        </li>);

    }

    if (type === 'logo') {
        const imageNode = <img src={src} style={{ width: 'auto', height: '2rem', objectFit: 'contain', ...style }} />;
        return (<li>{href ? (
            <MenuNavLink href={href} target={target}>
                {imageNode}
            </MenuNavLink>
        ) : imageNode}</li>);

    }

    if (type === 'button') {
        return (<li>
            <Button
                square={square}
                tooltipId={tooltipId}
                variant={variant}
                size={size}
                href={href}
                target={target}
                borderTransparent
            >
                {glyph ? <Icon glyph={glyph} type={iconType}/> : null}
                {glyph && labelNode ? ' ' : null}
                {labelNode}
            </Button>
        </li>);
    }

    if (type === 'divider') {
        return <li><div className="ms-menu-divider" style={style}></div></li>;
    }

    if (type === 'placeholder') {
        return <li><span /></li>;
    }

    if (type === 'message' && labelId) {
        return <li><HTML msgId={labelId} /></li>;
    }

    return null;
};

MenuItem.propTypes = {
    item: PropTypes.object,
    containerNode: PropTypes.element,
    tabIndex: PropTypes.number,
    draggable: PropTypes.bool,
    size: PropTypes.string,
    alignRight: PropTypes.bool,
    variant: PropTypes.string,
    menuItemComponent: PropTypes.any
};

export default MenuItem;
