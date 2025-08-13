// Serverless function för att säkert anropa Imagen API

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // En dynamisk prompt för att få unika bilder varje gång
        const keywords = ["data streams", "neural network", "glowing circuits", "digital consciousness", "abstract code"];
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        const prompt = `Abstract futuristic technology, ${randomKeyword}, glowing neon blue lines on a dark background, high resolution, cinematic, epic.`;

        const payload = {
            instances: [{ prompt: prompt }],
            parameters: { "sampleCount": 1 }
        };
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
             throw new Error("API key is not configured on the server.");
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error("API Error:", response.statusText);
            return { statusCode: response.status, body: `API Error: ${response.statusText}` };
        }

        const result = await response.json();

        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            return {
                statusCode: 200,
                body: JSON.stringify({ image: result.predictions[0].bytesBase64Encoded })
            };
        } else {
            return { statusCode: 500, body: 'Could not generate an image from the AI model.' };
        }

    } catch (error) {
        console.error("Function Error:", error);
        return { statusCode: 500, body: `Internal Server Error: ${error.message}` };
    }
};
