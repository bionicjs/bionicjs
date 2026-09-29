## One config, many services

Integrations are plugin packages composed in `bionicjs.config.ts`. Each one
registers a service once, and bionicjs generates the typed surface around it
— callers, providers, middleware, and any database models the service
needs.

## What you get per integration

- **Typed callers** — generated client functions for every service.
- **Providers** — server-side instances wired into request handlers.
- **Middleware** — auth and lifecycle logic applied deterministically.
- **Database models** — schemas and clients when the integration needs
  its own storage.

## Staying thin

An integration records configuration (provider, model, keys) and
produces the matching generated exports. It does not bundle the
provider's full implementation into your project — the real SDK remains
your dependency, which keeps the scaffold small and your control total.

## Browse the categories

The sections that follow cover the four main areas: **Auth**, **Database**,
**AI**, and **Jobs** — each a plugin package with its own provider and
wiring pages.