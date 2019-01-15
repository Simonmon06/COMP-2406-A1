/*
Zeye Gu 101036562
Ziwen Wang 101071063

Example Server that is prepared to receive GET and POST HTTP requests.
GET requests are handled as a request for a file.
POST requests are expected to contain JSON data in the message body.
*/





//key:The text that users should enter, value: the path of song files.
var songsFile = {
  "Brown Eyed Girl": "html/songs/Brown Eyed Girl.txt",
  "Peaceful Easy Feeling": "html/songs/Peaceful Easy Feeling.txt",
  "Sister Golden Hair": "html/songs/Sister Golden Hair.txt"

};

//----------------------------------------------------
/*
const songs = {
  "Peaceful Easy Feeling": peacefulEasyFeeling,
  "Sister Golden Hair": sisterGoldenHair,
  "Brown Eyed Girl": brownEyedGirl
};
*/
//Server Code
const http = require("http"); //need to http
const fs = require("fs"); //need to read static files
const url = require("url"); //to parse url strings

const ROOT_DIR = "html"; //dir to serve static files from

const MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain"
}

const get_mime = function(filename) {
  //Use file extension to determine the correct response MIME type
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
       return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES["txt"]
}

http.createServer(function(request, response) {
    var urlObj = url.parse(request.url, true, false)
    console.log("\n============================")
    console.log("PATHNAME: " + urlObj.pathname)
    console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
    console.log("METHOD: " + request.method)

    var receivedData = ""

    //Event handlers to collect the message data
    request.on("data", function(chunk) {
      receivedData += chunk;
    })

    //Event handler for the end of the message
    request.on("end", function() {
      console.log("received data: ", receivedData)
      console.log("type: ", typeof receivedData)

      //if it is a POST request then echo back the data.
      if (request.method == "POST") {
        //Handle POST requests
        var dataObj = JSON.parse(receivedData)
        console.log("received data object: ", dataObj)
        console.log("type: ", typeof dataObj) //Here we can decide how to process the data object and what
        console.log("USER REQUEST: " + dataObj.text)  //object to send back to client.
        var returnObj = {}                            //FOR NOW EITHER JUST PASS BACK AN OBJECT


        // var songpath

        for(name in songsFile){
          if(name === dataObj.text){
            returnObj.text="Found"

            fs.readFile(songsFile[dataObj.text], function(err, data) {
              // find the right file path in the "songFile"
              if(err) throw err;
              let songsArray = data.toString().split("\n")
              let wordArray = []
              let currentChar = ""
              let x_Pos = 10
              let y_Pos = 20// starting point
              let chord = false
              //let lineChanged = false


            //modify the orginal text
			  for(let line = 0; line < songsArray.length; line++){
				  let temp = songsArray[line]
				  songsArray[line]=songsArray[line].replace("["," {")
				  songsArray[line]=songsArray[line].replace("]","} ")
				  while(!(temp === songsArray[line])){
					  temp = songsArray[line]
					  songsArray[line]=songsArray[line].replace("["," {")
					  songsArray[line]=songsArray[line].replace("]","} ")
				  }

				  temp = songsArray[line]
				  songsArray[line]=songsArray[line].replace("{","[")
				  songsArray[line]=songsArray[line].replace("}","]")
				  while(!(temp === songsArray[line])){
					  temp = songsArray[line]
					  songsArray[line]=songsArray[line].replace("{","[")
					  songsArray[line]=songsArray[line].replace("}","]")
				  }


				  console.log(songsArray[line])
				  wordsArray = songsArray[line].split(" ")
				  for(let i = 0; i < wordsArray.length; i++){
					  /*if (wordsArray[i] === " "){
						wordArray.push({word:currentChar, x:x_Pos, y:y_Pos})// push the word and the x & y position in the wordlist
						x_Pos += "".length*10 + 10
					  } else{
						  wordArray.push({word:wordsArray[i], x:x_Pos, y:y_Pos})
					  }*/

            // set position to word
					  if(x_Pos + wordsArray[i].length*10 > 500){
						x_Pos = 10
						y_Pos+= 20
          }
					  if (wordsArray[i].length > 0){
						  wordArray.push({word:wordsArray[i], x:x_Pos, y:y_Pos})
						  x_Pos += wordsArray[i].length*10 + 10
					  }
				  }
				  x_Pos = 10
				  y_Pos +=20
			  }


			  returnObj.wordArray = wordArray
				//object to return to client
				response.writeHead(200, { "Content-Type": MIME_TYPES["txt"] })
				response.end(JSON.stringify(returnObj)) //send just the JSON object as plain text
				console.log(returnObj)
				return
            })

          }
        }
      }


      if (request.method == "GET") {
        //Handle GET requests
        //Treat GET requests as request for static file
        var filePath = ROOT_DIR + urlObj.pathname
        if (urlObj.pathname === "/") filePath = ROOT_DIR + "/index.html"

        fs.readFile(filePath, function(err, data) {
          if (err) {
            //report error to console
            console.log("ERROR: " + JSON.stringify(err))
            //respond with not found 404 to client
            response.writeHead(404)
            response.end(JSON.stringify(err))
            return
          }
          //respond with file contents
          response.writeHead(200, { "Content-Type": get_mime(filePath) })
          response.end(data)
        })
      }
    })
  }).listen(3000)

console.log("Server Running at PORT 3000  CNTL-C to quit")
console.log("To Test:")
console.log("http://localhost:3000/assignment1.html")
