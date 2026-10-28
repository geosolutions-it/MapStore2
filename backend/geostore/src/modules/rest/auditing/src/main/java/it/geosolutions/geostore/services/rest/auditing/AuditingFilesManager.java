/* ====================================================================
 *
 * Copyright (C) 2007 - 2015 GeoSolutions S.A.S.
 * http://www.geo-solutions.it
 *
 * GPLv3 + Classpath exception
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.
 *
 * ====================================================================
 *
 * This software consists of voluntary contributions made by developers
 * of GeoSolutions.  For more information on GeoSolutions, please see
 * <http://www.geo-solutions.it/>.
 *
 */
package it.geosolutions.geostore.services.rest.auditing;

import org.apache.commons.io.FileUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

final class AuditingFilesManager {

    private static final Logger logger = LogManager.getLogger(AuditingFilesManager.class);

    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");

    private final File outputDirectory;
    private final String fileExtension;

    private File outputFile;
    private String currentDayTag;
    private Pattern filePattern;

    AuditingFilesManager(String outputDirectoryPath, String fileExtension) {
        this.outputDirectory = new File(outputDirectoryPath);
        this.fileExtension = fileExtension;
        init();
    }

    File rollOutputFile() {
        updateCurrentDay();
        if (outputFile.exists()) {
            int rollingValue = getNextRollingValue();
            File rollingFile = new File(outputDirectory, getRollinFileName(rollingValue));
            moveOutputFile(rollingFile);
        }
        createOutputFile();
        return outputFile;
    }

    File getOutputFile() {
        return outputFile;
    }

    String getCurrentDayTag() {
        return currentDayTag;
    }

    void makeOutputFileExists() {
        if (!outputFile.exists()) {
            createOutputFile();
        }
    }

    private void init() {
        updateCurrentDay();
        outputFile = new File(outputDirectory, String.format("audit-geostore.%s", fileExtension));
        if (outputDirectory.exists()) {
            LogUtils.info(logger, "Output directory '%s' exists.", outputDirectory.getPath());
            handleExistingOutputDirectory();
        } else {
            LogUtils.info(logger, "Creating output directory '%s'.", outputDirectory.getPath());
            try {
                FileUtils.forceMkdir(outputDirectory);
            } catch (Exception exception) {
                throw new AuditingException(
                        exception, "Error creating output directory '%s'.", outputDirectory);
            }
        }
    }

    private void handleExistingOutputDirectory() {
        if (outputFile.exists()) {
            rollOutputFile();
        } else {
            createOutputFile();
        }
    }

    private void updateCurrentDay() {
        String dayTag = dateFormat.format(new Date());
        if (currentDayTag == null || !currentDayTag.equals(dayTag)) {
            LogUtils.debug(
                    logger, "Current day '%s' will be updates to '%s'.", currentDayTag, dayTag);
            currentDayTag = dayTag;
            filePattern =
                    Pattern.compile(
                            "audit-geostore-" + currentDayTag + "-(\\d+)\\." + fileExtension + "$");
        }
    }

    private String getRollinFileName(int nextRollingValue) {
        return String.format(
                "audit-geostore-%s-%d.%s", currentDayTag, nextRollingValue, fileExtension);
    }

    private void moveOutputFile(File rollingFile) {
        LogUtils.info(
                logger,
                "Rolling output file '%s' to '%s'.",
                outputFile.getPath(),
                rollingFile.getPath());
        try {
            FileUtils.moveFile(outputFile, rollingFile);
        } catch (Exception exception) {
            throw new AuditingException(
                    exception,
                    "Error moving output file '%s' to rolling file '%s'.",
                    outputFile.getPath(),
                    rollingFile.getPath());
        }
    }

    private void createOutputFile() {
        try {
            LogUtils.info(logger, "Creating output file '%s'.", outputFile.getPath());
            FileUtils.touch(outputFile);
        } catch (Exception exception) {
            throw new AuditingException(
                    exception, "Error creating output file '%s'.", outputFile.getPath());
        }
    }

    private int getNextRollingValue() {
        List<Integer> rollingValues = getRollingValues();
        int nextRollingValue = 1;
        if (!rollingValues.isEmpty()) {
            Collections.sort(rollingValues);
            nextRollingValue = rollingValues.get(rollingValues.size() - 1) + 1;
        }
        LogUtils.debug(
                logger,
                "Next rolling value for day '%s' will be '%d'.",
                currentDayTag,
                nextRollingValue);
        return nextRollingValue;
    }

    private List<Integer> getRollingValues() {
        List<Integer> rollingValues = new ArrayList<Integer>();
        String[] files = listOutputDirectoryFiles();
        for (String file : files) {
            Matcher matcher = filePattern.matcher(file);
            if (matcher.matches()) {
                rollingValues.add(Integer.parseInt(matcher.group(1)));
            }
        }
        return rollingValues;
    }

    private String[] listOutputDirectoryFiles() {
        String[] files = outputDirectory.list();
        if (files == null) {
            throw new AuditingException(
                    "Error listing files of output directory '%s'.", outputDirectory);
        }
        LogUtils.debug(
                logger, "Output directory current files: %s.", LogUtils.arrayToString(files));
        return files;
    }
}
