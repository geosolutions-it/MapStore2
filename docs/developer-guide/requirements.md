# Requirements
In this section you can have a glance of the minimum and recommended versions of the tools needed to build/debug/install MapStore

## War Installation

You can download a java web container like Apache Tomcat from [here](https://tomcat.apache.org/download-70.cgi) and install it.

You will also need a Java [JRE](https://www.java.com/it/download/)(minimum version: 8)

## Debug / Build

These tools needs to be installed:

| Tool | Link | Minimum | Recommended | Deprecated |
|---|---|---|---|---|
| npm | <a href="https://www.npmjs.com/get-npm" target="_blank">link</a> | >= 5 | >= 6 | |
| NodeJS | <a href="https://nodejs.org/en/" target="_blank">link</a> | >= 10 | >= 12 | <10 |
| mvn | <a href="https://maven.apache.org/download.cgi" target="_blank">link</a> | >= 3.1.0 | >= 3.6 | |
| python | <a href="https://www.python.org/downloads/" target="_blank">link</a> | >= 2.7.9 | >= 3.7 | |

Python is only needed for building documentation.

If you are using Node >= 12 you can remove the -max_old_space_size=2048 config for the compile *script*
