/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var keymirror = require('keymirror');

var Dispatcher = require('../dispatchers/Dispatcher');
var I18NActions = require('../actions/I18NActions');

var it = require('./data.it-IT');
var us = require('./data.en-US');

const StaticLangStore = {
    "it-IT": it,
    "en-US": us
};
const AvailableLang = {
    "English": "en-US",
    "Italiano": "it-IT"
};

const _getDefaultLang = locale => {
    if (locale) {
        for (let l in AvailableLang) {
            if (AvailableLang.hasOwnProperty(l)) {
                if (locale === AvailableLang[l]) {
                    return locale;
                }
            }
        }
    }
    return "en-US";
};

var _i18nStore;

const _initStore = () => {
    var l = navigator ? navigator.language || navigator.browserLanguage : "en-US";

    _i18nStore = {
        locales: AvailableLang,
        data: StaticLangStore[_getDefaultLang(l)]
    };
};

var I18NStore = assign({}, EventEmitter.prototype, {
    Event: keymirror({
        LANG_CHANGED: null
    }),
    register(event, handler) {
        this.on(event, handler);
    },
    unregister(event, handler) {
        this.removeListener(event, handler);
    },
    getCurrentLocale() {
        return _i18nStore.data.locale;
    },
    getSupportedLocales() {
        return _i18nStore.locales;
    },
    trigger(event) {
        this.emit(event);
    },
    getMsgById(id) {
        return _i18nStore.data.messages[id];
    }
});

// this private function does:
// - gets internationalization data given a locale value
// - changes the internal state of this store
// - moves on calling the given callback function
const _fetchIntlData = (locale, callback) => {
    _i18nStore.data = StaticLangStore[locale];
    callback();
};

// this function manages actions which come from the dispatcher
const _actionsManager = action => {
    switch (action.type) {
        case I18NActions.CHANGE_LANG: {
            _fetchIntlData(action.locale, () => {
                I18NStore.trigger(I18NStore.Event.LANG_CHANGED);
            });
        } break;
        default: // ignore other kind of actions.
    }
};

_initStore();

Dispatcher.register(_actionsManager);

module.exports = I18NStore;

// these stuff was exported to easly perform unit tests.
const _emulateDispatcher = action => {
    _actionsManager(action);
};
module.exports._emulate_dispatcher = _emulateDispatcher;

const _setMockedData = obj => {
    _i18nStore = obj;
};
module.exports._set_mocked_data = _setMockedData;
module.exports._get_default_language = _getDefaultLang;
