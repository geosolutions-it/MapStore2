/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
package it.geosolutions.mapstore.utils;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.IntFunction;
import java.util.function.Predicate;
import java.util.stream.Stream;

import javax.servlet.ServletContext;

public class ResourceUtils {

    public static Optional<String> findExisting(String[] candidates) {
        return Stream.of(candidates)
            .filter(new Predicate<String>() {
                @Override
                public boolean test(String path) {
                    return path != null && new File(path).exists();
                }
            })
            .findFirst();
    }

    /**
     * Finds a resource, recursively looking at a list of folders, and at last at
     * the web application context path.
     *
     * @param baseFolders  comma-delimited list of folders, in order of search
     * @param context      web application context (last resource)
     * @param resourceName name of the resource to be found
     */
    public static Optional<File> findResource(String baseFolders, ServletContext context, String resourceName) {
        String[] candidates = Stream.concat(
            Stream.of(baseFolders.split(","))
                // remove empty string, to avoid to add "/" to the allowed paths
                .filter(new Predicate<String>() {
                    @Override
                    public boolean test(String string) {
                        return string != null && !string.isEmpty();
                    }
                })
                .map(new Function<String, String>() {
                    @Override
                    public String apply(String f) {
                        return f + "/" + resourceName;
                    }
                }),
            Stream.of(new String[] { context != null ? context.getRealPath(resourceName) : null })
        ).toArray(new IntFunction<String[]>() {
            @Override
            public String[] apply(int size) {
                return new String[size];
            }
        });
        Optional<String> resourcePath = findExisting(candidates);
        return resourcePath.map(File::new);
    }

    public static String getResourcePath(String baseFolder, ServletContext context, String path) {
        return getResourcePath(baseFolder, context, path, false);
    }

    /**
     * Builds a path relative to a trusted base folder or the webapp root.
     * Includes canonicalization and containment checks to prevent path traversal (CWE-23 / Zip-Slip).
     *
     * Compatibility notes:
     * - If baseFolder is empty, we FIRST try context.getRealPath(path) (legacy behavior).
     * - For writes (write=true), if that’s null we fall back to context root + path.
     * - For reads (write=false), if the specific path cannot be resolved we return null (legacy).
     *
     * @param baseFolder If empty, the base is the servlet context root (context.getRealPath(""))
     * @param context    ServletContext
     * @param path       relative path (e.g., "dist/extensions/My/index.js")
     * @param write      true for write targets (enforce containment); false for read resolution
     * @return canonical, absolute path as String; or null if unresolved and write==false
     * @throws IllegalArgumentException if the base cannot be determined
     * @throws SecurityException        if traversal outside the base is attempted or absolute path is provided
     */
    public static String getResourcePath(String baseFolder, ServletContext context, String path, boolean write) {
        try {
            // If we have an explicit base folder, resolve safely against it
            if (baseFolder != null && !baseFolder.isEmpty()) {
                File baseDir = resolveBaseDirectory(baseFolder, context);
                return canonicalChild(baseDir, path).getPath();
            }

            // Legacy compatibility: if servlet resolves this specific path, use it.
            if (context != null) {
                String specific = context.getRealPath(path);
                if (specific != null) {
                    return new File(specific).getCanonicalPath();
                }
            }

            // For writes, fallback to servlet root if available
            if (write) {
                String root = (context != null) ? context.getRealPath("") : null;
                if (root == null || root.isEmpty()) {
                    throw new IllegalArgumentException("Cannot determine servlet context root path");
                }
                return canonicalChild(new File(root).getCanonicalFile(), path).getPath();
            }

            // Read path unresolved (legacy returned null in this case)
            return null;
        } catch (IOException e) {
            throw new IllegalArgumentException("Unable to resolve resource path", e);
        }
    }

    /**
     * Resolve and canonicalize the base directory:
     *  - if baseFolder is provided, use it;
     *  - otherwise use the servlet context root.
     */
    private static File resolveBaseDirectory(String baseFolder, ServletContext context) throws IOException {
        final File base;
        if (baseFolder != null && !baseFolder.isEmpty()) {
            base = new File(baseFolder);
        } else {
            String root = context != null ? context.getRealPath("") : null;
            if (root == null || root.isEmpty()) {
                throw new IllegalArgumentException("Cannot determine servlet context root path");
            }
            base = new File(root);
        }
        return base.getCanonicalFile();
    }

