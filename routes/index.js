var request = require('request'); // To make http requests.
var cheerio = require('cheerio');  // To parse HTML
var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/', function (req, res, next) {
    function callRun(req, res) {
        startQueue.recursiveSolution();
    }
    // Function to Crawl the website by URLs by calling it resursively inside run function.
    const scrape = (url) => {
        return new Promise((resolve, reject) => {
            let taskUrls = [];
            request(url, (err, res, body) => {
                if (err) resolve([]);  //to handle ETIMEDOUT error
                if (body) {
                    $ = cheerio.load(body);
                    links = $('a');
                    var stream = fs.createWriteStream('Web Scrapper.txt'); {
                        stream.once('open', function (fd) {
                            $(links).each(function (i, link) {
                                if (link && link.attribs && link.attribs.href) {
                                    var urls = link.attribs.href;
                                    stream.write(urls + '\n');
                                }
                            });
                            stream.end();
                        })
                    }
                } else {
                    resolve(taskUrls)
                }
            })
        })
    }

    // Initial URL queue to crawl
    var tasks = [
        'https://medium.com/'
    ];

    // Promise Queue class to schedule urls to be crawled.
    class PromiseQueue {
        // Initializing First Time.
        constructor(urls = [], concurrentCount = 1) {
            this.concurrent = concurrentCount - 1; // For Cuncurrency 
            this.todo = urls;                    // Queue of Urls  
            this.running = [];                   // Currently Running 
            this.complete = [];                  // Completed Urls       
            this.completedUrls = {};             // Completed URLs object to mark the visited and completed Urls   
        }

        // Getter function to check whether to run another task(url) to get crawled recursively.
        get runAnother() {
            return (this.running.length < this.concurrent && this.todo.length);
        }

        // Checking if the Url to be processed is valid or not.
        checkIfUrlIsValid(url) {
            const pattern = new RegExp('^(https?:\\/\\/)?' +
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,})' +
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
                '(\\?[;&a-z\\d%_.~+=-]*)?' +
                '(\\#[-a-z\\d_]*)?$', 'i');
            return !!pattern.test(url);
        }

        /* Function to check if a particular URL belong to https://medium.com, otherwise it might get to 
        antoher websites and the process could never stop*/
        checkIfBelongTOMedium(url) {
            let pattern = 'medium.com';
            pattern = new RegExp(pattern);
            return pattern.test(url);

        }

        /* Remove Already processed Urls */
        removeDuplicateUrls(taskUrls, completedUrlsObject, callback) {
            return new Promise(async (resolve, reject) => {
                let updatedUrls = []
                updatedUrls = taskUrls.filter(url => {
                    let u = url;
                    if (completedUrlsObject[u] != true && this.checkIfUrlIsValid(url)) { return true; }
                    return false;
                })
                resolve(updatedUrls);
            })
        }

        /* Recursive Function*/
        recursiveSolution() {
            while (this.runAnother) {
                var url = this.todo.shift();
                //Check if already processed, url is valid and belong to medium.com
                if (!this.completedUrls[url] && this.checkIfUrlIsValid(url) && this.checkIfBelongTOMedium(url)) {
                    this.completedUrls[url] = true;

                    //promise to crawl particular url.
                    scrape(url).then((taskUrls) => {

                        // If scraped url array is not NULL then remove all the duplicates and add to the todo Queue.
                        if (taskUrls.length > 0) {
                            this.removeDuplicateUrls(taskUrls, this.completedUrls).then(uniqueUrls => {
                                this.todo = [...this.todo, ...uniqueUrls]
                                this.complete.push(this.running.shift());

                                // If schedule queue is empty or completed task has reached to 50 Save them to DB.
                                this.recursiveSolution(); //call recursive function for another url to crawl.
                            }).catch(err => {
                                // If any error occurs save completed task to the DB.
                                scrapingDone(this.complete);
                            })

                        } else {
                            this.todo = [...this.todo, ...taskUrls];
                            this.complete.push(this.running.shift()); // Push to the complete array.
                            this.recursiveSolution(); // Calling Resursive Function.
                        }

                    }).catch(err => {
                        this.recursiveSolution();
                    })
                    this.running.push(url); // Pushing current url to The Running Queue.
                }
            }
        }
    }

    var startQueue = new PromiseQueue(tasks, 5); // Initialize Promise Queue with tasks any concurrent operations to be maintained.

    // function to Save the parsed Urls to Database.



    // Driver Function To be called from routes file.

    // Drop collection and save new data.

    callRun();

    //Error handling

    process.on('uncaughtException', function (err) {
        console.log(err)
    })
})
module.exports = router;

