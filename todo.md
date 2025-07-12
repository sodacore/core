# To-Do List

## Framework To-Do:

- [I18N]: Tweak the i18n package so that the auto resolving of user locale works better, and can pick up just the language instead of the full locale, i.e. just `en`.
- [I18N]: Add support for loading translations from a remote source, i.e. database, or using a more efficient lookup method, so we aren't loading the entire translation file into memory. Offer some kind of API that allows a user to write their own lookup method.
- [I18N]: Add support for more efficient translating, i.e. can we collect the translations, and then send them to be translated in one go? (probs).
- [DISCORD]: Add support for a more decorative way of creating Discord slash commands, like @Field, @Autocomplete, etc to make it less verbose for each command.
- [CORE]: Question the design of Threads, and look into better alternative use cases for them, as currently, they are just Workers with extra steps.
- [CORE]: Ensure support for Workers as controllers, so you can add a Worker decorator to all controllers, ensuring we don't pass full objects, or we use the correct transfer methods to pass the data along (latter is preferred).

## Documentation To-Do:

- We need to document the new worker system, how queueing works and how the provider can access the underlying workers.
- Document the new global middleware and local middleware system, how to use it and how to create your own.
- Also document the built in middlewares, such as CORS, and how to use them.
- Need to document the OAuth2 flow and how to use it.
- Document the SSE API for the HTTP package.
- Document the `ws` package and how to use it.
- Document the exposed CLI commands.
- Document the new HTTP transformers.
- Document the new i18n package.
- Document the ability to use workers as controller handlers (i.e. web requests - but note the issues that can occur).
- Update ALL locations for /docs/ in the URL and remove that.
- Re-check the readme's for every project, and ensure they are correct and valid.
- Ensure everything references the Apache-2.0 license, NOT the MIT license.
- Revise all documentation, ensure wording is correct and valid, and clean up any typos.
- Ensure all documentation is up to date with the latest changes.
- Ensure any auto-generated API references are completed.
- Document the issue with WebSocket close events not being sent when using VSCode to forward the port.
- Document the new * matching for http paths.
- Document the new regex matching for http paths, ensure we note that using `:` will ignore all regex matching and will match _ANYTHING_ for that part of the path.
- For release, ensure ALL references clearly define the correct tags/versions, i.e. use @sodacore NOT @sodacore@alpha for the `bun create` command.

### Potential Features:

- Offer a prebuilt Bun binary with the framework pre-loaded, maybe for use with things like Docker, etc, where the user can just mount a folder, and code directly.
- Ensure there are docker images ready for the framework so that users can easily set it up.
- Offer options/examples with scaling of docker images?
- Add a blacklist support to just blacklist certain IPs, potentially offer an API for common blacklists.
- Implement a GraphQL plugin that can be used, alongside Prisma.

### Future Considerations:

- Sodacore Styling Framework
- Sodacore Component Library
