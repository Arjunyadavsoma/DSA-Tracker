// AI Chatbot - Complete with Enhanced Context Awareness for All Pages
class AIChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.currentQuestion = null;
        this.isStreaming = false;
        this.init();
    }

    init() {
        console.log('🤖 Initializing AI Chatbot...');
        this.injectStyles();
        this.injectHTML();
        this.attachEventListeners();
        this.capturePageContext();
        console.log('✅ Chatbot UI ready');
    }

    capturePageContext() {
        setTimeout(() => {
            // Try multiple selectors for different page types
            let questionTitle = null;
            let difficulty = null;
            let topic = null;
            let description = null;

            // Strategy 1: Question detail page selectors
            questionTitle = document.getElementById('question-title')?.textContent ||
                           document.querySelector('.question-title')?.textContent ||
                           document.querySelector('h1.problem-title')?.textContent;
            
            difficulty = document.getElementById('difficulty-badge')?.textContent ||
                        document.querySelector('.difficulty')?.textContent ||
                        document.querySelector('.difficulty-badge')?.textContent;
            
            topic = document.getElementById('topic-badge')?.textContent ||
                   document.querySelector('.topic')?.textContent ||
                   document.querySelector('.topic-badge')?.textContent;
            
            description = document.getElementById('question-description')?.textContent ||
                         document.querySelector('.question-description')?.textContent ||
                         document.querySelector('.problem-statement')?.textContent;

            // Strategy 2: QOTD page - look for daily question card
            if (!questionTitle) {
                const qotdCard = document.querySelector('.qotd-card') || 
                               document.querySelector('.daily-question') ||
                               document.querySelector('.question-of-the-day');
                
                if (qotdCard) {
                    questionTitle = qotdCard.querySelector('h2')?.textContent ||
                                  qotdCard.querySelector('h3')?.textContent ||
                                  qotdCard.querySelector('.question-title')?.textContent;
                    
                    difficulty = qotdCard.querySelector('.difficulty')?.textContent ||
                               qotdCard.querySelector('[class*="difficulty"]')?.textContent;
                    
                    topic = qotdCard.querySelector('.topic')?.textContent ||
                           qotdCard.querySelector('[class*="topic"]')?.textContent;
                    
                    description = qotdCard.querySelector('.description')?.textContent ||
                                qotdCard.querySelector('.problem-statement')?.textContent ||
                                qotdCard.querySelector('p')?.textContent;
                }
            }

            // Strategy 3: Random question page
            if (!questionTitle) {
                const randomCard = document.querySelector('.random-question') ||
                                 document.querySelector('.current-question');
                
                if (randomCard) {
                    questionTitle = randomCard.querySelector('h1, h2, h3')?.textContent;
                    difficulty = randomCard.querySelector('.difficulty')?.textContent;
                    topic = randomCard.querySelector('.topic')?.textContent;
                    description = randomCard.querySelector('.description, p')?.textContent;
                }
            }

            // Strategy 4: Questions list page - get first/focused question
            if (!questionTitle) {
                const focusedQuestion = document.querySelector('.question-card.active') ||
                                      document.querySelector('.question-item:first-child');
                
                if (focusedQuestion) {
                    questionTitle = focusedQuestion.querySelector('.question-name')?.textContent ||
                                  focusedQuestion.querySelector('h3, h4')?.textContent;
                    difficulty = focusedQuestion.querySelector('.difficulty')?.textContent;
                    topic = focusedQuestion.querySelector('.topic')?.textContent;
                }
            }

            if (questionTitle && questionTitle.trim()) {
                this.currentQuestion = {
                    title: questionTitle.trim(),
                    difficulty: difficulty?.trim() || 'Unknown',
                    topic: topic?.trim() || 'DSA',
                    description: description?.trim().substring(0, 500) || null
                };
                console.log('📍 Context captured:', this.currentQuestion);
            } else {
                console.log('⚠️ No question context found on this page');
                this.currentQuestion = null;
            }
        }, 1500); // Increased timeout for dynamic content
    }

    refreshContext() {
        // Re-capture context when chat opens (in case page changed)
        const questionTitle = document.getElementById('question-title')?.textContent || 
                            document.querySelector('h1')?.textContent ||
                            document.querySelector('.question-title')?.textContent ||
                            document.querySelector('.qotd-card h2')?.textContent ||
                            document.querySelector('.qotd-card h3')?.textContent;
        
        if (questionTitle && questionTitle.trim() !== this.currentQuestion?.title) {
            console.log('🔄 Refreshing context...');
            this.capturePageContext();
        }
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
                box-shadow: 0 12px 35px rgba(99, 102, 241, 0.5);
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
            .ai-chatbot-header > div h3 {
                font-size: 1.125rem;
                font-weight: 700;
                margin: 0;
            }
            #context-indicator {
                font-size: 0.75rem;
                opacity: 0.9;
                margin: 0.25rem 0 0 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 280px;
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
                transition: all 0.2s;
                flex-shrink: 0;
            }
            .ai-chatbot-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            .ai-chatbot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 1.5rem;
                background: #f9fafb;
            }
            .ai-chatbot-messages::-webkit-scrollbar {
                width: 6px;
            }
            .ai-chatbot-messages::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 3px;
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
                max-width: 85%;
                padding: 1rem 1.25rem;
                border-radius: 18px;
                font-size: 0.95rem;
                line-height: 1.7;
                word-wrap: break-word;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            .chat-message.user .message-bubble {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
            }
            .chat-message.ai .message-bubble {
                background: white;
                color: #1f2937;
                border: 1px solid #e5e7eb;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            /* Headers */
            .msg-h1, .msg-h2, .msg-h3 {
                margin: 1rem 0 0.75rem 0;
                font-weight: 700;
                line-height: 1.3;
                color: #1f2937;
            }
            .msg-h1 { font-size: 1.5rem; }
            .msg-h2 { font-size: 1.25rem; }
            .msg-h3 { font-size: 1.1rem; }
            
            /* Lists */
            .msg-ul, .msg-ol {
                margin: 0.75rem 0;
                padding-left: 1.5rem;
            }
            .msg-li, .msg-li-num {
                margin: 0.5rem 0;
                line-height: 1.6;
            }
            
            /* Links */
            .msg-link {
                color: #6366f1;
                text-decoration: none;
                border-bottom: 1px solid #6366f1;
                transition: all 0.2s;
            }
            .msg-link:hover {
                color: #4f46e5;
                border-bottom-color: #4f46e5;
            }
            
            /* Inline code */
            .inline-code {
                background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                color: #dc2626;
                padding: 3px 8px;
                border-radius: 6px;
                font-size: 0.9em;
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Courier New', monospace;
                font-weight: 500;
                border: 1px solid #e5e7eb;
            }
            .chat-message.user .inline-code {
                background: rgba(255, 255, 255, 0.25);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            /* Code blocks */
            .code-block-wrapper {
                margin: 1rem 0;
                border-radius: 12px;
                overflow: hidden;
                background: #1e293b;
                border: 1px solid #334155;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .code-block-header {
                background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
                padding: 0.75rem 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #475569;
            }
            .code-language {
                font-size: 0.75rem;
                font-weight: 600;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-family: 'SF Mono', monospace;
            }
            .copy-code-btn {
                background: rgba(148, 163, 184, 0.1);
                border: 1px solid rgba(148, 163, 184, 0.2);
                color: #94a3b8;
                padding: 0.4rem 0.75rem;
                border-radius: 6px;
                font-size: 0.75rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.35rem;
                transition: all 0.2s;
                font-weight: 500;
            }
            .copy-code-btn:hover {
                background: rgba(148, 163, 184, 0.2);
                border-color: rgba(148, 163, 184, 0.4);
                color: #cbd5e1;
            }
            .copy-code-btn svg {
                width: 14px;
                height: 14px;
            }
            .code-block-wrapper pre {
                background: #1e293b;
                color: #e2e8f0;
                padding: 1.25rem;
                margin: 0;
                overflow-x: auto;
                font-size: 0.875rem;
                line-height: 1.7;
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Courier New', monospace;
            }
            .code-block-wrapper pre::-webkit-scrollbar {
                height: 8px;
            }
            .code-block-wrapper pre::-webkit-scrollbar-track {
                background: #0f172a;
                border-radius: 4px;
            }
            .code-block-wrapper pre::-webkit-scrollbar-thumb {
                background: #475569;
                border-radius: 4px;
            }
            .code-block-wrapper code {
                background: transparent !important;
                padding: 0 !important;
                color: inherit !important;
                border: none !important;
            }
            
            /* Strong and emphasis */
            .message-bubble strong {
                font-weight: 700;
                color: #111827;
            }
            .chat-message.user .message-bubble strong {
                color: white;
            }
            .message-bubble em {
                font-style: italic;
                color: #4b5563;
            }
            .chat-message.user .message-bubble em {
                color: rgba(255, 255, 255, 0.9);
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
                transition: border-color 0.2s;
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
                transition: all 0.2s;
            }
            .ai-chatbot-send:hover:not(:disabled) {
                transform: scale(1.05);
            }
            .ai-chatbot-send:disabled {
                opacity: 0.5;
                cursor: not-allowed;
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
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
            }
            @media (max-width: 768px) {
                .ai-chatbot-overlay {
                    bottom: 90px !important;
                    right: 1rem !important;
                    left: 1rem !important;
                    width: auto !important;
                }
                .message-bubble {
                    max-width: 90%;
                    font-size: 0.9rem;
                }
                .code-block-wrapper pre {
                    font-size: 0.8rem;
                    padding: 1rem;
                }
                #context-indicator {
                    max-width: 200px;
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
                    <div>
                        <h3>🤖 DSA AI Tutor</h3>
                        <p id="context-indicator" style="display: none;"></p>
                    </div>
                    <button class="ai-chatbot-close" id="ai-chatbot-close">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 20px; height: 20px; color: white;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="ai-chatbot-messages" id="ai-chatbot-messages">
                    <div class="welcome-message">
                        <h4>👋 Hi! I'm your DSA AI Tutor</h4>
                        <p style="color: #6b7280; font-size: 0.9rem;">Ask me anything about DSA!</p>
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
        document.getElementById('ai-chatbot-fab')?.addEventListener('click', () => this.toggleChat());
        document.getElementById('ai-chatbot-close')?.addEventListener('click', () => this.closeChat());
        document.getElementById('ai-chatbot-send')?.addEventListener('click', () => this.sendMessage());
        
        const input = document.getElementById('ai-chatbot-input');
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        input?.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
        
        document.getElementById('ai-chatbot-messages')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action-btn')) {
                this.handleQuickAction(e.target.dataset.prompt);
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const overlay = document.getElementById('ai-chatbot-overlay');
        
        if (this.isOpen) {
            // Refresh context in case page changed
            this.refreshContext();
            
            overlay.style.display = 'flex';
            
            // Update context indicator
            setTimeout(() => {
                const indicator = document.getElementById('context-indicator');
                if (this.currentQuestion) {
                    indicator.textContent = `📖 ${this.currentQuestion.title}`;
                    indicator.style.display = 'block';
                } else {
                    indicator.textContent = '';
                    indicator.style.display = 'none';
                }
            }, 100);
            
            setTimeout(() => {
                overlay.classList.add('open');
                document.getElementById('ai-chatbot-input')?.focus();
            }, 10);
        } else {
            overlay.classList.remove('open');
            setTimeout(() => overlay.style.display = 'none', 300);
        }
    }

    closeChat() {
        this.isOpen = false;
        const overlay = document.getElementById('ai-chatbot-overlay');
        overlay.classList.remove('open');
        setTimeout(() => overlay.style.display = 'none', 300);
    }

    handleQuickAction(type) {
        if (!this.currentQuestion) {
            // No question context - provide general guidance
            const generalPrompts = {
                'explain': 'Explain a systematic approach to solve DSA problems.',
                'hints': 'What are the most important DSA patterns I should know?',
                'pattern': 'List common algorithmic patterns with examples.',
                'complexity': 'Explain time and space complexity with Big O notation.'
            };
            this.sendMessage(generalPrompts[type]);
            return;
        }

        // Question-specific prompts - more direct
        const prompts = {
            'explain': `Explain how to solve Question step-by-step. Include the optimal approach and key insights.`,
            
            'hints': `Give me hints for Question. Provide 3-4 progressive hints without spoiling the solution.`,
            
            'pattern': `What pattern does Question use? Mention the technique and similar problems.`,
            
            'complexity': `What is the time and space complexity for Question? Explain the optimal solution's complexity.`
        };
        
        this.sendMessage(prompts[type]);
    }

    async sendMessage(customPrompt = null) {
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
            await this.streamFromAPI(message);
        } catch (error) {
            console.error('❌ Error:', error);
            this.addMessage(`❌ ${error.message}`, 'ai');
        } finally {
            sendBtn.disabled = false;
            this.isStreaming = false;
        }
    }

    async streamFromAPI(userMessage) {
        let systemPrompt = `You are an expert DSA (Data Structures and Algorithms) tutor and coding mentor. Provide clear, well-structured explanations with examples when needed. Use markdown formatting for better readability.`;
        
        // Add rich context if available
        if (this.currentQuestion) {
            systemPrompt += `\n\n**Current Problem Context:**
- Problem: "${this.currentQuestion.title}"
- Difficulty: ${this.currentQuestion.difficulty}
- Topic/Category: ${this.currentQuestion.topic}`;
            
            if (this.currentQuestion.description) {
                systemPrompt += `\n- Description: ${this.currentQuestion.description}`;
            }
            
            systemPrompt += `\n\n**Critical Instructions:**
- The user is currently viewing/working on: "${this.currentQuestion.title}"
- When they click quick action buttons like "💡 Explain this problem", "🧩 Give me hints", "🎯 What pattern?", or "⏱️ Time complexity", they are asking about THIS specific problem: "${this.currentQuestion.title}"
- DO NOT ask which problem they mean - they mean "${this.currentQuestion.title}"
- Tailor ALL responses specifically to "${this.currentQuestion.title}"
- If they say "this problem", "this question", "it", or use quick actions, they mean "${this.currentQuestion.title}"
- Provide direct, actionable answers about "${this.currentQuestion.title}"

**Response Guidelines:**
- For hints: Give 3-4 progressive hints without revealing the solution
- For approach: Explain the optimal algorithmic strategy step-by-step
- For pattern: Identify the pattern and mention 2-3 similar problems
- For complexity: Analyze time and space complexity with explanation
- For code review: Review in context of "${this.currentQuestion.title}"`;
        } else {
            systemPrompt += `\n\nNote: User is not currently viewing a specific problem. Provide general DSA guidance unless they mention a specific problem.`;
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            ...this.messages.slice(-6).map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
            })),
            { role: 'user', content: userMessage }
        ];

        console.log('📤 Calling API with context:', this.currentQuestion?.title || 'No specific problem');

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages })
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            throw new Error(`Server error ${response.status}`);
        }

        await this.handleStreamingResponse(response);
    }

    async handleStreamingResponse(response) {
        const container = document.getElementById('ai-chatbot-messages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message ai';
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = '<span class="streaming-cursor"></span>';
        messageDiv.appendChild(bubble);
        container.appendChild(messageDiv);

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
                            const content = data.choices?.[0]?.delta?.content;
                            
                            if (content) {
                                accumulatedText += content;
                                bubble.innerHTML = this.formatMessage(accumulatedText) + 
                                    '<span class="streaming-cursor"></span>';
                                container.scrollTop = container.scrollHeight;
                            }
                        } catch (e) {
                            // Skip invalid JSON lines
                        }
                    }
                }
            }

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
            <div class="message-bubble">${this.formatMessage(content)}</div>
        `;
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
        this.messages.push({ role, content });
    }

    formatMessage(content) {
        // Handle code blocks with language support
        content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'code';
            const escapedCode = this.escapeHtml(code.trim()).replace(/'/g, '\\\'');
            return `<div class="code-block-wrapper">
                <div class="code-block-header">
                    <span class="code-language">${language}</span>
                    <button class="copy-code-btn" onclick="
                        const code = \`${escapedCode}\`;
                        navigator.clipboard.writeText(code).then(() => {
                            this.innerHTML = '<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><polyline points=\\'20 6 9 17 4 12\\'></polyline></svg> Copied!';
                            setTimeout(() => {
                                this.innerHTML = '<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><rect x=\\'9\\' y=\\'9\\' width=\\'13\\' height=\\'13\\' rx=\\'2\\' ry=\\'2\\'></rect><path d=\\'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1\\'></path></svg> Copy';
                            }, 2000);
                        });
                    ">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                    </button>
                </div>
                <pre><code class="language-${language}">${this.escapeHtml(code.trim())}</code></pre>
            </div>`;
        });

        // Handle inline code
        content = content.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

        // Handle bold text
        content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Handle italic text
        content = content.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Handle headers
        content = content.replace(/^### (.+)$/gm, '<h3 class="msg-h3">$1</h3>');
        content = content.replace(/^## (.+)$/gm, '<h2 class="msg-h2">$1</h2>');
        content = content.replace(/^# (.+)$/gm, '<h1 class="msg-h1">$1</h1>');

        // Handle bullet lists
        content = content.replace(/^- (.+)$/gm, '<li class="msg-li">$1</li>');
        content = content.replace(/(<li class="msg-li">[\s\S]*?<\/li>)/g, '<ul class="msg-ul">$1</ul>');

        // Handle numbered lists
        content = content.replace(/^\d+\. (.+)$/gm, '<li class="msg-li-num">$1</li>');
        content = content.replace(/(<li class="msg-li-num">[\s\S]*?<\/li>)/g, '<ol class="msg-ol">$1</ol>');

        // Handle links
        content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="msg-link">$1</a>');

        // Handle line breaks
        content = content.replace(/\n/g, '<br>');

        return content;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AIChatbot());
} else {
    new AIChatbot();
}
