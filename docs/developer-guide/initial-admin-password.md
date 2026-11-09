# Initial Administrator Password

Starting from MapStore 2026.03.00, MapStore does not ship default credentials anymore. The sample users `admin`/`admin` and `user`/`user` (previously loaded from `sample_users.xml`) are no longer created.

Instead, the administrator account is created from the `INITIAL_ADMIN_PASSWORD` environment variable.

## How the `admin` account is handled at start-up

At every start-up GeoStore checks whether an account named `admin` exists:

- **The `admin` account does not exist** (new database, or it was renamed or deleted):
  - if `INITIAL_ADMIN_PASSWORD` is set, the `admin` account is created with that password;
  - if `INITIAL_ADMIN_PASSWORD` is **not** set, **no account is created**. Start-up continues and the log reports that the variable is missing. In this state nobody can log in until an `admin` is created (set the variable and restart, or create a user another way).
- **The `admin` account already exists**: it is left untouched, with one exception — if it still uses a former default password (`admin`) and `INITIAL_ADMIN_PASSWORD` is set, its password is **reset** to the value of the variable (a security warning is logged).

There is **no** random password and **no** generated password file: the only source of the initial password is the `INITIAL_ADMIN_PASSWORD` environment variable.

`INITIAL_ADMIN_PASSWORD` cannot be one of the former default passwords (`admin`, `user`): such a value is refused and the account is not created.

!!! warning
    Change the password of the `admin` account from the MapStore UI after the first login, and remove `INITIAL_ADMIN_PASSWORD` from the environment once the account exists. See [Managing Users](../user-guide/managing-users.md).

## Setting the variable

The variable must be available in the environment of the Java process running MapStore.

- Tomcat on Linux (e.g. in `bin/setenv.sh` or in the service environment):

    ```sh
    export INITIAL_ADMIN_PASSWORD='<your-strong-password>'
    ```

- Docker:

    ```sh
    docker run --name mapstore -p 8080:8080 -e INITIAL_ADMIN_PASSWORD='<your-strong-password>' geosolutionsit/mapstore2
    ```

- Docker Compose:

    ```yaml
    services:
      mapstore:
        environment:
          INITIAL_ADMIN_PASSWORD: "${INITIAL_ADMIN_PASSWORD}"
    ```

- Tomcat on Windows (e.g. in `bin\setenv.bat`):

    ```bat
    set INITIAL_ADMIN_PASSWORD=<your-strong-password>
    ```

- Local development (`npm start` runs the backend too, which inherits the shell environment). The same applies to MapStore projects created with the [project creation script](project-creation-script.md):

    ```sh
    export INITIAL_ADMIN_PASSWORD='<your-dev-password>'
    npm start
    ```

    On Windows, set the variable in the same terminal before running `npm start`. In `cmd`:

    ```bat
    set INITIAL_ADMIN_PASSWORD=<your-dev-password>
    npm start
    ```

    In PowerShell:

    ```powershell
    $env:INITIAL_ADMIN_PASSWORD='<your-dev-password>'
    npm start
    ```

Then log in with the user `admin` and the password you set.

## Security checks logged at start-up

- **Default credentials still present**: if accounts with well-known default credentials (for example `admin`/`admin` or `user`/`user`) are found in the database, a critical security error is logged. This typically happens on databases created with previous versions of MapStore: change those passwords as soon as possible. Those former default passwords are also refused at login.
- **Initial password still in use**: if the `admin` account still uses the password taken from `INITIAL_ADMIN_PASSWORD`, a security warning is logged, asking you to change it.

## Initializing users from a file

If you need a custom set of users at first start, you can still provide an XML file with the list of users, by setting this property in `geostore-datasource-ovr.properties`:

```properties
geostoreInitializer.userListInitFile=file:///path/to/your/users.xml
```

Entries that use a former default password are skipped and logged, so the file cannot re-introduce `admin`/`admin` or `user`/`user`.

!!! warning
    Never use well-known or weak passwords in this file, and do not keep it readable by other users after the initialization.
