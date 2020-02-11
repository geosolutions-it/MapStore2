/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const Toolbar = require('../misc/toolbar/Toolbar');

require('./css/previewbutton.css');

class PreviewButton extends React.Component {
    static propTypes = {
        src: PropTypes.string,
        side: PropTypes.number,
        frame: PropTypes.number,
        margin: PropTypes.number,
        labelHeight: PropTypes.number,
        label: PropTypes.string,
        showLabel: PropTypes.bool,
        onToggle: PropTypes.func,
        onAdd: PropTypes.func,
        showAdd: PropTypes.bool
    };

    static defaultProps = {
        src: './images/mapthumbs/none.jpg',
        side: 50,
        frame: 4,
        margin: 5,
        labelHeight: 29,
        label: '',
        showLabel: true,
        onToggle: () => {},
        onAdd: () => {}
    };

    render() {

        return (
            <div className="background-preview-button" style={{margin: this.props.margin}}>
                <div className="background-preview-button-container bg-body" onClick={this.props.onToggle} style={{padding: this.props.frame / 2, width: this.props.side + this.props.frame, height: this.props.side + this.props.frame}}>
                    {this.props.showLabel ? (<div className="background-preview-button-label" style={{width: this.props.side, height: this.props.labelHeight, marginTop: 0, padding: 0}} ><div className="bg-body bg-text" style={{padding: this.props.frame }}>{this.props.label}</div></div>) : null}
                    <div className="background-preview-button-frame" style={{width: this.props.side, height: this.props.side}}>
                        <img src={this.props.src}/>
                    </div>
                </div>
                {this.props.labelHeight > 0 ? <Toolbar
                    btnDefaultProps={{
                        className: 'square-button-md',
                        bsStyle: 'primary'
                    }}
                    buttons={ this.props.showAdd ? [
                        {
                            glyph: 'plus',
                            tooltipId: "backgroundSelector.addTooltip",
                            onClick: () => this.props.onAdd()
                        }
                    ] : []}/> : null}
            </div>
        );
    }
}

module.exports = PreviewButton;
