module.exports = {

    run: (req, data) => {
        var roads = []

        data.forEach((road) => {
            if(!roads.includes(road.cesta)){
                roads.push(road.cesta)
            }
        })

        return roads;
    },
    sendSigns: (req, res) => {

    }
}