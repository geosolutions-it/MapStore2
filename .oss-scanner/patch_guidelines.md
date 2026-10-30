# How we would like patches made

- As narrow as possible: fix the faulty code path, no refactoring around it.
- With a unit test, a Karma test (`*-test.js` next to the module) or a JUnit test, that fails without the fix and passes with it.
- When the fix touches configuration or files that have a copy in the `project/` templates (for example
  `web.xml`, `applicationContext.xml`, `proxy.properties`, the embedded HTML pages), update the templates in the same
  patch: new downstream projects are created from them.
- Follow the style of the surrounding code; comments only where the code is not obvious.
- Against the `master` branch.
