/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';
import {Grid, Button} from 'react-bootstrap';
import SearchBar from "../../components/search/SearchBar";
import Message from '../../components/I18N/Message';

import {createPlugin} from '../../utils/PluginsUtils';
import {userSelector} from '../../selectors/security';
import {searchTextSelector, searchOptionsSelector, resultsSelector} from '../../selectors/contextmanager';
import {searchContexts, searchTextChanged, deleteContext, editContext, searchReset, reloadContexts} from '../../actions/contextmanager';
import {updateAttribute} from '../../actions/maps';
import ContextGridComponent from './ContextGrid';
import PaginationToolbar from './PaginationToolbar';
import * as epics from '../../epics/contextmanager';
import contextmanager from '../../reducers/contextmanager';

const ContextGrid =  connect(createStructuredSelector({
    user: userSelector
}), {
    onDelete: deleteContext,
    reloadContexts,
    onUpdateAttribute: updateAttribute
})(ContextGridComponent);

class ContextManager extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        splitTools: PropTypes.bool,
        showOptions: PropTypes.bool,
        searchOptions: PropTypes.object,
        isSearchClickable: PropTypes.bool,
        hideOnBlur: PropTypes.bool,
        placeholderMsgId: PropTypes.string,
        typeAhead: PropTypes.bool,
        searchText: PropTypes.string,
        onSearch: PropTypes.func,
        onSearchReset: PropTypes.func,
        onSearchTextChange: PropTypes.func,
        resources: PropTypes.array,
        colProps: PropTypes.object,
        fluid: PropTypes.bool,
        editDataEnabled: PropTypes.bool
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        className: "user-search",
        hideOnBlur: false,
        isSearchClickable: true,
        showOptions: false,
        splitTools: false,
        placeholderMsgId: "contextManager.searchPlaceholder",
        typeAhead: false,
        searchText: "",
        searchOptions: {
            params: {
                start: 0,
                limit: 12
            }
        },
        resources: [],
        colProps: {
            xs: 12,
            sm: 6,
            lg: 3,
            md: 4,
            className: 'ms-map-card-col'
        },
        fluid: true,
        editDataEnabled: true,
        onSearch: () => {},
        onSearchReset: () => {},
        onSearchTextChange: () => {},
        onEditData: () => {}
    };

    componentDidMount() {
        this.props.onSearch(this.props.searchText, this.props.searchOptions);
    }

    render() {
        return (<>
            <SearchBar
                className={this.props.className}
                splitTools={this.props.splitTools}
                showOptions={this.props.showOptions}
                searchOptions={this.props.searchOptions}
                isSearchClickable={this.props.isSearchClickable}
                hideOnBlur={this.props.hideOnBlur}
                placeholderMsgId ={this.props.placeholderMsgId}
                onSearch={this.props.onSearch}
                onSearchReset={this.props.onSearchReset}
                onSearchTextChange={this.props.onSearchTextChange}
                typeAhead={this.props.typeAhead}
                searchText={this.props.searchText} />
            <Grid style={{marginBottom: "10px"}} fluid>
                <h1 className="usermanager-title"><Message msgId={"contextManager.gridTitle"}/></h1>
                <Button
                    style={{marginRight: "10px"}}
                    bsStyle="success"
                    onClick={() => this.context.router.history.push(`/context-creator/new`)}>
                        &nbsp;<span><Message msgId="contextManager.newContext"/></span>
                </Button>
            </Grid>
            <ContextGrid
                resources={this.props.resources}
                fluid={this.props.fluid}
                colProps={this.props.colProps}
                viewerUrl={(context) => this.context.router.history.push(`/context/${context.name}`)}
                getShareUrl={(context) => `context/${context.name}`}
                editDataEnabled={this.props.editDataEnabled}
                onEditData={this.props.onEditData}
                nameFieldFilter={name => name.replace(/[^a-zA-Z0-9\-_]/, '')}
                cardTooltips={{
                    deleteResource: "resources.resource.deleteResource",
                    editResource: "resources.resource.editResource",
                    editResourceData: "contextManager.editContextTooltip",
                    shareResource: "share.title",
                    addToFeatured: "resources.resource.addToFeatured",
                    showDetails: "resources.resource.showDetails",
                    removeFromFeatured: "resources.resource.removeFromFeatured"
                }}
                bottom={<PaginationToolbar/>} />
        </>);
    }
}

const contextManagerSelector = createStructuredSelector({
    searchText: searchTextSelector,
    searchOptions: searchOptionsSelector,
    resources: resultsSelector
});

export default createPlugin('ContextManager', {
    component: connect(contextManagerSelector, {
        onSearch: searchContexts,
        onSearchReset: searchReset,
        onSearchTextChange: searchTextChanged,
        onEditData: editContext
    })(ContextManager),
    reducers: {
        contextmanager
    },
    epics
});
