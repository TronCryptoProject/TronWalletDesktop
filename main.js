const {app, Menu, BrowserWindow} = electron = require('electron')
const path = require('path')
const url = require('url')
const isDev = require('electron-is-dev');
const logger = require("electron-log");

logger.transports.console.level = 'info';
logger.transports.file.level = 'info';

if (isDev){
  logger.info("isdev: " + process.defaultApp);
  /*require('electron-reload')(__dirname,
    {
      electron: require('${__dirname}/../../node_modules/electron')
    }
  );*/
}else{
   logger.info("no isdev");
}


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 850, 
    height: 750,
    minWidth: 850,
    minHeight: 720,
    titleBarStyle: 'hiddenInset',
    icon: __dirname + '/client/images/tronlogolight.ico'
  })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  if (isDev){
     mainWindow.webContents.openDevTools()
  }
  
  var net = require('net');

  var isPortInUse = function(port, callback) {
      var inst = net.createServer(function(socket) {
        socket.write('Echo server\r\n');
        socket.pipe(socket);
      });

      inst.listen(port,"127.0.0.1");
      inst.on('error', function (e) {
        callback(true);
      });
      inst.on('listening', function (e) {
        inst.close();
        callback(false);
      });
  };

  var child = null;
  isPortInUse(12849, function(returnValue) {
      if (!returnValue){
          /*Start process*/
          var spawn = require("child_process").spawn;
          var filename = `${process.resourcesPath}/app/tronwallet.jar`;
          if (isDev){
            filename = "./tronwallet.jar";
          }
          logger.info("FILE:" + filename);


          var userPath = app.getPath("userData");
          logger.info("userPath: " + userPath);
          child = spawn("java", [`-DuserPath=${userPath}`, "-jar",filename]/*,{
            detached: true,
            stdio: 'ignore'
          }*/);
          //child.unref();
          child.stdout.on('data', function(data) {
              logger.info(data.toString()); 
          });

          /*End process*/
      }
  });



  
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;

    if (child != null){
      logger.info("PID: " + child.pid);
      try{
         process.kill(child.pid, "SIGKILL");
         logger.info("successfully killed");
      }catch(e){
         logger.info(e);
      }
     
    }
    
  })


  /*Menu items*/

  var menu_items = [
  {
    label: "Tron Wallet",
    submenu: [
      {
        label: "About Tron Wallet", 
        selector: "orderFrontStandardAboutPanel:"
      },
      {
        type: "separator"
      },
      {
        label: "Quit",
        accelerator: "Command+Q",
        click: function(){
          app.quit();
        }
      }
    ]
  },
  {
    label: "Edit",
    submenu:[
      {
        label: "Undo",
        accelerator: "CmdOrCtrl+Z",
        selector: "undo:"
      },
      {
        label: "Redo",
        accelerator: "Shift+CmdOrCtrl+Z",
        selector: "redo:"
      },
      { 
        type: "separator" 
      },
      { 
        label: "Cut", 
        accelerator: "CmdOrCtrl+X", 
        selector: "cut:"
      },
      { 
        label: "Copy", 
        accelerator: "CmdOrCtrl+C", 
        selector: "copy:" 
      },
      { 
        label: "Paste", 
        accelerator: "CmdOrCtrl+V",
        selector: "paste:"
      },
      { 
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
        selector: "selectAll:"
      }
    ]
  }];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu_items));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
