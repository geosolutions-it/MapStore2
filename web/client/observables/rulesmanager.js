const Rx = require('rxjs');

const {parseString} = require('xml2js');
const {stripPrefix} = require('xml2js/lib/processors');
const CatalogAPI = require('../api/CSW');
const GeoFence = require('../api/geoserver/GeoFence');
const ConfigUtils = require('../utils/ConfigUtils');

const xmlToJson$ = response => Rx.Observable.bindNodeCallback( (data, callback) => parseString(data, {
    tagNameProcessors: [stripPrefix],
    explicitArray: false,
    mergeAttrs: true
}, callback))(response);


const loadSinglePage = (page = 0, filters = {}, size = 10) => Rx.Observable.defer(() => GeoFence.loadRules(page, filters, size))
                            .switchMap( response => xmlToJson$(response)
                            .map(({RuleList = {}}) => ({ page, rules: [].concat(RuleList.rule || [])}))
                        );
const countUsers = (filter = "") => Rx.Observable.defer(() => GeoFence.getUsersCount(filter));
const loadUsers = (filter = "", page = 0, size = 10) => Rx.Observable.defer(() => GeoFence.getUsers(filter, page, size))
.switchMap( response => xmlToJson$(response).
                map(({UserList = {}}) => ({users: [].concat(UserList.User || [])}))
);

const countRoles = (filter = "") => Rx.Observable.defer(() => GeoFence.getGroupsCount(filter));

const loadRoles = (filter = "", page = 0, size = 10) => Rx.Observable.defer(() => GeoFence.getGroups(filter, page, size))
.switchMap( response => xmlToJson$(response).
                map(({UserGroupList = {}}) => ({users: [].concat(UserGroupList.UserGroup || [])}))
);


module.exports = {
    loadRules: (pages = [], filters = {}, size) =>
        Rx.Observable.combineLatest(pages.map(p => loadSinglePage(p, filters, size)))
        .map(results => results.reduce( (acc, {page, rules}) => ({...acc, [page]: rules}), {}))
        .map(p => ({pages: p})),
    getCount: (filters = {}) => Rx.Observable.defer(() => GeoFence.getRulesCount(filters)),
    moveRules: (targetPriority, rulesIds) => Rx.Observable.defer(() => GeoFence.moveRules(targetPriority, rulesIds)),
    getUsers: (userFilter = "", page = 0, size = 10, parentsFilter = {}, countEl = false) => {
        return countEl && Rx.Observable.combineLatest([countUsers(userFilter), loadUsers(userFilter, page, size)], (count, {users}) => ({
            count,
            data: users
        })) || loadUsers(userFilter, page, size).map(({users}) => ({data: users}));
    },
    getRoles: (roleFilter = "", page = 0, size = 10, parentsFilter = {}, countEl = false) => {
        return countEl && Rx.Observable.combineLatest([countRoles(roleFilter), loadRoles(roleFilter, page, size)], (count, {users}) => ({
            count,
            data: users
        })) || loadRoles(roleFilter, page, size).map(({users}) => ({data: users}));
    },
    getWorkspaces: ({size}) => Rx.Observable.defer(() => GeoFence.getWorkspaces())
                        .map(({workspaces = {}}) => ({count: size, data: [].concat(workspaces.workspace)})),
    loadLayers: (layerFilter = "", page = 0, size = 10, parentsFilter = {}) => {
        const {url: baseURL} = ConfigUtils.getDefaults().geoFenceGeoServerInstance || {};
        const catalogUrl = baseURL + 'csw';
        const {workspace = ""} = parentsFilter;
        return Rx.Observable.defer(() =>
        CatalogAPI.workspaceSearch(catalogUrl, (page) * size + 1, size, layerFilter, workspace))
        .map((layers) => ({data: layers.records.map(layer => ({name: layer.dc.identifier.replace(/^.*?:/g, '')})), count: layers.numberOfRecordsMatched}));
    }

};
