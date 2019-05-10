/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');
const React = require('react');
const {FormControl, FormGroup, Glyphicon, Row, Col} = require('react-bootstrap');
const LocaleUtils = require('../../../utils/LocaleUtils');
const DropdownToolbarOptions = require('../../misc/toolbar/DropdownToolbarOptions');
const CoordinateEntry = require('../../misc/coordinateeditors/CoordinateEntry');
const Toolbar = require('../../misc/toolbar/Toolbar');
const Spinner = require('react-spinkit');
const {isNumber} = require('lodash');
const assign = require('object-assign');
const Message = require('../../I18N/Message');

const delay = (
    function() {
        var timer = 0;
        return function(callback, ms) {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        };
    })();

require('./searchbar.css');

/**
 * Search Bar component. With typeAhead events
 * @memberof components.mapControls.search
 * @class
 * @prop {string} className the class to assign to the components
 * @prop {function} onSearch callback on search event
 * @prop {function} onPurgeResults triggered when the user clear
 * @prop {function} onSearchTextChange triggered when the text changes
 * @prop {function} onCancelSelectedItem triggered when the user deletes the selected item (by hitting backspace) when text is empty
 * @prop {string} placeholder string to use as placeholder when text is empty
 * @prop {string} placeholderMsgId msgId for the placeholder. Used if placeholder is not defined
 * @prop {string} removeIcon glyphicon used for reset button, default 1-close
 * @prop {string} searchIcon glyphicon used for search button, default search
 * @prop {number} delay milliseconds after trigger onSearch if typeAhead is true
 * @prop {boolean} hideOnBlur if true, it triggers onPurgeResults on blur
 * @prop {boolean} typeAhead if true, onSearch is triggered when users change the search text, after `delay` milliseconds
 * @prop {number} blurResetDelay time to wait before to trigger onPurgeResults after blur event, if `hideOnBlur` is true
 * @prop {searchText} the text to display in the component
 * @prop {object[]} selectedItems the items selected. Must have `text` property to display
 * @prop {boolean} autoFocusOnSelect if true, the component gets focus when items are added, or deleted but some item is still selected. Useful for continue writing after selecting an item (with nested services for instance)
 * @prop {boolean} splitTools if false, the search and reset can appear both at the same time, otherwise the search appear only with empty text, the reset if a text is entered
 * @prop {boolean} isSearchClickable if true, the magnifying-glass uses a clickable style otherwise it doesn't. see map-search-bar.less for more info on the style.
 Also the onClick method will be added only if this flag is true
 * @prop {boolean} loading if true, shows the loading tool
 * @prop {object} error if not null, an error icon will be display
 * @prop {object} style css style to apply to the component
 * ************* menu options *************
 * @prop {function} onChangeActiveSearchTool used to change the active option in the menu
 * @prop {function} onChangeCoord change the coordinate for coordiante editor
 * @prop {function} onChangeFormat used to a change format between aeronautical and decimal
 * @prop {function} onClearCoordinatesSearch clears the marker on the map for coord tool
 * @prop {function} onToggleControl used to open searchConfigSevices
 * @prop {function} onZoomToPoint used to a specific point
 * @prop {string} format of coordinate tool
 * @prop {string} activeSearchTool used to highlight the selected search option in the menu
 * @prop {number} defaultZoomLevel zoomlevel used to zoom to point
 * @prop {bool} showOptions used to show search option addon
 * @prop {bool} enabledSearchServicesConfig used to know if the search services config control is enabled
 * @prop {object} aeronauticalOptions options for aeronautical coord
 * @prop {object} constraintsCoordEditor constraints on lat lon for coordinate editor
 * @prop {object} coordinate values
 *
 */
