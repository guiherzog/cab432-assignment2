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

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, 'public/uploads');

  var file_url = "";

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
    file_url = file.name;
  });

  console.log('New file uploaded. \n Sending file to user...' + file_url);

  // res.sendFile(path.join(__dirname, 'uploads/a.pdf'));
  var output = path.join(__dirname, 'public/uploads/movie.gif');

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    var input = path.join(__dirname, 'public/uploads/'+file_url);
    gify(input, output, function(err){
      if (err) throw err;
    });

    res.end("http://"+req.headers.host+"/uploads/movie.gif");
  });

    // parse the incoming request containing the form data
  form.parse(req);


});

app.use('/result.html', (req, res) => {
  res.setHeader("content-type", "image/gif");
  fs.createReadStream("./uploads/a.pdf").pipe(res);
});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
