## Learn How to Create an App

This guide will help you create an app for Silk GUI.

Currently, there are two ways to create an app in Silk

- The old fork framework. Apps have an app.json and follow a certain structure.
- The new app framework which is compatible with electron. Apps have a package.json. Apps using it have much more freedom.

The fork framework will be removed after all core apps have been migrated,
so this guide will cover the app framework.

The new framework supports a small subset of the electron api but has access
to most of the apis and features provided by the fork framework. Future releases will add 
support for more of electron's apis.

### Why create an app for Silk?

Silk is designed for three niche markets. The first is developers
who want to modify the os on their computer. The second is people who
want a graphical way to remotely access a server. The third is users of NodeOS.

- If your app would be useful while accessing a server, Silk GUI is a perfect
platform. 
- If your app is a normal desktop app, you will reach an additional group of people. 
Also, your app will run on linux, OSX, and windows with no modifications.

### Step 1 - Download Boilerplate

__Prerequisites__ You need to have this software installed before continuing

- [Git](http://git-scm.com/)
- [Node.js](https://nodejs.org/)
- [Silk GUI](http://silkgui.com/)

Next, open the terminal and type:

```bash 
git clone https://github.com/Silk-GUI/silk-boilerplate.git
cd silk-boilerplate
npm install
```

Run `pwd` and copy the output. You will need it for the next step.

### Step 2 - Add to Silk

Start silk by typing `silk` into the terminal.

Next, open `localhost:3000` in a web browser. Click on the apps button (4 squares in lower left corner) and then on the App Manager. 

Click on the install button and past the path you copied from the previous step.


### Step 3 - Run the app

You need to restart silk to finish loading it. Type `control + c` in the terminal to stop silk, and then type `silk` again to start it. Refresh the page open in the web browser to reconnect in the server. `silk-demonstate` should now be in the app list. 

### Step 4 - Modify the app

You can modify the boilerplate to create your app. It is similar to create a web app with Node.js, but for a single user.

If you need any features added to silk or have a suggestion, please create an issue.