class SearchBar extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        onSearch: PropTypes.func,
        onSearchReset: PropTypes.func,
        onPurgeResults: PropTypes.func,
        onSearchTextChange: PropTypes.func,
        onCancelSelectedItem: PropTypes.func,
        placeholder: PropTypes.string,
        placeholderMsgId: PropTypes.string,
        delay: PropTypes.number,
        hideOnBlur: PropTypes.bool,
        blurResetDelay: PropTypes.number,
        typeAhead: PropTypes.bool,
        searchText: PropTypes.string,
        removeIcon: PropTypes.string,
        optionsIcon: PropTypes.string,
        searchIcon: PropTypes.string,
        selectedItems: PropTypes.array,
        autoFocusOnSelect: PropTypes.bool,
        splitTools: PropTypes.bool,
        isSearchClickable: PropTypes.bool,
        loading: PropTypes.bool,
        error: PropTypes.object,
        style: PropTypes.object,
        searchOptions: PropTypes.object,
        // menuOptions
        onChangeActiveSearchTool: PropTypes.func,
        onChangeFormat: PropTypes.func,
        onChangeCoord: PropTypes.func,
        onClearCoordinatesSearch: PropTypes.func,
        onToggleControl: PropTypes.func,
        onZoomToPoint: PropTypes.func,
        format: PropTypes.string,
        activeSearchTool: PropTypes.string,
        defaultZoomLevel: PropTypes.number,
        showOptions: PropTypes.bool,
        showAddressSearchOption: PropTypes.bool,
        showCoordinatesSearchOption: PropTypes.bool,
        enabledSearchServicesConfig: PropTypes.bool,
        aeronauticalOptions: PropTypes.object,
        constraintsCoordEditor: PropTypes.object,
        coordinate: PropTypes.object
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        onSearch: () => {},
        onSearchReset: () => {},
        onPurgeResults: () => {},
        onSearchTextChange: () => {},
        onCancelSelectedItem: () => {},
        selectedItems: [],
        placeholderMsgId: "search.addressSearch",
        removeIcon: "1-close",
        optionsIcon: "cog",
        searchIcon: "search",
        delay: 1000,
        blurResetDelay: 300,
        autoFocusOnSelect: true,
        splitTools: true,
        isSearchClickable: true,
        typeAhead: true,
        searchText: "",
        hideOnBlur: true,
        // menuOptions
        onChangeActiveSearchTool: () => {},
        onZoomToPoint: () => {},
        onToggleControl: () => {},
        onChangeFormat: () => {},
        onClearCoordinatesSearch: () => {},
        onChangeCoord: () => {},
        defaultZoomLevel: 12,
        coordinate: {},
        aeronauticalOptions: {
            seconds: {
                decimals: 4,
                step: 0.0001
            }
        },
        constraintsCoordEditor: {
            decimal: {
                lat: {
                    min: -90,
                    max: 90
                },
                lon: {
                    min: -180,
                    max: 180
                }
            }
        },
        activeSearchTool: "addressSearch",
        format: "decimal",
        showOptions: true,
        showCoordinatesSearchOption: true,
        showAddressSearchOption: true,
        enabledSearchServicesConfig: false
    };

    componentDidUpdate(prevProps) {
        let shouldFocus = this.props.autoFocusOnSelect && this.props.selectedItems &&
            (
                prevProps.selectedItems && prevProps.selectedItems.length < this.props.selectedItems.length
                || !prevProps.selectedItems && this.props.selectedItems.length === 1
            );
        if (shouldFocus) {
            this.focusToInput();
        }
    }

    onChange = (e) => {
        var text = e.target.value;
        this.props.onSearchTextChange(text);
        if (this.props.typeAhead) {
            delay(() => {this.search(); }, this.props.delay);
        }
    };

    onKeyDown = (event) => {
        switch (event.keyCode) {
        case 13:
            this.search();
            break;
        case 8:
            if (!this.props.searchText && this.props.selectedItems && this.props.selectedItems.length > 0) {
                this.props.onCancelSelectedItem(this.props.selectedItems[this.props.selectedItems.length - 1]);
            }
            break;
        default:
        }
    };

    onFocus = () => {
        if (this.props.typeAhead && this.props.searchText ) {
            this.search();
        }
    };

    onBlur = () => {
        // delay this to make the click on result run anyway
        if (this.props.hideOnBlur) {
            delay(() => {this.props.onPurgeResults(); }, this.props.blurResetDelay);
        }
    };

    getSpinnerStyle = () => {
        const nonSplittedStyle = {
            right: "69px",
            zIndex: 1,
            top: "13px"
        };
        const splittedStyle = {
            right: "69px",
            zIndex: 1,
            top: "13px"
        };
        return assign({}, {position: "absolute"}, this.props.splitTools ? {...splittedStyle} : {...nonSplittedStyle} );
    }
    getGlyphicon = (glyph, key, onClick, className = "") => (<Glyphicon
        glyph={glyph}
        key={key}
        onClick={onClick}
        className={className}/>);
    getError = (e) => {
        if (e) {
            return (<Message msgId={e.msgId || "search.generic_error"} msgParams={{message: e.message, serviceType: e.serviceType}}/>);
        }
        return null;
    }

