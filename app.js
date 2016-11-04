var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var gify = require('gify');
var path = require('path');



app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function(req, res){

  console.log('Uploading new file...');
  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = false;

  form.onPart = function (part) {
    if(!part.filename || part.filename.match(/\.(mkv|avi|mp4)$/i)) {
        this.handlePart(part);
    }
    else {
        console.log(part.filename + ' is not allowed');
        res.end("file_extension");
    }
  }
  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, 'public/uploads');

  var file_url = "";

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
    file_url = file.name;
  });

  console.log('New file uploaded. \n Sending file to user...');

  // every time the form returns an error in the middle of the upload,
  // log it to the server
  form.on('error', function(err) {
    console.log(err.stack)
    res.status(500).send('Something broke!')
  });

  // every time the client aborts the upload,
  // log it to the server
  form.on('aborted', function() {
    console.log('Upload aborted by user!')
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {

    var input = path.join(__dirname, 'public/uploads/'+file_url);

    file_without_extension = file_url.split(".");
    file_url = file_without_extension[0];
    console.log(file_url)

    var output = path.join(__dirname, 'public/uploads/'+file_url+".gif");
    gify(input, output, function(err){
      if (err) throw err;
    });

    res.end("http://"+req.headers.host+"/uploads/"+file_url+".gif");
  });

    // parse the incoming request containing the form data
  form.parse(req);
});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
