/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import castArray from 'lodash/castArray';
import { Badge } from 'react-bootstrap';
import Message from '../../../components/I18N/Message';

import DropdownList from './MenuDropdownList';
import MenuNavLink from './MenuNavLink';
import Icon from './Icon';
import Button from './Button';

const isValidBadgeValue = (badge) => !!badge || badge === 0;

/**
 * Menu item component
 * @name MenuItem
 * @memberof components.Menu.MenuItem
 * @prop {object} item the item menu
 * @prop {object} menuItemsProps contains pros to apply to items, to manage single permissions, build href and query url
 * @prop {node} containerNode the node to append the child element into a DOM
 * @prop {number} tabIndex define navigation order
 * @prop {boolean} draggable is element is draggable
 * @prop {function} classItem class to apply to the Item
 * @example
 *  <MenuItem
 *            tabIndex={tabindex}
 *            item={{ ...item, id: item.id || idx }}
 *            draggable={false}
 *            menuItemsProps={menuItemsProps}
 *            containerNode={containerNode.current}
 *  />
 *
 */

const MenuItem = ({ item, menuItemsProps, containerNode, tabIndex, classItem = '', size, alignRight, variant, resourceName }) => {

    const { formatHref, query } = menuItemsProps;
    const {
        id,
        type,
        label,
        labelId = '',
        items = [],
        href,
        style,
        badge = '',
        image,
        Component,
        target,
        className,
        responsive,
        noCaret,
        glyph,
        iconType,
        square,
        tooltipId,
        src
    } = item;
    const btnClassName = `btn${variant && ` btn-${variant}` || ''}${size && ` btn-${size}` || ''}${className ? ` ${className}` : ''} _border-transparent`;

    const labelNode = labelId ? <Message msgId={labelId} msgParams={{ resourceName }} /> : label;

    const badgeValue = badge;
    if (type === 'dropdown') {
        return (<DropdownList
            id={id}
            items={items}
            label={label}
            labelId={labelId}
            toggleStyle={style}
            toggleImage={image}
            dropdownClass={`${classItem}${className ? ` ${className}` : ''}`}
            tabIndex={tabIndex}
            badgeValue={badgeValue}
            containerNode={containerNode}
            size={size}
            alignRight={alignRight}
            variant={variant}
            responsive={responsive}
            noCaret={noCaret}
        />);
    }

    if ((type === 'custom' || type === 'plugin') && Component) {
        return <Component variant={variant} size={size} className={className}/>;
    }

    if (type === 'link') {
        return (
            <MenuNavLink href={href} target={target} className={btnClassName}>
                {glyph ? <Icon glyph={glyph} type={iconType}/> : null}
                {glyph && labelNode ? ' ' : null}
                {labelNode}
            </MenuNavLink>
        );

    }

    if (type === 'logo') {
        const imageNode = <img src={src} style={{ width: 'auto', height: '2rem', objectFit: 'contain', ...style }} />;
        return href ? (
            <MenuNavLink href={href} target={target}>
                {imageNode}
            </MenuNavLink>
        ) : imageNode;

    }

    if (type === 'button') {
        return (
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
        );
    }

    if (type === 'divider') {
        return <div className="ms-menu-divider" style={style}></div>;
    }

    if (type === 'placeholder') {
        return <span />;
    }

    if (type === 'filter') {
        const active = castArray(query.f || []).find(value => value === item.id);
        return (
            <MenuNavLink
                target={target}
                style={style}
                href={formatHref({
                    query: { f: item.id },
                    replaceQuery: active ? false : true
                })}
                className={btnClassName}
            >
                {glyph ? <Icon glyph={glyph} type={iconType}/> : null}
                {glyph && labelNode ? ' ' : null}
                {labelNode}
                {isValidBadgeValue(badgeValue) && <Badge>{badgeValue}</Badge>}
            </MenuNavLink>
        );
    }
    return null;
};

MenuItem.propTypes = {
    item: PropTypes.object.isRequired,
    menuItemsProps: PropTypes.object.isRequired,
    containerNode: PropTypes.element,
    tabIndex: PropTypes.number,
    draggable: PropTypes.bool,
    classItem: PropTypes.string

};

export default MenuItem;
