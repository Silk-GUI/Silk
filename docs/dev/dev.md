title: Dev Docs
layout: page
---

This guide will help you create an app for Silk GUI.

Currently, there are two ways to create an app in Silk
- the old fork framework. Apps have an app.json
- the new app loader which is compatible with electron. Apps have a package.json

The fork framework will be removed after all core apps have been migrated,
so this guide will cover the app framework.

The new framework supports a small subset of the electron api but has access
to all of the api's provided by the fork framework. Future releases will add 
support for more of electron api's.

### Why create an app for Silk?

Silk is designed for three niche markets. The first is developers
who want to modify the os on their computer. The second is people who
want a graphical way to remotely access a server. The third is users of NodeOS.

- If your app would be useful while accessing a server, Silk GUI is a perfect
platform. 
- If your app is a normal desktop app, you will reach an additional group of people. 
Also, your app will run on other linux GUIs, OSX, and windows with no modifications.

[First step - download boilerplate code](boilerplate.html)
