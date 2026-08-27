import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Markdown } from '@/components/ui/markdown';
import { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor } from "@/components/ui/chat-container";
import { ChainOfThought, ChainOfThoughtStep, ChainOfThoughtTrigger, ChainOfThoughtContent, ChainOfThoughtItem } from "@/components/ui/chain-of-thought";
import { ScrollButton } from "@/components/ui/scroll-button";
import {
  Bot,
  X,
  Send,
  Maximize2,
  Minimize2,
  Loader2,
  Home,
  Users,
  ArrowLeft,
  History,
  SquarePen,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

/** One past conversation, as listed by GET /ai/sessions. */
type SessionSummary = {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

type Mode = 'nav' | 'chat' | 'history';

/** "3m ago" / "yesterday" — enough to locate a chat, no date library needed. */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const minutes = Math.round((Date.now() - then) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(then).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function ScholarBoyWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<Mode>('nav');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [promptsRemaining, setPromptsRemaining] = useState<number | null>(null);

  // --- past conversations ---------------------------------------------------
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [openingSessionId, setOpeningSessionId] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && promptsRemaining === null && mode === 'chat') {
       apiClient.get('/ai/status')
         .then(res => setPromptsRemaining(res.data.promptsRemaining))
         .catch(console.error);
    }
  }, [isOpen, promptsRemaining, mode]);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const res = await apiClient.get<SessionSummary[]>('/ai/sessions');
      setSessions(res.data);
    } catch {
      setSessionsError('Could not load your past conversations.');
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  // Refetched every time the tab is opened rather than cached: the list is
  // small, and a stale one after a chat in another tab is worse than a request.
  useEffect(() => {
    if (isOpen && mode === 'history') void loadSessions();
  }, [isOpen, mode, loadSessions]);

  // Don't render for guests if you want it locked behind auth
  if (!user) return null;

  const handleNav = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  /**
   * Reopens a past conversation. The transcript is replayed into the same view
   * used for a live chat and `sessionId` is restored, so the next question
   * continues that thread on the server instead of starting a new one.
   */
  const openSession = async (id: string) => {
    setOpeningSessionId(id);
    try {
      const res = await apiClient.get<{ id: string; messages: Message[] }>(`/ai/sessions/${id}`);
      setMessages(
        res.data.messages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
        })),
      );
      setSessionId(res.data.id);
      setMode('chat');
      setIsExpanded(true);
    } catch {
      setSessionsError('Could not open that conversation.');
    } finally {
      setOpeningSessionId(null);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(undefined);
    setMode('chat');
  };

  const deleteSession = async (id: string) => {
    // Optimistic: the row disappears immediately and comes back if the delete
    // fails, which keeps a long history list from feeling unresponsive.
    const previous = sessions;
    setSessions((prev) => prev.filter((session) => session.id !== id));
    try {
      await apiClient.delete(`/ai/sessions/${id}`);
      // If the open chat was the one deleted, don't keep writing into a
      // session that no longer exists — the next question starts a fresh one.
      if (sessionId === id) {
        setSessionId(undefined);
        setMessages([]);
      }
    } catch {
      setSessions(previous);
      setSessionsError('Could not delete that conversation.');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setMode('chat');
    setIsExpanded(true); // Auto expand on chat

    try {
      const res = await apiClient.post('/ai/ask', {
        question: userMessage.content,
        sessionId
      });

      const data = res.data;
      setSessionId(data.sessionId);
      setPromptsRemaining(data.promptsRemaining);

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.answer
      }]);
    } catch (error) {
      console.error(error);
      // 402 is the daily prompt cap, which deserves its own explanation rather
      // than the generic "couldn't reach my brain".
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 402) {
         setMessages(prev => [...prev, {
           id: Date.now().toString(),
           role: 'assistant',
           content: 'ScholarBoy needs rest. You have reached your 20-prompt limit for this 12-hour window. Please come back later!'
         }]);
      } else {
         setMessages(prev => [...prev, {
           id: Date.now().toString(),
           role: 'assistant',
           content: 'Sorry, I am having trouble connecting to my brain right now.'
         }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const subtitle = isLoading
    ? 'Thinking...'
    : mode === 'nav'
      ? 'Navigation Menu'
      : mode === 'history'
        ? 'Past conversations'
        : 'AI Doubt Solver';

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div
          style={isExpanded ? {} : { width: '', height: '' }}
          className={`mb-4 flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl transition-all duration-300 ${
            isExpanded ? 'h-[600px] w-[800px] max-w-[90vw] resize overflow-auto' : 'h-[400px] w-[350px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              {mode !== 'nav' && (
                <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => setMode('nav')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/20 text-brand transition-all duration-300">
                {/* Fallback to Lucide icon if image fails, but use standard avatar */}
                <img
                  src={isLoading ? "/avatar/avatar1_hands_on_chin.png" : "/avatar/avatar1.png"}
                  alt="ScholarBoy"
                  className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <Bot className="absolute -z-10 h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">ScholarBoy</h3>
                  <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">Beta</span>
                </div>
                <p className="text-xs text-foreground-muted">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="New chat"
                aria-label="New chat"
                onClick={startNewChat}
              >
                <SquarePen className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${mode === 'history' ? 'bg-primary/15 text-brand' : ''}`}
                title="Past conversations"
                aria-label="Past conversations"
                onClick={() => setMode(mode === 'history' ? 'chat' : 'history')}
              >
                <History className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {mode === 'nav' ? (
              <div className="flex flex-1 flex-col p-4 gap-2 overflow-y-auto">
                <p className="mb-2 text-sm text-foreground-muted">Where would you like to go?</p>
                <Button variant="outline" className="justify-start gap-3" onClick={() => handleNav('/')}>
                  <Home className="h-4 w-4" /> Home Dashboard
                </Button>
                <Button variant="outline" className="justify-start gap-3" onClick={() => handleNav('/study-rooms')}>
                  <Users className="h-4 w-4" /> Study Rooms
                </Button>
                <Button variant="outline" className="justify-start gap-3" onClick={() => setMode('history')}>
                  <History className="h-4 w-4" /> Past conversations
                </Button>

                <div className="mt-auto pt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-surface px-2 text-foreground-muted">Or ask a question</span></div>
                  </div>
                </div>
              </div>
            ) : mode === 'history' ? (
              <div className="flex flex-1 flex-col overflow-y-auto p-3">
                {sessionsError && (
                  <p className="mb-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
                    {sessionsError}
                  </p>
                )}

                {sessionsLoading ? (
                  <div className="flex flex-1 items-center justify-center gap-2 text-sm text-foreground-muted">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading your chats...
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
                    <MessageSquare className="h-6 w-6 text-foreground-muted" />
                    <p className="text-sm font-medium text-foreground">No conversations yet</p>
                    <p className="text-xs text-foreground-muted">
                      Ask ScholarBoy a doubt and it will show up here.
                    </p>
                    <Button size="sm" className="mt-2" onClick={startNewChat}>
                      Start a chat
                    </Button>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {sessions.map((session) => (
                      <li key={session.id}>
                        <div
                          className={`group flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-border hover:bg-primary/5 ${
                            session.id === sessionId ? 'border-border bg-primary/10' : ''
                          }`}
                        >
                          <button
                            type="button"
                            className="flex min-w-0 flex-1 flex-col items-start text-left"
                            onClick={() => void openSession(session.id)}
                            disabled={openingSessionId === session.id}
                          >
                            <span className="w-full truncate text-sm font-medium text-foreground">
                              {session.title}
                            </span>
                            <span className="text-[11px] text-foreground-muted">
                              {relativeTime(session.updatedAt)} · {session.messageCount} message
                              {session.messageCount === 1 ? '' : 's'}
                            </span>
                          </button>
                          {openingSessionId === session.id ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-foreground-muted" />
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 text-foreground-muted opacity-0 transition-opacity hover:text-warning focus-visible:opacity-100 group-hover:opacity-100"
                              title="Delete conversation"
                              aria-label={`Delete conversation ${session.title}`}
                              onClick={() => void deleteSession(session.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="relative flex flex-1 flex-col overflow-hidden">
                <ChatContainerRoot className="flex-1">
                  <ChatContainerContent className="p-4 space-y-4 pb-32">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          msg.role === 'user' ? 'bg-primary text-primary-foreground ml-auto rounded-tr-sm' : 'bg-secondary text-secondary-foreground rounded-tl-sm border border-border/50'
                        }`}>
                          {msg.role === 'user' ? (
                            <p>{msg.content}</p>
                          ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                              <Markdown>{msg.content}</Markdown>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm bg-secondary text-secondary-foreground border border-border/50 shadow-sm">
                          <ChainOfThought>
                            <ChainOfThoughtStep>
                              <ChainOfThoughtTrigger leftIcon={<Loader2 className="h-4 w-4 animate-spin text-brand" />}>
                                ScholarBoy is thinking...
                              </ChainOfThoughtTrigger>
                              <ChainOfThoughtContent>
                                <div className="space-y-2 py-2">
                                  <ChainOfThoughtItem>Analyzing the context...</ChainOfThoughtItem>
                                  <ChainOfThoughtItem>Gathering information...</ChainOfThoughtItem>
                                  <ChainOfThoughtItem>Formulating response...</ChainOfThoughtItem>
                                </div>
                              </ChainOfThoughtContent>
                            </ChainOfThoughtStep>
                          </ChainOfThought>
                        </div>
                      </div>
                    )}
                    <ChatContainerScrollAnchor />
                  </ChatContainerContent>
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20">
                    <ScrollButton />
                  </div>
                </ChatContainerRoot>

                {/* Free Prompts Limit at Bottom Right */}
                {promptsRemaining !== null && (
                  <div className="pointer-events-none absolute bottom-4 right-4 z-10">
                     <span className="rounded-full border border-border bg-surface/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md">
                       {promptsRemaining} prompts remaining
                     </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Input */}
          <div className="border-t border-border bg-surface p-4">
            <p className="mb-2 text-center text-[10px] text-foreground-muted">ScholarBoy can make mistakes, double check the answer.</p>
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={
                  sessionId && messages.length > 0
                    ? 'Continue this conversation...'
                    : 'Ask ScholarBoy a doubt...'
                }
                className="flex-1 rounded-pill border border-input bg-background px-4 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onClick={() => setMode('chat')}
              />
              <Button type="submit" size="icon" className="h-9 w-9 rounded-full shrink-0" disabled={!input.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* FAB Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
      >
        <img
          src={isLoading ? "/avatar/avatar1_hands_on_chin.png" : "/avatar/avatar1.png"}
          alt="Chat with ScholarBoy"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            // Fallback to bot icon
            e.currentTarget.parentElement?.querySelector('svg')?.classList.remove('hidden');
          }}
        />
        <Bot className="hidden h-8 w-8 text-white" />

        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-white border-2 border-primary"></span>
          </span>
        )}
      </button>
    </div>
  );
}
