import fs from 'fs';

export function explorePage(req, res) {
    const readf2 = fs.readFileSync('./destinations.json', 'utf-8');
    const destinations = JSON.parse(readf2);
    res.render('explorePage', { destinations: destinations });
}

export function filterDestination(req, res) {
    const { id } = req.params;
    const readf2 = fs.readFileSync('./destinations.json', 'utf-8');
    const destinations = JSON.parse(readf2);

    const filteredDestinations = destinations.filter(el => {
        const cat = el.categories.map(el => el.toLowerCase());
        return cat.includes(id);
    }) || []


    res.status(200).json({
        status: 'success',
        destinations: JSON.stringify(destinations),
        filteredDestinations: JSON.stringify(filteredDestinations)
    })
}

export function searchDestination(req, res) {

    const query = req.query.q?.toLowerCase();

    if (!query) {
        return res.json([]);
    }

    try {
        const rawData = fs.readFileSync("./destinations.json", "utf-8");
        const data = JSON.parse(rawData);

        const results = data.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.state.toLowerCase().includes(query)
        );

        res.json(results.slice(0, 10)); // limit results
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error reading file" });
    }

}