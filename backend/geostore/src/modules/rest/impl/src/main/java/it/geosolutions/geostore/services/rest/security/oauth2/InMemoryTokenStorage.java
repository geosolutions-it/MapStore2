package it.geosolutions.geostore.services.rest.security.oauth2;

import it.geosolutions.geostore.services.rest.model.SessionToken;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class InMemoryTokenStorage implements TokenStorage<String> {

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final Map<String, SessionToken> sessions = new ConcurrentHashMap<>();
    private final int cleanUpSeconds = 120;
    private final Runnable evictionTask =
            new Runnable() {
                @Override
                public void run() {
                    for (String sessionId : sessions.keySet()) {
                        removeTokenByIdentifier(sessionId);
                    }
                }
            };

    public InMemoryTokenStorage() {
        super();
        // schedule eviction thread
        scheduler.scheduleAtFixedRate(
                evictionTask, cleanUpSeconds, cleanUpSeconds, TimeUnit.SECONDS);
    }

    @Override
    public SessionToken getTokenByIdentifier(String identifier) {
        return sessions.get(identifier);
    }

    @Override
    public void removeTokenByIdentifier(String identifier) {
        sessions.remove(identifier);
    }

    @Override
    public void saveToken(String identifier, SessionToken token) {
        sessions.put(identifier, token);
    }

    @Override
    public String buildTokenKey() {
        return UUID.randomUUID().toString();
    }
}
