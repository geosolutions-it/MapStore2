# Documentation guidelines

Each new feature/tool in MapStore should be documented in the [User Guide](https://mapstore.readthedocs.io/en/latest/user-guide/home-page/) in order to explain the involved functionalities and illustrate how it works.

All new front-end technologies, development procedures, best practices and guidelines on the involved components in MapStore should be properly documented too: the [Developers Guide](https://mapstore.readthedocs.io/en/latest/developer-guide/) must be kept up-to-date for this.

Both for Developer and User guides, the documentation is built on the [Read the Docs](https://docs.readthedocs.io/en/latest/index.html#) documentation hosting platform. The MapStore's documentation files are available in the [docs/](https://github.com/geosolutions-it/MapStore2/tree/master/docs) section of this repository; [Mkdocs](https://docs.readthedocs.io/en/latest/intro/getting-started-with-mkdocs.html) is used in MapStore as documentation generator, you can look at the available [online documentation](https://docs.readthedocs.io/en/latest/intro/getting-started-with-mkdocs.html#getting-started-with-mkdocs) for more information on how to use it (MapStore uses his own customized [MkDocs Material theme](https://squidfunk.github.io/mkdocs-material/) for both User and Developer documentations).

## Building documentation

The documentation is built on RTD ([Read the Docs](https://docs.readthedocs.io/en/latest/index.html#)) documentation hosting platform. 

But in order to build it locally, there are certain steps that needs to be followed

1. **Python installation**
   1. Install [**Python 3**](https://www.python.org/downloads/)
   2. **Pip** is automatically installed when python is downloaded from python.org, if not, follow this instruction to install [pip](https://pip.pypa.io/en/stable/installation/)

2. **Libraries installation**

    Install **all** the libraries/plugins in `docs/requirements.txt` using **_pip_** while matching the exact version present

    *Example*

    For `mkdocs-material==3.2.0`, the installation using pip is as follows `pip install mkdocs-material==3.2.0`

3. Finally, build the docs using the command `mkdocs build`. This will build the documentation and puts the built files into `site` folder and the pdf generated into `site\pdf\mapstore_documentation.pdf`
4. The documentation can be launched using `index.html` in `site` folder
