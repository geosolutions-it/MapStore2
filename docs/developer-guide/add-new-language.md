# How to Add a new language
Let's say we want to add the russian language.
In order to add a new language to MapStore 2 you need to follow these steps:

1. Update the localConfig.json file in web\client adding the support for the new language
 - add and entry in the supportedLocales object like
    ```
    "ru": {
        code: "ru-RU",
        description: "Pоссийский"
    }
    ```
1. Update the LocaleUtils.js file in web\client\utils
  - add a param in the ensureIntl() function like and the relative require
    ```
    'intl/locale-data/jsonp/ru.js'

    ...

    require('intl/locale-data/jsonp/ru.js');
    ```
  - update the addLocaleData() call with the new locale obj i.e.
    ```
    const ru = require('react-intl/locale-data/ru');
    addLocaleData([...en, ...it, ...fr, ...de, ...es, ...ru]);
    ```
1. add the relative flag inside web\client\components\I18N\images\flags naming it ru-RU.png
1. add the russian translations inside web\client\translations naming it data.ru-RU (remember to change the locale property into ru-RU)
1. create a fragment, related to the cookie module, inside web\client\translations\fragments\cookie naming it cookieDetails-ru-RU.html


# How to Configure languages in MapStore2

See the previous section on how to add a new language.

For each language you need to:
- set the locale in the localConfig.json file at the line initialState.defaultState.locales starts, see [local-config](local-config) for more info.
- require the intl data in the LocalesUtils.js
- add in the web\client\components\I18N\images\flags folder the flag
- add in the web\client\translations folder the translation file
- add in the web\client\translations\fragments\cookie folder the cookie file.
