import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { McDonaldsRenderer } from './a2ui/mcdonaldsRenderer';
import { A2UIMessage, ClientEventPayload } from './a2ui/types';
import { defaultKioskAgent } from './services/agentClient';
import './App.css';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  a2uiMessages?: A2UIMessage[];
  time: string;
}

export const App: React.FC = () => {
  const [messages, setMessages] = useState<A2UIMessage[]>([]);
  const [inspectorTab, setInspectorTab] = useState<'stream' | 'events' | 'cheatsheet' | 'playground'>('stream');
  const [eventLogs, setEventLogs] = useState<ClientEventPayload[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [playgroundText, setPlaygroundText] = useState<string>('// Type a message in chat to stream A2UI JSON');
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Chat starts completely empty
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatHistory.length > 0) {
      scrollToBottom();
    }
  }, [chatHistory, isLoading]);

  // Check backend server status
  useEffect(() => {
    const checkBackend = async () => {
      const isHealthy = await defaultKioskAgent.checkBackendHealth();
      setBackendOnline(isHealthy);
    };
    checkBackend();
    const timer = setInterval(checkBackend, 4000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handles UI action events emitted from @a2ui/react native components
  const handleA2UIAction = useCallback(async (action: any) => {
    const eventName = action.name || action.event?.name || 'action';
    const context = action.context || action.event?.context || {};

    const eventPayload: ClientEventPayload = {
      eventName,
      surfaceId: action.surfaceId || 'mcd-surface',
      context,
      timestamp: new Date().toISOString(),
    };

    setEventLogs((prev) => [eventPayload, ...prev.slice(0, 19)]);
    console.log('[A2UI Event Intercepted]', eventPayload);
    showToast(`⚡ Action: ${eventName}`);

    if (eventName === 'proceed_to_payment') {
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
    }

    setIsLoading(true);
    try {
      const resp = await defaultKioskAgent.sendMessage(eventPayload);
      setMessages(resp.a2uiMessages);
      setPlaygroundText(JSON.stringify(resp.a2uiMessages, null, 2));

      setChatHistory((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'agent',
          text: resp.textResponse,
          a2uiMessages: resp.a2uiMessages.length > 0 ? resp.a2uiMessages : undefined,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      showToast(err.message || 'Error executing action');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setInputQuery('');

    try {
      const resp = await defaultKioskAgent.sendMessage(queryText);
      setMessages(resp.a2uiMessages);
      setPlaygroundText(JSON.stringify(resp.a2uiMessages, null, 2));

      if (queryText.toLowerCase().includes('pay') || queryText.toLowerCase().includes('invoice')) {
        confetti({ particleCount: 70, spread: 50 });
      }

      setChatHistory((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'agent',
          text: resp.textResponse,
          a2uiMessages: resp.a2uiMessages.length > 0 ? resp.a2uiMessages : undefined,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      showToast(err.message || 'Error communicating with Agent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPlayground = () => {
    setParseError(null);
    try {
      const parsed = JSON.parse(playgroundText);
      const msgs = Array.isArray(parsed) ? parsed : [parsed];
      setMessages(msgs);

      // Inject as an agent message in chat
      setChatHistory((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'agent',
          text: '🛠️ [Playground] Rendered custom A2UI surface:',
          a2uiMessages: msgs,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      showToast(`Rendered custom A2UI JSON into chat!`);
    } catch (err: any) {
      setParseError(err.message || 'Invalid JSON syntax');
    }
  };

  const handleCopyJson = () => {
    const text = inspectorTab === 'events' ? JSON.stringify(eventLogs, null, 2) : playgroundText;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="workshop-app">
      {/* Top Header */}
      <header className="workshop-header">
        <div className="brand-section">
          <div className="mcd-logo">M</div>
          <div className="title-area">
            <h1>McDonald's AI Order Assistant</h1>
            <p>Google A2UI Standard Demo • @a2ui/react Native Renderer</p>
          </div>
        </div>

        <div className="header-controls">
          {/* Automatic Connection Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0,0,0,0.25)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#ffffff',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: backendOnline ? '#00FF88' : '#FFC72C',
              display: 'inline-block',
            }} />
            {backendOnline ? 'Python ADK Backend (Port 10002)' : 'Local POC Mode Active'}
          </div>
        </div>
      </header>

      {/* Main Two-Pane Area */}
      <main className="workshop-main">
        {/* Left Pane: Chat Bot Interface */}
        <section className="chat-pane">
          <div className="chat-pane-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>💬</span>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>McDonald's Order Assistant</h3>
                <p style={{ fontSize: '0.72rem', color: '#666' }}>Natural Language + Inline @a2ui/react Surfaces</p>
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', background: '#E8F5E9', color: '#2E7D32', padding: '3px 8px', borderRadius: '10px', fontWeight: 700 }}>
              Kiosk #04 Ready
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="chat-history">
            {chatHistory.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#666666',
                textAlign: 'center',
                padding: '40px 20px',
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'var(--mcd-yellow)',
                  color: 'var(--mcd-red)',
                  fontSize: '36px',
                  fontWeight: 900,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}>
                  M
                </div>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--mcd-dark)', fontWeight: 800, marginBottom: '8px' }}>
                  McDonald's AI Order Assistant
                </h2>
                <p style={{ fontSize: '0.9rem', maxWidth: '440px', lineHeight: 1.5, color: '#555555' }}>
                  Type your order in natural language below (e.g. <em>"Show me the menu"</em> or <em>"Order McSpicy Paneer meal"</em>) to stream interactive <strong>@a2ui/react</strong> components!
                </p>
              </div>
            ) : (
              chatHistory.map((chat) => (
                <div key={chat.id} className={`chat-row ${chat.sender}`}>
                  <div className="chat-meta">
                    {chat.sender === 'agent' ? '🤖 McDonald\'s AI Assistant' : '👤 Customer'} • {chat.time}
                  </div>

                  {chat.sender === 'user' ? (
                    <div className="chat-bubble-user">{chat.text}</div>
                  ) : (
                    <div className="chat-bubble-agent">
                      <div className="chat-text">{chat.text}</div>

                      {/* Inline A2UI Surface rendered directly inside Chat Bubble */}
                      {chat.a2uiMessages && chat.a2uiMessages.length > 0 && (
                        <div className="inline-a2ui-container">
                          <div className="a2ui-surface-badge">
                            <span>✨ Google A2UI v0.9 Component Surface</span>
                          </div>
                          <McDonaldsRenderer
                            messages={chat.a2uiMessages}
                            onAction={handleA2UIAction}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic', padding: '10px' }}>
                ⏳ AI Agent is generating dynamic A2UI surface...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            className="chat-input-container"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputQuery);
            }}
          >
            <input
              type="text"
              placeholder="Type your message e.g. 'Show me the menu' or 'Order McSpicy Paneer'..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="btn-chat-send" disabled={!inputQuery.trim() || isLoading}>
              Send
            </button>
          </form>
        </section>

        {/* Right Pane: Live A2UI Protocol Inspector */}
        <aside className="inspector-pane">
          <div className="inspector-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#4FC3F7', fontWeight: 800, fontSize: '0.82rem' }}>LIVE A2UI INSPECTOR</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={handleCopyJson}
                style={{
                  background: '#333',
                  color: copied ? '#4caf50' : '#fff',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Inspector Tabs */}
          <div className="inspector-tabs">
            <button
              className={`tab-btn ${inspectorTab === 'stream' ? 'active' : ''}`}
              onClick={() => setInspectorTab('stream')}
            >
              🛰️ JSON ({messages.length})
            </button>
            <button
              className={`tab-btn ${inspectorTab === 'events' ? 'active' : ''}`}
              onClick={() => setInspectorTab('events')}
            >
              ⚡ Actions ({eventLogs.length})
            </button>
            <button
              className={`tab-btn ${inspectorTab === 'cheatsheet' ? 'active' : ''}`}
              onClick={() => setInspectorTab('cheatsheet')}
            >
              💡 Cheat Sheet
            </button>
            <button
              className={`tab-btn ${inspectorTab === 'playground' ? 'active' : ''}`}
              onClick={() => setInspectorTab('playground')}
            >
              🛠️ Playground
            </button>
          </div>

          {/* Inspector Tab Contents */}
          <div className="inspector-body">
            {inspectorTab === 'stream' && (
              <div className="code-viewer">
                {messages.length === 0 ? (
                  <div style={{ color: '#888', fontSize: '0.8rem', padding: '16px', textAlign: 'center' }}>
                    Type an order in the chat to see the live A2UI message stream!
                  </div>
                ) : (
                  <>
                    <div style={{ color: '#aaa', fontSize: '0.72rem', marginBottom: '8px' }}>
                      Showing latest A2UI message payload streamed from Agent:
                    </div>
                    <pre>{JSON.stringify(messages, null, 2)}</pre>
                  </>
                )}
              </div>
            )}

            {inspectorTab === 'events' && (
              <div className="code-viewer">
                <div style={{ color: '#aaa', fontSize: '0.72rem', marginBottom: '8px' }}>
                  Real-time log of user interaction events emitted from @a2ui/react widgets:
                </div>
                {eventLogs.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: '#777', padding: '12px' }}>
                    No events captured yet. Tap buttons or checkboxes in the chat widgets!
                  </p>
                ) : (
                  <pre>{JSON.stringify(eventLogs, null, 2)}</pre>
                )}
              </div>
            )}

            {inspectorTab === 'cheatsheet' && (
              <div>
                <div className="concept-card">
                  <h4>1. The 3 Core Messages</h4>
                  <p>
                    <span className="concept-badge">createSurface</span> Declares surface container and catalog specification.<br />
                    <span className="concept-badge">updateComponents</span> Hierarchical component tree (`Card`, `Column`, `Row`, `Button`, `ChoicePicker`).<br />
                    <span className="concept-badge">updateDataModel</span> Reactive JSON-pointer model (`path: "/meals"`).
                  </p>
                </div>

                <div className="concept-card">
                  <h4>2. Reactive Data Binding</h4>
                  <p>
                    Components bind to model paths (e.g. `value: {'{'} path: "/custom/piriPiri" {'}'}`). Local toggles update state at 60 FPS without network lag.
                  </p>
                </div>

                <div className="concept-card">
                  <h4>3. Security by Design</h4>
                  <p>
                    Zero `eval()` or arbitrary JavaScript. Pure declarative JSON parsed safely by Google's native `@a2ui/react` catalog.
                  </p>
                </div>
              </div>
            )}

            {inspectorTab === 'playground' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
                <p style={{ fontSize: '0.75rem', color: '#aaa' }}>
                  Edit or paste custom A2UI JSON below to test live injection into chat:
                </p>
                {parseError && (
                  <div style={{ color: '#ff6b6b', fontSize: '0.75rem' }}>{parseError}</div>
                )}
                <textarea
                  rows={16}
                  value={playgroundText}
                  onChange={(e) => setPlaygroundText(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#141414',
                    color: '#9cdcfe',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #333',
                  }}
                />
                <button
                  onClick={handleApplyPlayground}
                  style={{
                    background: 'var(--mcd-red)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ▶ Inject Surface into Chat
                </button>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Floating Toast */}
      {toastMessage && <div className="floating-toast">{toastMessage}</div>}
    </div>
  );
};
