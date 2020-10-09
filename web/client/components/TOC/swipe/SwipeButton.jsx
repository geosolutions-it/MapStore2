/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const {Glyphicon, SplitButton, MenuItem} = require('react-bootstrap');


const Message = require('../../I18N/Message');
const tooltip = require('../../misc/enhancers/tooltip');

const SplitButtonT = tooltip(SplitButton);
const splitToolButtonConfig = {
    title: <Glyphicon glyph="transfer"/>,
    tooltipId: "toc.compareTool",
    tooltipPosition: "top",
    className: "square-button-md no-border",
    pullRight: true
};

const SwipeButton = (props) => {
    const {swipeSettings, onToolsActions, status} = props;

    const showConfiguration = () => {
        if (!swipeSettings.configuring && (status === 'LAYER')) {
            onToolsActions.onSetActive(true, "configuring");
        } else {
            onToolsActions.onSetActive(false, "configuring");
        }
    };

    const showSwipeTools = () => {
        if (!swipeSettings.active && (status === 'LAYER')) {
            onToolsActions.onSetActive(true);
        } else {
            onToolsActions.onSetActive(false);
        }
    };

    return (
        <SplitButtonT
            onClick={() => showSwipeTools()}
            bsStyle={swipeSettings?.active ? "success" : "primary"}
            {...splitToolButtonConfig}>
            <MenuItem
                active={swipeSettings?.mode === "swipe"}
                onClick={() => {
                    onToolsActions.onSetSwipeMode("swipe");
                    onToolsActions.onSetActive(true);
                }}>
                <Glyphicon glyph="vert-dashed"/><Message msgId="toc.swipe" />
            </MenuItem>
            <MenuItem
                active={swipeSettings?.mode === "spy"}
                onClick={() => {
                    onToolsActions.onSetSwipeMode("spy");
                    onToolsActions.onSetActive(true);
                }}>
                <Glyphicon glyph="search" /><Message msgId="toc.spyGlass" />
            </MenuItem>
            <MenuItem
                onClick={() => showConfiguration()}>
                <Glyphicon glyph="cog" /><Message msgId="toc.configureTool" />
            </MenuItem>
        </SplitButtonT>
    );
};

SwipeButton.propTypes = {
    swipeSettings: PropTypes.object,
    status: PropTypes.string,
    onToolsActions: PropTypes.object
};

SwipeButton.defaultProps = {
    status: "LAYER",
    onToolsActions: {
        onToolsActions: () => {}
    }
};

module.exports =  SwipeButton;
