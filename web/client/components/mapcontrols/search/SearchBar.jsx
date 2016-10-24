/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {Input, Glyphicon} = require('react-bootstrap');
var LocaleUtils = require('../../../utils/LocaleUtils');

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
        className: React.PropTypes.string,
        onSearch: React.PropTypes.func,
        onSearchReset: React.PropTypes.func,
        onPurgeResults: React.PropTypes.func,
        onSearchTextChange: React.PropTypes.func,
        placeholder: React.PropTypes.string,
        placeholderMsgId: React.PropTypes.string,
        delay: React.PropTypes.number,
        hideOnBlur: React.PropTypes.bool,
        blurResetDelay: React.PropTypes.number,
        typeAhead: React.PropTypes.bool,
        searchText: React.PropTypes.string,
        style: React.PropTypes.object,
        searchOptions: React.PropTypes.object
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            onSearch: () => {},
            onSearchReset: () => {},
            onPurgeResults: () => {},
            onSearchTextChange: () => {},
            placeholderMsgId: "search.placeholder",
            delay: 1000,
            blurResetDelay: 300,
            hideOnBlur: true,
            typeAhead: true,
            searchText: ""
        };
    },
    onChange() {
        var text = this.refs.input.getValue();
        this.props.onSearchTextChange(text);
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
        if (this.props.typeAhead ) {
            this.search();
        }
    },
    onBlur() {
        // delay this to make the click on result run anyway
        if (this.props.hideOnBlur) {
            delay(() => {this.props.onPurgeResults(); }, this.props.blurResetDelay);
        }
    },
    render() {
        //  const innerGlyphicon = <Button onClick={this.search}></Button>;
        const remove = <Glyphicon className="searchclear" glyph="remove" onClick={this.clearSearch}/>;
        var showRemove = this.props.searchText !== "";
        let placeholder;
        if (!this.props.placeholder && this.context.messages) {
            let placeholderLocMessage = LocaleUtils.getMessageById(this.context.messages, this.props.placeholderMsgId);
            if (placeholderLocMessage) {
                placeholder = placeholderLocMessage;
            }
        } else {
            placeholder = this.props.placeholder;
        }
        return (
            <div style={this.props.style} className={"MapSearchBar" + (this.props.className ? " " + this.props.className : "")}>
                <Input
                    key="search-input"
                    placeholder={placeholder}
                    type="text"
                    style={{
                        textOverflow: "ellipsis"
                    }}
                    value={this.props.searchText}
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
        } else {
            this.props.onSearch(text, this.props.searchOptions);
        }

    },

    clearSearch() {
        this.props.onSearchReset();
    }
});

module.exports = SearchBar;
