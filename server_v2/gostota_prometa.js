module.exports = {

    run: (req, data) => {
        var density = req.params.density;

        var roadName = req.params.road;

        return data.filter((road) => {
            if(roadName != undefined){
                return road.cesta.toUpperCase() == roadName.toUpperCase() && road.stanje.toUpperCase() == density.toUpperCase();
            }

            return road.stanje.toUpperCase() == density.toUpperCase();
        });
    },
}