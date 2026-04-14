import dotenv from 'dotenv';
dotenv.config();

async function run() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        
        if (data.models) {
             const models = data.models.map(m => m.name);
             console.log("AVAILABLE MODELS:", models);
        } else {
             console.log("API Error:", data);
        }
    } catch(err) {
        console.log("Failed:", err.message);
    }
}
run();