    /**
     * Returns the canonical file obtained by joining {@code baseDir} and {@code childRelativePath}
     * and ensures the result remains within {@code baseDir}. Blocks traversal attempts.
     *
     * This also rejects absolute {@code childRelativePath}.
     */
    private static File canonicalChild(File baseDir, String childRelativePath) throws IOException {
        if (childRelativePath == null) {
            throw new IllegalArgumentException("Path must not be null");
        }

        // Reject absolute inputs (e.g., "/etc/passwd" or "C:\\windows\\...").
        File child = new File(childRelativePath);
        if (child.isAbsolute()) {
            throw new SecurityException("Absolute paths are not allowed: " + childRelativePath);
        }

        // Join and canonicalize to collapse ".." and resolve any symlinks on existing segments.
        File joined = new File(baseDir, childRelativePath);
        File canonicalJoined = joined.getCanonicalFile();
        File canonicalBase = baseDir.getCanonicalFile();

        // Ensure final path is inside base (prefix check with separator to avoid "/tmp/baseX" issues).
        String basePath = canonicalBase.getPath();
        String targetPath = canonicalJoined.getPath();

        if (!targetPath.equals(basePath) && !targetPath.startsWith(basePath + File.separator)) {
            throw new SecurityException("Path traversal attempt blocked: " + childRelativePath);
        }

        return canonicalJoined;
    }

    public static void storeJSONConfig(String baseFolder, ServletContext context, Object config, String configName)
        throws FileNotFoundException, IOException {
        // Resolve a SAFE write path
        String outputFile = getResourcePath(baseFolder, context, configName, true);
        File out = new File(outputFile);
        File parent = out.getParentFile();
        if (parent != null && !parent.exists() && !parent.mkdirs()) {
            throw new IOException("Unable to create parent directories for: " + outputFile);
        }
        try (FileOutputStream output = new FileOutputStream(out)) {
            byte[] bytes = String.valueOf(config).getBytes(StandardCharsets.UTF_8);
            output.write(bytes);
        }
    }

    // ---------------------------------------------------------------------
    // POSIX helpers for servlet lookups and JSON path fields
    // ---------------------------------------------------------------------

    /**
     * Convert a path to POSIX style (forward slashes) and collapse duplicate slashes.
     * Does not resolve '.' or '..' and does not touch drive letters; use {@link #posixJoinStrict(String...)}
     * if you need validation against absolute segments and '..'.
     */
    public static String toPosix(String path) {
        if (path == null) return null;
        String p = path.replace('\\', '/');
        // collapse multiple slashes (but keep leading single slash if present)
        while (p.contains("//")) {
            p = p.replace("//", "/");
        }
        return p;
    }

    /**
     * Join segments into a RELATIVE POSIX path suitable for ServletContext#getRealPath lookups
     * and JSON fields. Rejects absolute segments and any '..' traversal.
     *
     * Example:
     *   posixJoinStrict("custom", "My", "index.js") -> "custom/My/index.js"
     */
    public static String posixJoinStrict(String... segments) {
        if (segments == null || segments.length == 0) {
            throw new IllegalArgumentException("At least one segment is required");
        }
        StringBuilder sb = new StringBuilder();
        boolean first = true;
        for (String raw : segments) {
            if (raw == null) {
                throw new IllegalArgumentException("Null segment not allowed");
            }
            String s = toPosix(raw).trim();

            // reject absolute segments or drive-like paths
            if (s.startsWith("/") || s.matches("^[A-Za-z]:.*")) {
                throw new SecurityException("Absolute segment not allowed: " + raw);
            }

            // strip leading/trailing slashes to avoid accidental absolutes
            if (s.startsWith("/")) s = s.substring(1);
            if (s.endsWith("/")) s = s.substring(0, s.length() - 1);

            // reject traversal
            if (s.equals("..") || s.contains("/../") || s.startsWith("../") || s.endsWith("/..")) {
                throw new SecurityException("Traversal not allowed in path segment: " + raw);
            }
            if (s.equals(".") || s.isEmpty()) {
                continue; // ignore no-op segments
            }

            if (!first) sb.append('/');
            sb.append(s);
            first = false;
        }
        if (sb.length() == 0) {
            // if everything collapsed, return "." (relative no-op)
            return ".";
        }
        return sb.toString();
    }
}
