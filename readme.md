# MMM-iFrame

*MMM-iFrame* is a module for [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) that displays an iframe. Use it to embed webpages in your MagicMirror².

<!-- ## Screenshot

![Example of MMM-iFrame](./example_1.png) -->

## Installation

### Install

In your terminal, go to the modules directory and clone the repository:

```bash
cd ~/MagicMirror/modules # navigate to modules directory
git clone https://github.com/cptharris/MMM-iFrame # clone repository
```

### Update

Go to the module directory and pull the latest changes:

```bash
cd ~/MagicMirror/modules/MMM-iFrame # navigate to MMM-iFrame module directory
git pull # pull changes from GitHub
```

## Caveats

Many websites send headers that prevent them being displayed in an iframe. If the site you want to embed refuses to render: there’s nothing this client-side module can do about it. There are workarounds, but that is outside the scope of this module.

Pay attention to iframe sandboxing: for exmaple, framed webpages will be unable to run javascript unless you add `allow-scripts`. Reducing the sandboxing reduces security guardrails, so make sure you trust sites you are reducing sandboxing on.

## Configuration

To use this module, you have to add a configuration object to the modules array in the `config/config.js` file.

### Example configuration

Minimal configuration to use the module:

```js
    {
      module: 'MMM-iFrame',
      position: 'lower_third'
    }
```

Configuration with all options:

```js
    {
      module: "MMM-iFrame",
      position: "top_center",
      config: {
        url: "https://example.com",   // use a URL that allows being framed
        width: "800px",
        height: "600px",
        refreshInterval: 0,
        cacheBuster: true,
        sandbox: "allow-scripts allow-same-origin",
        allow: "geolocation; microphone; camera",
        unloadOnHide: false
      }
    }
```

### Configuration options

| Option            | Possible values | Default               | Description                                                                                                                                                                                         |
| ----------------- | --------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`             | `string`        | `https://example.com` | The url to embed on the page                                                                                                                                                                        |
| `width`           | `int`           | `100%`                | The width of the iframe                                                                                                                                                                             |
| `height`          | `int`           | `100%`                | The height of the iframe                                                                                                                                                                            |
| `refreshInterval` | `int`           | `0`                   | Time in ms to refresh, 0 or less means never                                                                                                                                                        |
| `cacheBuster`     | `bool`          | `true`                | append timestamp query when reloading to get around caching                                                                                                                                         |
| `sandbox`         | `string`        | empty                 | sandboxing options, [read here](https://www.w3schools.com/TAGS/att_iframe_sandbox.asp)                                                                                                              |
| `allow`           | `string`        | empty                 | feature policy for iframe                                                                                                                                                                           |
| `showLoading`     | `bool`          | `true`                | displays a spinner when loading                                                                                                                                                                     |
| `backgroundColor` | `Color`         | `transparent`         | background color of the iframe                                                                                                                                                                      |
| `wrapperClass`    | `string`        | empty                 | extra class to add on the wrapper                                                                                                                                                                   |
| `unloadOnHide`    | `bool`          | `false`               | If `true`, the module will set the iframe `src` to `about:blank` when hidden (e.g., by MMM-Carousel or when `suspend()` is called) and restore it on `resume()`. Saves CPU/network for heavy pages. |


## Sending notifications to the module

| Notification         | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| `MMM-iFrame-SET-URL` | Payload must contain the url that needs to be shown on this module |
|                      | Also send the instanceID of the module to update                   |

<!-- ## Developer commands

- `npm install` - Install devDependencies like ESLint.
- `node --run lint` - Run linting and formatter checks.
- `node --run lint:fix` - Fix linting and formatter issues. -->

<!-- ## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details. -->

<!-- ## Changelog

All notable changes to this project will be documented in the [CHANGELOG.md](CHANGELOG.md) file. -->