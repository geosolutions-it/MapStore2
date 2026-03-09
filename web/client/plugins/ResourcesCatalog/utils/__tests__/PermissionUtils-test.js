import expect from 'expect';
import { getEntryIdKey, getGroupIdKey } from '../PermissionUtils';

const SAMPLE_IP_ENTRY_1 = {
    "type": "ip",
    "id": 61873,
    "name": "185.230.235.34/32",
    "description": "GeoSolutions VPN",
    "parsed": true
};
const SAMPLE_GROUP_ENTRY_1 = {
    "type": "group",
    "id": 10934,
    "name": "group",
    "parsed": true
};

const SAMPLE_GROUP_ENTRY_EVERYONE = {
    "type": "group",
    "id": 479,
    "name": "everyone",
    "parsed": true
};
const SAMPLE_GROUP_ENTRY_DIRECT_INTEGRATION_EVERYONE = {
    "type": "group",
    "id": -1,
    "name": "everyone",
    "parsed": true
};
const SAMPLE_GROUP_ENTRY_DIRECT_INTEGRATION_2 = {
    "type": "group",
    "id": -1,
    "name": "USER",
    "parsed": true
};
const SAMPLE_GROUP_EVERYONE = {
    "description": "description",
    "enabled": true,
    "groupName": "everyone",
    "id": 479,
    "filterValue": "everyone",
    "value": "everyone",
    "label": "everyone"
};

const SAMPLE_GROUP_DIRECT_INTEGRATION = {
    "description": "description",
    "enabled": true,
    "groupName": "everyone",
    "id": -1,
    "filterValue": "everyone",
    "value": "everyone",
    "label": "everyone"
};

const isUnique = (arr) => new Set(arr).size === arr.length;
describe('PermissionUtils', () => {

    it('getEntryIdKey', () => {
        // must generate unique values for different names and rule types
        expect(isUnique([
            SAMPLE_IP_ENTRY_1,
            SAMPLE_GROUP_ENTRY_1,
            SAMPLE_GROUP_ENTRY_EVERYONE
        ].map(getEntryIdKey))).toBeTruthy();
        // must generate unique name regardless the fake IDs they may have
        expect(isUnique([
            SAMPLE_GROUP_ENTRY_DIRECT_INTEGRATION_EVERYONE,
            SAMPLE_GROUP_ENTRY_DIRECT_INTEGRATION_2
        ].map(getEntryIdKey))).toBeTruthy();
        // must generate same ID for same group name
        expect(isUnique([
            SAMPLE_GROUP_ENTRY_DIRECT_INTEGRATION_EVERYONE,
            SAMPLE_GROUP_ENTRY_EVERYONE
        ].map(getEntryIdKey))).toBeFalsy();
        // ENTRYs entryId key must differ regardless id
        expect(getEntryIdKey(SAMPLE_GROUP_ENTRY_DIRECT_INTEGRATION_EVERYONE) !== getEntryIdKey(SAMPLE_GROUP_ENTRY_DIRECT_INTEGRATION_2)  ).toBeTruthy();
    });
    it('getGroupIdKey', () => {
        // the group entry IDs must match the group Id key generated
        expect(getEntryIdKey(SAMPLE_GROUP_ENTRY_EVERYONE)).toEqual(getGroupIdKey(SAMPLE_GROUP_EVERYONE));
        expect(getEntryIdKey(SAMPLE_GROUP_ENTRY_DIRECT_INTEGRATION_EVERYONE)).toEqual(getGroupIdKey(SAMPLE_GROUP_DIRECT_INTEGRATION));
    });
});
