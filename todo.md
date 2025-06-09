# To-Do List

## Road to 1.0

### Feature: Thread Rework.

At the moment threads don't make enough sense, they are being treated as workers... but they are not. What exactly is a thread at this point? A worker can achieve all the same goals and be better. Either remove or find a new use case for threads that makes sense.

### Feature: Response middleware.

Add support for the HTTP response middleware to be able to access and tweak the middleware, this can then support CORS, compression and other features.
We should then create some basic middleware features that can be supported out of the box, such as CORS.

### Tweaks

- Add support for CORS functionality within the system.
- Tweak the i18n package so that the auto resolving of user locale works better, and can pick up just the language instead of the full locale.

### Docs: Update.

- We need to document the new worker system, how queueing works and how the provider can access the underlying workers.
- Need to document the OAuth2 flow and how to use it.
- Document the SSE API for the HTTP package.
- Document the `ws` package and how to use it.
- Document the exposed CLI commands.
- Document the new HTTP transformers.
- Document the new i18n package.
