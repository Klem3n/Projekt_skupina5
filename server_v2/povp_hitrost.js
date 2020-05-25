const Scraper = require('./scraper')

module.exports = {

    run: async (req) => {
        var data = await Scraper.runScraper()

        var roadName = req.params.road;

        var count = 0;

        var total = 0;

        data.forEach((road) => {
            if(road.cesta == roadName){
                count++;
                total += parseInt(road.hitrost);
            }
        })

        if(total == 0){
            throw "Road not found"
        }

        return (total/count) + "";
    },
}