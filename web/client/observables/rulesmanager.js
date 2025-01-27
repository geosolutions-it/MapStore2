/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { trim } from 'lodash';
import Rx from 'rxjs';

import { RULE_SAVED } from '../actions/rulesmanager';
import GeoFence from '../api/geoserver/GeoFence';
import WMS from '../api/WMS';
import ConfigUtils from '../utils/ConfigUtils';
import { describeFeatureType } from './wfs';
import { describeLayer, getLayerCapabilities } from './wms';
import { getLayerOptions } from '../utils/WMSUtils';

const fixUrl = (url) => {
    const u = trim(url, "/");
    return u.indexOf("http") === 0 ? `${u}/` : `/${u}/`;
};
const getUpdateType = (o, n) => {
    if (o.priority !== n.priority) {
        return 'full';
    } else if (o.grant !== n.grant || o.ipaddress !== n.ipaddress) {
        return 'grant';
    }
    return "simple";
};
const loadSinglePage = (page = 0, filters = {}, size = 10) =>
    Rx.Observable.defer(() => GeoFence.loadRules(page, filters, size))
        .map(({rules = []}) => ({
            page,
            rules: rules.map(r => {
                if (!r.constraints) {
                    return r;
                }
                const style = [].concat(r.constraints.allowedStyles.style || []);
                r.constraints.allowedStyles = {style};
                return r;
            })})
        );
const countUsers = (filter = "") => Rx.Observable.defer(() => GeoFence.getUsersCount(filter));
const loadUsers = (filter = "", page = 0, size = 10) =>
    Rx.Observable.defer(() => GeoFence.getUsers(filter, page, size));

const countRoles = (filter = "") => Rx.Observable.defer(() => GeoFence.getRolesCount(filter));

const loadRoles = (filter = "", page = 0, size = 10) => Rx.Observable.defer(() => GeoFence.getRoles(filter, page, size));

export const deleteRule = (id) => Rx.Observable.defer(() => GeoFence.deleteRule(id));

// Full update we need to delete, save and move
const fullUpdate = (update$) => update$.filter(({rule: r, origRule: oR}) =>getUpdateType(oR, r) === 'full')
    .switchMap(({rule, origRule}) => deleteRule(rule.id)
        .switchMap(() => {
            const {priority, id, ...newRule} = rule;
            return Rx.Observable.defer(() => GeoFence.addRule(newRule))
                .catch((e) => {
                    const {priority: p, id: omit, ...oldRule} = origRule;
                    oldRule.position = {value: p, position: "fixedPriority"};
                    // We have to restore original rule and throw the exception if failed!!
                    return Rx.Observable.defer(() => GeoFence.addRule(oldRule)).catch(() => { throw (e); });
                });
        })
        .switchMap(({data: id}) => {
            return Rx.Observable.defer(() => GeoFence.moveRules(rule.priority, [{id}])).concat(Rx.Observable.of({type: RULE_SAVED}));
        }
        ));
const grantUpdate = (update$) => update$.filter(({rule: r, origRule: oR}) => getUpdateType(oR, r) === 'grant')
    .switchMap(({rule, origRule}) => deleteRule(rule.id)
        .switchMap(() => {
            const {priority, id, ...newRule} = rule;
            newRule.position = {value: priority, position: "fixedPriority"};
            return Rx.Observable.defer(() => GeoFence.addRule(newRule))
                .catch((e) => {
                    const {priority: p, id: omit, ...oldRule} = origRule;
                    oldRule.position = {value: p, position: "fixedPriority"};
                    // We have to restore original rule and to throw the exception and reload the rules!!
                    return Rx.Observable.defer(() => GeoFence.addRule(oldRule)).concat(Rx.Observable.of({type: RULE_SAVED}).do(() => { throw (e); }));
                });
        })
    );
