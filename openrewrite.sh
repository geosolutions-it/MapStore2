#!/bin/bash

git reset --hard master

mvn -U org.openrewrite.maven:rewrite-maven-plugin:run \
-Drewrite.recipeArtifactCoordinates=\
org.openrewrite.recipe:rewrite-migrate-java:RELEASE,\
org.openrewrite.recipe:rewrite-spring:RELEASE \
-Drewrite.activeRecipes=\
org.openrewrite.java.migrate.jakarta.UpdateJakartaPlatform11,\
org.openrewrite.java.migrate.jakarta.JakartaEE11,\
org.openrewrite.java.spring.framework.UpgradeSpringFramework_7_0,\
org.openrewrite.java.spring.security7.UpgradeSpringSecurity_7_0 \
-Drewrite.exportDatatables=true