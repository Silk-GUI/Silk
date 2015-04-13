# Silk

GUI For Developers (and Node OS)

[![David](https://img.shields.io/david/Silk-GUI/Silk.svg?style=flat-square)](https://david-dm.org/Silk-GUI/Silk) [![Travis](https://img.shields.io/travis/Silk-GUI/Silk.svg?style=flat-square)](https://travis-ci.org/Silk-GUI/Silk)
[![Codacy](https://img.shields.io/codacy/e72fea3635914f5a98e1ccb42bf656e3.svg?style=flat-square)](https://www.codacy.com/app/zmodern/Silk)
[![npm](https://img.shields.io/npm/dm/silk-gui.svg?style=flat-square)](https://www.npmjs.com/package/silk-gui) 
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/Silk-GUI/Silk?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

### Plans
- Fast and Lightweight
- Designed for Developers
- Experiment with new ideas
- Client (window manager and apps) don't care if it is on the same or a different computer than the server

[Roadmap](https://github.com/zodern/Silk/wiki/Roadmap)

## To Install
```
npm i -g silk-gui 
silk
```

## Use
```
silk - Starts silk
    -d - outputs more information to terminal.  Useful for debugging
    -r - gives you an url to visit to use silk remotely
    -o - opens Silk GUI in a full screen window
```

[Available Apps](https://github.com/zodern/Silk/wiki/Apps)

## Create an App

Silk helps you create apps.
[Get Started!](https://github.com/zodern/Silk/wiki/Basics-Of-Making-an-App)
 
## How It Works

The core does basically three things:

1. Make the window manager available at localhost:3000
2. Handle the apps. This includes validating and starting apps, installing their dependencies, and making it easier to debug.
3. Provide an api. The server api allows apps to access the core. The client api helps the front end of apps to communicate with their server and the window manager.

The window manager takes care of what is shown on the screen. The window manager that is included with Silk GUI is  [Sleek](https://github.com/Silk-GUI/Sleek).

Everything else is done with apps.  Headless apps are similar to services in Windows and take care of other features of the OS that is not done in the core, such as the app defaults.

## Contribute

All contributions are greatly appreciated.  

To contribute to core:
```
git clone https://github.com/zodern/Silk.git
cd Silk
npm install
bower install
```

The included apps are in their own repository.

- [File Explorer](https://github.com/Silk-GUI/file-explorer)
- [Text Editor](https://github.com/Silk-GUI/text-editor)
- [Terminal](https://github.com/Silk-GUI/terminal)
- [Task Manager](https://github.com/Silk-GUI/task-manager)
- [App Manager](https://github.com/Silk-GUI/appManager)
- [App Defaults](https://github.com/Silk-GUI/app-defaults)
- [Tunnel Client](https://github.com/formula1/Silk-Tunnel-Client)

The window manager is [here](https://github.com/Silk-GUI/Sleek)

The remote server that is used with the Tunnel Client is [here](https://github.com/formula1/Silk-Server)
