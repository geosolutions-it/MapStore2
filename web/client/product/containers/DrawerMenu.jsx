/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');

const AboutContent = require('../components/viewer/about/AboutContent');
const Message = require('../../components/I18N/Message');

const LayersUtils = require('../../utils/LayersUtils');

const {changeLayerProperties, toggleNode} = require('../../actions/layers');
const {toggleControl} = require('../../actions/controls');
const {chooseMenu} = require('../actions/controls');

const Menu = connect((state) => ({
    show: state.controls.drawer.enabled,
    activeKey: state.controls.drawer.menu
}), {
    onToggle: toggleControl.bind(null, 'drawer', null),
    onChoose: chooseMenu
})(require('../components/viewer/Menu'));
const Section = require('../components/viewer/Section');

const Settings = require('./menu/Settings');

const LayerTree = connect((state) => ({
    groups: state.layers && state.layers.groups && LayersUtils.denormalizeGroups(state.layers.flat, state.layers.groups).groups || []
}), {
    propertiesChangeHandler: changeLayerProperties,
    onToggleGroup: LayersUtils.toggleByType('groups', toggleNode),
    onToggleLayer: LayersUtils.toggleByType('layers', toggleNode)
})(require('../components/viewer/LayerTree'));

const BackgroundSwitcher = connect((state) => ({
    layers: state.layers && state.layers.flat && state.layers.flat.filter((layer) => layer.group === "background") || []
}), {
    propertiesChangeHandler: changeLayerProperties
})(require('../../components/TOC/background/BackgroundSwitcher'));

const DrawerMenu = React.createClass({
    propTypes: {

    },
    getDefaultProps() {
        return {

        };
    },
    render() {

        return (
            <Menu title={<Message msgId="menu" />} alignment="left">
                <Section eventKey="1" header={<Message msgId="layers" />}>
                    <LayerTree
                        key="layerSwitcher"
                        isPanel={true}
                        groupStyle={{style: {
                            marginBottom: "0px",
                            cursor: "pointer"
                        }}}
                        />
                </Section>
                <Section eventKey="2" header={<Message msgId="background" />}>
                    <BackgroundSwitcher
                        key="backgroundSwitcher"
                        isPanel={true}
                        fluid={true}
                        columnProperties={{
                            xs: 6,
                            sm: 6,
                            md: 6
                         }}
                        title={<div><Message msgId="background"/></div>}
                        helpText={<Message msgId="helptexts.backgroundSwitcher"/>}
                        buttonTooltip={<Message msgId="backgroundSwither.tooltip"/>}
                    />
                </Section>
                <Section eventKey="3" header={<Message msgId="settings" />}>
                    <Settings key="settingsPanel"/>
                </Section>
                <Section eventKey="about" renderInModal header={<Message msgId="aboutLbl" />}>
                    <AboutContent />
                </Section>

            </Menu>
        );
    },
    goHome() {
        this.context.router.push("/");
    }
});
module.exports = DrawerMenu;
