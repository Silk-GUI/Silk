# Silk

GUI For Developers and Node OS.

[![David](https://img.shields.io/david/Silk-GUI/Silk.svg?style=flat-square)](https://david-dm.org/Silk-GUI/Silk) [![Travis](https://img.shields.io/travis/Silk-GUI/Silk.svg?style=flat-square)](https://travis-ci.org/Silk-GUI/Silk)
[![Gitter](https://img.shields.io/gitter/room/Silk-GUI/Silk.svg?style=flat-square)](https://gitter.im/Silk-GUI/Silk?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm](https://img.shields.io/npm/dm/silk-gui.svg?style=flat-square)](https://www.npmjs.com/package/silk-gui) 

### Goals
- Fast and Lightweight
- Designed for Developers
- Modular (most functionality is in apps; swap them, add new ones, removed unused. Eventually they will be installed from NPM)
- Just work (try to fix problems automatically, or, if unable, explain how to fix them)
- Lightweight remote desktop with the app front end running on your computer

[Roadmap](https://github.com/Silk-GUI/Silk/blob/master/roadmap.md)

## Get started
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

Open `localhost:3000` or the remote url in a web browser.

## Apps

[Available Apps](https://github.com/zodern/Silk/wiki/Apps)

Install apps using the App Manager.

## Create an App

It is simple to create an app for Silk.
[Get Started!](https://github.com/zodern/Silk/wiki/Basics-Of-Making-an-App)
 
## How It Works

The core does basically three things:

1. Routing. Though apps using the new app framework have their own server and router.
2. Manage the apps.
3. Provide an api. There is a client api for apps to interact with the window manager and their server, as well as a server api for interacting with the core.

The window manager that is included with Silk GUI by default is  [Sleek](https://github.com/Silk-GUI/Sleek).

All of the remainaing functionality is handled by apps, such as the app defaults app.

## Contribute

All contributions are greatly appreciated.  

To run locally:
```
git clone https://github.com/zodern/Silk.git
cd Silk
npm install
bower install
```
## Related Projects

Apps:

- [File Explorer](https://github.com/Silk-GUI/file-explorer)
- [Text Editor](https://github.com/Silk-GUI/text-editor)
- [Terminal](https://github.com/Silk-GUI/terminal)
- [Task Manager](https://github.com/Silk-GUI/task-manager)
- [App Manager](https://github.com/Silk-GUI/appManager)
- [App Defaults](https://github.com/Silk-GUI/app-defaults)
- [Tunnel Client](https://github.com/formula1/Silk-Tunnel-Client)

[Window Manager](https://github.com/Silk-GUI/Sleek)

[Remote Server](https://github.com/formula1/Silk-Server)
