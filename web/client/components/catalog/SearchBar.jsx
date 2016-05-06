/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Input, Glyphicon} = require('react-bootstrap');

const ConfigUtils = require('../../MapStore2/web/client/utils/ConfigUtils');

const delay = (
    function() {
        var timer = 0;
        return function(callback, ms) {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        };
    }
)();

/**
 * Search Bar component for Maps
 */
let MetadataExplorer = React.createClass({
    propTypes: {
        className: React.PropTypes.string,
        onSearch: React.PropTypes.func,
        placeholder: React.PropTypes.string,
        placeholderMsgId: React.PropTypes.string,
        delay: React.PropTypes.number,
        hideOnBlur: React.PropTypes.bool,
        blurResetDelay: React.PropTypes.number,
        typeAhead: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
            className: "searchBar",
            onSearch: () => {},
            placeholder: "Search a Map",
            delay: 1000,
            blurResetDelay: 300,
            hideOnBlur: true,
            typeAhead: false

        };
    },
    getInitialState() {
        return {
            searchText: ""
        };
    },
    onChange() {
        var text = this.refs.input.getValue();
        this.setState({searchText: text});
        if (this.props.typeAhead) {
            delay(() => {this.search(); }, this.props.delay);
        }
    },
    onKeyDown(event) {
        if (event.keyCode === 13) {
            this.search();
        }
    },
    render() {
        const remove = <Glyphicon className="searchclear" glyph="remove" onClick={this.clearSearch}/>;
        var showRemove = this.state.searchText !== "";
        let placeholder = this.props.placeholder;

        return (
            <div className={this.props.className}>
                <Input
                    key="search-input"
                    placeholder={placeholder}
                    type="text"
                    style={{
                        textOverflow: "ellipsis"
                    }}
                    value={this.state.searchText}
                    ref="input"
                    addonAfter={showRemove ? remove : <Glyphicon glyph="search" onClick={this.search}/>}
                    onKeyDown={this.onKeyDown}
                    onChange={this.onChange} />
            </div>
        );
    },
    search() {
        var text = this.refs.input.getValue();
        if (text === undefined || text === "") {
            this.props.onSearch(ConfigUtils.getDefaults().geoStoreUrl);
            this.setState({searchText: text });
        } else {
            this.props.onSearch(ConfigUtils.getDefaults().geoStoreUrl, text);
            this.setState({searchText: text });
        }
    },
    clearSearch() {
        this.setState({ searchText: ""});
        this.props.onSearch(ConfigUtils.getDefaults().geoStoreUrl);
    }
});

module.exports = MetadataExplorer;
