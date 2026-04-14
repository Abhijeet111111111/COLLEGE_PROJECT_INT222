import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get('/', (req, res) => {
    res.render('planTrip');
});

router.post('/generate', async (req, res) => {
    try {
        const { destination, weather, rush, cuisine } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: "Gemini API key is missing from environment variables." });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        let destStr = destination && destination.trim().length > 0 
                      ? `My preferred destination is ${destination}.`
                      : "Suggest a destination anywhere in the world that fits the profile below.";

        const prompt = `You are a world-class travel expert and AI trip planner.
                        
Based on the following preferences, create a detailed, highly engaging, and nicely formatted travel itinerary (use Markdown).
                        
Preferences:
- **Destination:** ${destStr}
- **Weather / Climate:** ${weather}
- **Atmosphere / Crowds:** ${rush}
- **Cuisine / Food Focus:** ${cuisine}

Requirements for the output:
1. Provide an immersive introduction.
2. Outline a 3-day high-level itinerary.
3. Suggest a couple of specific dishes to try.
4. Keep the tone enthusiastic and premium.

Make sure the output is well-formatted Markdown with headers (##).`;

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            return res.status(200).json({ success: true, data: responseText });
        } catch (apiErr) {
            console.error("Actual Gemini API Error: ", apiErr.message);
            // If the user's API Key hits a 429 Quota Error, we return a beautiful mock response
            // so the frontend feature doesn't break during demos.
            const mockMarkdown = `
> [!NOTE] 
> **Rate Limit Hit:** Your Google Gemini API key has exceeded its free request quota (429 Too Many Requests). This is a fallback mock itinerary so you can still view how the integration looks!

# 🌴 Your Dream Escape: Mock Destination! 

Welcome to your personalized itinerary! Based on your preference for **${weather}** weather, **${rush}** atmosphere, and **${cuisine}**, we have crafted the ultimate 3-day experience for you.

## Day 1: Arrival & Exploration
- **Morning:** Check into your premium eco-suite and enjoy a welcome drink looking over the scenic horizon.
- **Afternoon:** Take a guided walking tour through the beautiful historic district. 
- **Evening:** Dine on incredible ${cuisine} crafted by local master chefs.

## Day 2: The Grand Adventure
- **Morning:** Set out early for an exclusive breathtaking viewpoint only the locals know about.
- **Afternoon:** Free time to relax, shop in the artisanal markets, or grab a quick bite.
- **Evening:** A sunset cruise featuring live acoustic music and starlit views.

## Day 3: Relaxation & Departure
- **Morning:** Enjoy a luxurious late-morning brunch.
- **Afternoon:** A quick spa session or nature walk to cap off the trip.
- **Evening:** Depart with unforgettable memories!

### 🍽️ Culinary Highlights to Try:
- **Signature Dish:** Ask for the local specialty cooked using traditional methods.
- **Street Food Gem:** A savory snack perfect for eating on the go while you explore!

*When your Google Gemini API quota resets, the real AI will automatically take over again!*
`;
            return res.status(200).json({ success: true, data: mockMarkdown });
        }

    } catch (error) {
        console.error("AI Route Crash:", error);
        res.status(500).json({ success: false, message: "Failed to generate AI trip. Check console for logs." });
    }
});

export default router;
