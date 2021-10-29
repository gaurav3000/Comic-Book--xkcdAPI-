const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const https = require('https');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

var comicNum = 0;
var latest = 0;

app.get('/', function (req, res) {
    const url = "https://xkcd.com/info.0.json ";
    https.get(url, function (response) {
        response.on("data", function (data) {
            var comicData = JSON.parse(data);
            comicNum = comicData.num;
            latest = comicNum;
            res.render("home", {
                comicNumber: comicNum,
                comicName: comicData.safe_title,
                day: comicData.day,
                month: comicData.month,
                year: comicData.year,
                imgSrc: comicData.img,
                transcript: comicData.transcript,
            })
        })
    })
});


app.get("/cn/:cNum", function (req, res) {
     
    var comicNum = req.params.cNum;
    if(comicNum != "favicon.ico")
    {
        console.log("comic num = " + comicNum);
        if (comicNum > latest) {
            comicNum = 1;
            res.redirect('/' + comicNum);
        }
        else if (comicNum > 0) {
            const url = "https://xkcd.com/" + comicNum + "/info.0.json ";
    
            https.get(url, function (response) {
                let chuncks = [];
                response.on("data", function (data) {
                    chuncks.push(data);
                }).on('end', function () {
                    let data = Buffer.concat(chuncks);
                    var comicData = JSON.parse(data);
                    comicNum = comicData.num;
                    var transcript = comicData.transcript;
                    transcript = transcript.replaceAll("]]", "\n");
                    transcript = transcript.replaceAll("[[", "\n");
                    res.render("home", {
                        comicNumber: comicNum,
                        comicName: comicData.safe_title,
                        day: comicData.day,
                        month: comicData.month,
                        year: comicData.year,
                        imgSrc: comicData.img,
                        transcript: transcript,
                    })
                })
            })
        }
        else if (comicNum <= 0) {
            res.redirect('/');
        }
    }
})

app.post('/', function (req, res) {
    var btn = req.body.navigate;
    var num = req.body.ComicN;
    
    if (btn == "prev") {
        if (comicNum < 0) {
            comicNum = 0;
        }else{
            comicNum--;
        }
    }
    else if (btn == "next") {
        if (comicNum == latest) {
            comicNum = 1;
        }
        else{
            comicNum++;
        }
    }
    else if (btn == "Random") {
        var rand = Math.ceil(Math.random() * latest);
        comicNum = rand;

    }
    else if(btn == "search")
    {
        comicNum = num;
    }
    else if(btn == "latest")
    {
        comicNum = latest;
    }
    else if(btn == "first")
    {
        comicNum = 1;
    }
    res.redirect("/cn/" + comicNum);
})



app.listen(process.env.PORT || 3000, function () {
    console.log("Server started at port 3000");
})