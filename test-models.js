const apiKey = 'AIzaSyCvTAxxFvfVDBqInFIhCtAw77a7moHHzKg';
const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite-preview-02-05',
    'gemini-2.5-flash'
];

async function testModel(modelName) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    console.log(`Testing ${modelName}...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ SUCCESS: ${modelName} is working!`);
            return true;
        } else {
            console.log(`❌ FAILED: ${modelName}`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${data.error?.message || JSON.stringify(data)}`);
            return false;
        }
    } catch (error) {
        console.error(`   Network Error on ${modelName}:`, error.message);
        return false;
    }
}

async function runTests() {
    for (const model of models) {
        if (await testModel(model)) {
            console.log(`\n!!! FOUND WORKING MODEL: ${model} !!!`);
            break;
        }
    }
}

runTests();
