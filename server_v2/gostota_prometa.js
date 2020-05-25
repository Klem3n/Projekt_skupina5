module.exports = {

    run: (req, data) => {
        var density = req.params.density;

        var roadName = req.params.road;

        if(density == undefined && roadName == undefined){
            var densities = [{ime:"gost promet z zastoji", val: 0},
            {ime:"povečan promet", val: 0},
            {ime:"normalen promet", val: 0},
            {ime:"ni prometa", val: 0}]
            
            data.forEach(road =>{
                densities.forEach(den=>{
                    if(den.ime.toUpperCase() == road.stanje.toUpperCase()){
                        den.val++;
                    }
                })
            })

            return densities;
        }

        return data.filter((road) => {
            if(roadName != undefined){
                return road.cesta.toUpperCase() == roadName.toUpperCase() && road.stanje.toUpperCase() == density.toUpperCase();
            }

            return road.stanje.toUpperCase() == density.toUpperCase();
        });
    },
}