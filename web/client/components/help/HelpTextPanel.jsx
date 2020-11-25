import PropTypes from 'prop-types';

/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { Panel, Glyphicon } from 'react-bootstrap';
import Dialog from '../misc/Dialog';
import './help.css';

/**
 * A panel showning th current selectd help text.
 *
 * Component's properies:
 *  - id: {string}            the components identifier
 *  - helpText: {string}      the text to display
 *  - isVisible: {bool}       flag to steer visibility of the badge
 *  - title (string)          header text of this panel
 */
class HelpTextPanel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        helpText: PropTypes.string,
        isVisible: PropTypes.bool,
        title: PropTypes.string,
        onClose: PropTypes.func,
        asPanel: PropTypes.bool,
        closeGlyph: PropTypes.string,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string
    };

    static defaultProps = {
        id: 'mapstore-helptext-panel',
        isVisible: false,
        title: 'HELP',
        onClose: () => {},
        asPanel: false,
        closeGlyph: "1-close"
    };

    render() {
        const panel = this.props.asPanel ? (<Panel
            header={<span><span className="help-panel-title">{this.props.title}</span><span className="help-panel-close panel-close" onClick={this.props.onClose}></span></span>}>
            {this.props.helpText}
        </Panel>) : (<Dialog id={this.props.id} style={this.props.panelStyle} className={this.props.panelClassName}>
            <span role="header">
                <span className="help-panel-title">{this.props.title}</span>
                <button onClick={this.props.onClose} className="help-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
            </span>
            <span role="body">{this.props.helpText}</span>
        </Dialog>);
        return (
            <div
                id={this.props.id}
                className={this.props.isVisible ? '' : 'hidden'}
                style={{position: "absolute", top: "140px", marginLeft: "8px"}}>
                {panel}
            </div>
        );
    }
}

export default HelpTextPanel;