// if priority and grant are the same we just need to update new rule
const justUpdate = (update$) => update$.filter(({rule: r, origRule: oR}) => getUpdateType(oR, r) === 'simple')
    .switchMap(({rule}) => Rx.Observable.defer(() => GeoFence.updateRule(rule)));

export const loadRules = (pages = [], filters = {}, size) =>
    Rx.Observable.combineLatest(pages.map(p => loadSinglePage(p, filters, size)))
        .map(results => results.reduce( (acc, {page, rules}) => ({...acc, [page]: rules}), {}))
        .map(p => ({pages: p}));
export const getCount = (filters = {}) => Rx.Observable.defer(() => GeoFence.getRulesCount(filters));
export const moveRules = (targetPriority, rulesIds) => Rx.Observable.defer(() => GeoFence.moveRules(targetPriority, rulesIds));
export const getUsers = (userFilter = "", page = 0, size = 10, countEl = false) => {
    return countEl && Rx.Observable.combineLatest([countUsers(userFilter), loadUsers(userFilter, page, size)], (count, {users}) => ({
        count,
        data: users
    })) || loadUsers(userFilter, page, size).map(({users}) => ({data: users}));
};
export const getRoles = (roleFilter = "", page = 0, size = 10, countEl = false) => {
    return countEl
        ? Rx.Observable.combineLatest([countRoles(roleFilter), loadRoles(roleFilter, page, size)],
            (count, {roles}) => ({
                count,
                data: roles
            }))
        : loadRoles(roleFilter, page, size).map(({ roles }) => ({ data: roles}));
};
export const getWorkspaces = ({size}) => Rx.Observable.defer(() => GeoFence.getWorkspaces())
    .map(({workspaces = {}}) => ({count: size, data: [].concat(workspaces.workspace)}));
export const loadLayers = (layerFilter = "", page = 0, size = 10, parentsFilter = {}) =>
    Rx.Observable.defer( () => GeoFence.getLayers(layerFilter, page, size, parentsFilter));
export const updateRule = (rule, origRule) => {
    const fullUp = Rx.Observable.of({rule, origRule}).let(fullUpdate);
    const simpleUpdate = Rx.Observable.of({rule, origRule}).let(justUpdate);
    const grant = Rx.Observable.of({rule, origRule}).let(grantUpdate);
    return fullUp.merge(simpleUpdate, grant);
};
export const createRule = (rule) => Rx.Observable.defer(() => GeoFence.addRule(rule));

export const getStylesAndAttributes = (layer, workspace) => {
    const {url} = ConfigUtils.getDefaults().geoFenceGeoServerInstance || {};
    const name = `${workspace}:${layer}`;
    const l = {url: `${fixUrl(url)}wms`, name};
    return Rx.Observable.combineLatest(getLayerCapabilities(l)
        .map((cp) => {
            const { availableStyles = [] } = getLayerOptions(cp);
            return {
                style: availableStyles,
                ly: {
                    bbox: WMS.getBBox(cp),
                    name,
                    url: `${fixUrl(url)}wms`,
                    type: "wms",
                    visibility: true,
                    format: "image/png",
                    title: cp.Title
                }
            };
        }),
    describeLayer(l).map(({data}) => data.layerDescriptions[0])
        .switchMap(({owsType}) => {
            return owsType === "WCS" ? Rx.Observable.of({properties: [], type: "RASTER"}) : describeFeatureType({layer: l})
                .map(({data}) => ({properties: data.featureTypes[0] && data.featureTypes[0].properties || [], type: "VECTOR"}));
        }), ({style, ly}, {properties, type}) => ({styles: style || [], properties, type, layer: ly}));

};
export const cleanCache = () => Rx.Observable.defer(() => GeoFence.cleanCache());

export default {
    loadRules,
    getCount,
    moveRules,
    getUsers,
    getRoles,
    getWorkspaces,
    loadLayers,
    updateRule,
    createRule,
    deleteRule,
    getStylesAndAttributes,
    cleanCache
};
