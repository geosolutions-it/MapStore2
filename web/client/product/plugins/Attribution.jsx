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
const {isString, trimStart} = require('lodash');
const {Nav, NavItem, Glyphicon} = require('react-bootstrap');
const Img = tooltip(props => (<img {...props}/>));
const ContainerDimensions = require('react-container-dimensions').default;
const NavItemT = tooltip(NavItem);

class Attribution extends React.Component {
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
            .filter(item => item.href || item.linkId)
            .sort((itemA, itemB) => itemA.position > itemB.position)
            .map((item, idx) => (
            width > this.props.minWidth ?
            <NavItem
                key={idx}
                target="_blank"
                href={isString(item.href) && !item.linkId && item.href}
                onClick={isString(item.linkId) ? () => this.scroolIntoView(item.linkId) : () => {}}>
                {item.label}
            </NavItem>
            :
            <NavItemT
                key={idx}
                target="_blank"
                tooltip={item.label}
                tooltipPosition="bottom"
                href={isString(item.href) && !item.linkId && item.href}
                onClick={isString(item.linkId) ? () => this.scroolIntoView(item.linkId) : () => {}}>
                {item.glyph && <Glyphicon glyph={item.glyph}/> || item.img}
            </NavItemT>
        )) || [];
    };

    render() {
        return (
            <ContainerDimensions>
            {({width}) => (
                <Nav {...this.props.navProps}>
                    {this.props.src && <NavItem href={this.props.link}>
                        <Img tooltip={this.props.label} alt={this.props.label} tooltipPosition="bottom" height={30} src={this.props.src}/>
                    </NavItem>}
                    {this.getLinks(width)}
                </Nav>
            )}
            </ContainerDimensions>
        );
    }

    scroolIntoView = linkId => {
        const node = document.getElementById(trimStart(linkId, '#'));
        if (node && node.scrollIntoView) {
            node.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
    };
}

module.exports = {
    AttributionPlugin: assign(Attribution, {
        OmniBar: {
            position: 5,
            tool: props => <Attribution {...props}/>,
            priority: 1
        }
    })
};
