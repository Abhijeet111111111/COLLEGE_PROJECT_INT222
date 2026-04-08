export function getAllGuides(req, res) {
    res.json({
        guides: [
            { id: 'G001', initials: 'RK', name: 'Ravi Kumar', languages: 'Hindi, English', specialty: 'Rajasthan specialist', rating: 4.9, tours: 312, color: '#1D9E75' },
            { id: 'G002', initials: 'PM', name: 'Priya Menon', languages: 'Malayalam, English', specialty: 'Kerala expert', rating: 4.8, tours: 185, color: '#378ADD' },
            { id: 'G003', initials: 'AS', name: 'Arjun Singh', languages: 'Hindi, English', specialty: 'Himalaya trekker', rating: 4.9, tours: 247, color: '#BA7517' }
        ]
    });
}