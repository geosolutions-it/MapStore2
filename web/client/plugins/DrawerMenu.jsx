/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');

const Message = require('./locale/Message');

const {toggleControl, setControlProperty} = require('../actions/controls');

const {changeMapStyle} = require('../actions/map');

const {Button, Glyphicon, Panel} = require('react-bootstrap');

const Section = require('./drawer/Section');

const {partialRight} = require('lodash');

const Menu = connect((state) => ({
    show: state.controls.drawer && state.controls.drawer.enabled,
    activeKey: state.controls.drawer && state.controls.drawer.menu
}), {
    onToggle: toggleControl.bind(null, 'drawer', null),
    onChoose: partialRight(setControlProperty.bind(null, 'drawer', 'menu'), true),
    changeMapStyle: changeMapStyle
})(require('./drawer/Menu'));

require('./drawer/drawer.css');

const DrawerMenu = React.createClass({
    propTypes: {
        items: React.PropTypes.array,
        active: React.PropTypes.string,
        toggleMenu: React.PropTypes.func,
        id: React.PropTypes.string,
        glyph: React.PropTypes.string,
        buttonStyle: React.PropTypes.string,
        menuOptions: React.PropTypes.object,
        singleSection: React.PropTypes.bool,
        buttonClassName: React.PropTypes.string
    },
    contextTypes: {
        messages: React.PropTypes.object,
        router: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            id: "mapstore-drawermenu",
            items: [],
            toggleMenu: () => {},
            glyph: "menu-hamburger",
            buttonStyle: "default",
            menuOptions: {},
            singleSection: false,
            buttonClassName: "drawer-menu-button"
        };
    },
    renderItems() {
        return this.props.items.map((tool, index) => {
            const Plugin = tool.panel || tool.plugin;
            const plugin = (<Plugin
                isPanel={true}
                {...tool.cfg}
                items={tool.items || []}
                groupStyle={{style: {
                    marginBottom: "0px",
                    cursor: "pointer"
                }}}
                />);
            return this.props.singleSection ? (
                <Panel icon={tool.icon} glyph={tool.glyph} buttonConfig={tool.buttonConfig} key={tool.name} header={<Message msgId={tool.title}/>} eventKey={(index + 1) + ""}>
                    {plugin}
                </Panel>
            ) : (<Section key={tool.name} renderInModal={tool.renderInModal || false} eventKey={(index + 1) + ""} header={<Message msgId={tool.title} />}>
                {plugin}
            </Section>);
        });
    },
    render() {
        return (
            <div id={this.props.id}>
                <Button id="drawer-menu-button" bsStyle={this.props.buttonStyle} key="menu-button" className={this.props.buttonClassName} onClick={this.props.toggleMenu}><Glyphicon glyph={this.props.glyph}/></Button>
                <Menu single={this.props.singleSection} {...this.props.menuOptions} title={<Message msgId="menu" />} alignment="left">
                    {this.renderItems()}
                </Menu>
            </div>
        );
    }
});

module.exports = {
    DrawerMenuPlugin: connect((state) => ({
        active: state.controls && state.controls.drawer && state.controls.drawer.active
    }), {
        toggleMenu: toggleControl.bind(null, 'drawer', null)
    })(DrawerMenu),
    reducers: {}
};
