# Documentation guidelines

Each new feature/tool in MapStore should be documented in the [User Guide](https://mapstore.readthedocs.io/en/latest/user-guide/home-page/) in order to explain the involved functionalities and illustrate how it works.

All new front-end technologies, development procedures, best practices and guidelines on the involved components in MapStore should be properly documented too: the [Developers Guide](https://mapstore.readthedocs.io/en/latest/developer-guide/) must be kept up-to-date for this.

The Developer and User guide documentation are built on the [Read the Docs](https://docs.readthedocs.io/en/latest/index.html) hosting platform. The MapStore's documentation files are available in the [docs/](https://github.com/geosolutions-it/MapStore2/tree/master/docs) section of this repository; [Mkdocs](https://docs.readthedocs.io/en/latest/intro/getting-started-with-mkdocs.html) is used in MapStore as documentation generator, you can look at the available [online documentation](https://docs.readthedocs.io/en/latest/intro/getting-started-with-mkdocs.html#getting-started-with-mkdocs) for more information on how to use it (MapStore uses his own customized [MkDocs Material theme](https://squidfunk.github.io/mkdocs-material/) for both User and Developer documentations).

## General Guidelines

### Internal links

When creating internal links between pages (`.md` files), make sure to use **full link** to the paragraph instead of using only the relative path to the file.
As using relative path will not work in exported PDF document.

!!! Example
    Instead of creating a link `[FAQ]('../dev-faq/')`, use `[FAQ]('../dev-faq/#faq')` or `[FAQ]('../dev-faq.md#faq')` or `[FAQ]('dev-faq.md#faq')`

## Building documentation

The documentation is built on RTD ([Read the Docs](https://docs.readthedocs.io/en/latest/index.html)) documentation hosting platform.

But in order to build it locally, there are certain steps that needs to be followed:

### 1. Python installation

Install [**Python 3**](https://www.python.org/downloads/) and **pip** following the instructions on the python web site for your operating system.

!!! Note
    **Pip** is automatically installed when python is downloaded from python.org, if not, follow this instruction to [install it](https://pip.pypa.io/en/stable/installation/)

### 2. Libraries installation

Install **all** the libraries/plugins in `docs/requirements.txt` using **_pip_** while matching the exact version present.

`pip install -r docs/requirements.txt`

### 3. Build the documentation

Build the docs using the command `mkdocs build`.

If you want to generate also the **PDF**, you need to add _set the environment variable_ `ENABLE_PDF_EXPORT` to `1` before to run `mkdocs build`.
The build with the PDF option takes around 5 minutes to finish.

```sh
export ENABLE_PDF_EXPORT=1
mkdocs build
```

This will build the documentation and puts the built files into `site` folder and the pdf generated into `site\pdf\mapstore_documentation.pdf`

The documentation can be launched using `index.html` in `site` folder

### 4. Editing the documentation

To live build and test the documentation locally, run the following command:

```sh
mkdocs serve
```

This command will start the built-in dev-server of MkDocs that lets us preview the documentation as we work on it.

The documentation will be available at [http://localhost:8000](http://localhost:8000).
Every time you save some documentation file, the page will be automatically updated.

!!! Note
    make you sure to **not** have set `ENABLE_PDF_EXPORT=1` while testing live, in order to avoid build the pdf every time that takes a long time to be generated.
