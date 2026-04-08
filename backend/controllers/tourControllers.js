import fs from 'fs';


export function renderTours(req, res) {
    res.render('tours');
}

export function getAllTours(req, res) {
    const readTours = fs.readFileSync('./tours.json', 'utf-8');
    const tours = JSON.parse(readTours);
    const { category } = req.query;
    let results = tours.filter(t => t.available);
    if (category && category !== 'all') {
        results = results.filter(t => t.category.toLowerCase() === category.toLowerCase());
    }
    res.json({ tours: results, total: results.length });
}

export function getTourById(req, res) {
    const readTours = fs.readFileSync('./tours.json', 'utf-8');
    const tours = JSON.parse(readTours);
    const tour = tours.find(t => t.id === req.params.id);
    if (!tour) return res.status(404).json({ error: true, message: 'Tour not found' });
    res.json(tour);
}