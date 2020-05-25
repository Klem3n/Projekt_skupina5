const Ceste = require('./ceste')

module.exports = {

    run: (req, data) => {
        var roadName = req.params.road;

        if(roadName != undefined){
            var count = 0;

            var total = 0;
    
            data.forEach((road) => {
                if(road.cesta.toUpperCase() == roadName.toUpperCase()){
                    count++;
                    total += parseInt(road.hitrost);
                }
            })
    
            if(total == 0){
                throw "Road not found"
            }
    
            return (total/count) + "";
        } else {
            var roads = Ceste.run(req, data)

            var road_avg = []

            roads.forEach((roadName)=>{
                var count = 0;
                var total = 0;

                data.forEach((road) => {
                    if(road.cesta.toUpperCase() == roadName.toUpperCase()){
                        count++;
                        total += parseInt(road.hitrost);
                    }
                })

                if(total != 0){
                    var avg = (total/count);

                    road_avg.push({roadName, avg})
                }
            })

            return road_avg;
        }
    },
}