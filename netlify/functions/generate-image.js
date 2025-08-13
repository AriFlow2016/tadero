// Serverless function för att säkert anropa Gemini API för bildgenerering

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // En dynamisk prompt för att få unika bilder varje gång
        const keywords = ["data streams", "neural network", "glowing circuits", "digital consciousness", "abstract code", "quantum computing", "cybernetic interface"];
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        const prompt = `Abstract futuristic technology, ${randomKeyword}, glowing neon blue and dark blue lines on a black background, high resolution, cinematic, epic, digital art.`;

        const payload = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                responseModalities: ['IMAGE', 'TEXT'] // KORRIGERAD
            },
        };
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
             throw new Error("API key is not configured on the server.");
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("API Error:", response.status, response.statusText, errorBody);
            return { statusCode: response.status, body: `API Error: ${response.statusText}` };
        }

        const result = await response.json();
        const base64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

        if (base64Data) {
            return {
                statusCode: 200,
                body: JSON.stringify({ image: base64Data })
            };
        } else {
            console.error("Inget bilddata i API-svaret:", result);
            return { statusCode: 500, body: 'Could not generate an image from the AI model.' };
        }

    } catch (error) {
        console.error("Function Error:", error);
        return { statusCode: 500, body: `Internal Server Error: ${error.message}` };
    }
};
