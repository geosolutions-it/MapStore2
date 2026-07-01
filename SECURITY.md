# Security Policy

MapStore maintainers take security vulnerabilities seriously. 
Please do not report suspected security vulnerabilities through public GitHub issues, public pull requests, public discussions, mailing lists, or other public channels.

## Supported versions

MapStore security fixes are normally prepared for the currently maintained release lines.

| Version                                           | Supported              |
| ------------------------------------------------- | ---------------------- |
| Latest stable release line                        | Supported              |
| Active maintenance release line, where applicable | Supported              |
| Older or archived releases                        | Not normally supported |

Users running older MapStore versions are encouraged to upgrade to a supported release. If your organization requires security fixes for an older version, please contact GeoSolutions or your MapStore support provider to discuss feasibility.

## Reporting a vulnerability

Please report suspected vulnerabilities privately using one of the following channels.

### GitHub private vulnerability reporting

Use the repository security page and submit a private vulnerability report:

https://github.com/geosolutions-it/MapStore2/security/advisories/new

This is the preferred channel when available, because it allows maintainers and the reporter to coordinate privately, prepare a fix, request or associate a CVE where appropriate, and publish a GitHub Security Advisory after release.

### Email

If GitHub private vulnerability reporting is unavailable, or if email is more appropriate, contact:

[infosec@geosolutionsgroup.com](mailto:infosec@geosolutionsgroup.com)

Please include as much of the following information as possible:

* affected MapStore version, release line, commit, or deployment profile;
* affected component, endpoint, plugin, or configuration;
* steps to reproduce the issue;
* proof-of-concept details, preferably against a local or test instance;
* expected and actual behavior;
* potential impact;
* whether the issue has already been disclosed to anyone else;
* whether you would like public credit in the advisory.

Please do not test against third-party systems or production deployments unless you have explicit authorization.

## Coordinated vulnerability disclosure

MapStore follows a coordinated vulnerability disclosure process.

1. The report is received through a private channel.
2. The maintainers acknowledge receipt, normally within 5 business days.
3. The maintainers privately verify the vulnerability and assess severity, impact, affected versions, and exploitability.
4. If the report is valid, the maintainers prepare a fix, regression tests, mitigation guidance where applicable, and backports to supported release lines where feasible.
5. A GitHub Security Advisory may be used to coordinate the fix, request or associate a CVE, credit the reporter, and prepare public advisory text.
6. Fixed releases are published before exploit details are disclosed publicly, unless the vulnerability is already public or actively exploited.
7. The advisory is published with affected versions, fixed versions, severity, mitigation or workaround instructions, and upgrade guidance.

We ask reporters to keep vulnerability details private until a fixed release and advisory are available. If public disclosure is required for external reasons, please coordinate the timing with the maintainers whenever possible. 

## Scope

This policy covers vulnerabilities in MapStore source code, default configurations, official build artifacts, and official documentation where the documentation causes an insecure deployment pattern.

Issues in third-party dependencies may be reported if they materially affect MapStore users, but they may also need to be coordinated with the upstream dependency maintainers.

## Safe harbor

We will not pursue legal action against security researchers who make a good-faith effort to comply with this policy, avoid privacy violations, avoid service disruption, avoid data destruction, and report vulnerabilities privately.
