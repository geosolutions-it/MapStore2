/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const {Glyphicon, DropdownButton} = require('react-bootstrap');
const tooltip = require('../../misc/enhancers/tooltip');
const React = require('react');
const uuidv1 = require('uuid/v1');

const DropdownButtonT = tooltip(DropdownButton);

const defaultButtonConfig = {
    disabled: false,
    className: "square-button-md",
    noCaret: true,
    idDropDown: uuidv1()
};
const buttonConfig = {
    title: <Glyphicon glyph="menu-hamburger"/>,
    tooltipId: "search.changeSearchInputField",
    tooltipPosition: "bottom",
    className: "square-button-md no-border",
    pullRight: true
};

/**
 * SearchBarMenu component to render wrappedComponent menu items
 * @memberof SearchBar
 * @param {object} props Component props
 * @param {array} props.menuItems list of menuItems to display under drop down
 * @param {bool} props.disabled enable/disable the drop down
 *
 */
const SearchBarMenu = ({
    menuItems = [],
    disabled = false
} = {}) => (
    <DropdownButtonT disabled={disabled} {...defaultButtonConfig} {...buttonConfig}>
        {menuItems.length ? menuItems.map(menuItem => menuItem) : null}
    </DropdownButtonT>
);
module.exports = SearchBarMenu;
