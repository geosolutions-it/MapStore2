/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { pickBy } from 'lodash';

import CONFIGPROVIDER from './ConfigProvider';
import CoordinatesUtils from './ConfigUtils';

export default {
    getLayerConfig: function(layer, options) {
        var providers = CONFIGPROVIDER;
        let providerConfig;
        let variantName;
        let providerName;
        let parts;
        if (layer === 'custom') {
            providerConfig = options;
        } else {
            parts = layer.split('.');
            providerName = parts[0];
            variantName = parts[1];
            providerConfig = providers[providerName];
            if (!providerConfig) {
                throw new Error('No such provider (' + providerName + ')');
            }
        }

        let provider = {
            url: providerConfig.url,
            options: providerConfig.options || {}
        };
            // overwrite values in provider from variant.
        if (variantName && 'variants' in providerConfig) {
            if (!(variantName in providerConfig.variants)) {
                throw new Error('No such variant of ' + (providerName || providerConfig.url) + ' (' + variantName + ')');
            }
            let variant = providerConfig.variants[variantName];
            let variantOptions;
            if (typeof variant === 'string') {
                variantOptions = {
                    variant: variant
                };
            } else {
                variantOptions = variant.options;
            }
            provider = {
                url: variant.url || provider.url,
                options: {...provider.options || {}, ...variantOptions}
            };
        } else if (typeof provider.url === 'function') {
            provider.url = provider.url(parts.splice(1, parts.length - 1).join('.'));
        }

        let forceHTTP = window.location.protocol === 'file:' || provider.options.forceHTTP;
        if (provider.url.indexOf('//') === 0 && forceHTTP) {
            provider.url = 'http:' + provider.url;
        }
        // If retina option is set
        if (provider.options.retina) {
        // Check retina screen
            if (options.detectRetina && CoordinatesUtils.getBrowserProperties().retina) {
            // The retina option will be active now
            // But we need to prevent Leaflet retina mode
                options.detectRetina = false;
            } else {
            // No retina, remove option
                provider.options.retina = '';
            }
        }

        // replace attribution placeholders with their values from toplevel provider attribution,
        // recursively
        let attributionReplacer = function(attr) {
            if (attr.indexOf('{attribution.') === -1) {
                return attr;
            }
            return attr.replace(/\{attribution.(\w*)\}/,
                function(match, attributionName) {
                    return attributionReplacer(providers[attributionName].options.attribution);
                }
            );
        };
        if (provider.options.attribution) {
            provider.options.attribution = attributionReplacer(provider.options.attribution);
        }

        // Compute final options combining provider options with any user overrides
        let layerOpts = { ...provider.options, ...pickBy(options, v => v !== undefined)};
        return [provider.url, layerOpts];
    }
};

