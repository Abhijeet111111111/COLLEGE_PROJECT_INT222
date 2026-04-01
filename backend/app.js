import express from 'express';
import path from 'path'
import { fileURLToPath } from 'url';
import fs, { readFileSync, stat } from 'fs';
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')
app.use(express.json());

app.use(express.static('public'))


app.get('/', (req, res) => {
    const readF = fs.readFileSync('./hotels.json');
    const readf2 = fs.readFileSync('./destinations.json');
    const destinations = JSON.parse(readf2);
    const hotelData = JSON.parse(readF);
    hotelData.sort(() => Math.random() - 0.5);
    destinations.sort(() => Math.random() - 0.5);

    res.render('home', { hotel: hotelData, destination: destinations })
})

app.get('/explore', (req, res) => {
    const readf2 = fs.readFileSync('./destinations.json', 'utf-8');
    const destinations = JSON.parse(readf2);
    res.render('explorePage', { destinations: destinations });
})
app.get('/explore/filter/:id', (req, res) => {
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
})

app.get('/destinations/:id', (req, res) => {
    const { id } = req.params;
    console.log(id);
    const readF = readFileSync('./destinations.json', 'utf-8');
    const destinationArray = JSON.parse(readF);
    const destination = destinationArray.filter(el => el.id === id);
    res.status(200).json({
        status: 'success',
        destination: JSON.stringify(destination)
    })


})


app.post('/api/hotels/search', (req, res) => {
    try {
        const {
            destination,
            checkIn,
            checkOut,
            guests,
            maxPrice,
            freeCancellation,
            poolIncluded,
            tags,
            amenities,
            stars,
            sortBy = 'best_value',
        } = req.body || {};

        console.log(req.body)

        // ── Validate ────────────────────────────────────────────────
        if (maxPrice !== undefined && (isNaN(maxPrice) || maxPrice < 0)) {
            return res.status(400).json({ error: true, message: 'maxPrice must be a positive number' });
        }
        if (stars && !Array.isArray(stars)) {
            return res.status(400).json({ error: true, message: 'stars must be an array e.g. [4,5]' });
        }
        if (tags && !Array.isArray(tags)) {
            return res.status(400).json({ error: true, message: 'tags must be an array' });
        }
        if (amenities && !Array.isArray(amenities)) {
            return res.status(400).json({ error: true, message: 'amenities must be an array' });
        }

        const readF = readFileSync('hotels.json', 'utf-8');
        const hotels = JSON.parse(readF)

        // ── Filter ──────────────────────────────────────────────────
        let results = hotels.filter(hotel => {

            // Only return available hotels
            if (!hotel.available) return false;

            // ── Destination: match city, state, or region ────────────
            if (destination) {
                const d = (destination);
                const matchCity = (hotel.location.city).includes(d);
                const matchState = (hotel.location.state).includes(d);
                if (!matchCity && !matchState) return false;
            }

            // ── Max price ────────────────────────────────────────────
            if (maxPrice && hotel.pricePerNight > maxPrice) return false;

            // ── Free cancellation ────────────────────────────────────
            if (freeCancellation === true && !hotel.freeCancellation) return false;

            // ── Pool included ────────────────────────────────────────
            if (poolIncluded === true) {
                const hasPool = hotel.amenities.some(a => (a).includes('pool'))
                    || hotel.tags.some(t => (t).includes('pool'));
                if (!hasPool) return false;
            }

            // ── Tags (hotel must have ALL requested tags) ────────────
            if (tags && tags.length > 0) {
                const hotelTags = hotel.tags;
                const allMatch = tags.every(tag => hotelTags.includes((tag)));
                if (!allMatch) return false;
            }

            // ── Amenities (hotel must have ALL requested amenities) ──
            if (amenities && amenities.length > 0) {
                const hotelAmenities = hotel.amenities;
                const allMatch = amenities.every(a => hotelAmenities.some(ha => ha.includes((a))));
                if (!allMatch) return false;
            }

            // ── Star rating (hotel must match at least one selected) ─
            if (stars && stars.length > 0) {
                if (!stars.includes(hotel.stars)) return false;
            }

            return true;
        });

        // ── Sort ─────────────────────────────────────────────────────
        results = sortHotels(results, sortBy);

        console.log(results.length);

        // ── Respond ──────────────────────────────────────────────────
        res.json({
            hotels: results,
            total: results.length,
            filters: {          // echo back what was applied (useful for frontend debugging)
                destination: destination || null,
                checkIn: checkIn || null,
                checkOut: checkOut || null,
                guests: guests || null,
                maxPrice: maxPrice || null,
                freeCancellation: freeCancellation || false,
                poolIncluded: poolIncluded || false,
                tags: tags || [],
                amenities: amenities || [],
                stars: stars || [],
                sortBy,
            },
        });

    } catch (err) {
        console.error('Error in /api/hotels/search:', err);
        res.status(500).json({ error: true, message: 'Internal server error' });
    }
});


app.get('/hotels', (req, res) => {
    res.render('hotelsPage');
})

app.get('/api/hotels', (req, res) => {
    const readF = readFileSync('hotels.json', 'utf-8');
    const hotels = JSON.parse(readF)
    res.json({ hotels, total: hotels.length });
})










function sortHotels(list, sortBy) {
    const sorted = [...list];
    switch (sortBy) {
        case 'price_asc':
            return sorted.sort((a, b) => a.pricePerNight - b.pricePerNight);
        case 'price_desc':
            return sorted.sort((a, b) => b.pricePerNight - a.pricePerNight);
        case 'rating':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'eco_score':
            return sorted.sort((a, b) => b.ecoScore - a.ecoScore);
        case 'best_value':
        default:
            // value score = rating divided by (price in thousands)
            return sorted.sort((a, b) =>
                (b.rating / (b.pricePerNight / 1000)) - (a.rating / (a.pricePerNight / 1000))
            );
    }
}


app.listen(3000);