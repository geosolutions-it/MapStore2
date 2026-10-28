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

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.FileWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

final class AuditingOutput {

    private static final Logger LOGGER = LogManager.getLogger(AuditingOutput.class);

    private final BlockingQueue<Map<String, String>> messagesQueue =
            new ArrayBlockingQueue<Map<String, String>>(10000);

    private AuditingConfiguration configuration;

    private AuditingTemplates templates;
    private AuditingFilesManager auditingFilesManager;

    private boolean auditEnable = false;

    private FileWriter writer;

    private int requestsProcessed;

    AuditingOutput() {
        if (AuditingConfiguration.configurationExists()) {
            configuration = new AuditingConfiguration();
            if (configuration.isAuditEnable()) {
                LOGGER.info("Auditing enable.");
                auditEnable = true;
                templates = new AuditingTemplates(configuration.getTemplatesDirectory());
                auditingFilesManager =
                        new AuditingFilesManager(
                                configuration.getOutputDirectory(),
                                configuration.getOutputFilesExtension());
                openWriter();
                final Consumer consumer = new Consumer();
                final Thread consumerThread = new Thread(consumer);
                consumerThread.start();
                Runtime.getRuntime()
                        .addShutdownHook(
                                new Thread() {
                                    public void run() {
                                        consumer.running = false;
                                        try {
                                            consumerThread.interrupt();
                                            consumerThread.join(500);
                                        } catch (InterruptedException exception) {
                                            LOGGER.error(
                                                    "Interrupted when waiting for consumer thread.",
                                                    exception);
                                        }
                                        closeWriter();
                                    }
                                });
            } else {
                LOGGER.info("Auditing not enable.");
            }
        } else {
            LOGGER.info("Auditing configuration not found, audit disabled.");
        }
    }

    void offerMessage(Map<String, String> message) {
        if (auditEnable) {
            try {
                messagesQueue.offer(message);
            } catch (Exception exception) {
                LOGGER.error("Error offering message.", exception);
            }
        }
    }

    boolean isAuditEnable() {
        return auditEnable;
    }

    AuditingFilesManager getAuditingFilesManager() {
        return auditingFilesManager;
    }

    private void openWriter() {
        try {
            writer = new FileWriter(auditingFilesManager.getOutputFile());
        } catch (Exception exception) {
            throw new AuditingException(
                    exception,
                    "Error open writer for file output '%s'.",
                    auditingFilesManager.getOutputFile().getPath());
        }
        try {

            templates.getHeaderTemplate().process(Collections.EMPTY_MAP, writer);
        } catch (Exception exception) {
            throw new AuditingException(
                    exception,
                    "Error writing header to file '%s'.",
                    auditingFilesManager.getOutputFile().getPath());
        }
    }

    private void closeWriter() {
        try {
            templates.getFooterTemplate().process(Collections.EMPTY_MAP, writer);

        } catch (Exception exception) {
            throw new AuditingException(
                    "Error writing footer to file output '%s'.",
                    auditingFilesManager.getOutputFile().getPath());
        }
        try {
            writer.close();
        } catch (Exception exception) {
            throw new AuditingException(
                    "Error closing writer for file output '%s'.",
                    auditingFilesManager.getOutputFile().getPath());
        }
    }

    private void processMessage(Map<String, String> message) {
        auditingFilesManager.makeOutputFileExists();
        try {
            message.put("id", String.valueOf(requestsProcessed));
            templates.getBodyTemplate().process(message, writer);
        } catch (Exception exception) {
            LOGGER.error("Error writing to body template.", exception);
        }
        requestsProcessed++;
        if (requestsProcessed >= configuration.getMaxRequestPerFile()) {
            closeWriter();
            auditingFilesManager.rollOutputFile();
            openWriter();
            requestsProcessed = 0;
        }
    }

    private class Consumer implements Runnable {

        volatile boolean running = true;

        @Override
        public void run() {
            while (running) {
                List<Map<String, String>> messages = new ArrayList<Map<String, String>>();
                try {
                    if (messagesQueue.isEmpty()) {
                        messages.add(messagesQueue.take());
                    } else {
                        messagesQueue.drainTo(messages);
                    }

                } catch (InterruptedException exception) {
                    Thread.currentThread().interrupt();
                }
                for (Map<String, String> message : messages) {
                    try {
                        processMessage(message);
                    } catch (Exception exception) {
                        LOGGER.error("Error processing message.", exception);
                    }
                }
            }
        }
    }
}
