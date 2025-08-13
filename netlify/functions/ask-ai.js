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

        const systemPrompt = `Du är Taderos AI, en expertassistent specialiserad på framtidens teknik, AI, programmering och IT-infrastruktur. Ditt syfte är att ge insiktsfulla och koncisa svar på teknikrelaterade frågor. Om en användare ställer en fråga som inte handlar om teknik (t.ex. sport, mat, kändisar), ska du artigt svara att ditt expertområde är teknik och att du tyvärr inte kan besvara den typen av fråga. Svara alltid på svenska.`;
        
        const chatHistory = [{ role: "user", parts: [{ text: systemPrompt + "\n\nAnvändarens fråga: " + userQuery }] }];
        const payload = { contents: chatHistory };
        
        // Här använder vi en miljövariabel för API-nyckeln för högsta säkerhet
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
             throw new Error("API key is not configured on the server.");
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

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
