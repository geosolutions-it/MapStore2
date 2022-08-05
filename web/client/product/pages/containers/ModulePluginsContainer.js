/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PluginsContainer from "../../../components/plugins/PluginsContainer";
import withModulePlugins from "../../../components/plugins/enhancers/withModulePlugins";

/**
 * Wraps PluginsContainer with handler to process Module plugins. Performs loading and caching of Module plugins and pass them down
 * to the PluginsContainer component.
 */
export default withModulePlugins()(PluginsContainer);
