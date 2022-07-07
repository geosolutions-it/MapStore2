export const TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3WW9IWTFreEtDdjQxX3BsZU9IZjhYNnRCSkd0MURPX2l6YlNuWkpPZ0tFIn0.eyJleHAiOjE2NTcwOTg0ODQsImlhdCI6MTY1NzA5ODQyNCwiYXV0aF90aW1lIjoxNjU3MDk4MzIyLCJqdGkiOiJhMDUwMjU3Mi05Nzc5LTQ0NWUtYmUzZi00NzA2ODA1ODU5MzYiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvcmVhbG1zL21hc3RlciIsImF1ZCI6WyJtYXN0ZXItcmVhbG0iLCJhY2NvdW50Il0sInN1YiI6Ijc1MWE1N2VmLTFiZjAtNDA1MS05YzQ2LWUyYmEyMjNhYzA2YSIsInR5cCI6IkJlYXJlciIsImF6cCI6Im1hcHN0b3JlLXNlcnZlciIsInNlc3Npb25fc3RhdGUiOiJmZjg3OGYyNC0wNTQ5LTQ3YTctOGVjMC01MTc3Mzc0YzYwZmUiLCJhY3IiOiIwIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MS8qIiwiaHR0cDovL2xvY2FsaG9zdDo4MDgyLyoiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImNyZWF0ZS1yZWFsbSIsImRlZmF1bHQtcm9sZXMtbWFzdGVyIiwib2ZmbGluZV9hY2Nlc3MiLCJhZG1pbiIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsibWFzdGVyLXJlYWxtIjp7InJvbGVzIjpbInZpZXctcmVhbG0iLCJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsIm1hbmFnZS1pZGVudGl0eS1wcm92aWRlcnMiLCJpbXBlcnNvbmF0aW9uIiwiY3JlYXRlLWNsaWVudCIsIm1hbmFnZS11c2VycyIsInF1ZXJ5LXJlYWxtcyIsInZpZXctYXV0aG9yaXphdGlvbiIsInF1ZXJ5LWNsaWVudHMiLCJxdWVyeS11c2VycyIsIm1hbmFnZS1ldmVudHMiLCJtYW5hZ2UtcmVhbG0iLCJ2aWV3LWV2ZW50cyIsInZpZXctdXNlcnMiLCJ2aWV3LWNsaWVudHMiLCJtYW5hZ2UtYXV0aG9yaXphdGlvbiIsIm1hbmFnZS1jbGllbnRzIiwicXVlcnktZ3JvdXBzIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwic2lkIjoiZmY4NzhmMjQtMDU0OS00N2E3LThlYzAtNTE3NzM3NGM2MGZlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhZG1pbiJ9.EZcVvimjJQxS7Xsm5PNMZIvdMlfXPumj83HvVUbhorno4I4sGPoo3kVXA-7fgN3jBa4Ma3lWZZXo6iJWqpfUxZl5WeirKoy9Q4hZ50fqDrcyYSqWwSwRoNdpDsVrU5qjCYMt60Ae4m9r72pfsQAw5jfKIelNOdknptfBr1zO-majFMndP1uLwJ7wpj3GtfpA4JOzMjcDwZrlhNtTxQhJfVjA0SV31xVe6s1snM2BdPw60AFrg9_NY9JDLSUSKuNoPlpGn5YLKIUy6XUPuXglsqM7FRZ6eD0tXUxDzo-THWRP3gymRjRaZROD22Qy11q2asVYRquWBynnIhO5YKe2mQ'
export const TOKEN_PARSED = {
    "exp": 1657098484,
    "iat": 1657098424,
    "auth_time": 1657098322,
    "jti": "a0502572-9779-445e-be3f-470680585936",
    "iss": "http://localhost:8080/realms/master",
    "aud": [
        "master-realm",
        "account"
    ],
    "sub": "751a57ef-1bf0-4051-9c46-e2ba223ac06a",
    "typ": "Bearer",
    "azp": "mapstore-server",
    "session_state": "ff878f24-0549-47a7-8ec0-5177374c60fe",
    "acr": "0",
    "allowed-origins": [
        "http://localhost:8081/*",
        "http://localhost:8082/*"
    ],
    "realm_access": {
        "roles": [
            "create-realm",
            "default-roles-master",
            "offline_access",
            "admin",
            "uma_authorization"
        ]
    },
    "resource_access": {
        "master-realm": {
            "roles": [
                "view-realm",
                "view-identity-providers",
                "manage-identity-providers",
                "impersonation",
                "create-client",
                "manage-users",
                "query-realms",
                "view-authorization",
                "query-clients",
                "query-users",
                "manage-events",
                "manage-realm",
                "view-events",
                "view-users",
                "view-clients",
                "manage-authorization",
                "manage-clients",
                "query-groups"
            ]
        },
        "account": {
            "roles": [
                "manage-account",
                "manage-account-links",
                "view-profile"
            ]
        }
    },
    "scope": "openid profile email",
    "sid": "ff878f24-0549-47a7-8ec0-5177374c60fe",
    "email_verified": false,
    "preferred_username": "admin"
};
export const REFRESH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4NGYyYWQzZC1lMzU0LTQzMjctYjU3NC1hNjk2N2NmM2UxYWYifQ.eyJleHAiOjE2NTcxMDAyMjQsImlhdCI6MTY1NzA5ODQyNCwianRpIjoiZmNiMTIxYzEtMzNiOS00NzVmLTg2M2YtYjUyZmVjZjJiMjk2IiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvcmVhbG1zL21hc3RlciIsInN1YiI6Ijc1MWE1N2VmLTFiZjAtNDA1MS05YzQ2LWUyYmEyMjNhYzA2YSIsInR5cCI6IlJlZnJlc2giLCJhenAiOiJtYXBzdG9yZS1zZXJ2ZXIiLCJzZXNzaW9uX3N0YXRlIjoiZmY4NzhmMjQtMDU0OS00N2E3LThlYzAtNTE3NzM3NGM2MGZlIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInNpZCI6ImZmODc4ZjI0LTA1NDktNDdhNy04ZWMwLTUxNzczNzRjNjBmZSJ9.u6gKLHHu8fNO6abARzU0Um42wqs3uvi5xOq71eMwaBw';
export const REFRESH_TOKEN_PARSED = {
    "exp": 1657100224,
    "iat": 1657098424,
    "jti": "fcb121c1-33b9-475f-863f-b52fecf2b296",
    "iss": "http://localhost:8080/realms/master",
    "aud": "http://localhost:8080/realms/master",
    "sub": "751a57ef-1bf0-4051-9c46-e2ba223ac06a",
    "typ": "Refresh",
    "azp": "mapstore-server",
    "session_state": "ff878f24-0549-47a7-8ec0-5177374c60fe",
    "scope": "openid profile email",
    "sid": "ff878f24-0549-47a7-8ec0-5177374c60fe"
}
