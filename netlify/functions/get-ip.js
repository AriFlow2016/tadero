// Serverless function för att hämta besökarens IP-adress

exports.handler = async function(event, context) {
    // Hämtar IP-adressen från Netlifys request-header
    const clientIp = event.headers['x-nf-client-connection-ip'];

    return {
        statusCode: 200,
        body: JSON.stringify({ ip: clientIp || 'IP Not Found' })
    };
};
