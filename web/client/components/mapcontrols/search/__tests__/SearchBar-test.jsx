/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {MenuItem} from "react-bootstrap";

import expect from 'expect';
import { Provider } from 'react-redux';
import ConfigUtils from '../../../../utils/ConfigUtils';
import React from 'react';
import ReactDOM from 'react-dom';
import SearchBar from '../SearchBar';
import TestUtils from 'react-dom/test-utils';

describe("test the SearchBar", () => {
    const items = [{
        name: 'SearchByBookmark',
        bookmarkConfig: () =>({glyph: "cog", visible: true}),
        menuItem: () => <MenuItem>Search by bookmark</MenuItem>
    }];

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test component creation', () => {
        ReactDOM.render(<SearchBar/>, document.getElementById("container"));
        const rootDiv = document.getElementsByClassName('MapSearchBar')[0];
        expect(rootDiv).toExist();
    });

    it('test search service menu', () => {
        ReactDOM.render(<SearchBar searchOptions={{services: [{type: "nominatim"}]}}/>, document.getElementById("container"));
        let search = document.getElementsByClassName("glyphicon-search");
        expect(search).toBeTruthy();
        expect(search.length).toBe(2);
    });
    it("No Submenu container when only one service", () => {
        ReactDOM.render(<SearchBar searchOptions={{services: [{type: "nominatim"}]}}/>, document.getElementById("container"));
        let submenus = document.querySelectorAll(".search-services-submenus");
        expect(submenus.length).toBe(0);
    });
    it("Submenu container when multiple services", () => {
        ReactDOM.render(<SearchBar searchOptions={{services: [{type: "nominatim"}, {type: "wfs", name: "test"}]}}/>, document.getElementById("container"));
        let submenus = document.querySelectorAll(".search-services-submenus");
        expect(submenus.length).toBe(1);
        const searchServicesSubMenus = document.querySelectorAll('.search-services-item');
        expect(searchServicesSubMenus.length).toBe(3);
    });
    it('test search with multiple services', () => {
        ReactDOM.render(<SearchBar searchOptions={{services: [{type: "nominatim"}, {type: "wfs", name: "test"}]}}/>, document.getElementById("container"));
        let search = document.getElementsByClassName("glyphicon-search");
        let menuItems = document.querySelectorAll('[role="menuitem"]');
        const searchServicesSubMenus = document.querySelectorAll('.search-services-item');
        expect(search).toBeTruthy();
        expect(search.length).toBe(5);
        expect(menuItems.length).toBe(2);
        expect(searchServicesSubMenus.length).toBe(3);
        expect(searchServicesSubMenus[1].innerHTML).toContain("nominatim");
        expect(searchServicesSubMenus[2].innerHTML).toContain("test");
    });
    it('test onSearch with multiple services', () => {
        const actions = {
            onSearch: () => {},
            onSearchReset: () => {}
        };
        const services = [{type: "nominatim"}, {type: "wfs", name: "test"}];
        const spyOnSearch = expect.spyOn(actions, 'onSearch');
        ReactDOM.render(<SearchBar onSearch={actions.onSearch} searchText="test" searchOptions={{services}} onSearchReset={actions.onSearchReset}/>, document.getElementById("container"));
        let search = document.getElementsByClassName("glyphicon-search");
        let input = document.querySelector(".searchInput");
        let menuItems = document.querySelectorAll('[role="menuitem"]');
        const searchServicesSubMenus = document.querySelectorAll('.search-services-item');

        expect(search).toBeTruthy();
        expect(input).toBeTruthy();
        expect(search.length).toBe(5);

        expect(menuItems.length).toBe(2);
        TestUtils.Simulate.click(searchServicesSubMenus[1]); // Select single search

        TestUtils.Simulate.keyDown(input, { key: 'Enter', keyCode: 13 });
        expect(spyOnSearch).toHaveBeenCalled();
        expect(spyOnSearch.calls[0].arguments[0]).toBe("test");
        expect(spyOnSearch.calls[0].arguments[1]).toEqual({"services": [services[0]]});
        expect(spyOnSearch.calls[0].arguments[2]).toBe(15);

        TestUtils.Simulate.click(menuItems[0]); // Select all search
        TestUtils.Simulate.keyDown(input, { key: 'Enter', keyCode: 13 });
        expect(spyOnSearch).toHaveBeenCalled();
        expect(spyOnSearch.calls[1].arguments[0]).toBe("test");
        expect(spyOnSearch.calls[1].arguments[1]).toEqual({services});
        expect(spyOnSearch.calls[1].arguments[2]).toBe(30);
    });
    it('test search and reset buttons', () => {
        const renderSearchBar = (testHandlers, text) => {
            return ReactDOM.render(
                <SearchBar
                    searchText={text}
                    delay={0}
                    typeAhead={false}
                    onSearch={testHandlers.onSearchHandler}
                    onSearchReset={testHandlers.onSearchResetHandler}
                    onSearchTextChange={testHandlers.onSearchTextChangeHandler}/>, document.getElementById("container"));
        };

        const testHandlers = {
            onSearchHandler: (text) => { return text; }
        };
        testHandlers.onSearchResetHandler = renderSearchBar.bind(null, testHandlers, '');
        testHandlers.onSearchTextChangeHandler = renderSearchBar.bind(null, testHandlers);

        const spyReset = expect.spyOn(testHandlers, 'onSearchResetHandler');
        spyReset.andCallThrough();
        renderSearchBar(testHandlers);
        let input = document.getElementsByTagName('input')[0];
        // test reset button
        expect(input).toExist();
        input.value = "test";
        TestUtils.Simulate.change(input);
        let reset = document.getElementsByClassName("glyphicon-1-close")[0];
        expect(reset).toExist();
        let search = document.getElementsByClassName("glyphicon-search")[0];
        expect(search).toExist();
        TestUtils.Simulate.click(reset);
        expect(spyReset.calls.length).toEqual(1);
        expect(input.value).toEqual("");
    });

    it('test search and reset on enter', () => {
        let searchOptions = {displaycrs: "EPSG:3857",
            services: [
                {type: "wfs",
                    name: "Meteorites",
                    displayName: "${properties,name}",
                    options: {
                        maxFeatures: 20,
                        srsName: "EPSG:4326"
                    },
                    launchInfoPanel: "single_layer"
                }]
        };
        const renderSearchBar = (testHandlers, text) => {
            return ReactDOM.render(
                <SearchBar
                    searchText={text}
                    searchOptions={searchOptions}
                    delay={0} typeAhead={false}
                    onSearch={testHandlers.onSearchHandler}
                    onSearchReset={testHandlers.onSearchResetHandler}
                    onSearchTextChange={testHandlers.onSearchTextChangeHandler}
                />, document.getElementById("container"));
        };

        const testHandlers = {
            onSearchHandler: (text) => { return text; },
            onSearchResetHandler: () => {}
        };
        testHandlers.onSearchTextChangeHandler = renderSearchBar.bind(null, testHandlers);

        const spy = expect.spyOn(testHandlers, 'onSearchHandler');
        const spyReset = expect.spyOn(testHandlers, 'onSearchResetHandler');
        renderSearchBar(testHandlers);
        let input = document.getElementsByTagName('input')[0];

        expect(input).toExist();
        input.value = "test";
        TestUtils.Simulate.change(input);
        TestUtils.Simulate.keyDown(input, {key: "Enter", keyCode: 13, which: 13});
        expect(spy.calls.length).toEqual(1);
        input.value = "";
        TestUtils.Simulate.change(input);
        TestUtils.Simulate.keyDown(input, {key: "Enter", keyCode: 13, which: 13});
        expect(spyReset.calls.length).toEqual(1);
    });

    it('test that options are passed to search action', () => {
        let searchOptions = {displaycrs: "EPSG:3857",
            services: [
                {
                    priority: 5,
                    type: "nomination"
                },
                {type: "wfs",
                    name: "Meteorites",
                    displayName: "${properties,name}",
                    options: {
                        maxFeatures: 20,
                        srsName: "EPSG:4326"
                    },
                    launchInfoPanel: "single_layer"
                },
                {type: "wfs",
                    name: "Meteorites",
                    displayName: "${properties,name}",
                    options: {
                        maxFeatures: undefined,
                        srsName: "EPSG:4328"
                    },
                    launchInfoPanel: "single_layer"
                }]
        };

        const renderSearchBar = (testHandlers, text) => {
            return ReactDOM.render(
                <SearchBar
                    searchOptions={searchOptions}
                    searchText={text}
                    delay={0}
                    maxResults={15}
                    typeAhead={false}
                    onSearch={testHandlers.onSearchHandler}
                    onSearchReset={testHandlers.onSearchResetHandler}
                    onSearchTextChange={testHandlers.onSearchTextChangeHandler}
                />, document.getElementById("container")
            );
        };

        const testHandlers = {
            onSearchHandler: (text, options) => { return [text, options]; }
        };
        testHandlers.onSearchTextChangeHandler = renderSearchBar.bind(null, testHandlers);

        const spy = expect.spyOn(testHandlers, 'onSearchHandler');
        renderSearchBar(testHandlers);
        let input = document.getElementsByTagName('input')[0];

        expect(input).toExist();
        input.value = "test";
        TestUtils.Simulate.change(input);
        TestUtils.Simulate.keyDown(input, {key: "Enter", keyCode: 13, which: 13});
        expect(spy.calls.length).toEqual(1);
        expect(spy).toHaveBeenCalledWith('test', searchOptions, 50);
    });
    it('test error and loading status', () => {
        ReactDOM.render(<SearchBar loading error={{message: "TEST_ERROR"}}/>, document.getElementById("container"));
        let error = document.getElementsByClassName("searcherror")[0];
        expect(error).toExist();
    });

    it('test cancel items', (done) => {
        const testHandlers = {
            onCancelSelectedItem: () => {}
        };


        // backspace with empty searchText causes trigger of onCancelSelectedItem
        const spy = expect.spyOn(testHandlers, 'onCancelSelectedItem');
        ReactDOM.render(<SearchBar searchText="" delay={0} typeAhead blurResetDelay={0} onCancelSelectedItem={testHandlers.onCancelSelectedItem} selectedItems={[{text: "TEST"}]}/>, document.getElementById("container"));

        let input = document.getElementsByTagName('input')[0];
        expect(input).toExist();
        TestUtils.Simulate.keyDown(input, {key: "Backspace", keyCode: 8, which: 8});

        setTimeout(() => {
            expect(spy.calls.length).toEqual(1);
            done();
        }, 10);
    });

    it('test search and reset buttons both present, splitTools=false', () => {
        ReactDOM.render(<SearchBar splitTools={false} searchText={"some val"} delay={0} typeAhead={false} />, document.getElementById("container"));
        let reset = document.getElementsByClassName("glyphicon-1-close")[0];
        let search = document.getElementsByClassName("glyphicon-search");
        expect(reset).toExist();
        expect(search).toExist();
        expect(search.length).toBe(1);
    });
    it('test only search present, splitTools=false', () => {
        ReactDOM.render(<SearchBar splitTools={false} searchText={""} delay={0} typeAhead={false} />, document.getElementById("container"));
        let reset = document.getElementsByClassName("glyphicon-1-close");
        expect(reset.length).toBe(0);

        let search = document.getElementsByClassName("magnifying-glass")[0];
        expect(search).toExist();
    });


    it('test only search present, splitTools=true', () => {
        ReactDOM.render(<SearchBar splitTools searchText={""} delay={0} typeAhead={false} />, document.getElementById("container"));
        let reset = document.getElementsByClassName("glyphicon-1-close");
        expect(reset.length).toBe(0);

        let search = document.getElementsByClassName("magnifying-glass")[0];
        expect(search).toExist();
    });

    it('test only reset present, splitTools=true', () => {
        ReactDOM.render(<SearchBar splitTools searchText={"va"} delay={0} typeAhead={false} />, document.getElementById("container"));
        let reset = document.getElementsByClassName("glyphicon-1-close")[0];
        let search = document.getElementsByClassName("glyphicon-search");
        expect(reset).toExist();
        expect(search.length).toBe(0);
    });
    it('test zoomToPoint, with search, with decimal, with reset', () => {
        const store = {dispatch: () => {}, subscribe: () => {}, getState: () => ({search: {coordinate: {lat: 2, lon: 2}}})};
        ReactDOM.render(<Provider store={store}><SearchBar format="decimal" coordinate={{"lat": 2, "lon": 2}} activeSearchTool="coordinatesSearch" showOptions searchText={"va"} delay={0} typeAhead={false} /></Provider>, document.getElementById("container"));
        let reset = document.getElementsByClassName("glyphicon-1-close");
        let search = document.getElementsByClassName("glyphicon-search");
        let cog = document.getElementsByClassName("glyphicon-cog");
        expect(reset.length).toBe(1);
        expect(search.length).toBe(1);
        expect(cog.length).toBe(1);
    });

    it('test zoomToPoint, with search, with decimal, with reset if mapCRS different than default 4326', () => {
        const store = {dispatch: () => {}, subscribe: () => {}, getState: () => ({search: {coordinate: {lat: 0.05, lon: 0.05, yCoord: 2, xCoord: 2}}})};
        ReactDOM.render(<Provider store={store}><SearchBar format="decimal" coordinate={{"lat": 0.05, "lon": 0.05, "yCoord": 2, "xCoord": 2}} activeSearchTool="mapCRSCoordinatesSearch" showOptions searchText={"va"} currentMapCRS={"EPSG:900913"} delay={0} typeAhead={false} /></Provider>, document.getElementById("container"));
        let reset = document.getElementsByClassName("glyphicon-1-close");
        let search = document.getElementsByClassName("glyphicon-search");
        let cog = document.getElementsByClassName("glyphicon-cog");
        expect(reset.length).toBe(1);
        expect(search.length).toBe(1);
        expect(cog.length).toBe(0);
    });

    it('test zoomToPoint, with search, with aeronautical, with reset', () => {
        const store = {dispatch: () => {}, subscribe: () => {}, getState: () => ({search: {coordinate: {lat: 2, lon: 2}}})};
        ReactDOM.render(<Provider store={store}><SearchBar format="aeronautical" activeSearchTool="coordinatesSearch" showOptions searchText={"va"} delay={0} typeAhead={false} /></Provider>, document.getElementById("container"));
        let reset = document.getElementsByClassName("glyphicon-1-close");
        let search = document.getElementsByClassName("glyphicon-search");
        let cog = document.getElementsByClassName("glyphicon-cog");
        let inputs = document.getElementsByTagName("input");
        expect(reset.length).toBe(0);
        expect(search.length).toBe(1);
        expect(cog.length).toBe(1);
        expect(inputs.length).toBe(6);
    });

    it('test calling zoomToPoint with onKeyDown event', (done) => {
        const store = {
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({search: {coordinate: {lat: 15, lon: 15}}})
        };
        ReactDOM.render(
            <Provider store={store}>
                <SearchBar
                    format="decimal"
                    activeSearchTool="coordinatesSearch"
                    showOptions
                    onZoomToPoint={(point, zoom, crs) => {
                        expect(point).toEqual({x: 15, y: 15});
                        expect(zoom).toEqual(12);
                        expect(crs).toEqual("EPSG:4326");
                        done();
                    }}
                    coordinate={{lat: 15, lon: 15}}
                    typeAhead={false} />
            </Provider>
            , document.getElementById("container")
        );
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        TestUtils.Simulate.keyDown(elements[0], {
            keyCode: 13,
            preventDefault: () => {
                expect(true).toBe(true);
                done();
            }
        });
    });
    it('test calling zoomToPoint with onKeyDown event if mapCRS different than default 4326', (done) => {
        const store = {
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({search: {coordinate: {yCoord: 15, xCoord: 15}}})
        };
        ReactDOM.render(
            <Provider store={store}>
                <SearchBar
                    format="decimal"
                    activeSearchTool="mapCRSCoordinatesSearch"
                    showOptions
                    onZoomToPoint={(point, zoom, crs) => {
                        expect(point).toEqual({x: 15, y: 15});
                        expect(zoom).toEqual(12);
                        expect(crs).toEqual("EPSG:4326");
                        done();
                    }}
                    coordinate={{yCoord: 15, xCoord: 15}}
                    currentMapCRS={"EPSG:900913"}
                    typeAhead={false} />
            </Provider>
            , document.getElementById("container")
        );
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        TestUtils.Simulate.keyDown(elements[0], {
            keyCode: 13,
            preventDefault: () => {
                expect(true).toBe(true);
                done();
            }
        });
    });

    it('Test SearchBar with not allowed e char for keyDown event', (done) => {
        const store = {
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({search: {coordinate: {lat: 15, lon: 15}}})
        };
        ReactDOM.render(
            <Provider store={store}>
                <SearchBar
                    format="decimal"
                    activeSearchTool="coordinatesSearch"
                    showOptions
                    onZoomToPoint={() => {
                        expect(true).toBe(false);
                    }}
                    coordinate={{lat: 15, lon: 15}}
                    typeAhead={false} />
            </Provider>, document.getElementById("container")
        );
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(2);
        expect(elements[0].value).toBe('15');

        TestUtils.Simulate.keyDown(elements[0], {
            keyCode: 69, // char e
            preventDefault: () => {
                expect(true).toBe(true);
                done();
            }
        });
    });
    it('Test SearchBar with not allowed e char for keyDown event if mapCRS different than default 4326', (done) => {
        const store = {
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({search: {coordinate: {yCoord: 150, xCoord: 150}}})
        };
        ReactDOM.render(
            <Provider store={store}>
                <SearchBar
                    format="decimal"
                    activeSearchTool="mapCRSCoordinatesSearch"
                    showOptions
                    onZoomToPoint={() => {
                        expect(true).toBe(false);
                    }}
                    coordinate={{yCoord: 150, xCoord: 150}}
                    currentMapCRS={"EPSG:900913"}
                    typeAhead={false} />
            </Provider>, document.getElementById("container")
        );
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(2);
        expect(elements[0].value).toBe('150');

        TestUtils.Simulate.keyDown(elements[0], {
            keyCode: 69, // char e
            preventDefault: () => {
                expect(true).toBe(true);
                done();
            }
        });
    });

    it('Test SearchBar with valid onKeyDown event by pressing number 8', () => {
        const store = {
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({search: {coordinate: {lat: 1, lon: 1}}})
        };
        ReactDOM.render(
            <Provider store={store}>
                <SearchBar
                    format="decimal"
                    activeSearchTool="coordinatesSearch"
                    showOptions
                    onZoomToPoint={() => {
                        expect(true).toBe(false);
                    }}
                    coordinate={{lat: 1, lon: 1}}
                    typeAhead={false} />
            </Provider>, document.getElementById("container")
        );
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(2);
        expect(elements[0].value).toBe('1');

        TestUtils.Simulate.keyDown(elements[0], {
            keyCode: 56,
            preventDefault: () => {
                expect(true).toBe(false);
            }
        });
    });
    it('Test SearchBar with valid onKeyDown event by pressing number 8 if mapCRS different than default 4326', () => {
        const store = {
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({search: {coordinate: {yCoord: 1, xCoord: 1}}})
        };
        ReactDOM.render(
            <Provider store={store}>
                <SearchBar
                    format="decimal"
                    activeSearchTool="mapCRSCoordinatesSearch"
                    showOptions
                    onZoomToPoint={() => {
                        expect(true).toBe(false);
                    }}
                    coordinate={{yCoord: 1, xCoord: 1}}
                    currentMapCRS={"EPSG:900913"}
                    typeAhead={false} />
            </Provider>, document.getElementById("container")
        );
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(2);
        expect(elements[0].value).toBe('1');

        TestUtils.Simulate.keyDown(elements[0], {
            keyCode: 56,
            preventDefault: () => {
                expect(true).toBe(false);
            }
        });
    });

    it('test showOptions false, only address tool visible', () => {
        ReactDOM.render(<SearchBar splitTools showOptions={false} searchText={""} delay={0} typeAhead={false} />, document.getElementById("container"));
        let menu = document.getElementsByClassName("glyphicon-menu-hamburger");
        let search = document.getElementsByClassName("glyphicon-search");
        let options = document.getElementsByClassName("glyphicon-cog");
        expect(menu.length).toBe(0);
        expect(search.length).toBe(1);
        expect(options.length).toBe(0);
    });

    it('test default coordinate format from localConfig', () => {
        const store = {dispatch: () => {}, subscribe: () => {}, getState: () => ({search: {coordinate: {lat: 2, lon: 2}}})};
        ConfigUtils.setConfigProp("defaultCoordinateFormat", "aeronautical");
        const defaultFormat = ConfigUtils.getConfigProp('defaultCoordinateFormat');
        let format;
        ReactDOM.render(
            <Provider store={store}>
                <SearchBar
                    format={format || defaultFormat || "decimal"}
                    activeSearchTool="coordinatesSearch"
                    showOptions
                    searchText={"va"}
                    delay={0}
                    typeAhead={false}/>
            </Provider>, document.getElementById("container"));
        let inputs = document.getElementsByTagName("input");
        expect(inputs.length).toBe(6);
        expect(inputs[0].placeholder).toBe('d');
        expect(inputs[1].placeholder).toBe('m');
        expect(inputs[2].placeholder).toBe('s');

        // Clean up defaults
        ConfigUtils.removeConfigProp("defaultCoordinateFormat");
    });

    it('test searchByBookmark options under menu', () => {
        const store = {dispatch: () => {}, subscribe: () => {}, getState: () => ({searchbookmarkconfig: {selected: {}}})};
        ReactDOM.render(<Provider store={store}><SearchBar showOptions bookmarkConfig={{selected: {}}} showBookMarkSearchOption activeSearchTool="bookmarkSearch" items={items}  /></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        TestUtils.Simulate.click(buttons[1]);
        const links = container.querySelectorAll('a');
        const bookmark = container.getElementsByClassName('glyphicon-bookmark');
        expect(links.length).toBe(2);
        expect(bookmark).toExist();
        expect(links[1].innerText).toBe('Search by bookmark');
    });
    it('test searchByBookmark, search button disabled', () => {
        const store = {dispatch: () => {}, subscribe: () => {}, getState: () => ({searchbookmarkconfig: {selected: {}}})};
        ReactDOM.render(<Provider store={store}><SearchBar showOptions showBookMarkSearchOption activeSearchTool="bookmarkSearch" items={items} bookmarkConfig={{}}  /></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const buttons = container.querySelectorAll('button');
        const cog = document.getElementsByClassName("glyphicon-cog");
        const bookmarkSelect = container.querySelector('.search-select');
        expect(bookmarkSelect).toExist();
        expect(buttons.length).toBe(2);
        const searchButton = buttons[0];
        expect(searchButton).toExist();
        expect(searchButton.classList.contains('disabled')).toBe(true);
        expect(cog).toExist();
    });
    it('test reset active search tool when no bookmark config', () => {
        const store = {dispatch: () => {}, subscribe: () => {}, getState: () => ({searchbookmarkconfig: {selected: {}}})};
        const actions = {
            onChangeActiveSearchTool: () =>{}
        };
        const spyOnChangeActiveSearchTool = expect.spyOn(actions, 'onChangeActiveSearchTool');
        ReactDOM.render(<Provider store={store}><SearchBar bookmarkConfig={{selected: {}, allowUser: false, bookmarkSearchConfig: {bookmarks: []}}} showOptions showBookMarkSearchOption onChangeActiveSearchTool={actions.onChangeActiveSearchTool} items={items} activeSearchTool="bookmarkSearch" /></Provider>, document.getElementById("container"));
        expect(spyOnChangeActiveSearchTool).toHaveBeenCalled();
        expect(spyOnChangeActiveSearchTool.calls[0].arguments[0]).toBe("addressSearch");
    });
    it('test searchByBookmark, with bookmark selected', () => {
        const store = {dispatch: () => {}, subscribe: () => {}, getState: () => ({searchbookmarkconfig: {selected: {}}})};
        const bookmarkConfig = {selected: {title: "Bookmark1"}, bookmarkSearchConfig: {bookmarks: [{title: "Bookmark 1"}, {title: "Bookmark 2"}]}};
        ReactDOM.render(<Provider store={store}><SearchBar showOptions showBookMarkSearchOption activeSearchTool="bookmarkSearch" items={items} bookmarkConfig={bookmarkConfig}  /></Provider>, document.getElementById("container"));
        const cmp = document.getElementById('container');
        expect(cmp).toExist();
        const bookmarkSelect = cmp.querySelector('.search-select');
        expect(bookmarkSelect).toExist();
        const buttons = cmp.querySelectorAll('button');
        expect(buttons[1].disabled).toBeFalsy();
    });
    it('test searchByBookmark, open view bookmarks onToggleControl', () => {
        const store = {dispatch: () => {}, subscribe: () => {}, getState: () => ({searchbookmarkconfig: {selected: {}}})};
        const bookmarkConfig = {selected: {title: "Bookmark1"}, bookmarkSearchConfig: {bookmarks: [{title: "Bookmark 1"}, {title: "Bookmark 2"}]}, allowUser: true};
        const actions = {
            onToggleControl: () =>{}
        };
        const itemsProps = [{
            name: 'SearchByBookmark',
            bookmarkConfig: (toggleConfig) =>({onClick: () => toggleConfig("searchBookmarkConfig"), glyph: "cog", visible: true}),
            menuItem: () => <MenuItem>Search by bookmark</MenuItem>
        }];
        const spyOnToggleControl = expect.spyOn(actions, 'onToggleControl');
        const props = {
            showOptions: true,
            showBookMarkSearchOption: true,
            enabledSearchBookmarkConfig: false,
            activeSearchTool: "bookmarkSearch",
            onToggleControl: actions.onToggleControl,
            items: itemsProps,
            bookmarkConfig
        };
        ReactDOM.render(<Provider store={store}><SearchBar {...props}/></Provider>, document.getElementById("container"));
        const cmp = document.getElementById('container');
        expect(cmp).toExist();
        const bookmarkSelect = cmp.querySelector('.search-select');
        expect(bookmarkSelect).toExist();
        const buttons = cmp.querySelectorAll('button');
        TestUtils.Simulate.click(buttons[0]); // Bookmark config button
        expect(spyOnToggleControl).toHaveBeenCalled();
        expect(spyOnToggleControl.calls[0].arguments[0]).toBe("searchBookmarkConfig");
    });
    it('test searchByBookmark, load a bookmark with onLayerVisibilityLoad', () => {
        const store = {dispatch: () => {}, subscribe: () => {}, getState: () => ({searchbookmarkconfig: {selected: {}}})};
        const bookmarkConfig = {selected: {title: "Bookmark1", layerVisibilityReload: true, options: {west: 5, south: 10, east: 20, north: 30}}, bookmarkSearchConfig: {bookmarks: [{title: "Bookmark 1"}, {title: "Bookmark 2"}]}};
        const actions = {
            onLayerVisibilityLoad: () =>{}
        };
        const itemsProps = [{bookmarkConfig: () =>({glyph: "cog", visible: true}), menuItem: () => <MenuItem>Search by bookmark</MenuItem>}];
        const spyOnLayerVisibilityLoad = expect.spyOn(actions, 'onLayerVisibilityLoad');
        const props = {
            showOptions: true,
            showBookMarkSearchOption: true,
            enabledSearchBookmarkConfig: false,
            activeSearchTool: "bookmarkSearch",
            onLayerVisibilityLoad: actions.onLayerVisibilityLoad,
            items: itemsProps,
            bookmarkConfig,
            allowUser: true,
            mapInitial: {map: {layers: "Tests"}}
        };
        ReactDOM.render(<Provider store={store}><SearchBar {...props}/></Provider>, document.getElementById("container"));
        const cmp = document.getElementById('container');
        expect(cmp).toExist();
        const bookmarkSelect = cmp.querySelector('.search-select');
        expect(bookmarkSelect).toExist();
        const buttons = cmp.querySelectorAll('button');
        TestUtils.Simulate.click(buttons[0]); // Search button
        expect(spyOnLayerVisibilityLoad).toHaveBeenCalled();
        expect(spyOnLayerVisibilityLoad.calls.length).toBe(1);
        expect(spyOnLayerVisibilityLoad.calls[0].arguments[0]).toEqual({map: {layers: "Tests", bookmark_search_config: {bookmarks: [{title: "Bookmark 1"}, {title: "Bookmark 2"}]}}});
        expect(spyOnLayerVisibilityLoad.calls[0].arguments[1]).toEqual(null);
        expect(spyOnLayerVisibilityLoad.calls[0].arguments[2]).toBeTruthy();
        expect(spyOnLayerVisibilityLoad.calls[0].arguments[2].bounds).toEqual([ 5, 10, 20, 30 ]);
        expect(spyOnLayerVisibilityLoad.calls[0].arguments[2].crs).toBe('EPSG:4326');
    });
    it('test searchByBookmark, load a bookmark with zoomToExtent', () => {
        const store = {dispatch: () => {}, subscribe: () => {}, getState: () => ({searchbookmarkconfig: {selected: {}}})};
        const bookmarkConfig = {selected: {title: "Bookmark1", layerVisibilityReload: false, options: {west: 5, south: 10, east: 20, north: 30}}};
        const actions = {
            onZoomToExtent: () => {}
        };
        const itemsProps = [{bookmarkConfig: () =>({glyph: "cog", visible: true}), menuItem: () => <MenuItem>Search by bookmark</MenuItem>}];
        const spyOnZoomToExtent = expect.spyOn(actions, 'onZoomToExtent');
        const props = {
            showOptions: true,
            showBookMarkSearchOption: true,
            enabledSearchBookmarkConfig: false,
            activeSearchTool: "bookmarkSearch",
            onZoomToExtent: actions.onZoomToExtent,
            items: itemsProps,
            bookmarkConfig,
            allowUser: true,
            mapInitial: {map: {layers: "Tests"}}
        };
        ReactDOM.render(<Provider store={store}><SearchBar {...props}/></Provider>, document.getElementById("container"));
        const cmp = document.getElementById('container');
        expect(cmp).toExist();
        const bookmarkSelect = cmp.querySelector('.search-select');
        expect(bookmarkSelect).toExist();
        const buttons = cmp.querySelectorAll('button');
        TestUtils.Simulate.click(buttons[0]); // Search button
        expect(spyOnZoomToExtent).toHaveBeenCalled();
        expect(spyOnZoomToExtent.calls.length).toBe(1);
        expect(spyOnZoomToExtent.calls[0].arguments[0]).toEqual([ 5, 10, 20, 30 ]);
    });

    it("test maxZoomLevel for Coordinate search", (done) => {
        const coordinateSearchOptions = {maxZoomLevel: 15};

        const store = {
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({search: {coordinate: {lat: 15, lon: 15}}})
        };
        ReactDOM.render(
            <Provider store={store}>
                <SearchBar
                    format="decimal"
                    activeSearchTool="coordinatesSearch"
                    showOptions
                    onZoomToPoint={(point, zoom) => {
                        expect(zoom).toEqual(15);
                        done();
                    }}
                    coordinate={{lat: 15, lon: 15}}
                    typeAhead={false}
                    defaultZoomLevel={coordinateSearchOptions?.maxZoomLevel}
                />
            </Provider>
            , document.getElementById("container")
        );
        const container = document.getElementById('container');
        const buttons = container.querySelectorAll('.glyphicon-search');
        expect(buttons.length).toBe(1);
        TestUtils.Simulate.click(buttons[0]);
    });

    it("test default maxZoomLevel for Coordinate search", (done) => {

        const store = {
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({search: {coordinate: {lat: 15, lon: 15}}})
        };
        ReactDOM.render(
            <Provider store={store}>
                <SearchBar
                    format="decimal"
                    activeSearchTool="coordinatesSearch"
                    showOptions
                    onZoomToPoint={(point, zoom) => {
                        // default zoom level is 12
                        expect(zoom).toEqual(12);
                        done();
                    }}
                    coordinate={{lat: 15, lon: 15}}
                    typeAhead={false}
                />
            </Provider>
            , document.getElementById("container")
        );
        const container = document.getElementById('container');
        const buttons = container.querySelectorAll('.glyphicon-search');
        expect(buttons.length).toBe(1);
        TestUtils.Simulate.click(buttons[0]);
    });
});
