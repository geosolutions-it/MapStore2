# Documentation guidelines

Each new feature/tool in MapStore should be documented in the [User Guide](https://mapstore.readthedocs.io/en/latest/user-guide/home-page/) in order to explain the involved functionalities and illustrate how it works.

All new front-end technologies, development procedures, best practices and guidelines on the involved components in MapStore should be properly documented too: the [Developers Guide](https://mapstore.readthedocs.io/en/latest/developer-guide/) must be kept up-to-date for this.

The Developer and User guide documentation are built on the [Read the Docs](https://docs.readthedocs.io/en/latest/index.html) hosting platform. The MapStore's documentation files are available in the [docs/](https://github.com/geosolutions-it/MapStore2/tree/master/docs) section of this repository; [Mkdocs](https://docs.readthedocs.io/en/latest/intro/getting-started-with-mkdocs.html) is used in MapStore as documentation generator, you can look at the available [online documentation](https://docs.readthedocs.io/en/latest/intro/getting-started-with-mkdocs.html#getting-started-with-mkdocs) for more information on how to use it (MapStore uses his own customized [MkDocs Material theme](https://squidfunk.github.io/mkdocs-material/) for both User and Developer documentations).

## Building documentation

The documentation is built on RTD ([Read the Docs](https://docs.readthedocs.io/en/latest/index.html)) documentation hosting platform.

But in order to build it locally, there are certain steps that needs to be followed

1. **Python installation**
   1. Install [**Python 3**](https://www.python.org/downloads/)
   2. **Pip** is automatically installed when python is downloaded from python.org, if not, follow this instruction to install [pip](https://pip.pypa.io/en/stable/installation/)

2. **Libraries installation**

    Install **all** the libraries/plugins in `docs/requirements.txt` using **_pip_** while matching the exact version present.

    `pip install -r docs/requirements.txt`

    _Example_

    For `mkdocs-material==3.2.0`, the installation using pip is as follows `pip install mkdocs-material==3.2.0`

3. Build the docs using the command `mkdocs build`. This will build the documentation and puts the built files into `site` folder and the pdf generated into `site\pdf\mapstore_documentation.pdf`
4. Alternatively, the command `mkdocs serve` starts the built-in dev-server, of MkDocs, that lets us preview the documentation as we work on it
5. The documentation can be launched using `index.html` in `site` folder

!!! Note
    When creating a link to internal document (.md) files, make sure to use full link instead of a relative path to the file. As using relative path will not work in exported PDF document.
    _Example_:
    Instead of creating a link `[FAQ]('../dev-faq/')`, use `[FAQ]('../dev-faq/#faq')` or `[FAQ]('../dev-faq.md#faq')` or `[FAQ]('dev-faq.md#faq')`
