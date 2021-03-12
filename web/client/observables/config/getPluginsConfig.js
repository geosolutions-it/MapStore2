import axios from '../../libs/ajax';
import ConfigUtils from '../../utils/ConfigUtils';
import castArray from "lodash/castArray";
import {mergeConfigsPatch} from "@mapstore/patcher";

/**
 * Returns a Promise that profides the configuration for plugins
 * @param {string} pluginsConfigURL the URL of the configuration.
 */
export default function(pluginsConfigURL) {
    const configUrl = pluginsConfigURL || ConfigUtils.getConfigProp('contextPluginsConfiguration') || 'configs/pluginsConfig.json';
    const configFiles = castArray(configUrl);
    return axios.all(configFiles.map(config =>
        axios.get(config)
            .then(response => response.data)
            .catch(() => null)
    )).then(configs => {
        const [main, ...patches] = configs;
        if (!main) throw new Error("plugins configuration file is broken");
        return mergeConfigsPatch(main, patches.filter(c => c && typeof c === "object"));
    });
}
