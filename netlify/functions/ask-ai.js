// Serverless function för att säkert anropa Gemini API

exports.handler = async function(event, context) {
    // Tillåt endast POST-anrop
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { userQuery } = JSON.parse(event.body);

        if (!userQuery) {
            return { statusCode: 400, body: 'Bad Request: userQuery is required' };
        }

        // Systeminstruktion för att ge AI:n en personlighet
        const systemPrompt = `Du är Taderos AI, en expertassistent specialiserad på framtidens teknik, AI, programmering och IT-infrastruktur. Ditt syfte är att ge insiktsfulla och koncisa svar på teknikrelaterade frågor. Svara alltid på svenska.`;
        
        const payload = {
            contents: [{
                parts: [{ text: systemPrompt + "\n\nAnvändarens fråga: " + userQuery }]
            }]
        };
        
        // Hämtar API-nyckeln från Netlifys miljövariabler
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
             throw new Error("API key is not configured on the server.");
        }

        // Vi använder gemini-1.5-flash som är stabil och snabb
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("API Error:", errorData);
            return { statusCode: response.status, body: `API Error: ${response.statusText}` };
        }

        const result = await response.json();

        // Extraherar textsvaret från Googles API-struktur
        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts[0].text) {
            const aiResponse = result.candidates[0].content.parts[0].text;
            return {
                statusCode: 200,
                body: JSON.stringify({ response: aiResponse })
            };
        } else {
            return { statusCode: 500, body: 'Could not generate a response from the AI model.' };
        }

    } catch (error) {
        console.error("Function Error:", error);
        return { statusCode: 500, body: `Internal Server Error: ${error.message}` };
    }
};