# Introduction
MapStore offers the support for internationalization (I18N). To provide this functionality MapStore uses [react-intl](https://github.com/yahoo/react-intl).
In this section you can find which configuration and JS files are involved in the I18N system.

## How MapStore chooses the current language
MapStore first checks the browser's language. If it is not supported, MapStore will be visible in english, if present, or the first language available.
Anyway the locale can be forced using a flag locale=codeLang where codeLang can be one en,it,de...
e.g.

```url
localhost:8081/?locale=en#/
```

A user can change the selected language from UI. MapStore will load the proper files to update the page localized in the selected language.

## Configuration files
To provide support to a specific language MapStore need to have the necessary setup in the LocaleUtils.js file (see below [section for details about to configure this file]).
In addition you need the proper translations files.

Let's imagine that the variable code is 'en', CODE is 'EN' standing for english. For each language you need to have **messages file** containing the localized strings, a **flag image** to identify the language and some **html fragments** (optional) for some specific plugins.

- Messages: located in `web\client\translations` folder. For each language there is a json file named data.code-CODE.json. e.g. `data.en-EN.json`.
- Flags: located in `web\client\components\I18N\images\flags` folder. For each language flag image named code-CODE.png of 16px x 11px is required.
- Fragments: actually only for cookies policy ....  (required only if the Cookie plugin is present) located in `web\client\translations\fragments\cookie` folder and named cookieDetails-code-CODE.html. We recommend to add it for any language you want to support at least by copying the english version.

# How to configure supported languages in MapStore
You can configure MapStore to provide to the user only a restricted list of selectable languages by setting "initialState.defaultState.locales" variable in `localConfig.json`. e.g :

```javascript
"defaultState":
{
    "locales": {
        "supportedLocales": {
            "en": {
                "code": "en-EN",
                "description": "English"
            },
            "it": {
                "code": "it-IT",
                "description": "Italiano"
            }
        }
    }
}
```

Setting locales in localConfig.json file is doable only for supported locales present in LocaleUtils.js.
The default behavior is to use those already configured in "supportedLocales" object.
You can customize the messages by editing the data.code-CODE.json files.

# How to add a new language

Let's say we want to add the russian language.
In order to add a new language to MapStore you need to follow these steps:

- *Update the `localConfig.json` file in `web\client` folder adding the new language entry*:
  Add the following in the `initialState.defaultState.locales` object

```javascript
"ru": {
    code: "ru-RU",
    description: "Pоссийский"
}
```

- *Update the LocaleUtils.js file in `web\client\utils`*:
  add a param in the ensureIntl() function like and the relative require i.e: `'intl/locale-data/jsonp/ru.js'`

```javascript
require('intl/locale-data/jsonp/ru.js');
```

- *update the addLocaleData() call with the new locale obj* i.e.:

```javascript
const ru = require('react-intl/locale-data/ru');
addLocaleData([...en, ...it, ...fr, ...de, ...es, ...ru]);
```

- *add the flag image for the selected language* inside `web\client\components\I18N\images\flags` naming it `ru-RU.png`
- *add the new translations file* inside `web\client\translations` naming it `data.ru-RU.json` (remember to change the locale property of this file into `ru-RU`)
- *create a fragment related to the cookie module* inside `web\client\translations\fragments\cookie` naming it `cookieDetails-ru-RU.html`
