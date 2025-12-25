// Serverless function för att säkert anropa Gemini API från Tadero.se

exports.handler = async function(event, context) {
    // Säkerställ att anropet är ett POST-anrop
    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: 'Method Not Allowed' }) 
        };
    }

    try {
        // Kontrollera att det finns data i anropet
        if (!event.body) {
            return { 
                statusCode: 400, 
                body: JSON.stringify({ error: 'Ingen data skickades i anropet.' }) 
            };
        }

        const { userQuery } = JSON.parse(event.body);

        if (!userQuery) {
            return { 
                statusCode: 400, 
                body: JSON.stringify({ error: 'Frågan (userQuery) saknas.' }) 
            };
        }

        // Systeminstruktion som definierar AI:ns personlighet och kunskapsområde
        const systemPrompt = `Du är Taderos AI, en expertassistent för Tadero – ett konsultbolag inom framtidens teknik. 
        Ditt fokus är AI, IT-infrastruktur och systemutveckling. 
        Svara professionellt, inspirerande och kortfattat på svenska. 
        Om någon frågar vem du är, svara att du är Taderos digitala assistent.`;
        
        const payload = {
            contents: [{
                parts: [{ text: `${systemPrompt}\n\nAnvändarens fråga: ${userQuery}` }]
            }]
        };
        
        // Hämtar API-nyckeln från Netlifys miljövariabler (Environment Variables)
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
             console.error("FEL: Miljövariabeln GEMINI_API_KEY saknas i Netlify.");
             return { 
                statusCode: 500, 
                body: JSON.stringify({ error: "Serverkonfiguration saknas (API-nyckel)." }) 
             };
        }

        // Vi använder gemini-1.5-flash som är den mest stabila modellen för detta ändamål
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Google API Felmeddelande:", result);
            return { 
                statusCode: response.status, 
                body: JSON.stringify({ error: "Kunde inte kommunicera med AI-tjänsten." }) 
            };
        }

        // Extraherar det genererade textsvaret från Googles JSON-struktur
        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts[0].text) {
            const aiResponse = result.candidates[0].content.parts[0].text;
            return {
                statusCode: 200,
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*" // Tillåter anrop från din domän
                },
                body: JSON.stringify({ response: aiResponse })
            };
        } else {
            console.error("Oväntat svar från API:", result);
            return { 
                statusCode: 500, 
                body: JSON.stringify({ error: 'AI:n returnerade ett tomt svar.' }) 
            };
        }

    } catch (error) {
        console.error("Systemfel i funktionen:", error);
        return { 
            statusCode: 500, 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: `Ett internt serverfel uppstod: ${error.message}` }) 
        };
    }
};