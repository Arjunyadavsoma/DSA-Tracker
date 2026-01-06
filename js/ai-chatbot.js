// AI Chatbot - Fixed Version
class AIChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.currentQuestion = null;
        this.apiKey = null;
        this.isStreaming = false;
        this.init();
    }

    init() {
        console.log('🤖 Initializing AI Chatbot...');
        
        // Inject UI first
        this.injectStyles();
        this.injectHTML();
        this.attachEventListeners();
        
        // Then load async data
        this.loadAPIKey();
        this.capturePageContext();
        
        console.log('✅ Chatbot UI ready');
    }

    loadAPIKey() {
        // For Next.js/Vercel
        this.apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
        
        // Fallback to localStorage
        if (!this.apiKey) {
            this.apiKey = localStorage.getItem('groq_api_key');
        }
        
        if (!this.apiKey) {
            console.warn('⚠️ No API key found');
            setTimeout(() => this.showAPIKeyPrompt(), 2000);
        } else {
            console.log('✅ API key loaded');
        }
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
                console.log('📍 Context captured:', this.currentQuestion);
            }
        }, 1000);
    }

    injectStyles() {
        if (document.getElementById('ai-chatbot-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'ai-chatbot-styles';
        style.textContent = `
            .ai-chatbot-fab {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                border-radius: 50%;
                display: flex !important;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
                transition: all 0.3s;
                z-index: 99998 !important;
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
                position: fixed !important;
                bottom: 100px !important;
                right: 2rem !important;
                width: 420px;
                height: 600px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                display: none !important;
                flex-direction: column;
                z-index: 99999 !important;
                overflow: hidden;
            }
            .ai-chatbot-overlay.open {
                display: flex !important;
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
            }
            @media (max-width: 768px) {
                .ai-chatbot-overlay {
                    bottom: 90px !important;
                    right: 1rem !important;
                    left: 1rem !important;
                    width: auto !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    injectHTML() {
        if (document.getElementById('ai-chatbot-fab')) return;
        
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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 20px; height: 20px; color: white;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="ai-chatbot-messages" id="ai-chatbot-messages">
                    <div class="welcome-message">
                        <h4>👋 Hi! I'm your DSA AI Tutor</h4>
                        <p style="color: #6b7280; font-size: 0.9rem;">Ask me anything!</p>
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
        console.log('✅ HTML injected');
    }

    attachEventListeners() {
        const fab = document.getElementById('ai-chatbot-fab');
        const closeBtn = document.getElementById('ai-chatbot-close');
        const sendBtn = document.getElementById('ai-chatbot-send');
        const input = document.getElementById('ai-chatbot-input');
        
        if (fab) {
            fab.addEventListener('click', () => {
                console.log('FAB clicked');
                this.toggleChat();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeChat());
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (input) {
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
        }
        
        document.getElementById('ai-chatbot-messages')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action-btn')) {
                this.handleQuickAction(e.target.dataset.prompt);
            }
        });
        
        console.log('✅ Event listeners attached');
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const overlay = document.getElementById('ai-chatbot-overlay');
        
        console.log('Toggling chat. isOpen:', this.isOpen);
        
        if (this.isOpen) {
            overlay.style.display = 'flex';
            setTimeout(() => {
                overlay.classList.add('open');
                document.getElementById('ai-chatbot-input')?.focus();
            }, 10);
        } else {
            overlay.classList.remove('open');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
    }

    closeChat() {
        this.isOpen = false;
        const overlay = document.getElementById('ai-chatbot-overlay');
        overlay.classList.remove('open');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }

    handleQuickAction(type) {
        const prompts = {
            'explain': this.currentQuestion 
                ? `Explain "${this.currentQuestion.title}"`
                : 'How to approach DSA problems?',
            'hints': this.currentQuestion
                ? `Give hints for "${this.currentQuestion.title}"`
                : 'Common DSA patterns?',
            'pattern': this.currentQuestion
                ? `Pattern for "${this.currentQuestion.title}"?`
                : 'Explain DSA patterns',
            'complexity': this.currentQuestion
                ? `Time complexity for "${this.currentQuestion.title}"?`
                : 'Explain Big O'
        };
        this.sendMessage(prompts[type]);
    }

    async sendMessage(customPrompt = null) {
        if (!this.apiKey) {
            this.addMessage('❌ API key not configured', 'ai');
            return;
        }

        if (this.isStreaming) return;

        const input = document.getElementById('ai-chatbot-input');
        const sendBtn = document.getElementById('ai-chatbot-send');
        const message = customPrompt || input.value.trim();
        
        if (!message) return;

        input.value = '';
        input.style.height = 'auto';
        sendBtn.disabled = true;
        this.isStreaming = true;

        this.addMessage(message, 'user');

        try {
            await this.streamGroqAPI(message);
        } catch (error) {
            this.addMessage(`Error: ${error.message}`, 'ai');
        } finally {
            sendBtn.disabled = false;
            this.isStreaming = false;
        }
    }

    async streamGroqAPI(userMessage) {
        let systemPrompt = `You are an expert DSA tutor.`;
        
        if (this.currentQuestion) {
            systemPrompt += `\nContext: "${this.currentQuestion.title}" (${this.currentQuestion.difficulty})`;
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            ...this.messages.slice(-6).map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
            })),
            { role: 'user', content: userMessage }
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages,
                temperature: 0.7,
                max_tokens: 2048,
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error(`API Error ${response.status}`);
        }

        await this.handleStream(response);
    }

    async handleStream(response) {
        const container = document.getElementById('ai-chatbot-messages');
        
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
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
                    
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            const content = data.choices[0]?.delta?.content;
                            
                            if (content) {
                                accumulatedText += content;
                                bubble.innerHTML = this.formatMessage(accumulatedText) + 
                                    '<span class="streaming-cursor"></span>';
                                container.scrollTop = container.scrollHeight;
                            }
                        } catch (e) {}
                    }
                }
            }

            bubble.querySelector('.streaming-cursor')?.remove();
            this.messages.push({ role: 'assistant', content: accumulatedText });

        } catch (error) {
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
            <div class="message-bubble">${this.formatMessage(content)}</div>
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
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing chatbot...');
        new AIChatbot();
    });
} else {
    console.log('DOM ready, initializing chatbot...');
    new AIChatbot();
}
