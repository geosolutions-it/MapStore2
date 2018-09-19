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
        currentLayer: PropTypes.object,
        enabledCatalog: PropTypes.bool,
        onRemove: PropTypes.func,
        onEdit: PropTypes.func,
        layers: PropTypes.array
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
        onAdd: () => {},
        currentLayer: {},
        layers: []
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
                    buttons={[
                        {
                            glyph: 'plus',
                            tooltip: 'Add new background',
                            onClick: () => this.props.onAdd(),
                            visible: !this.props.enabledCatalog
                        },
                        {
                            glyph: 'wrench',
                            tooltip: 'Edit current background',
                            visible: !this.props.enabledCatalog && !!( this.props.currentLayer.type === 'wms' || this.props.currentLayer.type === 'wmts'),
                            onClick: () => this.props.onEdit(this.props.currentLayer)
                        },
                        {
                            glyph: 'trash',
                            tooltip: 'Remove current background',
                            visible: !this.props.enabledCatalog && this.props.layers.length > 1,
                            onClick: () => this.props.onRemove(this.props.currentLayer.id, 'layers', this.props.currentLayer)
                        }
                    ]}/> : null}
            </div>
        );
    }
}

module.exports = PreviewButton;
