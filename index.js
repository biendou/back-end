const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  maxHttpBufferSize: 1e12 // 100 MB
});
const { writeFile, readFile } = require('fs');
const port = process.env.PORT || 8000;
app.get('/', function (req, res) {
  res.sendfile('app.html');
});
io.on('connection', (socket) => {
  console.log('user connected');
  const array = []
  let timer = 0;
  socket.use((packet, next) => {
    if (packet[0] === "upload") {
      timer = Date.now();
      console.log("Démarrage du compteur avant l'upload...", timer);
      
    }
    next();
  });

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
  socket.on('Hello', function () {
    console.log('Hello World');
  });
  socket.on('stream', function (packet) {
    console.log('packet', packet);
  });
  socket.on("upload", (file, callback) => {
    console.log("Received file"); // <Buffer 25 50 44 ...>

    const filePath = "/tmp/upload";
    console.log("file Downladed ", Date.now()-timer)
    // Sauvegarde du fichier sur le disque
    writeFile(filePath, file, (err) => {
      if (err) {
        console.error("Erreur lors de l'enregistrement du fichier", err);
        callback({ message: "failure" });
        return;
      }

      console.log("Fichier enregistré avec succès " , Date.now()-timer);
      callback({ message: "success" });

      // Lire le fichier et le réémettre sur le même canal
      readFile(filePath, { encoding: "base64" }, (err, data) => {
        if (err) {
          console.error("Erreur lors de la lecture du fichier", err);
          return;
        }
        socket.emit("download", data);
      });
    });
  });
  // socket.on("upload", (file, callback) => {
  //   console.log("file"); // <Buffer 25 50 44 ...>

  //   // save the content to the disk, for example
  //   writeFile("/tmp/upload", file, (err) => {
  //     console.log("callBack")
  //     callback({ message: err ? "failure" : "success" });
  //   });
  // });

})

server.listen(port, function () {
  console.log(`Listening on port ${port}`);
});