/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Dock = require('react-dock');
/**
 * Component for rendering a docked panel.
 * @memberof components.dockedgrid
 * @class
 * @prop {number} dockSize. The extension in % of the docked panel
 * @prop {object} featureDockedGrid.
 * @prop {number} maxDockSize. The maximum extension in % of the docked panel
 * @prop {number} minDockSize. The minimum extension in % of the docked panel
 * @prop {string} position the position of the docked panel
 * @prop {function} setDockSize. The metod called when the docked panel is resized
 *
 */
const DockedGrid = React.createClass({
    propTypes: {
        dockSize: React.PropTypes.number,
        featureDockedGrid: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.func]),
        maxDockSize: React.PropTypes.number,
        minDockSize: React.PropTypes.number,
        position: React.PropTypes.string,
        setDockSize: React.PropTypes.func
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            dockSize: 0.35,
            featureDockedGrid: {},
            maxDockSize: 1.0,
            minDockSize: 0.1,
            position: "bottom",
            setDockSize: () => {}
        };
    },
    render() {
        const FeatureDockedGrid = this.props.featureDockedGrid;
        return (
            <Dock
                id="dock"
                zIndex={1030 /*below dialogs, above left menu*/}
                position={this.props.position /* 'left', 'top', 'right', 'bottom' */}
                size={this.props.dockSize}
                dimMode={"none" /*'transparent', 'none', 'opaque'*/}
                isVisible={true}
                onSizeChange={this.limitDockHeight}
                fluid={true}
                dimStyle={{ background: 'rgba(0, 0, 100, 0.2)' }}
                dockStyle={null}
                dockHiddenStyle={null}
                 >
                    <div id="feature-grid-container">
                        <FeatureDockedGrid id="feature-docked-grid"
                            toolbar={{
                                zoom: true
                            }}
                            position={this.props.position}
                            size={this.props.dockSize}
                            style={{
                                flex: "1 0 auto",
                                width: "100%",
                                height: "100%"
                            }}
                        />
                    </div>
            </Dock>
        );
    },
    limitDockHeight(size) {
        if (size >= this.props.maxDockSize) {
            this.props.setDockSize(this.props.maxDockSize);
        } else if (size <= this.props.minDockSize) {
            this.props.setDockSize(this.props.minDockSize);
        } else {
            this.props.setDockSize(size);
        }
    }
});

module.exports = DockedGrid;
