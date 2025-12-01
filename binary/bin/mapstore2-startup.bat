@echo off
rem -----------------------------------------------------------------------------
rem Startup Script for MapStore2
rem -----------------------------------------------------------------------------

cls
echo Welcome to MapStore2!
echo.
set error=0

set "CURRENT_DIR=%cd%"
set "CATALINA_HOME=%CURRENT_DIR%"

set "EXECUTABLE=%CATALINA_HOME%\bin\catalina.bat"
set CMD_LINE_ARGS=
set CMD_LINE_ARGS=%CMD_LINE_ARGS% %1

:nativeJava
  set "JAVA_HOME=%CURRENT_DIR%\jre\win"
  rem forcing to use jdk otherwise in case JRE_HOME defined in the system is not compatible
  rem see https://github.com/geosolutions-it/MapStore2/issues/7810
  rem so next setup is being disabled for this reason
  set "JRE_HOME=%JAVA_HOME%"

rem if you want to customize java version used, override JAVA_HOME variable here

rem JAVA_HOME defined incorrectly
:checkJava
  if not exist "%JAVA_HOME%\bin\java.exe" goto badJava
goto run

:badJava
  echo The JAVA_HOME environment variable is not defined correctly.
goto JavaFail

rem :JavaFail
rem   echo Java is needed to run MapStore2.
rem   echo.
rem   echo Install it from:
rem   echo    http://www.oracle.com/technetwork/java/javase/downloads/jre7-downloads-1880261.html
rem   echo.
rem   set error=1
rem goto end


:run
  echo Please wait while loading MapStore2...
  echo.
  call "%EXECUTABLE%" start %CMD_LINE_ARGS%
  echo Point your browser to: http://localhost:8080/mapstore
  echo.
  echo Enjoy MapStore2!
goto end


:end
  if %error% == 1 echo Startup of MapStore2 was unsuccessful.
  echo.
  pause
