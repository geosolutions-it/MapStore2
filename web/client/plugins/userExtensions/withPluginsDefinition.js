import { compose, mapPropsStream, withPropsOnChange } from "recompose";
import { find, pick } from 'lodash';

import Rx from 'rxjs';
const loadingState = require('../../components/misc/enhancers/loadingState');

import getPluginsConfig from '../../observables/config/getPluginsConfig';
/**
 * Adds to user extensions the plugins definition and maps the properties
 * needed (title, description and glyph) to correctly set labels and symbology,
 * accordingly with the context manager.
 */
export default (pluginsConfigURL) => compose(
    mapPropsStream(props$ =>
        props$.combineLatest(
            Rx.Observable.defer(() => getPluginsConfig(pluginsConfigURL))
                .map((pluginsConfig) => ({ pluginsConfig, loading: false }))
                .catch(e => Rx.Observable.of({loading: false, pluginsLoadError: e}))
                .startWith({ loading: true }),
            (p1, p2) => ({ ...p1, ...p2 })
        )
    ),
    withPropsOnChange(['pluginsConfig', 'extensions'], ({ extensions = [], pluginsConfig = { plugins: [] } }) => ({
        extensions: extensions.map( (e = {}) => {
            const pluginConfig = pick(find(pluginsConfig.plugins, {name: e.name}), ['title', 'description', 'glyph']) || {};
            return {
                ...e,
                ...pluginConfig
            };
        })
    })),
    loadingState()
);
