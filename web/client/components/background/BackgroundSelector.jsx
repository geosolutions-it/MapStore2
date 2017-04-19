/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ConfigProvider = require('../../utils/ConfigProvider');

const PreviewButton = require('./PreviewButton');
const PreviewList = require('./PreviewList');
const PreviewIcon = require('./PreviewIcon');

require('./css/background.css');

const BackgroundSelector = React.createClass({
    propTypes: {
        mapType: React.PropTypes.string,
        x: React.PropTypes.number,
        y: React.PropTypes.number,
        z: React.PropTypes.number,
        s: React.PropTypes.string,
        layers: React.PropTypes.array,
        enabled: React.PropTypes.boolean,
        onToggle: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            mapType: 'leaflet',
            x: 4,
            y: 8,
            z: 5,
            s: 'a',
            layers: [],
            enabled: false,
            onToggle: () => {}
        };
    },
    getLayerData() {
        const providers = Object.keys(ConfigProvider);
        return providers.filter((key) => {
            return !ConfigProvider[key].variants;
        }).map((key) => {
            return {name: key, link: this.generateLink(ConfigProvider[key].url)};
        });
    },
    getLayerVariants() {
        const providers = Object.keys(ConfigProvider);
        return providers.filter((key) => {
            return ConfigProvider[key].variants;
        }).map((key) => {
            const variants = Object.keys(ConfigProvider[key].variants);
            return variants.map((k) => {
                return {name: key + ' ' + k, link: this.generateLink(ConfigProvider[key].variants[k].url ? ConfigProvider[key].variants[k].url : ConfigProvider[key].url, ConfigProvider[key].variants[k])};
            });
        }).reduce((a, b) => {
            return a.concat(b);
        }, []);
    },
    renderLayers() {
        const layers = this.getLayerVariants().splice(0, 3);
        // console.log();
        return layers.map((val, idx) => {
            return (
                <div key={idx} className="background-thumbnail-container-small">
                    <div className="background-thumbnail-frame-small">
                        <img src={val.link}/>
                    </div>
                </div>
            );
        });
    },
    render() {
        /*console.log(this.props.layers);*/
        return this.props.enabled ? (
            <div className="background-plugin-position">
                <PreviewButton side={80} labelHeight={29} onToggle={this.props.onToggle}/>
                <div className="background-list-container" style={{left: 94, width: 55 * 3, height: 200}}>
                    <PreviewList width={50} uid={0}/>
                    <PreviewList width={50} uid={1}/>
                    <PreviewList width={50} uid={2} icons={[]}/>
                </div>
            </div>
            ) : (
            <div className="background-plugin-position">
                <PreviewButton side={50} labelHeight={0} onToggle={this.props.onToggle}/>
                <div className="background-list-container" style={{left: 64, width: 0, height: 200}}/>
            </div>
        );
    },
    generateLink(url, k = '') {
        const tile = {x: '4330', y: '2982', z: '13', s: 'a', variant: k};
        return Object.keys(tile).reduce((a, b) => {
            return a.replace('{' + b + '}', tile[b]);
        }, url);
        // return 'https://a.tile.opentopomap.org/4/8/5.png';
    }
});

module.exports = BackgroundSelector;
