/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const src = require("./attribution/geosolutions-brand-sm.png");
const assign = require('object-assign');
const tooltip = require('../../components/misc/enhancers/tooltip');
const {isString, trimStart, isFunction} = require('lodash');
const {Nav, NavItem, Glyphicon} = require('react-bootstrap');
const ContainerDimensions = require('react-container-dimensions').default;
const NavItemT = tooltip(NavItem);
const {scrollIntoViewId} = require('../../utils/DOMUtil');

/**
 * Plugin for navigation menu. It renders some items passed as props (or injected by other plugins)
 * An item should contain at least the `position` property to sort items correctly in the menu, one of this properties to be rendered:
 *
 *  - `href`: a link to open
 *  - `linkId`: the Id of an item in the page to scroll to.
 *  - `tool`:  a function that returns the `item` itself. The returned object should contain `href` or `linkId` (useful if you want to inject some components instead of simply configure statically the item)
 *
 * In case of `href`, or `linkId`, the item can also to contain:
 *  - `label`: a node (react element or string, for instance) to render
 *  - `glyph` icon to use when the window's width is less then `minWidth`
 *  - `labelComponent` react element to render as navItem label, label will be visible when screen size is bigger
 *  - `iconComponent` react element to render as navItem on small screen, it should contain only icon
 *
 * Examples:
 * ```
 * {
 *  tool: () => {
 *               position: 0,
 *               label: props.label || 'GeoSolutions',
 *               href: props.href || 'https://www.geo-solutions.it/',
 *               img: props.src && <img className="customer-logo" src={props.src} height="30" /> || <img className="customer-logo" src={src} height="30" />,
 *               logo: true
 *           }
 * }
 * ```
 *
 * @memberof plugins
 * @name NavMenu
 * @class
 * @prop {object[]} items items to render. Note: they can be injected also by the plugin container
 * @prop {number} [minWidth=768] min width to switch between icon and label visualization.
 *
 */
class NavMenu extends React.Component {
    static propTypes = {
        src: PropTypes.string,
        link: PropTypes.string,
        label: PropTypes.node,
        style: PropTypes.object,
        items: PropTypes.array,
        links: PropTypes.array,
        navProps: PropTypes.object,
        minWidth: PropTypes.number
    };

    static defaultProps = {
        src: src,
        link: 'https://www.geo-solutions.it/',
        label: 'GeoSolutions',
        style: {
            position: "absolute",
            width: "124px",
            left: 0,
            bottom: 0
        },
        navProps: {
            pullLeft: true
        },
        minWidth: 768
    };

    getLinks = (width) => {

        return this.props.items && [...this.props.items, ...(this.props.links || [])]
            .filter(item => item.href || item.linkId || item.tool || !item.hide)
            .map(item => item.tool && isFunction(item.tool) && item.tool(item.cfg) || item)
            .sort((itemA, itemB) => itemA.position - itemB.position)
            .map((item, idx) => {
                return width > this.props.minWidth && !item.logo ?
                    this.renderLabeledItem(item, idx) : this.renderIconedItem(item, idx);
            }) || [];
    };

    renderLabeledItem = (item, idx) => {
        return item.labelComponent ? item.labelComponent : (<NavItem
            key={idx}
            target="_blank"
            href={isString(item.href) && !item.linkId && item.href || ""}
            onClick={isString(item.linkId) ? () => scrollIntoViewId(trimStart(item.linkId, '#')) : () => { }}>
            {item.label}
        </NavItem>);
    };

    renderIconedItem = (item, idx) => {
        return item.iconComponent ? item.iconComponent : (<NavItemT
            key={idx}
            target="_blank"
            tooltip={item.label}
            tooltipPosition="bottom"
            href={isString(item.href) && !item.linkId && item.href || ""}
            onClick={isString(item.linkId) ? () => scrollIntoViewId(trimStart(item.linkId, '#')) : () => { }}>
            {item.glyph && <Glyphicon glyph={item.glyph} /> || item.img}
        </NavItemT>);
    };

    render() {
        return (
            <ContainerDimensions>
                {({width}) => (
                    <Nav {...this.props.navProps}>
                        {this.getLinks(width)}
                    </Nav>
                )}
            </ContainerDimensions>
        );
    }
}

module.exports = {
    NavMenuPlugin: assign(NavMenu, {
        OmniBar: {
            position: 5,
            tool: props => <NavMenu {...props}/>,
            priority: 1
        }
    })
};
