/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';

import React from 'react';
import { isEqual } from 'lodash';
import MeasureComponent from './MeasureComponent';
import Message from '../../I18N/Message';
import Dialog from '../../misc/Dialog';
import { Glyphicon } from 'react-bootstrap';
import ResponsivePanel from "../../misc/panels/ResponsivePanel";

class MeasureDialog extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        closeGlyph: PropTypes.string,
        onClose: PropTypes.func,
        onMount: PropTypes.func,
        onInit: PropTypes.func,
        showCoordinateEditor: PropTypes.bool,
        defaultOptions: PropTypes.object,
        style: PropTypes.object,
        dockStyle: PropTypes.object,
        size: PropTypes.number
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        show: false,
        defaultOptions: {},
        onMount: () => {},
        onInit: () => {},
        toggleMeasure: () => {},
        showCoordinateEditor: false,
        showAddAsAnnotation: false,
        closeGlyph: "1-close",
        dockStyle: {},
        size: 550
    };

    onClose = () => {
        this.props.onClose(false);
    };

    initDefaultOptions = (defaultOptions) =>{
        const {showCoordinateEditor, ...otherDefaultOptions} = defaultOptions;
        this.props.onMount(showCoordinateEditor || this.props.showCoordinateEditor);
        this.props.toggleMeasure({
            geomType: otherDefaultOptions.geomType || "LineString"
        });
        this.props.onInit(otherDefaultOptions);
    }

    UNSAFE_componentWillMount() {
        /* this is used to set up defaults instead of putting them in the initial state,
         * beacuse in measurement state is updated when controls are updates
        */
        this.initDefaultOptions(this.props.defaultOptions);
    }

    componentDidUpdate(prevProps) {
        if (!isEqual(prevProps.defaultOptions, this.props.defaultOptions)) {
            this.initDefaultOptions(this.props.defaultOptions);
        }
    }

    render() {
        // TODO FIX TRANSALATIONS TITLE
        return this.props.show ? (
            this.props.showCoordinateEditor ?
                <ResponsivePanel
                    dock
                    containerId="measure-container"
                    containerStyle={this.props.dockStyle}
                    bsStyle="primary"
                    position="right"
                    title={<Message key="title" msgId="measureComponent.Measure"/>}
                    glyph="1-ruler"
                    size={this.props.size}
                    open={this.props.show}
                    onClose={this.onClose}
                    style={this.props.dockStyle}
                >
                    <MeasureComponent id="measure-panel" {...this.props}/>
                </ResponsivePanel>
                : (<Dialog id="measure-dialog">
                    <div key="header" role="header">
                        <Glyphicon glyph="1-ruler"/>&nbsp;<Message key="title" msgId="measureComponent.Measure"/>
                        <button key="close" onClick={this.onClose} className="close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
                    </div>
                    <div key="body" role="body">
                        <MeasureComponent id="measure-panel" style={{minWidth: "500px"}}{...this.props}/>
                    </div>
                </Dialog>)
        ) : null;
    }
}

export default MeasureDialog;
