// AI Chatbot with Streaming - Direct API Version
class AIChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.currentQuestion = null;
        this.apiKey = this.loadAPIKey();
        this.isStreaming = false;
        this.init();
    }

    loadAPIKey() {
        let key = localStorage.getItem('groq_api_key');
        
        if (!key) {
            setTimeout(() => {
                this.showAPIKeyPrompt();
            }, 2000);
        }
        
        return key;
    }

    showAPIKeyPrompt() {
        const existingPrompt = document.getElementById('api-key-prompt');
        if (existingPrompt) return;

        const promptHTML = `
            <div id="api-key-prompt" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 2rem;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 400px;
                width: 90%;
            ">
                <h3 style="margin: 0 0 1rem 0; color: #1f2937;">🔑 Setup AI Assistant</h3>
                <p style="color: #6b7280; font-size: 0.9rem; margin-bottom: 1rem;">
                    To use the AI chatbot, you need a free Groq API key.
                </p>
                <ol style="color: #6b7280; font-size: 0.85rem; margin: 1rem 0; padding-left: 1.5rem;">
                    <li>Visit <a href="https://console.groq.com" target="_blank" style="color: #6366f1;">console.groq.com</a></li>
                    <li>Sign up (free)</li>
                    <li>Go to API Keys</li>
                    <li>Create new key</li>
                    <li>Paste it below</li>
                </ol>
                <input 
                    type="password" 
                    id="api-key-input" 
                    placeholder="Enter your Groq API key..."
                    style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 2px solid #e5e7eb;
                        border-radius: 8px;
                        font-size: 0.9rem;
                        margin-bottom: 1rem;
                        box-sizing: border-box;
                    "
                />
                <div style="display: flex; gap: 0.5rem;">
                    <button id="save-api-key" style="
                        flex: 1;
                        padding: 0.75rem;
                        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Save Key</button>
                    <button id="cancel-api-key" style="
                        padding: 0.75rem 1rem;
                        background: #f3f4f6;
                        color: #6b7280;
                        border: none;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Cancel</button>
                </div>
            </div>
            <div id="api-key-overlay" style="
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
            "></div>
        `;

        document.body.insertAdjacentHTML('beforeend', promptHTML);

        document.getElementById('save-api-key').addEventListener('click', () => {
            const key = document.getElementById('api-key-input').value.trim();
            if (key) {
                localStorage.setItem('groq_api_key', key);
                this.apiKey = key;
                document.getElementById('api-key-prompt').remove();
                document.getElementById('api-key-overlay').remove();
                alert('✅ API key saved! You can now use the AI chatbot.');
            } else {
                alert('Please enter a valid API key');
            }
        });

        document.getElementById('cancel-api-key').addEventListener('click', () => {
            document.getElementById('api-key-prompt').remove();
            document.getElementById('api-key-overlay').remove();
        });
    }

    init() {
        console.log('🤖 Initializing AI Chatbot with Streaming...');
        this.capturePageContext();
        this.injectStyles();
        this.injectHTML();
        this.attachEventListeners();
        console.log('✅ Chatbot initialized');
    }

    capturePageContext() {
        setTimeout(() => {
            const questionTitle = document.getElementById('question-title')?.textContent;
            const difficulty = document.getElementById('difficulty-badge')?.textContent;
            const topic = document.getElementById('topic-badge')?.textContent;

            if (questionTitle) {
                this.currentQuestion = {
                    title: questionTitle,
                    difficulty: difficulty || 'Unknown',
                    topic: topic || 'DSA'
                };
                console.log('📍 Context:', this.currentQuestion);
            }
        }, 1500);
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ai-chatbot-fab {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
                transition: all 0.3s;
                z-index: 9998;
                border: none;
            }
            .ai-chatbot-fab:hover {
                transform: scale(1.1);
            }
            .ai-chatbot-fab svg {
                width: 28px;
                height: 28px;
                color: white;
            }
            .ai-chatbot-overlay {
                position: fixed;
                bottom: 100px;
                right: 2rem;
                width: 420px;
                height: 600px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                display: none;
                flex-direction: column;
                z-index: 9999;
                overflow: hidden;
            }
            .ai-chatbot-overlay.open {
                display: flex;
                animation: slideIn 0.3s ease-out;
            }
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .ai-chatbot-header {
                background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                padding: 1.25rem 1.5rem;
                color: white;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .ai-chatbot-header h3 {
                font-size: 1.125rem;
                font-weight: 700;
                margin: 0;
            }
            .ai-chatbot-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .ai-chatbot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 1.5rem;
                background: #f9fafb;
            }
            .chat-message {
                margin-bottom: 1rem;
                animation: messageSlide 0.3s ease-out;
            }
            @keyframes messageSlide {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .chat-message.user {
                display: flex;
                justify-content: flex-end;
            }
            .chat-message.ai {
                display: flex;
                justify-content: flex-start;
            }
            .message-bubble {
                max-width: 80%;
                padding: 0.875rem 1.125rem;
                border-radius: 16px;
                font-size: 0.9rem;
                line-height: 1.6;
                word-wrap: break-word;
            }
            .chat-message.user .message-bubble {
                background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                color: white;
            }
            .chat-message.ai .message-bubble {
                background: white;
                color: #1f2937;
                border: 1px solid #e5e7eb;
            }
            .message-bubble code {
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 0.85em;
            }
            .message-bubble pre {
                background: #1f2937;
                color: #e5e7eb;
                padding: 0.75rem;
                border-radius: 8px;
                overflow-x: auto;
                margin: 0.5rem 0;
            }
            
            /* Streaming Cursor */
            .streaming-cursor {
                display: inline-block;
                width: 3px;
                height: 16px;
                background: linear-gradient(to bottom, #6366f1, #a855f7);
                margin-left: 2px;
                animation: blink 1s infinite;
                vertical-align: text-bottom;
            }
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            
            .typing-indicator {
                display: flex;
                gap: 0.25rem;
                padding: 0.875rem 1.125rem;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                width: fit-content;
            }
            .typing-dot {
                width: 8px;
                height: 8px;
                background: #6366f1;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
                30% { transform: translateY(-10px); opacity: 1; }
            }
            .ai-chatbot-input-container {
                padding: 1.25rem;
                background: white;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 0.75rem;
            }
            .ai-chatbot-input {
                flex: 1;
                padding: 0.875rem 1rem;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                font-size: 0.9rem;
                outline: none;
                resize: none;
                min-height: 44px;
                max-height: 120px;
                font-family: inherit;
            }
            .ai-chatbot-input:focus {
                border-color: #6366f1;
            }
            .ai-chatbot-send {
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                border: none;
                border-radius: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .ai-chatbot-send:disabled {
                opacity: 0.5;
            }
            .ai-chatbot-send svg {
                width: 20px;
                height: 20px;
                color: white;
            }
            .welcome-message {
                text-align: center;
                padding: 2rem 1rem;
            }
            .welcome-message h4 {
                font-size: 1.125rem;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }
            .quick-actions {
                display: grid;
                gap: 0.5rem;
                margin-top: 1rem;
            }
            .quick-action-btn {
                padding: 0.75rem 1rem;
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                cursor: pointer;
                font-size: 0.875rem;
                font-weight: 600;
                color: #4b5563;
                transition: all 0.2s;
                text-align: left;
            }
            .quick-action-btn:hover {
                border-color: #6366f1;
                color: #6366f1;
                background: #f0f0ff;
            }
            @media (max-width: 768px) {
                .ai-chatbot-overlay {
                    bottom: 90px;
                    right: 1rem;
                    left: 1rem;
                    width: auto;
                }
            }
        `;
        document.head.appendChild(style);
    }

    injectHTML() {
        const container = document.createElement('div');
        container.innerHTML = `
            <button class="ai-chatbot-fab" id="ai-chatbot-fab" title="AI Assistant">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
            </button>
            <div class="ai-chatbot-overlay" id="ai-chatbot-overlay">
                <div class="ai-chatbot-header">
                    <h3>🤖 DSA AI Tutor</h3>
                    <button class="ai-chatbot-close" id="ai-chatbot-close">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="ai-chatbot-messages" id="ai-chatbot-messages">
                    <div class="welcome-message">
                        <h4>👋 Hi! I'm your DSA AI Tutor</h4>
                        <p>Ask me anything about the problem you're viewing!</p>
                        <div class="quick-actions">
                            <button class="quick-action-btn" data-prompt="explain">💡 Explain this problem</button>
                            <button class="quick-action-btn" data-prompt="hints">🧩 Give me hints</button>
                            <button class="quick-action-btn" data-prompt="pattern">🎯 What pattern?</button>
                            <button class="quick-action-btn" data-prompt="complexity">⏱️ Time complexity</button>
                        </div>
                    </div>
                </div>
                <div class="ai-chatbot-input-container">
                    <textarea 
                        class="ai-chatbot-input" 
                        id="ai-chatbot-input" 
                        placeholder="Ask me anything..."
                        rows="1"
                    ></textarea>
                    <button class="ai-chatbot-send" id="ai-chatbot-send">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    attachEventListeners() {
        document.getElementById('ai-chatbot-fab').addEventListener('click', () => this.toggleChat());
        document.getElementById('ai-chatbot-close').addEventListener('click', () => this.closeChat());
        document.getElementById('ai-chatbot-send').addEventListener('click', () => this.sendMessage());
        
        const input = document.getElementById('ai-chatbot-input');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
        
        document.getElementById('ai-chatbot-messages').addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action-btn')) {
                this.handleQuickAction(e.target.dataset.prompt);
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const overlay = document.getElementById('ai-chatbot-overlay');
        if (this.isOpen) {
            overlay.classList.add('open');
            document.getElementById('ai-chatbot-input').focus();
        } else {
            overlay.classList.remove('open');
        }
    }

    closeChat() {
        this.isOpen = false;
        document.getElementById('ai-chatbot-overlay').classList.remove('open');
    }

    handleQuickAction(type) {
        const prompts = {
            'explain': this.currentQuestion 
                ? `Explain the approach to solve "${this.currentQuestion.title}" (${this.currentQuestion.difficulty} - ${this.currentQuestion.topic})`
                : 'How do I approach DSA problems?',
            'hints': this.currentQuestion
                ? `Give me hints for "${this.currentQuestion.title}" without spoiling`
                : 'What are common DSA patterns?',
            'pattern': this.currentQuestion
                ? `What pattern does "${this.currentQuestion.title}" use?`
                : 'Explain common DSA patterns',
            'complexity': this.currentQuestion
                ? `Explain time/space complexity for "${this.currentQuestion.title}"`
                : 'Explain Big O notation'
        };
        this.sendMessage(prompts[type]);
    }

    async sendMessage(customPrompt = null) {
        if (!this.apiKey) {
            this.showAPIKeyPrompt();
            return;
        }

        if (this.isStreaming) {
            console.log('⏳ Already streaming...');
            return;
        }

        const input = document.getElementById('ai-chatbot-input');
        const sendBtn = document.getElementById('ai-chatbot-send');
        const message = customPrompt || input.value.trim();
        
        if (!message) return;

        console.log('📤 Sending:', message);
        input.value = '';
        input.style.height = 'auto';
        sendBtn.disabled = true;
        this.isStreaming = true;

        this.addMessage(message, 'user');

        try {
            await this.streamGroqAPI(message);
        } catch (error) {
            console.error('❌ Error:', error);
            this.addMessage(`Sorry, error: ${error.message}`, 'ai');
        } finally {
            sendBtn.disabled = false;
            this.isStreaming = false;
        }
    }

    async streamGroqAPI(userMessage) {
        let systemPrompt = `You are an expert DSA tutor. Provide clear, well-structured explanations with examples.`;
        
        if (this.currentQuestion) {
            systemPrompt += `\n\nContext: User is viewing "${this.currentQuestion.title}" (${this.currentQuestion.difficulty}, ${this.currentQuestion.topic})`;
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            ...this.messages.slice(-6).map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
            })),
            { role: 'user', content: userMessage }
        ];

        console.log('🔄 Streaming from Groq API...');

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.7,
                max_tokens: 2048,
                stream: true  // Enable streaming
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `API Error ${response.status}`);
        }

        await this.handleStream(response);
    }

    async handleStream(response) {
        const container = document.getElementById('ai-chatbot-messages');
        
        // Create streaming message bubble
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message ai';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = '<span class="streaming-cursor"></span>';
        
        messageDiv.appendChild(bubble);
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    console.log('✅ Stream completed');
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
                    
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonStr = line.slice(6);
                            const data = JSON.parse(jsonStr);
                            const content = data.choices[0]?.delta?.content;
                            
                            if (content) {
                                accumulatedText += content;
                                bubble.innerHTML = this.formatMessage(accumulatedText) + 
                                    '<span class="streaming-cursor"></span>';
                                container.scrollTop = container.scrollHeight;
                            }
                        } catch (e) {
                            // Skip parsing errors
                        }
                    }
                }
            }

            // Remove cursor and save message
            bubble.querySelector('.streaming-cursor')?.remove();
            this.messages.push({ role: 'assistant', content: accumulatedText });
            console.log('✅ Message saved');

        } catch (error) {
            console.error('Stream error:', error);
            bubble.querySelector('.streaming-cursor')?.remove();
            throw error;
        }
    }

    addMessage(content, role) {
        const container = document.getElementById('ai-chatbot-messages');
        const welcome = container.querySelector('.welcome-message');
        if (welcome) welcome.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}`;
        messageDiv.innerHTML = `
            <div class="message-bubble">
                ${this.formatMessage(content)}
            </div>
        `;
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
        this.messages.push({ role, content });
    }

    formatMessage(content) {
        return content
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AIChatbot());
} else {
    new AIChatbot();
}
