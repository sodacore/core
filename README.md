<br/>
<div align="center">
<a href="https://github.com/sodacore/core">
<img src="https://sodacore.dev/logo.png" alt="Logo" width="80" height="80">
</a>
<h3 align="center">Sodacore</h3>
<p align="center">
Sodacore is a bun-powered framework for building server-side applications utilising the lighting fast <a href="https://bun.sh" target="_blank">Bun</a> runtime.
<br/>
<br/>
<a href="https://sodacore.dev"><strong>Explore the docs »</strong></a>
<br/>
<br/>
<!-- <a href="https://www.makeread.me/">View Demo .</a> -->
<a href="https://github.com/sodacore/core/issues/new?labels=bug&amp;template=bug_report.md">Report Bug</a>
⚬
<a href="https://github.com/sodacore/core/issues/new?labels=enhancement&amp;&template=feature_request.md">Request Feature</a>
</p>
</div>

[![Contributors](https://img.shields.io/github/contributors/sodacore/core?color=dark-green)](https://github.com/sodacore/core/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/sodacore/core)](https://github.com/sodacore/core/issues)
[![License](https://img.shields.io/npm/l/%40sodacore%2Fcore)](https://github.com/sodacore/core/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/d18m/%40sodacore%2Fcore)](https://www.npmjs.com/package/@sodacore/core)
[![Latest Version](https://img.shields.io/npm/v/%40sodacore%2Fcore?label=latest)](https://github.com/sodacore/core/releases)
[![Made for Bun](https://img.shields.io/badge/made%20for-bun-25A2E2?style=flat-square&logo=bun)](https://bun.sh)

## Table of Contents

- [Table of Contents](#table-of-contents)
- [About The Project](#about-the-project)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [CLI Setup](#cli-setup)
  - [Manual setup](#manual-setup)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

## About The Project

Sodacore is a [Bun](https://bun.sh) powered framework for writing server-side applications in record time. The framework follows a controller pattern, utilising plugins as the core means for extending the framework.

Sodacore comes with a lot of great features:

- 🧊 Autowiring by default
- 🧩 Dependency injection
- 🧪 Plugin system
- 📦 Core maintained plugins, i.e. http, ws, di, etc.
- 📝 Clean and simple logger that can be extended.
- 📚 Built-in documentation
- 🧵 Easy Threading and worker support.
- 🖥️ Create package for quick boilerplating.
- 🎛️ CLI for managing your application scripts.

The framework is constantly being worked on and improved so suggestions and features are highly appreciated.

> As of right now, we use TypeScript's legacy decorators, this is mostly because the current stage 3 decorators are very limited in functionality (i.e. param decorators) so once they drop support for legacy decorators we will switch, but until then this framework will continue to use them.

### Built With

This project was built with the following core technologies:

- [Bun](https://bun.sh/)
- [TypeScript](https://www.typescriptlang.org/)

## Getting Started

There are two ways of getting started with your project, you can either use our CLI or manually setup your project.

### CLI Setup

To get started with the CLI, you can run the following command:

```bash
bun create @sodacore
```

This will install and launch the command line, it simply asks you about your project, and then installs the packages and writes the files, it will also modify the directory to correctly reflect the Sodacore project structure, see below:

[![CLI Setup](https://sodacore.dev/images/sodacore-create.svg)](https://sodacore.dev/images/sodacore-create.svg)

### Manual setup

To setup your project manually, please follow the this [guide](https://sodacore.dev/docs/guide/quickstart.html#manually).

## Roadmap

Our roadmap is published on our documentation site [here](https://sodacore.dev/about/roadmap.html).

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag &quot;enhancement&quot;.
Don&#39;t forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m "Add some AmazingFeature"`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the Apache-2.0 license.

## Contact

If you have any questions or suggestions, feel free to reach out to us:

- Raise an issue on the repository: [GitHub Repository](https://github.com/sodacore/core)
- Connect with us on [Discord](https://discord.gg/CgumPyVr6X)

## Acknowledgments

A special thanks to the following for their contributions, helpful projects, support and inspiration:

- [makeread.me](https://makeread.me/) - README Template Generator.
