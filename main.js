const { app, BrowserWindow, ipcMain, dialog } = require('electron')
require('./schema.js')

if (require('electron-squirrel-startup')) {
  app.quit()
}

const createMainWindow = () => {
  const window = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
      devTools: false
    }
  })
  window.loadFile('./src/index.html')
  window.setMenu(null)
  window.maximize()
}

const createLoginwindow = () => {
  const window = new BrowserWindow({
    width: 550,
    height: 650,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
      devTools: false
    }
  })

  window.loadFile('./src/login.html')
  window.setMenu(null)
  window.resizable = false
}

app.whenReady().then(() => {
  createLoginwindow()

  ipcMain.on('open:mainWindow', () => {
    createMainWindow()
  })

  ipcMain.on('open:dialog', ev => {
    dialog
      .showOpenDialog({
        properties: ['openDirectory']
      })
      .then(data => {
        ev.reply('open:dialog', data.filePaths)
      })
  })
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createLoginwindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
