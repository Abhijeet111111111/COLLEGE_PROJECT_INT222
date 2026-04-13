import fs from 'fs'
import sortHotels from '../utils/sortHotels.js';
import userModel from '../models/userModel.js'
import hotelModel from '../models/hotelModel.js'
import bookingModel from '../models/bookingModel.js'

export function renderHotelPage(req, res) {
    res.render('hotelsPage');
}


export async function hotelBook(req, res) {
    const hotel = await hotelModel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ error: true, message: 'Hotel not found' });

    const { bookingRef, nights, totalAmount, guest, paymentMethod, bookedAt } = req.body;

    const required = ['bookingRef', 'nights', 'totalAmount', 'guest', 'paymentMethod'];
    const missing = required.filter(k => req.body[k] === undefined);
    if (missing.length)
        return res.status(400).json({ error: true, message: `Missing: ${missing.join(', ')}` });

    const gRequired = ['name', 'email', 'phone', 'guests', 'checkIn', 'checkOut'];
    const gMissing = gRequired.filter(k => !guest[k]);
    if (gMissing.length)
        return res.status(400).json({ error: true, message: `Missing guest fields: ${gMissing.join(', ')}` });

    const booking = {
        bookingRef,
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelCity: hotel.location.city,
        hotelState: hotel.location.state,
        pricePerNight: hotel.pricePerNight,
        nights: Number(nights),
        totalAmount: Number(totalAmount),
        paymentMethod,
        guest: {
            name: guest.name, email: guest.email, phone: guest.phone,
            guests: guest.guests, checkIn: guest.checkIn, checkOut: guest.checkOut,
            requests: guest.requests || null
        },
        status: 'confirmed',
        bookedAt: bookedAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
    };

    try {
        await bookingModel.create(booking)
        console.log(`[BOOKING] ${bookingRef} — ${hotel.name} — ${guest.name} — Rs${totalAmount}`);
    } catch (err) {
        console.error('Save failed:', err);
        return res.status(500).json({ error: true, message: 'Failed to save booking' });
    }

    res.status(201).json({ success: true, bookingRef, message: `Confirmed for ${guest.name} at ${hotel.name}`, booking });
}

export function getCityHotel(req, res) {
    const { city } = req.params
    const readF = fs.readFileSync('./hotels.json');
    const hotels = JSON.parse(readF);
    const results = hotels.filter(h =>
        h.location.city.toLowerCase() === city.toLowerCase()
    );
    // res.render('hotelDetails', { hotel: results })
    res.json({
        hotels: JSON.stringify(results)
    })
}

export async function getHotelById(req, res) {
    const hotel = await hotelModel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ error: true, message: 'Hotel not found' });
    res.json(hotel);
}

export async function searchHotel(req, res) {
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

        const hotels = await hotelModel.find({});

        // ── Filter ──────────────────────────────────────────────────
        let results = hotels.filter(hotel => {

            // Only return available hotels
            if (!hotel.available) return false;

            // ── Destination: match city, state, or region ────────────
            if (destination) {
                const d = (destination.toLowerCase());
                const matchCity = (hotel.location.city.toLowerCase()).includes(d);
                const matchState = (hotel.location.state.toLowerCase()).includes(d);
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
}