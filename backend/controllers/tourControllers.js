import fs from 'fs';
import path from 'path';

export function renderTours(req, res) {
    res.render('tours');
}


function readTourBookings() {
    try { return JSON.parse(fs.readFileSync('./ToursBooked.json', 'utf8')); }
    catch { return []; }
}
function writeTourBookings(data) {
    fs.writeFileSync("./ToursBooked.json", JSON.stringify(data, null, 2), 'utf8');
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

export function handleTourBooking(req, res) {

    const readF = fs.readFileSync('./tours.json','utf-8');
    const tours = JSON.parse(readF);

    console.log(tours);

    const tour = tours.find(t => t.id === req.params.id);
    if (!tour) {
        return res.status(404).json({ error: true, message: `Tour ${req.params.id} not found` });
    }

    const {
        bookingRef, tourId, tourTitle, tourCategory,
        days, nights, pricePerPerson, totalAmount,
        travellers, travelDate, paymentMethod, traveller, bookedAt,
    } = req.body;

    /* ── Validate required top-level fields ──────────────────── */
    const required = ['bookingRef', 'tourId', 'totalAmount', 'travellers', 'travelDate', 'paymentMethod', 'traveller'];
    const missing = required.filter(k => req.body[k] === undefined || req.body[k] === null || req.body[k] === '');
    if (missing.length) {
        return res.status(400).json({ error: true, message: `Missing fields: ${missing.join(', ')}` });
    }

    /* ── Validate traveller sub-object ───────────────────────── */
    const travellerRequired = ['name', 'email', 'phone'];
    const travellerMissing = travellerRequired.filter(k => !traveller[k]);
    if (travellerMissing.length) {
        return res.status(400).json({ error: true, message: `Missing traveller fields: ${travellerMissing.join(', ')}` });
    }

    /* ── Build booking record ─────────────────────────────────── */
    const booking = {
        bookingRef,
        tourId: tour.id,
        tourTitle: tour.title,
        tourCategory: tour.category,
        days: tour.days,
        nights: tour.nights,
        pricePerPerson: tour.price,
        totalAmount: Number(totalAmount),
        travellers,
        travelDate,
        paymentMethod,
        traveller: {
            name: traveller.name,
            email: traveller.email,
            phone: traveller.phone,
            requests: traveller.requests || null,
        },
        status: 'confirmed',
        bookedAt: bookedAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
    };

    /* ── Save to ToursBooked.json ─────────────────────────────── */
    try {
        const all = readTourBookings();
        all.push(booking);
        writeTourBookings(all);
        console.log(`[TOUR BOOKING] ${bookingRef} — ${tour.title} — ${traveller.name} — ₹${totalAmount}`);
    } catch (err) {
        console.error('Failed to save tour booking:', err);
        return res.status(500).json({ error: true, message: 'Failed to save booking record' });
    }

    res.status(201).json({
        success: true,
        bookingRef,
        message: `Tour booking confirmed for ${traveller.name} — ${tour.title}`,
        booking,
    });

}