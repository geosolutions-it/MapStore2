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
import NavLink from './MenuNavLink';
import Icon from './Icon';
import { Dropdown, MenuItem, Badge } from 'react-bootstrap';

const isValidBadgeValue = (badge) => !!badge || badge === 0;

const itemsList = (items) => (items && items.map((item, idx) => {

    const { labelId, href, badge, target, type, Component, className } = item;

    if (type === 'plugin' && Component) {
        return (<li key={idx}><Component variant="default" className={className} showMessage /></li>);
    }

    return (
        <NavLink key={idx} href={href} target={target}>{labelId && <Message msgId={labelId} />}
            { isValidBadgeValue(badge) && <Badge>{badge}</Badge>}
        </NavLink>
    );
} ));

/**
 * DropdownList component
 * @name DropdownList
 * @memberof components.Menu.DropdownList
 * @prop {number} id to apply to toogle
 * @prop {array} items list od items of Dropdown
 * @prop {string} label label to apply to toogle
 * @prop {string} labelId alternative to label
 * @prop {string} labelId alternative to labe
 * @prop {object} toggleStyle inline style to apply to toogle comp
 * @prop {string} toggleImage image to apply to toogle comp
 * @prop {string} toggleIcon icon to apply to toogle comp
 * @prop {string} dropdownClass the css class to apply to the comp
 * @prop {number} tabIndex define navigation order
 * @prop {boolean} noCaret hide/show caret icon on the dropdown
 * @prop {number} badgeValue to apply the value to the item in list
 * @prop {node} containerNode the node to append the child element into a DOM
 * @example
 *  <DropdownList
 *           id={id}
 *           items={items}
 *           label={label}
 *           labelId={labelId}
 *           toggleStyle={style}
 *           toggleImage={image}
 *           toggleIcon={icon}
 *           state={state}
 *           noCaret={noCaret}
 *           dropdownClass={classItem}
 *           tabIndex={tabIndex}
 *           badgeValue={badgeValue}
 *           containerNode={containerNode}
 *       />
 *
 */


const MenuDropdownList = ({
    id,
    items,
    label,
    labelId,
    toggleStyle,
    toggleImage,
    toggleIcon,
    dropdownClass,
    tabIndex,
    badgeValue,
    containerNode,
    size,
    noCaret,
    alignRight,
    variant,
    responsive
}) => {

    const dropdownItems = items
        .map((itm, idx) => {

            if (itm.type === 'plugin' && itm.Component) {
                return (<li key={idx}><itm.Component variant="default" className={itm.className} showMessage /></li>);
            }
            if (itm.type === 'divider') {
                return <MenuItem key={idx} divider />;
            }
            return (
                <React.Fragment key={idx}>
                    <MenuItem
                        href={itm.href}
                        style={itm.style}
                        as={itm?.items ? 'span' : 'a' }
                        target={itm.target}
                        className={itm.className}
                    >
                        {itm.labelId && <Message msgId={itm.labelId} /> || itm.label}
                        {isValidBadgeValue(itm.badge) && <Badge>{itm.badge}</Badge>}
                    </MenuItem>

                    {itm?.items && <div className={`ms-sub-flat-menu-block`}>
                        {itemsList(itm?.items)}
                    </div>}
                </React.Fragment>
            );
        });

    const DropdownToggle = (
        <Dropdown.Toggle
            id={ `ms-toggle-dropdown-${id}`}
            bsStyle={variant}
            tabIndex={tabIndex}
            style={toggleStyle}
            bsSize={size}
            noCaret={noCaret}
        >
            {toggleImage
                ? <img src={toggleImage} />
                : undefined
            }
            {
                toggleIcon ? <Icon glyph={toggleIcon} />
                    : undefined
            }
            {
                (labelId && !responsive) &&
                <Message msgId={labelId} /> || label
            }
            {
                (labelId && responsive) &&
                <div className="ms-content-responsive">
                    <span><Message msgId={labelId} /></span>
                    <span><Icon name="plus" /></span>
                </div>
            }
            {isValidBadgeValue(badgeValue) && <Badge>{badgeValue}</Badge>}
        </Dropdown.Toggle>

    );


    return (
        <Dropdown
            id={`ms-dropdown-${id}`}
            className={`${dropdownClass}`}
            pullRight={alignRight}
        >
            {DropdownToggle}
            {containerNode
                ? createPortal(<Dropdown.Menu>
                    {dropdownItems}
                </Dropdown.Menu>, containerNode.parentNode)
                : <Dropdown.Menu>
                    {dropdownItems}
                </Dropdown.Menu>}
        </Dropdown>
    );

};

MenuDropdownList.propTypes = {
    items: PropTypes.array.isRequired,
    label: PropTypes.string,
    labelId: PropTypes.string,
    toggleStyle: PropTypes.object,
    toggleImage: PropTypes.string,
    state: PropTypes.object,
    noCaret: PropTypes.bool,
    dropdownClass: PropTypes.string,
    tabIndex: PropTypes.number,
    containerNode: PropTypes.element

};

export default MenuDropdownList;
