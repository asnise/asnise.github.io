const fs = require('fs');
const im = require('imagemagick');

var name ="";

fs.readdir("./images/", (err, files) => {
    files.forEach(file => {
        name = "";
        name = file;

        im.resize({
            srcPath: './images/' + name,
            dstPath: './img/' + name,
            width: 1200,
        }, (err, stdout, stderr) => {
            console.log(stdout);
        });
    });
});