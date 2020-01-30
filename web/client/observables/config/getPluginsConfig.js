import axios from '../../libs/ajax';
import ConfigUtils from '../../utils/ConfigUtils';
/**
 * Returns a Promise that profides the configuration for plugins
 * @param {string} pluginsConfigURL the URL of the configuration.
 */
export default (pluginsConfigURL) => axios.get(pluginsConfigURL || ConfigUtils.getConfigProp('contextPluginsConfiguration') || 'pluginsConfig.json').then(result => result.data);
