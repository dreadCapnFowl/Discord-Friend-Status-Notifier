// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, Tray, globalShortcut  } = require('electron')
const path = require('path')
const openAboutWindow = require('about-window').default;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let appIcon = null

function createWindow () {
  app.setAppUserModelId('FriendStatus')
  appIcon = new Tray('icon.ico')

  var contextMenu = Menu.buildFromTemplate([
      { label: 'Show', click:  function(){
          mainWindow.show();
      } },
      { label: 'About', click:  function(){
          openAboutWindow({
              copyright: 'Copyright (c) 2020 dreamtrap',
              homepage: 'dreamtrap.net',
              description: 'A small app that notifies you when your friends change their statuses.',
              css_path: 'style.css'
          });
      } },
      { label: 'Quit', click:  function(){
          mainWindow.destroy();
          app.quit();
      } }
  ]);

  appIcon.setToolTip('Discord Friend Status')
  appIcon.setContextMenu(contextMenu)

  appIcon.on('click', () => {
    mainWindow.show();
  })
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 300,
    height: 500,
    icon: 'icon.ico',
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  Menu.setApplicationMenu(null);
  // Open the DevTools.


  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.on('minimize',function(event){
      event.preventDefault();
      mainWindow.hide();
  });

  globalShortcut.register('CommandOrControl+Shift+I', () => {
    mainWindow.webContents.toggleDevTools()
  })

  globalShortcut.register('CommandOrControl+R', () => {
    mainWindow.reload()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
