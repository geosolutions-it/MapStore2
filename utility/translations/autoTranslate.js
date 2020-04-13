/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * This scripts allow to translate missing translations from en-Us to other mandatory files
 * ```
 * node translate.js [apykey=google project apikey]
 * ```
 */

const denodeify = require('denodeify');
const fs = require('fs');
const writeFile = denodeify(fs.writeFile);
const {get, set} = require('lodash');
const {Translate} = require('@google-cloud/translate').v2;


const baseFile = 'data.en-US.json';

const TRANSLATIONS_FOLDER = 'web/client/translations/';

const LANGUAGES = [{code: "it", file: "data.it-IT.json", missing: []}, { code: "es", file: "data.es-ES.json", missing: []}, { code: "de", file: "data.de-DE.json",  missing: []}, { code: "fr", file: "data.fr-FR.json",  missing: []}];
const log = s => process.stdout.write(`${s}\n`);
const apykey = process.argv[2];


// const fs = require('fs');
// const baseobj = JSON.parse(fs.readFileSync(`${TRANSLATIONS_FOLDER}${baseFile}`, 'utf8'));

const isString = o => typeof o === 'string';

const missingLaguanges = (key) => {
    for (const {data, missing} of LANGUAGES) {
        if (get(data, key) === undefined) {
            missing.push(key);
        }
    }
};

const flattenObject = function(ob, path) {
    const basePath = path ? path + "." : "";
    return (Object.keys(ob)).reduce((acc, key) => {
        const val = ob[key];
        if (isString(val)) {
            return [...acc, basePath + key];
        }
        return [...acc, ...flattenObject(val, basePath + key)];
    }, []);
};
let translate;

async function translateLanguage({code, missing, data}, baseLanguage) {
    if (missing.length > 0) {
        log(code);
        const text = missing.map( key => {
            return get(baseLanguage, key);
        });
        let [translations] = await translate.translate(text, code);
        translations = Array.isArray(translations) ? translations : [translations];
        translations.forEach((translation, i) => {
            log(`key: ${missing[i]} value: ${text[i]} => ${translation}`);
            set(data, missing[i], translation);
        });
        return true;
    }
    return false;
}


async function saveFile(path, data) {
    await writeFile(path, JSON.stringify(data, null, 4));
}

if (!apykey) {
    log('Usage: node ./autoTranslate.js projectId');
    throw new Error("Wrong parameters!");
} else {
    translate = new Translate({key: apykey});
    // Open traslations Files
    log(`Open base language file ${baseFile}`);
    const baseLanguage = require("../../" + TRANSLATIONS_FOLDER + baseFile);

    for (const language of LANGUAGES) {
        log(`Open ${language.code}`);
        language.data = require("../../" + TRANSLATIONS_FOLDER + language.file);
    }
    // Group missing translations by language
    for (const key of flattenObject(baseLanguage)) {
        missingLaguanges(key);
    }
    // Translate single
    for (const lang of LANGUAGES) {
        translateLanguage(lang, baseLanguage).then(updated => {
            if (updated) {
                saveFile("./" + TRANSLATIONS_FOLDER  + lang.file, lang.data).then(() => log(`Aggiornata e Salvata lingua ${lang.code}`));
            }
        });
    }

}


