/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * This scripts allow to find items not aligned in the translation files.
 * ```
 * node findMissingTranslations.js [base_file=data.en-US]
 * ```
 * Will compare all the file in translations file with the base_file.
 * This script will notify you if:
 *  - An entry is missing (in the current file)
 *  - A file is present in the current file but missing in the base file
 * So you can align them manually.
 * In the future we could expand this to compile missing entries.
 */
const basefile = process.argv[2] || 'data.en-US';
const TRANSLATIONS_FOLDER = process.argv[3] || 'web/client/translations/';
const MANDATORY_FILES = ["data.it-IT", "data.es-ES", "data.de-DE", "data.fr-FR"];
const log = s => process.stdout.write(s);
const isMandatory = file => MANDATORY_FILES.filter( f => f === file).length > 0;
const isPresent = translation => translation !== undefined;
const fs = require('fs');
const baseobj = JSON.parse(fs.readFileSync(`${TRANSLATIONS_FOLDER}${basefile}`, 'utf8'));
const isObj = o => typeof o === 'object';
/**
 * Compares objects and call the callback with proper message
 * @param {object|string} a left term of comparison
 * @param {object|string} b right term of comparison
 * @param {string} path current path of the object
 * @param {function} callback function to call for errors or warnings
 */
const compare = (a, b, path, callback) => {
    if (a && b) {
        if (isObj(a) && isObj(b)) {
            const akeys = Object.keys(a).map( k => {
                if (!isPresent(b[k])) {
                    callback(`${path}.${k}`, `is missing`, "error");
                }
                return k;
            }).filter(k => isPresent(b[k]));
            Object.keys(b).map(k => {
                if (!isPresent(a[k])) {
                    callback(`${path}.${k}`, 'is present in the current file but not in the base file', 'warning');
                }
                return k;
            }).filter(k => isPresent(a[k]));
            // akeys and bkeys should contain the same keys
            akeys.map(k => compare(a[k], b[k], `${path}.${k}`, callback));
        }
    } else if (isPresent(a)) {
        callback(path, `is missing`, "error");
    } else if (isPresent(b)) {
        callback(path, `is present in the current file but not in the base file`, 'warning');
    } else {
        callback(path, "nor object on both sides", 'warning');
    }
};

const files = fs.readdirSync(TRANSLATIONS_FOLDER);
let fail = false;
log("##############################\n");
log("# Check i18n mandatory files #\n");
log("##############################\n");
files.forEach(file => {
    const filePath = `${TRANSLATIONS_FOLDER}${file}`;
    const stat = fs.statSync(filePath);
    let warning = 0;
    let error = 0;
    if (stat.isFile()) {
        log(`${file}\n`);
        const obj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        compare(baseobj.messages, obj.messages, 'messages', (path, mess, type = 'info') => {
            switch (type) {
                case 'warning':
                    warning++;
                    log(`\t${path} ${mess}\n`);
                    break;
                case 'error':
                    error++;
                    log(`-->\t${path} ${mess}\n`);
                    break;
                default:
                    break;
            }
        });
        if (!error && !warning) {
            log("OK!\n");
        }
        fail = fail || (error && isMandatory(file));
        if (fail) {
            log(`--> ${file} FAILED\n`);
        }
        log(`---------------------------\n`);
    }
});
if (fail) {
    throw Error("i18n files failed");
}
log('## mandatory translations checks passed!! ##\n');


