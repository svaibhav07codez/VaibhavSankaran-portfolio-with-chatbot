const apiKey = 'AIzaSyCvTAxxFvfVDBqInFIhCtAw77a7moHHzKg';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

async function testKey() {
    console.log('Testing Gemini Flash Latest...');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'Hello!' }] }]
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('SUCCESS: API Key is valid!');
            console.log('Response:', data.candidates?.[0]?.content?.parts?.[0]?.text);
        } else {
            console.error('FAILURE: API Key Error');
            console.error('Status:', response.status);
            console.error('Error Message:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
}

testKey();
