var express = require('express');
var router = express.Router();
const cheerio = require('cheerio');
var scrappingUrl = require('./scrapping-url').scrappingUrl;
var fs = require('fs');
var request = require('request');

/* GET home page. */
router.get('/', function (req, res, next) {
  function listDirs(dirsToVisit, maxAtOnce) {
    let numRunning = 0;
    let index = 0;

    function runMore() {
      // while we need to start more, start more of them
      while (numRunning < maxAtOnce && index < dirsToVisit.length) {
        ++numRunning;
        const ls = spawn("ls", [dirsToVisit[index++]]);
        ls.on("close", code => {
          --numRunning;
          console.log(`Finished with code ${code}`);
          runMore();
        }).on("error", err => {
          --numRunning;
          runMore();
        });
      }
      if (numRunning === 0) {
        request(scrappingUrl, (error, response, html) => {
          if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);
            links = $('a'); //jquery get all hyperlinks
            var stream = fs.createWriteStream('Web Scrapper.txt'); {
              stream.once('open', function (fd) {
                $(links).each(function (i, link) {
                  if (link && link.attribs && link.attribs.href) {
                    var urls = link.attribs.href;
                    console.log(urls);
                    stream.write(urls + '\n');
                  }
                });
                stream.end();
              })
            }
          }
        });
        // all done with all requests here
      }
    }
    runMore();
  }
  listDirs(5, 5)
  res.send('Done')
});

module.exports = router;