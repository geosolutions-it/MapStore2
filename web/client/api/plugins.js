/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from '../libs/ajax';
import FileUtils from '../utils/FileUtils';

export const upload = (files, url = "rest/config/uploadPlugin") => {
    return Promise.all(
        files.map(file => FileUtils.readZip(file)
            .then((readFile) => axios.post(url, readFile, {
                headers: {
                    "Content-Type": "application/octet-stream"
                }
            }))
        )
    ).then((responses) => responses.map(r => r.data));
};

export const uninstall = (plugin, url = "rest/config/uninstallPlugin") => {
    return axios.delete(url + "/" + plugin).then(response => response.data);
};
