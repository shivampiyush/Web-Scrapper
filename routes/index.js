var express = require('express');
var router = express.Router();
const cheerio = require('cheerio');
var Crawler = require('crawler');
var scrappingUrl = require('./scrapping-url').scrappingUrl;
var fs = require('fs')

/* GET home page. */
router.get('/', function (req, res, next) {
  var c = new Crawler({
    maxConnections: 5,
    callback: function (error, res, done) {
      if (error) {
        console.log(error);
      } else {
        $ = cheerio.load(JSON.stringify(res));
        links = $('a'); //jquery get all hyperlinks
        var stream = fs.createWriteStream('Web Scrapper.txt');{
          stream.once('open', function(fd){
            $(links).each(function (i, link) {
              var urls = link.attribs.href;
              console.log(urls);
              stream.write(urls + '\n');
            });
            stream.end();
          })
        }
      }
      done();
    }
  });
  c.queue(scrappingUrl);
  res.send('Done')
});

module.exports = router;