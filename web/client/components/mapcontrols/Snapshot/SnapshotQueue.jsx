const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

require("./css/snapshot.css");


let SnapshotSupport;

/**
 * This Class is a support class to manage and generate snapshots in the queue
 * property. The queues are configurations for SnapshotSupport.GrabMap.
 */
class SnapshotQueue extends React.Component {
    static propTypes = {
        queue: PropTypes.array,
        browser: PropTypes.string,
        onRemoveSnapshot: PropTypes.func,
        onSnapshotError: PropTypes.func,
        downloadImg: PropTypes.func,
        mapType: PropTypes.string

    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        onRemoveSnapshot: () => {},
        onSnapshotError: () => {},
        mapType: 'leaflet'
    };

    UNSAFE_componentWillMount() {
        SnapshotSupport = require('./SnapshotSupport')(this.props.mapType);
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.mapType !== this.props.mapType) {
            SnapshotSupport = require('./SnapshotSupport')(newProps.mapType);
        }
    }

    renderGrabMaps = (queue) => {
        return queue.map((config) => {
            return (<SnapshotSupport.GrabMap
                id={config.key}
                active
                snapstate="SHOOTING"
                timeout={0}
                onSnapshotReady={(canvas) => { this.saveImage(canvas, config); }}
                {...config}/>);
        });

    };

    render() {
        if (this.props.queue !== undefined && this.props.queue.length > 0) {
            return (<div className="snapshot_hidden_map">
                <div
                    key="hiddenGrabMaps"
                    style={{zIndex: -9999}}
                >
                    {this.renderGrabMaps(this.props.queue)}
                </div>
            </div>);
        }
        return <noscript />;
    }

    saveImage = (canvas, config) => {
        try {
            this.props.onSnapshotError();
            let dataURL = canvas.toDataURL();
            this.props.onRemoveSnapshot(config);
            setTimeout(() => {
                this.props.downloadImg(dataURL);
            }, 0);
        } catch (e) {
            this.props.onSnapshotError("Error saving snapshot");
            this.props.onRemoveSnapshot(config);
        }
    };
}

module.exports = SnapshotQueue;
