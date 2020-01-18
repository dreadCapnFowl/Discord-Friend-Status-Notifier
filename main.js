// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, Tray, globalShortcut  } = require('electron')
const path = require('path')
const openAboutWindow = require('about-window').default;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let appIcon = null

function createWindow () {
  app.setAppUserModelId('StatusNotifier')
  appIcon = new Tray('icon.png')

  var contextMenu = Menu.buildFromTemplate([
      { label: 'Show', click:  function(){
          mainWindow.show();
      } },
      { label: 'About', click:  function(){
          openAboutWindow({
              icon_path: "data:image/png;base64,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",
              copyright: 'Copyright (c) 2020 dreamtrap',
              homepage: 'http://dreamtrap.net',
              description: 'A small app for Discord that notifies you when your friends change their statuses.',
              css_path: 'style.css'
          });
      } },
      { label: 'Quit', click:  function(){
          mainWindow.destroy();
          app.quit();
      } }
  ]);

  appIcon.setToolTip('Status Notifier')
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
