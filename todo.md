# To-Do List

## Framework To-Do:

- [CORE]: Remove the idea of threads, prevent them from being exported and ensure they aren't documented, we can come back to these another day.
- [HTTP]: Add a HTTP cache decorator for LRU caching some responses.
- [CREATE]: Implement the `community` option for creating projects based on external templates.
- [CLI]: Add a new option to set the default connection, avoiding the need to always pass `--connection` everywhere.
- [CLI]: Implement a feature that instead of calling the interactive CLI, a user can simply go: `sodacore exec core:usage --connection="Local Instance"` where connection is optional, and if not provided, it will use the default connection (which can be set via another command).
- [CLI]: Ensure the exec command can simply bypass the interactive CLI, and just run the command directly, this is cleaner for CI/CD systems.

## Documentation To-Do:

- Need to document the OAuth2 flow and how to use it.
- Document the SSE API for the HTTP package.
- Document the `ws` package and how to use it.
- Document the exposed CLI commands.
- Document the ability to use workers as controller handlers (i.e. web requests - but note the issues that can occur).
- Re-check the readme's for every project, and ensure they are correct and valid.
- Ensure everything references the Apache-2.0 license, NOT the MIT license.
- Document the issue with WebSocket close events not being sent when using VSCode to forward the port.
- Document the new * matching for http paths.
- Document the new regex matching for http paths, ensure we note that using `:` will ignore all regex matching and will match _ANYTHING_ for that part of the path.
- Document the new i18n package and it's new methods, and how to utilise lookups.
- Document the new discord functionality, including the new declarative command system, and how to use it.
- Create a concepts section that talks about concepts, controllers, workers, tasks, etc and _in-detail_ describes them and how to use them.

## Future Features

- Find a potential use case for being able to spawn threads that have a managed IPC connection to the main application.
- Look into creating a specification for a decentralised communication platform, the aim here is to build in a way that allows servers to communicate with each other, and potentially allow for federation in the future. Potentially an implementation of a signaling server that can be used for finding peers, the idea being is each "instance" of a server can register with a (or many) signalling server(s), and then can find other peers to communicate with, this could be used for decentralised chat systems, etc, the aim here is servers can act as one, but also can be used to talk, signaling servers would not be aware of the content, just the peers and essentially act, almost like a DNS for servers.
