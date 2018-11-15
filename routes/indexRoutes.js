const express = require('express');
const router = express.Router();
const stream = require("stream");
const fs = require("fs");

var Transform = require('stream').Transform;

class ChunkEncode extends Transform {
    constructor(options){
        super(options);
        this.splitSize = options.splitSize;
    }
    _write(chunk){
      let startSlice = 0;
      for(let i = 0; i < Math.ceil(chunk.length / this.splitSize); i++){
        if(chunk.length - startSlice < this.splitSize){
          this.push(chunk.slice(startSlice, chunk.length))
        } else {
          this.push(chunk.slice(startSlice, startSlice + this.splitSize))
          startSlice += this.splitSize;
        }
        
      }
    }

    _flush(cb){
      cb();
    }

    _transform(chunk){
      let startSlice = 0;
      for(let i = 0; i < Math.ceil(chunk.length / this.splitSize); i++){
        if(chunk.length - startSlice < this.splitSize){
          this.push(chunk.slice(startSlice, chunk.length))
        } else {
          this.push(chunk.slice(startSlice, startSlice + this.splitSize))
          startSlice += this.splitSize;
        }
        
      }
      return;
      
    }
}

const {generateAndSendT2SResponse, readRangeHeader} = require("../services/textToSpeech")

/* GET home page. */
router.get('/audio2', function(req, res, next) {
  console.log(req.headers)

  generateAndSendT2SResponse(req.body.text, (data) => {
    let startbytes = 0,
    endBytes = 1024,
    totalBytes = data.length;
    res.status(206).header({
      "Content-Type": "audio/mp3",
    });
    let submittedEnd = false;
     const writableStrim = new ChunkEncode({splitSize : 1000});
    writableStrim.on("end", (data) => {
    })
    writableStrim.on("data", (data) => {
      if(data){
        if(totalBytes - endBytes < 1000 && totalBytes - endBytes > 0){
          res.status(206).header({
            "Range": `${startbytes}-${endBytes}/${totalBytes}`,
            "Length":startbytes - endBytes
          }).write(data, (err) => {
  
            if(!submittedEnd){
              res.end(() => {
                console.log("ended res")
              })
            }
  
          })
        } else if (totalBytes - endBytes > 1000) {
          res.status(206).write(data, (err) => {
            console.log(err)
            startbytes += 1024
            endBytes += 1024
          })
        } else {
          console.log("end")
        }

      }

    })
    writableStrim.end(data)

  });


});



router.get('/audio', function(req, res, next) {

  generateAndSendT2SResponse(req.body.text, (data) => {
    if(req.headers.range){
      console.log("truest", req.headers.range)
      let {Start, End} = readRangeHeader(req.headers.range, data.length)
      console.log(Start, End)
      End = End-Start > 10240? Start + 10240 : End;
      if (Start >= data.length || End >= data.length){
        res.header({"Content-Range": `bytes */${data.length}`})
        res.status(416).send({})
      } else {
        const mySlice = data.slice(Start, End)
        console.log(mySlice)
        res.header({
          "Content-Range":`bytes ${Start}-${End}/${data.length}`,
          "Content-Length": Start === End? 0 : (End - Start + 1),
          "Accept-Ranges":"bytes"
        }).status(206).send(mySlice)
      }
    } else {
      res.status(206).send()
    }
  });


});



module.exports = router;
