/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
package it.geosolutions.mapstore;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;

public class TestUtils {
    public static File copyTo(InputStream resource, File dataDir, String name) throws FileNotFoundException, IOException {
        File output = new File(dataDir.getAbsolutePath() + File.separator + name);
        if(!output.getParentFile().exists()) {
        	output.getParentFile().mkdirs();
        }
        try (FileOutputStream outStream = new FileOutputStream(output)) {
            IOUtils.copy(resource, outStream);
        }
        return output;
    }

    public static File getDataDir() throws IOException {
        File temp = File.createTempFile("datadir", "");
        temp.delete();
        temp.mkdir();
        return temp;
    }

    public static File copyToTemp(Class<ConfigControllerTest> classObj, String path) throws IOException {
        // Open the resource as an InputStream
        InputStream inputStream = classObj.getResourceAsStream(path);

        // Check if the resource is null (not found)
        if (inputStream == null) {
            throw new IllegalArgumentException("Resource not found: " + path);
        }

        // Create a temporary file with the correct extension
        File temp = File.createTempFile("config", "." + FilenameUtils.getExtension(path));

        // Copy the content of the resource into the temporary file
        try (FileOutputStream outStream = new FileOutputStream(temp)) {
            IOUtils.copy(inputStream, outStream);
        }

        return temp;
    }

    public static String getContent(File file) throws IOException {
        return FileUtils.readFileToString(file);
    }
}
