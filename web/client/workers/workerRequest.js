/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import uuid from 'uuid';
import url from 'url';

function WorkerRequest(worker, params) {
    const id = uuid();
    const { protocol, host } = url.parse(window.location.href);
    const baseUrl = `${protocol}//${host}/`;
    return new Promise((resolve, reject) => {
        worker.postMessage(
            JSON.parse(
                JSON.stringify({
                    id,
                    params,
                    location: window.location,
                    localConfig: {
                        proxyUrl: {
                            url: `${baseUrl}proxy/?url=`
                        }
                    }
                })
            )
        );
        worker.addEventListener('message', ({ data }) => {
            if (data.id === id) {
                if (data.error) {
                    reject(data.error);
                } else {
                    resolve(data.payload);
                }
            }
        });
    });
}

const workerRequest = (...args) => new WorkerRequest(...args);

export default workerRequest;
