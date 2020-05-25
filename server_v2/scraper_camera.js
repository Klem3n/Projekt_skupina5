const cheerio = require('cheerio')
const Nightmare = require('nightmare')
var fs = require("fs")

const nightmare = Nightmare({ show: false })
const url = "https://www.promet.si/portal/sl/cestne-kamere.aspx"

module.exports = {
    getCameras: async (req, res) =>{
        var file = fs.readFileSync("kamere.json");

        return JSON.parse(file)
    },
    scrapeToFile: async (req, res) =>{
        if(req.params.password != "skupina5")
            return "napačno geslo"
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

        fs.writeFile("kamere.json", JSON.stringify(imgs), function(err) {
            if (err) {
                console.log(err);
                failed = true;
            }
        });

        if(!failed)
            return "Kamere posodobljene"

        return "Spodletelo shranjevanje kamer"
    }
}