/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const PropTypes = require('prop-types');
const React = require('react');
const {isEqual} = require('lodash');
const MeasureComponent = require('./MeasureComponent');
const DockablePanel = require('../../misc/panels/DockablePanel');
const Message = require('../../I18N/Message');
const Dialog = require('../../misc/Dialog');
const {Glyphicon} = require('react-bootstrap');

class MeasureDialog extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        closeGlyph: PropTypes.string,
        onClose: PropTypes.func,
        onMount: PropTypes.func,
        onInit: PropTypes.func,
        showCoordinateEditor: PropTypes.bool,
        defaultOptions: PropTypes.object,
        style: PropTypes.object
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
        style: {
            // Needs map layout selector see Identify Plugin
            height: 'calc(100% - 30px)'
        }
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
                <DockablePanel
                    dock
                    bsStyle="primary"
                    position="right"
                    title={<Message key="title" msgId="measureComponent.Measure"/>}
                    glyph="1-ruler"
                    size={660}
                    open={this.props.show}
                    onClose={this.onClose}
                    style={this.props.style}>
                    <MeasureComponent id="measure-panel" {...this.props}/>
                </DockablePanel>
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

module.exports = MeasureDialog;