/**
 * if one tool is disabled the other one is enabled
*/
    getActiveTool = () => {
        let activeTool = this.props.activeSearchTool;
        if (this.props.showAddressSearchOption && !this.props.showCoordinatesSearchOption) {
            activeTool = "addressSearch";
        }
        if (!this.props.showAddressSearchOption && this.props.showCoordinatesSearchOption) {
            activeTool = "coordinatesSearch";
        }
        return activeTool;
    }
    renderAddonBefore = () => {
        return this.props.selectedItems && this.props.selectedItems.map((item, index) =>
            <span key={"selected-item" + index} className="input-group-addon"><div className="selectedItem-text">{item.text}</div></span>
        );
    };

    renderSearchToolbar = () => {
        let activeTool = this.getActiveTool();

        let searchMenuOptions = [];
        if (this.props.showAddressSearchOption && this.props.showCoordinatesSearchOption) {
            searchMenuOptions.push({
                active: activeTool === "addressSearch",
                onClick: () => {
                    this.props.onClearCoordinatesSearch({owner: "search"});
                    this.props.onChangeActiveSearchTool("addressSearch");
                },
                glyph: this.props.searchIcon,
                text: <Message msgId="search.addressSearch"/>
            });
            searchMenuOptions.push({
                active: activeTool === "coordinatesSearch",
                onClick: () => {
                    if (this.props.searchText !== undefined && this.props.searchText !== "") {
                        this.clearSearch();
                    }
                    this.props.onChangeActiveSearchTool("coordinatesSearch");
                },
                glyph: "search-coords",
                text: <Message msgId="search.coordinatesSearch"/>
            });
        }
        return (
            <span className="search-toolbar-options">
                {this.props.loading && <Spinner style={this.getSpinnerStyle()} spinnerName="pulse" noFadeIn/>}
                <Toolbar
                    btnGroupProps = {{ className: 'btn-group-menu-options'}}
                    transitionProps = {null}
                    btnDefaultProps = {{ className: 'square-button-md', bsStyle: 'primary' }}
                    buttons={[
                        {
                            glyph: this.props.removeIcon,
                            className: "square-button-md no-border",
                            bsStyle: "default",
                            pullRight: true,
                            visible: activeTool === "addressSearch" && (this.props.searchText !== "" || this.props.selectedItems && this.props.selectedItems.length > 0) || activeTool === "coordinatesSearch" && (!!this.props.coordinate.lon || !!this.props.coordinate.lat),
                            onClick: () => {
                                if (activeTool === "addressSearch") {
                                    this.clearSearch();
                                } else {
                                    this.clearCoordinates();
                                }
                            }
                        }, {
                            glyph: this.props.searchIcon,
                            className: "square-button-md no-border " + (this.props.isSearchClickable || activeTool !== "addressSearch" ? "magnifying-glass clickable" : "magnifying-glass"),
                            bsStyle: "default",
                            pullRight: true,
                            visible: activeTool === "addressSearch" && (!(this.props.searchText !== "" || this.props.selectedItems && this.props.selectedItems.length > 0) || !this.props.splitTools),
                            onClick: () => {
                                if (this.props.isSearchClickable || activeTool !== "addressSearch") {
                                    this.search();
                                }
                            }
                        }, {
                            tooltip: this.getError(this.props.error),
                            tooltipPosition: "bottom",
                            className: "square-button-md no-border",
                            glyph: "warning-sign",
                            bsStyle: "danger",
                            glyphClassName: "searcherror",
                            visible: !!this.props.error,
                            onClick: this.clearSearch
                        }, {
                        buttonConfig: {
                            title: <Glyphicon glyph="cog"/>,
                            tooltipId: "search.changeSearchInputField",
                            tooltipPosition: "bottom",
                            className: "square-button-md no-border",
                            pullRight: true
                        },
                        menuOptions: [
                            {
                                active: this.props.format === "decimal",
                                onClick: () => { this.props.onChangeFormat("decimal"); },
                                text: <Message msgId="search.decimal"/>
                            }, {
                                active: this.props.format === "aeronautical",
                                onClick: () => { this.props.onChangeFormat("aeronautical"); },
                                text: <Message msgId="search.aeronautical"/>
                            }
                        ],
                        visible: this.props.showOptions && activeTool === "coordinatesSearch",
                        Element: DropdownToolbarOptions
                    }, {
                        buttonConfig: {
                            title: <Glyphicon glyph="menu-hamburger"/>,
                            tooltipId: "search.changeSearchInputField",
                            tooltipPosition: "bottom",
                            className: "square-button-md no-border",
                            pullRight: true
                        },
                        menuOptions: [
                            ...searchMenuOptions, {
                                onClick: () => {
                                    if (!this.props.enabledSearchServicesConfig) {
                                        this.props.onToggleControl("searchservicesconfig");
                                    }
                                },
                                glyph: "cog",
                                text: <Message msgId="search.searchservicesbutton"/>
                            }
                        ],
                        visible: this.props.showOptions,
                        Element: DropdownToolbarOptions
                    }]}
                    />
            </span>);
    }

    renderCoordinateTool = () => {
        let activeTool = this.getActiveTool();
        return activeTool !== "addressSearch" && this.props.showCoordinatesSearchOption &&
            (<div className="coordinateEditor">
            <Row className="entryRow">
                <Col xs="3" className="coordinateLabel">
                    <Message msgId="latitude"/>
                </Col>
                <Col xs="9">
                    <CoordinateEntry
                        format={this.props.format}
                        aeronauticalOptions={this.props.aeronauticalOptions}
                        coordinate="lat"
                        idx={1}
                        value={this.props.coordinate.lat}
                        constraints={this.props.constraintsCoordEditor}
                        onChange={(dd) => this.changeCoord("lat", dd)}
                        onKeyDown={(e) => {
                            if (this.areValidCoordinates() && e.keyCode === 13) {
                                this.zoomToPoint();
                            }
                        }}
                    />
                </Col>
            </Row>
            <Row className="entryRow">
                <Col xs="3" className="coordinateLabel">
                    <Message msgId="longitude"/>
                </Col>
                <Col xs="9">
                    <CoordinateEntry
                        format={this.props.format}
                        aeronauticalOptions={this.props.aeronauticalOptions}
                        coordinate="lon"
                        idx={2}
                        value={this.props.coordinate.lon}
                        constraints={this.props.constraintsCoordEditor}
                        onChange={(dd) => this.changeCoord("lon", dd)}
                        onKeyDown={(e) => {
                            if (this.areValidCoordinates() && e.keyCode === 13) {
                                this.zoomToPoint();
                            }
                        }}
                    />
                </Col>
            </Row>
        </div>);
    }

    renderInputSearch = () => {
        let activeTool = this.getActiveTool();

        let placeholder = "search.addressSearch";
        if (!this.props.placeholder && this.context.messages) {
            let placeholderLocMessage = LocaleUtils.getMessageById(this.context.messages, this.props.placeholderMsgId || placeholder);
            if (placeholderLocMessage) {
                placeholder = placeholderLocMessage;
            }
        } else {
            placeholder = this.props.placeholder;
        }
        return activeTool === "addressSearch" &&
            <FormControl
                className="searchInput"
                key="search-input"
                placeholder={placeholder}
                type="text"
                inputRef={ref => { this.input = ref; }}
                style={{
                    textOverflow: "ellipsis"
                }}
                value={this.props.searchText}
                ref="input"
                onKeyDown={this.onKeyDown}
                onBlur={this.onBlur}
                onFocus={this.onFocus}
                onChange={this.onChange}
            />;
    }
    render() {
        return (
            <div id="map-search-bar" style={this.props.style} className={"MapSearchBar" + (this.props.className ? " " + this.props.className : "")}>
                <FormGroup>
                    <div className="input-group">
                        {this.renderAddonBefore()}
                        {this.renderInputSearch()}
                        {this.renderCoordinateTool()}
                        {this.renderSearchToolbar()}
                        </div>
                </FormGroup>
            </div>
        );
    }

    search = () => {
        var text = this.props.searchText;
        if ((text === undefined || text === "") && (!this.props.selectedItems || this.props.selectedItems.length === 0)) {
            this.props.onSearchReset();
        } else if (text !== undefined && text !== "") {
            this.props.onSearch(text, this.props.searchOptions);
        }
    };
    zoomToPoint = () => {
        this.props.onZoomToPoint({x: parseFloat(this.props.coordinate.lon), y: parseFloat(this.props.coordinate.lat)}, this.props.defaultZoomLevel, "EPSG:4326");
    }

    focusToInput = () => {
        let node = this.input;
        if (node && node.focus instanceof Function) {
            setTimeout( () => node.focus(), 200);
        }
    };

    clearSearch = () => {
        this.props.onSearchReset();
    };

    clearCoordinates = () => {
        this.props.onClearCoordinatesSearch({owner: "search"});
        this.props.onChangeCoord("lat", "");
        this.props.onChangeCoord("lon", "");

    };

    changeCoord = (coord, value) => {
        let val = isNaN(parseFloat(value)) ? "" : parseFloat(value);

        this.props.onChangeCoord(coord, val);
        if (!this.areValidCoordinates()) {
            this.props.onClearCoordinatesSearch({owner: "search"});
        }
    }
    areValidCoordinates = () => (isNumber(this.props.coordinate.lon) && isNumber(this.props.coordinate.lat))
}

module.exports = SearchBar;
