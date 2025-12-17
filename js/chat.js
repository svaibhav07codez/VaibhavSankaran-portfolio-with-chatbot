document.addEventListener('DOMContentLoaded', () => {
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.querySelector('.typing-indicator');

    let chatHistory = [];

    // Toggle Chat Window
    chatBubble.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
        if (chatWindow.style.display === 'flex') {
            chatInput.focus();
            if (chatMessages.children.length === 0) {
                addMessage("Hi! I'm Vaibhav's AI assistant. How can I help you today?", 'bot');
            }
        }
    });

    chatClose.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });

    // Send Message
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatInput.value = '';

        showTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: chatHistory
                })
            });

            const data = await response.json();
            showTyping(false);

            if (data.reply) {
                addMessage(data.reply, 'bot');
                // Update history for context-aware conversation
                chatHistory.push({ role: 'user', parts: [{ text: text }] });
                chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });

                // Keep history manageable (last 10 exchanges)
                if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
            } else {
                addMessage("Sorry, I encountered an error. Please try again.", 'bot');
            }
        } catch (error) {
            console.error('Error:', error);
            showTyping(false);
            addMessage("Network error. Please check your connection.", 'bot');
        }
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', `${sender}-message`);
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping(show) {
        typingIndicator.style.display = show ? 'block' : 'none';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
