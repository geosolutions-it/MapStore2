/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {Input, Glyphicon} = require('react-bootstrap');
var LocaleUtils = require('../../utils/LocaleUtils');


var delay = (
    function() {
        var timer = 0;
        return function(callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
    })();

require('./searchbar.css');
/**
 * Search Bar component. With AutoComplete
 */
let SearchBar = React.createClass({
    propTypes: {
        onSearch: React.PropTypes.func,
        onSearchReset: React.PropTypes.func,
        placeholder: React.PropTypes.string,
        delay: React.PropTypes.number,
        hideOnBlur: React.PropTypes.bool,
        blurResetDelay: React.PropTypes.number,
        typeAhead: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
            onSearch: () => {},
            onSearchReset: () => {},
            delay: 1000,
            blurResetDelay: 300,
            hideOnBlur: true,
            placeholder: "Search by location name or coordinates ...",
            typeAhead: true

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
    onFocus() {
        this.search();
    },
    onBlur() {
        // delay this to make the click on result run anyway
        if (this.props.hideOnBlur) {
            delay(() => {this.props.onSearchReset(); }, this.props.blurResetDelay);
        }
    },
    render() {
        //  const innerGlyphicon = <Button onClick={this.search}></Button>;
        const remove = <Glyphicon className="searchclear" glyph="remove" onClick={this.clearSearch}/>;
        var showRemove = this.state.searchText !== "";
        let placeholder = this.props.placeholder;
        // workaround to localize message for placeholder, that needs to be pure text
        if (this.props.placeholder._context && this.props.placeholder._context.messages && this.props.placeholder.props) {
            let messages = this.props.placeholder._context.messages;
            let msgId = this.props.placeholder.props.msgId;
            if (msgId) {
                placeholder = LocaleUtils.getMessageById(messages, msgId);
            }

        }
        return (
            <div className="MapSearchBar">
                <Input
                    key="search-input"
                    placeholder={placeholder}
                    type="text"
                    style={{
                        textOverflow: "ellipsis"
                    }}
                    value={this.state.searchText}
                    ref="input"
                    addonAfter={showRemove ? remove : <Glyphicon glyph="search"/>}
                    onKeyDown={this.onKeyDown}
                    onBlur={this.onBlur}
                    onFocus={this.onFocus}
                    onChange={this.onChange} />
            </div>
        );
    },
    search() {
        var text = this.refs.input.getValue();
        if (text === undefined || text === "") {
            this.props.onSearchReset();
            this.setState({searchText: text });
        } else {
            this.props.onSearch(text);
            this.setState({searchText: text });
        }

    },

    clearSearch() {
        this.setState({ searchText: ""});
        this.props.onSearchReset();
    }
});

module.exports = SearchBar;
