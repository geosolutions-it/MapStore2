# How to Add a new language

Let's say we want to add the russian language.
In order to add a new language to MapStore 2 you need to follow these steps:

1. Update the LocaleUtils.js file web\client\utils adding the support for the new language
  - add and entry in the supportedLocales object like
  ```
  "ru": {
        code: "ru-RU",
        description: "Pоссийский"
    }
  ```
  - add a param in the ensureIntl function like and the relative require
    ```
    'intl/locale-data/jsonp/ru.js'

    ...

    require('intl/locale-data/jsonp/ru.js');
    ```
1. add the relative flag inside web\client\components\I18N\images\flags  naming it ru-RU.png
1. add the russian translations inside web\client\translations naming it data.ru-RU (remember to change the locale property into ru-RU)
1. create a fragment, related to the cookie module, inside web\client\translations\fragments\cookie naming it cookieDetails-ru-RU
