const cheerio = require('cheerio')
const Nightmare = require('nightmare')
var fs = require("fs")

const nightmare = Nightmare({ show: false })
const url = "https://www.promet.si/portal/sl/cestne-kamere.aspx"

module.exports = {
    getCameras: async (req, res) =>{
        var path = "kamere.json"
        if(!fs.existsSync(path)){
                return JSON.parse(await scrapeToFile())
        } else {
            var stats = fs.statSync(path);
            var mtime = stats.mtime;

            var diff = Math.abs(mtime - new Date())

            var minutes = Math.floor((diff/1000)/60)

            if(minutes >= 20){
                return JSON.parse(await scrapeToFile())
            }
        }

        var file = fs.readFileSync(path);

        return JSON.parse(file)
    }
}

async function scrapeToFile(){
    var imgs = []

    await nightmare
    .goto(url)
    .inject('js', 'jquery-3.5.1.slim.min.js')
    .wait('body')
    .evaluate(function() {
        var index = 0;
        var imgs = []

        $('.donotremove').each(function(){
            var parent = $(this).parent();
            var name = $(this).html();
            var call = $(this).attr("href")

            call = call.substring(0, call.length - 1)
            call = call.replace("javascript:KamereCreateImg(", "")
            call = call.replace(/(\")/g, "")

            var split = call.split(",");

            if(split.length == 2){
                KamereCreateImg(split[0], split[1])

                var url = parent.find("img").first().attr('src')
                url = url.replace(/(\?&dt=).+/, "")

                imgs.push({name, url})
            }
            index++;
        });

        return imgs;
        })
    .end()
    .then(function (result) {
        imgs = result
    })
    .catch(err => {
        console.log(err);
         data = null;
        nightmare.refresh();
        return err;
    });

    var failed = false;

    var data = JSON.stringify(imgs);

    fs.writeFile("kamere.json", data, function(err) {
        if (err) {
            console.log(err);
            failed = true;
        }
    });

    return data
}