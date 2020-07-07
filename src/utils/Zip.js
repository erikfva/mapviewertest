import { zip } from "mapshaper-es/www/zip.js";

//Copy: "z-worker.js", "pako.deflate.js", "codecs.js", etc. in root url directory.
zip.workerScripts = {
  deflater: ["z-worker.js", "pako.deflate.js", "codecs.js"],
  inflater: ["z-worker.js", "pako.inflate.js", "codecs.js"],
};

const CompressBlobFiles = function(files) {
  let process = new Promise((resolve, reject) => {
    var toAdd = files;
    var zipWriter;
    try {
      zip.createWriter(
        new zip.BlobWriter("application/zip"),
        function(writer) {
          zipWriter = writer;
          nextFile();
        },
        zipError
      );
    } catch (e) {
      reject("This browser doesn't support Zip file creation.");
    }

    function zipError(err) {
      var str = "Error creating Zip file";
      var msg = "";
      // error events thrown by Zip library seem to be missing a message
      if (err && err.message) {
        msg = err.message;
      }
      if (msg) {
        str += ": " + msg;
      }
      reject(str);
    }

    function nextFile() {
      if (toAdd.length === 0) {
        zipWriter.close(function(blob) {
          resolve(blob);
          //saveBlobToDownloadFolder(zipfileName, blob, done);
        });
      } else {
        var obj = toAdd.pop(),
          blob = new Blob([obj.content]);
        zipWriter.add(obj.filename, new zip.BlobReader(blob), nextFile);
      }
    }
  });
  return process;
};
export { CompressBlobFiles };
