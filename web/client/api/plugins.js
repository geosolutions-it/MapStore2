/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from '../libs/ajax';
import {readZip} from '../utils/FileUtils';

// Uploads one file at a time: each upload rewrites the same configuration files on the server.
export const upload = (files, url = "rest/config/uploadPlugin") => {
    return files.reduce((previous, file) => previous.then(results => readZip(file)
        .then((readFile) => axios.post(url, readFile, {
            headers: {
                "Content-Type": "application/octet-stream"
            }
        }))
        .then(response => [...results, response.data])
    ), Promise.resolve([]));
};

export const uninstall = (plugin, url = "rest/config/uninstallPlugin") => {
    return axios.delete(url + "/" + plugin).then(response => response.data);
};
