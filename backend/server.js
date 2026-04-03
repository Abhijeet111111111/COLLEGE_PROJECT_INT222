/**
 * server.js  —  WanderSmart backend
 * Run:  node server.js
 * Deps: npm install express cors
 */

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Load JSON data ────────────────────────────────────────────────
const hotels      = require('./data/hotels.json');
const destinations = require('./data/destinations.json');

// ── Middleware ────────────────────────────────────────────────────
app.use(cors());                          // allow requests from frontend
app.use(express.json());                  // parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // serve HTML/CSS/JS

// ── Helper: normalise string for comparison ───────────────────────
const norm = str => (str || '').toLowerCase().trim();

// ── POST /api/hotels/search ───────────────────────────────────────
/**
 * Request body (all fields optional):
 * {
 *   destination:      "Jaipur",
 *   checkIn:          "2025-11-01",
 *   checkOut:         "2025-11-05",
 *   guests:           2,
 *   maxPrice:         8000,
 *   freeCancellation: true,
 *   poolIncluded:     false,
 *   tags:             ["Eco-Certified", "Hidden Gem"],
 *   amenities:        ["WiFi", "Pool"],
 *   stars:            [4, 5],
 *   sortBy:           "best_value"   // price_asc | price_desc | rating | eco_score | best_value
 * }
 *
 * Response:
 * {
 *   hotels: [...],
 *   total:  12,
 *   filters: { ...applied filters echoed back }
 * }
 */
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
    } = req.body;

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

    // ── Filter ──────────────────────────────────────────────────
    let results = hotels.filter(hotel => {

      // Only return available hotels
      if (!hotel.available) return false;

      // ── Destination: match city, state, or region ────────────
      if (destination) {
        const d = norm(destination);
        const matchCity  = norm(hotel.location.city).includes(d);
        const matchState = norm(hotel.location.state).includes(d);
        if (!matchCity && !matchState) return false;
      }

      // ── Max price ────────────────────────────────────────────
      if (maxPrice && hotel.pricePerNight > maxPrice) return false;

      // ── Free cancellation ────────────────────────────────────
      if (freeCancellation === true && !hotel.freeCancellation) return false;

      // ── Pool included ────────────────────────────────────────
      if (poolIncluded === true) {
        const hasPool = hotel.amenities.some(a => norm(a).includes('pool'))
                     || hotel.tags.some(t => norm(t).includes('pool'));
        if (!hasPool) return false;
      }

      // ── Tags (hotel must have ALL requested tags) ────────────
      if (tags && tags.length > 0) {
        const hotelTags = hotel.tags.map(norm);
        const allMatch = tags.every(tag => hotelTags.includes(norm(tag)));
        if (!allMatch) return false;
      }

      // ── Amenities (hotel must have ALL requested amenities) ──
      if (amenities && amenities.length > 0) {
        const hotelAmenities = hotel.amenities.map(norm);
        const allMatch = amenities.every(a => hotelAmenities.some(ha => ha.includes(norm(a))));
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

    // ── Respond ──────────────────────────────────────────────────
    res.json({
      hotels:  results,
      total:   results.length,
      filters: {          // echo back what was applied (useful for frontend debugging)
        destination:      destination || null,
        checkIn:          checkIn     || null,
        checkOut:         checkOut    || null,
        guests:           guests      || null,
        maxPrice:         maxPrice    || null,
        freeCancellation: freeCancellation || false,
        poolIncluded:     poolIncluded     || false,
        tags:             tags       || [],
        amenities:        amenities  || [],
        stars:            stars      || [],
        sortBy,
      },
    });

  } catch (err) {
    console.error('Error in /api/hotels/search:', err);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
});

// ── GET /api/hotels/:id ───────────────────────────────────────────
// Fetch a single hotel by ID
app.get('/api/hotels/:id', (req, res) => {
  const hotel = hotels.find(h => h.id === req.params.id);
  if (!hotel) return res.status(404).json({ error: true, message: 'Hotel not found' });
  res.json(hotel);
});

// ── GET /api/hotels ───────────────────────────────────────────────
// Return all hotels (no filters)
app.get('/api/hotels', (req, res) => {
  res.json({ hotels, total: hotels.length });
});

// ── GET /api/destinations ─────────────────────────────────────────
app.get('/api/destinations', (req, res) => {
  const { category, badge, region } = req.query;
  let results = destinations;
  if (category) results = results.filter(d => d.categories.map(norm).includes(norm(category)));
  if (badge)    results = results.filter(d => d.badges.map(norm).includes(norm(badge)));
  if (region)   results = results.filter(d => norm(d.region).includes(norm(region)));
  res.json({ destinations: results, total: results.length });
});

// ── GET /api/destinations/:id ─────────────────────────────────────
app.get('/api/destinations/:id', (req, res) => {
  const dest = destinations.find(d => d.id === req.params.id);
  if (!dest) return res.status(404).json({ error: true, message: 'Destination not found' });
  res.json(dest);
});

// ── GET /api/stats ────────────────────────────────────────────────
// Dashboard stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    totalHotels:       hotels.length,
    totalDestinations: destinations.length,
    totalPackages:     840,
    totalGuides:       320,
    bookingsThisWeek:  3241,
    revenueThisMonth:  '₹2.4Cr',
    topDestinations:   destinations.slice(0, 5).map(d => ({
      name:    d.name,
      state:   d.state,
      rating:  d.rating,
      packages: d.totalPackages,
    })),
  });
});

// ── Sort helper ───────────────────────────────────────────────────
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

// ── 404 fallback ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: true, message: `Route ${req.method} ${req.path} not found` });
});

// ── Start server ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`WanderSmart server running at http://localhost:${PORT}`);
  console.log(`  POST /api/hotels/search  — filtered hotel search`);
  console.log(`  GET  /api/hotels         — all hotels`);
  console.log(`  GET  /api/hotels/:id     — single hotel`);
  console.log(`  GET  /api/destinations   — all destinations`);
  console.log(`  GET  /api/stats          — dashboard stats`);
});

module.exports = app;

// ── Tours routes (appended) ───────────────────────────────────────
const tours = require('./data/tours.json');

// GET /api/tours  — optional ?category= filter
app.get('/api/tours', (req, res) => {
  const { category } = req.query;
  let results = tours.filter(t => t.available);
  if (category && category !== 'all') {
    results = results.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }
  res.json({ tours: results, total: results.length });
});

// GET /api/tours/:id
app.get('/api/tours/:id', (req, res) => {
  const tour = tours.find(t => t.id === req.params.id);
  if (!tour) return res.status(404).json({ error: true, message: 'Tour not found' });
  res.json(tour);
});

// GET /api/guides
app.get('/api/guides', (req, res) => {
  res.json({
    guides: [
      { id: 'G001', initials: 'RK', name: 'Ravi Kumar',  languages: 'Hindi, English', specialty: 'Rajasthan specialist', rating: 4.9, tours: 312, color: '#1D9E75' },
      { id: 'G002', initials: 'PM', name: 'Priya Menon', languages: 'Malayalam, English', specialty: 'Kerala expert',       rating: 4.8, tours: 185, color: '#378ADD' },
      { id: 'G003', initials: 'AS', name: 'Arjun Singh', languages: 'Hindi, English', specialty: 'Himalaya trekker',      rating: 4.9, tours: 247, color: '#BA7517' }
    ]
  });
});
