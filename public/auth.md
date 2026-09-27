# auth.md

## Audience

This document describes authentication and agent registration for AI agents and other automated clients interacting with simulateur.site.

## Current access model

The public resources currently exposed by simulateur.site do not require authentication or agent registration.

Supported method:
- Unauthenticated HTTPS requests to public resources, including `GET /api/devises`.

Credential use:
- No API key, OAuth token, bearer token, or other credential is currently required for the public API.
- Agents must not send credentials to the public API unless a future version of this document explicitly requires them.

## Agent registration

Registration/provisioning endpoint: None.

No agent account registration or credential provisioning is required for the currently public resources.

No OAuth Authorization Server or OAuth Protected Resource Metadata is advertised at this time. OAuth credentials should not be inferred from this document.

## Public API discovery

The API catalog is available at `/.well-known/api-catalog`.

The currency API documentation is available at `/api/devises/docs/`, with its OpenAPI description at `/api/devises/openapi.json`.

If authenticated agent access is introduced in the future, this document will be updated with the registration/provisioning endpoint, supported registration methods, credential requirements, and the corresponding OAuth metadata when applicable.
