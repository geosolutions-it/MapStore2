/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Dock = require('react-dock').default;
const PropTypes = require('prop-types');

/**
 * Component for rendering a dockablePanel panel.
 * @memberof components.dockablePanel
 * @class
 * @prop {string} id. The <div> id value of the dockable panel
 * @prop {string} dimMode. If none - content is not dimmed, if transparent - pointer events are disabled (so you can click through it), if opaque - click on dim area closes the dock. Default is none
 * @prop {number} dockSize. Size of dock panel (width or height, depending on position). Is a % value [0~1]
 * @prop {bool} isVisible. If true, dock is visible. Default is true.
 * @prop {number} maxDockSize. The maximum extension in %. Default 1.0
 * @prop {number} minDockSize. The minimum extension in %. Default 0.1
 * @prop {string} position. Side to dock (left, right, top or bottom). Default is bottom.
 * @prop {bool} fluid. If true, resize dock proportionally on window resize. Default is true.
 * @prop {function} setDockSize. The metod called when the dockable panel is resized
 * @prop {object} toolbar. it contains the toolbar
 * @prop {object} toolbarHeight. the height of the toolbar in px. Default 40
 * @prop {object} wrappedComponent. A connected Component to be rendered inside the dock panel
 * @prop {number} zIndex. Positioned below dialogs, above left menu
 *
 */
class DockablePanel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        dimMode: PropTypes.string,
        dockSize: PropTypes.number,
        isVisible: PropTypes.bool,
        fluid: PropTypes.bool,
        maxDockSize: PropTypes.number,
        minDockSize: PropTypes.number,
        position: PropTypes.string,
        setDockSize: PropTypes.func,
        toolbar: PropTypes.object,
        toolbarHeight: PropTypes.number,
        wrappedComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        zIndex: PropTypes.number
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        dimMode: "none",
        dockSize: 0.35,
        fluid: true,
        isVisible: true,
        maxDockSize: 1.0,
        minDockSize: 0.1,
        position: "bottom",
        setDockSize: () => {},
        toolbar: null,
        toolbarHeight: 40,
        wrappedComponent: {},
        zIndex: 1030
    };

    getHeight = (pos) => {
        return pos === "top" || pos === "bottom" ? true : undefined;
    };

    getWidth = (pos) => {
        return pos === "left" || pos === "right" ? true : undefined;
    };

    render() {
        const WrappedComponent = this.props.wrappedComponent;
        return (
            <Dock
                id={this.props.id}
                zIndex={this.props.zIndex}
                position={this.props.position}
                size={this.props.dockSize}
                dimMode={this.props.dimMode}
                isVisible={this.props.isVisible}
                onSizeChange={this.limitDockHeight}
                fluid={this.props.fluid}
                dimStyle={{ background: 'rgba(0, 0, 100, 0.2)' }}
            >
                <div className="dockpanel-wrapped-component" style={{height: "calc(100% - " + this.props.toolbarHeight + "px)"}}>
                    {this.props.wrappedComponent !== null ? (<WrappedComponent
                        size={{
                            height: this.getHeight(this.props.position) && this.props.dockSize,
                            width: this.getWidth(this.props.position) && this.props.dockSize
                        }}
                    />) : null }
                </div>
                {this.props.toolbar}
            </Dock>
        );
    }

    limitDockHeight = (size) => {
        if (size >= this.props.maxDockSize) {
            this.props.setDockSize(this.props.maxDockSize);
        } else if (size <= this.props.minDockSize) {
            this.props.setDockSize(this.props.minDockSize);
        } else {
            this.props.setDockSize(size);
        }
    };
}

module.exports = DockablePanel;
