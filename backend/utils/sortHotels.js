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

export default sortHotels