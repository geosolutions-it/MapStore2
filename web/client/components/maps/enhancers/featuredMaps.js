/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const {isArray, isObject, isEqual, get, zip} = require('lodash');
const {searchListByAttributes} = require('../../../api/GeoStoreDAO');
const {getResource} = require('../../../api/persistence');
const {compose, withState, lifecycle} = require('recompose');

/*
 * parse attributes returned from records
 */
const parseAttributes = (record) => {
    const attributes = get(record, 'Attributes.attribute');
    const attributesArray = isArray(attributes) && attributes || isObject(attributes) && [attributes];
    return attributesArray && attributesArray.reduce((newAttributes, attribute) => ({...newAttributes, [attribute.name]: attribute.value}), {}) || {};
};
/*
 * send a search list request to GeoStore with NAME and ATTRIBUTE filters
 */
const searchFeaturedMaps = (start, limit, searchText = '') => {
    const searchObj = searchText && searchText !== '*' ? {
        FIELD: [
            {
                field: ['NAME'],
                operator: ['ILIKE'],
                value: ['%' + searchText + '%']
            }
        ]
    } : {};
    const makeExtResource = (results, maps = [], contextNames) => ({
        ...results,
        ExtResourceList: {
            ...results.ExtResourceList,
            Resource: contextNames ?
                zip(maps, contextNames).map(([curMap, contextName]) => ({...curMap, contextName})) :
                maps
        }
    });
    const getContextNames = (results) => {
        const extResource = get(results, 'ExtResourceList.Resource', []);
        const maps = (isArray(extResource) ? extResource : [extResource]).map(res => ({...res, ...parseAttributes(res)}));
        return maps.length === 0 ?
            Rx.Observable.of(makeExtResource(results, maps)) :
            Rx.Observable.forkJoin(
                maps.map(({context}) => context ?
                    getResource(context, {includeAttributes: false, withData: false, withPermissions: false})
                        .switchMap(resource => Rx.Observable.of(resource.name))
                        .catch(() => Rx.Observable.of(null)) :
                    Rx.Observable.of(null))
            ).map(contextNames => makeExtResource(results, maps, contextNames));
    };
    return Rx.Observable.fromPromise(
        searchListByAttributes({
            AND: {
                ...searchObj,
                ATTRIBUTE: [
                    {
                        name: ['featured'],
                        operator: ['EQUAL_TO'],
                        type: ['STRING'],
                        value: [true]
                    }
                ]
            }
        }, {
            params: {
                includeAttributes: true,
                start,
                limit
            }
        })
            .then(results => results)
    ).switchMap(results => getContextNames(results)).catch(() => Rx.Observable.of(null));
};
const getIcon = record => {
    const cat = get(record, "category.name");
    switch (cat) {
    case "MAP":
        return "1-map";
    case "DASHBOARD":
        return "dashboard";
    case "GEOSTORY":
        return "geostory";
    default:
        return null;
    }
};
/*
 * converts record item into a item for MapsGrid
 */
const resultToProps = ({result = {}, permission}) => ({
    items: (result.Resource || []).map((record = {}) => ({
        id: record.id,
        name: record.name,
        category: record.category,
        icon: getIcon(record),
        canCopy: permission,
        canDelete: permission,
        canEdit: permission,
        creation: record.creation,
        description: record.description,
        lastUpdate: record.lastUpdate,
        ...parseAttributes(record),
        contextName: record.contextName,
        owner: record.owner,
        featured: 'added',
        featuredEnabled: true
    })),
    total: result && result.ResourceCount ? result.ResourceCount : 0,
    loading: false
});

/*
 * retrieves data from a GeoStore service and converts to props
 */
const loadPage = ({permission, viewSize = 4, searchText = '', pageSize = 4} = {}, page = 0) =>
    searchFeaturedMaps(page * pageSize, page === 0 ? viewSize : pageSize, searchText)
        .map((result) => ({permission, result: result && result.ExtResourceList || []}))
        .map(resultToProps);

/*
 * add viewSize and previousItems props to control previous and current items in the grid view
 */
const updateItemsLifecycle = compose(
    withState('viewSize', 'onChangeSize', 4),
    withState('previousItems', 'onUpdatePreviousItems', []),
    lifecycle({
        componentWillUpdate(newProps) {
            const {
                items = [],
                pageSize = 4,
                onChangeSize = () => {},
                previousItems,
                onUpdatePreviousItems = () => {}
            } = this.props;
            if (!isEqual(newProps.items, items)) {

                onUpdatePreviousItems(items);
                if (newProps.items.length > 0) {
                    onChangeSize(Math.ceil(newProps.items.length / pageSize) * pageSize);
                } else if (newProps.items.length === 0 && newProps.searchText !== '*' && newProps.searchText) {
                    onUpdatePreviousItems(null);
                }

            } else if (previousItems && previousItems.length === 1 && newProps.items.length === 0) {
                onUpdatePreviousItems(null);
            }
        }
    })
);

module.exports = {
    loadPage,
    updateItemsLifecycle
};
