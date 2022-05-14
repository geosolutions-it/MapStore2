import {get} from 'lodash';

export const last2dMapTypeSelector = state => get(state, "globeswitcher.last2dMapType") || 'leaflet';
