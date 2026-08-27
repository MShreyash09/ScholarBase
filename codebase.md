# Codebase

## frontend\components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}

```

## frontend\index.html

```html
<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#850013" />
  <meta name="description"
    content="Previous year question papers, shared notes and live study rooms for your department." />
  <title>ScholarBase</title>
  <link rel="icon" type="image/png" href="/scholarbase_icon.png" />
  <!--
      Runs before first paint so a dark-mode user never sees a white flash.
      Must stay inline and synchronous in <head>; moving it into the bundle
      reintroduces the flash because the module loads after the first paint.
    -->
  <script>
    (function () {
      try {
        var stored = localStorage.getItem("scholarbase-theme");
        var dark =
          stored === "dark" ||
          (stored === null &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);
        if (dark) document.documentElement.classList.add("dark");
      } catch (e) {
        /* private mode / storage blocked — fall back to light */
      }
    })();
  </script>
</head>

<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>

</html>
```

## frontend\package.json

```json
{
  "name": "@scholarbase/frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "pnpm --filter @scholarbase/shared-types build && tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint \"src/**/*.{ts,tsx}\""
  },
  "dependencies": {
    "@fontsource/poppins": "^5.1.0",
    "@radix-ui/react-collapsible": "^1.1.20",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.1",
    "@scholarbase/shared-types": "workspace:*",
    "@tanstack/react-query": "^5.59.16",
    "@vercel/analytics": "^2.0.1",
    "axios": "^1.7.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "katex": "^0.18.4",
    "lucide-react": "^1.29.0",
    "marked": "^18.0.9",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-markdown": "^10.1.0",
    "react-router-dom": "^6.27.0",
    "rehype-katex": "^7.0.1",
    "remark-breaks": "^4.0.0",
    "remark-gfm": "^4.0.1",
    "remark-math": "^6.0.0",
    "shiki": "^4.4.3",
    "socket.io-client": "^4.8.3",
    "tailwind-merge": "^2.5.4",
    "use-stick-to-bottom": "^1.1.6"
  },
  "devDependencies": {
    "@types/node": "^22.7.5",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@typescript-eslint/eslint-plugin": "^8.10.0",
    "@typescript-eslint/parser": "^8.10.0",
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.12",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3",
    "vite": "^5.4.9"
  }
}

```

## frontend\postcss.config.js

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

```

## frontend\src\App.tsx

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/routes/AppLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { HomePage } from "@/routes/pages/HomePage";
import { DepartmentPage } from "@/routes/pages/DepartmentPage";
import { DepartmentYearPage } from "@/routes/pages/DepartmentYearPage";
import { SemesterPage } from "@/routes/pages/SemesterPage";
import { YearPage } from "@/routes/pages/YearPage";
import { SubjectPage } from "@/routes/pages/SubjectPage";
import { LoginPage } from "@/routes/pages/LoginPage";
import { SignupPage } from "@/routes/pages/SignupPage";
import { GoogleCallbackPage } from "@/routes/pages/GoogleCallbackPage";
import { ForgotPasswordPage } from "@/routes/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/routes/pages/ResetPasswordPage";
import { VerifyEmailPage } from "@/routes/pages/VerifyEmailPage";
import { AdminPage } from "@/routes/pages/AdminPage";
import { InstructionsPage } from "@/routes/pages/InstructionsPage";
import { ContributePage } from "@/routes/pages/ContributePage";
import { NotFoundPage } from "@/routes/pages/NotFoundPage";
import { StudyRoomsPage } from "@/routes/pages/StudyRoomsPage";
import { StudyRoomPage } from "@/routes/pages/StudyRoomPage";
import { JoinStudyRoomPage } from "@/routes/pages/JoinStudyRoomPage";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="departments/:dept" element={<DepartmentPage />} />
              <Route path="departments/:dept/years/:yearNumber" element={<DepartmentYearPage />} />
              <Route
                path="departments/:dept/years/:yearNumber/semesters/:semester"
                element={<SemesterPage />}
              />
              <Route path="years/:yearNumber" element={<YearPage />} />
              <Route path="years/:yearNumber/:subjectId" element={<SubjectPage />} />
              <Route path="instructions" element={<InstructionsPage />} />
              <Route path="contribute" element={<ContributePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route path="auth/google/callback" element={<GoogleCallbackPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route path="verify-email" element={<VerifyEmailPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="study-rooms" element={<StudyRoomsPage />} />
                {/* Must precede :roomId so "join" isn't swallowed as a room id. */}
                <Route path="study-rooms/join/:inviteCode" element={<JoinStudyRoomPage />} />
                <Route path="study-rooms/:roomId" element={<StudyRoomPage />} />
              </Route>
              <Route element={<ProtectedRoute adminOnly />}>
                <Route path="admin" element={<AdminPage />} />
              </Route>
              {/* Last, and inside the layout so a lost visitor still gets the
                  header and a way back. Without it nothing rendered at all. */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Analytics />
    </QueryClientProvider>
  );
}

```

## frontend\src\components\admin\SubjectCombobox.tsx

```tsx
import { forwardRef, useId, useImperativeHandle, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { SubjectDto, YearLevelDto } from "@scholarbase/shared-types";
import { subjectsApi } from "@/lib/api/academic";
import { Input } from "@/components/ui/input";

export interface SubjectComboboxHandle {
  /** Returns a subjectId, creating the subject first if the admin typed a new one. */
  resolve: () => Promise<string>;
  reset: () => void;
}

interface SubjectComboboxProps {
  subjects: SubjectDto[];
  yearLevels: YearLevelDto[];
}

function labelFor(subject: SubjectDto): string {
  return `${subject.code} — ${subject.name}`;
}

/** Fallback code derived from the name when the admin doesn't supply one. */
function deriveCode(name: string): string {
  return name.replace(/[^A-Za-z0-9]/g, "").slice(0, 10).toUpperCase() || "SUBJECT";
}

/**
 * A type-to-search subject field. The admin can pick an existing subject from
 * the suggestions, or type a brand-new one — in which case it's created on the
 * fly (a subject needs a year level, so that + an optional code appear inline)
 * before the paper/note is attached to it. Uploads always end up with a real
 * subjectId, which is what the API requires.
 */
export const SubjectCombobox = forwardRef<SubjectComboboxHandle, SubjectComboboxProps>(
  ({ subjects, yearLevels }, ref) => {
    const queryClient = useQueryClient();
    const listId = `subjects-${useId().replace(/:/g, "")}`;

    const [text, setText] = useState("");
    const [yearLevelId, setYearLevelId] = useState("");
    const [code, setCode] = useState("");
    const [semester, setSemester] = useState("");
    const [department, setDepartment] = useState("");
    const [error, setError] = useState<string | null>(null);

    const match = useMemo(() => {
      const needle = text.trim().toLowerCase();
      if (!needle) return null;
      return (
        subjects.find((s) => labelFor(s).toLowerCase() === needle) ??
        subjects.find((s) => s.name.toLowerCase() === needle) ??
        subjects.find((s) => s.code.toLowerCase() === needle) ??
        null
      );
    }, [text, subjects]);

    const isNew = text.trim().length > 0 && !match;

    useImperativeHandle(ref, () => ({
      reset: () => {
        setText("");
        setYearLevelId("");
        setCode("");
        setSemester("");
        setDepartment("");
        setError(null);
      },
      resolve: async () => {
        setError(null);
        const name = text.trim();
        if (!name) {
          const message = "Type or pick a subject.";
          setError(message);
          throw new Error(message);
        }
        if (match) return match.id;

        // New subject: a year level is required; the code falls back to a slug
        // of the name when the admin leaves it blank.
        if (!yearLevelId) {
          const message = "Pick a year level for the new subject.";
          setError(message);
          throw new Error(message);
        }
        const finalCode = (code.trim() || deriveCode(name)).toUpperCase();

        // Reuse an existing subject with the same code in that year rather than
        // hitting the unique [yearLevel, code] constraint.
        const existing = subjects.find(
          (s) => s.yearLevelId === yearLevelId && s.code.toLowerCase() === finalCode.toLowerCase(),
        );
        if (existing) return existing.id;

        try {
          const created = await subjectsApi.create({ 
            yearLevelId, 
            code: finalCode, 
            name,
            semester: semester ? Number(semester) : undefined,
            department: department.trim() || undefined,
          });
          await queryClient.invalidateQueries({ queryKey: ["subjects"] });
          return created.id;
        } catch {
          const message =
            "Could not create that subject — a subject with this code may already exist in that year.";
          setError(message);
          throw new Error(message);
        }
      },
    }));

    return (
      <div className="flex flex-col gap-2">
        <Input
          list={listId}
          placeholder="Type or pick a subject"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          required
          aria-label="Subject"
        />
        <datalist id={listId}>
          {subjects.map((s) => (
            <option key={s.id} value={labelFor(s)} />
          ))}
        </datalist>

        {isNew && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-warning/30 bg-warning-bg px-3 py-2 text-xs text-warning">
            <span className="font-semibold">New subject — will be created:</span>
            <select
              className="h-8 rounded border border-control bg-surface px-2 text-xs"
              value={yearLevelId}
              onChange={(e) => setYearLevelId(e.target.value)}
              aria-label="Year level for new subject"
            >
              <option value="">Year level</option>
              {yearLevels.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.label}
                </option>
              ))}
            </select>
            <input
              className="h-8 w-24 rounded border border-control bg-surface px-2 text-xs"
              placeholder="Code (optional)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-label="Code for new subject"
            />
            <input
              className="h-8 w-24 rounded border border-control bg-surface px-2 text-xs"
              type="number"
              placeholder="Semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              aria-label="Semester for new subject"
            />
            <input
              className="h-8 w-24 rounded border border-control bg-surface px-2 text-xs"
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              aria-label="Department for new subject"
            />
          </div>
        )}

        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  },
);
SubjectCombobox.displayName = "SubjectCombobox";

```

## frontend\src\components\ai\ScholarBoyWidget.tsx

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Markdown } from '@/components/ui/markdown';
import { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor } from "@/components/ui/chat-container";
import { ChainOfThought, ChainOfThoughtStep, ChainOfThoughtTrigger, ChainOfThoughtContent, ChainOfThoughtItem } from "@/components/ui/chain-of-thought";
import { ScrollButton } from "@/components/ui/scroll-button";
import { Bot, X, Send, Maximize2, Minimize2, Loader2, Home, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function ScholarBoyWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<'nav' | 'chat'>('nav');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [promptsRemaining, setPromptsRemaining] = useState<number | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && promptsRemaining === null && mode === 'chat') {
       apiClient.get('/ai/status')
         .then(res => setPromptsRemaining(res.data.promptsRemaining))
         .catch(console.error);
    }
  }, [isOpen, promptsRemaining, mode]);

  // Don't render for guests if you want it locked behind auth
  if (!user) return null;

  const handleNav = (path: string) => {
    navigate(path);
    setIsOpen(false);
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
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 402) {
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
              {mode === 'chat' && (
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
                <p className="text-xs text-foreground-muted">
                  {isLoading ? 'Thinking...' : mode === 'nav' ? 'Navigation Menu' : 'AI Doubt Solver'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
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
                
                <div className="mt-auto pt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-surface px-2 text-foreground-muted">Or ask a question</span></div>
                  </div>
                </div>
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
                placeholder="Ask ScholarBoy a doubt..."
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

```

## frontend\src\components\DocumentViewer.tsx

```tsx
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Download, ExternalLink, FileWarning } from "lucide-react";
import { isViewableMimeType, type FileViewUrlDto } from "@scholarbase/shared-types";
import { Button } from "@/components/ui/button";

interface DocumentViewerProps {
  doc: FileViewUrlDto | null;
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
  onDownload?: () => void;
}

/**
 * Modal preview for a stored file.
 *
 * The document is rendered in an iframe pointed at a presigned URL that the
 * backend requested with `Content-Disposition: inline`, so the browser displays
 * it instead of saving it. We never proxy the bytes — they go straight from
 * object storage to the browser, which keeps large PDFs off the API host.
 */
export function DocumentViewer({
  doc,
  isLoading = false,
  error = null,
  onClose,
  onDownload,
}: DocumentViewerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = isLoading || Boolean(error) || Boolean(doc);

  // Escape to close, and don't let the page behind scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const canPreview = doc ? isViewableMimeType(doc.mimeType) : false;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={doc ? `Preview of ${doc.fileName}` : "Document preview"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card-hover">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="truncate text-sm font-bold text-foreground" title={doc?.fileName}>
            {doc?.fileName ?? "Loading…"}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            {doc && (
              <Button asChild variant="outline" size="sm">
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Open in new tab</span>
                </a>
              </Button>
            )}
            {onDownload && (
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            )}
            <Button ref={closeRef} variant="ghost" size="sm" onClick={onClose} aria-label="Close preview">
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden bg-muted">
          {isLoading && (
            <div className="flex h-full items-center justify-center text-sm text-foreground-muted">
              Preparing preview…
            </div>
          )}

          {error && (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
              <FileWarning className="h-8 w-8 text-danger" aria-hidden="true" />
              <p className="text-sm font-medium text-danger">{error}</p>
            </div>
          )}

          {doc && !error && canPreview && (
            <iframe
              key={doc.url}
              src={doc.url}
              title={`Preview of ${doc.fileName}`}
              className="h-full w-full border-0 bg-white"
            />
          )}

          {doc && !error && !canPreview && (
            // Office docs and the like can't render in an iframe. Say so
            // plainly rather than showing an empty grey box.
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <FileWarning className="h-8 w-8 text-foreground-subtle" aria-hidden="true" />
              <p className="text-sm text-foreground-muted">
                This file type ({doc.mimeType}) can&apos;t be previewed in the browser.
              </p>
              {onDownload && (
                <Button size="sm" onClick={onDownload}>
                  Download instead
                </Button>
              )}
            </div>
          )}
        </div>

        <p className="shrink-0 border-t border-border px-4 py-2 text-xs text-foreground-muted">
          Preview link expires in about 30 minutes. If it stops loading, close and reopen.
        </p>
      </div>
    </div>,
    document.body,
  );
}

```

## frontend\src\components\study-room\AdminStudyRooms.tsx

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StudyRoomVisibility, type StudyRoomDto } from "@scholarbase/shared-types";
import { studyRoomsApi } from "@/lib/api/study-rooms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Moderation list of every open study room. Admins can end any session here,
 * including private rooms — which by design never show up in their own lobby.
 */
export function AdminStudyRooms() {
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const roomsQuery = useQuery({
    queryKey: ["study-rooms", "admin"],
    queryFn: studyRoomsApi.listAllForAdmin,
    refetchInterval: 10000,
  });

  const closeRoom = useMutation({
    mutationFn: studyRoomsApi.close,
    onSettled: () => {
      setPendingId(null);
      queryClient.invalidateQueries({ queryKey: ["study-rooms"] });
    },
  });

  const handleClose = (room: StudyRoomDto) => {
    const occupants = room.participantCount > 0 ? ` ${room.participantCount} person(s) are in it.` : "";
    if (!window.confirm(`Close "${room.name}"?${occupants} Everyone will be removed from the session.`)) {
      return;
    }
    setPendingId(room.id);
    closeRoom.mutate(room.id);
  };

  if (roomsQuery.isLoading) {
    return <p className="text-sm text-foreground-muted">Loading rooms...</p>;
  }

  if (roomsQuery.isError) {
    return <p className="text-sm text-danger">Could not load study rooms.</p>;
  }

  if (roomsQuery.data?.length === 0) {
    return <p className="text-sm text-foreground-muted">No open study rooms right now.</p>;
  }

  return (
    <ul className="divide-y divide-muted">
      {roomsQuery.data?.map((room) => (
        <li key={room.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground">{room.name}</span>
              <Badge variant={room.visibility === StudyRoomVisibility.PRIVATE ? "default" : "muted"}>
                {room.visibility === StudyRoomVisibility.PRIVATE ? "Private" : "Public"}
              </Badge>
              <Badge variant={room.participantCount > 0 ? "success" : "muted"}>
                {room.participantCount} in room
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-foreground-muted">
              by {room.createdByName} · opened {new Date(room.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              {/* Oversight join: the admin enters visibly, badged as a moderator. */}
              <Link to={`/study-rooms/${room.id}`}>Join</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleClose(room)}
              disabled={closeRoom.isPending && pendingId === room.id}
            >
              {closeRoom.isPending && pendingId === room.id ? "Closing..." : "Close room"}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

```

## frontend\src\components\study-room\CallPanel.tsx

```tsx
import type { StudyRoomParticipantDto } from "@scholarbase/shared-types";
import { Button } from "@/components/ui/button";
import type { UseStudyRoomMediaResult } from "@/hooks/useStudyRoomMedia";
import type { RemotePointer } from "@/hooks/useScreenPointer";
import { VideoTile } from "./VideoTile";

interface CallPanelProps {
  media: UseStudyRoomMediaResult;
  self: StudyRoomParticipantDto | null;
  participants: StudyRoomParticipantDto[];
  disabled: boolean;
  /** Other people's laser pointers over the shared screen. */
  pointers?: RemotePointer[];
  /** Reports this user's pointer as it moves over the shared picture. */
  onPointerPosition?: (x: number, y: number, visible: boolean) => void;
}

export function CallPanel({
  media,
  self,
  participants,
  disabled,
  pointers,
  onPointerPosition,
}: CallPanelProps) {
  const {
    inCall,
    isStarting,
    localStream,
    remoteStreams,
    audioEnabled,
    videoEnabled,
    mediaError,
    joinCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    screenEnabled,
  } = media;

  const peersInCall = participants.filter((p) => p.inCall);
  // `participants` is everyone *else* (the server snapshots peers before adding
  // self), so this is exactly "somebody other than me is presenting". Only one
  // screen share is allowed per room — the server enforces it, this just avoids
  // sending the user through the OS picker only to be rejected afterwards.
  const someoneElsePresenting = participants.some((p) => p.screenEnabled);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-foreground">Audio &amp; video</h2>
          <p className="text-xs text-foreground-muted">
            {inCall
              ? `${peersInCall.length} other participant${peersInCall.length === 1 ? "" : "s"} on the call`
              : peersInCall.length > 0
                ? `${peersInCall.length} participant${peersInCall.length === 1 ? " is" : "s are"} on a call`
                : "Nobody is on the call yet"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {inCall ? (
            <>
              <Button variant="outline" size="sm" onClick={toggleAudio}>
                {audioEnabled ? "Mute" : "Unmute"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => void toggleVideo()}>
                {videoEnabled ? "Turn camera off" : "Turn camera on"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void toggleScreenShare()}
                disabled={someoneElsePresenting && !screenEnabled}
                title={
                  someoneElsePresenting && !screenEnabled
                    ? "Someone else is sharing their screen"
                    : undefined
                }
                className={screenEnabled ? "bg-primary/15 text-brand hover:bg-primary/25" : ""}
              >
                {screenEnabled ? "Stop sharing" : "Share screen"}
              </Button>
              <Button variant="secondary" size="sm" onClick={leaveCall}>
                Leave call
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => void joinCall()} disabled={disabled || isStarting}>
              {isStarting ? "Starting..." : "Join with audio"}
            </Button>
          )}
        </div>
      </div>

      {mediaError && <p className="text-xs text-warning">{mediaError}</p>}

      {inCall && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {/* The pointer overlay only attaches to whichever tile is the screen
              share — pointing at a camera tile means nothing. */}
          <VideoTile
            stream={localStream}
            label={self?.fullName ?? "You"}
            isSelf
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled || screenEnabled}
            screenEnabled={screenEnabled}
            pointers={screenEnabled ? pointers : undefined}
            onPointerPosition={screenEnabled ? onPointerPosition : undefined}
          />
          {peersInCall.map((peer) => (
            <VideoTile
              key={peer.socketId}
              stream={remoteStreams[peer.socketId] ?? null}
              label={peer.fullName}
              audioEnabled={peer.audioEnabled}
              videoEnabled={(peer.videoEnabled || peer.screenEnabled) && Boolean(remoteStreams[peer.socketId])}
              screenEnabled={peer.screenEnabled}
              pointers={peer.screenEnabled ? pointers : undefined}
              onPointerPosition={peer.screenEnabled ? onPointerPosition : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

```

## frontend\src\components\study-room\ChatPanel.tsx

```tsx
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  STUDY_ROOM_MESSAGE_MAX_LENGTH,
  type StudyRoomMessageDto,
} from "@scholarbase/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  messages: StudyRoomMessageDto[];
  currentUserId: string | undefined;
  typingNames: string[];
  disabled: boolean;
  onSend: (body: string) => void;
  onTyping: (isTyping: boolean) => void;
}

const TYPING_IDLE_MS = 1500;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatPanel({
  messages,
  currentUserId,
  typingNames,
  disabled,
  onSend,
  onTyping,
}: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<number>();
  const isTypingRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typingNames.length]);

  // Tell the room we stopped typing if this panel goes away mid-sentence.
  useEffect(() => {
    return () => {
      window.clearTimeout(idleTimer.current);
      if (isTypingRef.current) onTyping(false);
    };
  }, [onTyping]);

  const stopTyping = () => {
    window.clearTimeout(idleTimer.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTyping(false);
    }
  };

  const handleChange = (value: string) => {
    setDraft(value);
    if (disabled) return;

    if (!isTypingRef.current && value.length > 0) {
      isTypingRef.current = true;
      onTyping(true);
    }

    window.clearTimeout(idleTimer.current);
    if (value.length === 0) {
      stopTyping();
    } else {
      idleTimer.current = window.setTimeout(stopTyping, TYPING_IDLE_MS);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    setDraft("");
    stopTyping();
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-foreground-subtle">
            No messages yet — say hello to start the session.
          </p>
        )}

        {messages.map((message) => {
          const isMine = message.senderId === currentUserId;
          return (
            <div key={message.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2",
                  isMine ? "bg-primary text-white" : "bg-muted text-foreground",
                )}
              >
                {!isMine && (
                  <p className="text-xs font-semibold text-brand">{message.senderName}</p>
                )}
                <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>
                <p
                  className={cn(
                    "mt-1 text-right text-[10px]",
                    isMine ? "text-white/70" : "text-foreground-subtle",
                  )}
                >
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-5 px-4 text-xs italic text-foreground-subtle">
        {typingNames.length === 1 && `${typingNames[0]} is typing...`}
        {typingNames.length > 1 && `${typingNames.length} people are typing...`}
      </div>

      <form className="flex gap-2 border-t border-border p-4" onSubmit={handleSubmit}>
        <Input
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={disabled ? "Connecting..." : "Message the room"}
          maxLength={STUDY_ROOM_MESSAGE_MAX_LENGTH}
          disabled={disabled}
          aria-label="Message the room"
        />
        <Button type="submit" disabled={disabled || !draft.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}

```

## frontend\src\components\study-room\CopyInviteButton.tsx

```tsx
import { useEffect, useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { buildInviteUrl } from "@/lib/api/study-rooms";

interface CopyInviteButtonProps {
  inviteCode: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
}

export function CopyInviteButton({
  inviteCode,
  size = "sm",
  variant = "outline",
}: CopyInviteButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    const url = buildInviteUrl(inviteCode);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard access can be denied; a prompt still lets them copy manually.
      window.prompt("Copy this invite link:", url);
    }
  };

  return (
    <Button type="button" variant={variant} size={size} onClick={handleCopy}>
      {copied ? "Link copied" : "Copy invite link"}
    </Button>
  );
}

```

## frontend\src\components\study-room\VideoTile.tsx

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { RemotePointer } from "@/hooks/useScreenPointer";
import { normalizedToOffset, pointerToNormalized } from "@/lib/video-content-rect";

interface VideoTileProps {
  stream: MediaStream | null;
  label: string;
  isSelf?: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenEnabled?: boolean;
  /** Other people's laser pointers, in normalized picture coordinates. */
  pointers?: RemotePointer[];
  /** Called as this user moves over the shared picture. */
  onPointerPosition?: (x: number, y: number, visible: boolean) => void;
}

export function VideoTile({
  stream,
  label,
  isSelf = false,
  audioEnabled,
  videoEnabled,
  screenEnabled = false,
  pointers,
  onPointerPosition,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Recomputed on move/resize so dots follow the picture rather than the box.
  const [, forceLayout] = useState(0);

  useEffect(() => {
    const el = videoRef.current;
    if (el && el.srcObject !== stream) {
      el.srcObject = stream;
    }
  }, [stream]);

  const pointerEnabled = screenEnabled && Boolean(onPointerPosition);

  // The picture's position inside the element changes with the window and with
  // the incoming resolution, so a repaint is needed on both.
  useEffect(() => {
    if (!pointerEnabled) return;
    const el = videoRef.current;
    if (!el) return;

    const bump = () => forceLayout((n) => n + 1);
    const observer = new ResizeObserver(bump);
    observer.observe(el);
    el.addEventListener("loadedmetadata", bump);
    el.addEventListener("resize", bump);
    return () => {
      observer.disconnect();
      el.removeEventListener("loadedmetadata", bump);
      el.removeEventListener("resize", bump);
    };
  }, [pointerEnabled]);

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = videoRef.current;
      if (!el || !onPointerPosition) return;

      const point = pointerToNormalized(el, e.clientX, e.clientY);
      // null means the cursor is over a letterbox bar, not the picture.
      if (!point) return onPointerPosition(0, 0, false);
      onPointerPosition(point.x, point.y, true);
    },
    [onPointerPosition],
  );

  const handleLeave = useCallback(() => {
    onPointerPosition?.(0, 0, false);
  }, [onPointerPosition]);

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl bg-neutral-900", screenEnabled ? "aspect-auto h-[50vh] sm:h-full lg:col-span-full" : "aspect-video")}
      onPointerMove={pointerEnabled ? handleMove : undefined}
      onPointerLeave={pointerEnabled ? handleLeave : undefined}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        // Never play your own mic back through your speakers.
        muted={isSelf}
        className={cn("h-full w-full", screenEnabled ? "object-contain" : "object-cover", !videoEnabled && "invisible")}
      />

      {!videoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-700 text-lg font-bold text-white">
            {label.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Laser pointers. Positioned against the picture, not the element, so
          they land in the same spot for everyone regardless of window shape.
          pointer-events-none keeps them from swallowing the moves that produce
          them. */}
      {screenEnabled &&
        videoRef.current &&
        pointers?.map((p) => {
          const { left, top } = normalizedToOffset(videoRef.current!, p.x, p.y);
          return (
            <div
              key={p.socketId}
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left, top }}
            >
              <span className="block h-4 w-4 rounded-full bg-red-500 ring-2 ring-white/90 shadow-lg" />
              <span className="mt-1 block whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {p.fullName}
              </span>
            </div>
          );
        })}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
        <span className="truncate text-xs font-semibold text-white">
          {label}
          {isSelf && " (you)"}
          {screenEnabled && " - Screen"}
        </span>
        <div className="flex items-center gap-1">
        {!audioEnabled && (
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
            Muted
          </span>
        )}
        </div>
      </div>
    </div>
  );
}

```

## frontend\src\components\study-room\WhiteboardCanvas.tsx

```tsx
import { useCallback, useEffect, useRef } from "react";
import type { WhiteboardStroke } from "@scholarbase/shared-types";
import { WHITEBOARD_FLUSH_MS, newStrokeId } from "@/hooks/useWhiteboard";

interface WhiteboardCanvasProps {
  strokes: WhiteboardStroke[];
  /** Changes when strokes change structurally (sync/undo/clear) → full repaint. */
  repaintToken: number;
  canDraw: boolean;
  color: string;
  width: number;
  selfUserId: string | undefined;
  selfName: string;
  onChunk: (chunk: {
    strokeId: string;
    color: string;
    width: number;
    points: number[];
    done: boolean;
  }) => void;
  onLocalChunk: (chunk: {
    roomId: string;
    strokeId: string;
    color: string;
    width: number;
    points: number[];
    done: boolean;
    authorId: string;
    authorName: string;
  }) => void;
  roomId: string;
}

/**
 * The drawing surface.
 *
 * Coordinates are stored normalized 0–1 and only converted to pixels at paint
 * time, so the same board renders correctly on every participant's screen
 * regardless of window size — the alternative, sending pixels, puts the line in
 * a different place for everyone but the author.
 *
 * Repainting every stroke on every incoming chunk would get slow on a busy
 * board, so incoming points are drawn incrementally and a full repaint happens
 * only when the stroke list changes shape (undo, clear, joining late, resize).
 */
export function WhiteboardCanvas({
  strokes,
  repaintToken,
  canDraw,
  color,
  width,
  selfUserId,
  selfName,
  onChunk,
  onLocalChunk,
  roomId,
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<WhiteboardStroke[]>(strokes);
  strokesRef.current = strokes;

  // Live stroke being drawn by this user.
  const drawingRef = useRef<{ id: string; buffer: number[]; last: [number, number] | null } | null>(
    null,
  );
  const flushTimerRef = useRef<number | null>(null);

  const paintStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: WhiteboardStroke) => {
    const { width: w, height: h } = ctx.canvas;
    const pts = stroke.points;
    if (pts.length < 2) return;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0] * w, pts[1] * h);
    for (let i = 2; i < pts.length; i += 2) {
      ctx.lineTo(pts[i] * w, pts[i + 1] * h);
    }
    ctx.stroke();
  }, []);

  const repaint = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokesRef.current) paintStroke(ctx, stroke);
  }, [paintStroke]);

  // Size the backing store to the element in device pixels, or lines look
  // blurry on high-DPI screens. Normalized coordinates make resize a repaint.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const nextW = Math.max(1, Math.round(rect.width * dpr));
      const nextH = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
      }
      repaint();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [repaint]);

  // Structural change — repaint everything.
  useEffect(() => {
    repaint();
  }, [repaintToken, repaint]);

  // Incremental: new chunks arriving while nothing structural changed. Cheap
  // enough to just repaint the affected strokes rather than diffing segments.
  useEffect(() => {
    repaint();
  }, [strokes, repaint]);

  const toNormalized = useCallback((e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    // Clamp: a fast drag can report a point a pixel outside the element, and
    // the server rejects anything beyond 0–1.
    return [Math.min(Math.max(x, 0), 1), Math.min(Math.max(y, 0), 1)];
  }, []);

  const flush = useCallback(
    (done: boolean) => {
      const live = drawingRef.current;
      if (!live || live.buffer.length === 0) {
        if (done && live) {
          onChunk({ strokeId: live.id, color, width, points: [], done: true });
        }
        return;
      }

      const points = live.buffer;
      live.buffer = [];

      onChunk({ strokeId: live.id, color, width, points, done });
      // Echo to ourselves — the server deliberately does not send our own
      // strokes back, so this is what makes the line appear as we draw.
      onLocalChunk({
        roomId,
        strokeId: live.id,
        color,
        width,
        points,
        done,
        authorId: selfUserId ?? "",
        authorName: selfName,
      });
    },
    [color, onChunk, onLocalChunk, roomId, selfName, selfUserId, width],
  );

  const stopFlushTimer = useCallback(() => {
    if (flushTimerRef.current !== null) {
      window.clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!canDraw) return;
      e.currentTarget.setPointerCapture(e.pointerId);

      const point = toNormalized(e);
      drawingRef.current = { id: newStrokeId(), buffer: [...point], last: point };

      stopFlushTimer();
      flushTimerRef.current = window.setInterval(() => flush(false), WHITEBOARD_FLUSH_MS);
    },
    [canDraw, flush, stopFlushTimer, toNormalized],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const live = drawingRef.current;
      if (!canDraw || !live) return;

      const [x, y] = toNormalized(e);
      // Drop sub-pixel jitter so a slow hand doesn't emit hundreds of points.
      if (live.last) {
        const dx = x - live.last[0];
        const dy = y - live.last[1];
        if (dx * dx + dy * dy < 0.000004) return;
      }
      live.last = [x, y];
      live.buffer.push(x, y);
    },
    [canDraw, toNormalized],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Capture may already be gone if the pointer left the window.
      }
      stopFlushTimer();
      flush(true);
      drawingRef.current = null;
    },
    [flush, stopFlushTimer],
  );

  useEffect(() => stopFlushTimer, [stopFlushTimer]);

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full touch-none rounded-xl bg-white ${
        canDraw ? "cursor-crosshair" : "cursor-not-allowed"
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label="Shared whiteboard"
      role="img"
    />
  );
}

```

## frontend\src\components\study-room\WhiteboardPanel.tsx

```tsx
import { useState } from "react";
import { Eraser, Hand, PencilLine, Undo2, X } from "lucide-react";
import type { StudyRoomParticipantDto } from "@scholarbase/shared-types";
import type { UseWhiteboard } from "@/hooks/useWhiteboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WhiteboardCanvas } from "./WhiteboardCanvas";

const PEN_COLORS = ["#111827", "#850013", "#1D4ED8", "#15803D", "#B45309"];
const PEN_WIDTHS = [2, 4, 8];

interface WhiteboardPanelProps {
  board: UseWhiteboard;
  participants: StudyRoomParticipantDto[];
  roomId: string;
  selfUserId: string | undefined;
  selfName: string;
}

export function WhiteboardPanel({
  board,
  participants,
  roomId,
  selfUserId,
  selfName,
}: WhiteboardPanelProps) {
  const [color, setColor] = useState(PEN_COLORS[0]);
  const [width, setWidth] = useState(PEN_WIDTHS[1]);

  // Nobody has opened a board and there is nothing drawn — offer to start one.
  if (!board.isOpen) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
        <PencilLine className="h-8 w-8 text-foreground-subtle" aria-hidden="true" />
        <p className="text-sm text-foreground-muted">
          Open a whiteboard to sketch a derivation or work a problem together.
        </p>
        <Button size="sm" onClick={board.claim}>
          Open whiteboard
        </Button>
      </div>
    );
  }

  const unowned = board.ownerSocketId === null;
  // Everyone except us — the owner never needs granting.
  const others = participants.filter((p) => p.userId !== selfUserId);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PencilLine className="h-4 w-4 text-brand" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">Whiteboard</span>
          {board.ownerName ? (
            <Badge variant="muted">{board.isOwner ? "You control it" : `${board.ownerName} controls it`}</Badge>
          ) : (
            <Badge variant="warning">Unclaimed</Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* An unowned board (the owner left) can be taken by anyone still here,
              so the drawing does not become read-only forever. */}
          {unowned && (
            <Button size="sm" onClick={board.claim}>
              Take control
            </Button>
          )}

          {board.canDraw && (
            <Button size="sm" variant="outline" onClick={board.undo}>
              <Undo2 className="h-4 w-4" aria-hidden="true" />
              Undo
            </Button>
          )}

          {board.isOwner && (
            <>
              <Button size="sm" variant="outline" onClick={board.clear}>
                <Eraser className="h-4 w-4" aria-hidden="true" />
                Clear
              </Button>
              <Button size="sm" variant="ghost" onClick={board.release} title="Hand over the pen">
                <X className="h-4 w-4" aria-hidden="true" />
                Close
              </Button>
            </>
          )}

          {!board.canDraw && !unowned && (
            <Button size="sm" variant="outline" onClick={board.requestDraw}>
              <Hand className="h-4 w-4" aria-hidden="true" />
              Ask to draw
            </Button>
          )}
        </div>
      </div>

      {/* Requests are transient nudges — only the owner ever sees them. */}
      {board.isOwner && board.requests.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/50 p-3">
          {board.requests.map((req) => (
            <div key={req.userId} className="flex items-center justify-between gap-2">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{req.fullName}</span> wants to draw
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => board.grant(req.userId)}>
                  Allow
                </Button>
                <Button size="sm" variant="ghost" onClick={() => board.dismissRequest(req.userId)}>
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {board.canDraw && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            {PEN_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Pen colour ${c}`}
                aria-pressed={color === c}
                className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === c ? "border-foreground" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {PEN_WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWidth(w)}
                aria-label={`Pen width ${w}`}
                aria-pressed={width === w}
                className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                  width === w ? "border-foreground bg-muted" : "border-border"
                }`}
              >
                <span
                  className="rounded-full bg-foreground"
                  style={{ height: w + 1, width: w + 1 }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="min-h-[320px] flex-1 overflow-hidden rounded-xl border border-border">
        <WhiteboardCanvas
          strokes={board.strokes}
          repaintToken={board.repaintToken}
          canDraw={board.canDraw}
          color={color}
          width={width}
          selfUserId={selfUserId}
          selfName={selfName}
          onChunk={board.sendChunk}
          onLocalChunk={board.applyLocalChunk}
          roomId={roomId}
        />
      </div>

      {board.isOwner && others.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-foreground-muted">Who can draw:</span>
          {others.map((p) => {
            const allowed = board.grants.includes(p.userId);
            return (
              <Button
                key={p.socketId}
                size="sm"
                variant={allowed ? "primary" : "outline"}
                onClick={() => (allowed ? board.revoke(p.userId) : board.grant(p.userId))}
              >
                {p.fullName}
                {allowed ? " ✓" : ""}
              </Button>
            );
          })}
        </div>
      )}

      {!board.canDraw && (
        <p className="text-xs text-foreground-muted">
          You can watch the board. Ask {board.ownerName ?? "whoever opens it"} for the pen to draw.
        </p>
      )}
    </div>
  );
}

```

## frontend\src\components\ui\badge.tsx

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Every variant previously used a fixed light-mode palette with no dark
// counterpart — `muted` measured 1.94:1 on the dark surface. These map to
// theme-aware tokens instead, so both themes stay legible.
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-brand",
        muted: "bg-muted text-foreground-muted",
        success: "bg-success-bg text-success",
        warning: "bg-warning-bg text-warning",
        danger: "bg-danger-bg text-danger",
        outline: "border border-border text-foreground-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

```

## frontend\src\components\ui\button.tsx

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        primary:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

```

## frontend\src\components\ui\card.tsx

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Adds the hover lift. Off by default: the lift used to apply to every card
   * including purely static content, so read-only panels animated under the
   * cursor for no reason. Set it on cards that are actually links or buttons.
   */
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-card",
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    // Titles default to foreground rather than brand maroon. Colouring every
    // title flattens the hierarchy (everything is emphasis, so nothing is) and
    // it also made the existing `group-hover:text-primary` on the department
    // cards a no-op, since they already were primary.
    <h3 ref={ref} className={cn("text-lg font-bold text-foreground", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-foreground-muted", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };

```

## frontend\src\components\ui\chain-of-thought.tsx

```tsx
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ChevronDown, Circle } from "lucide-react"
import React from "react"

export type ChainOfThoughtItemProps = React.ComponentProps<"div">

export const ChainOfThoughtItem = ({
  children,
  className,
  ...props
}: ChainOfThoughtItemProps) => (
  <div className={cn("text-muted-foreground text-sm", className)} {...props}>
    {children}
  </div>
)

export type ChainOfThoughtTriggerProps = React.ComponentProps<
  typeof CollapsibleTrigger
> & {
  leftIcon?: React.ReactNode
  swapIconOnHover?: boolean
}

export const ChainOfThoughtTrigger = ({
  children,
  className,
  leftIcon,
  swapIconOnHover = true,
  ...props
}: ChainOfThoughtTriggerProps) => (
  <CollapsibleTrigger
    className={cn(
      "group text-muted-foreground hover:text-foreground flex cursor-pointer items-center justify-start gap-1 text-left text-sm transition-colors",
      className
    )}
    {...props}
  >
    <div className="flex items-center gap-2">
      {leftIcon ? (
        <span className="relative inline-flex size-4 items-center justify-center">
          <span
            className={cn(
              "transition-opacity",
              swapIconOnHover && "group-hover:opacity-0"
            )}
          >
            {leftIcon}
          </span>
          {swapIconOnHover && (
            <ChevronDown className="absolute size-4 opacity-0 transition-opacity group-hover:opacity-100 group-data-[state=open]:rotate-180" />
          )}
        </span>
      ) : (
        <span className="relative inline-flex size-4 items-center justify-center">
          <Circle className="size-2 fill-current" />
        </span>
      )}
      <span>{children}</span>
    </div>
    {!leftIcon && (
      <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
    )}
  </CollapsibleTrigger>
)

export type ChainOfThoughtContentProps = React.ComponentProps<
  typeof CollapsibleContent
>

export const ChainOfThoughtContent = ({
  children,
  className,
  ...props
}: ChainOfThoughtContentProps) => {
  return (
    <CollapsibleContent
      className={cn(
        "text-popover-foreground data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="grid grid-cols-[min-content_minmax(0,1fr)] gap-x-4">
        <div className="bg-primary/20 ml-1.75 h-full w-px group-data-[last=true]:hidden" />
        <div className="ml-1.75 h-full w-px bg-transparent group-data-[last=false]:hidden" />
        <div className="mt-2 space-y-2">{children}</div>
      </div>
    </CollapsibleContent>
  )
}

export type ChainOfThoughtProps = {
  children: React.ReactNode
  className?: string
}

export function ChainOfThought({ children, className }: ChainOfThoughtProps) {
  const childrenArray = React.Children.toArray(children)

  return (
    <div className={cn("space-y-0", className)}>
      {childrenArray.map((child, index) => (
        <React.Fragment key={index}>
          {React.isValidElement(child) &&
            React.cloneElement(
              child as React.ReactElement<ChainOfThoughtStepProps>,
              {
                isLast: index === childrenArray.length - 1,
              }
            )}
        </React.Fragment>
      ))}
    </div>
  )
}

export type ChainOfThoughtStepProps = {
  children: React.ReactNode
  className?: string
  isLast?: boolean
}

export const ChainOfThoughtStep = ({
  children,
  className,
  isLast = false,
  ...props
}: ChainOfThoughtStepProps & React.ComponentProps<typeof Collapsible>) => {
  return (
    <Collapsible
      className={cn("group", className)}
      data-last={isLast}
      {...props}
    >
      {children}
      <div className="flex justify-start group-data-[last=true]:hidden">
        <div className="bg-primary/20 ml-1.75 h-4 w-px" />
      </div>
    </Collapsible>
  )
}

```

## frontend\src\components\ui\chat-container.tsx

```tsx
import { cn } from "@/lib/utils"
import { StickToBottom } from "use-stick-to-bottom"

export type ChatContainerRootProps = {
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

export type ChatContainerContentProps = {
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

export type ChatContainerScrollAnchorProps = {
  className?: string
  ref?: React.RefObject<HTMLDivElement>
} & React.HTMLAttributes<HTMLDivElement>

function ChatContainerRoot({
  children,
  className,
  ...props
}: ChatContainerRootProps) {
  return (
    <StickToBottom
      className={cn("flex overflow-y-auto", className)}
      resize="smooth"
      initial="instant"
      role="log"
      {...props}
    >
      {children}
    </StickToBottom>
  )
}

function ChatContainerContent({
  children,
  className,
  ...props
}: ChatContainerContentProps) {
  return (
    <StickToBottom.Content
      className={cn("flex w-full flex-col", className)}
      {...props}
    >
      {children}
    </StickToBottom.Content>
  )
}

function ChatContainerScrollAnchor({
  className,
  ...props
}: ChatContainerScrollAnchorProps) {
  return (
    <div
      className={cn("h-px w-full shrink-0 scroll-mt-4", className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor }

```

## frontend\src\components\ui\code-block.tsx

```tsx
"use client"

import { cn } from "@/lib/utils"
import React, { useEffect, useState } from "react"
import { codeToHtml } from "shiki"

export type CodeBlockProps = {
  children?: React.ReactNode
  className?: string
} & React.HTMLProps<HTMLDivElement>

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "not-prose flex w-full flex-col overflow-clip border",
        "border-border bg-card text-card-foreground rounded-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export type CodeBlockCodeProps = {
  code: string
  language?: string
  theme?: string
  className?: string
} & React.HTMLProps<HTMLDivElement>

function CodeBlockCode({
  code,
  language = "tsx",
  theme = "github-light",
  className,
  ...props
}: CodeBlockCodeProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)

  useEffect(() => {
    async function highlight() {
      if (!code) {
        setHighlightedHtml("<pre><code></code></pre>")
        return
      }

      const html = await codeToHtml(code, { lang: language, theme })
      setHighlightedHtml(html)
    }
    highlight()
  }, [code, language, theme])

  const classNames = cn(
    "w-full overflow-x-auto text-[13px] [&>pre]:px-4 [&>pre]:py-4",
    className
  )

  // SSR fallback: render plain code if not hydrated yet
  return highlightedHtml ? (
    <div
      className={classNames}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      {...props}
    />
  ) : (
    <div className={classNames} {...props}>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  )
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>

function CodeBlockGroup({
  children,
  className,
  ...props
}: CodeBlockGroupProps) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock }

```

## frontend\src\components\ui\collapsible.tsx

```tsx
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

```

## frontend\src\components\ui\field.tsx

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "@/components/ui/input";

export interface FieldProps extends InputProps {
  label: string;
  /** Shown under the input; also wired up as the input's description. */
  hint?: string;
  error?: string;
}

/**
 * A labelled input.
 *
 * The forms previously used placeholders as their only labels, which is a
 * usability problem rather than a style one: the label vanishes as soon as the
 * user types, there is nothing to click to focus, and assistive tech has no
 * reliable accessible name. A real <label> fixes all three.
 */
const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-semibold text-foreground">
          {label}
        </label>
        <Input
          id={inputId}
          ref={ref}
          aria-describedby={cn(hintId, errorId) || undefined}
          aria-invalid={error ? true : undefined}
          className={cn(error && "border-danger focus-visible:border-danger", className)}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-foreground-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Field.displayName = "Field";

export { Field };

```

## frontend\src\components\ui\input.tsx

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      // border-control (not border-muted): in dark, --muted sat almost on top
      // of --surface so the field had no visible edge at all, and the softer
      // --border used for card edges only reaches ~1.25:1 here — under the 3:1
      // WCAG wants for control boundaries. Placeholder moves off the fixed
      // neutral-400 (2.54:1 in light) onto the themed subtle token.
      "flex h-10 w-full rounded-lg border border-control bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-foreground-subtle hover:border-foreground-subtle focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };

```

## frontend\src\components\ui\markdown.tsx

```tsx
import { cn } from "@/lib/utils"
import { marked } from "marked"
import { memo, useId, useMemo } from "react"
import ReactMarkdown, { Components } from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"
import { CodeBlock, CodeBlockCode } from "./code-block"

export type MarkdownProps = {
  children: string
  id?: string
  className?: string
  components?: Partial<Components>
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown)
  return tokens.map((token) => token.raw)
}

function extractLanguage(className?: string): string {
  if (!className) return "plaintext"
  const match = className.match(/language-(\w+)/)
  return match ? match[1] : "plaintext"
}

const INITIAL_COMPONENTS: Partial<Components> = {
  code: function CodeComponent({ className, children, ...props }) {
    const isInline =
      !props.node?.position?.start.line ||
      props.node?.position?.start.line === props.node?.position?.end.line

    if (isInline) {
      return (
        <span
          className={cn(
            "bg-primary-foreground rounded-sm px-1 font-mono text-sm",
            className
          )}
          {...props}
        >
          {children}
        </span>
      )
    }

    const language = extractLanguage(className)

    return (
      <CodeBlock className={className}>
        <CodeBlockCode code={children as string} language={language} />
      </CodeBlock>
    )
  },
  pre: function PreComponent({ children }) {
    return <>{children}</>
  },
}

const MemoizedMarkdownBlock = memo(
  function MarkdownBlock({
    content,
    components = INITIAL_COMPONENTS,
  }: {
    content: string
    components?: Partial<Components>
  }) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    )
  },
  function propsAreEqual(prevProps, nextProps) {
    return prevProps.content === nextProps.content
  }
)

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock"

function MarkdownComponent({
  children,
  id,
  className,
  components = INITIAL_COMPONENTS,
}: MarkdownProps) {
  const generatedId = useId()
  const blockId = id ?? generatedId
  const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children])

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <MemoizedMarkdownBlock
          key={`${blockId}-block-${index}`}
          content={block}
          components={components}
        />
      ))}
    </div>
  )
}

const Markdown = memo(MarkdownComponent)
Markdown.displayName = "Markdown"

export { Markdown }

```

## frontend\src\components\ui\scroll-button.tsx

```tsx
"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type VariantProps } from "class-variance-authority"
import { ChevronDown } from "lucide-react"
import { useStickToBottomContext } from "use-stick-to-bottom"

export type ScrollButtonProps = {
  className?: string
  variant?: VariantProps<typeof buttonVariants>["variant"]
  size?: VariantProps<typeof buttonVariants>["size"]
} & React.ButtonHTMLAttributes<HTMLButtonElement>

function ScrollButton({
  className,
  variant = "outline",
  size = "sm",
  ...props
}: ScrollButtonProps) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext()

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "h-10 w-10 rounded-full transition-all duration-150 ease-out",
        !isAtBottom
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-95 opacity-0",
        className
      )}
      onClick={() => scrollToBottom()}
      {...props}
    >
      <ChevronDown className="h-5 w-5" />
    </Button>
  )
}

export { ScrollButton }

```

## frontend\src\components\ui\tabs.tsx

```tsx
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn("inline-flex items-center gap-1 rounded-pill bg-muted p-1", className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-pill px-4 py-1.5 text-sm font-semibold text-foreground-muted transition-colors data-[state=active]:bg-primary data-[state=active]:text-white",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn("mt-4", className)} {...props} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };

```

## frontend\src\hooks\useAuth.tsx

```tsx
import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from "react";
import {
  UserRole,
  type LoginRequestDto,
  type SignupRequestDto,
  type SignupResponseDto,
  type UserDto,
} from "@scholarbase/shared-types";
import { authApi } from "@/lib/api/auth";
import { authStorage } from "@/lib/auth-storage";
import { queryClient } from "@/lib/query-client";

interface AuthContextValue {
  user: UserDto | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (body: LoginRequestDto) => Promise<void>;
  /**
   * Resolves with the server's confirmation message. Unlike login this does NOT
   * establish a session — the account stays unusable until the emailed link is
   * opened — so there is nothing to store here.
   */
  signup: (body: SignupRequestDto) => Promise<SignupResponseDto>;
  setSessionFromOAuth: (accessToken: string, refreshToken: string, user: UserDto) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(() => authStorage.getUser());

  const login = useCallback(async (body: LoginRequestDto) => {
    const res = await authApi.login(body);
    authStorage.setSession(res.accessToken, res.refreshToken, res.user);
    setUser(res.user);
    queryClient.clear();
  }, []);

  const signup = useCallback(async (body: SignupRequestDto) => {
    return authApi.signup(body);
  }, []);

  const setSessionFromOAuth = useCallback((accessToken: string, refreshToken: string, userDto: UserDto) => {
    authStorage.setSession(accessToken, refreshToken, userDto);
    setUser(userDto);
    queryClient.clear();
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = authStorage.getRefreshToken();
    authStorage.clear();
    setUser(null);
    queryClient.clear();
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => undefined);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.role === UserRole.ADMIN,
      login,
      signup,
      setSessionFromOAuth,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

```

## frontend\src\hooks\useScreenPointer.ts

```ts
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import type { Socket } from "socket.io-client";
import {
  SCREEN_POINTER_STALE_MS,
  SCREEN_POINTER_THROTTLE_MS,
  StudyRoomClientEvent,
  StudyRoomServerEvent,
  type ScreenPointerBroadcastPayload,
} from "@scholarbase/shared-types";

export interface RemotePointer {
  socketId: string;
  fullName: string;
  x: number;
  y: number;
  at: number;
}

/**
 * The shared laser pointer over a screen share.
 *
 * Worth being clear about what this is and is not: a web page cannot read the
 * operating system cursor outside itself, so this does not track a presenter's
 * real mouse while they work in another window — that is a browser security
 * boundary. What it does is let anyone point at the shared picture *as shown in
 * ScholarBase*, which covers both "let me highlight this line" from the person
 * presenting and "what's that?" from someone watching.
 *
 * Positions are transient. Nothing is stored server-side, and a pointer that
 * stops updating is dropped, so a dot can never be left frozen on everyone's
 * screen by a dropped connection.
 */
export function useScreenPointer(
  roomId: string | undefined,
  socketRef: MutableRefObject<Socket | null>,
  connected: boolean,
) {
  const [pointers, setPointers] = useState<RemotePointer[]>([]);
  const lastSentAt = useRef(0);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !connected) return;

    const onPointer = (p: ScreenPointerBroadcastPayload) => {
      if (p.roomId !== roomId) return;

      setPointers((prev) => {
        const others = prev.filter((x) => x.socketId !== p.socketId);
        // `visible: false` is the retraction sent when a cursor leaves the video.
        if (!p.visible) return others;
        return [
          ...others,
          { socketId: p.socketId, fullName: p.fullName, x: p.x, y: p.y, at: Date.now() },
        ];
      });
    };

    socket.on(StudyRoomServerEvent.SCREEN_POINTER, onPointer);
    return () => {
      socket.off(StudyRoomServerEvent.SCREEN_POINTER, onPointer);
    };
  }, [connected, roomId, socketRef]);

  // Drop pointers that stopped updating — a dropped connection never sends the
  // retraction, and a stale dot is worse than no dot.
  useEffect(() => {
    if (pointers.length === 0) return;
    const timer = window.setInterval(() => {
      const cutoff = Date.now() - SCREEN_POINTER_STALE_MS;
      setPointers((prev) => prev.filter((p) => p.at >= cutoff));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [pointers.length]);

  const send = useCallback(
    (x: number, y: number, visible: boolean) => {
      if (!roomId) return;
      const socket = socketRef.current;
      if (!socket) return;

      const now = Date.now();
      // A retraction must always go out; movement is throttled.
      if (visible) {
        if (now - lastSentAt.current < SCREEN_POINTER_THROTTLE_MS) return;
        // Skip a resend when the pointer has not actually moved.
        const last = lastPos.current;
        if (last && Math.abs(last.x - x) < 0.001 && Math.abs(last.y - y) < 0.001) return;
        lastPos.current = { x, y };
      } else {
        lastPos.current = null;
      }

      lastSentAt.current = now;
      socket.emit(StudyRoomClientEvent.SCREEN_POINTER, { roomId, x, y, visible });
    },
    [roomId, socketRef],
  );

  const clear = useCallback(() => {
    setPointers([]);
  }, []);

  return { pointers, send, clear };
}

```

## frontend\src\hooks\useStudyRoom.ts

```ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import {
  StudyRoomClientEvent,
  StudyRoomServerEvent,
  type MediaStateBroadcastPayload,
  type ParticipantJoinedPayload,
  type ParticipantLeftPayload,
  type RoomClosedPayload,
  type RoomErrorPayload,
  type RoomJoinedPayload,
  type StudyRoomMessageDto,
  type StudyRoomParticipantDto,
  type TypingBroadcastPayload,
} from "@scholarbase/shared-types";
import { apiClient } from "@/lib/api-client";
import { createStudyRoomSocket } from "@/lib/study-room-socket";

export type StudyRoomStatus = "connecting" | "connected" | "disconnected" | "error";

const TYPING_TIMEOUT_MS = 3000;

export interface UseStudyRoomResult {
  status: StudyRoomStatus;
  error: string | null;
  /** Set when the room was closed while we were in it. */
  closedMessage: string | null;
  self: StudyRoomParticipantDto | null;
  /** Everyone in the room except you. */
  participants: StudyRoomParticipantDto[];
  messages: StudyRoomMessageDto[];
  typingNames: string[];
  sendMessage: (body: string) => void;
  setTyping: (isTyping: boolean) => void;
  socketRef: React.MutableRefObject<Socket | null>;
}

export function useStudyRoom(roomId: string | undefined): UseStudyRoomResult {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<StudyRoomStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [closedMessage, setClosedMessage] = useState<string | null>(null);
  const [self, setSelf] = useState<StudyRoomParticipantDto | null>(null);
  const [participants, setParticipants] = useState<StudyRoomParticipantDto[]>([]);
  const [messages, setMessages] = useState<StudyRoomMessageDto[]>([]);
  const [typing, setTypingState] = useState<Record<string, string>>({});
  const typingTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!roomId) return;

    const socket = createStudyRoomSocket();
    socketRef.current = socket;
    // StrictMode remounts this effect; `cancelled` keeps a torn-down socket
    // from writing state back into the remounted instance.
    let cancelled = false;
    let retriedAfterRefresh = false;

    const join = () => socket.emit(StudyRoomClientEvent.JOIN, { roomId });

    socket.on("connect", () => {
      if (cancelled) return;
      setStatus("connected");
      setError(null);
      join();
    });

    socket.on("disconnect", () => {
      if (cancelled) return;
      setStatus("disconnected");
    });

    socket.on("connect_error", async (err: Error) => {
      if (cancelled) return;

      // The handshake is rejected once the 15-minute access token expires.
      // Any authenticated request refreshes it via the axios interceptor, so
      // touch one and retry the connection with the new token.
      if (!retriedAfterRefresh && err.message === "Authentication failed") {
        retriedAfterRefresh = true;
        try {
          await apiClient.get("/auth/me");
          if (!cancelled) socket.connect();
          return;
        } catch {
          /* fall through to the error state below */
        }
      }

      setStatus("error");
      setError("Could not connect to the study room.");
    });

    socket.on(StudyRoomServerEvent.JOINED, (payload: RoomJoinedPayload) => {
      if (cancelled) return;
      setSelf(payload.self);
      setParticipants(payload.participants);
      setMessages(payload.recentMessages);
    });

    socket.on(StudyRoomServerEvent.PARTICIPANT_JOINED, (payload: ParticipantJoinedPayload) => {
      if (cancelled) return;
      setParticipants((prev) =>
        prev.some((p) => p.socketId === payload.participant.socketId)
          ? prev
          : [...prev, payload.participant],
      );
    });

    socket.on(StudyRoomServerEvent.PARTICIPANT_LEFT, (payload: ParticipantLeftPayload) => {
      if (cancelled) return;
      setParticipants((prev) => prev.filter((p) => p.socketId !== payload.socketId));
    });

    socket.on(StudyRoomServerEvent.MESSAGE, (message: StudyRoomMessageDto) => {
      if (cancelled) return;
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    });

    socket.on(StudyRoomServerEvent.MEDIA_STATE, (payload: MediaStateBroadcastPayload) => {
      if (cancelled) return;
      setParticipants((prev) =>
        prev.map((p) =>
          p.socketId === payload.socketId
            ? {
                ...p,
                inCall: payload.inCall,
                audioEnabled: payload.audioEnabled,
                videoEnabled: payload.videoEnabled,
                screenEnabled: payload.screenEnabled,
              }
            : p,
        ),
      );
    });

    socket.on(StudyRoomServerEvent.TYPING, (payload: TypingBroadcastPayload) => {
      if (cancelled) return;

      window.clearTimeout(typingTimers.current[payload.userId]);

      if (!payload.isTyping) {
        setTypingState((prev) => {
          const next = { ...prev };
          delete next[payload.userId];
          return next;
        });
        return;
      }

      setTypingState((prev) => ({ ...prev, [payload.userId]: payload.fullName }));
      // Self-expiring: a client that disconnects mid-typing never sends the
      // matching "stopped" event, so the indicator has to time itself out.
      typingTimers.current[payload.userId] = window.setTimeout(() => {
        setTypingState((prev) => {
          const next = { ...prev };
          delete next[payload.userId];
          return next;
        });
      }, TYPING_TIMEOUT_MS);
    });

    socket.on(StudyRoomServerEvent.CLOSED, (payload: RoomClosedPayload) => {
      if (cancelled) return;
      setClosedMessage(payload.message);
      setParticipants([]);
      // The room is gone, so stop the socket rather than let it retry a join
      // that can only fail from here on.
      socket.disconnect();
    });

    socket.on(StudyRoomServerEvent.ERROR, (payload: RoomErrorPayload) => {
      if (cancelled) return;
      setError(payload.message);
    });

    socket.connect();

    const timers = typingTimers.current;
    return () => {
      cancelled = true;
      Object.values(timers).forEach((id) => window.clearTimeout(id));
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const sendMessage = useCallback(
    (body: string) => {
      const trimmed = body.trim();
      if (!trimmed || !roomId) return;
      socketRef.current?.emit(StudyRoomClientEvent.SEND_MESSAGE, { roomId, body: trimmed });
    },
    [roomId],
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!roomId) return;
      socketRef.current?.emit(StudyRoomClientEvent.TYPING, { roomId, isTyping });
    },
    [roomId],
  );

  const typingNames = useMemo(() => Object.values(typing), [typing]);

  return {
    status,
    error,
    closedMessage,
    self,
    participants,
    messages,
    typingNames,
    sendMessage,
    setTyping,
    socketRef,
  };
}

```

## frontend\src\hooks\useStudyRoomMedia.ts

```ts
import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import {
  StudyRoomClientEvent,
  StudyRoomServerEvent,
  type MediaStateBroadcastPayload,
  type ParticipantLeftPayload,
  type SignalBroadcastPayload,
  type StudyRoomParticipantDto,
} from "@scholarbase/shared-types";

/**
 * TURN is required whenever a peer sits behind a symmetric NAT; STUN alone is
 * enough for most campus/home networks. Supply VITE_ICE_SERVERS as a JSON
 * RTCIceServer[] to add a TURN server in production.
 */
function resolveIceServers(): RTCIceServer[] {
  const raw = import.meta.env.VITE_ICE_SERVERS;
  if (raw) {
    try {
      return JSON.parse(raw) as RTCIceServer[];
    } catch {
      console.warn("VITE_ICE_SERVERS is not valid JSON; falling back to public STUN/TURN");
    }
  }
  return [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: [
        "turn:openrelay.metered.ca:80",
        "turn:openrelay.metered.ca:443",
        "turn:openrelay.metered.ca:443?transport=tcp",
      ],
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ];
}

// --- capture constraints ---------------------------------------------------
//
// Everything here exists because this is a *mesh*: each participant uploads a
// separate copy of every track to every peer. Unconstrained, a 6-person room
// asked ~15 Mbps upstream of each device and simply collapsed. Use ideal/max
// and never `exact` — `exact` throws OverconstrainedError on cheap hardware and
// fails the join outright, which is far worse than a slightly-wrong resolution.

const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  // Mono is not cosmetic: it halves Opus's target and stops Chrome negotiating
  // stereo for a headset mic. sampleRate is deliberately left alone —
  // over-constraining it fails on cheap Android mics.
  channelCount: 1,
};

const CAMERA_CONSTRAINTS: MediaTrackConstraints = {
  // Tiles render ~300-400px wide, so capturing 640x480 to display at 320px is
  // pure waste. Camera is the secondary stream here; screen share is the point.
  width: { ideal: 320, max: 640 },
  height: { ideal: 180, max: 360 },
  frameRate: { ideal: 15, max: 20 },
  facingMode: "user",
};

const SCREEN_CONSTRAINTS: MediaTrackConstraints = {
  // Resolution is what we protect; frame rate is what we sacrifice. The content
  // is slides, PDFs and code — identical for seconds at a time. At ~4fps
  // scrolling looks steppy but text stays crisp, and crisp text is the whole
  // point. 720p is where a 14px font survives encoding.
  width: { ideal: 1280, max: 1920 },
  height: { ideal: 720, max: 1080 },
  frameRate: { ideal: 4, max: 8 },
};

// --- bitrate ceilings ------------------------------------------------------
//
// Constraints cap resolution and frame rate but NOT bitrate — without these the
// encoder still spends 1.5+ Mbps on a 720p5 screen share during a scroll burst.
// This is what actually bounds upstream.

const AUDIO_MAX_BITRATE = 32_000;
const SCREEN_MAX_FRAMERATE = 5;
const CAMERA_MAX_FRAMERATE = 15;

/**
 * Per-peer video ceilings, scaled by how many peers we're uploading to. In a
 * mesh each peer connection has its own encoder, so this gives per-recipient
 * control — strictly better than simulcast, which only pays off behind an SFU
 * and would triple encode cost on the low-end laptops we're trying to help.
 */
function screenBitrateFor(peerCount: number): number {
  if (peerCount <= 1) return 800_000;
  if (peerCount === 2) return 500_000;
  if (peerCount === 3) return 350_000;
  return 250_000;
}

function cameraBitrateFor(peerCount: number): number {
  return peerCount <= 2 ? 120_000 : 80_000;
}

/** `contentHint` is honoured more widely than `degradationPreference`. */
function setContentHint(track: MediaStreamTrack | null, hint: string) {
  if (track) (track as MediaStreamTrack & { contentHint: string }).contentHint = hint;
}

/**
 * setParameters is fussy: you must mutate the object returned by
 * getParameters() and hand it back, or Chrome rejects it with
 * InvalidModificationError. Chrome can also return an empty encodings array
 * before the first negotiation, hence the seed.
 */
async function applySenderParams(
  sender: RTCRtpSender | null,
  kind: "audio" | "video",
  peerCount: number,
  isScreen: boolean,
) {
  if (!sender) return;
  try {
    const params = sender.getParameters();
    if (!params.encodings || params.encodings.length === 0) {
      params.encodings = [{}];
    }
    const encoding = params.encodings[0] as RTCRtpEncodingParameters & {
      networkPriority?: string;
    };

    if (kind === "audio") {
      encoding.maxBitrate = AUDIO_MAX_BITRATE;
      // Audio must never degrade — make the bandwidth allocator starve video first.
      encoding.priority = "high";
      encoding.networkPriority = "high";
    } else {
      encoding.maxBitrate = isScreen ? screenBitrateFor(peerCount) : cameraBitrateFor(peerCount);
      encoding.maxFramerate = isScreen ? SCREEN_MAX_FRAMERATE : CAMERA_MAX_FRAMERATE;
      encoding.priority = "low";
      encoding.networkPriority = "low";
      // Scaled-down text is illegible while steppy text is fine, so a screen
      // share drops frames rather than resolution. A face is the opposite.
      (params as RTCRtpSendParameters & { degradationPreference?: string }).degradationPreference =
        isScreen ? "maintain-resolution" : "maintain-framerate";
    }

    await sender.setParameters(params);
  } catch {
    // Non-fatal: an uncapped stream is worse than a capped one, but far better
    // than a call that fails to start because a browser rejected a parameter.
  }
}

/**
 * One peer connection plus the senders we own on it. The senders are tracked
 * explicitly rather than re-found with
 * `getSenders().find((s) => s.track?.kind === "video")` — that idiom silently
 * breaks the moment a sender legitimately holds a null track (camera off),
 * because `s.track?.kind` is then `undefined` and never matches.
 */
interface PeerRecord {
  pc: RTCPeerConnection;
  audioSender: RTCRtpSender;
  videoSender: RTCRtpSender;
  /**
   * When we last sent an offer to this peer, so a negotiation that never gets
   * answered can be spotted and retried. Without this a single dropped offer
   * leaves the pair permanently unconnected while both sides believe a
   * connection is in progress.
   */
  offerSentAt?: number;
}

/**
 * How long to wait for an answer before assuming the offer was lost and
 * starting again. Generous: the far side may still be at the microphone
 * permission prompt, which is a human-speed delay.
 */
const OFFER_TIMEOUT_MS = 10_000;

/** How often the mesh is reconciled against the participant list. */
const MESH_RECONCILE_MS = 3000;

export interface UseStudyRoomMediaResult {
  inCall: boolean;
  isStarting: boolean;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenEnabled: boolean;
  hasVideoTrack: boolean;
  mediaError: string | null;
  joinCall: () => Promise<void>;
  leaveCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
}

/**
 * Mesh WebRTC over the study-room socket: every participant in the call holds
 * one RTCPeerConnection per peer. Fine for the handful of people a study room
 * holds, given the bitrate ceilings above; a large room would want an SFU.
 *
 * Calls are audio-first by design. Camera is opt-in and off by default, because
 * in a study room the valuable video is someone's slides or code, not faces.
 */
export function useStudyRoomMedia(
  roomId: string | undefined,
  socketRef: React.MutableRefObject<Socket | null>,
  participants: StudyRoomParticipantDto[],
  connected: boolean,
): UseStudyRoomMediaResult {
  const [inCall, setInCall] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [screenEnabled, setScreenEnabled] = useState(false);
  const [hasVideoTrack, setHasVideoTrack] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const peersRef = useRef(new Map<string, PeerRecord>());
  // ICE candidates can arrive before the answer sets the remote description;
  // holding them here avoids dropping candidates and stalling the connection.
  const pendingCandidatesRef = useRef(new Map<string, RTCIceCandidateInit[]>());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const inCallRef = useRef(false);
  const participantsRef = useRef(participants);
  participantsRef.current = participants;

  const emitMediaState = useCallback(
    (state: {
      inCall: boolean;
      audioEnabled: boolean;
      videoEnabled: boolean;
      screenEnabled: boolean;
    }) => {
      if (!roomId) return;
      socketRef.current?.emit(StudyRoomClientEvent.MEDIA_STATE, { roomId, ...state });
    },
    [roomId, socketRef],
  );

  /** Re-apply ceilings everywhere. Cheap, and the peer count feeds the maths. */
  const applyAllSenderParams = useCallback(() => {
    const peerCount = peersRef.current.size;
    const isScreen = screenStreamRef.current !== null;
    peersRef.current.forEach((record) => {
      void applySenderParams(record.audioSender, "audio", peerCount, isScreen);
      void applySenderParams(record.videoSender, "video", peerCount, isScreen);
    });
  }, []);

  const dropPeer = useCallback((socketId: string) => {
    const record = peersRef.current.get(socketId);
    if (record) {
      record.pc.onicecandidate = null;
      record.pc.ontrack = null;
      record.pc.onconnectionstatechange = null;
      record.pc.close();
      peersRef.current.delete(socketId);
    }
    pendingCandidatesRef.current.delete(socketId);
    setRemoteStreams((prev) => {
      if (!(socketId in prev)) return prev;
      const next = { ...prev };
      delete next[socketId];
      return next;
    });
  }, []);

  const createPeer = useCallback(
    (peerSocketId: string): PeerRecord => {
      const existing = peersRef.current.get(peerSocketId);
      if (existing) return existing;

      const pc = new RTCPeerConnection({
        iceServers: resolveIceServers(),
        // One transport for audio+video: a single ICE candidate set and, more
        // importantly, one TURN allocation instead of two — which directly
        // halves consumption of a metered free TURN quota.
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
        iceCandidatePoolSize: 2,
      });

      const audioTrack = localStreamRef.current?.getAudioTracks()[0] ?? null;
      const videoTrack =
        screenStreamRef.current?.getVideoTracks()[0] ??
        localStreamRef.current?.getVideoTracks()[0] ??
        null;

      // Transceivers are declared up front, in a fixed audio-then-video order,
      // even when we have no track to put in them yet. Three reasons:
      //   1. A video transceiver with a null track still creates a video m-line
      //      and a live sender, so turning the camera on or starting a screen
      //      share later is a replaceTrack with NO renegotiation.
      //   2. It must be sendrecv. replaceTrack does not change direction, and
      //      transceivers auto-created by setRemoteDescription come up recvonly,
      //      which would leave that peer permanently unable to send.
      //   3. The answerer matches our pre-created transceivers to the offer's
      //      m-lines by kind and order, so both sides must declare the same order.
      const audioTx = pc.addTransceiver(audioTrack ?? "audio", { direction: "sendrecv" });
      const videoTx = pc.addTransceiver(videoTrack ?? "video", { direction: "sendrecv" });

      const record: PeerRecord = {
        pc,
        audioSender: audioTx.sender,
        videoSender: videoTx.sender,
      };
      peersRef.current.set(peerSocketId, record);

      pc.onicecandidate = (event) => {
        if (!event.candidate || !roomId) return;
        socketRef.current?.emit(StudyRoomClientEvent.SIGNAL, {
          roomId,
          targetSocketId: peerSocketId,
          kind: "ice-candidate",
          data: event.candidate.toJSON(),
        });
      };

      // addTransceiver (unlike addTrack(track, stream)) does not associate a
      // stream, so event.streams is empty and the old `const [stream] =
      // event.streams` would silently never render anything. Build the stream
      // here instead, returning a NEW MediaStream each time so that VideoTile's
      // `el.srcObject !== stream` identity check still fires.
      pc.ontrack = (event) => {
        setRemoteStreams((prev) => {
          const existing = prev[peerSocketId];
          const kept = existing
            ? existing.getTracks().filter((t) => t.id !== event.track.id)
            : [];
          return { ...prev, [peerSocketId]: new MediaStream([...kept, event.track]) };
        });
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          dropPeer(peerSocketId);
        }
      };

      return record;
    },
    [dropPeer, roomId, socketRef],
  );

  const flushPendingCandidates = useCallback(async (socketId: string, pc: RTCPeerConnection) => {
    const queued = pendingCandidatesRef.current.get(socketId);
    if (!queued) return;
    pendingCandidatesRef.current.delete(socketId);
    for (const candidate of queued) {
      await pc.addIceCandidate(candidate).catch(() => undefined);
    }
  }, []);

  /**
   * Which side of a pair creates the offer, decided from the two socket ids.
   *
   * The old rule was "whoever joins the call offers to everyone already in it",
   * which breaks when two people join at nearly the same moment: each emits
   * `inCall: true` *before* building its offer list, so both can see the other
   * as already in the call and both send an offer. The second offer then
   * arrives while the receiver is in `have-local-offer`, `setRemoteDescription`
   * throws InvalidStateError, and that pair is dead for the rest of the session.
   *
   * Comparing ids removes the race by construction: both sides evaluate the
   * same comparison and reach opposite answers, so exactly one ever offers, no
   * matter who clicked first.
   */
  const shouldInitiateTo = useCallback(
    (peerSocketId: string) => {
      const selfId = socketRef.current?.id;
      if (!selfId) return false;
      return selfId < peerSocketId;
    },
    [socketRef],
  );

  const offerTo = useCallback(
    async (peerSocketId: string) => {
      if (!roomId) return;
      const record = createPeer(peerSocketId);
      const { pc } = record;

      // Never interrupt a negotiation that is already under way.
      if (pc.signalingState !== "stable") return;

      try {
        const offer = await pc.createOffer();
        // createOffer awaited; make sure nothing negotiated underneath us.
        if (pc.signalingState !== "stable") return;
        await pc.setLocalDescription(offer);
        record.offerSentAt = Date.now();
        socketRef.current?.emit(StudyRoomClientEvent.SIGNAL, {
          roomId,
          targetSocketId: peerSocketId,
          kind: "offer",
          data: offer,
        });
      } catch {
        // A failed setup is better rebuilt from scratch than left half-open;
        // the next reconcile pass will recreate it.
        dropPeer(peerSocketId);
      }
    },
    [createPeer, dropPeer, roomId, socketRef],
  );

  /**
   * Brings the mesh back in line with who is actually on the call.
   *
   * This is the safety net the old code lacked entirely: it assumed every peer
   * connection would be established by the joiner's one-shot offer loop and
   * that nothing could go wrong, so a single dropped or rejected offer meant
   * that pair simply never connected — with nothing to notice or retry. Running
   * this on join, on every participant change, and on a timer means a missing
   * link heals itself within a few seconds instead of lasting the whole session.
   */
  const ensureMesh = useCallback(() => {
    if (!inCallRef.current || !roomId) return;
    const selfId = socketRef.current?.id;
    if (!selfId) return;

    const onCall = new Set(
      participantsRef.current.filter((p) => p.inCall).map((p) => p.socketId),
    );

    // Tear down connections to anyone who has since left the call.
    for (const socketId of [...peersRef.current.keys()]) {
      if (!onCall.has(socketId)) dropPeer(socketId);
    }

    for (const peerSocketId of onCall) {
      if (peerSocketId === selfId) continue;

      const record = peersRef.current.get(peerSocketId);
      if (record) {
        const state = record.pc.connectionState;
        const stalled =
          record.pc.signalingState === "have-local-offer" &&
          record.offerSentAt !== undefined &&
          Date.now() - record.offerSentAt > OFFER_TIMEOUT_MS;

        // A failed connection, or an offer nobody ever answered, is rebuilt.
        if (state === "failed" || state === "closed" || stalled) {
          dropPeer(peerSocketId);
        } else {
          continue;
        }
      }

      // Only the designated side offers; the other waits for it. Its own
      // reconcile pass is what guarantees the offer eventually arrives.
      if (shouldInitiateTo(peerSocketId)) void offerTo(peerSocketId);
    }
  }, [dropPeer, offerTo, roomId, shouldInitiateTo, socketRef]);

  // --- signalling ---------------------------------------------------------
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !roomId) return;

    // Every branch is wrapped: an exception here used to reject the handler
    // silently and leave the connection half-negotiated with nothing to notice
    // or retry, which is how a single bad frame cost a pair the whole session.
    const handleSignal = async (payload: SignalBroadcastPayload) => {
      const from = payload.fromSocketId;

      try {
        if (payload.kind === "offer") {
          // Ignore offers until we are actually on the call and have a stream
          // to answer with. The sender's reconcile pass will re-offer, so a
          // dropped offer here is recoverable rather than terminal.
          if (!inCallRef.current) return;

          const pending = peersRef.current.get(from);
          if (pending && pending.pc.signalingState === "have-local-offer") {
            // Both sides offered — impossible under the id rule, but if it ever
            // happens, rebuilding from their offer is cheaper than trying to
            // reconcile two half-negotiations.
            dropPeer(from);
          }

          const { pc } = createPeer(from);
          await pc.setRemoteDescription(
            new RTCSessionDescription(payload.data as RTCSessionDescriptionInit),
          );
          await flushPendingCandidates(from, pc);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit(StudyRoomClientEvent.SIGNAL, {
            roomId,
            targetSocketId: from,
            kind: "answer",
            data: answer,
          });
          // Ceilings only stick once the sender has been negotiated.
          applyAllSenderParams();
          return;
        }

        const record = peersRef.current.get(from);
        if (!record) return;

        if (payload.kind === "answer") {
          // An answer is only valid against an outstanding local offer; out of
          // order it would throw and kill the connection.
          if (record.pc.signalingState !== "have-local-offer") return;

          await record.pc.setRemoteDescription(
            new RTCSessionDescription(payload.data as RTCSessionDescriptionInit),
          );
          record.offerSentAt = undefined;
          await flushPendingCandidates(from, record.pc);
          applyAllSenderParams();
          return;
        }

        if (payload.kind === "ice-candidate") {
          const candidate = payload.data as RTCIceCandidateInit;
          if (record.pc.remoteDescription) {
            await record.pc.addIceCandidate(candidate).catch(() => undefined);
          } else {
            const queued = pendingCandidatesRef.current.get(from) ?? [];
            queued.push(candidate);
            pendingCandidatesRef.current.set(from, queued);
          }
        }
      } catch {
        // Drop it and let the next reconcile pass rebuild from scratch.
        dropPeer(from);
      }
    };

    const handleMediaState = (payload: MediaStateBroadcastPayload) => {
      // The server echoes our own media state back so it can correct us — the
      // room allows one screen share at a time, and a refused claim arrives as
      // screenEnabled:false about our own socket.
      if (payload.socketId === socket.id) {
        if (!payload.screenEnabled) stopScreenShareRef.current(false);
        return;
      }
      // Tear down promptly when a peer leaves the call. The joining edge is
      // handled by reconciliation rather than here — assuming the newcomer
      // would always offer first is precisely what left pairs unconnected.
      if (!payload.inCall) dropPeer(payload.socketId);
    };

    const handleLeft = (payload: ParticipantLeftPayload) => dropPeer(payload.socketId);

    socket.on(StudyRoomServerEvent.SIGNAL, handleSignal);
    socket.on(StudyRoomServerEvent.MEDIA_STATE, handleMediaState);
    socket.on(StudyRoomServerEvent.PARTICIPANT_LEFT, handleLeft);

    return () => {
      socket.off(StudyRoomServerEvent.SIGNAL, handleSignal);
      socket.off(StudyRoomServerEvent.MEDIA_STATE, handleMediaState);
      socket.off(StudyRoomServerEvent.PARTICIPANT_LEFT, handleLeft);
    };
  }, [
    applyAllSenderParams,
    createPeer,
    dropPeer,
    flushPendingCandidates,
    roomId,
    socketRef,
    connected,
  ]);

  const joinCall = useCallback(async () => {
    if (inCallRef.current || isStarting || !roomId) return;

    setIsStarting(true);
    setMediaError(null);

    // Audio only. Camera is opt-in via toggleVideo, which is what keeps a
    // 4-person room at ~96 kbps upstream instead of megabits.
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: AUDIO_CONSTRAINTS,
        video: false,
      });
    } catch {
      setIsStarting(false);
      setMediaError("Could not access your microphone. Check browser permissions.");
      return;
    }

    setContentHint(stream.getAudioTracks()[0] ?? null, "speech");

    localStreamRef.current = stream;
    setLocalStream(stream);

    setHasVideoTrack(false);
    setAudioEnabled(true);
    setVideoEnabled(false);

    inCallRef.current = true;
    setInCall(true);
    setIsStarting(false);

    emitMediaState({
      inCall: true,
      audioEnabled: true,
      videoEnabled: false,
      screenEnabled: false,
    });

    // Connections are established by reconciliation rather than a one-shot loop
    // here. We offer only to the peers we are the designated initiator for; the
    // rest will offer to us once our `inCall` reaches them, and the periodic
    // pass repairs anything that goes missing in between.
    ensureMesh();

    applyAllSenderParams();
  }, [applyAllSenderParams, emitMediaState, ensureMesh, isStarting, roomId]);

  // Reconcile whenever the roster changes: somebody joining or leaving the call
  // is exactly when a link needs creating or tearing down. This is what the old
  // media-state handler deliberately skipped, on the assumption the other side
  // would always offer first.
  useEffect(() => {
    if (!inCall) return;
    ensureMesh();
  }, [participants, inCall, ensureMesh]);

  // Backstop for anything the event-driven passes miss — a lost offer, a peer
  // still at the mic prompt when we first tried, an ICE failure. Cheap: it only
  // touches connections that are actually absent or broken.
  useEffect(() => {
    if (!inCall) return;
    const timer = window.setInterval(ensureMesh, MESH_RECONCILE_MS);
    return () => window.clearInterval(timer);
  }, [inCall, ensureMesh]);

  const leaveCall = useCallback(() => {
    if (!inCallRef.current) return;

    inCallRef.current = false;
    setInCall(false);

    peersRef.current.forEach((_, socketId) => dropPeer(socketId));
    peersRef.current.clear();
    pendingCandidatesRef.current.clear();

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;

    setLocalStream(null);
    setRemoteStreams({});
    setHasVideoTrack(false);
    setVideoEnabled(false);
    setScreenEnabled(false);

    emitMediaState({
      inCall: false,
      audioEnabled: false,
      videoEnabled: false,
      screenEnabled: false,
    });
  }, [dropPeer, emitMediaState]);

  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const next = !stream.getAudioTracks().every((t) => t.enabled);
    stream.getAudioTracks().forEach((track) => (track.enabled = next));
    setAudioEnabled(next);
    // Tracks stay in the connection when muted, so no renegotiation is needed —
    // peers just need the flag to render the muted badge.
    emitMediaState({ inCall: true, audioEnabled: next, videoEnabled, screenEnabled });
  }, [emitMediaState, videoEnabled, screenEnabled]);

  /**
   * Camera is acquired lazily the first time it's switched on, and genuinely
   * released when switched off — `track.enabled = false` alone keeps the camera
   * light on and still sends black frames at a low but nonzero bitrate.
   */
  const toggleVideo = useCallback(async () => {
    const stream = localStreamRef.current;
    if (!stream || !inCallRef.current) return;

    const existing = stream.getVideoTracks()[0];

    if (existing) {
      existing.stop();
      stream.removeTrack(existing);
      setHasVideoTrack(false);
      setVideoEnabled(false);

      // Only hand the senders a null track if the screen share isn't currently
      // occupying them, otherwise turning the camera off would kill the share.
      if (!screenStreamRef.current) {
        peersRef.current.forEach((record) => {
          void record.videoSender.replaceTrack(null).catch(() => undefined);
        });
      }
      emitMediaState({ inCall: true, audioEnabled, videoEnabled: false, screenEnabled });
      return;
    }

    let camStream: MediaStream;
    try {
      camStream = await navigator.mediaDevices.getUserMedia({
        video: CAMERA_CONSTRAINTS,
        audio: false,
      });
    } catch {
      setMediaError("Could not access your camera. Check browser permissions.");
      return;
    }

    const camTrack = camStream.getVideoTracks()[0];
    if (!camTrack) return;
    setContentHint(camTrack, "motion");
    stream.addTrack(camTrack);
    setHasVideoTrack(true);
    setVideoEnabled(true);

    // No renegotiation: the video transceiver already exists on every peer.
    if (!screenStreamRef.current) {
      peersRef.current.forEach((record) => {
        void record.videoSender.replaceTrack(camTrack).catch(() => undefined);
      });
      applyAllSenderParams();
    }

    emitMediaState({ inCall: true, audioEnabled, videoEnabled: true, screenEnabled });
  }, [applyAllSenderParams, audioEnabled, emitMediaState, screenEnabled]);

  /** Put the camera back on the wire (or clear it) after a screen share ends. */
  const restoreCameraTrack = useCallback(() => {
    const camTrack = localStreamRef.current?.getVideoTracks()[0] ?? null;
    peersRef.current.forEach((record) => {
      void record.videoSender.replaceTrack(camTrack).catch(() => undefined);
    });
    applyAllSenderParams();
  }, [applyAllSenderParams]);

  /**
   * `notify: false` is for the case where the *server* told us the share ended
   * (our claim on the room's single presenter slot was refused) — echoing that
   * back would be a pointless round-trip.
   */
  const stopScreenShare = useCallback(
    (notify: boolean) => {
      if (!screenStreamRef.current) return;

      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setScreenEnabled(false);
      restoreCameraTrack();

      if (!notify) return;
      const camOn = (localStreamRef.current?.getVideoTracks()[0]?.enabled ?? false) === true;
      const micOn = localStreamRef.current?.getAudioTracks().some((t) => t.enabled) ?? false;
      emitMediaState({
        inCall: true,
        audioEnabled: micOn,
        videoEnabled: camOn,
        screenEnabled: false,
      });
    },
    [emitMediaState, restoreCameraTrack],
  );
  const stopScreenShareRef = useRef(stopScreenShare);
  stopScreenShareRef.current = stopScreenShare;

  const toggleScreenShare = useCallback(async () => {
    // Note there is no longer a `!localStreamRef.current.getVideoTracks()`
    // style gate: a student who joined with no camera has a video *transceiver*
    // regardless, so screen sharing works for them like anyone else.
    if (!inCallRef.current) return;

    if (screenStreamRef.current) {
      stopScreenShare(true);
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: SCREEN_CONSTRAINTS,
        audio: false,
        // Keeps ScholarBase itself out of the picker, which is what students
        // pick by accident to produce the infinite-mirror effect.
        selfBrowserSurface: "exclude",
        surfaceSwitching: "include",
      } as DisplayMediaStreamOptions);

      const displayTrack = displayStream.getVideoTracks()[0];
      if (!displayTrack) return;

      setContentHint(displayTrack, "text");
      screenStreamRef.current = displayStream;
      setScreenEnabled(true);

      // Fires when the user stops sharing from the browser's own UI rather than
      // our button, which is the common case.
      displayTrack.onended = () => stopScreenShareRef.current(true);

      peersRef.current.forEach((record) => {
        void record.videoSender.replaceTrack(displayTrack).catch(() => undefined);
      });
      // Re-apply after the swap: camera and screen want very different ceilings
      // and degradation preferences, and Chrome does not carry them across a
      // replaceTrack reliably.
      applyAllSenderParams();

      const micOn = localStreamRef.current?.getAudioTracks().some((t) => t.enabled) ?? false;
      emitMediaState({
        inCall: true,
        audioEnabled: micOn,
        videoEnabled,
        screenEnabled: true,
      });
    } catch {
      // User dismissed the OS picker — not an error worth surfacing.
    }
  }, [applyAllSenderParams, emitMediaState, stopScreenShare, videoEnabled]);

  // Never leave the camera light on after navigating away. The Map instance is
  // created once and only mutated, so capturing it here is the same registry
  // the cleanup needs to drain.
  const peers = peersRef.current;
  useEffect(() => {
    return () => {
      peers.forEach((record) => record.pc.close());
      peers.clear();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      inCallRef.current = false;
    };
  }, [peers, roomId]);

  return {
    inCall,
    isStarting,
    localStream,
    remoteStreams,
    audioEnabled,
    videoEnabled,
    screenEnabled,
    hasVideoTrack,
    mediaError,
    joinCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };
}

```

## frontend\src\hooks\useWhiteboard.ts

```ts
import { useCallback, useEffect, useMemo, useState, type MutableRefObject } from "react";
import type { Socket } from "socket.io-client";
import {
  StudyRoomClientEvent,
  StudyRoomServerEvent,
  type WhiteboardDrawRequestedPayload,
  type WhiteboardGrantsPayload,
  type WhiteboardStateDto,
  type WhiteboardStroke,
  type WhiteboardStrokeBroadcastPayload,
  type WhiteboardUndoBroadcastPayload,
} from "@scholarbase/shared-types";

export interface PendingDrawRequest {
  userId: string;
  fullName: string;
  at: number;
}

/**
 * Client half of the shared whiteboard.
 *
 * Board state lives on the server and arrives over the same socket as chat and
 * signalling, so it works for students whose peer connection never establishes —
 * nothing here touches WebRTC.
 *
 * The server does NOT echo your own strokes back to you: the drawer renders
 * locally as the pointer moves, and an echo would fight the in-progress line.
 * So local strokes are appended here, remote ones arrive by event.
 */
export function useWhiteboard(
  roomId: string | undefined,
  socketRef: MutableRefObject<Socket | null>,
  connected: boolean,
  selfUserId: string | undefined,
  selfSocketId: string | undefined,
) {
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);
  const [ownerSocketId, setOwnerSocketId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [grants, setGrants] = useState<string[]>([]);
  const [requests, setRequests] = useState<PendingDrawRequest[]>([]);
  /** Bumped whenever strokes change structurally (sync/undo/clear) so the
   * canvas knows a full repaint is needed rather than an incremental draw. */
  const [repaintToken, setRepaintToken] = useState(0);

  const isOwner = Boolean(selfSocketId && ownerSocketId === selfSocketId);
  const canDraw = isOwner || Boolean(selfUserId && grants.includes(selfUserId));
  const isOpen = ownerSocketId !== null || strokes.length > 0;

  const emit = useCallback(
    (event: StudyRoomClientEvent, payload: Record<string, unknown>) => {
      if (!roomId) return;
      socketRef.current?.emit(event, { roomId, ...payload });
    },
    [roomId, socketRef],
  );

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !connected) return;

    const onState = (payload: WhiteboardStateDto) => {
      if (payload.roomId !== roomId) return;
      setStrokes(payload.strokes);
      setOwnerSocketId(payload.ownerSocketId);
      setOwnerName(payload.ownerName);
      setGrants(payload.grants);
      setRepaintToken((n) => n + 1);
    };

    const onStroke = (payload: WhiteboardStrokeBroadcastPayload) => {
      if (payload.roomId !== roomId) return;
      setStrokes((prev) => appendChunk(prev, payload));
    };

    const onUndo = (payload: WhiteboardUndoBroadcastPayload) => {
      if (payload.roomId !== roomId) return;
      setStrokes((prev) => prev.filter((s) => s.id !== payload.strokeId));
      setRepaintToken((n) => n + 1);
    };

    const onCleared = (payload: { roomId: string }) => {
      if (payload.roomId !== roomId) return;
      setStrokes([]);
      setRepaintToken((n) => n + 1);
    };

    const onGrants = (payload: WhiteboardGrantsPayload) => {
      if (payload.roomId !== roomId) return;
      setOwnerSocketId(payload.ownerSocketId);
      setOwnerName(payload.ownerName);
      setGrants(payload.grants);
    };

    const onRequested = (payload: WhiteboardDrawRequestedPayload) => {
      if (payload.roomId !== roomId) return;
      setRequests((prev) =>
        // One pending entry per person, refreshed if they ask again.
        [
          ...prev.filter((r) => r.userId !== payload.userId),
          { userId: payload.userId, fullName: payload.fullName, at: Date.now() },
        ],
      );
    };

    socket.on(StudyRoomServerEvent.WHITEBOARD_STATE, onState);
    socket.on(StudyRoomServerEvent.WHITEBOARD_STROKE, onStroke);
    socket.on(StudyRoomServerEvent.WHITEBOARD_UNDO, onUndo);
    socket.on(StudyRoomServerEvent.WHITEBOARD_CLEARED, onCleared);
    socket.on(StudyRoomServerEvent.WHITEBOARD_GRANTS, onGrants);
    socket.on(StudyRoomServerEvent.WHITEBOARD_DRAW_REQUESTED, onRequested);

    return () => {
      socket.off(StudyRoomServerEvent.WHITEBOARD_STATE, onState);
      socket.off(StudyRoomServerEvent.WHITEBOARD_STROKE, onStroke);
      socket.off(StudyRoomServerEvent.WHITEBOARD_UNDO, onUndo);
      socket.off(StudyRoomServerEvent.WHITEBOARD_CLEARED, onCleared);
      socket.off(StudyRoomServerEvent.WHITEBOARD_GRANTS, onGrants);
      socket.off(StudyRoomServerEvent.WHITEBOARD_DRAW_REQUESTED, onRequested);
    };
  }, [connected, roomId, socketRef]);

  /** Applied to our own chunks too, so the drawer sees their line immediately. */
  const applyLocalChunk = useCallback((chunk: WhiteboardStrokeBroadcastPayload) => {
    setStrokes((prev) => appendChunk(prev, chunk));
  }, []);

  const claim = useCallback(() => emit(StudyRoomClientEvent.WHITEBOARD_CLAIM, {}), [emit]);
  const release = useCallback(() => emit(StudyRoomClientEvent.WHITEBOARD_RELEASE, {}), [emit]);
  const clear = useCallback(() => emit(StudyRoomClientEvent.WHITEBOARD_CLEAR, {}), [emit]);
  const undo = useCallback(() => emit(StudyRoomClientEvent.WHITEBOARD_UNDO, {}), [emit]);
  const requestDraw = useCallback(
    () => emit(StudyRoomClientEvent.WHITEBOARD_REQUEST_DRAW, {}),
    [emit],
  );

  const grant = useCallback(
    (userId: string) => {
      emit(StudyRoomClientEvent.WHITEBOARD_GRANT, { userId });
      setRequests((prev) => prev.filter((r) => r.userId !== userId));
    },
    [emit],
  );

  const revoke = useCallback(
    (userId: string) => emit(StudyRoomClientEvent.WHITEBOARD_REVOKE, { userId }),
    [emit],
  );

  const dismissRequest = useCallback((userId: string) => {
    setRequests((prev) => prev.filter((r) => r.userId !== userId));
  }, []);

  const sendChunk = useCallback(
    (chunk: { strokeId: string; color: string; width: number; points: number[]; done: boolean }) => {
      emit(StudyRoomClientEvent.WHITEBOARD_STROKE, chunk);
    },
    [emit],
  );

  return useMemo(
    () => ({
      strokes,
      repaintToken,
      ownerSocketId,
      ownerName,
      grants,
      requests,
      isOwner,
      canDraw,
      isOpen,
      claim,
      release,
      clear,
      undo,
      grant,
      revoke,
      requestDraw,
      dismissRequest,
      sendChunk,
      applyLocalChunk,
    }),
    [
      strokes,
      repaintToken,
      ownerSocketId,
      ownerName,
      grants,
      requests,
      isOwner,
      canDraw,
      isOpen,
      claim,
      release,
      clear,
      undo,
      grant,
      revoke,
      requestDraw,
      dismissRequest,
      sendChunk,
      applyLocalChunk,
    ],
  );
}

/** Adds a chunk to the matching stroke, or starts it if this is its first. */
function appendChunk(
  prev: WhiteboardStroke[],
  chunk: WhiteboardStrokeBroadcastPayload,
): WhiteboardStroke[] {
  const index = prev.findIndex((s) => s.id === chunk.strokeId);
  if (index === -1) {
    return [
      ...prev,
      {
        id: chunk.strokeId,
        authorId: chunk.authorId,
        authorName: chunk.authorName,
        color: chunk.color,
        width: chunk.width,
        points: [...chunk.points],
      },
    ];
  }

  const next = [...prev];
  const existing = next[index];
  next[index] = { ...existing, points: [...existing.points, ...chunk.points] };
  return next;
}

/** Batching interval for outgoing points. Emitting per pointermove floods the
 * gateway; ~30ms keeps the line smooth while collapsing many moves into one
 * frame. */
export const WHITEBOARD_FLUSH_MS = 30;

/** Small helper the canvas uses to keep an id stable for one stroke. */
export function newStrokeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export type UseWhiteboard = ReturnType<typeof useWhiteboard>;

```

## frontend\src\index.css

```css
@import "@fontsource/poppins/400.css";
@import "@fontsource/poppins/500.css";
@import "@fontsource/poppins/600.css";
@import "@fontsource/poppins/700.css";
@import "@fontsource/poppins/800.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /*
   * --background is the page; --surface is anything raised off it (cards,
   * header, inputs). They used to be the same value, which is why cards were
   * invisible: a white card on a white page separated only by a 1.24:1 border.
   * Keeping them distinct is what gives the UI depth in both themes.
   */
  :root {
    color-scheme: light;

    --background: #f6f7f9;
    --surface: #ffffff;
    --surface-hover: #f9fafb;
    --muted: #eef0f3;
    --foreground: #111827;
    --foreground-muted: #5b6472;
    --foreground-subtle: #8a929e;
    --border: #e3e6ea;
    /* Separate token for *interactive* edges (inputs, selects). WCAG 1.4.11
       wants >=3:1 for control boundaries, which the soft --border used for
       decorative card edges and dividers does not meet — an input outlined at
       1.25:1 is barely perceptible. */
    --border-control: #89929e;

    /* Brand colour as *text on a surface*. The raw maroon is only legible on
       light backgrounds, so this token carries a lightened counterpart for
       dark rather than every call site remembering a dark: variant. */
    --brand-text: #850013;

    --success: #15803d;
    --success-bg: #dcfce7;
    --warning: #b45309;
    --warning-bg: #fef3c7;
    --danger: #b91c1c;
    --danger-bg: #fee2e2;

    --shadow-card: 0 1px 2px rgb(16 24 40 / 0.04), 0 1px 3px rgb(16 24 40 / 0.06);
    --shadow-card-hover: 0 8px 24px rgb(16 24 40 / 0.10), 0 2px 6px rgb(16 24 40 / 0.06);

    --bg-pattern: radial-gradient(circle at 1px 1px, #dfe3e8 1px, transparent 0);
  }

  .dark {
    color-scheme: dark;

    --background: #0a0c12;
    --surface: #141824;
    --surface-hover: #1c2130;
    --muted: #232937;
    --foreground: #f3f5f7;
    --foreground-muted: #a3adbb;
    --foreground-subtle: #78828f;
    --border: #2a3140;
    --border-control: #5b6675;

    /* Lighter, desaturated status hues — the light-mode 700s are unreadable
       on a dark surface. */
    --brand-text: #eb9aa6;

    --success: #4ade80;
    --success-bg: #10261a;
    --warning: #fbbf24;
    --warning-bg: #2a2008;
    --danger: #f87171;
    --danger-bg: #2b1416;

    /* Shadows barely read on dark; elevation comes from --surface being
       lighter than --background, so keep these subtle. */
    --shadow-card: 0 1px 2px rgb(0 0 0 / 0.40);
    --shadow-card-hover: 0 8px 24px rgb(0 0 0 / 0.55);

    --bg-pattern: radial-gradient(circle at 1px 1px, #1b2130 1px, transparent 0);
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    background-image: var(--bg-pattern);
    background-size: 24px 24px;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-extrabold tracking-tight;
  }

  /* One consistent focus ring everywhere, offset against the page so it stays
     visible on both light and dark surfaces. */
  :focus-visible {
    @apply outline-none ring-2 ring-primary-500 ring-offset-2;
    --tw-ring-offset-color: var(--background);
  }

  ::selection {
    background-color: rgb(133 0 19 / 0.18);
  }
}

@layer utilities {
  /* Respect users who ask for less motion — the app leans on transitions,
     hover lifts and a fade-in-up on every route change. */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

```

## frontend\src\lib\api\academic.ts

```ts
import type {
  CreateSubjectDto,
  CreateYearLevelDto,
  SubjectDto,
  YearLevelDto,
} from "@scholarbase/shared-types";
import { apiClient } from "../api-client";

export const yearLevelsApi = {
  list: () => apiClient.get<YearLevelDto[]>("/year-levels").then((r) => r.data),
  create: (body: CreateYearLevelDto) =>
    apiClient.post<YearLevelDto>("/year-levels", body).then((r) => r.data),
};

export const subjectsApi = {
  listByYear: (yearLevelId: string) =>
    apiClient.get<SubjectDto[]>("/subjects", { params: { yearLevelId } }).then((r) => r.data),
  list: (params: { yearLevelId?: string; department?: string; semester?: number }) =>
    apiClient.get<SubjectDto[]>("/subjects", { params }).then((r) => r.data),
  get: (id: string) => apiClient.get<SubjectDto>(`/subjects/${id}`).then((r) => r.data),
  create: (body: CreateSubjectDto) =>
    apiClient.post<SubjectDto>("/subjects", body).then((r) => r.data),
};

```

## frontend\src\lib\api\auth.ts

```ts
import type {
  AuthResponseDto,
  ForgotPasswordResponseDto,
  LoginRequestDto,
  ResendVerificationResponseDto,
  SignupRequestDto,
  SignupResponseDto,
  UserDto,
  VerifyEmailResponseDto,
} from "@scholarbase/shared-types";
import { apiClient } from "../api-client";

export const authApi = {
  // Returns a message, not a session — the account is unusable until the
  // emailed confirmation link is opened.
  signup: (body: SignupRequestDto) =>
    apiClient.post<SignupResponseDto>("/auth/signup", body).then((r) => r.data),
  login: (body: LoginRequestDto) =>
    apiClient.post<AuthResponseDto>("/auth/login", body).then((r) => r.data),
  logout: (refreshToken: string) => apiClient.post("/auth/logout", { refreshToken }),
  me: () => apiClient.get<UserDto>("/auth/me").then((r) => r.data),
  forgotPassword: (email: string) =>
    apiClient
      .post<ForgotPasswordResponseDto>("/auth/forgot-password", { email })
      .then((r) => r.data),
  resetPassword: (token: string, password: string) =>
    apiClient.post("/auth/reset-password", { token, password }),
  verifyEmail: (token: string) =>
    apiClient.post<VerifyEmailResponseDto>("/auth/verify-email", { token }).then((r) => r.data),
  resendVerification: (email: string) =>
    apiClient
      .post<ResendVerificationResponseDto>("/auth/resend-verification", { email })
      .then((r) => r.data),
};

```

## frontend\src\lib\api\create-file-resource-api.ts

```ts
import type { DownloadUrlDto, FileViewUrlDto } from "@scholarbase/shared-types";
import { apiClient } from "../api-client";

/**
 * Builds the client for a file-backed resource — list by subject, get a
 * download URL, get an inline-view URL, upload.
 *
 * `papersApi` and `notesApi` used to be two hand-written copies of this exact
 * shape, differing only in the resource DTO and the URL segment. That's fine
 * for two, but it's the pattern that breaks the third time: a new file-backed
 * resource (assignments, syllabus, whatever comes next) would either copy a
 * third time or, worse, copy and quietly diverge — e.g. one gaining `getViewUrl`
 * before the others did, which is exactly what happened here before this was
 * extracted. A new resource is now `createFileResourceApi<ItsDto>("its-route")`.
 *
 * Deliberately excludes anything resource-specific (papers filter by exam
 * type + year, notes don't) — those still belong on each resource's own
 * client, built alongside a call to this factory rather than folded into it.
 */
export function createFileResourceApi<TResourceDto>(resourcePath: string) {
  return {
    listBySubject: (subjectId: string) =>
      apiClient.get<TResourceDto[]>(`/${resourcePath}`, { params: { subjectId } }).then((r) => r.data),
    getDownloadUrl: (id: string) =>
      apiClient.get<DownloadUrlDto>(`/${resourcePath}/${id}/download`).then((r) => r.data),
    getViewUrl: (id: string) =>
      apiClient.get<FileViewUrlDto>(`/${resourcePath}/${id}/view`).then((r) => r.data),
    upload: (form: FormData) =>
      apiClient.post<TResourceDto>(`/${resourcePath}`, form).then((r) => r.data),
  };
}

```

## frontend\src\lib\api\exam-types.ts

```ts
import type { CreateExamTypeDto, ExamTypeDto } from "@scholarbase/shared-types";
import { apiClient } from "../api-client";

export const examTypesApi = {
  list: () => apiClient.get<ExamTypeDto[]>("/exam-types").then((r) => r.data),
  create: (body: CreateExamTypeDto) =>
    apiClient.post<ExamTypeDto>("/exam-types", body).then((r) => r.data),
};

```

## frontend\src\lib\api\notes.ts

```ts
import type { NoteDto } from "@scholarbase/shared-types";
import { createFileResourceApi } from "./create-file-resource-api";

export const notesApi = createFileResourceApi<NoteDto>("notes");

```

## frontend\src\lib\api\papers.ts

```ts
import type { QuestionPaperDto } from "@scholarbase/shared-types";
import { createFileResourceApi } from "./create-file-resource-api";

export const papersApi = createFileResourceApi<QuestionPaperDto>("papers");

```

## frontend\src\lib\api\study-rooms.ts

```ts
import {
  STUDY_ROOM_INVITE_PATH,
  type CreateStudyRoomRequestDto,
  type StudyRoomDto,
  type StudyRoomMessageDto,
} from "@scholarbase/shared-types";
import { apiClient } from "../api-client";

/** Builds the shareable link for a room the current user is allowed to invite to. */
export function buildInviteUrl(inviteCode: string): string {
  return `${window.location.origin}${STUDY_ROOM_INVITE_PATH}/${inviteCode}`;
}

export const studyRoomsApi = {
  list: () => apiClient.get<StudyRoomDto[]>("/study-rooms").then((r) => r.data),
  redeemInvite: (invite: string) =>
    apiClient.post<StudyRoomDto>("/study-rooms/join", { invite }).then((r) => r.data),
  /** Admin-only: every open room, including private ones, for moderation. */
  listAllForAdmin: () =>
    apiClient.get<StudyRoomDto[]>("/study-rooms/admin/all").then((r) => r.data),
  get: (id: string) => apiClient.get<StudyRoomDto>(`/study-rooms/${id}`).then((r) => r.data),
  messages: (id: string) =>
    apiClient.get<StudyRoomMessageDto[]>(`/study-rooms/${id}/messages`).then((r) => r.data),
  create: (body: CreateStudyRoomRequestDto) =>
    apiClient.post<StudyRoomDto>("/study-rooms", body).then((r) => r.data),
  close: (id: string) => apiClient.delete<void>(`/study-rooms/${id}`).then((r) => r.data),
};

```

## frontend\src\lib\api-client.ts

```ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AuthResponseDto } from "@scholarbase/shared-types";
import { authStorage } from "./auth-storage";

const baseURL = `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"}/api`;

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const { data } = await axios.post<AuthResponseDto>(`${baseURL}/auth/refresh`, { refreshToken });
  authStorage.setSession(data.accessToken, data.refreshToken, data.user);
  return data.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const accessToken = await refreshPromise;
        original.headers.set("Authorization", `Bearer ${accessToken}`);
        return apiClient(original);
      } catch {
        authStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

```

## frontend\src\lib\auth-storage.ts

```ts
import type { UserDto } from "@scholarbase/shared-types";

const ACCESS_TOKEN_KEY = "scholarbase.accessToken";
const REFRESH_TOKEN_KEY = "scholarbase.refreshToken";
const USER_KEY = "scholarbase.user";

export const authStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  getUser: (): UserDto | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserDto) : null;
  },
  setSession: (accessToken: string, refreshToken: string, user: UserDto) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  setAccessToken: (accessToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

```

## frontend\src\lib\contributors.ts

```ts
/**
 * Students who have sent in papers, and what they sent.
 *
 * Deliberately a plain list in code rather than a database table: crediting
 * someone is a one-line edit and a deploy, which is faster than building admin
 * CRUD for it, and the list is small enough that nobody needs to search it. If
 * it grows past a page or two, that is the moment to move it into Prisma.
 *
 * To add someone, append an entry — newest last is fine, the page sorts by
 * nothing and renders them in order:
 *
 *   { name: "Full Name", department: "IT", year: 2, tags: ["SEM 3 papers"] }
 */
export interface Contributor {
  name: string;
  /** Department code as it appears in the navigation: IT, CS, AI & DS, ... */
  department: string;
  /** Year of study when they contributed, or null if they'd rather not say. */
  year: number | null;
  /**
   * Short labels for what they gave — one per distinct contribution, e.g.
   * "SEM 3 end-term papers", "RE-ETE papers", "DBMS notes". These render as
   * badges, so keep them to a few words.
   */
  tags: string[];
}

export const CONTRIBUTORS: Contributor[] = [];

```

## frontend\src\lib\exam-types.ts

```ts
/**
 * "RE-ETE" is college shorthand nobody outside MMCOE would recognise, and a
 * junior seeing it for the first time has no way to tell it apart from the
 * normal end-term paper. Both pages that render an RE-ETE section show this
 * line under the heading, so the meaning lives in one place.
 */
export const RE_ETE_DESCRIPTION =
  "Re-examination of the end-term paper — the second attempt offered so a failed subject doesn't become a back.";

```

## frontend\src\lib\query-client.ts

```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

```

## frontend\src\lib\site.ts

```ts
/**
 * Where students should write in. Kept as a constant rather than typed into
 * each page, so changing the address is one edit and can never leave a stale
 * copy behind on a page nobody remembered to update.
 */
export const CONTACT_EMAIL = "shreyashmandlapure2024.it@mmcoe.edu.in";

/**
 * The only domain signup accepts. The backend is the real authority — it
 * checks the allowed_email_domains table — so this constant exists purely to
 * tell students what to expect before they fill the form in.
 */
export const SIGNUP_EMAIL_DOMAIN = "@mmcoe.edu.in";

```

## frontend\src\lib\study-room-socket.ts

```ts
import { io, type Socket } from "socket.io-client";
import { STUDY_ROOM_NAMESPACE } from "@scholarbase/shared-types";
import { authStorage } from "./auth-storage";

const apiOrigin = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

/**
 * The gateway authenticates the handshake, so the access token is read fresh
 * on every connection attempt — a reconnect after a token refresh then picks
 * up the new token instead of retrying with the stale one.
 */
export function createStudyRoomSocket(): Socket {
  return io(`${apiOrigin}${STUDY_ROOM_NAMESPACE}`, {
    transports: ["websocket"],
    autoConnect: false,
    auth: (cb) => cb({ token: authStorage.getAccessToken() ?? "" }),
  });
}

```

## frontend\src\lib\utils.ts

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```

## frontend\src\lib\video-content-rect.ts

```ts
/**
 * Where the picture actually sits inside a `<video object-contain>` element.
 *
 * The screen-share tile letterboxes: a 16:9 capture in a taller box leaves bars
 * above and below, and the picture occupies only part of the element. Pointer
 * coordinates therefore have to be measured against the *picture*, not the
 * element — mapping to the element box puts every dot offset by the bar height,
 * and the error changes with each viewer's window shape.
 *
 * Returns offsets and size in CSS pixels relative to the element's top-left.
 */
export interface VideoContentRect {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export function videoContentRect(video: HTMLVideoElement): VideoContentRect {
  const box = video.getBoundingClientRect();
  const intrinsicW = video.videoWidth;
  const intrinsicH = video.videoHeight;

  // Before metadata loads there is no aspect ratio to honour, so treat the
  // whole element as the picture rather than dividing by zero.
  if (!intrinsicW || !intrinsicH) {
    return { offsetX: 0, offsetY: 0, width: box.width, height: box.height };
  }

  // object-contain scales to fit, preserving aspect ratio.
  const scale = Math.min(box.width / intrinsicW, box.height / intrinsicH);
  const width = intrinsicW * scale;
  const height = intrinsicH * scale;

  return {
    offsetX: (box.width - width) / 2,
    offsetY: (box.height - height) / 2,
    width,
    height,
  };
}

/**
 * Pointer position -> normalized picture coordinates, or null when the pointer
 * is over a letterbox bar rather than the picture itself.
 */
export function pointerToNormalized(
  video: HTMLVideoElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const box = video.getBoundingClientRect();
  const content = videoContentRect(video);
  if (content.width <= 0 || content.height <= 0) return null;

  const x = (clientX - box.left - content.offsetX) / content.width;
  const y = (clientY - box.top - content.offsetY) / content.height;

  if (x < 0 || x > 1 || y < 0 || y > 1) return null;
  return { x, y };
}

/** Normalized picture coordinates -> CSS pixels within the element, for
 * positioning an overlay dot. */
export function normalizedToOffset(
  video: HTMLVideoElement,
  x: number,
  y: number,
): { left: number; top: number } {
  const content = videoContentRect(video);
  return {
    left: content.offsetX + x * content.width,
    top: content.offsetY + y * content.height,
  };
}

```

## frontend\src\main.tsx

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

```

## frontend\src\routes\AppLayout.tsx

```tsx
import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { DEPARTMENTS } from "@scholarbase/shared-types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Moon, Sun } from "lucide-react";
import { ScholarBoyWidget } from "@/components/ai/ScholarBoyWidget";

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  // The pre-paint script in index.html has already set the class from
  // localStorage / prefers-color-scheme, so reading it here is the source of
  // truth rather than a guess that always started light.
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Follow the OS only while the user hasn't made an explicit choice.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem("scholarbase-theme") === null) setIsDark(e.matches);
      } catch {
        setIsDark(e.matches);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("scholarbase-theme", next ? "dark" : "light");
      } catch {
        /* storage blocked — the toggle still works for this session */
      }
      return next;
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-pill focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-md supports-[backdrop-filter]:bg-surface/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight text-brand"
            aria-label="ScholarBase home"
          >
            {/* The dark variant used to go *darker* (primary-600 on a near-black
                surface, 2.47:1). On a dark background the accent has to move up
                the ramp, not down. */}
            ScholarBase<span className="text-primary-400 dark:text-primary-300">.</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-1">
            {DEPARTMENTS.map((dept) => (
              <Link
                key={dept.code}
                to={`/departments/${dept.code}`}
                className="rounded-pill px-4 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-primary/10 hover:text-brand"
              >
                {dept.label}
              </Link>
            ))}
            {user && (
              <Link
                to="/study-rooms"
                className="rounded-pill px-4 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-primary/10 hover:text-brand"
              >
                Study Rooms
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-pill px-4 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-primary/10 hover:text-brand"
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="px-2"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
            
            {user ? (
              <>
                <span className="hidden text-sm font-medium text-foreground-muted sm:inline">
                  {user.fullName}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 animate-fade-in-up">
        <Outlet />
      </main>

      {/* Both pages live here rather than in the header nav: that row already
          carries seven departments and wraps on a phone, and a ninth link would
          push the sign-up button off the first line. */}
      <footer className="mt-8 border-t border-border bg-surface py-8 text-center text-sm text-foreground-muted">
        <nav className="mb-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link to="/instructions" className="font-medium transition-colors hover:text-brand">
            How it works
          </Link>
          <Link to="/contribute" className="font-medium transition-colors hover:text-brand">
            Contribute papers
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} ScholarBase. Built for students.</p>
      </footer>
      <ScholarBoyWidget />
    </div>
  );
}

```

## frontend\src\routes\pages\AdminPage.tsx

```tsx
import { useMemo, useRef, useState, type FormEvent } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { yearLevelsApi, subjectsApi } from "@/lib/api/academic";
import { examTypesApi } from "@/lib/api/exam-types";
import { papersApi } from "@/lib/api/papers";
import { notesApi } from "@/lib/api/notes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminStudyRooms } from "@/components/study-room/AdminStudyRooms";
import {
  SubjectCombobox,
  type SubjectComboboxHandle,
} from "@/components/admin/SubjectCombobox";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function AdminPage() {
  const queryClient = useQueryClient();
  const { data: yearLevels } = useQuery({ queryKey: ["year-levels"], queryFn: yearLevelsApi.list });
  const { data: examTypes } = useQuery({ queryKey: ["exam-types"], queryFn: examTypesApi.list });

  const subjectQueries = useQueries({
    queries: (yearLevels ?? []).map((y) => ({
      queryKey: ["subjects", y.id],
      queryFn: () => subjectsApi.listByYear(y.id),
    })),
  });
  const allSubjects = useMemo(
    () => subjectQueries.flatMap((q) => q.data ?? []),
    [subjectQueries],
  );

  // --- Year level ---
  const [yearNumber, setYearNumber] = useState("1");
  const [yearLabel, setYearLabel] = useState("");
  const createYearLevel = useMutation({
    mutationFn: () => yearLevelsApi.create({ yearNumber: Number(yearNumber), label: yearLabel }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["year-levels"] });
      setYearLabel("");
    },
  });

  // --- Subject ---
  const [subjectYearLevelId, setSubjectYearLevelId] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectSemester, setSubjectSemester] = useState("");
  const [subjectDepartment, setSubjectDepartment] = useState("");
  const createSubject = useMutation({
    mutationFn: () =>
      subjectsApi.create({ 
        yearLevelId: subjectYearLevelId, 
        code: subjectCode, 
        name: subjectName,
        semester: subjectSemester ? Number(subjectSemester) : undefined,
        department: subjectDepartment.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setSubjectCode("");
      setSubjectName("");
      setSubjectSemester("");
      setSubjectDepartment("");
    },
  });

  // --- Exam type ---
  const [examTypeName, setExamTypeName] = useState("");
  const createExamType = useMutation({
    mutationFn: () => examTypesApi.create({ name: examTypeName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-types"] });
      setExamTypeName("");
    },
  });

  // --- Upload paper ---
  const paperSubjectRef = useRef<SubjectComboboxHandle>(null);
  const [paperExamTypeId, setPaperExamTypeId] = useState("");
  const [paperYear, setPaperYear] = useState(String(new Date().getFullYear()));
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const uploadPaper = useMutation({
    mutationFn: (subjectId: string) => {
      const form = new FormData();
      form.append("subjectId", subjectId);
      form.append("examTypeId", paperExamTypeId);
      form.append("academicYear", paperYear);
      form.append("file", paperFile!);
      return papersApi.upload(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["papers"] });
      setPaperFile(null);
      paperSubjectRef.current?.reset();
    },
  });

  const handleUploadPaper = async (e: FormEvent) => {
    e.preventDefault();
    // Resolve the typed subject to an id (creating it if new) before uploading,
    // so a subject-entry problem surfaces on the field instead of as a failed
    // upload.
    let subjectId: string;
    try {
      subjectId = await paperSubjectRef.current!.resolve();
    } catch {
      return;
    }
    uploadPaper.mutate(subjectId);
  };

  // --- Upload note ---
  const noteSubjectRef = useRef<SubjectComboboxHandle>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const uploadNote = useMutation({
    mutationFn: (subjectId: string) => {
      const form = new FormData();
      form.append("subjectId", subjectId);
      form.append("title", noteTitle);
      form.append("file", noteFile!);
      return notesApi.upload(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setNoteTitle("");
      setNoteFile(null);
      noteSubjectRef.current?.reset();
    },
  });

  const handleUploadNote = async (e: FormEvent) => {
    e.preventDefault();
    let subjectId: string;
    try {
      subjectId = await noteSubjectRef.current!.resolve();
    } catch {
      return;
    }
    uploadNote.mutate(subjectId);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl">Admin</h1>

      <Section title="Study rooms">
        <p className="mb-2 text-sm text-foreground-muted">
          Every open room, including private ones. Closing a room ends the session and removes
          everyone from it.
        </p>
        <AdminStudyRooms />
      </Section>

      <Section title="Add year level">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            createYearLevel.mutate();
          }}
        >
          <Input
            className="w-24"
            type="number"
            min={1}
            max={4}
            value={yearNumber}
            onChange={(e) => setYearNumber(e.target.value)}
          />
          <Input
            placeholder="Label, e.g. First Year"
            value={yearLabel}
            onChange={(e) => setYearLabel(e.target.value)}
            required
          />
          <Button type="submit" disabled={createYearLevel.isPending}>
            Add
          </Button>
        </form>
      </Section>

      <Section title="Add subject">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            createSubject.mutate();
          }}
        >
          <select
            className="h-10 rounded-lg border border-control bg-surface px-3 text-sm text-foreground"
            value={subjectYearLevelId}
            onChange={(e) => setSubjectYearLevelId(e.target.value)}
            required
          >
            <option value="">Year level</option>
            {yearLevels?.map((y) => (
              <option key={y.id} value={y.id}>
                {y.label}
              </option>
            ))}
          </select>
          <Input
            className="w-24"
            placeholder="Code, e.g. CS201"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            required
          />
          <Input
            placeholder="Name, e.g. Data Structures"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            required
          />
          <Input
            className="w-24"
            type="number"
            placeholder="Sem"
            value={subjectSemester}
            onChange={(e) => setSubjectSemester(e.target.value)}
          />
          <Input
            className="w-32"
            placeholder="Department"
            value={subjectDepartment}
            onChange={(e) => setSubjectDepartment(e.target.value)}
          />
          <Button type="submit" disabled={createSubject.isPending}>
            Add
          </Button>
        </form>
      </Section>

      <Section title="Add exam type">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            createExamType.mutate();
          }}
        >
          <Input
            placeholder="e.g. End Semester"
            value={examTypeName}
            onChange={(e) => setExamTypeName(e.target.value)}
            required
          />
          <Button type="submit" disabled={createExamType.isPending}>
            Add
          </Button>
        </form>
      </Section>

      <Section title="Upload question paper">
        <form className="flex flex-wrap items-start gap-3" onSubmit={handleUploadPaper}>
          <div className="min-w-[16rem]">
            <SubjectCombobox ref={paperSubjectRef} subjects={allSubjects} yearLevels={yearLevels ?? []} />
          </div>
          <select
            className="h-10 rounded-lg border border-control bg-surface px-3 text-sm text-foreground"
            value={paperExamTypeId}
            onChange={(e) => setPaperExamTypeId(e.target.value)}
            required
          >
            <option value="">Exam type</option>
            {examTypes?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <Input
            className="w-28"
            type="number"
            value={paperYear}
            onChange={(e) => setPaperYear(e.target.value)}
            required
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPaperFile(e.target.files?.[0] ?? null)}
            required
          />
          <Button type="submit" disabled={uploadPaper.isPending || !paperFile}>
            Upload
          </Button>
        </form>
        {uploadPaper.isError && (
          <p className="mt-2 text-sm text-danger">Upload failed — check the file and try again.</p>
        )}
      </Section>

      <Section title="Upload notes">
        <form className="flex flex-wrap items-start gap-3" onSubmit={handleUploadNote}>
          <div className="min-w-[16rem]">
            <SubjectCombobox ref={noteSubjectRef} subjects={allSubjects} yearLevels={yearLevels ?? []} />
          </div>
          <Input
            placeholder="Title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            required
          />
          <input type="file" onChange={(e) => setNoteFile(e.target.files?.[0] ?? null)} required />
          <Button type="submit" disabled={uploadNote.isPending || !noteFile}>
            Upload
          </Button>
        </form>
        {uploadNote.isError && (
          <p className="mt-2 text-sm text-danger">Upload failed — check the file and try again.</p>
        )}
      </Section>
    </div>
  );
}

```

## frontend\src\routes\pages\ContributePage.tsx

```tsx
import { Link } from "react-router-dom";
import { Award, Camera, Check, FileUp, Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CONTRIBUTORS } from "@/lib/contributors";
import { CONTACT_EMAIL } from "@/lib/site";

/**
 * How students send papers in, and the wall of credit for the ones who have.
 *
 * Contributions arrive by email rather than through an upload form. That is a
 * deliberate limit, not an oversight: papers have to be checked for the right
 * subject, year and exam before they go into the archive, and an open upload
 * endpoint would mean anyone could put anything in front of juniors revising
 * from it.
 */

/** Pre-filled so a student doesn't have to work out what to tell us. */
const MAIL_SUBJECT = "ScholarBase paper contribution";
const MAIL_BODY = [
  "Name:",
  "Department:",
  "Year:",
  "Semester:",
  "Subject (name and code):",
  "Exam (Unit Test / End Term / RE-ETE):",
  "Academic year of the paper:",
  "",
  "Files attached: ",
].join("\n");

const mailtoHref =
  `mailto:${CONTACT_EMAIL}` +
  `?subject=${encodeURIComponent(MAIL_SUBJECT)}` +
  `&body=${encodeURIComponent(MAIL_BODY)}`;

export function ContributePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-3xl">Contribute</h1>
      <p className="mb-10 max-w-2xl text-foreground-muted">
        MMCOE went autonomous in 2024-25, and the papers set since then exist almost nowhere —
        mostly on the phones of the students who sat them. Every paper you send is one a junior
        won&apos;t have to revise without. You&apos;ll be credited by name on this page.
      </p>

      <section className="mb-12">
        <h2 className="mb-5 text-2xl">What&apos;s worth sending</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question papers</CardTitle>
              <CardDescription>The main thing the archive is missing.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-foreground-muted">
              Unit Test, End Term or RE-ETE, from any year you&apos;ve sat. Papers from your own
              semester are the most useful — nobody else has them yet.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
              <CardDescription>Your own, or a teacher&apos;s handout.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-foreground-muted">
              Unit-wise notes and solved answers help most. Only send material you wrote or are
              allowed to share.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Corrections</CardTitle>
              <CardDescription>Quiet but valuable.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-foreground-muted">
              A paper filed under the wrong subject, a wrong year, a page missing, a file that
              won&apos;t open — tell us and it gets fixed.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-1 flex items-center gap-2 text-2xl">
          <Mail className="h-5 w-5 text-brand" aria-hidden="true" />
          How to send them
        </h2>
        <p className="mb-5 text-sm text-foreground-muted">
          By email, from your college address, so we know a real MMCOE student sent it.
        </p>

        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="flex gap-3">
              <FileUp className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <p className="font-semibold text-foreground">
                  Attach the files and tell us what they are
                </p>
                <p className="mt-0.5 text-sm text-foreground-muted">
                  Department, year, semester, subject name and code, which exam, and the academic
                  year of the paper. Without those it can&apos;t be filed, and a paper filed in the
                  wrong place is no use to anyone.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Camera className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <p className="font-semibold text-foreground">Photos are fine — PDFs are better</p>
                <p className="mt-0.5 text-sm text-foreground-muted">
                  If you&apos;re photographing a paper, get every page, keep the whole page in
                  frame, and check the small print is readable before you send it. Any free scanner
                  app will combine the shots into one PDF.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <p className="font-semibold text-foreground">Everything is checked before it goes up</p>
                <p className="mt-0.5 text-sm text-foreground-muted">
                  Papers are reviewed and uploaded by hand, which is why there is no upload button
                  here. Nothing with someone&apos;s roll number, marks or personal details on it
                  will be published — crop it out, or say so and it will be cropped for you.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
              <Button asChild>
                <a href={mailtoHref}>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Email your papers
                </a>
              </Button>
              <p className="text-sm text-foreground-muted">
                Or write directly to{" "}
                <a
                  className="break-all font-medium text-brand hover:underline"
                  href={`mailto:${CONTACT_EMAIL}`}
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="mb-1 flex items-center gap-2 text-2xl">
          <Award className="h-5 w-5 text-brand" aria-hidden="true" />
          How you get credited
        </h2>
        <p className="mb-5 max-w-2xl text-sm text-foreground-muted">
          Every contributor is listed below with their name, department and a tag saying what they
          gave — &quot;SEM 3 end-term papers&quot;, &quot;RE-ETE papers&quot;, &quot;DBMS
          notes&quot;. Send more, get more tags. If you&apos;d rather not be named, say so in your
          mail and your contribution goes up without your name attached.
        </p>

        {CONTRIBUTORS.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                <Award className="h-6 w-6 text-brand" aria-hidden="true" />
              </div>
              <p className="font-semibold text-foreground">No contributors listed yet</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-foreground-muted">
                The archive is being built from scratch. Send the papers from your semester and
                yours will be the first name here.
              </p>
              <div className="mt-5">
                <Button asChild variant="outline">
                  <a href={mailtoHref}>Be the first</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CONTRIBUTORS.map((c) => (
              <Card key={`${c.name}-${c.department}`}>
                <CardHeader>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <CardDescription>
                    {c.department}
                    {c.year !== null && ` · Year ${c.year}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {c.tags.map((tag) => (
                    <Badge key={tag} variant="success">
                      <Check className="mr-1 inline h-3 w-3" aria-hidden="true" />
                      {tag}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
            <div>
              <p className="font-semibold text-foreground">Not sure what&apos;s already here?</p>
              <p className="text-sm text-foreground-muted">
                Check your semester first — no point scanning a paper we already have.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link to="/">Browse the archive</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/instructions">How the site works</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

```

## frontend\src\routes\pages\DepartmentPage.tsx

```tsx
import { Link, Navigate, useParams } from "react-router-dom";
import { DEPARTMENTS } from "@scholarbase/shared-types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const YEAR_NUMBERS = [1, 2, 3, 4];

export function DepartmentPage() {
  const { dept } = useParams<{ dept: string }>();
  const department = DEPARTMENTS.find((d) => d.code === dept);

  if (!department) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl">{department.label}</h1>
      <p className="mb-8 text-foreground-muted">Choose your year.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {YEAR_NUMBERS.map((year) => (
          <Link key={year} to={`/departments/${department.code}/years/${year}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>Year {year}</CardTitle>
                <CardDescription>
                  Sem {year * 2 - 1} &amp; Sem {year * 2}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

```

## frontend\src\routes\pages\DepartmentYearPage.tsx

```tsx
import { Link, Navigate, useParams } from "react-router-dom";
import { DEPARTMENTS } from "@scholarbase/shared-types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function DepartmentYearPage() {
  const { dept, yearNumber } = useParams<{ dept: string; yearNumber: string }>();
  const department = DEPARTMENTS.find((d) => d.code === dept);
  const year = Number(yearNumber);

  if (!department || !year || year < 1 || year > 4) {
    return <Navigate to="/" replace />;
  }

  const semesters = [year * 2 - 1, year * 2];

  return (
    <div>
      <h1 className="mb-2 text-3xl">
        {department.label} — Year {year}
      </h1>
      <p className="mb-8 text-foreground-muted">Choose a semester.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {semesters.map((sem) => (
          <Link key={sem} to={`/departments/${department.code}/years/${year}/semesters/${sem}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>Semester {sem}</CardTitle>
                <CardDescription>Unit tests &amp; end term papers</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

```

## frontend\src\routes\pages\ForgotPasswordPage.tsx

```tsx
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { authApi } from "@/lib/api/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Same reasoning as LoginPage: this acts on an existing account, so the
    // signup allowlist doesn't apply. Blocking other domains here would leave
    // the admin with no way to recover their own password. It would also
    // reintroduce the enumeration leak this page is careful to avoid — a
    // client-side rejection is an observable difference between addresses.
    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.message);
    } catch {
      // The server answers identically for known and unknown addresses; a
      // network failure shouldn't be the one case that leaks a difference, so
      // the confirmation is shown either way.
      setMessage("If that email has an account, a reset link is on its way.");
    } finally {
      setSent(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>
            Enter your college email and we&apos;ll send you a link to set a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="flex flex-col gap-4">
              <p
                role="status"
                className="rounded-lg bg-success-bg px-3 py-2 text-sm font-medium text-success"
              >
                {message}
              </p>
              <p className="text-sm text-foreground-muted">
                The link expires in an hour and can only be used once. Check your spam folder if it
                doesn&apos;t arrive in a few minutes.
              </p>
              <Button asChild variant="outline">
                <Link to="/login">Back to log in</Link>
              </Button>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <Field
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="username@mmcoe.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && (
                <p role="alert" className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
              <p className="text-center text-sm text-foreground-muted">
                Remembered it?{" "}
                <Link to="/login" className="font-semibold text-brand">
                  Log in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

```

## frontend\src\routes\pages\GoogleCallbackPage.tsx

```tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api/auth";

export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSessionFromOAuth } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (!accessToken || !refreshToken) {
      navigate("/login", { replace: true });
      return;
    }

    // Since we need the user profile to set the session fully, we fetch it first.
    // The tokens are set temporarily for the authApi to use them.
    const fetchUserAndSetSession = async () => {
      try {
        // Temporarily store in localStorage just to make the `/auth/me` request work
        // Alternatively, since authApi uses axios interceptors that read from authStorage,
        // we can set the session with a dummy user first, then update it.
        // Or we can just pass the token in headers manually for this single request.
        
        // Easiest is to set with a dummy user, fetch real user, and update.
        setSessionFromOAuth(accessToken, refreshToken, {} as any);
        const user = await authApi.me();
        setSessionFromOAuth(accessToken, refreshToken, user);
        
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Failed to fetch user during Google OAuth callback", err);
        navigate("/login", { replace: true });
      }
    };

    fetchUserAndSetSession();
  }, [searchParams, navigate, setSessionFromOAuth]);

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-foreground-muted">Completing log in...</p>
    </div>
  );
}

```

## frontend\src\routes\pages\HomePage.tsx

```tsx
import { Link } from "react-router-dom";
import { DEPARTMENTS } from "@scholarbase/shared-types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Monitor, Code, Brain, Radio, Settings, Zap, LucideIcon, BookOpen } from "lucide-react";

const getDepartmentIcon = (code: string): LucideIcon => {
  switch (code) {
    case "IT": return Monitor;
    case "CS": return Code;
    case "AIDS": return Brain;
    case "ENTC": return Radio;
    case "MECH": return Settings;
    case "ELEC": return Zap;
    default: return BookOpen;
  }
};

export function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="mb-16 mt-8 flex flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-brand">
          Welcome to your new academic hub
        </div>
        <h1 className="mb-4 bg-gradient-to-r from-primary-700 to-primary-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl dark:from-primary-400 dark:to-primary-200">
          Ace Your Exams <br /> with ScholarBase
        </h1>
        <p className="max-w-2xl text-lg text-foreground-muted sm:text-xl">
          Access previous year question papers, collaborate in live study rooms, and get instant answers to your doubts.
        </p>
      </section>

      {/* Departments Grid */}
      <div className="w-full">
        <h2 className="mb-6 text-2xl font-bold">Explore Departments</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {DEPARTMENTS.map((dept) => {
            const Icon = getDepartmentIcon(dept.code);
            return (
              <Link key={dept.code} to={`/departments/${dept.code}`}>
                <Card interactive className="group h-full text-center">
                  <CardHeader className="items-center">
                    <div className="mb-3 rounded-full bg-primary/10 p-3 text-brand transition-transform group-hover:scale-110 group-hover:bg-primary/20">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <CardTitle className="transition-colors group-hover:text-brand">
                      {dept.label}
                    </CardTitle>
                    <CardDescription>Department</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

```

## frontend\src\routes\pages\InstructionsPage.tsx

```tsx
import { Link } from "react-router-dom";
import {
  BookOpen,
  Download,
  Eye,
  FileText,
  Lock,
  Mail,
  MonitorUp,
  PenLine,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL, SIGNUP_EMAIL_DOMAIN } from "@/lib/site";

/**
 * What the site does and what each kind of visitor can reach.
 *
 * Every rule stated here is enforced by the backend, not just drawn by the UI —
 * the free-paper limit, the domain allowlist and the verification gate all live
 * in the API. Keep this page in step with those rules: a page that promises
 * access the server refuses is worse than no page at all.
 */

/** One row of the access table. `has` drives the tick/lock, so it can't drift from the label. */
function AccessRow({ has, children }: { has: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 py-1.5 text-sm">
      <span
        className={
          has
            ? "mt-0.5 shrink-0 font-bold text-success"
            : "mt-0.5 shrink-0 font-bold text-foreground-subtle"
        }
        aria-hidden="true"
      >
        {has ? "✓" : "✕"}
      </span>
      <span className={has ? "text-foreground" : "text-foreground-muted"}>{children}</span>
    </li>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-brand">
        {n}
      </span>
      <div className="pb-5">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-foreground-muted">{children}</p>
      </div>
    </li>
  );
}

export function InstructionsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-3xl">How ScholarBase works</h1>
      <p className="mb-10 max-w-2xl text-foreground-muted">
        An archive of MMCOE question papers, notes, and study rooms — built after the college went
        autonomous, so juniors aren&apos;t left without a single past paper to practise from. This
        page explains what you can reach at each stage and how to use it.
      </p>

      <section className="mb-12">
        <h2 className="mb-1 text-2xl">What you can access</h2>
        <p className="mb-5 text-sm text-foreground-muted">
          These limits are enforced by the server, not just hidden in the interface.
        </p>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Badge variant="muted">Stage 1</Badge>
              <CardTitle className="text-lg">Not signed in</CardTitle>
              <CardDescription>Browse freely, read one paper.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul>
                <AccessRow has>Browse every department, year, semester and subject</AccessRow>
                <AccessRow has>See exactly which papers exist, and for which year</AccessRow>
                <AccessRow has>
                  Open and download <strong>one question paper per semester</strong> — the most
                  recent year&apos;s paper is the free one
                </AccessRow>
                <AccessRow has={false}>Every other question paper</AccessRow>
                <AccessRow has={false}>Notes</AccessRow>
                <AccessRow has={false}>Study rooms</AccessRow>
              </ul>
              <p className="mt-3 text-xs text-foreground-muted">
                Locked papers still appear in the lists on purpose — you can see how much is in the
                archive before deciding to sign up. Hover one and it offers you the login.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge variant="muted">Stage 2</Badge>
              <CardTitle className="text-lg">Signed up, not confirmed</CardTitle>
              <CardDescription>The account exists but can&apos;t be used yet.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul>
                <AccessRow has>Everything a signed-out visitor gets</AccessRow>
                <AccessRow has={false}>
                  Logging in — it is refused, with a message, until you open the confirmation link
                </AccessRow>
              </ul>
              <p className="mt-3 text-xs text-foreground-muted">
                Signing up sends a confirmation link to your college inbox and logs you in to
                nothing. The link is single-use and expires in 24 hours; if it lapses or never
                arrives, use the resend option on the login page.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge variant="success">Stage 3</Badge>
              <CardTitle className="text-lg">Confirmed and logged in</CardTitle>
              <CardDescription>The whole archive, and study rooms.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul>
                <AccessRow has>
                  Every question paper — Unit Test, End Term and RE-ETE — with no per-semester limit
                </AccessRow>
                <AccessRow has>Read papers in the browser, or download the file</AccessRow>
                <AccessRow has>Notes for every subject</AccessRow>
                <AccessRow has>
                  Study rooms: create, join, chat, camera, mic, screen share and the whiteboard
                </AccessRow>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-1 flex items-center gap-2 text-2xl">
          <Mail className="h-5 w-5 text-brand" aria-hidden="true" />
          Creating your account
        </h2>
        <p className="mb-5 text-sm text-foreground-muted">
          Only current MMCOE students can register.
        </p>
        <Card>
          <CardContent className="pt-6">
            <ol>
              <Step n={1} title={`Use your college email — ${SIGNUP_EMAIL_DOMAIN} only`}>
                Signup rejects every other domain, Gmail included. If you have more than one college
                address, any of them works as long as it ends in {SIGNUP_EMAIL_DOMAIN}.
              </Step>
              <Step n={2} title="Pick a password you don't use elsewhere">
                Passwords are stored hashed, never in plain text — but reusing a password across
                sites is still the way most accounts get taken over.
              </Step>
              <Step n={3} title="Open the confirmation link in your inbox">
                It proves the address is really yours. Until you open it, logging in is refused. The
                link works once and expires after 24 hours.
              </Step>
              <Step n={4} title="Nothing arrived? Check spam, then resend">
                College mail filters are aggressive. The login page has a resend option, and
                forgotten passwords have their own reset link on the same page.
              </Step>
            </ol>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild>
                <Link to="/signup">Create an account</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/login">Log in</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="mb-1 flex items-center gap-2 text-2xl">
          <FileText className="h-5 w-5 text-brand" aria-hidden="true" />
          Finding and reading a paper
        </h2>
        <p className="mb-5 text-sm text-foreground-muted">
          Once you&apos;re logged in, nothing is locked.
        </p>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Getting there</CardTitle>
            </CardHeader>
            <CardContent>
              <ol>
                <Step n={1} title="Pick your department from the top menu">
                  IT, CS, AI &amp; DS, ENTC, MECH or ELEC.
                </Step>
                <Step n={2} title="Choose your year, then the semester">
                  Each semester page lists every subject in it.
                </Step>
                <Step n={3} title="Papers are grouped by exam">
                  <strong>Unit Test</strong>, <strong>End Term</strong>, and{" "}
                  <strong>RE-ETE</strong> — the re-examination paper for a subject you have to sit
                  again. Each subject row shows a pill per academic year available.
                </Step>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Opening the file</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Download className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-foreground">Straight from the semester page</p>
                  <p className="text-sm text-foreground-muted">
                    Click the year pill next to a subject and the PDF downloads immediately.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Eye className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-foreground">Or read it in the browser</p>
                  <p className="text-sm text-foreground-muted">
                    Click the <strong>subject name</strong> to open its page, then{" "}
                    <strong>View</strong> to read the PDF without leaving the site, or{" "}
                    <strong>Download</strong> to keep a copy. That page also has a{" "}
                    <strong>Notes</strong> tab.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-foreground-subtle" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-foreground">Seeing a padlock?</p>
                  <p className="text-sm text-foreground-muted">
                    You&apos;re signed out, or your session expired. Log in and it unlocks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-1 flex items-center gap-2 text-2xl">
          <Users className="h-5 w-5 text-brand" aria-hidden="true" />
          Study rooms
        </h2>
        <p className="mb-5 max-w-2xl text-sm text-foreground-muted">
          Built to replace the usual routine of a Meet link in one tab and a shared drive in
          another. Everything runs in the browser — nothing to install, and no meeting to schedule.
          Study rooms need a confirmed account.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-4 w-4 text-brand" aria-hidden="true" />
                Starting or joining a room
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground-muted">
              <p>
                <strong className="text-foreground">Public rooms</strong> appear in the list for
                every student — anyone can walk in.
              </p>
              <p>
                <strong className="text-foreground">Private rooms</strong> are reachable only
                through their invite link. Copy it from inside the room and share it; paste a link
                (or just the code) into the join box to get in. The link is the key, so only send it
                to people you want in the room.
              </p>
              <p>
                The room owner can close a room, which removes everyone still in it. An admin may
                also join for moderation, and everyone is shown when one is present.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MonitorUp className="h-4 w-4 text-brand" aria-hidden="true" />
                Talking and sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground-muted">
              <p>
                Camera and microphone are off until you switch them on, and text chat works whether
                or not you do.
              </p>
              <p>
                <strong className="text-foreground">One person shares their screen at a time</strong>
                , so the room can&apos;t end up with two people fighting over the view.
              </p>
              <p>
                While someone is sharing, move your cursor over the shared picture and everyone sees
                a red pointer with your name on it — the fastest way to say &quot;this line
                here&quot; without describing where you mean.
              </p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PenLine className="h-4 w-4 text-brand" aria-hidden="true" />
                The whiteboard
              </CardTitle>
              <CardDescription>
                Separate from screen sharing — you can run both at once.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground-muted">
              <p>
                Whoever opens the board holds the pen. Everyone else watches live and can ask for
                the pen; the holder grants it per person, and can hand it over completely or clear
                the board.
              </p>
              <p>
                Nothing drawn is stored. Once everyone has left the room the board is wiped — with a
                short grace period first, so reloading your tab or dropping off Wi-Fi for a moment
                doesn&apos;t cost you the working.
              </p>
              <p className="text-xs">
                A room joined on a locked-down college or hostel network may fail to connect video
                even when chat works fine. That is the network blocking peer-to-peer traffic, not
                your account.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-brand" aria-hidden="true" />
              Something missing?
            </CardTitle>
            <CardDescription>
              The archive is only as complete as what students send in.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link to="/contribute">Contribute papers</Link>
            </Button>
            <p className="text-sm text-foreground-muted">
              Found a broken file or a paper filed under the wrong subject? Mail{" "}
              <a className="break-all font-medium text-brand hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

```

## frontend\src\routes\pages\JoinStudyRoomPage.tsx

```tsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { studyRoomsApi } from "@/lib/api/study-rooms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Landing page for a shared invite link. Redeems the code, then drops the user
 * straight into the room. Sits behind ProtectedRoute, so an anonymous visitor
 * is sent to log in first and returns here afterwards.
 */
export function JoinStudyRoomPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  // StrictMode runs effects twice in dev; redeeming twice is harmless but the
  // double navigation is not, so the attempt is guarded.
  const attempted = useRef(false);

  useEffect(() => {
    if (!inviteCode || attempted.current) return;
    attempted.current = true;

    studyRoomsApi
      .redeemInvite(inviteCode)
      .then((room) => {
        queryClient.invalidateQueries({ queryKey: ["study-rooms"] });
        navigate(`/study-rooms/${room.id}`, { replace: true });
      })
      .catch(() => setError("That invite link is not valid, or the room has been closed."));
  }, [inviteCode, navigate, queryClient]);

  if (error) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-foreground-muted">{error}</p>
          <Button asChild className="mt-4">
            <Link to="/study-rooms">Back to study rooms</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <p className="text-center text-sm text-foreground-muted">Opening the study room...</p>;
}

```

## frontend\src\routes\pages\LoginPage.tsx

```tsx
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUnverified(false);
    setIsSubmitting(true);

    // No domain check here on purpose. The allowlist governs who may *register*
    // — it is enforced server-side at signup against allowed_email_domains. A
    // login only ever concerns an account that already passed that check, so
    // re-applying a hardcoded domain here does nothing for security and locks
    // out any account outside it: notably the seeded admin
    // (admin@youruniversity.edu.in), who would then be unable to reach the
    // upload panel at all.
    try {
      await login({ email, password });
      const from = (location.state as { from?: Location })?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    } catch (err) {
      const res = (err as { response?: { status?: number; data?: { message?: string } } })?.response;
      // 403 is the unconfirmed-account gate, and its message is actionable, so
      // it is shown verbatim. Everything else stays deliberately generic so a
      // wrong password can't be told apart from an address that isn't
      // registered.
      if (res?.status === 403) {
        setIsUnverified(true);
        setError(res.data?.message ?? "Confirm your email before logging in.");
      } else {
        setError("Invalid email or password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Welcome back — pick up where you left off.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button asChild variant="outline" className="w-full">
              <a href={`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"}/api/auth/google`}>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Continue with Google
              </a>
            </Button>
            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-foreground-muted">Or continue with email</span>
              </div>
            </div>
          </div>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="username@mmcoe.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="-mt-1 text-right">
              <Link to="/forgot-password" className="text-xs font-semibold text-brand">
                Forgot password?
              </Link>
            </div>
            {/* role=alert so the failure is announced, not just recoloured. */}
            {error && (
              <div className="flex flex-col gap-1">
                <p role="alert" className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
                  {error}
                </p>
                {/* An unconfirmed account is a dead end without this — the 403
                    tells them to check their inbox, but the link may have
                    expired or never arrived. */}
                {isUnverified && (
                  <Link to="/verify-email" className="text-xs font-semibold text-brand">
                    Resend confirmation email
                  </Link>
                )}
              </div>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-foreground-muted">
            No account? <Link to="/signup" className="font-semibold text-brand">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

```

## frontend\src\routes\pages\NotFoundPage.tsx

```tsx
import { Link, useLocation } from "react-router-dom";
import { Compass, Home, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Catch-all for unmatched routes.
 *
 * Without this the app rendered nothing at all: React Router matched no child,
 * so the layout route never rendered and #root stayed empty. Vercel's SPA
 * rewrite serves index.html for every path, so any typo, stale bookmark or old
 * shared link showed a student a blank white page with no way back.
 */
export function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <Compass className="h-6 w-6 text-brand" aria-hidden="true" />
          </div>
          <CardTitle>This page doesn&apos;t exist</CardTitle>
          <CardDescription>
            We couldn&apos;t find <span className="font-semibold">{location.pathname}</span>. The
            link may be old, or the address may have a typo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/">
                <Home className="h-4 w-4" aria-hidden="true" />
                Back to home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/study-rooms">
                <Search className="h-4 w-4" aria-hidden="true" />
                Study rooms
              </Link>
            </Button>
          </div>
          <p className="text-sm text-foreground-muted">
            Looking for a question paper? Pick your department from the menu above, then choose a
            year and semester.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

```

## frontend\src\routes\pages\ResetPasswordPage.tsx

```tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MIN_PASSWORD_LENGTH } from "@scholarbase/shared-types";
import { authApi } from "@/lib/api/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not reset your password. The link may have expired.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Reset link missing</CardTitle>
            <CardDescription>
              This page needs the link from your reset email to work.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/forgot-password">Request a new link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>{done ? "Password updated" : "Choose a new password"}</CardTitle>
          {!done && (
            <CardDescription>
              Setting a new password signs you out everywhere else.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="flex flex-col gap-4">
              <p
                role="status"
                className="rounded-lg bg-success-bg px-3 py-2 text-sm font-medium text-success"
              >
                Your password has been changed. You can log in with it now.
              </p>
              <Button onClick={() => navigate("/login", { replace: true })}>Go to log in</Button>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <Field
                label="New password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                hint={`Minimum ${MIN_PASSWORD_LENGTH} characters.`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
              <Field
                label="Confirm new password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Type it again"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                error={mismatch ? "Those passwords don't match." : undefined}
                required
              />
              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger"
                >
                  {error}
                </p>
              )}
              <Button type="submit" disabled={isSubmitting || mismatch}>
                {isSubmitting ? "Updating..." : "Update password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

```

## frontend\src\routes\pages\SemesterPage.tsx

```tsx
import { Link, Navigate, useParams } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import {
  DEPARTMENTS,
  EXAM_TYPE_LABELS,
  type QuestionPaperDto,
  type SubjectDto,
} from "@scholarbase/shared-types";
import { subjectsApi } from "@/lib/api/academic";
import { examTypesApi } from "@/lib/api/exam-types";
import { papersApi } from "@/lib/api/papers";
import { RE_ETE_DESCRIPTION } from "@/lib/exam-types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function PaperRow({
  subject,
  papers,
  yearNumber,
}: {
  subject: SubjectDto;
  papers: QuestionPaperDto[];
  yearNumber: number;
}) {
  const download = async (id: string) => {
    const { url } = await papersApi.getDownloadUrl(id);
    window.location.href = url;
  };

  return (
    <div className="group flex items-center justify-between gap-3 rounded-lg border-b border-border px-2 py-3 transition-colors last:border-b-0 hover:bg-muted/60">
      {/* Links into SubjectPage, the only place View (and Notes) live — this
          row used to be a dead end with no way to reach either. */}
      <Link to={`/years/${yearNumber}/${subject.id}`} className="min-w-0">
        <p className="truncate font-semibold text-foreground transition-colors group-hover:text-brand">
          {subject.name}
        </p>
        <p className="text-xs text-foreground-muted">{subject.code}</p>
      </Link>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {papers.length > 0 ? (
          papers.map((p) =>
            // A locked paper links to login instead of downloading. The button
            // is still rendered (rather than hidden) so the archive's depth is
            // visible — that is the reason to sign up.
            p.locked ? (
              // The pill swaps its label on hover: the year normally, "Log in"
              // when pointed at. Named group so it reacts to its own hover, not
              // the whole row's.
              <Button
                key={p.id}
                asChild
                size="sm"
                variant="outline"
                className="group/lock"
                title="Log in to view all papers"
              >
                <Link to="/login" aria-label={`Log in to view the ${p.academicYear} paper`}>
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="group-hover/lock:hidden">{p.academicYear}</span>
                  <span className="hidden group-hover/lock:inline">Log in</span>
                </Link>
              </Button>
            ) : (
              <Button key={p.id} size="sm" onClick={() => download(p.id)}>
                {p.academicYear}
              </Button>
            ),
          )
        ) : (
          <Badge variant="muted">Not uploaded yet</Badge>
        )}
      </div>
    </div>
  );
}

export function SemesterPage() {
  const { dept, yearNumber, semester } = useParams<{
    dept: string;
    yearNumber: string;
    semester: string;
  }>();
  const department = DEPARTMENTS.find((d) => d.code === dept);
  const year = Number(yearNumber);
  const semesterNumber = Number(semester);

  const { data: examTypes } = useQuery({ queryKey: ["exam-types"], queryFn: examTypesApi.list });

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["subjects", { department: dept, semester: semesterNumber }],
    queryFn: () => subjectsApi.list({ department: dept, semester: semesterNumber }),
    enabled: Boolean(department) && Boolean(semesterNumber),
  });

  const paperQueries = useQueries({
    queries: (subjects ?? []).map((s) => ({
      queryKey: ["papers", s.id],
      queryFn: () => papersApi.listBySubject(s.id),
    })),
  });

  const validSemester = semesterNumber === year * 2 - 1 || semesterNumber === year * 2;
  if (!department || !year || year < 1 || year > 4 || !validSemester) {
    return <Navigate to="/" replace />;
  }

  const papersBySubject = new Map<string, QuestionPaperDto[]>();
  (subjects ?? []).forEach((s, i) => {
    papersBySubject.set(s.id, paperQueries[i]?.data ?? []);
  });

  const examTypeIdByLabel = new Map((examTypes ?? []).map((t) => [t.name, t.id]));

  return (
    <div>
      <p className="mb-1 text-sm text-foreground-muted">
        <Link to={`/departments/${department.code}`} className="hover:underline">
          {department.label}
        </Link>{" "}
        /{" "}
        <Link to={`/departments/${department.code}/years/${year}`} className="hover:underline">
          Year {year}
        </Link>
      </p>
      <h1 className="mb-8 text-3xl">Semester {semesterNumber}</h1>

      {isLoading && <p className="text-foreground-muted">Loading...</p>}

      {!isLoading && (!subjects || subjects.length === 0) && (
        <p className="text-foreground-muted">No subjects added for this semester yet.</p>
      )}

      {subjects && subjects.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {EXAM_TYPE_LABELS.map((label) => {
            const examTypeId = examTypeIdByLabel.get(label);
            return (
              <Card key={label}>
                <CardHeader>
                  <CardTitle>{label} papers</CardTitle>
                  {/* Only RE-ETE gets a subtitle: "Unit Test" and "End Term"
                      explain themselves, the abbreviation does not. */}
                  {label === "RE-ETE" && <CardDescription>{RE_ETE_DESCRIPTION}</CardDescription>}
                </CardHeader>
                <CardContent>
                  {subjects.map((subject) => {
                    const allPapers = papersBySubject.get(subject.id) ?? [];
                    const papersForExam = examTypeId
                      ? allPapers.filter((p) => p.examTypeId === examTypeId)
                      : [];
                    return (
                      <PaperRow
                        key={subject.id}
                        subject={subject}
                        papers={papersForExam}
                        yearNumber={year}
                      />
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

```

## frontend\src\routes\pages\SignupPage.tsx

```tsx
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function SignupPage() {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!email.endsWith("@mmcoe.edu.in")) {
      setError("Only @mmcoe.edu.in emails are allowed.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Signup no longer logs you in — it returns a confirmation message and
      // the account stays unusable until the emailed link is opened.
      const res = await signup({ fullName, email, password });
      setSentMessage(res.message);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not create your account.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sentMessage) {
    return (
      <div className="mx-auto max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Check your inbox</CardTitle>
            <CardDescription>One more step to finish signing up.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p
                role="status"
                className="rounded-lg bg-success-bg px-3 py-2 text-sm font-medium text-success"
              >
                {sentMessage}
              </p>
              <p className="text-sm text-foreground-muted">
                We sent a confirmation link to <span className="font-semibold">{email}</span>. It
                expires in 24 hours. You won&apos;t be able to log in until you open it — check
                your spam folder if it doesn&apos;t arrive in a few minutes.
              </p>
              <Button asChild variant="outline">
                <Link to="/login">Back to log in</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Use your college email to get access.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button asChild variant="outline" className="w-full">
              <a href={`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"}/api/auth/google`}>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Sign up with Google
              </a>
            </Button>
            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-foreground-muted">Or sign up with email</span>
              </div>
            </div>
          </div>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Field
              label="Full name"
              name="fullName"
              autoComplete="name"
              placeholder="Priya Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="username@mmcoe.edu.in"
              hint="Sign-up is limited to approved college domains."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              hint="Minimum 8 characters."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            {error && (
              <p role="alert" className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
                {error}
              </p>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-foreground-muted">
            Already have an account? <Link to="/login" className="font-semibold text-brand">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

```

## frontend\src\routes\pages\StudyRoomPage.tsx

```tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { studyRoomsApi } from "@/lib/api/study-rooms";
import { useAuth } from "@/hooks/useAuth";
import { useStudyRoom } from "@/hooks/useStudyRoom";
import { useStudyRoomMedia } from "@/hooks/useStudyRoomMedia";
import { useWhiteboard } from "@/hooks/useWhiteboard";
import { ChatPanel } from "@/components/study-room/ChatPanel";
import { CallPanel } from "@/components/study-room/CallPanel";
import { WhiteboardPanel } from "@/components/study-room/WhiteboardPanel";
import { CopyInviteButton } from "@/components/study-room/CopyInviteButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  connecting: "Connecting...",
  connected: "Live",
  disconnected: "Reconnecting...",
  error: "Disconnected",
};

export function StudyRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const roomQuery = useQuery({
    queryKey: ["study-room", roomId],
    queryFn: () => studyRoomsApi.get(roomId!),
    enabled: Boolean(roomId),
  });

  const {
    status,
    error,
    closedMessage,
    self,
    participants,
    messages,
    typingNames,
    sendMessage,
    setTyping,
    socketRef,
  } = useStudyRoom(roomId);

  const media = useStudyRoomMedia(roomId, socketRef, participants, status === "connected");

  const board = useWhiteboard(
    roomId,
    socketRef,
    status === "connected",
    self?.userId,
    self?.socketId,
  );

  // If the room is closed under us, release the mic/camera immediately rather
  // than leaving the capture running behind a dead session.
  const { inCall, leaveCall } = media;
  useEffect(() => {
    if (closedMessage && inCall) leaveCall();
  }, [closedMessage, inCall, leaveCall]);

  if (roomQuery.isError) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-foreground-muted">
          This study room is not available. Private rooms need an invite link.
        </p>
        <Button asChild className="mt-4">
          <Link to="/study-rooms">Back to study rooms</Link>
        </Button>
      </Card>
    );
  }

  if (closedMessage) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center">
        <p className="text-sm font-semibold text-foreground">{closedMessage}</p>
        <p className="mt-1 text-sm text-foreground-muted">The session has ended.</p>
        <Button asChild className="mt-4">
          <Link to="/study-rooms">Back to study rooms</Link>
        </Button>
      </Card>
    );
  }

  const everyone = self ? [self, ...participants] : participants;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-brand">
              {roomQuery.data?.name ?? "Study room"}
            </h1>
            <Badge variant={status === "connected" ? "success" : "muted"}>
              <span
                className={cn(
                  "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                  status === "connected" ? "bg-success" : "bg-foreground-subtle",
                )}
              />
              {STATUS_LABEL[status]}
            </Badge>
          </div>
          {roomQuery.data?.description && (
            <p className="mt-1 text-sm text-foreground-muted">{roomQuery.data.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {roomQuery.data?.inviteCode && (
            <CopyInviteButton inviteCode={roomQuery.data.inviteCode} />
          )}
          <Button variant="outline" size="sm" onClick={() => setIsChatOpen(!isChatOpen)}>
            {isChatOpen ? "Hide chat" : "Show chat"}
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/study-rooms">Leave room</Link>
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {self?.isModerator && (
        <div className="rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-brand">
          You joined this room as an <strong>admin moderator</strong>. Everyone here can see that
          you're present — your name shows in the participant list with a Moderator badge.
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 flex flex-col gap-4 w-full min-w-0">
          <Card className="p-4">
            <CallPanel
              media={media}
              self={self}
              participants={participants}
              disabled={status !== "connected"}
            />
          </Card>

          {/* Deliberately its own panel rather than an overlay on the screen
              share: the board is a separate surface, and it keeps working for
              students whose peer connection never establishes. */}
          <Card className="p-4">
            <WhiteboardPanel
              board={board}
              participants={everyone}
              roomId={roomId!}
              selfUserId={self?.userId}
              selfName={self?.fullName ?? user?.fullName ?? "You"}
            />
          </Card>

          <Card className="h-fit p-4">
            <h2 className="text-sm font-bold text-foreground">
              In this room ({everyone.length})
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {everyone.map((participant) => (
                <li key={participant.socketId} className="flex items-center gap-2 text-sm">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-brand">
                    {participant.fullName.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex-1 truncate text-foreground">
                    {participant.fullName}
                    {participant.socketId === self?.socketId && (
                      <span className="text-foreground-subtle"> (you)</span>
                    )}
                  </span>
                  {participant.isModerator && (
                    <Badge variant="default" title="An admin present for moderation">
                      Mod
                    </Badge>
                  )}
                  {(participant.socketId === self?.socketId ? media.inCall : participant.inCall) && (
                    <Badge variant="success">on call</Badge>
                  )}
                </li>
              ))}
              {everyone.length === 0 && (
                <li className="text-sm text-foreground-subtle col-span-full">Nobody here yet.</li>
              )}
            </ul>
          </Card>
        </div>

        {isChatOpen && (
          <Card className="w-full lg:w-[340px] xl:w-[400px] shrink-0 flex h-[calc(100vh-12rem)] min-h-[420px] flex-col overflow-hidden sticky top-4">
            <ChatPanel
              messages={messages}
              currentUserId={user?.id}
              typingNames={typingNames}
              disabled={status !== "connected"}
              onSend={sendMessage}
              onTyping={setTyping}
            />
          </Card>
        )}
      </div>
    </div>
  );
}

```

## frontend\src\routes\pages\StudyRoomsPage.tsx

```tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StudyRoomVisibility, type StudyRoomDto } from "@scholarbase/shared-types";
import { studyRoomsApi } from "@/lib/api/study-rooms";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyInviteButton } from "@/components/study-room/CopyInviteButton";

export function StudyRoomsPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<StudyRoomVisibility>(StudyRoomVisibility.PRIVATE);
  const [formError, setFormError] = useState<string | null>(null);

  const [invite, setInvite] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  const roomsQuery = useQuery({
    queryKey: ["study-rooms"],
    queryFn: studyRoomsApi.list,
    // Participant counts are live server-side; poll so the lobby stays honest.
    refetchInterval: 10000,
  });

  const createRoom = useMutation({
    mutationFn: studyRoomsApi.create,
    onSuccess: () => {
      setName("");
      setDescription("");
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ["study-rooms"] });
    },
    onError: () => setFormError("Could not create the room. Names must be at least 3 characters."),
  });

  const joinByInvite = useMutation({
    mutationFn: studyRoomsApi.redeemInvite,
    onSuccess: (room) => {
      setInvite("");
      setInviteError(null);
      queryClient.invalidateQueries({ queryKey: ["study-rooms"] });
      navigate(`/study-rooms/${room.id}`);
    },
    onError: () => setInviteError("That invite link is not valid, or the room has been closed."),
  });

  const closeRoom = useMutation({
    mutationFn: studyRoomsApi.close,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["study-rooms"] }),
  });

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    createRoom.mutate({ name, description: description || null, visibility });
  };

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    if (!invite.trim()) return;
    joinByInvite.mutate(invite);
  };

  const canClose = (room: StudyRoomDto) => isAdmin || room.createdById === user?.id;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold text-brand">Study rooms</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Live rooms for group revision — chat with everyone in the room, then turn on audio and
          video when you want to talk it through.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Join with an invite link</CardTitle>
          <p className="text-sm text-foreground-muted">
            Someone shared a private room with you? Paste their link here.
          </p>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleJoin}>
            <Input
              placeholder="https://.../study-rooms/join/xxxxxxxx"
              value={invite}
              onChange={(e) => {
                setInvite(e.target.value);
                setInviteError(null);
              }}
              aria-label="Invite link"
            />
            <Button type="submit" disabled={joinByInvite.isPending || !invite.trim()}>
              {joinByInvite.isPending ? "Joining..." : "Join room"}
            </Button>
          </form>
          {inviteError && <p className="mt-3 text-sm text-danger">{inviteError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Start a room</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3" onSubmit={handleCreate}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Room name, e.g. DBMS unit 3 revision"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
                maxLength={80}
                aria-label="Room name"
              />
              <Input
                placeholder="What are you working on? (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={280}
                aria-label="Room description"
              />
              <Button type="submit" disabled={createRoom.isPending}>
                {createRoom.isPending ? "Creating..." : "Create"}
              </Button>
            </div>

            <fieldset className="flex flex-wrap items-center gap-4">
              <legend className="sr-only">Who can join</legend>
              <label className="flex items-center gap-2 text-sm text-foreground-muted">
                <input
                  type="radio"
                  name="visibility"
                  value={StudyRoomVisibility.PRIVATE}
                  checked={visibility === StudyRoomVisibility.PRIVATE}
                  onChange={() => setVisibility(StudyRoomVisibility.PRIVATE)}
                />
                Private — only people with the invite link
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground-muted">
                <input
                  type="radio"
                  name="visibility"
                  value={StudyRoomVisibility.PUBLIC}
                  checked={visibility === StudyRoomVisibility.PUBLIC}
                  onChange={() => setVisibility(StudyRoomVisibility.PUBLIC)}
                />
                Public — listed for every student
              </label>
            </fieldset>
          </form>
          {formError && <p className="mt-3 text-sm text-danger">{formError}</p>}
        </CardContent>
      </Card>

      {roomsQuery.isLoading && <p className="text-sm text-foreground-muted">Loading rooms...</p>}

      {roomsQuery.isError && (
        <p className="text-sm text-danger">Could not load study rooms. Try refreshing.</p>
      )}

      {roomsQuery.data?.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-foreground-muted">
            No rooms yet. Create one above, or paste an invite link someone sent you.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roomsQuery.data?.map((room) => (
          <Card key={room.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle>{room.name}</CardTitle>
                <Badge variant={room.participantCount > 0 ? "success" : "muted"}>
                  {room.participantCount} in room
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={room.visibility === StudyRoomVisibility.PRIVATE ? "default" : "muted"}>
                  {room.visibility === StudyRoomVisibility.PRIVATE ? "Private" : "Public"}
                </Badge>
                <span className="text-xs text-foreground-subtle">by {room.createdByName}</span>
              </div>
              {room.description && <p className="text-sm text-foreground-muted">{room.description}</p>}
            </CardHeader>
            <CardContent className="mt-auto flex flex-wrap items-center justify-end gap-2">
              {room.inviteCode && <CopyInviteButton inviteCode={room.inviteCode} />}
              {canClose(room) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => closeRoom.mutate(room.id)}
                  disabled={closeRoom.isPending}
                >
                  Close
                </Button>
              )}
              <Button asChild size="sm">
                <Link to={`/study-rooms/${room.id}`}>Join</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

```

## frontend\src\routes\pages\SubjectPage.tsx

```tsx
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Eye, Download, Lock } from "lucide-react";
import {
  EXAM_TYPE_LABELS,
  type FileViewUrlDto,
  type QuestionPaperDto,
} from "@scholarbase/shared-types";
import { subjectsApi } from "@/lib/api/academic";
import { examTypesApi } from "@/lib/api/exam-types";
import { papersApi } from "@/lib/api/papers";
import { notesApi } from "@/lib/api/notes";
import { RE_ETE_DESCRIPTION } from "@/lib/exam-types";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentViewer } from "@/components/DocumentViewer";

type ViewerKind = "paper" | "note";

export function SubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { isAuthenticated } = useAuth();
  // Passed to /login so the student lands back on this subject after signing in.
  const location = useLocation();

  const [viewerDoc, setViewerDoc] = useState<FileViewUrlDto | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [viewerTarget, setViewerTarget] = useState<{ kind: ViewerKind; id: string } | null>(null);

  const openViewer = async (kind: ViewerKind, id: string) => {
    setViewerTarget({ kind, id });
    setViewerDoc(null);
    setViewerError(null);
    setViewerLoading(true);
    try {
      const api = kind === "paper" ? papersApi : notesApi;
      setViewerDoc(await api.getViewUrl(id));
    } catch {
      setViewerError("Could not open this file. Try downloading it instead.");
    } finally {
      setViewerLoading(false);
    }
  };

  const closeViewer = () => {
    setViewerDoc(null);
    setViewerError(null);
    setViewerLoading(false);
    setViewerTarget(null);
  };

  const { data: subject } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: () => subjectsApi.get(subjectId!),
    enabled: Boolean(subjectId),
  });

  const { data: papers } = useQuery({
    queryKey: ["papers", subjectId],
    queryFn: () => papersApi.listBySubject(subjectId!),
    enabled: Boolean(subjectId),
  });

  const { data: notes } = useQuery({
    queryKey: ["notes", subjectId],
    queryFn: () => notesApi.listBySubject(subjectId!),
    enabled: Boolean(subjectId),
  });

  const { data: examTypes } = useQuery({ queryKey: ["exam-types"], queryFn: examTypesApi.list });

  // Papers used to be one flat grid, which made a RE-ETE paper indistinguishable
  // from the end-term paper it re-examines — same subject, often the same year,
  // and nothing on the card said which was which.
  //
  // Known types come first, in EXAM_TYPE_LABELS order, so the headings are
  // stable. Anything left over is appended rather than dropped: an admin can
  // create a new exam type from the admin page at any time, and grouping
  // strictly by the known list would hide its papers entirely.
  const paperSections = (() => {
    const nameById = new Map((examTypes ?? []).map((t) => [t.id, t.name]));
    const byName = new Map<string, QuestionPaperDto[]>();
    for (const paper of papers ?? []) {
      const name = nameById.get(paper.examTypeId) ?? "Other";
      const bucket = byName.get(name);
      if (bucket) bucket.push(paper);
      else byName.set(name, [paper]);
    }
    const known = EXAM_TYPE_LABELS.filter((label) => byName.has(label));
    const extra = [...byName.keys()].filter(
      (name) => !(EXAM_TYPE_LABELS as readonly string[]).includes(name),
    );
    return [...known, ...extra].map((name) => ({ name, papers: byName.get(name) ?? [] }));
  })();

  const downloadPaper = async (id: string) => {
    const { url } = await papersApi.getDownloadUrl(id);
    window.location.href = url;
  };

  const downloadNote = async (id: string) => {
    const { url } = await notesApi.getDownloadUrl(id);
    window.location.href = url;
  };

  return (
    <div>
      <h1 className="mb-1 text-3xl">{subject?.name ?? "Subject"}</h1>
      <p className="mb-8 text-foreground-muted">{subject?.code}</p>

      <Tabs defaultValue="papers">
        <TabsList>
          <TabsTrigger value="papers">Question Papers</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="papers">
          {papers?.length === 0 && (
            <p className="text-foreground-muted">No question papers uploaded for this subject yet.</p>
          )}
          {paperSections.map((section) => (
            <section key={section.name} className="mt-6 first:mt-4">
              <h2 className="text-lg font-semibold text-foreground">{section.name} papers</h2>
              {section.name === "RE-ETE" && (
                <p className="mt-1 max-w-2xl text-sm text-foreground-muted">{RE_ETE_DESCRIPTION}</p>
              )}
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {section.papers.map((paper) => (
                  <Card key={paper.id} interactive className="group relative overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between gap-2 text-base">
                        <span className="transition-colors group-hover:text-brand">{paper.fileName}</span>
                        {/* Small persistent marker so a locked paper still reads as
                            locked without hovering — the overlay below is the
                            flourish, not the only signal. */}
                        {paper.locked && (
                          <Lock
                            className="mt-0.5 h-4 w-4 shrink-0 text-foreground-subtle"
                            aria-hidden="true"
                          />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge>{paper.academicYear}</Badge>
                        {/* The one paper a signed-out visitor may open, so the
                            offer is visible rather than something they discover by
                            clicking a locked one. */}
                        {!isAuthenticated && !paper.locked && <Badge variant="success">Free preview</Badge>}
                      </div>
                      {!paper.locked && (
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => void openViewer("paper", paper.id)}>
                            <Eye className="h-4 w-4" aria-hidden="true" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void downloadPaper(paper.id)}
                            aria-label={`Download ${paper.fileName}`}
                          >
                            <Download className="h-4 w-4" aria-hidden="true" />
                            Download
                          </Button>
                        </div>
                      )}
                    </CardContent>

                    {/* Hover reveal for locked papers.
                        Covers the whole card so a tap anywhere works on phones,
                        where there is no hover at all — without that, a touch user
                        would have no way to reach the login prompt. It is a real
                        <Link>, so it is keyboard reachable and the overlay is
                        revealed on focus as well as hover. */}
                    {paper.locked && (
                      <Link
                        to="/login"
                        state={{ from: location }}
                        aria-label={`Log in to view ${paper.fileName}`}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface/90 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand group-hover:opacity-100"
                      >
                        <Lock className="h-5 w-5 text-brand" aria-hidden="true" />
                        <span className="text-sm font-semibold text-foreground">
                          Log in to view all papers
                        </span>
                        <span className="text-xs text-foreground-muted">
                          One paper per semester is free
                        </span>
                      </Link>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </TabsContent>

        <TabsContent value="notes">
          {notes?.length === 0 && (
            <p className="text-foreground-muted">No notes uploaded for this subject yet.</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {notes?.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <CardTitle className="text-base">{note.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="muted">{note.unitTopic ?? "General"}</Badge>
                  {isAuthenticated ? (
                    <div className="flex items-center gap-2">
                      {/* Viewing a note hands out the same object as downloading
                          it, so both sit behind the same login gate. */}
                      <Button size="sm" onClick={() => void openViewer("note", note.id)}>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void downloadNote(note.id)}
                        aria-label={`Download ${note.title}`}
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Download
                      </Button>
                    </div>
                  ) : (
                    <Button asChild size="sm" variant="outline">
                      <Link to="/login">Log in to view</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <DocumentViewer
        doc={viewerDoc}
        isLoading={viewerLoading}
        error={viewerError}
        onClose={closeViewer}
        onDownload={
          viewerTarget
            ? () =>
                void (viewerTarget.kind === "paper"
                  ? downloadPaper(viewerTarget.id)
                  : downloadNote(viewerTarget.id))
            : undefined
        }
      />
    </div>
  );
}

```

## frontend\src\routes\pages\VerifyEmailPage.tsx

```tsx
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "@/lib/api/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

type Status = "verifying" | "success" | "error";

/**
 * Confirms a signup by redeeming the token from the emailed link.
 *
 * Unlike every other auth page this one submits on mount rather than on a click
 * — the user already "submitted" by opening the link, so asking them to press a
 * button again would be pure friction.
 */
export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";

  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");

  // The app runs inside <React.StrictMode>, so effects fire twice on mount in
  // development. The token is single-use, meaning the second call would be
  // rejected and paint a failure over a verification that actually succeeded.
  // This latch keeps the request to exactly one per mount.
  const requested = useRef(false);

  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;

    authApi
      .verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Could not confirm your email. The link may have expired.",
        );
      });
  }, [token]);

  if (!token) {
    return (
      <div className="mx-auto max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Confirmation link missing</CardTitle>
            <CardDescription>
              This page needs the link from your confirmation email to work.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResendForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>
            {status === "verifying" && "Confirming your email…"}
            {status === "success" && "Email confirmed"}
            {status === "error" && "Confirmation failed"}
          </CardTitle>
          {status === "verifying" && (
            <CardDescription>This only takes a moment.</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {status === "verifying" && (
            <p className="text-sm text-foreground-muted">
              Checking your link. If the server has been idle this can take up to a minute.
            </p>
          )}

          {status === "success" && (
            <div className="flex flex-col gap-4">
              <p
                role="status"
                className="rounded-lg bg-success-bg px-3 py-2 text-sm font-medium text-success"
              >
                {message}
              </p>
              <Button onClick={() => navigate("/login", { replace: true })}>Go to log in</Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col gap-4">
              <p
                role="alert"
                className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger"
              >
                {message}
              </p>
              <p className="text-sm text-foreground-muted">
                Enter your email below and we&apos;ll send a fresh link.
              </p>
              <ResendForm />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Shared by the missing-token and failed-verification states. Always reports
 * success, matching the endpoint's deliberately uniform response — it must not
 * reveal whether an address is registered or already confirmed.
 */
function ResendForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // No domain check: this resends to an account that already exists, and a
    // client-side rejection would make some addresses answer differently from
    // others — exactly the enumeration signal the uniform server response is
    // designed to remove.
    try {
      const res = await authApi.resendVerification(email);
      setSent(res.message);
    } catch {
      setSent("If that email needs confirming, a new link is on its way.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <p
          role="status"
          className="rounded-lg bg-success-bg px-3 py-2 text-sm font-medium text-success"
        >
          {sent}
        </p>
        <Button asChild variant="outline">
          <Link to="/login">Back to log in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="username@mmcoe.edu.in"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {error && (
        <p role="alert" className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send a new link"}
      </Button>
    </form>
  );
}

```

## frontend\src\routes\pages\YearPage.tsx

```tsx
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { subjectsApi, yearLevelsApi } from "@/lib/api/academic";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function YearPage() {
  const { yearNumber } = useParams<{ yearNumber: string }>();

  const { data: yearLevels } = useQuery({
    queryKey: ["year-levels"],
    queryFn: yearLevelsApi.list,
  });

  const yearLevel = yearLevels?.find((y) => y.yearNumber === Number(yearNumber));

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["subjects", yearLevel?.id],
    queryFn: () => subjectsApi.listByYear(yearLevel!.id),
    enabled: Boolean(yearLevel),
  });

  return (
    <div>
      <h1 className="mb-2 text-3xl">{yearLevel?.label ?? `Year ${yearNumber}`}</h1>
      <p className="mb-8 text-foreground-muted">Choose a subject to view its question papers and notes.</p>

      {isLoading && <p className="text-foreground-muted">Loading...</p>}

      {!isLoading && yearLevel && (!subjects || subjects.length === 0) && (
        <p className="text-foreground-muted">No subjects added for this year yet.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects?.map((subject) => (
          <Link key={subject.id} to={`/years/${yearNumber}/${subject.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>{subject.name}</CardTitle>
                <CardDescription>{subject.code}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

```

## frontend\src\routes\ProtectedRoute.tsx

```tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

```

## frontend\src\vite-env.d.ts

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

```

## frontend\tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

// Theme tokens extracted from mmcoe.edu.in's live computed styles:
// primary maroon #850013, white/light-gray surfaces, Poppins, pill buttons.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#850013",
          foreground: "#ffffff",
          50: "#fdf2f3",
          100: "#fbe3e5",
          200: "#f5c0c6",
          300: "#e8919c",
          400: "#d75f70",
          500: "#b83346",
          600: "#9c1f30",
          700: "#850013",
          800: "#6e0011",
          900: "#5c0010",
        },
        // Nested DEFAULT/variant shape on purpose. These were previously flat
        // camelCase keys (`foregroundMuted`), which Tailwind emits as
        // `text-foregroundMuted` — but every call site writes the kebab-case
        // `text-foreground-muted`, so the class was never generated and all
        // "muted" text silently rendered at full foreground weight. Nesting
        // makes the kebab names real instead of rewriting every call site.
        background: "var(--background)",
        brand: "var(--brand-text)",
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
        },
        muted: "var(--muted)",
        foreground: {
          DEFAULT: "var(--foreground)",
          muted: "var(--foreground-muted)",
          subtle: "var(--foreground-subtle)",
        },
        border: "var(--border)",
        control: "var(--border-control)",
        success: {
          DEFAULT: "var(--success)",
          bg: "var(--success-bg)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          bg: "var(--warning-bg)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          bg: "var(--danger-bg)",
        },
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pill: "30px",
      },
      animation: {
        "gradient-x": "gradient-x 15s ease infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

```

## frontend\tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "vite.config.ts"]
}

```

## frontend\vercel.json

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}

```

## frontend\vite.config.ts

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});

```

## backend\check_keys.js

```js
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { Client: MinioClient } = require('minio');

const prisma = new PrismaClient();
const minio = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
  port: Number(process.env.MINIO_PORT ?? "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD,
});

(async () => {
  const papers = await prisma.questionPaper.findMany({ select: { id: true, fileKey: true, fileName: true, academicYear: true, subjectId: true } });
  console.log("=== DB QuestionPaper rows ===");
  papers.forEach(p => console.log(`${p.id}  key="${p.fileKey}"`));

  console.log("\n=== Actual objects in MinIO 'papers' bucket ===");
  const stream = minio.listObjectsV2("papers", "", true);
  const objs = [];
  stream.on("data", (obj) => objs.push(`${obj.name}  (${obj.size} bytes)`));
  stream.on("end", () => {
    objs.forEach(o => console.log(o));
    prisma.$disconnect();
  });
  stream.on("error", (err) => { console.error("MinIO list error:", err.message); prisma.$disconnect(); });
})();

```

## backend\jest-flat.json

```json
[
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\video-content-rect.spec.ts",
  "name": "UT-VCR content rect UT-VCR-001: a 16:9 capture in a taller box gets horizontal bars",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\video-content-rect.spec.ts",
  "name": "UT-VCR content rect UT-VCR-002: a 4:3 capture in a wider box gets vertical bars",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\video-content-rect.spec.ts",
  "name": "UT-VCR content rect UT-VCR-003: falls back to the whole box before metadata loads",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\video-content-rect.spec.ts",
  "name": "UT-VCR pointer mapping UT-VCR-004: the centre of the picture is (0.5, 0.5)",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\video-content-rect.spec.ts",
  "name": "UT-VCR pointer mapping UT-VCR-005: the picture's top edge is y=0, NOT the box's top edge",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\video-content-rect.spec.ts",
  "name": "UT-VCR pointer mapping UT-VCR-006: SECURITY/CORRECTNESS — a pointer over a letterbox bar is rejected",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\video-content-rect.spec.ts",
  "name": "UT-VCR pointer mapping UT-VCR-007: the element's own page offset is subtracted",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\video-content-rect.spec.ts",
  "name": "UT-VCR pointer mapping UT-VCR-008: round-trips — normalize then position lands back where it started",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\video-content-rect.spec.ts",
  "name": "UT-VCR pointer mapping UT-VCR-009: the same normalized point maps to different pixels on different windows",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\viewable-mime.spec.ts",
  "name": "UT-MIME isViewableMimeType UT-MIME-001: accepts every type declared viewable",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\viewable-mime.spec.ts",
  "name": "UT-MIME isViewableMimeType UT-MIME-002: accepts PDF, the only type papers uploads can produce",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\viewable-mime.spec.ts",
  "name": "UT-MIME isViewableMimeType UT-MIME-003: rejects renderable-but-dangerous types",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\viewable-mime.spec.ts",
  "name": "UT-MIME isViewableMimeType UT-MIME-004: rejects office types that cannot render in an iframe",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\viewable-mime.spec.ts",
  "name": "UT-MIME isViewableMimeType UT-MIME-005: rejects empty/garbage input rather than throwing",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\viewable-mime.spec.ts",
  "name": "UT-MIME isViewableMimeType UT-MIME-006: is case-sensitive and does not strip parameters (documents current behaviour)",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\duration.spec.ts",
  "name": "UT-DUR parseDurationMs UT-DUR-001: converts each supported unit to milliseconds",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\duration.spec.ts",
  "name": "UT-DUR parseDurationMs UT-DUR-002: parses the production defaults used by the app",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\duration.spec.ts",
  "name": "UT-DUR parseDurationMs UT-DUR-003: tolerates surrounding whitespace",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\duration.spec.ts",
  "name": "UT-DUR parseDurationMs UT-DUR-004: tolerates internal whitespace between amount and unit",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\duration.spec.ts",
  "name": "UT-DUR parseDurationMs UT-DUR-005: rejects malformed values rather than silently defaulting",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\duration.spec.ts",
  "name": "UT-DUR parseDurationMs UT-DUR-006: accepts zero without throwing (boundary)",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\mesh-negotiation.spec.ts",
  "name": "UT-MESH the old rule reproduces the failure UT-MESH-001: simultaneous joins make BOTH sides offer — glare on every pair",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\mesh-negotiation.spec.ts",
  "name": "UT-MESH the old rule reproduces the failure UT-MESH-002: with frames still in flight, one pair dies while the others work",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\mesh-negotiation.spec.ts",
  "name": "UT-MESH the old rule reproduces the failure UT-MESH-003: retrying cannot save it — the rule itself has no arbitration",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\mesh-negotiation.spec.ts",
  "name": "UT-MESH the id rule removes glare by construction UT-MESH-004: with everyone visible, every pair gets exactly one offer",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\mesh-negotiation.spec.ts",
  "name": "UT-MESH the id rule removes glare by construction UT-MESH-005: no pair can ever double-offer, whoever clicks first",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\mesh-negotiation.spec.ts",
  "name": "UT-MESH the id rule removes glare by construction UT-MESH-006: the same in-flight state that broke the old rule now connects everything",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\mesh-negotiation.spec.ts",
  "name": "UT-MESH the id rule removes glare by construction UT-MESH-006b: a pair whose initiator is still blind is pending, not broken",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\mesh-negotiation.spec.ts",
  "name": "UT-MESH the id rule removes glare by construction UT-MESH-007: reconciliation completes the mesh on the next pass",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\mesh-negotiation.spec.ts",
  "name": "UT-MESH the id rule removes glare by construction UT-MESH-008: reconciling again is idempotent — no duplicate offers",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\mesh-negotiation.spec.ts",
  "name": "UT-MESH the id rule removes glare by construction UT-MESH-009: scales — a room of six has one offerer per pair and no glare",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO SignupDto UT-DTO-001: normalizes email to trimmed lowercase before validation",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO SignupDto UT-DTO-002: rejects malformed email addresses",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO SignupDto UT-DTO-003: enforces a minimum password length",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO SignupDto UT-DTO-004: rejects an empty full name",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO SignupDto UT-DTO-005: signup's password floor agrees with the shared MIN_PASSWORD_LENGTH constant",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO SignupDto UT-DTO-006: does not enforce any password complexity (documents current policy)",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO LoginDto UT-DTO-007: normalizes email so login is case-insensitive",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO password reset DTOs UT-DTO-008: ForgotPasswordDto requires a valid email",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO password reset DTOs UT-DTO-009: ResetPasswordDto rejects an empty token",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO password reset DTOs UT-DTO-010: ResetPasswordDto enforces MIN_PASSWORD_LENGTH",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO password reset DTOs UT-DTO-011: ForgotPasswordDto does not normalize case (asymmetry with login/signup)",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO query DTOs UT-DTO-012: coerces a numeric query string to a number",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO query DTOs UT-DTO-013: treats an empty query value as absent rather than 0",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO query DTOs UT-DTO-014: rejects a non-numeric year instead of silently filtering by NaN",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO query DTOs UT-DTO-015: rejects a non-UUID subjectId (prevents raw values reaching Prisma)",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO query DTOs UT-DTO-016: enforces message limit boundaries 1..200",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts",
  "name": "UT-DTO query DTOs UT-DTO-017: enforces academic-year sanity bounds on upload",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB board ownership IT-WB-001: the first claimant owns the board",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB board ownership IT-WB-002: a second person cannot take a board that is actively owned",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB board ownership IT-WB-003: re-claiming your own board is a no-op, not a failure",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB board ownership IT-WB-004: a board held by a socket that has left can be claimed (crashed-owner recovery)",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB board ownership IT-WB-005: releasing keeps the strokes — it hands over the pen, it does not erase",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB board ownership IT-WB-006: grants are dropped when the owner leaves — they were the owner's to give",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB board ownership IT-WB-007: releasing a board you do not own does nothing",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB draw permission IT-WB-008: the owner may always draw",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB draw permission IT-WB-009: everyone else is refused until granted, and again once revoked",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB draw permission IT-WB-010: nobody can draw on a room that has no board",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB strokes IT-WB-011: chunks with the same id extend one stroke rather than creating many",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB strokes IT-WB-012: SECURITY — you cannot extend somebody else's stroke",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB strokes IT-WB-013: undo removes only the caller's most recent stroke",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB strokes IT-WB-014: undo with nothing of your own returns undefined and changes nothing",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB strokes IT-WB-015: the stroke buffer is bounded, dropping oldest first",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB strokes IT-WB-016: clear empties the strokes but keeps the board and its owner",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB empty-room lifecycle IT-WB-017: the board survives the room emptying, until the grace period elapses",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB empty-room lifecycle IT-WB-018: rejoining inside the grace window saves the board (the reload case)",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB empty-room lifecycle IT-WB-019: closing the room drops the board immediately, with no grace period",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts",
  "name": "IT-WB empty-room lifecycle IT-WB-020: a disconnect releases the board across every room the socket was in",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\storage.service.spec.ts",
  "name": "UT-STO StorageService UT-STO-001: download URL requests an attachment disposition",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\storage.service.spec.ts",
  "name": "UT-STO StorageService UT-STO-002: view URL requests an inline disposition and pins the content type",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\storage.service.spec.ts",
  "name": "UT-STO StorageService UT-STO-003: neutralizes a double quote so the filename cannot escape the quoted string",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\storage.service.spec.ts",
  "name": "UT-STO StorageService UT-STO-004: neutralizes CR and LF so a header cannot be injected",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\storage.service.spec.ts",
  "name": "UT-STO StorageService UT-STO-005: neutralizes backslash escapes",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\storage.service.spec.ts",
  "name": "UT-STO StorageService UT-STO-006: does NOT encode non-ASCII filenames (documents known defect QA-004)",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\storage.service.spec.ts",
  "name": "UT-STO StorageService UT-STO-007: applies the documented default expiries (5 min download, 30 min view)",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\storage.service.spec.ts",
  "name": "UT-STO StorageService UT-STO-008: resolves logical bucket names through env overrides",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\stored-file-url.service.spec.ts",
  "name": "UT-SFU StoredFileUrlService UT-SFU-001: forwards bucket and file key to the storage layer for downloads",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\stored-file-url.service.spec.ts",
  "name": "UT-SFU StoredFileUrlService UT-SFU-002: forwards the mime type for views (required to render inline)",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\stored-file-url.service.spec.ts",
  "name": "UT-SFU StoredFileUrlService UT-SFU-003: serializes expiry as an ISO string in the download DTO",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\stored-file-url.service.spec.ts",
  "name": "UT-SFU StoredFileUrlService UT-SFU-004: view DTO carries the metadata the viewer needs, and no storage key",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\stored-file-url.service.spec.ts",
  "name": "UT-SFU StoredFileUrlService UT-SFU-005: is agnostic to the record's concrete model (structural typing)",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-RES papers upload IT-RES-001: rejects a request with no file attached",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-RES papers upload IT-RES-002: rejects a non-PDF declared content type",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-RES papers upload IT-RES-003: SECURITY — accepts HTML bytes when the client declares application/pdf",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-RES papers upload IT-RES-004: refuses a byte-identical duplicate via checksum",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-RES papers upload IT-RES-005: derives a namespaced storage key with a random component",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-RES papers upload IT-RES-006: SECURITY — traversal sequences in the filename survive into the storage key",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-RES notes upload IT-RES-007: accepts the documented office formats",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-RES notes upload IT-RES-008: rejects an unsupported type for notes",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-RES URL issuance IT-RES-009: papers download/view 404 when the row does not exist",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-RES URL issuance IT-RES-010: notes download/view 404 when the row does not exist",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-RES URL issuance IT-RES-011: each resource presigns against its own bucket",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-GATE paper access gating IT-GATE-001: exactly one paper per (department, semester) is free",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-GATE paper access gating IT-GATE-002: nothing is locked for a logged-in caller",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-GATE paper access gating IT-GATE-003: the free paper is stable across calls (not order-dependent)",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-GATE paper access gating IT-GATE-004: SECURITY — anonymous view/download of a locked paper is refused",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-GATE paper access gating IT-GATE-005: anonymous access to the free paper is allowed",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-GATE paper access gating IT-GATE-006: a logged-in caller may open a paper that is locked for visitors",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts",
  "name": "IT-GATE paper access gating IT-GATE-007: a missing paper still 404s rather than leaking the lock state",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH signup IT-AUTH-001: rejects an email outside the allowed university domains",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH signup IT-AUTH-002: rejects a duplicate account with 409 rather than overwriting",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH signup IT-AUTH-003: stores an argon2 hash, never the plaintext password",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH signup IT-AUTH-004: normalizes the email to lowercase before persisting",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH signup IT-AUTH-025: issues NO session at signup — the account is unusable until confirmed",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH signup IT-AUTH-026: the confirmation link mailed at signup is a hash-stored single-use token",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH signup IT-AUTH-027: verification hash is domain-separated from BOTH the refresh and reset hashes",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH login IT-AUTH-005: returns an identical generic error for unknown user and wrong password",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH login IT-AUTH-006: issues tokens and never returns the password hash to the client",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH login IT-AUTH-007: persists only an HMAC of the refresh token, never the raw value",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH email verification gate IT-AUTH-028: login is refused with 403 while the address is unconfirmed",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH email verification gate IT-AUTH-029: the gate runs only after the password check, so it can't confirm an account for free",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH email verification gate IT-AUTH-030: login succeeds once the address is confirmed",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH email verification gate IT-AUTH-031: verifyEmail marks the account verified and burns the token atomically",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH email verification gate IT-AUTH-032: an unknown or expired confirmation token is rejected with one generic message",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH email verification gate IT-AUTH-033: re-opening a spent link for an already-verified account succeeds instead of erroring",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH email verification gate IT-AUTH-034: resendVerification is silent for unknown and already-verified addresses",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH email verification gate IT-AUTH-035: resendVerification issues a fresh link and kills the previous one",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH email verification gate IT-AUTH-036: a mail failure during signup does not fail the signup itself",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH refresh IT-AUTH-008: rejects an expired refresh token",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH refresh IT-AUTH-009: rejects an unknown/revoked refresh token",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH refresh IT-AUTH-010: rotates the token — the presented one is revoked after use",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH forgot password IT-AUTH-011: resolves silently for an unregistered address (no enumeration via response)",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH forgot password IT-AUTH-012: invalidates any outstanding reset link before issuing a new one",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH forgot password IT-AUTH-013: stores only a hash of the reset token; the raw token goes to email only",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH forgot password IT-AUTH-014: reset-token hash is domain-separated from the refresh-token hash",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH forgot password IT-AUTH-015: honours the configured TTL when setting expiry",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH forgot password IT-AUTH-016: a mail delivery failure does not surface to the caller",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH forgot password IT-AUTH-017: SECURITY — a DB failure DOES surface, creating a 500-vs-200 enumeration oracle",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH forgot password IT-AUTH-018: SECURITY — the registered path performs strictly more awaited work (timing oracle)",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH reset password IT-AUTH-019: rejects an unknown token",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH reset password IT-AUTH-020: rejects an already-used token (single use enforced)",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH reset password IT-AUTH-021: rejects an expired token",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH reset password IT-AUTH-022: gives the same generic message for unknown, used and expired tokens",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH reset password IT-AUTH-023: on success, burns the token and revokes every live session atomically",
  "status": "passed"
 },
 {
  "file": "C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts",
  "name": "IT-AUTH reset password IT-AUTH-024: the new password is argon2-hashed before it reaches the database",
  "status": "passed"
 }
]
```

## backend\jest-results.json

```json
{"numFailedTestSuites":0,"numFailedTests":0,"numPassedTestSuites":10,"numPassedTests":135,"numPendingTestSuites":0,"numPendingTests":0,"numRuntimeErrorTestSuites":0,"numTodoTests":0,"numTotalTestSuites":10,"numTotalTests":135,"openHandles":[],"snapshot":{"added":0,"didUpdate":false,"failure":false,"filesAdded":0,"filesRemoved":0,"filesRemovedList":[],"filesUnmatched":0,"filesUpdated":0,"matched":0,"total":0,"unchecked":0,"uncheckedKeysByFile":[],"unmatched":0,"updated":0},"startTime":1786711235896,"success":true,"testResults":[{"assertionResults":[{"ancestorTitles":["UT-VCR content rect"],"duration":13,"failureDetails":[],"failureMessages":[],"fullName":"UT-VCR content rect UT-VCR-001: a 16:9 capture in a taller box gets horizontal bars","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"UT-VCR-001: a 16:9 capture in a taller box gets horizontal bars"},{"ancestorTitles":["UT-VCR content rect"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-VCR content rect UT-VCR-002: a 4:3 capture in a wider box gets vertical bars","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"UT-VCR-002: a 4:3 capture in a wider box gets vertical bars"},{"ancestorTitles":["UT-VCR content rect"],"duration":3,"failureDetails":[],"failureMessages":[],"fullName":"UT-VCR content rect UT-VCR-003: falls back to the whole box before metadata loads","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-VCR-003: falls back to the whole box before metadata loads"},{"ancestorTitles":["UT-VCR pointer mapping"],"duration":4,"failureDetails":[],"failureMessages":[],"fullName":"UT-VCR pointer mapping UT-VCR-004: the centre of the picture is (0.5, 0.5)","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-VCR-004: the centre of the picture is (0.5, 0.5)"},{"ancestorTitles":["UT-VCR pointer mapping"],"duration":3,"failureDetails":[],"failureMessages":[],"fullName":"UT-VCR pointer mapping UT-VCR-005: the picture's top edge is y=0, NOT the box's top edge","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-VCR-005: the picture's top edge is y=0, NOT the box's top edge"},{"ancestorTitles":["UT-VCR pointer mapping"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-VCR pointer mapping UT-VCR-006: SECURITY/CORRECTNESS — a pointer over a letterbox bar is rejected","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-VCR-006: SECURITY/CORRECTNESS — a pointer over a letterbox bar is rejected"},{"ancestorTitles":["UT-VCR pointer mapping"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-VCR pointer mapping UT-VCR-007: the element's own page offset is subtracted","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-VCR-007: the element's own page offset is subtracted"},{"ancestorTitles":["UT-VCR pointer mapping"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"UT-VCR pointer mapping UT-VCR-008: round-trips — normalize then position lands back where it started","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-VCR-008: round-trips — normalize then position lands back where it started"},{"ancestorTitles":["UT-VCR pointer mapping"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-VCR pointer mapping UT-VCR-009: the same normalized point maps to different pixels on different windows","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"UT-VCR-009: the same normalized point maps to different pixels on different windows"}],"endTime":1786711238234,"message":"","name":"C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\video-content-rect.spec.ts","startTime":1786711237076,"status":"passed","summary":""},{"assertionResults":[{"ancestorTitles":["UT-MIME isViewableMimeType"],"duration":11,"failureDetails":[],"failureMessages":[],"fullName":"UT-MIME isViewableMimeType UT-MIME-001: accepts every type declared viewable","invocations":1,"location":null,"numPassingAsserts":5,"retryReasons":[],"status":"passed","title":"UT-MIME-001: accepts every type declared viewable"},{"ancestorTitles":["UT-MIME isViewableMimeType"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-MIME isViewableMimeType UT-MIME-002: accepts PDF, the only type papers uploads can produce","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-MIME-002: accepts PDF, the only type papers uploads can produce"},{"ancestorTitles":["UT-MIME isViewableMimeType"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"UT-MIME isViewableMimeType UT-MIME-003: rejects renderable-but-dangerous types","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-MIME-003: rejects renderable-but-dangerous types"},{"ancestorTitles":["UT-MIME isViewableMimeType"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-MIME isViewableMimeType UT-MIME-004: rejects office types that cannot render in an iframe","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-MIME-004: rejects office types that cannot render in an iframe"},{"ancestorTitles":["UT-MIME isViewableMimeType"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-MIME isViewableMimeType UT-MIME-005: rejects empty/garbage input rather than throwing","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-MIME-005: rejects empty/garbage input rather than throwing"},{"ancestorTitles":["UT-MIME isViewableMimeType"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"UT-MIME isViewableMimeType UT-MIME-006: is case-sensitive and does not strip parameters (documents current behaviour)","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-MIME-006: is case-sensitive and does not strip parameters (documents current behaviour)"}],"endTime":1786711238338,"message":"","name":"C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\viewable-mime.spec.ts","startTime":1786711237121,"status":"passed","summary":""},{"assertionResults":[{"ancestorTitles":["UT-DUR parseDurationMs"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-DUR parseDurationMs UT-DUR-001: converts each supported unit to milliseconds","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"UT-DUR-001: converts each supported unit to milliseconds"},{"ancestorTitles":["UT-DUR parseDurationMs"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-DUR parseDurationMs UT-DUR-002: parses the production defaults used by the app","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-DUR-002: parses the production defaults used by the app"},{"ancestorTitles":["UT-DUR parseDurationMs"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"UT-DUR parseDurationMs UT-DUR-003: tolerates surrounding whitespace","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-DUR-003: tolerates surrounding whitespace"},{"ancestorTitles":["UT-DUR parseDurationMs"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-DUR parseDurationMs UT-DUR-004: tolerates internal whitespace between amount and unit","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-DUR-004: tolerates internal whitespace between amount and unit"},{"ancestorTitles":["UT-DUR parseDurationMs"],"duration":24,"failureDetails":[],"failureMessages":[],"fullName":"UT-DUR parseDurationMs UT-DUR-005: rejects malformed values rather than silently defaulting","invocations":1,"location":null,"numPassingAsserts":7,"retryReasons":[],"status":"passed","title":"UT-DUR-005: rejects malformed values rather than silently defaulting"},{"ancestorTitles":["UT-DUR parseDurationMs"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"UT-DUR parseDurationMs UT-DUR-006: accepts zero without throwing (boundary)","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-DUR-006: accepts zero without throwing (boundary)"}],"endTime":1786711238492,"message":"","name":"C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\duration.spec.ts","startTime":1786711238345,"status":"passed","summary":""},{"assertionResults":[{"ancestorTitles":["UT-MESH the old rule reproduces the failure"],"duration":3,"failureDetails":[],"failureMessages":[],"fullName":"UT-MESH the old rule reproduces the failure UT-MESH-001: simultaneous joins make BOTH sides offer — glare on every pair","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-MESH-001: simultaneous joins make BOTH sides offer — glare on every pair"},{"ancestorTitles":["UT-MESH the old rule reproduces the failure"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-MESH the old rule reproduces the failure UT-MESH-002: with frames still in flight, one pair dies while the others work","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"UT-MESH-002: with frames still in flight, one pair dies while the others work"},{"ancestorTitles":["UT-MESH the old rule reproduces the failure"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-MESH the old rule reproduces the failure UT-MESH-003: retrying cannot save it — the rule itself has no arbitration","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-MESH-003: retrying cannot save it — the rule itself has no arbitration"},{"ancestorTitles":["UT-MESH the id rule removes glare by construction"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-MESH the id rule removes glare by construction UT-MESH-004: with everyone visible, every pair gets exactly one offer","invocations":1,"location":null,"numPassingAsserts":5,"retryReasons":[],"status":"passed","title":"UT-MESH-004: with everyone visible, every pair gets exactly one offer"},{"ancestorTitles":["UT-MESH the id rule removes glare by construction"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"UT-MESH the id rule removes glare by construction UT-MESH-005: no pair can ever double-offer, whoever clicks first","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-MESH-005: no pair can ever double-offer, whoever clicks first"},{"ancestorTitles":["UT-MESH the id rule removes glare by construction"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"UT-MESH the id rule removes glare by construction UT-MESH-006: the same in-flight state that broke the old rule now connects everything","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-MESH-006: the same in-flight state that broke the old rule now connects everything"},{"ancestorTitles":["UT-MESH the id rule removes glare by construction"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-MESH the id rule removes glare by construction UT-MESH-006b: a pair whose initiator is still blind is pending, not broken","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"UT-MESH-006b: a pair whose initiator is still blind is pending, not broken"},{"ancestorTitles":["UT-MESH the id rule removes glare by construction"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-MESH the id rule removes glare by construction UT-MESH-007: reconciliation completes the mesh on the next pass","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-MESH-007: reconciliation completes the mesh on the next pass"},{"ancestorTitles":["UT-MESH the id rule removes glare by construction"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-MESH the id rule removes glare by construction UT-MESH-008: reconciling again is idempotent — no duplicate offers","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-MESH-008: reconciling again is idempotent — no duplicate offers"},{"ancestorTitles":["UT-MESH the id rule removes glare by construction"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"UT-MESH the id rule removes glare by construction UT-MESH-009: scales — a room of six has one offerer per pair and no glare","invocations":1,"location":null,"numPassingAsserts":17,"retryReasons":[],"status":"passed","title":"UT-MESH-009: scales — a room of six has one offerer per pair and no glare"}],"endTime":1786711238611,"message":"","name":"C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\mesh-negotiation.spec.ts","startTime":1786711238498,"status":"passed","summary":""},{"assertionResults":[{"ancestorTitles":["UT-DTO SignupDto"],"duration":15,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO SignupDto UT-DTO-001: normalizes email to trimmed lowercase before validation","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-DTO-001: normalizes email to trimmed lowercase before validation"},{"ancestorTitles":["UT-DTO SignupDto"],"duration":11,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO SignupDto UT-DTO-002: rejects malformed email addresses","invocations":1,"location":null,"numPassingAsserts":5,"retryReasons":[],"status":"passed","title":"UT-DTO-002: rejects malformed email addresses"},{"ancestorTitles":["UT-DTO SignupDto"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO SignupDto UT-DTO-003: enforces a minimum password length","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-DTO-003: enforces a minimum password length"},{"ancestorTitles":["UT-DTO SignupDto"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO SignupDto UT-DTO-004: rejects an empty full name","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-DTO-004: rejects an empty full name"},{"ancestorTitles":["UT-DTO SignupDto"],"duration":8,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO SignupDto UT-DTO-005: signup's password floor agrees with the shared MIN_PASSWORD_LENGTH constant","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-DTO-005: signup's password floor agrees with the shared MIN_PASSWORD_LENGTH constant"},{"ancestorTitles":["UT-DTO SignupDto"],"duration":3,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO SignupDto UT-DTO-006: does not enforce any password complexity (documents current policy)","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-DTO-006: does not enforce any password complexity (documents current policy)"},{"ancestorTitles":["UT-DTO LoginDto"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO LoginDto UT-DTO-007: normalizes email so login is case-insensitive","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-DTO-007: normalizes email so login is case-insensitive"},{"ancestorTitles":["UT-DTO password reset DTOs"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO password reset DTOs UT-DTO-008: ForgotPasswordDto requires a valid email","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-DTO-008: ForgotPasswordDto requires a valid email"},{"ancestorTitles":["UT-DTO password reset DTOs"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO password reset DTOs UT-DTO-009: ResetPasswordDto rejects an empty token","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-DTO-009: ResetPasswordDto rejects an empty token"},{"ancestorTitles":["UT-DTO password reset DTOs"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO password reset DTOs UT-DTO-010: ResetPasswordDto enforces MIN_PASSWORD_LENGTH","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-DTO-010: ResetPasswordDto enforces MIN_PASSWORD_LENGTH"},{"ancestorTitles":["UT-DTO password reset DTOs"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO password reset DTOs UT-DTO-011: ForgotPasswordDto does not normalize case (asymmetry with login/signup)","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-DTO-011: ForgotPasswordDto does not normalize case (asymmetry with login/signup)"},{"ancestorTitles":["UT-DTO query DTOs"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO query DTOs UT-DTO-012: coerces a numeric query string to a number","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-DTO-012: coerces a numeric query string to a number"},{"ancestorTitles":["UT-DTO query DTOs"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO query DTOs UT-DTO-013: treats an empty query value as absent rather than 0","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-DTO-013: treats an empty query value as absent rather than 0"},{"ancestorTitles":["UT-DTO query DTOs"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO query DTOs UT-DTO-014: rejects a non-numeric year instead of silently filtering by NaN","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-DTO-014: rejects a non-numeric year instead of silently filtering by NaN"},{"ancestorTitles":["UT-DTO query DTOs"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO query DTOs UT-DTO-015: rejects a non-UUID subjectId (prevents raw values reaching Prisma)","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-DTO-015: rejects a non-UUID subjectId (prevents raw values reaching Prisma)"},{"ancestorTitles":["UT-DTO query DTOs"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO query DTOs UT-DTO-016: enforces message limit boundaries 1..200","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"UT-DTO-016: enforces message limit boundaries 1..200"},{"ancestorTitles":["UT-DTO query DTOs"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"UT-DTO query DTOs UT-DTO-017: enforces academic-year sanity bounds on upload","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"UT-DTO-017: enforces academic-year sanity bounds on upload"}],"endTime":1786711239137,"message":"","name":"C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\dto-validation.spec.ts","startTime":1786711237064,"status":"passed","summary":""},{"assertionResults":[{"ancestorTitles":["IT-WB board ownership"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB board ownership IT-WB-001: the first claimant owns the board","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"IT-WB-001: the first claimant owns the board"},{"ancestorTitles":["IT-WB board ownership"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB board ownership IT-WB-002: a second person cannot take a board that is actively owned","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-WB-002: a second person cannot take a board that is actively owned"},{"ancestorTitles":["IT-WB board ownership"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB board ownership IT-WB-003: re-claiming your own board is a no-op, not a failure","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-WB-003: re-claiming your own board is a no-op, not a failure"},{"ancestorTitles":["IT-WB board ownership"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB board ownership IT-WB-004: a board held by a socket that has left can be claimed (crashed-owner recovery)","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-WB-004: a board held by a socket that has left can be claimed (crashed-owner recovery)"},{"ancestorTitles":["IT-WB board ownership"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB board ownership IT-WB-005: releasing keeps the strokes — it hands over the pen, it does not erase","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-WB-005: releasing keeps the strokes — it hands over the pen, it does not erase"},{"ancestorTitles":["IT-WB board ownership"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB board ownership IT-WB-006: grants are dropped when the owner leaves — they were the owner's to give","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-WB-006: grants are dropped when the owner leaves — they were the owner's to give"},{"ancestorTitles":["IT-WB board ownership"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB board ownership IT-WB-007: releasing a board you do not own does nothing","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-WB-007: releasing a board you do not own does nothing"},{"ancestorTitles":["IT-WB draw permission"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB draw permission IT-WB-008: the owner may always draw","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-WB-008: the owner may always draw"},{"ancestorTitles":["IT-WB draw permission"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB draw permission IT-WB-009: everyone else is refused until granted, and again once revoked","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"IT-WB-009: everyone else is refused until granted, and again once revoked"},{"ancestorTitles":["IT-WB draw permission"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB draw permission IT-WB-010: nobody can draw on a room that has no board","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-WB-010: nobody can draw on a room that has no board"},{"ancestorTitles":["IT-WB strokes"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB strokes IT-WB-011: chunks with the same id extend one stroke rather than creating many","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-WB-011: chunks with the same id extend one stroke rather than creating many"},{"ancestorTitles":["IT-WB strokes"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB strokes IT-WB-012: SECURITY — you cannot extend somebody else's stroke","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-WB-012: SECURITY — you cannot extend somebody else's stroke"},{"ancestorTitles":["IT-WB strokes"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB strokes IT-WB-013: undo removes only the caller's most recent stroke","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-WB-013: undo removes only the caller's most recent stroke"},{"ancestorTitles":["IT-WB strokes"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB strokes IT-WB-014: undo with nothing of your own returns undefined and changes nothing","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-WB-014: undo with nothing of your own returns undefined and changes nothing"},{"ancestorTitles":["IT-WB strokes"],"duration":74,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB strokes IT-WB-015: the stroke buffer is bounded, dropping oldest first","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-WB-015: the stroke buffer is bounded, dropping oldest first"},{"ancestorTitles":["IT-WB strokes"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB strokes IT-WB-016: clear empties the strokes but keeps the board and its owner","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-WB-016: clear empties the strokes but keeps the board and its owner"},{"ancestorTitles":["IT-WB empty-room lifecycle"],"duration":6,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB empty-room lifecycle IT-WB-017: the board survives the room emptying, until the grace period elapses","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"IT-WB-017: the board survives the room emptying, until the grace period elapses"},{"ancestorTitles":["IT-WB empty-room lifecycle"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB empty-room lifecycle IT-WB-018: rejoining inside the grace window saves the board (the reload case)","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-WB-018: rejoining inside the grace window saves the board (the reload case)"},{"ancestorTitles":["IT-WB empty-room lifecycle"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB empty-room lifecycle IT-WB-019: closing the room drops the board immediately, with no grace period","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-WB-019: closing the room drops the board immediately, with no grace period"},{"ancestorTitles":["IT-WB empty-room lifecycle"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-WB empty-room lifecycle IT-WB-020: a disconnect releases the board across every room the socket was in","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-WB-020: a disconnect releases the board across every room the socket was in"}],"endTime":1786711239263,"message":"","name":"C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\whiteboard.presence.spec.ts","startTime":1786711238253,"status":"passed","summary":""},{"assertionResults":[{"ancestorTitles":["UT-STO StorageService"],"duration":12,"failureDetails":[],"failureMessages":[],"fullName":"UT-STO StorageService UT-STO-001: download URL requests an attachment disposition","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-STO-001: download URL requests an attachment disposition"},{"ancestorTitles":["UT-STO StorageService"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-STO StorageService UT-STO-002: view URL requests an inline disposition and pins the content type","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-STO-002: view URL requests an inline disposition and pins the content type"},{"ancestorTitles":["UT-STO StorageService"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"UT-STO StorageService UT-STO-003: neutralizes a double quote so the filename cannot escape the quoted string","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-STO-003: neutralizes a double quote so the filename cannot escape the quoted string"},{"ancestorTitles":["UT-STO StorageService"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-STO StorageService UT-STO-004: neutralizes CR and LF so a header cannot be injected","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"UT-STO-004: neutralizes CR and LF so a header cannot be injected"},{"ancestorTitles":["UT-STO StorageService"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-STO StorageService UT-STO-005: neutralizes backslash escapes","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-STO-005: neutralizes backslash escapes"},{"ancestorTitles":["UT-STO StorageService"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-STO StorageService UT-STO-006: does NOT encode non-ASCII filenames (documents known defect QA-004)","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-STO-006: does NOT encode non-ASCII filenames (documents known defect QA-004)"},{"ancestorTitles":["UT-STO StorageService"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"UT-STO StorageService UT-STO-007: applies the documented default expiries (5 min download, 30 min view)","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"UT-STO-007: applies the documented default expiries (5 min download, 30 min view)"},{"ancestorTitles":["UT-STO StorageService"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-STO StorageService UT-STO-008: resolves logical bucket names through env overrides","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-STO-008: resolves logical bucket names through env overrides"}],"endTime":1786711239368,"message":"","name":"C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\storage.service.spec.ts","startTime":1786711237066,"status":"passed","summary":""},{"assertionResults":[{"ancestorTitles":["UT-SFU StoredFileUrlService"],"duration":15,"failureDetails":[],"failureMessages":[],"fullName":"UT-SFU StoredFileUrlService UT-SFU-001: forwards bucket and file key to the storage layer for downloads","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-SFU-001: forwards bucket and file key to the storage layer for downloads"},{"ancestorTitles":["UT-SFU StoredFileUrlService"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-SFU StoredFileUrlService UT-SFU-002: forwards the mime type for views (required to render inline)","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-SFU-002: forwards the mime type for views (required to render inline)"},{"ancestorTitles":["UT-SFU StoredFileUrlService"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"UT-SFU StoredFileUrlService UT-SFU-003: serializes expiry as an ISO string in the download DTO","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-SFU-003: serializes expiry as an ISO string in the download DTO"},{"ancestorTitles":["UT-SFU StoredFileUrlService"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"UT-SFU StoredFileUrlService UT-SFU-004: view DTO carries the metadata the viewer needs, and no storage key","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"UT-SFU-004: view DTO carries the metadata the viewer needs, and no storage key"},{"ancestorTitles":["UT-SFU StoredFileUrlService"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"UT-SFU StoredFileUrlService UT-SFU-005: is agnostic to the record's concrete model (structural typing)","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"UT-SFU-005: is agnostic to the record's concrete model (structural typing)"}],"endTime":1786711239642,"message":"","name":"C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\unit\\stored-file-url.service.spec.ts","startTime":1786711237039,"status":"passed","summary":""},{"assertionResults":[{"ancestorTitles":["IT-RES papers upload"],"duration":14,"failureDetails":[],"failureMessages":[],"fullName":"IT-RES papers upload IT-RES-001: rejects a request with no file attached","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-RES-001: rejects a request with no file attached"},{"ancestorTitles":["IT-RES papers upload"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"IT-RES papers upload IT-RES-002: rejects a non-PDF declared content type","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-RES-002: rejects a non-PDF declared content type"},{"ancestorTitles":["IT-RES papers upload"],"duration":3,"failureDetails":[],"failureMessages":[],"fullName":"IT-RES papers upload IT-RES-003: SECURITY — accepts HTML bytes when the client declares application/pdf","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"IT-RES-003: SECURITY — accepts HTML bytes when the client declares application/pdf"},{"ancestorTitles":["IT-RES papers upload"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"IT-RES papers upload IT-RES-004: refuses a byte-identical duplicate via checksum","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-RES-004: refuses a byte-identical duplicate via checksum"},{"ancestorTitles":["IT-RES papers upload"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"IT-RES papers upload IT-RES-005: derives a namespaced storage key with a random component","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-RES-005: derives a namespaced storage key with a random component"},{"ancestorTitles":["IT-RES papers upload"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-RES papers upload IT-RES-006: SECURITY — traversal sequences in the filename survive into the storage key","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-RES-006: SECURITY — traversal sequences in the filename survive into the storage key"},{"ancestorTitles":["IT-RES notes upload"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-RES notes upload IT-RES-007: accepts the documented office formats","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"IT-RES-007: accepts the documented office formats"},{"ancestorTitles":["IT-RES notes upload"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-RES notes upload IT-RES-008: rejects an unsupported type for notes","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-RES-008: rejects an unsupported type for notes"},{"ancestorTitles":["IT-RES URL issuance"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"IT-RES URL issuance IT-RES-009: papers download/view 404 when the row does not exist","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-RES-009: papers download/view 404 when the row does not exist"},{"ancestorTitles":["IT-RES URL issuance"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"IT-RES URL issuance IT-RES-010: notes download/view 404 when the row does not exist","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-RES-010: notes download/view 404 when the row does not exist"},{"ancestorTitles":["IT-RES URL issuance"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"IT-RES URL issuance IT-RES-011: each resource presigns against its own bucket","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-RES-011: each resource presigns against its own bucket"},{"ancestorTitles":["IT-GATE paper access gating"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"IT-GATE paper access gating IT-GATE-001: exactly one paper per (department, semester) is free","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-GATE-001: exactly one paper per (department, semester) is free"},{"ancestorTitles":["IT-GATE paper access gating"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-GATE paper access gating IT-GATE-002: nothing is locked for a logged-in caller","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-GATE-002: nothing is locked for a logged-in caller"},{"ancestorTitles":["IT-GATE paper access gating"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-GATE paper access gating IT-GATE-003: the free paper is stable across calls (not order-dependent)","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-GATE-003: the free paper is stable across calls (not order-dependent)"},{"ancestorTitles":["IT-GATE paper access gating"],"duration":3,"failureDetails":[],"failureMessages":[],"fullName":"IT-GATE paper access gating IT-GATE-004: SECURITY — anonymous view/download of a locked paper is refused","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"IT-GATE-004: SECURITY — anonymous view/download of a locked paper is refused"},{"ancestorTitles":["IT-GATE paper access gating"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-GATE paper access gating IT-GATE-005: anonymous access to the free paper is allowed","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"IT-GATE-005: anonymous access to the free paper is allowed"},{"ancestorTitles":["IT-GATE paper access gating"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-GATE paper access gating IT-GATE-006: a logged-in caller may open a paper that is locked for visitors","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-GATE-006: a logged-in caller may open a paper that is locked for visitors"},{"ancestorTitles":["IT-GATE paper access gating"],"duration":7,"failureDetails":[],"failureMessages":[],"fullName":"IT-GATE paper access gating IT-GATE-007: a missing paper still 404s rather than leaking the lock state","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-GATE-007: a missing paper still 404s rather than leaking the lock state"}],"endTime":1786711239689,"message":"","name":"C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\resources.service.spec.ts","startTime":1786711237070,"status":"passed","summary":""},{"assertionResults":[{"ancestorTitles":["IT-AUTH signup"],"duration":10,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH signup IT-AUTH-001: rejects an email outside the allowed university domains","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-001: rejects an email outside the allowed university domains"},{"ancestorTitles":["IT-AUTH signup"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH signup IT-AUTH-002: rejects a duplicate account with 409 rather than overwriting","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-002: rejects a duplicate account with 409 rather than overwriting"},{"ancestorTitles":["IT-AUTH signup"],"duration":167,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH signup IT-AUTH-003: stores an argon2 hash, never the plaintext password","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"IT-AUTH-003: stores an argon2 hash, never the plaintext password"},{"ancestorTitles":["IT-AUTH signup"],"duration":70,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH signup IT-AUTH-004: normalizes the email to lowercase before persisting","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-AUTH-004: normalizes the email to lowercase before persisting"},{"ancestorTitles":["IT-AUTH signup"],"duration":71,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH signup IT-AUTH-025: issues NO session at signup — the account is unusable until confirmed","invocations":1,"location":null,"numPassingAsserts":6,"retryReasons":[],"status":"passed","title":"IT-AUTH-025: issues NO session at signup — the account is unusable until confirmed"},{"ancestorTitles":["IT-AUTH signup"],"duration":71,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH signup IT-AUTH-026: the confirmation link mailed at signup is a hash-stored single-use token","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"IT-AUTH-026: the confirmation link mailed at signup is a hash-stored single-use token"},{"ancestorTitles":["IT-AUTH signup"],"duration":66,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH signup IT-AUTH-027: verification hash is domain-separated from BOTH the refresh and reset hashes","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"IT-AUTH-027: verification hash is domain-separated from BOTH the refresh and reset hashes"},{"ancestorTitles":["IT-AUTH login"],"duration":120,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH login IT-AUTH-005: returns an identical generic error for unknown user and wrong password","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"IT-AUTH-005: returns an identical generic error for unknown user and wrong password"},{"ancestorTitles":["IT-AUTH login"],"duration":106,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH login IT-AUTH-006: issues tokens and never returns the password hash to the client","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"IT-AUTH-006: issues tokens and never returns the password hash to the client"},{"ancestorTitles":["IT-AUTH login"],"duration":105,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH login IT-AUTH-007: persists only an HMAC of the refresh token, never the raw value","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-007: persists only an HMAC of the refresh token, never the raw value"},{"ancestorTitles":["IT-AUTH email verification gate"],"duration":100,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH email verification gate IT-AUTH-028: login is refused with 403 while the address is unconfirmed","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"IT-AUTH-028: login is refused with 403 while the address is unconfirmed"},{"ancestorTitles":["IT-AUTH email verification gate"],"duration":103,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH email verification gate IT-AUTH-029: the gate runs only after the password check, so it can't confirm an account for free","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-029: the gate runs only after the password check, so it can't confirm an account for free"},{"ancestorTitles":["IT-AUTH email verification gate"],"duration":105,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH email verification gate IT-AUTH-030: login succeeds once the address is confirmed","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-030: login succeeds once the address is confirmed"},{"ancestorTitles":["IT-AUTH email verification gate"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH email verification gate IT-AUTH-031: verifyEmail marks the account verified and burns the token atomically","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"IT-AUTH-031: verifyEmail marks the account verified and burns the token atomically"},{"ancestorTitles":["IT-AUTH email verification gate"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH email verification gate IT-AUTH-032: an unknown or expired confirmation token is rejected with one generic message","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-032: an unknown or expired confirmation token is rejected with one generic message"},{"ancestorTitles":["IT-AUTH email verification gate"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH email verification gate IT-AUTH-033: re-opening a spent link for an already-verified account succeeds instead of erroring","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-033: re-opening a spent link for an already-verified account succeeds instead of erroring"},{"ancestorTitles":["IT-AUTH email verification gate"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH email verification gate IT-AUTH-034: resendVerification is silent for unknown and already-verified addresses","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"IT-AUTH-034: resendVerification is silent for unknown and already-verified addresses"},{"ancestorTitles":["IT-AUTH email verification gate"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH email verification gate IT-AUTH-035: resendVerification issues a fresh link and kills the previous one","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-035: resendVerification issues a fresh link and kills the previous one"},{"ancestorTitles":["IT-AUTH email verification gate"],"duration":47,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH email verification gate IT-AUTH-036: a mail failure during signup does not fail the signup itself","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-036: a mail failure during signup does not fail the signup itself"},{"ancestorTitles":["IT-AUTH refresh"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH refresh IT-AUTH-008: rejects an expired refresh token","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-AUTH-008: rejects an expired refresh token"},{"ancestorTitles":["IT-AUTH refresh"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH refresh IT-AUTH-009: rejects an unknown/revoked refresh token","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-AUTH-009: rejects an unknown/revoked refresh token"},{"ancestorTitles":["IT-AUTH refresh"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH refresh IT-AUTH-010: rotates the token — the presented one is revoked after use","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-AUTH-010: rotates the token — the presented one is revoked after use"},{"ancestorTitles":["IT-AUTH forgot password"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH forgot password IT-AUTH-011: resolves silently for an unregistered address (no enumeration via response)","invocations":1,"location":null,"numPassingAsserts":3,"retryReasons":[],"status":"passed","title":"IT-AUTH-011: resolves silently for an unregistered address (no enumeration via response)"},{"ancestorTitles":["IT-AUTH forgot password"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH forgot password IT-AUTH-012: invalidates any outstanding reset link before issuing a new one","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-AUTH-012: invalidates any outstanding reset link before issuing a new one"},{"ancestorTitles":["IT-AUTH forgot password"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH forgot password IT-AUTH-013: stores only a hash of the reset token; the raw token goes to email only","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-013: stores only a hash of the reset token; the raw token goes to email only"},{"ancestorTitles":["IT-AUTH forgot password"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH forgot password IT-AUTH-014: reset-token hash is domain-separated from the refresh-token hash","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-014: reset-token hash is domain-separated from the refresh-token hash"},{"ancestorTitles":["IT-AUTH forgot password"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH forgot password IT-AUTH-015: honours the configured TTL when setting expiry","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-015: honours the configured TTL when setting expiry"},{"ancestorTitles":["IT-AUTH forgot password"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH forgot password IT-AUTH-016: a mail delivery failure does not surface to the caller","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-AUTH-016: a mail delivery failure does not surface to the caller"},{"ancestorTitles":["IT-AUTH forgot password"],"duration":19,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH forgot password IT-AUTH-017: SECURITY — a DB failure DOES surface, creating a 500-vs-200 enumeration oracle","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-017: SECURITY — a DB failure DOES surface, creating a 500-vs-200 enumeration oracle"},{"ancestorTitles":["IT-AUTH forgot password"],"duration":2,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH forgot password IT-AUTH-018: SECURITY — the registered path performs strictly more awaited work (timing oracle)","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-018: SECURITY — the registered path performs strictly more awaited work (timing oracle)"},{"ancestorTitles":["IT-AUTH reset password"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH reset password IT-AUTH-019: rejects an unknown token","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-019: rejects an unknown token"},{"ancestorTitles":["IT-AUTH reset password"],"duration":1,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH reset password IT-AUTH-020: rejects an already-used token (single use enforced)","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-020: rejects an already-used token (single use enforced)"},{"ancestorTitles":["IT-AUTH reset password"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH reset password IT-AUTH-021: rejects an expired token","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-AUTH-021: rejects an expired token"},{"ancestorTitles":["IT-AUTH reset password"],"duration":0,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH reset password IT-AUTH-022: gives the same generic message for unknown, used and expired tokens","invocations":1,"location":null,"numPassingAsserts":1,"retryReasons":[],"status":"passed","title":"IT-AUTH-022: gives the same generic message for unknown, used and expired tokens"},{"ancestorTitles":["IT-AUTH reset password"],"duration":50,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH reset password IT-AUTH-023: on success, burns the token and revokes every live session atomically","invocations":1,"location":null,"numPassingAsserts":4,"retryReasons":[],"status":"passed","title":"IT-AUTH-023: on success, burns the token and revokes every live session atomically"},{"ancestorTitles":["IT-AUTH reset password"],"duration":95,"failureDetails":[],"failureMessages":[],"fullName":"IT-AUTH reset password IT-AUTH-024: the new password is argon2-hashed before it reaches the database","invocations":1,"location":null,"numPassingAsserts":2,"retryReasons":[],"status":"passed","title":"IT-AUTH-024: the new password is argon2-hashed before it reaches the database"}],"endTime":1786711240840,"message":"","name":"C:\\Users\\shrey\\OneDrive\\Desktop\\scholarbase\\backend\\test\\integration\\auth.service.spec.ts","startTime":1786711237062,"status":"passed","summary":""}],"wasInterrupted":false}

```

## backend\jest.config.js

```js
/**
 * Jest config for the backend test suites.
 *
 * Suites are split by what they need to run:
 *   test/unit/        - pure logic, no I/O, no Nest container
 *   test/integration/ - Nest services wired against mocked Prisma/Storage
 *   test/e2e/         - black-box HTTP against a running backend + real DB
 *
 * e2e is excluded from the default `pnpm test` run because it needs a live
 * server and database; run it explicitly with `pnpm test:e2e`.
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  roots: ["<rootDir>/test", "<rootDir>/src"],
  testMatch: ["**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/test/e2e/"],
  moduleFileExtensions: ["ts", "js", "json"],
  setupFiles: ["<rootDir>/test/jest.setup.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json", isolatedModules: true }],
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.module.ts",
    "!src/main.ts",
    "!src/**/*.dto.ts",
  ],
  coverageDirectory: "<rootDir>/coverage",
  testTimeout: 15000,
};

```

## backend\nest-cli.json

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}

```

## backend\package.json

```json
{
  "name": "@scholarbase/backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main.js",
    "lint": "eslint \"src/**/*.ts\"",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "seed:admin": "ts-node -r tsconfig-paths/register prisma/seed-admin.ts",
    "seed:it-papers": "ts-node -r tsconfig-paths/register prisma/seed-it-papers.ts"
  },
  "dependencies": {
    "@langchain/core": "^1.2.8",
    "@langchain/google-genai": "^2.2.0",
    "@langchain/textsplitters": "^1.0.1",
    "@nestjs/common": "^10.4.6",
    "@nestjs/config": "^3.3.0",
    "@nestjs/core": "^10.4.6",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/mapped-types": "^2.0.6",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.4.6",
    "@nestjs/platform-socket.io": "^10.4.22",
    "@nestjs/websockets": "^10.4.22",
    "@pinecone-database/pinecone": "^8.2.0",
    "@prisma/client": "^5.20.0",
    "@scholarbase/shared-types": "workspace:*",
    "argon2": "^0.41.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "dotenv": "^16.4.5",
    "langchain": "^1.5.9",
    "minio": "^8.0.2",
    "multer": "^2.2.0",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-jwt": "^4.0.1",
    "pdf-parse": "^2.4.5",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "socket.io": "^4.8.1",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.5",
    "@nestjs/schematics": "^10.1.4",
    "@nestjs/testing": "^10.4.6",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.13",
    "@types/multer": "^1.4.12",
    "@types/node": "^22.7.5",
    "@types/passport-google-oauth20": "^2.0.17",
    "@types/passport-jwt": "^4.0.1",
    "@types/pdf-parse": "^1.1.5",
    "@types/supertest": "^7.2.1",
    "@types/uuid": "^9.0.8",
    "jest": "^29.7.0",
    "prisma": "^5.20.0",
    "socket.io-client": "^4.8.3",
    "source-map-support": "^0.5.21",
    "supertest": "^7.2.2",
    "ts-jest": "^29.2.5",
    "ts-loader": "^9.5.1",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.6.3"
  }
}

```

## backend\prisma\check-hash-params.ts

```ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { email: true, passwordHash: true } });

  // Only the parameter header is printed — never the salt or the digest.
  // An argon2 hash looks like:  $argon2id$v=19$m=65536,t=3,p=4$<salt>$<digest>
  const rows = users.map((u) => {
    const parts = u.passwordHash.split("$");
    return {
      email: u.email.replace(/(.{3}).*(@.*)/, "$1***$2"),
      algorithm: parts[1],
      version: parts[2],
      params: parts[3],
      saltLen: parts[4]?.length ?? 0,
      digestLen: parts[5]?.length ?? 0,
    };
  });

  console.table(rows.slice(0, 3));

  const uniqueSalts = new Set(users.map((u) => u.passwordHash.split("$")[4]));
  console.log(`Distinct salts: ${uniqueSalts.size} across ${users.length} users`);
}

main()
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

```

## backend\prisma\check-reset.ts

```ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.passwordResetToken.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      createdAt: true,
      expiresAt: true,
      usedAt: true,
      user: { select: { email: true, role: true } },
    },
  });
  console.table(
    rows.map((r) => ({
      email: r.user.email,
      role: r.user.role,
      createdAt: r.createdAt.toISOString(),
      expiresAt: r.expiresAt.toISOString(),
      used: Boolean(r.usedAt),
    })),
  );
}

main()
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

```

## backend\prisma\inspect-admin.ts

```ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true,
      emailVerifiedAt: true,
      createdAt: true,
      _count: { select: { uploadedPapers: true, uploadedNotes: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  console.table(
    users.map((u) => ({
      email: u.email,
      role: u.role,
      name: u.fullName,
      verified: Boolean(u.emailVerifiedAt),
      papers: u._count.uploadedPapers,
      notes: u._count.uploadedNotes,
    })),
  );
}

main()
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

```

## backend\prisma\rotate-admin.ts

```ts
import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";

const OLD_EMAIL = "admin@youruniversity.edu.in";
const NEW_EMAIL = "shreyashmandlapure2024.it@mmcoe.edu.in";

const prisma = new PrismaClient();

async function main() {
  const oldAdmin = await prisma.user.findUnique({ where: { email: OLD_EMAIL } });
  const newAdmin = await prisma.user.findUnique({ where: { email: NEW_EMAIL } });

  if (!oldAdmin) throw new Error(`${OLD_EMAIL} not found — nothing to rotate`);
  if (!newAdmin) throw new Error(`${NEW_EMAIL} not found — sign up with it first`);
  if (!newAdmin.emailVerifiedAt) {
    throw new Error(`${NEW_EMAIL} is not verified — login would be refused after promotion`);
  }

  // Rooms are reassigned rather than left behind. Closing a room in the admin
  // UI is a *soft* close (isActive: false) that keeps the transcript, so the
  // rows survive — and StudyRoom.createdBy cascades on delete, which would
  // destroy those rooms and every message in them along with the old account.
  const [papers, notes, rooms] = await prisma.$transaction([
    prisma.questionPaper.updateMany({
      where: { uploadedById: oldAdmin.id },
      data: { uploadedById: newAdmin.id },
    }),
    prisma.note.updateMany({
      where: { uploadedById: oldAdmin.id },
      data: { uploadedById: newAdmin.id },
    }),
    prisma.studyRoom.updateMany({
      where: { createdById: oldAdmin.id },
      data: { createdById: newAdmin.id },
    }),
  ]);

  // Promote first, delete second: if the delete failed we would rather be left
  // with two admins than none.
  await prisma.user.update({
    where: { id: newAdmin.id },
    data: { role: UserRole.admin },
  });

  await prisma.user.delete({ where: { id: oldAdmin.id } });

  console.log("Reassigned:", { papers: papers.count, notes: notes.count, rooms: rooms.count });
  console.log("Promoted:", NEW_EMAIL);
  console.log("Deleted:", OLD_EMAIL);
}

main()
  .catch((err) => {
    console.error("FAILED:", err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

```

## backend\prisma\schema.prisma

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector]
}

enum UserRole {
  student
  admin
}

enum StudyRoomVisibility {
  public
  private
}

enum UploadStatus {
  pending
  ready
  failed
}

enum IngestionStatus {
  not_ingested
  queued
  ingested
  failed
}

model User {
  id              String    @id @default(uuid())
  email           String    @unique @db.Citext
  passwordHash    String    @map("password_hash")
  fullName        String    @map("full_name")
  role            UserRole  @default(student)
  emailVerifiedAt DateTime? @map("email_verified_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  refreshTokens           RefreshToken[]
  passwordResetTokens     PasswordResetToken[]
  emailVerificationTokens EmailVerificationToken[]
  uploadedPapers      QuestionPaper[]      @relation("PaperUploader")
  uploadedNotes       Note[]               @relation("NoteUploader")
  studyRooms          StudyRoom[]          @relation("StudyRoomCreator")
  studyRoomMessages   StudyRoomMessage[]   @relation("StudyRoomMessageSender")
  studyRoomMembers    StudyRoomMember[]    @relation("StudyRoomMembership")
  
  aiPromptCount       Int                  @default(0) @map("ai_prompt_count")
  aiLimitResetAt      DateTime?            @map("ai_limit_reset_at")
  aiSessions          AiSession[]          @relation("UserAiSessions")

  @@map("users")
}

model AllowedEmailDomain {
  id     String @id @default(uuid())
  domain String @unique

  @@map("allowed_email_domains")
}

model RefreshToken {
  id                String    @id @default(uuid())
  userId            String    @map("user_id")
  tokenHash         String    @map("token_hash")
  expiresAt         DateTime  @map("expires_at")
  revokedAt         DateTime? @map("revoked_at")
  replacedByTokenId String?   @map("replaced_by_token_id")
  createdAt         DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}

// Password reset links.
//
// Only the HMAC of the token is stored, so a database leak does not hand out
// working reset links — same treatment as refresh tokens. `usedAt` makes a link
// single-use: without it, anyone who later reads the mail (a shared inbox, a
// forwarded thread, browser history) could reset the password again.
model PasswordResetToken {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  tokenHash String    @unique @map("token_hash")
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("password_reset_tokens")
}

// Signup email-confirmation links.
//
// Same treatment as password reset tokens — only the HMAC is stored, and the
// hash is domain-separated from both the refresh and reset hashes so one string
// can never be redeemed as more than one kind of token. `usedAt` keeps the link
// single-use so a forwarded confirmation mail can't be replayed by someone else.
model EmailVerificationToken {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  tokenHash String    @unique @map("token_hash")
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("email_verification_tokens")
}

model YearLevel {
  id         String @id @default(uuid())
  yearNumber Int    @unique @map("year_number")
  label      String

  subjects Subject[]

  @@map("year_levels")
}

model Subject {
  id          String  @id @default(uuid())
  yearLevelId String  @map("year_level_id")
  code        String
  name        String
  department  String?
  semester    Int?
  credits     Int?

  yearLevel      YearLevel       @relation(fields: [yearLevelId], references: [id], onDelete: Cascade)
  questionPapers QuestionPaper[]
  notes          Note[]

  @@unique([yearLevelId, code])
  @@map("subjects")
}

model ExamType {
  id   String @id @default(uuid())
  name String @unique

  questionPapers QuestionPaper[]

  @@map("exam_types")
}

model QuestionPaper {
  id              String          @id @default(uuid())
  subjectId       String          @map("subject_id")
  examTypeId      String          @map("exam_type_id")
  academicYear    Int             @map("academic_year")
  fileKey         String          @map("file_key")
  fileName        String          @map("file_name")
  fileSizeBytes   Int             @map("file_size_bytes")
  mimeType        String          @map("mime_type")
  checksum        String
  uploadedById    String          @map("uploaded_by")
  uploadStatus    UploadStatus    @default(pending) @map("upload_status")
  ingestionStatus IngestionStatus @default(not_ingested) @map("ingestion_status")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  subject    Subject  @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  examType   ExamType @relation(fields: [examTypeId], references: [id])
  uploadedBy User     @relation("PaperUploader", fields: [uploadedById], references: [id])

  @@unique([checksum])
  @@index([subjectId, academicYear])
  @@map("question_papers")
}

model StudyRoom {
  id          String              @id @default(uuid())
  name        String
  description String?
  createdById String              @map("created_by")
  visibility  StudyRoomVisibility @default(private)
  /// Secret half of the invite link. Knowing a room's id is deliberately not
  /// enough to enter a private room — the code has to be redeemed first.
  inviteCode  String              @unique @map("invite_code")
  isActive    Boolean             @default(true) @map("is_active")
  createdAt   DateTime            @default(now()) @map("created_at")
  updatedAt   DateTime            @updatedAt @map("updated_at")

  createdBy User               @relation("StudyRoomCreator", fields: [createdById], references: [id], onDelete: Cascade)
  messages  StudyRoomMessage[]
  members   StudyRoomMember[]

  @@index([isActive, createdAt])
  @@map("study_rooms")
}

/// Who has redeemed a private room's invite. Persisted so an invited user only
/// needs the link once, not every time they come back to the room.
model StudyRoomMember {
  id       String   @id @default(uuid())
  roomId   String   @map("room_id")
  userId   String   @map("user_id")
  joinedAt DateTime @default(now()) @map("joined_at")

  room StudyRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user User      @relation("StudyRoomMembership", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([roomId, userId])
  @@index([userId])
  @@map("study_room_members")
}

model StudyRoomMessage {
  id        String   @id @default(uuid())
  roomId    String   @map("room_id")
  senderId  String   @map("sender_id")
  body      String
  createdAt DateTime @default(now()) @map("created_at")

  room   StudyRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)
  sender User      @relation("StudyRoomMessageSender", fields: [senderId], references: [id], onDelete: Cascade)

  @@index([roomId, createdAt])
  @@map("study_room_messages")
}

model Note {
  id            String       @id @default(uuid())
  subjectId     String       @map("subject_id")
  title         String
  unitTopic     String?      @map("unit_topic")
  fileKey       String       @map("file_key")
  fileName      String       @map("file_name")
  fileSizeBytes Int          @map("file_size_bytes")
  mimeType      String       @map("mime_type")
  uploadedById  String       @map("uploaded_by")
  uploadStatus  UploadStatus @default(pending) @map("upload_status")
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  subject    Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  uploadedBy User    @relation("NoteUploader", fields: [uploadedById], references: [id])

  @@index([subjectId])
  @@map("notes")
}

enum AiMessageRole {
  user
  assistant
  system
}

model AiSession {
  id        String      @id @default(uuid())
  userId    String      @map("user_id")
  createdAt DateTime    @default(now()) @map("created_at")
  updatedAt DateTime    @updatedAt @map("updated_at")

  user      User        @relation("UserAiSessions", fields: [userId], references: [id], onDelete: Cascade)
  messages  AiMessage[] @relation("SessionMessages")

  @@index([userId])
  @@map("ai_sessions")
}

model AiMessage {
  id        String        @id @default(uuid())
  sessionId String        @map("session_id")
  role      AiMessageRole
  content   String
  createdAt DateTime      @default(now()) @map("created_at")

  session   AiSession     @relation("SessionMessages", fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId, createdAt])
  @@map("ai_messages")
}

model DocumentChunk {
  id        String   @id @default(uuid())
  content   String
  metadata  Json?
  embedding Unsupported("vector(1536)")?

  @@map("document_chunks")
}

```

## backend\prisma\seed-admin.ts

```ts
import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import * as argon2 from "argon2";
import { EXAM_TYPE_LABELS } from "@scholarbase/shared-types";

const prisma = new PrismaClient();

// Baseline reference data. Without at least one row in each of these, the admin
// page's "Add subject" and "Upload question paper" forms render empty Year
// level / Exam type dropdowns and neither form can be submitted — a fresh
// deployment is unusable until they exist. Both are upserted, so re-running is
// safe and won't clobber labels an admin has since edited via the UI.
const YEAR_LEVELS = [
  { yearNumber: 1, label: "1st Year" },
  { yearNumber: 2, label: "2nd Year" },
  { yearNumber: 3, label: "3rd Year" },
  { yearNumber: 4, label: "4th Year" },
];

// Shared with the UI so every exam type the pages render a section for exists
// as a row. A type listed on only one side is silently invisible: named here
// but absent from the database and the section renders empty, present in the
// database but absent there and its papers are never shown.
const EXAM_TYPES: readonly string[] = EXAM_TYPE_LABELS;

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME ?? "Site Admin";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin account");
  }

  // Student signup is gated on allowed_email_domains, so the domains configured
  // in ALLOWED_EMAIL_DOMAINS have to exist as rows before anyone can register.
  const domains = (process.env.ALLOWED_EMAIL_DOMAINS ?? "")
    .split(",")
    .map((d) => d.toLowerCase().trim())
    .filter(Boolean);

  if (domains.length === 0) {
    throw new Error("ALLOWED_EMAIL_DOMAINS must list at least one domain, e.g. youruniversity.edu.in");
  }

  for (const domain of domains) {
    await prisma.allowedEmailDomain.upsert({
      where: { domain },
      update: {},
      create: { domain },
    });
  }

  console.log(`Allowed signup domains: ${domains.join(", ")}`);

  const passwordHash = await argon2.hash(password);

  // emailVerifiedAt is set explicitly: login refuses unverified accounts, and
  // nobody is going to click a confirmation link for a seeded service account.
  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, fullName, role: UserRole.admin, emailVerifiedAt: new Date() },
    create: {
      email,
      passwordHash,
      fullName,
      role: UserRole.admin,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`Admin account ready: ${admin.email} (id: ${admin.id})`);

  for (const yearLevel of YEAR_LEVELS) {
    await prisma.yearLevel.upsert({
      where: { yearNumber: yearLevel.yearNumber },
      update: {},
      create: yearLevel,
    });
  }

  for (const name of EXAM_TYPES) {
    await prisma.examType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(
    `Reference data ready: ${YEAR_LEVELS.length} year levels, exam types ${EXAM_TYPES.join(", ")}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

```

## backend\prisma\seed-it-papers.ts

```ts
import "dotenv/config";
import { createHash } from "crypto";
import { PrismaClient, UploadStatus } from "@prisma/client";
import { Client as MinioClient } from "minio";

const prisma = new PrismaClient();

const minio = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
  port: Number(process.env.MINIO_PORT ?? "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ROOT_USER!,
  secretKey: process.env.MINIO_ROOT_PASSWORD!,
});
const PAPERS_BUCKET = process.env.MINIO_BUCKET_PAPERS ?? "papers";

const YEAR_LEVELS = [
  { yearNumber: 1, label: "1st Year" },
  { yearNumber: 2, label: "2nd Year" },
  { yearNumber: 3, label: "3rd Year" },
  { yearNumber: 4, label: "4th Year" },
];

const EXAM_TYPES = ["Unit Test", "End Term", "RE-ETE"];

const DEPARTMENT = "IT";

interface SubjectSeed {
  code: string;
  name: string;
  semester: number;
  yearNumber: number;
}

const SUBJECTS: SubjectSeed[] = [
  { code: "M2", name: "Engineering Mathematics II", semester: 2, yearNumber: 1 },
  { code: "AC", name: "Applied Chemistry", semester: 2, yearNumber: 1 },
  { code: "CYBER", name: "Cyber Security", semester: 3, yearNumber: 2 },
  { code: "DSA", name: "Data Structures & Algorithms", semester: 3, yearNumber: 2 },
  { code: "OOP", name: "Object-Oriented Programming", semester: 3, yearNumber: 2 },
  { code: "SEM", name: "SEM", semester: 3, yearNumber: 2 },
  { code: "OS", name: "Operating Systems", semester: 4, yearNumber: 2 },
  { code: "DBMS", name: "Database Management Systems", semester: 4, yearNumber: 2 },
  { code: "JAPANESE", name: "Japanese", semester: 4, yearNumber: 2 },
  { code: "CN", name: "Computer Networks", semester: 4, yearNumber: 2 },
];

// subjectCode -> examType label -> object key already sitting in the "papers" MinIO bucket
const PAPER_FILES: Record<string, Partial<Record<(typeof EXAM_TYPES)[number], string>>> = {
  M2: { "End Term": "M2 ETE.pdf" },
  AC: { "End Term": "AC ETE.pdf" },
  CYBER: { "Unit Test": "Cyber UT.pdf", "End Term": "Cyber ETE.pdf" },
  DSA: { "Unit Test": "DSA UT.pdf", "End Term": "DSA ETE.pdf" },
  OOP: { "Unit Test": "OOP UT.pdf", "End Term": "OOP ETE.pdf" },
  SEM: { "Unit Test": "SEM UT.pdf", "End Term": "SEM ETE.pdf" },
  OS: { "Unit Test": "OS UT.pdf" },
  DBMS: { "Unit Test": "DBMS UT.pdf" },
  JAPANESE: { "Unit Test": "Japanese UT.pdf" },
  CN: { "Unit Test": "CN UT.pdf" },
};

const ACADEMIC_YEAR = 2025;

async function hashObject(key: string): Promise<{ checksum: string; size: number }> {
  const stream = await minio.getObject(PAPERS_BUCKET, key);
  const hash = createHash("sha256");
  let size = 0;
  for await (const chunk of stream) {
    hash.update(chunk);
    size += chunk.length;
  }
  return { checksum: hash.digest("hex"), size };
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  if (!adminEmail) throw new Error("ADMIN_EMAIL must be set (same as backend/.env)");
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) throw new Error(`No user found for ${adminEmail} — run "pnpm seed:admin" first`);

  const yearLevelByNumber = new Map<number, string>();
  for (const yl of YEAR_LEVELS) {
    const row = await prisma.yearLevel.upsert({
      where: { yearNumber: yl.yearNumber },
      update: { label: yl.label },
      create: yl,
    });
    yearLevelByNumber.set(row.yearNumber, row.id);
  }

  const examTypeByName = new Map<string, string>();
  for (const name of EXAM_TYPES) {
    const row = await prisma.examType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    examTypeByName.set(name, row.id);
  }

  const subjectIdByCode = new Map<string, string>();
  for (const s of SUBJECTS) {
    const yearLevelId = yearLevelByNumber.get(s.yearNumber)!;
    const row = await prisma.subject.upsert({
      where: { yearLevelId_code: { yearLevelId, code: s.code } },
      update: { name: s.name, department: DEPARTMENT, semester: s.semester },
      create: {
        yearLevelId,
        code: s.code,
        name: s.name,
        department: DEPARTMENT,
        semester: s.semester,
      },
    });
    subjectIdByCode.set(s.code, row.id);
    console.log(`Subject ready: ${s.code} (sem ${s.semester}) — ${row.id}`);
  }

  let created = 0;
  let skipped = 0;
  for (const [subjectCode, byExamType] of Object.entries(PAPER_FILES)) {
    const subjectId = subjectIdByCode.get(subjectCode)!;
    for (const [examTypeName, fileKey] of Object.entries(byExamType)) {
      const examTypeId = examTypeByName.get(examTypeName)!;

      const existing = await prisma.questionPaper.findFirst({
        where: { subjectId, examTypeId, academicYear: ACADEMIC_YEAR },
      });
      if (existing) {
        skipped++;
        continue;
      }

      const { checksum, size } = await hashObject(fileKey!);
      await prisma.questionPaper.create({
        data: {
          subjectId,
          examTypeId,
          academicYear: ACADEMIC_YEAR,
          fileKey: fileKey!,
          fileName: fileKey!,
          fileSizeBytes: size,
          mimeType: "application/pdf",
          checksum,
          uploadedById: admin.id,
          uploadStatus: UploadStatus.ready,
        },
      });
      created++;
      console.log(`Paper linked: ${subjectCode} / ${examTypeName} <- ${fileKey}`);
    }
  }

  console.log(`\nDone. ${created} question papers created, ${skipped} already existed.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

```

## backend\qa-realtime-results.json

```json
[
  {
    "id": "RT-PRES-001",
    "module": "Presence",
    "name": "Joining emits a roster to the joiner",
    "expected": "room:joined with self + participants",
    "actual": "joined events=1",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-PRES-002",
    "module": "Presence",
    "name": "Existing members are told when someone joins",
    "expected": "participant-joined on the earlier client",
    "actual": "1 event(s)",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-CHAT-001",
    "module": "Chat",
    "name": "A message reaches the other participant",
    "expected": "chat:message delivered",
    "actual": "delivered",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-CHAT-002",
    "module": "Chat",
    "name": "An over-length message is rejected, not broadcast",
    "expected": "no broadcast",
    "actual": "rejected",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-CHAT-003",
    "module": "Chat",
    "name": "Typing indicator is relayed",
    "expected": "chat:typing on the peer",
    "actual": "1 event(s)",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-WB-001",
    "module": "Whiteboard",
    "name": "Owner can claim the board",
    "expected": "whiteboard:state naming the owner",
    "actual": "owner=Site Admin",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-WB-002",
    "module": "Whiteboard",
    "name": "A second person cannot seize an owned board",
    "expected": "refused with an error",
    "actual": "refused",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-WB-003",
    "module": "Whiteboard",
    "name": "SECURITY — drawing without a grant is ignored",
    "expected": "no stroke broadcast",
    "actual": "ignored",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-WB-004",
    "module": "Whiteboard",
    "name": "Ask-to-draw reaches the owner only",
    "expected": "draw-requested on owner, not on others",
    "actual": "owner=1, other=0",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-WB-005",
    "module": "Whiteboard",
    "name": "Owner can grant the pen",
    "expected": "grant broadcast including the student",
    "actual": "[\"10d875fe-e8fa-412a-a6c4-650842a42745\"]",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-WB-006",
    "module": "Whiteboard",
    "name": "A granted student's stroke reaches the room",
    "expected": "stroke broadcast",
    "actual": "received",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-WB-007",
    "module": "Whiteboard",
    "name": "Out-of-range coordinates are rejected",
    "expected": "no broadcast",
    "actual": "rejected",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-WB-008",
    "module": "Whiteboard",
    "name": "Undo removes the caller's own stroke",
    "expected": "undo of rt-granted",
    "actual": "rt-granted",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-WB-009",
    "module": "Whiteboard",
    "name": "SECURITY — a non-owner cannot clear the board",
    "expected": "refused",
    "actual": "refused",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-WB-010",
    "module": "Whiteboard",
    "name": "Owner can clear the board",
    "expected": "cleared broadcast",
    "actual": "1 event(s)",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-PTR-001",
    "module": "Screen pointer",
    "name": "SECURITY — pointer is dropped when nobody is sharing",
    "expected": "no relay",
    "actual": "dropped",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-PTR-002",
    "module": "Screen pointer",
    "name": "Pointer relays while a screen share is active",
    "expected": "x=0.25 y=0.75 with the sender's name",
    "actual": "x=0.25 y=0.75 from QA student",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-PTR-003",
    "module": "Screen pointer",
    "name": "Malformed / out-of-range pointer coordinates are rejected",
    "expected": "no relay",
    "actual": "rejected",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-SIG-001",
    "module": "WebRTC signalling",
    "name": "Signals route to a peer in the same room",
    "expected": "delivered",
    "actual": "delivered",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-SIG-002",
    "module": "WebRTC signalling",
    "name": "SECURITY — signals to a non-member socket are refused",
    "expected": "no relay",
    "actual": "refused",
    "status": "PASS",
    "severity": "-"
  },
  {
    "id": "RT-PRES-003",
    "module": "Presence",
    "name": "Leaving notifies the room",
    "expected": "participant-left",
    "actual": "1 event(s)",
    "status": "PASS",
    "severity": "-"
  }
]
```

## backend\qa-results.json

```json
[
  {
    "id": "E2E-001",
    "phase": "E2E",
    "owasp": "-",
    "name": "Health endpoint is public and healthy",
    "expected": "200",
    "actual": "200",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-002",
    "phase": "E2E",
    "owasp": "-",
    "name": "Signup refuses a non-university email domain",
    "expected": "400",
    "actual": "400",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-003",
    "phase": "E2E",
    "owasp": "API2",
    "name": "Signup creates the account but issues NO session until the email is confirmed",
    "expected": "201/200, a message, and no tokens",
    "actual": "201, tokens=false, body={\"message\":\"Account created. Check your email for a confirmation link to finish ",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-004",
    "phase": "E2E",
    "owasp": "-",
    "name": "Duplicate signup is rejected with 409",
    "expected": "409",
    "actual": "409",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-005a",
    "phase": "E2E",
    "owasp": "API2",
    "name": "Login is refused with 403 while the address is unconfirmed",
    "expected": "403 (not 401 — 401 is hijacked by the client's refresh interceptor)",
    "actual": "403: Confirm your email before logging in. Check your inbox for the link we",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-005b",
    "phase": "E2E",
    "owasp": "-",
    "name": "A bogus confirmation token is rejected with 400",
    "expected": "400",
    "actual": "400",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-005c",
    "phase": "E2E",
    "owasp": "-",
    "name": "A valid confirmation token verifies the account",
    "expected": "200",
    "actual": "200: Email confirmed. You can log in now.",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-005d",
    "phase": "E2E",
    "owasp": "-",
    "name": "Re-opening a spent link is handled gracefully, not as an error",
    "expected": "200 (already confirmed)",
    "actual": "200: Your email is already confirmed. You can log in.",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-005",
    "phase": "E2E",
    "owasp": "-",
    "name": "Login succeeds once the address is confirmed",
    "expected": "200/201 with accessToken",
    "actual": "200, token=true",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-006",
    "phase": "E2E",
    "owasp": "-",
    "name": "Login with wrong password is rejected",
    "expected": "401",
    "actual": "401",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-007",
    "phase": "E2E",
    "owasp": "-",
    "name": "GET /auth/me returns the caller's profile",
    "expected": "200 with matching email",
    "actual": "200, email=qa-student-1786708714740@mmcoe.edu.in",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-008",
    "phase": "E2E",
    "owasp": "-",
    "name": "GET /auth/me without a token is rejected",
    "expected": "401",
    "actual": "401",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-009",
    "phase": "E2E",
    "owasp": "API2",
    "name": "Refresh token rotates and the consumed token is revoked (replay blocked)",
    "expected": "first 200/201, replay 401",
    "actual": "first=200, replay=401",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-010",
    "phase": "E2E",
    "owasp": "-",
    "name": "Seeded admin can authenticate",
    "expected": "200/201 with role=\"admin\"",
    "actual": "200, role=admin",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-011",
    "phase": "E2E",
    "owasp": "-",
    "name": "Subject catalog is publicly readable",
    "expected": "200 with array",
    "actual": "200, n=78",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-012",
    "phase": "E2E",
    "owasp": "-",
    "name": "Question paper list is publicly readable, with per-paper lock state",
    "expected": "200, array, every item carries `locked`",
    "actual": "200, n=18, free=3, locked=15",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-012a",
    "phase": "E2E",
    "owasp": "API1",
    "name": "SECURITY — anonymous view/download of a LOCKED paper is refused",
    "expected": "401 on both",
    "actual": "view=401, download=401",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-013",
    "phase": "E2E",
    "owasp": "-",
    "name": "Anonymous user may open the free paper for the semester",
    "expected": "not 401/403 (200 when storage is up)",
    "actual": "500, keys=statusCode,message",
    "status": "WARN",
    "severity": "-",
    "evidence": "cleared the gate; object storage unreachable"
  },
  {
    "id": "E2E-014",
    "phase": "E2E",
    "owasp": "API3",
    "name": "View DTO does not leak the internal storage key",
    "expected": "no fileKey / bucket internals in body",
    "actual": "statusCode,message",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-015",
    "phase": "E2E",
    "owasp": "-",
    "name": "Anonymous user may download the free paper for the semester",
    "expected": "not 401/403 (200 when storage is up)",
    "actual": "500",
    "status": "WARN",
    "severity": "-",
    "evidence": "cleared the gate; object storage unreachable"
  },
  {
    "id": "E2E-017",
    "phase": "E2E",
    "owasp": "-",
    "name": "Unknown paper id returns 404, not 500",
    "expected": "404",
    "actual": "404",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "E2E-018",
    "phase": "E2E",
    "owasp": "-",
    "name": "Notes list is publicly readable (metadata only)",
    "expected": "200",
    "actual": "200",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API5-001",
    "phase": "Security",
    "owasp": "API5 Broken Function Level Authorization",
    "name": "Student is denied admin function: Upload question paper",
    "expected": "403 Forbidden",
    "actual": "403",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API5-002",
    "phase": "Security",
    "owasp": "API5 Broken Function Level Authorization",
    "name": "Student is denied admin function: Upload note",
    "expected": "403 Forbidden",
    "actual": "403",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API5-003",
    "phase": "Security",
    "owasp": "API5 Broken Function Level Authorization",
    "name": "Student is denied admin function: Admin study-room oversight",
    "expected": "403 Forbidden",
    "actual": "403",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API5-004",
    "phase": "Security",
    "owasp": "API5 Broken Function Level Authorization",
    "name": "Student is denied admin function: Create subject",
    "expected": "403 Forbidden",
    "actual": "403",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API5-005",
    "phase": "Security",
    "owasp": "API5 Broken Function Level Authorization",
    "name": "Student is denied admin function: Create year level",
    "expected": "403 Forbidden",
    "actual": "403",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API5-006",
    "phase": "Security",
    "owasp": "API5 Broken Function Level Authorization",
    "name": "Student is denied admin function: Create exam type",
    "expected": "403 Forbidden",
    "actual": "403",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API5-007",
    "phase": "Security",
    "owasp": "API5 Broken Function Level Authorization",
    "name": "Anonymous caller is denied the admin oversight endpoint",
    "expected": "401",
    "actual": "401",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API1-001",
    "phase": "Security",
    "owasp": "API1 Broken Object Level Authorization",
    "name": "Anonymous user cannot obtain a note view URL",
    "expected": "401",
    "actual": "no notes seeded — untested",
    "status": "INFO",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API1-003",
    "phase": "Security",
    "owasp": "API1 Broken Object Level Authorization",
    "name": "/auth/me is scoped to the bearer's own account (no id parameter to tamper)",
    "expected": "returns only the caller",
    "actual": "id=self",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API1-004",
    "phase": "Security",
    "owasp": "API1 Broken Object Level Authorization",
    "name": "Study room listing requires authentication",
    "expected": "200 for member, 401 anonymous",
    "actual": "auth=200, anon=401",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API2-001",
    "phase": "Security",
    "owasp": "API2 Broken Authentication",
    "name": "Rejected: No Authorization header",
    "expected": "401",
    "actual": "401",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API2-002",
    "phase": "Security",
    "owasp": "API2 Broken Authentication",
    "name": "Rejected: Malformed token string",
    "expected": "401",
    "actual": "401",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API2-003",
    "phase": "Security",
    "owasp": "API2 Broken Authentication",
    "name": "Rejected: Structurally valid JWT signed with the wrong secret",
    "expected": "401",
    "actual": "401",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API2-004",
    "phase": "Security",
    "owasp": "API2 Broken Authentication",
    "name": "Rejected: alg:none unsigned token (algorithm confusion)",
    "expected": "401",
    "actual": "401",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API2-005",
    "phase": "Security",
    "owasp": "API2 Broken Authentication",
    "name": "Rejected: Expired token",
    "expected": "401",
    "actual": "401",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API2-006",
    "phase": "Security",
    "owasp": "API2 Broken Authentication",
    "name": "Role claim tampering: token says ADMIN, database says student",
    "expected": "403/401 — role must be re-checked server-side",
    "actual": "403",
    "status": "PASS",
    "severity": "-",
    "evidence": "Role is resolved from the database, not trusted from the JWT claim"
  },
  {
    "id": "SEC-API2-007",
    "phase": "Security",
    "owasp": "API2 Broken Authentication",
    "name": "Logout revokes the refresh token",
    "expected": "logout 204, subsequent refresh 401",
    "actual": "logout=204, refresh=401",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API3-001",
    "phase": "Security",
    "owasp": "API3 Broken Object Property Level Authorization",
    "name": "Mass assignment: extra 'role' field at signup cannot grant admin",
    "expected": "400 (whitelist rejects unknown property) or account created as \"student\"",
    "actual": "400, role=n/a",
    "status": "PASS",
    "severity": "-",
    "evidence": "ValidationPipe forbidNonWhitelisted rejected the payload"
  },
  {
    "id": "SEC-API3-002",
    "phase": "Security",
    "owasp": "API3 Broken Object Property Level Authorization",
    "name": "Login response contains no password hash or token hash",
    "expected": "no credential material in body",
    "actual": "clean",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API3-003",
    "phase": "Security",
    "owasp": "API3 Broken Object Property Level Authorization",
    "name": "Public paper DTO omits storage key and checksum",
    "expected": "no fileKey/checksum",
    "actual": "fields: id,subjectId,examTypeId,academicYear,fileName,fileSizeBytes,uploadStatus,ingestionStatus,createdAt,locked",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API4-001",
    "phase": "Security",
    "owasp": "API4 Unrestricted Resource Consumption",
    "name": "Brute-force protection on login (25 bad attempts)",
    "expected": "some 429 Too Many Requests / lockout",
    "actual": "0 throttled, all 25 answered 401 in 3149ms",
    "status": "FAIL",
    "severity": "High",
    "evidence": "No rate limiter (@nestjs/throttler) is registered in AppModule"
  },
  {
    "id": "SEC-API6-001",
    "phase": "Security",
    "owasp": "API6 Unrestricted Access to Sensitive Business Flows",
    "name": "Password-reset requests are rate limited per address",
    "expected": "throttling after a few requests",
    "actual": "6 accepted (200), 0 throttled",
    "status": "FAIL",
    "severity": "Medium",
    "evidence": "Each request consumes provider email quota (Brevo free tier: 300/day)"
  },
  {
    "id": "SEC-API4-002",
    "phase": "Security",
    "owasp": "API4 Unrestricted Resource Consumption",
    "name": "Oversized JSON body is rejected rather than processed",
    "expected": "413 / 400",
    "actual": "500",
    "status": "WARN",
    "severity": "Medium",
    "evidence": ""
  },
  {
    "id": "SEC-API6-002",
    "phase": "Security",
    "owasp": "API6 Unrestricted Access to Sensitive Business Flows",
    "name": "Forgot-password timing does not reveal whether an account exists",
    "expected": "comparable latency for known vs unknown addresses",
    "actual": "registered 638.5ms vs unregistered 90.6ms (7.05x)",
    "status": "FAIL",
    "severity": "Medium",
    "evidence": "Registered path performs 2 extra DB writes plus an awaited outbound mail call"
  },
  {
    "id": "SEC-API6-004",
    "phase": "Security",
    "owasp": "API6 Unrestricted Access to Sensitive Business Flows",
    "name": "Resend-verification answers identically for known, unknown and already-verified addresses",
    "expected": "same status and body",
    "actual": "200/200, identical=true",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API6-003",
    "phase": "Security",
    "owasp": "API6 Unrestricted Access to Sensitive Business Flows",
    "name": "Forgot-password response body/status is identical for both cases",
    "expected": "same status and body",
    "actual": "200/200, identical=true",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API8-001",
    "phase": "Security",
    "owasp": "API8 Security Misconfiguration",
    "name": "CORS does not reflect/allow arbitrary origins",
    "expected": "origin allowlist (not * or reflected)",
    "actual": "Access-Control-Allow-Origin: *",
    "status": "FAIL",
    "severity": "Medium",
    "evidence": "main.ts uses NestFactory.create(AppModule, { cors: true })"
  },
  {
    "id": "SEC-API8-002",
    "phase": "Security",
    "owasp": "API8 Security Misconfiguration",
    "name": "Security header present: x-content-type-options",
    "expected": "nosniff",
    "actual": "(absent)",
    "status": "FAIL",
    "severity": "Medium",
    "evidence": "helmet middleware is not registered"
  },
  {
    "id": "SEC-API8-003",
    "phase": "Security",
    "owasp": "API8 Security Misconfiguration",
    "name": "Security header present: x-frame-options",
    "expected": "DENY/SAMEORIGIN",
    "actual": "(absent)",
    "status": "FAIL",
    "severity": "Medium",
    "evidence": "helmet middleware is not registered"
  },
  {
    "id": "SEC-API8-004",
    "phase": "Security",
    "owasp": "API8 Security Misconfiguration",
    "name": "Security header present: strict-transport-security",
    "expected": "max-age=...",
    "actual": "(absent)",
    "status": "FAIL",
    "severity": "Medium",
    "evidence": "helmet middleware is not registered"
  },
  {
    "id": "SEC-API8-005",
    "phase": "Security",
    "owasp": "API8 Security Misconfiguration",
    "name": "Security header present: content-security-policy",
    "expected": "a policy",
    "actual": "(absent)",
    "status": "FAIL",
    "severity": "Medium",
    "evidence": "helmet middleware is not registered"
  },
  {
    "id": "SEC-API9-001",
    "phase": "Security",
    "owasp": "API9 Improper Inventory Management",
    "name": "Server does not advertise its framework via X-Powered-By",
    "expected": "(absent)",
    "actual": "Express",
    "status": "FAIL",
    "severity": "Low",
    "evidence": ""
  },
  {
    "id": "SEC-API8-006",
    "phase": "Security",
    "owasp": "API8 Security Misconfiguration",
    "name": "Malformed request does not leak stack traces or internals",
    "expected": "generic error body",
    "actual": "clean (400)",
    "status": "PASS",
    "severity": "-",
    "evidence": "{\"statusCode\":400,\"message\":\"Expected property name or '}' in JSON at position 1 (line 1 column 2)\",\"error\":\"Bad Request\"}"
  },
  {
    "id": "SEC-API9-002",
    "phase": "Security",
    "owasp": "API9 Improper Inventory Management",
    "name": "TRACE verb is not served",
    "expected": "404/405",
    "actual": "not sent by client ('TRACE' HTTP method is unsupported.)",
    "status": "INFO",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API9-003",
    "phase": "Security",
    "owasp": "API9 Improper Inventory Management",
    "name": "PUT on a GET-only route is not served",
    "expected": "404/405",
    "actual": "404",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API9-004",
    "phase": "Security",
    "owasp": "API9 Improper Inventory Management",
    "name": "PATCH on a GET-only route is not served",
    "expected": "404/405",
    "actual": "404",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API9-005",
    "phase": "Security",
    "owasp": "API9 Improper Inventory Management",
    "name": "DELETE on a GET-only route is not served",
    "expected": "404/405",
    "actual": "404",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API7-001",
    "phase": "Security",
    "owasp": "API7 Server Side Request Forgery",
    "name": "No user-controlled URL is fetched server-side",
    "expected": "outbound endpoints are hardcoded",
    "actual": "Brevo endpoint is a module constant",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-API10-001",
    "phase": "Security",
    "owasp": "API10 Unsafe Consumption of APIs",
    "name": "Third-party (Brevo) response is not reflected to API clients",
    "expected": "provider errors logged server-side only",
    "actual": "provider body is logged, generic error thrown",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-INJ-001",
    "phase": "Security",
    "owasp": "API8 Security Misconfiguration",
    "name": "SQL-injection style input is rejected by validation, not passed to the ORM",
    "expected": "400",
    "actual": "400",
    "status": "PASS",
    "severity": "-",
    "evidence": ""
  },
  {
    "id": "SEC-INJ-002",
    "phase": "Security",
    "owasp": "API3 Broken Object Property Level Authorization",
    "name": "Script payload in fullName is stored raw (relies on React escaping at render)",
    "expected": "stored escaped, or documented as render-time escaped",
    "actual": "stored verbatim",
    "status": "WARN",
    "severity": "Low",
    "evidence": "React escapes by default; risk is limited to any future non-React consumer"
  }
]
```

## backend\src\app.controller.ts

```ts
import { Controller, Get } from "@nestjs/common";
import { Public } from "./common/decorators/public.decorator";

/**
 * Liveness target for the hosting platform's health check and for an external
 * keep-alive ping (free Web Service hosts sleep after idle). Deliberately does
 * not touch the database — a DB blip shouldn't make the platform think the
 * whole process is down and restart it.
 */
@Controller()
export class AppController {
  @Public()
  @Get("health")
  health(): { status: "ok" } {
    return { status: "ok" };
  }
}

```

## backend\src\app.module.ts

```ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { StorageModule } from "./modules/storage/storage.module";
import { AuthModule } from "./modules/auth/auth.module";
import { YearLevelsModule } from "./modules/year-levels/year-levels.module";
import { SubjectsModule } from "./modules/subjects/subjects.module";
import { ExamTypesModule } from "./modules/exam-types/exam-types.module";
import { PapersModule } from "./modules/papers/papers.module";
import { NotesModule } from "./modules/notes/notes.module";
import { StudyRoomsModule } from "./modules/study-rooms/study-rooms.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { AiModule } from './modules/ai/ai.module';
import { RagModule } from "./modules/rag/rag.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    AuthModule,
    YearLevelsModule,
    SubjectsModule,
    ExamTypesModule,
    PapersModule,
    NotesModule,
    StudyRoomsModule,
    AiModule,
    RagModule,
  ],
  controllers: [AppController],
  providers: [
    // Order matters: JwtAuthGuard populates request.user before RolesGuard
    // checks it. Both are global so every new route is protected by default
    // (opt out with @Public(), opt into admin-only with @Roles(admin)).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

```

## backend\src\common\constants\uploads.ts

```ts
export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const PDF_MIME_TYPES = ["application/pdf"];

export const NOTES_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

```

## backend\src\common\decorators\current-user.decorator.ts

```ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthenticatedUser } from "../types/authenticated-user";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

```

## backend\src\common\decorators\optional-auth.decorator.ts

```ts
import { SetMetadata } from "@nestjs/common";

export const IS_OPTIONAL_AUTH_KEY = "isOptionalAuth";

/**
 * Authenticate if a token is present, but let anonymous callers through.
 *
 * `@Public()` skips the guard entirely, so `request.user` is always undefined
 * even when the caller sent a perfectly good token. That is fine for endpoints
 * with one behaviour for everyone, but useless for a route that must serve
 * anonymous *and* logged-in users differently — such as question papers, where
 * a signed-out visitor gets one free preview per semester and a student gets
 * the lot.
 */
export const OptionalAuth = () => SetMetadata(IS_OPTIONAL_AUTH_KEY, true);

```

## backend\src\common\decorators\public.decorator.ts

```ts
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

```

## backend\src\common\decorators\roles.decorator.ts

```ts
import { SetMetadata } from "@nestjs/common";
import { UserRole } from "@scholarbase/shared-types";

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

```

## backend\src\common\filters\http-exception.filter.ts

```ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }

    const body =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: "Internal server error" };

    response.status(status).json(
      typeof body === "string"
        ? { statusCode: status, message: body }
        : { statusCode: status, ...body },
    );
  }
}

```

## backend\src\common\guards\jwt-auth.guard.ts

```ts
import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { IS_OPTIONAL_AUTH_KEY } from "../decorators/optional-auth.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  private isOptional(context: ExecutionContext): boolean {
    return Boolean(
      this.reflector.getAllAndOverride<boolean>(IS_OPTIONAL_AUTH_KEY, [
        context.getHandler(),
        context.getClass(),
      ]),
    );
  }

  canActivate(context: ExecutionContext) {
    // Optional wins over public: the route still needs passport to run so that
    // request.user is populated when a token *was* supplied.
    if (this.isOptional(context)) {
      return super.canActivate(context);
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  /**
   * Passport calls this with whatever the strategy produced. The base
   * implementation throws when there is no user; on an optional route a missing
   * or invalid token simply means "anonymous", so the request continues with
   * request.user left undefined.
   */
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
    status?: unknown,
  ): TUser {
    if (this.isOptional(context)) {
      return (user || undefined) as TUser;
    }
    return super.handleRequest(err, user, info, context, status);
  }
}

```

## backend\src\common\guards\roles.guard.ts

```ts
import { ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@scholarbase/shared-types";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { AuthenticatedUser } from "../types/authenticated-user";

@Injectable()
export class RolesGuard {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}

```

## backend\src\common\types\authenticated-user.ts

```ts
import { UserRole } from "@scholarbase/shared-types";

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: UserRole;
}

```

## backend\src\common\utils\duration.ts

```ts
const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/** Parses simple durations like "15m", "30d", "12h" into milliseconds. */
export function parseDurationMs(value: string): number {
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration format: "${value}" (expected e.g. "15m", "30d")`);
  }
  const [, amount, unit] = match;
  return Number(amount) * UNIT_MS[unit];
}

```

## backend\src\main.ts

```ts
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix("api");

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
}

bootstrap();

```

## backend\src\modules\ai\ai.controller.spec.ts

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';

describe('AiController', () => {
  let controller: AiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

```

## backend\src\modules\ai\ai.controller.ts

```ts
import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  async askQuestion(
    @Req() req: any,
    @Body('question') question: string,
    @Body('sessionId') sessionId?: string,
  ) {
    const userId = req.user.sub;
    return this.aiService.askQuestion(userId, question, sessionId);
  }

  @Get('status')
  async getStatus(@Req() req: any) {
    return this.aiService.getStatus(req.user.sub);
  }
}

```

## backend\src\modules\ai\ai.module.ts

```ts
import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [PrismaModule, ConfigModule, RagModule],
  providers: [AiService],
  controllers: [AiController]
})
export class AiModule {}

```

## backend\src\modules\ai\ai.service.spec.ts

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

```

## backend\src\modules\ai\ai.service.ts

```ts
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AiMessageRole } from '@prisma/client';
import { RagService } from '../rag/rag.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  
  private readonly systemPrompt = `You are ScholarBoy, the friendly and highly intelligent AI doubt solver for ScholarBase, a premier educational platform. Your primary goal is to help students understand complex concepts, solve problems step-by-step, and act as a personalized tutor. 

Do NOT give away answers directly without explaining the 'why' and 'how'. Always format mathematical equations using LaTeX. For tables and lists, ALWAYS use proper standard Markdown (e.g. | Column | Column |) and bold text where necessary. Use markdown blocks for any code.

CRITICAL INSTRUCTION: You must ONLY output the conversational response directly to the user. NEVER output internal metadata, logging tags, or system safety flags (e.g. do NOT output 'User Safety: safe' or 'Response Safety: safe'). Start your response immediately with your actual educational answer.

Be encouraging, concise, and stay strictly within the context of the student's query. Do not answer questions unrelated to education or academics.`;

  private readonly models = [
    'openrouter/free',
    'google/gemma-4-31b-it:free',
    'nvidia/nemotron-3.5-lightning:free',
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly ragService: RagService,
  ) {}

  async askQuestion(userId: string, question: string, sessionId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const now = new Date();
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    
    let currentCount = user.aiPromptCount;
    let resetAt = user.aiLimitResetAt;

    if (!resetAt || now.getTime() - resetAt.getTime() > twelveHoursMs) {
      currentCount = 0;
      resetAt = now;
    }

    if (currentCount >= 20) {
      throw new HttpException('ScholarBoy needs rest. Come back in a few hours!', HttpStatus.PAYMENT_REQUIRED);
    }

    let session;
    if (sessionId) {
      session = await this.prisma.aiSession.findUnique({ where: { id: sessionId } });
    }
    if (!session) {
      session = await this.prisma.aiSession.create({ data: { userId } });
    }

    await this.prisma.aiMessage.create({
      data: {
        sessionId: session.id,
        role: AiMessageRole.user,
        content: question,
      },
    });

    const history = await this.prisma.aiMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    history.reverse();

    let ragContext = '';
    try {
      ragContext = await this.ragService.retrieveContext(question);
    } catch (err) {
      this.logger.error("Failed to retrieve RAG context", err);
    }
    
    const messages = [
      { role: 'system', content: this.systemPrompt + (ragContext ? `\n\nHere are some excerpts from our question papers that might help you answer:\n${ragContext}` : '') },
      ...history.map((msg) => ({ role: msg.role === AiMessageRole.assistant ? 'assistant' : 'user', content: msg.content })),
    ];

    let aiResponseContent = '';
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    
    if (!apiKey) {
      this.logger.error('OPENROUTER_API_KEY is not defined in environment variables');
      throw new HttpException('AI service configuration error.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    for (const model of this.models) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
           aiResponseContent = data.choices[0].message.content;
           break;
        } else {
           throw new Error('Invalid response format from OpenRouter');
        }
      } catch (error: any) {
        this.logger.warn(`Failed with model ${model}: ${error.message}`);
        if (model === this.models[this.models.length - 1]) {
          throw new HttpException('ScholarBoy is currently unavailable. Please try again later.', HttpStatus.SERVICE_UNAVAILABLE);
        }
      }
    }

    await this.prisma.aiMessage.create({
      data: {
        sessionId: session.id,
        role: AiMessageRole.assistant,
        content: aiResponseContent,
      },
    });

    // Deduct the limit ONLY after a successful response
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        aiPromptCount: currentCount + 1,
        aiLimitResetAt: resetAt,
      },
    });

    return {
      sessionId: session.id,
      answer: aiResponseContent,
      promptsRemaining: 20 - (currentCount + 1),
    };
  }

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const now = new Date();
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    
    let currentCount = user.aiPromptCount;
    let resetAt = user.aiLimitResetAt;

    if (!resetAt || now.getTime() - resetAt.getTime() > twelveHoursMs) {
      currentCount = 0;
    }

    return {
      promptsRemaining: 20 - currentCount,
    };
  }
}

```

## backend\src\modules\auth\auth.controller.ts

```ts
import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Req, Res } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";
import {
  AuthResponseDto,
  ForgotPasswordResponseDto,
  ResendVerificationResponseDto,
  SignupResponseDto,
  UserDto,
  VerifyEmailResponseDto,
} from "@scholarbase/shared-types";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ResendVerificationDto } from "./dto/resend-verification.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  // Returns a message, not a session: the account cannot be used until the
  // emailed confirmation link is opened.
  @Public()
  @Post("signup")
  signup(@Body() dto: SignupDto): Promise<SignupResponseDto> {
    return this.authService.signup(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("login")
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("refresh")
  refresh(@Body() dto: RefreshDto): Promise<AuthResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  // Public and deliberately uniform: the same 200 and the same body come back
  // whether or not the address is registered, so this can't be used to find
  // out who has an account.
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    await this.authService.forgotPassword(dto.email);
    return {
      message: "If that email has an account, a reset link is on its way.",
    };
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(dto.token, dto.password);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("verify-email")
  verifyEmail(@Body() dto: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    return this.authService.verifyEmail(dto.token);
  }

  // Uniform response for the same reason forgot-password has one: this must not
  // reveal whether an address is registered, or already confirmed.
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("resend-verification")
  async resendVerification(
    @Body() dto: ResendVerificationDto,
  ): Promise<ResendVerificationResponseDto> {
    await this.authService.resendVerification(dto.email);
    return {
      message: "If that email needs confirming, a new link is on its way.",
    };
  }

  @Public()
  @Get("google")
  @UseGuards(AuthGuard("google"))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() req: Request) {}

  @Public()
  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.googleLogin(req.user as { email: string; fullName: string });
    const appUrl = this.config.get<string>("APP_BASE_URL", "http://localhost:5173").replace(/\/$/, "");
    res.redirect(`${appUrl}/auth/google/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("logout")
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.authService.revokeRefreshToken(dto.refreshToken);
  }

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserDto> {
    return this.authService.me(user.sub);
  }
}

```

## backend\src\modules\auth\auth.module.ts

```ts
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { GoogleStrategy } from "./strategies/google.strategy";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [
    PassportModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        signOptions: { expiresIn: config.get<string>("JWT_ACCESS_TTL", "15m") },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}

```

## backend\src\modules\auth\auth.service.ts

```ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { randomBytes, createHmac } from "crypto";
import { UserRole as PrismaUserRole, User } from "@prisma/client";
import {
  AuthResponseDto,
  SignupResponseDto,
  UserDto,
  UserRole,
  VerifyEmailResponseDto,
} from "@scholarbase/shared-types";
import { PrismaService } from "../../prisma/prisma.service";
import { parseDurationMs } from "../../common/utils/duration";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  /**
   * Creates the account but deliberately issues NO tokens. Domain allowlisting
   * only proves the address *looks* like a college address — it says nothing
   * about whether this person can read that inbox. The emailed link is what
   * proves that, so the account stays unusable until it is opened.
   */
  async signup(dto: SignupDto): Promise<SignupResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const domain = email.split("@")[1];

    const allowed = await this.prisma.allowedEmailDomain.findFirst({
      where: { domain: { equals: domain, mode: "insensitive" } },
    });
    if (!allowed) {
      throw new BadRequestException(
        `Signup is only allowed with a recognized university email domain`,
      );
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: dto.fullName,
        role: PrismaUserRole.student,
      },
    });

    await this.issueEmailVerification(user);

    return {
      message: "Account created. Check your email for a confirmation link to finish signing up.",
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Deliberately 403, not 401: the frontend's axios interceptor treats every
    // 401 as an expired session, tries to refresh, and then hard-redirects to
    // /login — which would swallow this message entirely.
    //
    // This message does confirm the account exists, which the generic
    // "Invalid email or password" above is careful not to. That trade is
    // accepted because a user with no way to tell "wrong password" from
    // "unconfirmed" is simply stuck, and because signup already discloses
    // existence via its 409 Conflict.
    if (!user.emailVerifiedAt) {
      throw new ForbiddenException(
        "Confirm your email before logging in. Check your inbox for the link we sent.",
      );
    }

    return this.issueTokens(user);
  }

  async googleLogin(profile: { email: string; fullName: string }): Promise<AuthResponseDto> {
    const email = profile.email.toLowerCase().trim();
    const domain = email.split("@")[1];

    const allowed = await this.prisma.allowedEmailDomain.findFirst({
      where: { domain: { equals: domain, mode: "insensitive" } },
    });
    if (!allowed) {
      throw new BadRequestException(
        `Login with Google is only allowed for recognized university email domains`,
      );
    }

    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      const randomPass = randomBytes(32).toString("hex");
      const passwordHash = await argon2.hash(randomPass);

      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName: profile.fullName,
          role: PrismaUserRole.student,
          emailVerifiedAt: new Date(),
        },
      });
    } else if (!user.emailVerifiedAt) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      });
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token is invalid or expired");
    }

    const issued = await this.issueTokens(stored.user);

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return issued;
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = this.hashRefreshToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async me(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return this.toUserDto(user);
  }

  /**
   * Mints a fresh confirmation link and mails it. Any outstanding link dies the
   * moment a new one is requested, so a forwarded older mail can't be redeemed.
   */
  private async issueEmailVerification(user: User): Promise<void> {
    await this.prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = randomBytes(32).toString("hex");
    // Longer than a password reset: students check college mail infrequently,
    // and an expired link here means they cannot get into the account at all.
    const ttlHours = Number(this.config.get<string>("EMAIL_VERIFICATION_TTL_HOURS", "24"));

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashVerificationToken(token),
        expiresAt: new Date(Date.now() + ttlHours * 3_600_000),
      },
    });

    const appUrl = this.config
      .get<string>("APP_BASE_URL", "http://localhost:5173")
      .replace(/\/$/, "");
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    try {
      await this.mail.sendEmailVerification(user.email, user.fullName, verifyUrl, ttlHours);
    } catch (err) {
      // Logged, never rethrown — see forgotPassword for the same reasoning. The
      // caller must not be able to tell a delivery failure from a success.
      this.logger.error(`Verification email could not be delivered: ${String(err)}`);
    }
  }

  async verifyEmail(token: string): Promise<VerifyEmailResponseDto> {
    const stored = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash: this.hashVerificationToken(token) },
      include: { user: true },
    });

    // Opening an already-redeemed link is overwhelmingly a double click or a
    // mail client prefetching the URL, not an attack. Confirming success for an
    // account that is already verified avoids a frightening error on what was,
    // from the user's side, a successful action.
    if (stored?.user.emailVerifiedAt) {
      return { message: "Your email is already confirmed. You can log in." };
    }

    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw new BadRequestException(
        "This confirmation link is invalid or has expired. Request a new one.",
      );
    }

    // One transaction so the account can never end up verified with the link
    // still live, or vice versa.
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: stored.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: "Email confirmed. You can log in now." };
  }

  /**
   * Resolves identically for unknown addresses and already-verified accounts,
   * so this cannot be used to discover who has registered.
   */
  async resendVerification(rawEmail: string): Promise<void> {
    const email = rawEmail.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerifiedAt) return;

    await this.issueEmailVerification(user);
  }

  /**
   * Always resolves the same way, whether or not the address is registered.
   * Returning "no such account" here would turn this endpoint into a directory
   * of who has signed up, so the only observable difference is that an email
   * does or doesn't arrive.
   */
  async forgotPassword(rawEmail: string): Promise<void> {
    const email = rawEmail.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return;

    // Any earlier link becomes dead the moment a new one is requested,
    // so a forwarded older mail can't still be redeemed.
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = randomBytes(32).toString("hex");
    const ttlMinutes = Number(this.config.get<string>("PASSWORD_RESET_TTL_MINUTES", "60"));

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashResetToken(token),
        expiresAt: new Date(Date.now() + ttlMinutes * 60_000),
      },
    });

    const appUrl = this.config.get<string>("APP_BASE_URL", "http://localhost:5173").replace(/\/$/, "");
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    try {
      await this.mail.sendPasswordReset(user.email, user.fullName, resetUrl, ttlMinutes);
    } catch (err) {
      // Swallowed on purpose: surfacing a delivery failure to the caller would
      // reveal that the address exists. It is logged inside MailService.
      this.logger.error(`Password reset email could not be delivered: ${String(err)}`);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const stored = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: this.hashResetToken(token) },
      include: { user: true },
    });

    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw new BadRequestException("This reset link is invalid or has expired. Request a new one.");
    }

    const passwordHash = await argon2.hash(newPassword);

    // One transaction so a password can never be changed without also burning
    // the link and cutting existing sessions.
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: stored.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
      // Whoever triggered the reset may have lost control of the account, so
      // every existing session is revoked — otherwise an attacker's refresh
      // token would outlive the password change.
      this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  private async issueTokens(user: User): Promise<AuthResponseDto> {
    const role = this.toSharedRole(user.role);

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role },
      {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: this.config.get<string>("JWT_ACCESS_TTL", "15m"),
      },
    );

    const refreshToken = randomBytes(48).toString("hex");
    const refreshTtlMs = parseDurationMs(this.config.get<string>("JWT_REFRESH_TTL", "30d"));

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshTtlMs),
      },
    });

    return { accessToken, refreshToken, user: this.toUserDto(user) };
  }

  private hashRefreshToken(token: string): string {
    const secret = this.config.getOrThrow<string>("JWT_REFRESH_SECRET");
    return createHmac("sha256", secret).update(token).digest("hex");
  }

  /**
   * Reset tokens are stored hashed for the same reason refresh tokens are: a
   * dump of this table should not yield working links. Domain-separated from
   * the refresh hash so the same string can never be valid as both.
   */
  private hashResetToken(token: string): string {
    const secret = this.config.getOrThrow<string>("JWT_REFRESH_SECRET");
    return createHmac("sha256", `password-reset:${secret}`).update(token).digest("hex");
  }

  /**
   * Domain-separated from both the refresh and the reset hash, so one leaked
   * string can never be redeemed as a different class of token.
   */
  private hashVerificationToken(token: string): string {
    const secret = this.config.getOrThrow<string>("JWT_REFRESH_SECRET");
    return createHmac("sha256", `email-verification:${secret}`).update(token).digest("hex");
  }

  private toSharedRole(role: PrismaUserRole): UserRole {
    return role === PrismaUserRole.admin ? UserRole.ADMIN : UserRole.STUDENT;
  }

  private toUserDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: this.toSharedRole(user.role),
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

```

## backend\src\modules\auth\dto\forgot-password.dto.ts

```ts
import { IsEmail } from "class-validator";
import { ForgotPasswordRequestDto } from "@scholarbase/shared-types";

export class ForgotPasswordDto implements ForgotPasswordRequestDto {
  @IsEmail()
  email!: string;
}

```

## backend\src\modules\auth\dto\login.dto.ts

```ts
import { Transform } from "class-transformer";
import { IsEmail, IsString } from "class-validator";
import { LoginRequestDto } from "@scholarbase/shared-types";

export class LoginDto implements LoginRequestDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

```

## backend\src\modules\auth\dto\refresh.dto.ts

```ts
import { IsString } from "class-validator";
import { RefreshRequestDto } from "@scholarbase/shared-types";

export class RefreshDto implements RefreshRequestDto {
  @IsString()
  refreshToken!: string;
}

```

## backend\src\modules\auth\dto\resend-verification.dto.ts

```ts
import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";
import { ResendVerificationRequestDto } from "@scholarbase/shared-types";

export class ResendVerificationDto implements ResendVerificationRequestDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string;
}

```

## backend\src\modules\auth\dto\reset-password.dto.ts

```ts
import { IsString, MinLength } from "class-validator";
import { MIN_PASSWORD_LENGTH, ResetPasswordRequestDto } from "@scholarbase/shared-types";

export class ResetPasswordDto implements ResetPasswordRequestDto {
  @IsString()
  @MinLength(1)
  token!: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  password!: string;
}

```

## backend\src\modules\auth\dto\signup.dto.ts

```ts
import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";
import { SignupRequestDto } from "@scholarbase/shared-types";

export class SignupDto implements SignupRequestDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(1)
  fullName!: string;
}

```

## backend\src\modules\auth\dto\verify-email.dto.ts

```ts
import { IsString, MinLength } from "class-validator";
import { VerifyEmailRequestDto } from "@scholarbase/shared-types";

export class VerifyEmailDto implements VerifyEmailRequestDto {
  @IsString()
  @MinLength(1)
  token!: string;
}

```

## backend\src\modules\auth\strategies\google.strategy.ts

```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') || 'placeholder-id',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') || 'placeholder-secret',
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { emails, displayName } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      return done(new UnauthorizedException('No email found from Google'), false);
    }

    const user = {
      email,
      fullName: displayName,
      accessToken,
    };
    done(null, user);
  }
}

```

## backend\src\modules\auth\strategies\jwt.strategy.ts

```ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthenticatedUser } from "../../../common/types/authenticated-user";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
    });
  }

  validate(payload: AuthenticatedUser): AuthenticatedUser {
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}

```

## backend\src\modules\exam-types\dto\create-exam-type.dto.ts

```ts
import { IsString, MinLength } from "class-validator";
import { CreateExamTypeDto } from "@scholarbase/shared-types";

export class CreateExamTypeBodyDto implements CreateExamTypeDto {
  @IsString()
  @MinLength(1)
  name!: string;
}

```

## backend\src\modules\exam-types\dto\update-exam-type.dto.ts

```ts
import { PartialType } from "@nestjs/mapped-types";
import { CreateExamTypeBodyDto } from "./create-exam-type.dto";

export class UpdateExamTypeBodyDto extends PartialType(CreateExamTypeBodyDto) {}

```

## backend\src\modules\exam-types\exam-types.controller.ts

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ExamTypeDto, UserRole } from "@scholarbase/shared-types";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { ExamTypesService } from "./exam-types.service";
import { CreateExamTypeBodyDto } from "./dto/create-exam-type.dto";
import { UpdateExamTypeBodyDto } from "./dto/update-exam-type.dto";

@Controller("exam-types")
export class ExamTypesController {
  constructor(private readonly examTypesService: ExamTypesService) {}

  @Public()
  @Get()
  findAll(): Promise<ExamTypeDto[]> {
    return this.examTypesService.findAll();
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<ExamTypeDto> {
    return this.examTypesService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateExamTypeBodyDto): Promise<ExamTypeDto> {
    return this.examTypesService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateExamTypeBodyDto): Promise<ExamTypeDto> {
    return this.examTypesService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.examTypesService.remove(id);
  }
}

```

## backend\src\modules\exam-types\exam-types.module.ts

```ts
import { Module } from "@nestjs/common";
import { ExamTypesController } from "./exam-types.controller";
import { ExamTypesService } from "./exam-types.service";

@Module({
  controllers: [ExamTypesController],
  providers: [ExamTypesService],
  exports: [ExamTypesService],
})
export class ExamTypesModule {}

```

## backend\src\modules\exam-types\exam-types.service.ts

```ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { ExamTypeDto } from "@scholarbase/shared-types";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateExamTypeBodyDto } from "./dto/create-exam-type.dto";
import { UpdateExamTypeBodyDto } from "./dto/update-exam-type.dto";

@Injectable()
export class ExamTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ExamTypeDto[]> {
    const rows = await this.prisma.examType.findMany({ orderBy: { name: "asc" } });
    return rows.map(this.toDto);
  }

  async findOne(id: string): Promise<ExamTypeDto> {
    const row = await this.prisma.examType.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Exam type not found");
    return this.toDto(row);
  }

  async create(dto: CreateExamTypeBodyDto): Promise<ExamTypeDto> {
    const row = await this.prisma.examType.create({ data: dto });
    return this.toDto(row);
  }

  async update(id: string, dto: UpdateExamTypeBodyDto): Promise<ExamTypeDto> {
    await this.findOne(id);
    const row = await this.prisma.examType.update({ where: { id }, data: dto });
    return this.toDto(row);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.examType.delete({ where: { id } });
  }

  private toDto(row: { id: string; name: string }): ExamTypeDto {
    return { id: row.id, name: row.name };
  }
}

```

## backend\src\modules\mail\mail.module.ts

```ts
import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

```

## backend\src\modules\mail\mail.service.ts

```ts
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

interface SendMailInput {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Transactional email via **Brevo** (https://www.brevo.com), on their free
 * tier: 300 emails/day, forever, no credit card.
 *
 * Chosen over the obvious alternatives for one specific reason — Brevo lets you
 * send to arbitrary recipients after verifying a single *sender address* (a
 * Gmail account works). Resend's free tier is more generous on volume but only
 * delivers to arbitrary recipients once you have verified a **domain**; until
 * then it only mails your own account address, which is useless for resetting
 * a student's password. ScholarBase is deployed on vercel.app / onrender.com
 * subdomains with no domain of its own, so Brevo is the one that actually works
 * today. If a domain gets bought later, swapping providers is this file only.
 *
 * With no API key configured the service logs the message instead of sending —
 * that keeps local development working without credentials, and makes a
 * misconfigured production deploy fail loudly in the logs rather than silently
 * swallowing password resets.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  private get apiKey(): string | undefined {
    return this.config.get<string>("BREVO_API_KEY")?.trim() || undefined;
  }

  async send({ to, toName, subject, html, text }: SendMailInput): Promise<void> {
    const apiKey = this.apiKey;
    const senderEmail = this.config.get<string>("MAIL_FROM_EMAIL", "no-reply@scholarbase.local");
    const senderName = this.config.get<string>("MAIL_FROM_NAME", "ScholarBase");

    if (!apiKey) {
      this.logger.warn(
        `BREVO_API_KEY is not set — not sending "${subject}" to ${to}. ` +
          `Message body follows so local development still works:\n${text}`,
      );
      return;
    }

    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to, ...(toName ? { name: toName } : {}) }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    if (!response.ok) {
      // Deliberately does not include the recipient in the thrown error — the
      // caller turns any failure into the same generic response so that a
      // failed send can't be used to probe which addresses exist.
      const body = await response.text().catch(() => "");
      this.logger.error(`Brevo rejected the send (${response.status}): ${body.slice(0, 400)}`);
      throw new Error("Email delivery failed");
    }
  }

  async sendPasswordReset(to: string, fullName: string, resetUrl: string, ttlMinutes: number) {
    const subject = "Reset your ScholarBase password";
    const text = [
      `Hi ${fullName},`,
      "",
      "Someone asked to reset the password for your ScholarBase account.",
      `Open this link to choose a new one (it expires in ${ttlMinutes} minutes and can only be used once):`,
      "",
      resetUrl,
      "",
      "If it wasn't you, you can ignore this email — your password stays unchanged.",
      "",
      "— ScholarBase",
    ].join("\n");

    const html = `
<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111827">
  <h1 style="margin:0 0 16px;font-size:20px;color:#850013">Reset your password</h1>
  <p style="margin:0 0 12px;line-height:1.6">Hi ${escapeHtml(fullName)},</p>
  <p style="margin:0 0 20px;line-height:1.6">
    Someone asked to reset the password for your ScholarBase account.
    Choose a new one using the button below — the link expires in
    <strong>${ttlMinutes} minutes</strong> and can only be used once.
  </p>
  <p style="margin:0 0 24px">
    <a href="${escapeHtml(resetUrl)}"
       style="display:inline-block;background:#850013;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:30px;font-weight:600">
      Reset password
    </a>
  </p>
  <p style="margin:0 0 8px;line-height:1.6;font-size:13px;color:#6b7280">
    If the button doesn't work, paste this into your browser:
  </p>
  <p style="margin:0 0 24px;word-break:break-all;font-size:13px;color:#6b7280">${escapeHtml(resetUrl)}</p>
  <p style="margin:0;line-height:1.6;font-size:13px;color:#6b7280">
    If it wasn't you, ignore this email — your password stays unchanged.
  </p>
</div>`.trim();

    await this.send({ to, toName: fullName, subject, html, text });
  }

  async sendEmailVerification(
    to: string,
    fullName: string,
    verifyUrl: string,
    ttlHours: number,
  ) {
    const subject = "Confirm your ScholarBase email";
    const text = [
      `Hi ${fullName},`,
      "",
      "Welcome to ScholarBase. Confirm this address to finish setting up your account.",
      `Open this link (it expires in ${ttlHours} hours and can only be used once):`,
      "",
      verifyUrl,
      "",
      "Until you confirm, you won't be able to log in.",
      "",
      "If you didn't create this account, you can ignore this email — nothing else happens.",
      "",
      "— ScholarBase",
    ].join("\n");

    const html = `
<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111827">
  <h1 style="margin:0 0 16px;font-size:20px;color:#850013">Confirm your email</h1>
  <p style="margin:0 0 12px;line-height:1.6">Hi ${escapeHtml(fullName)},</p>
  <p style="margin:0 0 20px;line-height:1.6">
    Welcome to ScholarBase. Confirm this address to finish setting up your
    account — the link expires in <strong>${ttlHours} hours</strong> and can
    only be used once. <strong>Until you confirm, you won't be able to log in.</strong>
  </p>
  <p style="margin:0 0 24px">
    <a href="${escapeHtml(verifyUrl)}"
       style="display:inline-block;background:#850013;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:30px;font-weight:600">
      Confirm my email
    </a>
  </p>
  <p style="margin:0 0 8px;line-height:1.6;font-size:13px;color:#6b7280">
    If the button doesn't work, paste this into your browser:
  </p>
  <p style="margin:0 0 24px;word-break:break-all;font-size:13px;color:#6b7280">${escapeHtml(verifyUrl)}</p>
  <p style="margin:0;line-height:1.6;font-size:13px;color:#6b7280">
    If you didn't create this account, ignore this email — nothing else happens.
  </p>
</div>`.trim();

    await this.send({ to, toName: fullName, subject, html, text });
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

```

## backend\src\modules\notes\dto\create-note.dto.ts

```ts
import { IsOptional, IsString, IsUUID, MinLength } from "class-validator";
import { CreateNoteMetaDto } from "@scholarbase/shared-types";

export class CreateNoteBodyDto implements CreateNoteMetaDto {
  @IsUUID()
  subjectId!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  unitTopic?: string | null;
}

```

## backend\src\modules\notes\dto\find-notes-query.dto.ts

```ts
import { IsOptional, IsUUID } from "class-validator";

export class FindNotesQueryDto {
  @IsOptional()
  @IsUUID()
  subjectId?: string;
}

```

## backend\src\modules\notes\notes.controller.ts

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { DownloadUrlDto, FileViewUrlDto, NoteDto, UserRole } from "@scholarbase/shared-types";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { MAX_UPLOAD_SIZE_BYTES } from "../../common/constants/uploads";
import { NotesService } from "./notes.service";
import { CreateNoteBodyDto } from "./dto/create-note.dto";
import { FindNotesQueryDto } from "./dto/find-notes-query.dto";

@Controller("notes")
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Public()
  @Get()
  findAll(@Query() query: FindNotesQueryDto): Promise<NoteDto[]> {
    return this.notesService.findAll(query);
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<NoteDto> {
    return this.notesService.findOne(id);
  }

  // Intentionally NOT @Public(): the global JwtAuthGuard requires a logged-in
  // user here, which is the one action that's gated for notes (§3 of the plan).
  @Get(":id/download")
  getDownloadUrl(@Param("id") id: string): Promise<DownloadUrlDto> {
    return this.notesService.getDownloadUrl(id);
  }

  // Also intentionally NOT @Public(): viewing a note in the browser hands out
  // the same object as downloading it, so it has to sit behind the same gate —
  // otherwise "view" would be a trivial bypass of the notes login requirement.
  @Get(":id/view")
  getViewUrl(@Param("id") id: string): Promise<FileViewUrlDto> {
    return this.notesService.getViewUrl(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_UPLOAD_SIZE_BYTES } }))
  create(
    @Body() dto: CreateNoteBodyDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NoteDto> {
    return this.notesService.create(dto, file, user.sub);
  }

  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.notesService.remove(id);
  }
}

```

## backend\src\modules\notes\notes.module.ts

```ts
import { Module } from "@nestjs/common";
import { NotesController } from "./notes.controller";
import { NotesService } from "./notes.service";

@Module({
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}

```

## backend\src\modules\notes\notes.service.ts

```ts
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Note, UploadStatus as PrismaUploadStatus } from "@prisma/client";
import { DownloadUrlDto, FileViewUrlDto, NoteDto, UploadStatus } from "@scholarbase/shared-types";
import { PrismaService } from "../../prisma/prisma.service";
import { NOTES_BUCKET, StorageService } from "../storage/storage.service";
import { StoredFileUrlService } from "../storage/stored-file-url.service";
import { NOTES_MIME_TYPES } from "../../common/constants/uploads";
import { CreateNoteBodyDto } from "./dto/create-note.dto";
import { FindNotesQueryDto } from "./dto/find-notes-query.dto";

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly fileUrls: StoredFileUrlService,
  ) {}

  async findAll(query: FindNotesQueryDto): Promise<NoteDto[]> {
    const rows = await this.prisma.note.findMany({
      where: { subjectId: query.subjectId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(this.toDto);
  }

  async findOne(id: string): Promise<NoteDto> {
    const row = await this.prisma.note.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Note not found");
    return this.toDto(row);
  }

  async create(
    dto: CreateNoteBodyDto,
    file: Express.Multer.File,
    uploadedById: string,
  ): Promise<NoteDto> {
    if (!file) {
      throw new BadRequestException("A file is required");
    }
    if (!NOTES_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException("Unsupported file type for notes");
    }

    const fileKey = `${dto.subjectId}/${randomUUID()}-${file.originalname}`;
    await this.storage.uploadObject(NOTES_BUCKET, fileKey, file.buffer, file.mimetype);

    const row = await this.prisma.note.create({
      data: {
        subjectId: dto.subjectId,
        title: dto.title,
        unitTopic: dto.unitTopic ?? null,
        fileKey,
        fileName: file.originalname,
        fileSizeBytes: file.size,
        mimeType: file.mimetype,
        uploadedById,
        uploadStatus: PrismaUploadStatus.ready,
      },
    });

    return this.toDto(row);
  }

  /** Only reachable behind JwtAuthGuard — notes downloads require a logged-in student. */
  async getDownloadUrl(id: string): Promise<DownloadUrlDto> {
    const row = await this.prisma.note.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Note not found");
    return this.fileUrls.getDownloadUrl(NOTES_BUCKET, row);
  }

  /** Also gated behind auth — see the controller for why. */
  async getViewUrl(id: string): Promise<FileViewUrlDto> {
    const row = await this.prisma.note.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Note not found");
    return this.fileUrls.getViewUrl(NOTES_BUCKET, row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.prisma.note.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Note not found");

    await this.storage.deleteObject(NOTES_BUCKET, row.fileKey);
    await this.prisma.note.delete({ where: { id } });
  }

  private toDto(row: Note): NoteDto {
    return {
      id: row.id,
      subjectId: row.subjectId,
      title: row.title,
      unitTopic: row.unitTopic,
      fileName: row.fileName,
      fileSizeBytes: row.fileSizeBytes,
      uploadStatus: row.uploadStatus as unknown as UploadStatus,
      createdAt: row.createdAt.toISOString(),
    };
  }
}

```

## backend\src\modules\papers\dto\create-question-paper.dto.ts

```ts
import { Type } from "class-transformer";
import { IsInt, IsUUID, Max, Min } from "class-validator";
import { CreateQuestionPaperMetaDto } from "@scholarbase/shared-types";

export class CreateQuestionPaperBodyDto implements CreateQuestionPaperMetaDto {
  @IsUUID()
  subjectId!: string;

  @IsUUID()
  examTypeId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  academicYear!: number;
}

```

## backend\src\modules\papers\dto\find-papers-query.dto.ts

```ts
import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsUUID } from "class-validator";

export class FindPapersQueryDto {
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsUUID()
  examTypeId?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsInt()
  academicYear?: number;
}

```

## backend\src\modules\papers\papers.controller.ts

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { DownloadUrlDto, FileViewUrlDto, QuestionPaperDto, UserRole } from "@scholarbase/shared-types";
import { OptionalAuth } from "../../common/decorators/optional-auth.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { MAX_UPLOAD_SIZE_BYTES } from "../../common/constants/uploads";
import { PapersService } from "./papers.service";
import { CreateQuestionPaperBodyDto } from "./dto/create-question-paper.dto";
import { FindPapersQueryDto } from "./dto/find-papers-query.dto";

@Controller("papers")
export class PapersController {
  constructor(private readonly papersService: PapersService) {}

  // @OptionalAuth rather than @Public throughout: these routes still serve
  // anonymous visitors, but they need to know whether a caller is signed in,
  // because a signed-out visitor only gets one free paper per semester.
  @OptionalAuth()
  @Get()
  findAll(
    @Query() query: FindPapersQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<QuestionPaperDto[]> {
    return this.papersService.findAll(query, Boolean(user));
  }

  @OptionalAuth()
  @Get(":id")
  findOne(
    @Param("id") id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<QuestionPaperDto> {
    return this.papersService.findOne(id, Boolean(user));
  }

  @OptionalAuth()
  @Get(":id/download")
  getDownloadUrl(
    @Param("id") id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<DownloadUrlDto> {
    return this.papersService.getDownloadUrl(id, Boolean(user));
  }

  @OptionalAuth()
  @Get(":id/view")
  getViewUrl(
    @Param("id") id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<FileViewUrlDto> {
    return this.papersService.getViewUrl(id, Boolean(user));
  }

  @Roles(UserRole.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_UPLOAD_SIZE_BYTES } }))
  create(
    @Body() dto: CreateQuestionPaperBodyDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<QuestionPaperDto> {
    return this.papersService.create(dto, file, user.sub);
  }

  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.papersService.remove(id);
  }
}

```

## backend\src\modules\papers\papers.module.ts

```ts
import { Module } from "@nestjs/common";
import { PapersController } from "./papers.controller";
import { PapersService } from "./papers.service";

@Module({
  controllers: [PapersController],
  providers: [PapersService],
})
export class PapersModule {}

```

## backend\src\modules\papers\papers.service.ts

```ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { createHash, randomUUID } from "crypto";
import {
  IngestionStatus as PrismaIngestionStatus,
  QuestionPaper,
  UploadStatus as PrismaUploadStatus,
} from "@prisma/client";
import {
  DownloadUrlDto,
  FileViewUrlDto,
  IngestionStatus,
  QuestionPaperDto,
  UploadStatus,
} from "@scholarbase/shared-types";
import { PrismaService } from "../../prisma/prisma.service";
import { PAPERS_BUCKET, StorageService } from "../storage/storage.service";
import { StoredFileUrlService } from "../storage/stored-file-url.service";
import { PDF_MIME_TYPES } from "../../common/constants/uploads";
import { CreateQuestionPaperBodyDto } from "./dto/create-question-paper.dto";
import { FindPapersQueryDto } from "./dto/find-papers-query.dto";

@Injectable()
export class PapersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly fileUrls: StoredFileUrlService,
  ) {}

  /**
   * The one paper per semester that a signed-out visitor may open, as a set of
   * ids.
   *
   * "Semester" here means a (department, semester number) pair — the same thing
   * SemesterPage shows — so each semester page has exactly one openable paper
   * and everything else prompts a login.
   *
   * Ordering is deterministic (newest academic year first, id as tiebreak) so
   * the same paper is free on every request and for every visitor. It has to be
   * computed centrally rather than "whichever the UI lists first", otherwise
   * the lock the client draws and the lock the API enforces could disagree.
   *
   * This reads the whole table. That is fine at the scale this serves (tens to
   * low hundreds of papers) and keeps the rule in one obvious place; if the
   * archive ever grows enough for it to matter, cache it or push the grouping
   * into SQL with DISTINCT ON.
   */
  private async freePaperIds(): Promise<Set<string>> {
    const rows = await this.prisma.questionPaper.findMany({
      select: {
        id: true,
        subject: { select: { department: true, semester: true } },
      },
      orderBy: [{ academicYear: "desc" }, { id: "asc" }],
    });

    const free = new Set<string>();
    const claimed = new Set<string>();
    for (const row of rows) {
      const key = `${row.subject.department ?? "?"}::${row.subject.semester ?? "?"}`;
      if (claimed.has(key)) continue;
      claimed.add(key);
      free.add(row.id);
    }
    return free;
  }

  /** Null when the caller is logged in — nothing is locked for them. */
  private async lockedResolver(isAuthenticated: boolean): Promise<Set<string> | null> {
    return isAuthenticated ? null : await this.freePaperIds();
  }

  async findAll(query: FindPapersQueryDto, isAuthenticated = false): Promise<QuestionPaperDto[]> {
    const rows = await this.prisma.questionPaper.findMany({
      where: {
        subjectId: query.subjectId,
        examTypeId: query.examTypeId,
        academicYear: query.academicYear,
      },
      orderBy: { academicYear: "desc" },
    });
    const free = await this.lockedResolver(isAuthenticated);
    return rows.map((row) => this.toDto(row, free !== null && !free.has(row.id)));
  }

  async findOne(id: string, isAuthenticated = false): Promise<QuestionPaperDto> {
    const row = await this.prisma.questionPaper.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Question paper not found");
    const free = await this.lockedResolver(isAuthenticated);
    return this.toDto(row, free !== null && !free.has(row.id));
  }

  /**
   * Throws unless the caller is entitled to open this specific paper. This is
   * the actual gate — the greyed-out buttons in the UI are only a courtesy, and
   * anyone can call the endpoint directly.
   */
  private async assertCanOpen(id: string, isAuthenticated: boolean): Promise<void> {
    if (isAuthenticated) return;
    const free = await this.freePaperIds();
    if (!free.has(id)) {
      throw new UnauthorizedException(
        "Log in to open this paper. Signed-out visitors get one free paper per semester.",
      );
    }
  }

  async create(
    dto: CreateQuestionPaperBodyDto,
    file: Express.Multer.File,
    uploadedById: string,
  ): Promise<QuestionPaperDto> {
    if (!file) {
      throw new BadRequestException("A PDF file is required");
    }
    if (!PDF_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException("Only PDF files are accepted for question papers");
    }

    const checksum = createHash("sha256").update(file.buffer).digest("hex");
    const existing = await this.prisma.questionPaper.findUnique({ where: { checksum } });
    if (existing) {
      throw new ConflictException("An identical question paper has already been uploaded");
    }

    const fileKey = `${dto.subjectId}/${dto.academicYear}/${randomUUID()}-${file.originalname}`;
    await this.storage.uploadObject(PAPERS_BUCKET, fileKey, file.buffer, file.mimetype);

    const row = await this.prisma.questionPaper.create({
      data: {
        subjectId: dto.subjectId,
        examTypeId: dto.examTypeId,
        academicYear: dto.academicYear,
        fileKey,
        fileName: file.originalname,
        fileSizeBytes: file.size,
        mimeType: file.mimetype,
        checksum,
        uploadedById,
        uploadStatus: PrismaUploadStatus.ready,
      },
    });

    // Uploads are admin-only, so the uploader is by definition logged in.
    return this.toDto(row, false);
  }

  async getDownloadUrl(id: string, isAuthenticated = false): Promise<DownloadUrlDto> {
    const row = await this.prisma.questionPaper.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Question paper not found");
    await this.assertCanOpen(id, isAuthenticated);
    return this.fileUrls.getDownloadUrl(PAPERS_BUCKET, row);
  }

  async getViewUrl(id: string, isAuthenticated = false): Promise<FileViewUrlDto> {
    const row = await this.prisma.questionPaper.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Question paper not found");
    await this.assertCanOpen(id, isAuthenticated);
    return this.fileUrls.getViewUrl(PAPERS_BUCKET, row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.prisma.questionPaper.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Question paper not found");

    await this.storage.deleteObject(PAPERS_BUCKET, row.fileKey);
    await this.prisma.questionPaper.delete({ where: { id } });
  }

  private toUploadStatus(status: PrismaUploadStatus): UploadStatus {
    return status as unknown as UploadStatus;
  }

  private toIngestionStatus(status: PrismaIngestionStatus): IngestionStatus {
    return status as unknown as IngestionStatus;
  }

  private toDto(row: QuestionPaper, locked: boolean): QuestionPaperDto {
    return {
      id: row.id,
      subjectId: row.subjectId,
      examTypeId: row.examTypeId,
      academicYear: row.academicYear,
      fileName: row.fileName,
      fileSizeBytes: row.fileSizeBytes,
      uploadStatus: this.toUploadStatus(row.uploadStatus),
      ingestionStatus: this.toIngestionStatus(row.ingestionStatus),
      createdAt: row.createdAt.toISOString(),
      locked,
    };
  }
}

```

## backend\src\modules\rag\rag.controller.ts

```ts
import { Controller, Post, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { RagService } from "./rag.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@scholarbase/shared-types";

@Controller("rag")
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Roles(UserRole.ADMIN)
  @Post("ingest/:id")
  @HttpCode(HttpStatus.ACCEPTED)
  async ingestPaper(@Param("id") id: string): Promise<{ message: string }> {
    // We run it asynchronously so we don't block the HTTP request while the
    // PDF is being parsed and embedded.
    this.ragService.ingestPaper(id).catch((err) => {
      console.error(`Failed to ingest paper ${id}:`, err);
    });
    return { message: "Ingestion started" };
  }
}

```

## backend\src\modules\rag\rag.module.ts

```ts
import { Module } from "@nestjs/common";
import { RagService } from "./rag.service";
import { RagController } from "./rag.controller";
import { StorageModule } from "../storage/storage.module";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [StorageModule, PrismaModule],
  providers: [RagService],
  controllers: [RagController],
  exports: [RagService],
})
export class RagModule {}

```

## backend\src\modules\rag\rag.service.ts

```ts
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService, PAPERS_BUCKET } from "../storage/storage.service";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
const pdfParse = require("pdf-parse");
import { IngestionStatus } from "@prisma/client";

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private pinecone: Pinecone;
  private embeddings: GoogleGenerativeAIEmbeddings;
  private indexName: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly config: ConfigService,
  ) {
    const pineconeApiKey = this.config.get<string>("PINECONE_API_KEY");
    this.indexName = this.config.get<string>("PINECONE_INDEX", "scholarbase");
    const geminiApiKey = this.config.get<string>("GEMINI_API_KEY");

    if (pineconeApiKey && pineconeApiKey !== "dummy") {
      this.pinecone = new Pinecone({ apiKey: pineconeApiKey });
    }
    
    if (geminiApiKey && geminiApiKey !== "dummy") {
      this.embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: geminiApiKey,
        model: "text-embedding-004", // Free tier embedding model
      });
    }
  }

  async ingestPaper(paperId: string): Promise<void> {
    if (!this.pinecone || !this.embeddings) {
      this.logger.warn("RAG credentials not configured. Skipping ingestion.");
      return;
    }

    try {
      await this.prisma.questionPaper.update({
        where: { id: paperId },
        data: { ingestionStatus: IngestionStatus.queued },
      });

      const paper = await this.prisma.questionPaper.findUnique({
        where: { id: paperId },
        include: { subject: true },
      });

      if (!paper) {
        throw new Error(`Paper ${paperId} not found`);
      }

      this.logger.log(`Fetching PDF for paper ${paper.id}...`);
      const buffer = await this.storage.getObjectBuffer(PAPERS_BUCKET, paper.fileKey);

      this.logger.log(`Parsing PDF for paper ${paper.id}...`);
      const parsed = await pdfParse(buffer);
      const text = parsed.text;

      this.logger.log(`Chunking text for paper ${paper.id}...`);
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const docs = await splitter.createDocuments([text], [{
        paperId: paper.id,
        subjectId: paper.subjectId,
        subjectCode: paper.subject.code,
        subjectName: paper.subject.name,
        academicYear: paper.academicYear,
        fileName: paper.fileName,
      }]);

      this.logger.log(`Generating embeddings and uploading to Pinecone for ${docs.length} chunks...`);
      const pineconeIndex = this.pinecone.Index(this.indexName);
      
      // Batch upsert to pinecone
      const batchSize = 100;
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize);
        const embedded = await this.embeddings.embedDocuments(batch.map((d: Document) => d.pageContent));
        
        const vectors = batch.map((doc: Document, idx: number) => ({
          id: `${paper.id}-chunk-${i + idx}`,
          values: embedded[idx],
          metadata: {
            ...doc.metadata,
            text: doc.pageContent,
          },
        }));

        await pineconeIndex.upsert(vectors as any);
      }

      await this.prisma.questionPaper.update({
        where: { id: paperId },
        data: { ingestionStatus: IngestionStatus.ingested },
      });

      this.logger.log(`Successfully ingested paper ${paper.id}`);
    } catch (error) {
      this.logger.error(`Failed to ingest paper ${paperId}`, error);
      await this.prisma.questionPaper.update({
        where: { id: paperId },
        data: { ingestionStatus: IngestionStatus.failed },
      });
    }
  }

  async retrieveContext(query: string, k: number = 3): Promise<string> {
    if (!this.pinecone || !this.embeddings) {
      return "";
    }

    try {
      const queryEmbedding = await this.embeddings.embedQuery(query);
      const pineconeIndex = this.pinecone.Index(this.indexName);

      const queryResponse = await pineconeIndex.query({
        vector: queryEmbedding,
        topK: k,
        includeMetadata: true,
      });

      if (!queryResponse.matches || queryResponse.matches.length === 0) {
        return "";
      }

      const contexts = queryResponse.matches.map(match => {
        const meta = match.metadata as any;
        return `[Source: ${meta.subjectName} (${meta.subjectCode}), Year: ${meta.academicYear}]\n${meta.text}`;
      });

      return contexts.join("\n\n---\n\n");
    } catch (error) {
      this.logger.error("Failed to retrieve context from Pinecone", error);
      return "";
    }
  }
}

```

## backend\src\modules\storage\storage.module.ts

```ts
import { Global, Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { StoredFileUrlService } from "./stored-file-url.service";

@Global()
@Module({
  providers: [StorageService, StoredFileUrlService],
  exports: [StorageService, StoredFileUrlService],
})
export class StorageModule {}

```

## backend\src\modules\storage\storage.service.ts

```ts
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";

export const PAPERS_BUCKET = "papers";
export const NOTES_BUCKET = "notes";
export const AVATARS_BUCKET = "avatars";

const DEFAULT_DOWNLOAD_EXPIRY_SECONDS = 5 * 60;
const DEFAULT_VIEW_EXPIRY_SECONDS = 30 * 60;

/**
 * A quote or newline in a filename would break out of the quoted-string in the
 * Content-Disposition header we build, so strip those before interpolating.
 */
function quoteFileName(fileName: string): string {
  return fileName.replace(/["\\\r\n]/g, "_");
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: Client;
  private readonly bucketNames: Record<string, string>;

  constructor(private readonly config: ConfigService) {
    this.client = new Client({
      endPoint: this.config.getOrThrow<string>("MINIO_ENDPOINT"),
      port: Number(this.config.get<string>("MINIO_PORT", "9000")),
      useSSL: this.config.get<string>("MINIO_USE_SSL", "false") === "true",
      accessKey: this.config.getOrThrow<string>("MINIO_ROOT_USER"),
      secretKey: this.config.getOrThrow<string>("MINIO_ROOT_PASSWORD"),
    });

    this.bucketNames = {
      [PAPERS_BUCKET]: this.config.get<string>("MINIO_BUCKET_PAPERS", PAPERS_BUCKET),
      [NOTES_BUCKET]: this.config.get<string>("MINIO_BUCKET_NOTES", NOTES_BUCKET),
      [AVATARS_BUCKET]: this.config.get<string>("MINIO_BUCKET_AVATARS", AVATARS_BUCKET),
    };
  }

  /**
   * Best-effort bucket bootstrap. Object storage being unreachable or a key
   * lacking createBucket rights must NOT prevent the app from booting — this
   * used to throw out of onModuleInit, which Nest turns into an unhandled
   * rejection that kills the process *after* routes are mapped, taking chat and
   * study rooms down with it over a storage problem they don't depend on.
   *
   * Bucket auto-creation is also off by default now: on a hosted S3 provider
   * (B2/R2) buckets are created out-of-band, and a bucket-scoped application key
   * returns 403 from bucketExists — which we can't distinguish from "missing" —
   * and then makeBucket fails. Set STORAGE_MANAGE_BUCKETS=true for local MinIO.
   */
  async onModuleInit() {
    if (this.config.get<string>("STORAGE_MANAGE_BUCKETS", "false") !== "true") {
      return;
    }

    for (const bucket of Object.values(this.bucketNames)) {
      try {
        const exists = await this.client.bucketExists(bucket).catch(() => false);
        if (!exists) {
          await this.client.makeBucket(bucket);
          this.logger.log(`Created bucket "${bucket}"`);
        }
      } catch (err) {
        this.logger.error(
          `Could not ensure bucket "${bucket}" exists — uploads and downloads for it will fail until this is fixed. ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
  }

  private resolveBucket(bucket: string): string {
    return this.bucketNames[bucket] ?? bucket;
  }

  async uploadObject(
    bucket: string,
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    await this.client.putObject(this.resolveBucket(bucket), key, buffer, buffer.length, {
      "Content-Type": mimeType,
    });
  }

  async getObjectBuffer(bucket: string, key: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.resolveBucket(bucket), key);
    return new Promise((resolve, reject) => {
      let size = 0;
      const chunks: Buffer[] = [];
      stream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
        size += chunk.length;
      });
      stream.on("end", () => resolve(Buffer.concat(chunks, size)));
      stream.on("error", (err: any) => reject(err));
    });
  }

  async getPresignedDownloadUrl(
    bucket: string,
    key: string,
    fileName: string,
    expirySeconds: number = DEFAULT_DOWNLOAD_EXPIRY_SECONDS,
  ): Promise<{ url: string; expiresAt: Date }> {
    const url = await this.client.presignedGetObject(
      this.resolveBucket(bucket),
      key,
      expirySeconds,
      { "response-content-disposition": `attachment; filename="${quoteFileName(fileName)}"` },
    );
    return { url, expiresAt: new Date(Date.now() + expirySeconds * 1000) };
  }

  /**
   * Same object, asked for with `inline` so the browser renders it in place
   * rather than saving it — that single response header is the whole difference
   * between "download" and "view". The content type is pinned too, because a
   * stored object served as application/octet-stream will download regardless
   * of the disposition.
   *
   * Expiry is longer than a download's: someone reading a paper keeps the tab
   * open far longer than a save takes, and an expired URL mid-read shows a
   * broken frame.
   */
  async getPresignedViewUrl(
    bucket: string,
    key: string,
    fileName: string,
    mimeType: string,
    expirySeconds: number = DEFAULT_VIEW_EXPIRY_SECONDS,
  ): Promise<{ url: string; expiresAt: Date }> {
    const url = await this.client.presignedGetObject(
      this.resolveBucket(bucket),
      key,
      expirySeconds,
      {
        "response-content-disposition": `inline; filename="${quoteFileName(fileName)}"`,
        "response-content-type": mimeType,
      },
    );
    return { url, expiresAt: new Date(Date.now() + expirySeconds * 1000) };
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    await this.client.removeObject(this.resolveBucket(bucket), key);
  }
}

```

## backend\src\modules\storage\stored-file-url.service.ts

```ts
import { Injectable } from "@nestjs/common";
import { DownloadUrlDto, FileViewUrlDto } from "@scholarbase/shared-types";
import { StorageService } from "./storage.service";

/**
 * The subset of a stored-file row that presigning needs. Papers and notes
 * (and any future file-backed model) already have these three columns —
 * depending on this instead of a concrete Prisma model is what lets this
 * service serve all of them without knowing any of them exist.
 */
export interface StoredFileRecord {
  fileKey: string;
  fileName: string;
  mimeType: string;
}

/**
 * Turns a stored-file row into a download or inline-view URL.
 *
 * Every file-backed resource (papers, notes, and whatever comes next) needs
 * exactly this: fetch its own row, then hand it here. Before this existed,
 * PapersService and NotesService each had their own copy of the presign call
 * and DTO-shaping — identical except for which bucket constant they closed
 * over. A third resource would have made it a third copy, and a fix to how
 * URLs are built (like the `inline` vs `attachment` disposition split) would
 * have needed finding and repeating in every copy instead of landing once
 * here.
 *
 * Deliberately NOT responsible for looking the row up or authorizing the
 * request — those differ per resource (papers are public, notes require
 * login) and belong in each resource's own service, not here.
 */
@Injectable()
export class StoredFileUrlService {
  constructor(private readonly storage: StorageService) {}

  async getDownloadUrl(bucket: string, record: StoredFileRecord): Promise<DownloadUrlDto> {
    const { url, expiresAt } = await this.storage.getPresignedDownloadUrl(
      bucket,
      record.fileKey,
      record.fileName,
    );
    return { url, expiresAt: expiresAt.toISOString() };
  }

  async getViewUrl(bucket: string, record: StoredFileRecord): Promise<FileViewUrlDto> {
    const { url, expiresAt } = await this.storage.getPresignedViewUrl(
      bucket,
      record.fileKey,
      record.fileName,
      record.mimeType,
    );
    return {
      url,
      expiresAt: expiresAt.toISOString(),
      fileName: record.fileName,
      mimeType: record.mimeType,
    };
  }
}

```

## backend\src\modules\study-rooms\dto\create-study-room.dto.ts

```ts
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { CreateStudyRoomRequestDto, StudyRoomVisibility } from "@scholarbase/shared-types";

export class CreateStudyRoomDto implements CreateStudyRoomRequestDto {
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  description?: string | null;

  /** Omitted means private — rooms are invite-only unless asked otherwise. */
  @IsOptional()
  @IsEnum(StudyRoomVisibility)
  visibility?: StudyRoomVisibility;
}

```

## backend\src\modules\study-rooms\dto\find-messages-query.dto.ts

```ts
import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class FindMessagesQueryDto {
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}

```

## backend\src\modules\study-rooms\dto\redeem-invite.dto.ts

```ts
import { IsString, MaxLength, MinLength } from "class-validator";
import { RedeemInviteRequestDto } from "@scholarbase/shared-types";

export class RedeemInviteDto implements RedeemInviteRequestDto {
  /** A full invite URL or the bare code — the service parses either. */
  @IsString()
  @MinLength(8)
  @MaxLength(500)
  invite!: string;
}

```

## backend\src\modules\study-rooms\study-rooms.controller.ts

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { StudyRoomDto, StudyRoomMessageDto, UserRole } from "@scholarbase/shared-types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { StudyRoomsService } from "./study-rooms.service";
import { StudyRoomsGateway } from "./study-rooms.gateway";
import { CreateStudyRoomDto } from "./dto/create-study-room.dto";
import { RedeemInviteDto } from "./dto/redeem-invite.dto";
import { FindMessagesQueryDto } from "./dto/find-messages-query.dto";

/**
 * No @Public() anywhere in here: study rooms are members-only, so the global
 * JwtAuthGuard gating every route is exactly the behaviour we want. Private
 * rooms are additionally gated on invite membership inside the service.
 */
@Controller("study-rooms")
export class StudyRoomsController {
  constructor(
    private readonly studyRoomsService: StudyRoomsService,
    private readonly studyRoomsGateway: StudyRoomsGateway,
  ) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<StudyRoomDto[]> {
    return this.studyRoomsService.findAll(user.sub);
  }

  /**
   * Every open room, for moderation. Declared before `:id` for clarity — an
   * admin needs to see private rooms they aren't a member of in order to close
   * them, which the normal lobby deliberately hides.
   */
  @Roles(UserRole.ADMIN)
  @Get("admin/all")
  findAllForModeration(): Promise<StudyRoomDto[]> {
    return this.studyRoomsService.findAllForModeration();
  }

  /** Redeems an invite link and returns the room it unlocked. */
  @Post("join")
  redeemInvite(
    @Body() dto: RedeemInviteDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StudyRoomDto> {
    return this.studyRoomsService.redeemInvite(dto.invite, user.sub);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser): Promise<StudyRoomDto> {
    return this.studyRoomsService.findOne(id, user.sub, user.role);
  }

  @Get(":id/messages")
  findMessages(
    @Param("id") id: string,
    @Query() query: FindMessagesQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StudyRoomMessageDto[]> {
    return this.studyRoomsService.messagesForUser(id, user.sub, user.role, query.limit);
  }

  @Post()
  create(
    @Body() dto: CreateStudyRoomDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StudyRoomDto> {
    return this.studyRoomsService.create(dto, user.sub);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async remove(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.studyRoomsService.remove(id, user);

    // Only evict once the close has been authorised and persisted, so a
    // rejected attempt can't be used to disrupt a room.
    this.studyRoomsGateway.closeRoom(
      id,
      user.role === UserRole.ADMIN
        ? "This room was closed by an admin."
        : "This room was closed by its creator.",
    );
  }
}

```

## backend\src\modules\study-rooms\study-rooms.gateway.ts

```ts
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import {
  JoinRoomPayload,
  LeaveRoomPayload,
  MediaStatePayload,
  SendMessagePayload,
  SignalPayload,
  STUDY_ROOM_MESSAGE_MAX_LENGTH,
  STUDY_ROOM_NAMESPACE,
  StudyRoomClientEvent,
  StudyRoomParticipantDto,
  StudyRoomServerEvent,
  TypingPayload,
  UserRole,
  WhiteboardClaimPayload,
  WhiteboardClearPayload,
  WhiteboardGrantPayload,
  WhiteboardRequestDrawPayload,
  WhiteboardStrokePayload,
  WhiteboardUndoPayload,
  ScreenPointerPayload,
  WHITEBOARD_MAX_POINTS_PER_CHUNK,
  WHITEBOARD_MAX_STROKE_WIDTH,
} from "@scholarbase/shared-types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { StudyRoomsService } from "./study-rooms.service";
import { StudyRoomsPresence } from "./study-rooms.presence";

interface SocketUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

/** Socket carrying the user resolved during the handshake. */
type AuthedSocket = Socket & { data: { user: SocketUser } };

@WebSocketGateway({
  namespace: STUDY_ROOM_NAMESPACE,
  cors: { origin: true, credentials: true },
})
export class StudyRoomsGateway implements OnGatewayInit, OnGatewayDisconnect {
  private readonly logger = new Logger(StudyRoomsGateway.name);

  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly studyRoomsService: StudyRoomsService,
    private readonly presence: StudyRoomsPresence,
  ) {}

  /**
   * The global JwtAuthGuard only covers HTTP, so the socket handshake is
   * authenticated here instead: no valid access token, no connection.
   *
   * This runs as connection middleware rather than in handleConnection because
   * middleware is guaranteed to finish before any packet from the socket is
   * dispatched. Authenticating in handleConnection races against the client,
   * which can emit `room:join` the instant it sees `connect` — and then the
   * handler runs with `socket.data.user` still unset.
   */
  afterInit(server: Server): void {
    server.use(async (socket, next) => {
      try {
        const token = this.extractToken(socket);
        if (!token) {
          throw new Error("Missing access token");
        }

        const payload = await this.jwt.verifyAsync<AuthenticatedUser>(token, {
          secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        });

        // fullName isn't in the JWT, and it's needed on every message and tile.
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, email: true, fullName: true, role: true },
        });

        if (!user) {
          throw new Error("User no longer exists");
        }

        socket.data.user = {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role === "admin" ? UserRole.ADMIN : UserRole.STUDENT,
        } satisfies SocketUser;

        next();
      } catch (error) {
        this.logger.warn(`Rejected socket ${socket.id}: ${(error as Error).message}`);
        next(new Error("Authentication failed"));
      }
    });
  }

  /**
   * Ends a live session. Called after a room is closed so that closing is a
   * real moderation action rather than just hiding the room from the lobby —
   * anyone mid-chat or mid-call is told and dropped out of the room. Sockets
   * stay connected so the client can navigate away cleanly.
   */
  closeRoom(roomId: string, message: string): void {
    this.server.to(roomId).emit(StudyRoomServerEvent.CLOSED, { roomId, message });
    this.server.in(roomId).socketsLeave(roomId);
    this.presence.clearRoom(roomId);
  }

  handleDisconnect(client: Socket): void {
    for (const { roomId, participant } of this.presence.removeSocketEverywhere(client.id)) {
      this.server.to(roomId).emit(StudyRoomServerEvent.PARTICIPANT_LEFT, {
        roomId,
        socketId: participant.socketId,
        userId: participant.userId,
      });
      // If this socket owned the board, presence has already released it — tell
      // the room so the slot shows as free and someone else can take it.
      this.broadcastBoardMeta(roomId);
    }
  }

  @SubscribeMessage(StudyRoomClientEvent.JOIN)
  async handleJoin(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: JoinRoomPayload,
  ): Promise<void> {
    const roomId = payload?.roomId;
    if (!roomId) return this.fail(client, "A room id is required to join");

    const user = client.data.user;

    // Private rooms require redeemed membership, so a leaked room id on its own
    // gets no further than this check. An admin without an invite is allowed in
    // for oversight, but comes back flagged as a moderator — never hidden.
    let isModerator = false;
    try {
      ({ isModerator } = await this.studyRoomsService.assertJoinable(roomId, user.id, user.role));
    } catch {
      return this.fail(client, "You need an invite link to join this room");
    }
    const participant: StudyRoomParticipantDto = {
      socketId: client.id,
      userId: user.id,
      fullName: user.fullName,
      role: user.role,
      isModerator,
      inCall: false,
      audioEnabled: false,
      videoEnabled: false,
      screenEnabled: false,
    };

    await client.join(roomId);
    // Snapshot the peers before adding self, so `participants` is "everyone else".
    const participants = this.presence.list(roomId);
    this.presence.add(roomId, participant);

    const recentMessages = await this.studyRoomsService.recentMessages(roomId);

    client.emit(StudyRoomServerEvent.JOINED, {
      roomId,
      self: participant,
      participants,
      recentMessages,
    });

    client.to(roomId).emit(StudyRoomServerEvent.PARTICIPANT_JOINED, { roomId, participant });

    // A late joiner needs the board as it stands. Sent only to them, and only
    // when a board exists — rooms that never opened one send nothing.
    const board = this.presence.getBoard(roomId);
    if (board) {
      client.emit(StudyRoomServerEvent.WHITEBOARD_STATE, {
        roomId,
        ownerSocketId: board.ownerSocketId,
        ownerName: board.ownerName,
        strokes: board.strokes,
        grants: [...board.grants],
      });
    }
  }

  /** Tells the room who owns the board and who may draw. Emitted whenever
   * either changes, including when an owner disconnects. */
  private broadcastBoardMeta(roomId: string): void {
    const board = this.presence.getBoard(roomId);
    if (!board) return;

    this.server.to(roomId).emit(StudyRoomServerEvent.WHITEBOARD_GRANTS, {
      roomId,
      ownerSocketId: board.ownerSocketId,
      ownerName: board.ownerName,
      grants: [...board.grants],
    });
  }

  @SubscribeMessage(StudyRoomClientEvent.LEAVE)
  async handleLeave(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: LeaveRoomPayload,
  ): Promise<void> {
    const roomId = payload?.roomId;
    if (!roomId) return;

    const participant = this.presence.remove(roomId, client.id);
    await client.leave(roomId);

    if (participant) {
      this.server.to(roomId).emit(StudyRoomServerEvent.PARTICIPANT_LEFT, {
        roomId,
        socketId: participant.socketId,
        userId: participant.userId,
      });
      this.broadcastBoardMeta(roomId);
    }
  }

  @SubscribeMessage(StudyRoomClientEvent.SEND_MESSAGE)
  async handleMessage(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: SendMessagePayload,
  ): Promise<void> {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) {
      return this.fail(client, "Join the room before sending messages");
    }

    const body = typeof payload.body === "string" ? payload.body.trim() : "";
    if (!body) return;
    if (body.length > STUDY_ROOM_MESSAGE_MAX_LENGTH) {
      return this.fail(client, `Messages are limited to ${STUDY_ROOM_MESSAGE_MAX_LENGTH} characters`);
    }

    const user = client.data.user;
    const message = await this.studyRoomsService.createMessage(roomId, user.id, user.fullName, body);

    // Echoed to the sender too, so every client renders the persisted row.
    this.server.to(roomId).emit(StudyRoomServerEvent.MESSAGE, message);
  }

  @SubscribeMessage(StudyRoomClientEvent.TYPING)
  handleTyping(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: TypingPayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    const user = client.data.user;
    client.to(roomId).emit(StudyRoomServerEvent.TYPING, {
      roomId,
      userId: user.id,
      fullName: user.fullName,
      isTyping: Boolean(payload.isTyping),
    });
  }

  /**
   * Relays SDP offers/answers and ICE candidates between two sockets in the
   * same room. Media itself is peer-to-peer; the server never sees it.
   */
  @SubscribeMessage(StudyRoomClientEvent.SIGNAL)
  handleSignal(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: SignalPayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    const target = payload.targetSocketId;
    // Only route to a socket that is actually a peer in this room — this stops
    // a signed-in user from spraying signalling at arbitrary sockets.
    if (!target || !this.presence.get(roomId, target)) return;

    const user = client.data.user;
    this.server.to(target).emit(StudyRoomServerEvent.SIGNAL, {
      roomId,
      fromSocketId: client.id,
      fromUserId: user.id,
      fromName: user.fullName,
      kind: payload.kind,
      data: payload.data,
    });
  }

  @SubscribeMessage(StudyRoomClientEvent.MEDIA_STATE)
  handleMediaState(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: MediaStatePayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    const state = {
      inCall: Boolean(payload.inCall),
      audioEnabled: Boolean(payload.audioEnabled),
      videoEnabled: Boolean(payload.videoEnabled),
      screenEnabled: Boolean(payload.screenEnabled),
    };

    // One screen share per room. The client disables its own button, but that
    // is only a courtesy — two people can still hit "Share" in the same instant,
    // and a hand-crafted socket frame ignores the UI entirely.
    if (state.screenEnabled) {
      if (!this.presence.claimPresenter(roomId, client.id)) {
        state.screenEnabled = false;
        this.fail(client, "Someone else is already sharing their screen.");
      }
    } else {
      this.presence.releasePresenter(roomId, client.id);
    }

    const participant = this.presence.updateMediaState(roomId, client.id, state);
    if (!participant) return;

    // Broadcast to the whole room including the sender, so a client whose screen
    // share was rejected converges on the corrected state instead of believing
    // it is presenting. Clients ignore media state about their own socket except
    // for this field.
    this.server.to(roomId).emit(StudyRoomServerEvent.MEDIA_STATE, {
      roomId,
      socketId: client.id,
      userId: participant.userId,
      ...state,
    });
  }

  // --- whiteboard ----------------------------------------------------------
  //
  // Every rule below is enforced here rather than in the browser. The client
  // hides the pen when you cannot draw, but that is a courtesy — a hand-written
  // socket frame ignores the UI, exactly as with the screen-share claim above.

  @SubscribeMessage(StudyRoomClientEvent.WHITEBOARD_CLAIM)
  handleWhiteboardClaim(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: WhiteboardClaimPayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    const user = client.data.user;
    if (!this.presence.claimBoard(roomId, client.id, user.fullName)) {
      return this.fail(client, "Someone else is running the whiteboard.");
    }

    const board = this.presence.getBoard(roomId);
    if (!board) return;

    // The claimant gets the full board; everyone else just needs to know who
    // owns it now.
    client.emit(StudyRoomServerEvent.WHITEBOARD_STATE, {
      roomId,
      ownerSocketId: board.ownerSocketId,
      ownerName: board.ownerName,
      strokes: board.strokes,
      grants: [...board.grants],
    });
    this.broadcastBoardMeta(roomId);
  }

  @SubscribeMessage(StudyRoomClientEvent.WHITEBOARD_RELEASE)
  handleWhiteboardRelease(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: WhiteboardClaimPayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    // Strokes survive: releasing hands the pen over, it does not erase the work.
    this.presence.releaseBoard(roomId, client.id);
    this.broadcastBoardMeta(roomId);
  }

  @SubscribeMessage(StudyRoomClientEvent.WHITEBOARD_STROKE)
  handleWhiteboardStroke(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: WhiteboardStrokePayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    const user = client.data.user;
    if (!this.presence.canDraw(roomId, client.id, user.id)) return;

    const strokeId = typeof payload.strokeId === "string" ? payload.strokeId : "";
    const points = Array.isArray(payload.points) ? payload.points : [];
    if (!strokeId || points.length === 0) return;
    // Points arrive as a flat [x,y,…] list, so an odd length is malformed.
    if (points.length % 2 !== 0) return;
    if (points.length > WHITEBOARD_MAX_POINTS_PER_CHUNK * 2) return;
    // Coordinates are normalized; anything outside 0–1 is not from our client.
    if (!points.every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1)) {
      return;
    }

    const width = Math.min(Math.max(Number(payload.width) || 1, 1), WHITEBOARD_MAX_STROKE_WIDTH);
    const color = typeof payload.color === "string" ? payload.color.slice(0, 32) : "#000000";

    const accepted = this.presence.appendStroke(
      roomId,
      { id: strokeId, authorId: user.id, authorName: user.fullName, color, width },
      points,
    );
    // Rejected when the stroke id belongs to somebody else — a client must not
    // be able to extend another person's line.
    if (!accepted) return;

    // To everyone but the sender: the drawer already rendered it locally, and
    // echoing would fight their in-progress line.
    client.to(roomId).emit(StudyRoomServerEvent.WHITEBOARD_STROKE, {
      roomId,
      strokeId,
      color,
      width,
      points,
      done: Boolean(payload.done),
      authorId: user.id,
      authorName: user.fullName,
    });
  }

  @SubscribeMessage(StudyRoomClientEvent.WHITEBOARD_UNDO)
  handleWhiteboardUndo(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: WhiteboardUndoPayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    const user = client.data.user;
    if (!this.presence.canDraw(roomId, client.id, user.id)) return;

    // Scoped to the caller's own strokes inside presence, so undo can never
    // reach across and delete someone else's work.
    const strokeId = this.presence.undoLastStroke(roomId, user.id);
    if (!strokeId) return;

    this.server.to(roomId).emit(StudyRoomServerEvent.WHITEBOARD_UNDO, { roomId, strokeId });
  }

  @SubscribeMessage(StudyRoomClientEvent.WHITEBOARD_CLEAR)
  handleWhiteboardClear(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: WhiteboardClearPayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    // Wiping everyone's work is the owner's call alone.
    if (!this.presence.isBoardOwner(roomId, client.id)) {
      return this.fail(client, "Only whoever opened the whiteboard can clear it.");
    }

    this.presence.clearStrokes(roomId);
    this.server.to(roomId).emit(StudyRoomServerEvent.WHITEBOARD_CLEARED, { roomId });
  }

  @SubscribeMessage(StudyRoomClientEvent.WHITEBOARD_REQUEST_DRAW)
  handleWhiteboardRequestDraw(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: WhiteboardRequestDrawPayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    const board = this.presence.getBoard(roomId);
    if (!board?.ownerSocketId) return;

    const user = client.data.user;
    // Deliberately transient: a request is a nudge, not stored state, so an
    // ignored one leaves nothing behind to clean up.
    this.server.to(board.ownerSocketId).emit(StudyRoomServerEvent.WHITEBOARD_DRAW_REQUESTED, {
      roomId,
      userId: user.id,
      fullName: user.fullName,
    });
  }

  @SubscribeMessage(StudyRoomClientEvent.WHITEBOARD_GRANT)
  handleWhiteboardGrant(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: WhiteboardGrantPayload,
  ): void {
    this.setWhiteboardGrant(client, payload, true);
  }

  @SubscribeMessage(StudyRoomClientEvent.WHITEBOARD_REVOKE)
  handleWhiteboardRevoke(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: WhiteboardGrantPayload,
  ): void {
    this.setWhiteboardGrant(client, payload, false);
  }

  private setWhiteboardGrant(
    client: AuthedSocket,
    payload: WhiteboardGrantPayload,
    allowed: boolean,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    if (!this.presence.isBoardOwner(roomId, client.id)) {
      return this.fail(client, "Only whoever opened the whiteboard can change who draws.");
    }

    const userId = typeof payload.userId === "string" ? payload.userId : "";
    if (!userId) return;
    // Only people actually in the room can be granted, so a stale or invented
    // id cannot accumulate in the grant set.
    if (!this.presence.list(roomId).some((p) => p.userId === userId)) return;

    if (this.presence.setGrant(roomId, userId, allowed) === undefined) return;
    this.broadcastBoardMeta(roomId);
  }

  // --- screen-share laser pointer -------------------------------------------

  /**
   * Relays a pointer position over the shared screen. Nothing is stored: a
   * pointer is only meaningful while it is moving, and a stale one is worse
   * than none. Clients drop dots that stop updating.
   */
  @SubscribeMessage(StudyRoomClientEvent.SCREEN_POINTER)
  handleScreenPointer(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: ScreenPointerPayload,
  ): void {
    const roomId = payload?.roomId;
    if (!roomId || !this.isInRoom(client, roomId)) return;

    // Only meaningful while somebody is actually sharing — otherwise there is
    // no picture to point at, and this becomes a free broadcast channel.
    if (!this.presence.currentPresenter(roomId)) return;

    const { x, y } = payload;
    // Checked as numbers rather than coerced: JSON turns NaN and undefined into
    // null, and Number(null) is 0 — so coercing would silently accept a
    // malformed coordinate as a real point at the top-left corner.
    if (typeof x !== "number" || typeof y !== "number") return;
    // Coordinates are normalized against the video content; anything outside
    // 0–1 did not come from our client.
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;

    const user = client.data.user;
    client.to(roomId).emit(StudyRoomServerEvent.SCREEN_POINTER, {
      roomId,
      x,
      y,
      visible: Boolean(payload.visible),
      socketId: client.id,
      userId: user.id,
      fullName: user.fullName,
    });
  }

  private isInRoom(client: Socket, roomId: string): boolean {
    return client.rooms.has(roomId);
  }

  private fail(client: Socket, message: string): void {
    client.emit(StudyRoomServerEvent.ERROR, { message });
  }

  private extractToken(client: Socket): string | undefined {
    const fromAuth = client.handshake.auth?.token;
    if (typeof fromAuth === "string" && fromAuth.length > 0) {
      return fromAuth;
    }

    const header = client.handshake.headers.authorization;
    return header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  }
}

```

## backend\src\modules\study-rooms\study-rooms.module.ts

```ts
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { StudyRoomsController } from "./study-rooms.controller";
import { StudyRoomsService } from "./study-rooms.service";
import { StudyRoomsGateway } from "./study-rooms.gateway";
import { StudyRoomsPresence } from "./study-rooms.presence";

@Module({
  imports: [
    // The gateway verifies access tokens off the socket handshake itself,
    // since HTTP guards never run for websocket connections.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      }),
    }),
  ],
  controllers: [StudyRoomsController],
  providers: [StudyRoomsService, StudyRoomsGateway, StudyRoomsPresence],
})
export class StudyRoomsModule {}

```

## backend\src\modules\study-rooms\study-rooms.presence.ts

```ts
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import {
  StudyRoomParticipantDto,
  WhiteboardStroke,
  WHITEBOARD_EMPTY_ROOM_GRACE_MS,
  WHITEBOARD_MAX_STROKES,
} from "@scholarbase/shared-types";

/**
 * A room's shared drawing surface.
 *
 * Held separately from the participant map because it has to outlive it: when
 * the last person leaves, `rooms` drops the entry immediately, but the board
 * lingers for a grace period in case they were only reloading.
 */
interface Board {
  ownerSocketId: string | null;
  ownerName: string | null;
  strokes: WhiteboardStroke[];
  /** userIds the owner has allowed to draw. */
  grants: Set<string>;
  /** Pending wipe, scheduled when the room empties and cancelled on rejoin. */
  wipeTimer?: NodeJS.Timeout;
}

/**
 * In-memory registry of who is connected to which room.
 *
 * Presence is deliberately not persisted: it is only meaningful for the
 * lifetime of a socket, and a crashed process should not leave ghost
 * participants in the database. The trade-off is that this only holds for a
 * single backend instance — running more than one would need the socket.io
 * Redis adapter plus a shared store here.
 */
@Injectable()
export class StudyRoomsPresence implements OnModuleDestroy {
  private readonly rooms = new Map<string, Map<string, StudyRoomParticipantDto>>();

  /** roomId -> shared whiteboard. Absent until someone opens one. */
  private readonly boards = new Map<string, Board>();

  /**
   * roomId -> socketId of the one participant allowed to share their screen.
   *
   * Calls are a full mesh, so every screen share is uploaded once per peer. Two
   * people sharing 720p at the same time in a room of four is four extra
   * uploads for no benefit nobody asked for — a study room has one presenter.
   * Held here rather than derived from `screenEnabled` flags so that the claim
   * is decided by one authority instead of racing between clients.
   */
  private readonly presenters = new Map<string, string>();

  add(roomId: string, participant: StudyRoomParticipantDto): void {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new Map();
      this.rooms.set(roomId, room);
    }
    room.set(participant.socketId, participant);
    // Somebody is back before the grace period elapsed — keep their board.
    this.cancelBoardWipe(roomId);
  }

  /**
   * Takes the room's single screen-share slot. Succeeds if it is free, already
   * held by this socket, or held by a socket that is no longer in the room —
   * that last case matters because a presenter whose tab crashed never sends a
   * "stopped sharing" event, and without it the slot would be held forever.
   */
  claimPresenter(roomId: string, socketId: string): boolean {
    const current = this.presenters.get(roomId);
    if (current && current !== socketId && this.rooms.get(roomId)?.has(current)) {
      return false;
    }
    this.presenters.set(roomId, socketId);
    return true;
  }

  /** No-op unless this socket actually holds the slot, so a late "stopped
   * sharing" from a previous presenter can't evict the current one. */
  releasePresenter(roomId: string, socketId: string): void {
    if (this.presenters.get(roomId) === socketId) {
      this.presenters.delete(roomId);
    }
  }

  currentPresenter(roomId: string): string | undefined {
    return this.presenters.get(roomId);
  }

  remove(roomId: string, socketId: string): StudyRoomParticipantDto | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const participant = room.get(socketId);
    room.delete(socketId);
    this.releasePresenter(roomId, socketId);
    this.releaseBoard(roomId, socketId);
    if (room.size === 0) {
      this.rooms.delete(roomId);
      this.presenters.delete(roomId);
      // The board is NOT dropped here — it waits out the grace period.
      this.scheduleBoardWipe(roomId);
    }
    return participant;
  }

  /** Removes a socket from every room it was in — used on disconnect. */
  removeSocketEverywhere(socketId: string): { roomId: string; participant: StudyRoomParticipantDto }[] {
    const removed: { roomId: string; participant: StudyRoomParticipantDto }[] = [];

    for (const [roomId, room] of this.rooms) {
      const participant = room.get(socketId);
      if (participant) {
        removed.push({ roomId, participant });
        room.delete(socketId);
        this.releasePresenter(roomId, socketId);
        this.releaseBoard(roomId, socketId);
        if (room.size === 0) {
          this.rooms.delete(roomId);
          this.presenters.delete(roomId);
          this.scheduleBoardWipe(roomId);
        }
      }
    }

    return removed;
  }

  /** Drops the whole room's presence at once — used when a room is closed.
   *
   * The board goes immediately here, with no grace period: unlike everyone
   * happening to leave, a closed room is not coming back. */
  clearRoom(roomId: string): void {
    this.rooms.delete(roomId);
    this.presenters.delete(roomId);
    this.destroyBoard(roomId);
  }

  // --- whiteboard ----------------------------------------------------------

  /**
   * Takes the room's board. Mirrors `claimPresenter`: succeeds if the board is
   * free, already this socket's, or held by a socket that has since left — so
   * an owner whose tab crashed cannot freeze the board for everyone else.
   */
  claimBoard(roomId: string, socketId: string, ownerName: string): boolean {
    const board = this.boards.get(roomId);
    const current = board?.ownerSocketId;
    if (current && current !== socketId && this.rooms.get(roomId)?.has(current)) {
      return false;
    }

    if (!board) {
      this.boards.set(roomId, {
        ownerSocketId: socketId,
        ownerName,
        strokes: [],
        grants: new Set(),
      });
      return true;
    }

    board.ownerSocketId = socketId;
    board.ownerName = ownerName;
    return true;
  }

  /** No-op unless this socket actually owns the board. Strokes are kept: the
   * drawing outlives whoever happened to open it. */
  releaseBoard(roomId: string, socketId: string): void {
    const board = this.boards.get(roomId);
    if (board?.ownerSocketId === socketId) {
      board.ownerSocketId = null;
      board.ownerName = null;
      // Grants were the departed owner's to give, so they go with them.
      board.grants.clear();
    }
  }

  getBoard(roomId: string): Board | undefined {
    return this.boards.get(roomId);
  }

  /** Owner always may; anyone else needs an explicit grant. */
  canDraw(roomId: string, socketId: string, userId: string): boolean {
    const board = this.boards.get(roomId);
    if (!board) return false;
    if (board.ownerSocketId === socketId) return true;
    return board.grants.has(userId);
  }

  isBoardOwner(roomId: string, socketId: string): boolean {
    return this.boards.get(roomId)?.ownerSocketId === socketId;
  }

  setGrant(roomId: string, userId: string, allowed: boolean): string[] | undefined {
    const board = this.boards.get(roomId);
    if (!board) return undefined;
    if (allowed) board.grants.add(userId);
    else board.grants.delete(userId);
    return [...board.grants];
  }

  /**
   * Appends a chunk of an in-progress stroke, creating the stroke on its first
   * chunk. Returns false when the chunk is rejected, which happens if the board
   * is gone or the stroke belongs to someone else — a client must not be able
   * to extend another person's line.
   */
  appendStroke(
    roomId: string,
    stroke: { id: string; authorId: string; authorName: string; color: string; width: number },
    points: number[],
  ): boolean {
    const board = this.boards.get(roomId);
    if (!board) return false;

    const existing = board.strokes.find((s) => s.id === stroke.id);
    if (existing) {
      if (existing.authorId !== stroke.authorId) return false;
      existing.points.push(...points);
      return true;
    }

    board.strokes.push({ ...stroke, points: [...points] });
    // Oldest-first eviction keeps memory bounded on a long session.
    if (board.strokes.length > WHITEBOARD_MAX_STROKES) {
      board.strokes.splice(0, board.strokes.length - WHITEBOARD_MAX_STROKES);
    }
    return true;
  }

  /** Removes the caller's most recent stroke and returns its id. Scoped to the
   * caller so undo can never delete someone else's work. */
  undoLastStroke(roomId: string, authorId: string): string | undefined {
    const board = this.boards.get(roomId);
    if (!board) return undefined;

    for (let i = board.strokes.length - 1; i >= 0; i -= 1) {
      if (board.strokes[i].authorId === authorId) {
        const [removed] = board.strokes.splice(i, 1);
        return removed.id;
      }
    }
    return undefined;
  }

  clearStrokes(roomId: string): void {
    const board = this.boards.get(roomId);
    if (board) board.strokes = [];
  }

  /** Wipes an empty room's board after the grace period. Deliberately delayed:
   * a simultaneous reload by the last participants must not destroy the work. */
  private scheduleBoardWipe(roomId: string): void {
    const board = this.boards.get(roomId);
    if (!board || board.wipeTimer) return;

    board.wipeTimer = setTimeout(() => {
      // Re-check: someone may have rejoined and left again in the meantime.
      if (this.count(roomId) === 0) this.destroyBoard(roomId);
    }, WHITEBOARD_EMPTY_ROOM_GRACE_MS);
    // Don't hold the process open just for a pending wipe.
    board.wipeTimer.unref?.();
  }

  private cancelBoardWipe(roomId: string): void {
    const board = this.boards.get(roomId);
    if (board?.wipeTimer) {
      clearTimeout(board.wipeTimer);
      board.wipeTimer = undefined;
    }
  }

  private destroyBoard(roomId: string): void {
    const board = this.boards.get(roomId);
    if (board?.wipeTimer) clearTimeout(board.wipeTimer);
    this.boards.delete(roomId);
  }

  /** Clears pending timers so tests and shutdowns don't leak them. */
  onModuleDestroy(): void {
    for (const board of this.boards.values()) {
      if (board.wipeTimer) clearTimeout(board.wipeTimer);
    }
    this.boards.clear();
  }

  get(roomId: string, socketId: string): StudyRoomParticipantDto | undefined {
    return this.rooms.get(roomId)?.get(socketId);
  }

  list(roomId: string): StudyRoomParticipantDto[] {
    return [...(this.rooms.get(roomId)?.values() ?? [])];
  }

  count(roomId: string): number {
    return this.rooms.get(roomId)?.size ?? 0;
  }

  /** Live participant counts keyed by room id, for the room list endpoint. */
  countsByRoom(): Map<string, number> {
    const counts = new Map<string, number>();
    for (const [roomId, room] of this.rooms) {
      counts.set(roomId, room.size);
    }
    return counts;
  }

  updateMediaState(
    roomId: string,
    socketId: string,
    state: { inCall: boolean; audioEnabled: boolean; videoEnabled: boolean; screenEnabled: boolean },
  ): StudyRoomParticipantDto | undefined {
    const participant = this.rooms.get(roomId)?.get(socketId);
    if (!participant) return undefined;

    participant.inCall = state.inCall;
    participant.audioEnabled = state.audioEnabled;
    participant.videoEnabled = state.videoEnabled;
    participant.screenEnabled = state.screenEnabled;
    return participant;
  }
}

```

## backend\src\modules\study-rooms\study-rooms.service.ts

```ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, StudyRoom, StudyRoomVisibility as PrismaVisibility } from "@prisma/client";
import { randomBytes } from "crypto";
import {
  parseInviteCode,
  StudyRoomDto,
  StudyRoomMessageDto,
  StudyRoomVisibility,
  UserRole,
} from "@scholarbase/shared-types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { CreateStudyRoomDto } from "./dto/create-study-room.dto";
import { StudyRoomsPresence } from "./study-rooms.presence";

const roomWithCreator = Prisma.validator<Prisma.StudyRoomDefaultArgs>()({
  include: { createdBy: { select: { fullName: true } } },
});

type RoomWithCreator = Prisma.StudyRoomGetPayload<typeof roomWithCreator>;

const DEFAULT_MESSAGE_LIMIT = 50;

@Injectable()
export class StudyRoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presence: StudyRoomsPresence,
  ) {}

  /**
   * The lobby shows public rooms plus the private rooms this user actually
   * belongs to. A private room someone else created is invisible here.
   */
  async findAll(userId: string): Promise<StudyRoomDto[]> {
    const rooms = await this.prisma.studyRoom.findMany({
      where: {
        isActive: true,
        OR: [
          { visibility: PrismaVisibility.public },
          { createdById: userId },
          { members: { some: { userId } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      ...roomWithCreator,
    });

    const entitledIds = new Set(await this.entitledRoomIds(userId, rooms.map((r) => r.id)));
    const counts = this.presence.countsByRoom();

    return rooms.map((room) =>
      this.toDto(room, counts.get(room.id) ?? 0, entitledIds.has(room.id)),
    );
  }

  /**
   * Moderation listing: every open room, including private ones the admin is
   * not a member of. Invite codes are still withheld — an admin can end a
   * private session, but not quietly let themselves into it.
   */
  async findAllForModeration(): Promise<StudyRoomDto[]> {
    const rooms = await this.prisma.studyRoom.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      ...roomWithCreator,
    });

    const counts = this.presence.countsByRoom();
    return rooms.map((room) => this.toDto(room, counts.get(room.id) ?? 0, false));
  }

  async findOne(id: string, userId: string, role: UserRole): Promise<StudyRoomDto> {
    const room = await this.prisma.studyRoom.findUnique({
      where: { id },
      ...roomWithCreator,
    });

    if (!room || !room.isActive) {
      throw new NotFoundException("Study room not found");
    }

    const entitled = await this.isEntitled(room, userId);
    // Admins may open any room for oversight (the room page needs this to load
    // before the socket join). Everyone else gets a 404 on a private room they
    // aren't in — a wrong guess should not confirm the room exists. The invite
    // code is still withheld from a non-member admin (entitled stays false).
    if (room.visibility === PrismaVisibility.private && !entitled && role !== UserRole.ADMIN) {
      throw new NotFoundException("Study room not found");
    }

    return this.toDto(room, this.presence.count(room.id), entitled);
  }

  async create(dto: CreateStudyRoomDto, userId: string): Promise<StudyRoomDto> {
    const room = await this.prisma.studyRoom.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        createdById: userId,
        visibility:
          dto.visibility === StudyRoomVisibility.PUBLIC
            ? PrismaVisibility.public
            : PrismaVisibility.private,
        inviteCode: this.generateInviteCode(),
      },
      ...roomWithCreator,
    });

    return this.toDto(room, 0, true);
  }

  /**
   * Exchanges an invite (link or bare code) for membership. This is the only
   * way into a private room a user did not create.
   */
  async redeemInvite(invite: string, userId: string): Promise<StudyRoomDto> {
    const code = parseInviteCode(invite);
    if (!code) {
      throw new NotFoundException("That invite link is not valid");
    }

    const room = await this.prisma.studyRoom.findUnique({
      where: { inviteCode: code },
      ...roomWithCreator,
    });

    if (!room || !room.isActive) {
      throw new NotFoundException("That invite link is not valid or the room has been closed");
    }

    if (room.createdById !== userId) {
      await this.prisma.studyRoomMember.upsert({
        where: { roomId_userId: { roomId: room.id, userId } },
        update: {},
        create: { roomId: room.id, userId },
      });
    }

    return this.toDto(room, this.presence.count(room.id), true);
  }

  /** Soft close: keeps the transcript, drops the room from the lobby. */
  async remove(id: string, user: AuthenticatedUser): Promise<void> {
    const room = await this.prisma.studyRoom.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundException("Study room not found");
    }

    if (room.createdById !== user.sub && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only the room creator or an admin can close this room");
    }

    await this.prisma.studyRoom.update({ where: { id }, data: { isActive: false } });
  }

  /**
   * The real gate for joining a call: the gateway calls this before letting a
   * socket into the room, so holding a room id is not enough for a private room.
   */
  async assertJoinable(
    roomId: string,
    userId: string,
    role: UserRole,
  ): Promise<{ room: StudyRoom; isModerator: boolean }> {
    const room = await this.prisma.studyRoom.findUnique({ where: { id: roomId } });
    if (!room || !room.isActive) {
      throw new NotFoundException("Study room not found");
    }

    if (room.visibility === PrismaVisibility.public) {
      return { room, isModerator: false };
    }

    if (await this.isEntitled(room, userId)) {
      return { room, isModerator: false };
    }

    // An admin with no invite may still enter for oversight, but is flagged as
    // a moderator so the room is told they are present. There is deliberately
    // no silent-join path — admin presence is always visible.
    if (role === UserRole.ADMIN) {
      return { room, isModerator: true };
    }

    throw new ForbiddenException("You need an invite link to join this room");
  }

  /**
   * REST entry point for the transcript. Goes through the same access check as
   * joining, so a private room's history is not readable by room id alone.
   */
  async messagesForUser(
    roomId: string,
    userId: string,
    role: UserRole,
    limit?: number,
  ): Promise<StudyRoomMessageDto[]> {
    await this.assertJoinable(roomId, userId, role);
    return this.recentMessages(roomId, limit);
  }

  async recentMessages(roomId: string, limit = DEFAULT_MESSAGE_LIMIT): Promise<StudyRoomMessageDto[]> {
    const messages = await this.prisma.studyRoomMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { sender: { select: { fullName: true } } },
    });

    // Queried newest-first to get the *latest* N, returned oldest-first to render.
    return messages.reverse().map((message) => ({
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderName: message.sender.fullName,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    }));
  }

  async createMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    body: string,
  ): Promise<StudyRoomMessageDto> {
    const message = await this.prisma.studyRoomMessage.create({
      data: { roomId, senderId, body },
    });

    return {
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderName,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    };
  }

  /**
   * Creator or invite-redeemer. Admins deliberately do not get a bypass here:
   * they can close a room for moderation, but a private study session is not
   * something they should be able to silently sit in on.
   */
  private async isEntitled(room: StudyRoom, userId: string): Promise<boolean> {
    if (room.createdById === userId) return true;

    const membership = await this.prisma.studyRoomMember.findUnique({
      where: { roomId_userId: { roomId: room.id, userId } },
      select: { id: true },
    });
    return membership !== null;
  }

  /** Batched membership lookup so the lobby does not fan out one query per room. */
  private async entitledRoomIds(userId: string, roomIds: string[]): Promise<string[]> {
    if (roomIds.length === 0) return [];

    const [created, joined] = await Promise.all([
      this.prisma.studyRoom.findMany({
        where: { id: { in: roomIds }, createdById: userId },
        select: { id: true },
      }),
      this.prisma.studyRoomMember.findMany({
        where: { userId, roomId: { in: roomIds } },
        select: { roomId: true },
      }),
    ]);

    return [...created.map((r) => r.id), ...joined.map((m) => m.roomId)];
  }

  private generateInviteCode(): string {
    // 24 URL-safe chars of entropy — not guessable by brute force.
    return randomBytes(18).toString("base64url");
  }

  private toDto(room: RoomWithCreator, participantCount: number, entitled: boolean): StudyRoomDto {
    return {
      id: room.id,
      name: room.name,
      description: room.description,
      createdById: room.createdById,
      createdByName: room.createdBy.fullName,
      visibility:
        room.visibility === PrismaVisibility.public
          ? StudyRoomVisibility.PUBLIC
          : StudyRoomVisibility.PRIVATE,
      // Never hand the invite code to someone who is not already inside.
      inviteCode: entitled ? room.inviteCode : null,
      isActive: room.isActive,
      participantCount,
      createdAt: room.createdAt.toISOString(),
    };
  }
}

```

## backend\src\modules\subjects\dto\create-subject.dto.ts

```ts
import { IsInt, IsOptional, IsString, IsUUID, MinLength } from "class-validator";
import { CreateSubjectDto } from "@scholarbase/shared-types";

export class CreateSubjectBodyDto implements CreateSubjectDto {
  @IsUUID()
  yearLevelId!: string;

  @IsString()
  @MinLength(1)
  code!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  department?: string | null;

  @IsOptional()
  @IsInt()
  semester?: number | null;

  @IsOptional()
  @IsInt()
  credits?: number | null;
}

```

## backend\src\modules\subjects\dto\find-subjects-query.dto.ts

```ts
import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUUID } from "class-validator";

export class FindSubjectsQueryDto {
  @IsOptional()
  @IsUUID()
  yearLevelId?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsInt()
  semester?: number;
}

```

## backend\src\modules\subjects\dto\update-subject.dto.ts

```ts
import { PartialType } from "@nestjs/mapped-types";
import { CreateSubjectBodyDto } from "./create-subject.dto";

export class UpdateSubjectBodyDto extends PartialType(CreateSubjectBodyDto) {}

```

## backend\src\modules\subjects\subjects.controller.ts

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { SubjectDto, UserRole } from "@scholarbase/shared-types";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { SubjectsService } from "./subjects.service";
import { CreateSubjectBodyDto } from "./dto/create-subject.dto";
import { UpdateSubjectBodyDto } from "./dto/update-subject.dto";
import { FindSubjectsQueryDto } from "./dto/find-subjects-query.dto";

@Controller("subjects")
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Public()
  @Get()
  findAll(@Query() query: FindSubjectsQueryDto): Promise<SubjectDto[]> {
    return this.subjectsService.findAll(query);
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<SubjectDto> {
    return this.subjectsService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateSubjectBodyDto): Promise<SubjectDto> {
    return this.subjectsService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateSubjectBodyDto): Promise<SubjectDto> {
    return this.subjectsService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.subjectsService.remove(id);
  }
}

```

## backend\src\modules\subjects\subjects.module.ts

```ts
import { Module } from "@nestjs/common";
import { SubjectsController } from "./subjects.controller";
import { SubjectsService } from "./subjects.service";

@Module({
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}

```

## backend\src\modules\subjects\subjects.service.ts

```ts
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, Subject } from "@prisma/client";
import { SubjectDto } from "@scholarbase/shared-types";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateSubjectBodyDto } from "./dto/create-subject.dto";
import { UpdateSubjectBodyDto } from "./dto/update-subject.dto";
import { FindSubjectsQueryDto } from "./dto/find-subjects-query.dto";

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FindSubjectsQueryDto): Promise<SubjectDto[]> {
    const rows = await this.prisma.subject.findMany({
      where: {
        yearLevelId: query.yearLevelId,
        department: query.department,
        semester: query.semester,
      },
      orderBy: { code: "asc" },
    });
    return rows.map(this.toDto);
  }

  async findOne(id: string): Promise<SubjectDto> {
    const row = await this.prisma.subject.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Subject not found");
    return this.toDto(row);
  }

  async create(dto: CreateSubjectBodyDto): Promise<SubjectDto> {
    try {
      const row = await this.prisma.subject.create({ data: dto });
      return this.toDto(row);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("A subject with this code already exists in this year level.");
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateSubjectBodyDto): Promise<SubjectDto> {
    await this.findOne(id);
    try {
      const row = await this.prisma.subject.update({ where: { id }, data: dto });
      return this.toDto(row);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("A subject with this code already exists in this year level.");
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.subject.delete({ where: { id } });
  }

  private toDto(row: Subject): SubjectDto {
    return {
      id: row.id,
      yearLevelId: row.yearLevelId,
      code: row.code,
      name: row.name,
      department: row.department,
      semester: row.semester,
      credits: row.credits,
    };
  }
}

```

## backend\src\modules\year-levels\dto\create-year-level.dto.ts

```ts
import { IsInt, IsString, Max, Min, MinLength } from "class-validator";
import { CreateYearLevelDto } from "@scholarbase/shared-types";

export class CreateYearLevelBodyDto implements CreateYearLevelDto {
  @IsInt()
  @Min(1)
  @Max(4)
  yearNumber!: number;

  @IsString()
  @MinLength(1)
  label!: string;
}

```

## backend\src\modules\year-levels\dto\update-year-level.dto.ts

```ts
import { PartialType } from "@nestjs/mapped-types";
import { CreateYearLevelBodyDto } from "./create-year-level.dto";

export class UpdateYearLevelBodyDto extends PartialType(CreateYearLevelBodyDto) {}

```

## backend\src\modules\year-levels\year-levels.controller.ts

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { UserRole, YearLevelDto } from "@scholarbase/shared-types";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { YearLevelsService } from "./year-levels.service";
import { CreateYearLevelBodyDto } from "./dto/create-year-level.dto";
import { UpdateYearLevelBodyDto } from "./dto/update-year-level.dto";

@Controller("year-levels")
export class YearLevelsController {
  constructor(private readonly yearLevelsService: YearLevelsService) {}

  @Public()
  @Get()
  findAll(): Promise<YearLevelDto[]> {
    return this.yearLevelsService.findAll();
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<YearLevelDto> {
    return this.yearLevelsService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateYearLevelBodyDto): Promise<YearLevelDto> {
    return this.yearLevelsService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateYearLevelBodyDto): Promise<YearLevelDto> {
    return this.yearLevelsService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.yearLevelsService.remove(id);
  }
}

```

## backend\src\modules\year-levels\year-levels.module.ts

```ts
import { Module } from "@nestjs/common";
import { YearLevelsController } from "./year-levels.controller";
import { YearLevelsService } from "./year-levels.service";

@Module({
  controllers: [YearLevelsController],
  providers: [YearLevelsService],
  exports: [YearLevelsService],
})
export class YearLevelsModule {}

```

## backend\src\modules\year-levels\year-levels.service.ts

```ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { YearLevelDto } from "@scholarbase/shared-types";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateYearLevelBodyDto } from "./dto/create-year-level.dto";
import { UpdateYearLevelBodyDto } from "./dto/update-year-level.dto";

@Injectable()
export class YearLevelsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<YearLevelDto[]> {
    const rows = await this.prisma.yearLevel.findMany({ orderBy: { yearNumber: "asc" } });
    return rows.map(this.toDto);
  }

  async findOne(id: string): Promise<YearLevelDto> {
    const row = await this.prisma.yearLevel.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Year level not found");
    return this.toDto(row);
  }

  async create(dto: CreateYearLevelBodyDto): Promise<YearLevelDto> {
    const row = await this.prisma.yearLevel.create({ data: dto });
    return this.toDto(row);
  }

  async update(id: string, dto: UpdateYearLevelBodyDto): Promise<YearLevelDto> {
    await this.findOne(id);
    const row = await this.prisma.yearLevel.update({ where: { id }, data: dto });
    return this.toDto(row);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.yearLevel.delete({ where: { id } });
  }

  private toDto(row: { id: string; yearNumber: number; label: string }): YearLevelDto {
    return { id: row.id, yearNumber: row.yearNumber, label: row.label };
  }
}

```

## backend\src\prisma\prisma.module.ts

```ts
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

```

## backend\src\prisma\prisma.service.ts

```ts
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

```

## backend\test\e2e\api-security-suite.js

```js
/**
 * ScholarBase — E2E functional + OWASP API Security Top 10 (2023) suite.
 *
 * Black-box: drives the running backend over HTTP exactly as a client would,
 * so global pipes, guards, filters and CORS middleware are all exercised.
 *
 *   node test/e2e/api-security-suite.js            # against localhost:3000
 *   API_BASE=https://host/api node ... /suite.js   # against a deployment
 *
 * Emits a human summary plus machine-readable JSON at qa-results.json.
 *
 * NOTE: creates and then deletes throwaway accounts. Point it at a dev
 * database, never production.
 *
 * RUN WITH BREVO_API_KEY UNSET. The rate-limit and enumeration checks fire
 * ~20 password-reset and resend-verification requests at ADMIN_EMAIL. With a
 * live key those become real Brevo sends to an address that does not exist,
 * which burns the 300/day free quota and — worse — generates hard bounces that
 * damage sender reputation. With the key unset, MailService logs instead:
 *
 *   BREVO_API_KEY= node test/e2e/api-security-suite.js
 */
require("dotenv/config");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const API = process.env.API_BASE || "http://localhost:3000/api";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ALLOWED_DOMAIN = process.env.QA_DOMAIN || "mmcoe.edu.in";

// Wire values of the shared UserRole enum (packages/shared-types/src/enums.ts).
const ROLE_ADMIN = "admin";
const ROLE_STUDENT = "student";

const results = [];
let studentToken = null;
let studentRefresh = null;
let studentId = null;
let adminToken = null;
const createdEmails = [];

function record({ id, phase, owasp, name, expected, actual, status, severity = "-", evidence = "" }) {
  results.push({ id, phase, owasp, name, expected, actual, status, severity, evidence });
  const tag = { PASS: "PASS", FAIL: "FAIL", WARN: "WARN", INFO: "INFO" }[status];
  console.log(`[${tag}] ${id}  ${name}`);
  if (status === "FAIL" || status === "WARN") {
    console.log(`         expected: ${expected}`);
    console.log(`         actual  : ${actual}`);
  }
}

async function req(method, urlPath, { body, token, headers = {}, raw = false } = {}) {
  const h = { ...headers };
  let payload;
  // fetch() forbids a body on GET/HEAD; drop it so probe requests still fire.
  const bodyAllowed = !["GET", "HEAD"].includes(method.toUpperCase());
  if (body !== undefined && bodyAllowed) {
    if (raw) {
      payload = body;
    } else {
      h["content-type"] = "application/json";
      payload = JSON.stringify(body);
    }
  }
  if (token) h.authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${urlPath}`, { method, headers: h, body: payload });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON body */
  }
  return { status: res.status, headers: res.headers, text, json };
}

/**
 * Lazily-created Prisma client, shared by the verification helper and cleanup.
 * The suite needs direct database access because only the HMAC of a
 * verification token is ever persisted — the raw token exists solely inside the
 * email, which this process cannot read.
 */
let prismaClient = null;
function getPrisma() {
  if (!prismaClient) {
    const { PrismaClient } = require("@prisma/client");
    prismaClient = new PrismaClient();
  }
  return prismaClient;
}

/**
 * Plants a verification token for a user and returns the raw value, hashing it
 * exactly as AuthService.hashVerificationToken does. This lets the real
 * /auth/verify-email endpoint be exercised over HTTP rather than bypassed.
 */
async function plantVerificationToken(userId) {
  const raw = crypto.randomBytes(32).toString("hex");
  const secret = process.env.JWT_REFRESH_SECRET;
  const tokenHash = crypto
    .createHmac("sha256", `email-verification:${secret}`)
    .update(raw)
    .digest("hex");

  await getPrisma().emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt: new Date(Date.now() + 3_600_000) },
  });
  return raw;
}

const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
function signHS256(payload, secret) {
  const h = b64url({ alg: "HS256", typ: "JWT" });
  const p = b64url(payload);
  const sig = crypto.createHmac("sha256", secret).update(`${h}.${p}`).digest("base64url");
  return `${h}.${p}.${sig}`;
}

// ---------------------------------------------------------------- E2E: auth

async function e2eAuth() {
  const health = await req("GET", "/health");
  record({
    id: "E2E-001",
    phase: "E2E",
    owasp: "-",
    name: "Health endpoint is public and healthy",
    expected: "200",
    actual: String(health.status),
    status: health.status === 200 ? "PASS" : "FAIL",
  });

  // Signup outside the allowlisted university domain must be refused.
  const badDomain = await req("POST", "/auth/signup", {
    body: { email: `qa-outsider-${Date.now()}@gmail.com`, password: "QaPassword123", fullName: "QA Outsider" },
  });
  record({
    id: "E2E-002",
    phase: "E2E",
    owasp: "-",
    name: "Signup refuses a non-university email domain",
    expected: "400",
    actual: String(badDomain.status),
    status: badDomain.status === 400 ? "PASS" : "FAIL",
  });

  const email = `qa-student-${Date.now()}@${ALLOWED_DOMAIN}`;
  const password = "QaPassword123";
  const signup = await req("POST", "/auth/signup", {
    body: { email, password, fullName: "QA Student" },
  });
  if (signup.status === 201 || signup.status === 200) createdEmails.push(email);

  const issuedNoSession = !signup.json?.accessToken && !signup.json?.refreshToken;
  record({
    id: "E2E-003",
    phase: "E2E",
    owasp: "API2",
    name: "Signup creates the account but issues NO session until the email is confirmed",
    expected: "201/200, a message, and no tokens",
    actual: `${signup.status}, tokens=${!issuedNoSession}, body=${(signup.text || "").slice(0, 80)}`,
    status: (signup.status === 201 || signup.status === 200) && issuedNoSession ? "PASS" : "FAIL",
    severity: issuedNoSession ? "-" : "High",
  });

  const dup = await req("POST", "/auth/signup", {
    body: { email, password, fullName: "QA Student" },
  });
  record({
    id: "E2E-004",
    phase: "E2E",
    owasp: "-",
    name: "Duplicate signup is rejected with 409",
    expected: "409",
    actual: String(dup.status),
    status: dup.status === 409 ? "PASS" : "FAIL",
  });

  // The gate itself: correct credentials must still be refused pre-confirmation.
  const unverifiedLogin = await req("POST", "/auth/login", { body: { email, password } });
  record({
    id: "E2E-005a",
    phase: "E2E",
    owasp: "API2",
    name: "Login is refused with 403 while the address is unconfirmed",
    expected: "403 (not 401 — 401 is hijacked by the client's refresh interceptor)",
    actual: `${unverifiedLogin.status}: ${(unverifiedLogin.json?.message || "").slice(0, 70)}`,
    status: unverifiedLogin.status === 403 ? "PASS" : "FAIL",
    severity: unverifiedLogin.status === 403 ? "-" : "Critical",
  });

  // Exercise the real verification endpoint. Only the HMAC is stored, so the
  // raw token is planted directly with the same hashing the service uses.
  const created = await getPrisma().user.findUnique({ where: { email } });
  studentId = created?.id;

  const badToken = await req("POST", "/auth/verify-email", { body: { token: "not-a-real-token" } });
  record({
    id: "E2E-005b",
    phase: "E2E",
    owasp: "-",
    name: "A bogus confirmation token is rejected with 400",
    expected: "400",
    actual: String(badToken.status),
    status: badToken.status === 400 ? "PASS" : "FAIL",
  });

  const rawToken = await plantVerificationToken(studentId);
  const verify = await req("POST", "/auth/verify-email", { body: { token: rawToken } });
  record({
    id: "E2E-005c",
    phase: "E2E",
    owasp: "-",
    name: "A valid confirmation token verifies the account",
    expected: "200",
    actual: `${verify.status}: ${(verify.json?.message || "").slice(0, 60)}`,
    status: verify.status === 200 ? "PASS" : "FAIL",
  });

  const replay = await req("POST", "/auth/verify-email", { body: { token: rawToken } });
  record({
    id: "E2E-005d",
    phase: "E2E",
    owasp: "-",
    name: "Re-opening a spent link is handled gracefully, not as an error",
    expected: "200 (already confirmed)",
    actual: `${replay.status}: ${(replay.json?.message || "").slice(0, 60)}`,
    status: replay.status === 200 ? "PASS" : "WARN",
    severity: replay.status === 200 ? "-" : "Low",
  });

  const login = await req("POST", "/auth/login", { body: { email, password } });
  studentToken = login.json?.accessToken;
  studentRefresh = login.json?.refreshToken;
  record({
    id: "E2E-005",
    phase: "E2E",
    owasp: "-",
    name: "Login succeeds once the address is confirmed",
    expected: "200/201 with accessToken",
    actual: `${login.status}, token=${Boolean(login.json?.accessToken)}`,
    status: login.json?.accessToken ? "PASS" : "FAIL",
  });

  const wrongPw = await req("POST", "/auth/login", { body: { email, password: "WrongPassword1" } });
  record({
    id: "E2E-006",
    phase: "E2E",
    owasp: "-",
    name: "Login with wrong password is rejected",
    expected: "401",
    actual: String(wrongPw.status),
    status: wrongPw.status === 401 ? "PASS" : "FAIL",
  });

  const me = await req("GET", "/auth/me", { token: studentToken });
  record({
    id: "E2E-007",
    phase: "E2E",
    owasp: "-",
    name: "GET /auth/me returns the caller's profile",
    expected: "200 with matching email",
    actual: `${me.status}, email=${me.json?.email}`,
    status: me.status === 200 && me.json?.email === email ? "PASS" : "FAIL",
  });

  const meNoAuth = await req("GET", "/auth/me");
  record({
    id: "E2E-008",
    phase: "E2E",
    owasp: "-",
    name: "GET /auth/me without a token is rejected",
    expected: "401",
    actual: String(meNoAuth.status),
    status: meNoAuth.status === 401 ? "PASS" : "FAIL",
  });

  // Refresh rotation: old token must stop working once exchanged.
  const refreshed = await req("POST", "/auth/refresh", { body: { refreshToken: studentRefresh } });
  const reuse = await req("POST", "/auth/refresh", { body: { refreshToken: studentRefresh } });
  record({
    id: "E2E-009",
    phase: "E2E",
    owasp: "API2",
    name: "Refresh token rotates and the consumed token is revoked (replay blocked)",
    expected: "first 200/201, replay 401",
    actual: `first=${refreshed.status}, replay=${reuse.status}`,
    status: refreshed.json?.accessToken && reuse.status === 401 ? "PASS" : "FAIL",
    severity: reuse.status === 401 ? "-" : "High",
  });
  if (refreshed.json?.refreshToken) studentRefresh = refreshed.json.refreshToken;
  if (refreshed.json?.accessToken) studentToken = refreshed.json.accessToken;

  const adminLogin = await req("POST", "/auth/login", {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  adminToken = adminLogin.json?.accessToken;
  record({
    id: "E2E-010",
    phase: "E2E",
    owasp: "-",
    name: "Seeded admin can authenticate",
    expected: `200/201 with role="${ROLE_ADMIN}"`,
    actual: `${adminLogin.status}, role=${adminLogin.json?.user?.role}`,
    status: adminToken && adminLogin.json?.user?.role === ROLE_ADMIN ? "PASS" : "FAIL",
  });
}

// ------------------------------------------------------ E2E: catalog + files

async function e2eCatalog() {
  const subjects = await req("GET", "/subjects");
  record({
    id: "E2E-011",
    phase: "E2E",
    owasp: "-",
    name: "Subject catalog is publicly readable",
    expected: "200 with array",
    actual: `${subjects.status}, n=${Array.isArray(subjects.json) ? subjects.json.length : "n/a"}`,
    status: subjects.status === 200 && Array.isArray(subjects.json) ? "PASS" : "FAIL",
  });

  const papers = await req("GET", "/papers");
  const paperList = Array.isArray(papers.json) ? papers.json : [];
  // Signed-out visitors get one free paper per semester; the rest are locked.
  const freePaper = paperList.find((p) => p.locked === false) ?? null;
  const lockedPaper = paperList.find((p) => p.locked === true) ?? null;
  const firstPaper = freePaper ?? paperList[0] ?? null;

  record({
    id: "E2E-012",
    phase: "E2E",
    owasp: "-",
    name: "Question paper list is publicly readable, with per-paper lock state",
    expected: "200, array, every item carries `locked`",
    actual: `${papers.status}, n=${paperList.length}, free=${paperList.filter((p) => !p.locked).length}, locked=${paperList.filter((p) => p.locked).length}`,
    status:
      papers.status === 200 && paperList.every((p) => typeof p.locked === "boolean")
        ? "PASS"
        : "FAIL",
  });

  // The gate itself. Checked before anything storage-dependent, because it must
  // hold whether or not object storage is reachable.
  if (lockedPaper) {
    const lockedView = await req("GET", `/papers/${lockedPaper.id}/view`);
    const lockedDl = await req("GET", `/papers/${lockedPaper.id}/download`);
    const blocked = lockedView.status === 401 && lockedDl.status === 401;
    record({
      id: "E2E-012a",
      phase: "E2E",
      owasp: "API1",
      name: "SECURITY — anonymous view/download of a LOCKED paper is refused",
      expected: "401 on both",
      actual: `view=${lockedView.status}, download=${lockedDl.status}`,
      status: blocked ? "PASS" : "FAIL",
      severity: blocked ? "-" : "High",
    });
  }

  if (firstPaper) {
    const view = await req("GET", `/papers/${firstPaper.id}/view`);
    const dto = view.json || {};
    // A free paper must get past the gate. A 500 here means object storage is
    // offline, which is an environment problem, not an authorization one — the
    // request still cleared the gate.
    const pastGate = view.status !== 401 && view.status !== 403;
    record({
      id: "E2E-013",
      phase: "E2E",
      owasp: "-",
      name: "Anonymous user may open the free paper for the semester",
      expected: "not 401/403 (200 when storage is up)",
      actual: `${view.status}, keys=${Object.keys(dto).join(",")}`,
      status: view.status === 200 && dto.url && dto.mimeType ? "PASS" : pastGate ? "WARN" : "FAIL",
      severity: pastGate ? "-" : "High",
      evidence: pastGate && view.status !== 200 ? "cleared the gate; object storage unreachable" : "",
    });

    record({
      id: "E2E-014",
      phase: "E2E",
      owasp: "API3",
      name: "View DTO does not leak the internal storage key",
      expected: "no fileKey / bucket internals in body",
      actual: Object.keys(dto).join(","),
      status: !("fileKey" in dto) ? "PASS" : "FAIL",
      severity: !("fileKey" in dto) ? "-" : "Low",
    });

    const dl = await req("GET", `/papers/${firstPaper.id}/download`);
    const dlPastGate = dl.status !== 401 && dl.status !== 403;
    record({
      id: "E2E-015",
      phase: "E2E",
      owasp: "-",
      name: "Anonymous user may download the free paper for the semester",
      expected: "not 401/403 (200 when storage is up)",
      actual: `${dl.status}`,
      status: dl.status === 200 && dl.json?.url ? "PASS" : dlPastGate ? "WARN" : "FAIL",
      severity: dlPastGate ? "-" : "High",
      evidence: dlPastGate && dl.status !== 200 ? "cleared the gate; object storage unreachable" : "",
    });

    // Presigned URL should actually resolve at the storage provider.
    if (view.json?.url) {
      try {
        const head = await fetch(view.json.url, { method: "GET" });
        record({
          id: "E2E-016",
          phase: "E2E",
          owasp: "-",
          name: "Presigned view URL resolves at object storage",
          expected: "200 from storage",
          actual: `${head.status} ${head.headers.get("content-type") || ""}`,
          status: head.status === 200 ? "PASS" : "FAIL",
          severity: head.status === 200 ? "-" : "High",
          evidence: head.status !== 200 ? "DB row references an object missing from the bucket" : "",
        });
      } catch (e) {
        record({
          id: "E2E-016",
          phase: "E2E",
          owasp: "-",
          name: "Presigned view URL resolves at object storage",
          expected: "200 from storage",
          actual: `network error: ${e.message}`,
          status: "FAIL",
          severity: "High",
        });
      }
    }
  }

  const missing = await req("GET", "/papers/3f7c1e2a-0b5d-4c6e-9a1b-2c3d4e5f6a7b/view");
  record({
    id: "E2E-017",
    phase: "E2E",
    owasp: "-",
    name: "Unknown paper id returns 404, not 500",
    expected: "404",
    actual: String(missing.status),
    status: missing.status === 404 ? "PASS" : "FAIL",
  });

  const notes = await req("GET", "/notes");
  record({
    id: "E2E-018",
    phase: "E2E",
    owasp: "-",
    name: "Notes list is publicly readable (metadata only)",
    expected: "200",
    actual: String(notes.status),
    status: notes.status === 200 ? "PASS" : "FAIL",
  });
}

// -------------------------------------------------- OWASP API1 / API5: authz

async function owaspAuthorization() {
  // API5 BFLA — student must not reach admin-only functions.
  const adminOnly = [
    ["POST", "/papers", "Upload question paper"],
    ["POST", "/notes", "Upload note"],
    ["GET", "/study-rooms/admin/all", "Admin study-room oversight"],
    ["POST", "/subjects", "Create subject"],
    ["POST", "/year-levels", "Create year level"],
    ["POST", "/exam-types", "Create exam type"],
  ];

  let idx = 0;
  for (const [method, route, label] of adminOnly) {
    idx += 1;
    const asStudent = await req(method, route, { token: studentToken, body: {} });
    const forbidden = asStudent.status === 403;
    record({
      id: `SEC-API5-${String(idx).padStart(3, "0")}`,
      phase: "Security",
      owasp: "API5 Broken Function Level Authorization",
      name: `Student is denied admin function: ${label}`,
      expected: "403 Forbidden",
      actual: String(asStudent.status),
      status: forbidden ? "PASS" : "FAIL",
      severity: forbidden ? "-" : "Critical",
    });
  }

  // Same routes with no credentials at all.
  const anonAdmin = await req("GET", "/study-rooms/admin/all");
  record({
    id: "SEC-API5-007",
    phase: "Security",
    owasp: "API5 Broken Function Level Authorization",
    name: "Anonymous caller is denied the admin oversight endpoint",
    expected: "401",
    actual: String(anonAdmin.status),
    status: anonAdmin.status === 401 ? "PASS" : "FAIL",
    severity: anonAdmin.status === 401 ? "-" : "Critical",
  });

  // API1 BOLA — notes file access is the gated object in this app.
  const notes = await req("GET", "/notes");
  const firstNote = Array.isArray(notes.json) ? notes.json[0] : null;
  if (firstNote) {
    const anon = await req("GET", `/notes/${firstNote.id}/view`);
    record({
      id: "SEC-API1-001",
      phase: "Security",
      owasp: "API1 Broken Object Level Authorization",
      name: "Anonymous user cannot obtain a note view URL",
      expected: "401",
      actual: String(anon.status),
      status: anon.status === 401 ? "PASS" : "FAIL",
      severity: anon.status === 401 ? "-" : "High",
    });
    const anonDl = await req("GET", `/notes/${firstNote.id}/download`);
    record({
      id: "SEC-API1-002",
      phase: "Security",
      owasp: "API1 Broken Object Level Authorization",
      name: "Anonymous user cannot obtain a note download URL",
      expected: "401",
      actual: String(anonDl.status),
      status: anonDl.status === 401 ? "PASS" : "FAIL",
      severity: anonDl.status === 401 ? "-" : "High",
    });
  } else {
    record({
      id: "SEC-API1-001",
      phase: "Security",
      owasp: "API1 Broken Object Level Authorization",
      name: "Anonymous user cannot obtain a note view URL",
      expected: "401",
      actual: "no notes seeded — untested",
      status: "INFO",
    });
  }

  // API1 — a student must not read another user's identity via /auth/me.
  const meAsStudent = await req("GET", "/auth/me", { token: studentToken });
  record({
    id: "SEC-API1-003",
    phase: "Security",
    owasp: "API1 Broken Object Level Authorization",
    name: "/auth/me is scoped to the bearer's own account (no id parameter to tamper)",
    expected: "returns only the caller",
    actual: `id=${meAsStudent.json?.id === studentId ? "self" : "OTHER"}`,
    status: meAsStudent.json?.id === studentId ? "PASS" : "FAIL",
    severity: meAsStudent.json?.id === studentId ? "-" : "Critical",
  });

  // API1 — private study room should be unreachable by a non-member.
  const rooms = await req("GET", "/study-rooms", { token: studentToken });
  record({
    id: "SEC-API1-004",
    phase: "Security",
    owasp: "API1 Broken Object Level Authorization",
    name: "Study room listing requires authentication",
    expected: "200 for member, 401 anonymous",
    actual: `auth=${rooms.status}, anon=${(await req("GET", "/study-rooms")).status}`,
    status: rooms.status === 200 ? "PASS" : "INFO",
  });
}

// ------------------------------------------------------- OWASP API2: authn

async function owaspAuthentication() {
  const cases = [
    ["SEC-API2-001", "No Authorization header", undefined],
    ["SEC-API2-002", "Malformed token string", "not-a-jwt"],
    ["SEC-API2-003", "Structurally valid JWT signed with the wrong secret", signHS256({ sub: studentId, role: "ADMIN" }, "attacker-secret")],
    ["SEC-API2-004", "alg:none unsigned token (algorithm confusion)", `${b64url({ alg: "none", typ: "JWT" })}.${b64url({ sub: studentId, role: "ADMIN" })}.`],
    ["SEC-API2-005", "Expired token", signHS256({ sub: studentId, role: "ADMIN", exp: Math.floor(Date.now() / 1000) - 60 }, process.env.JWT_ACCESS_SECRET || "x")],
  ];

  for (const [id, name, token] of cases) {
    const res = await req("GET", "/auth/me", { token });
    record({
      id,
      phase: "Security",
      owasp: "API2 Broken Authentication",
      name: `Rejected: ${name}`,
      expected: "401",
      actual: String(res.status),
      status: res.status === 401 ? "PASS" : "FAIL",
      severity: res.status === 401 ? "-" : "Critical",
    });
  }

  // Privilege escalation via a self-signed token using the REAL secret would
  // succeed by design; the meaningful test is that role comes from the DB, not
  // from the token claim. Forge a token with the real access secret but a
  // tampered role and confirm admin routes still refuse it.
  const realSecret = process.env.JWT_ACCESS_SECRET;
  if (realSecret) {
    const forged = signHS256(
      { sub: studentId, email: "qa@x", role: "ADMIN", exp: Math.floor(Date.now() / 1000) + 300 },
      realSecret,
    );
    const res = await req("GET", "/study-rooms/admin/all", { token: forged });
    const blocked = res.status === 403 || res.status === 401;
    record({
      id: "SEC-API2-006",
      phase: "Security",
      owasp: "API2 Broken Authentication",
      name: "Role claim tampering: token says ADMIN, database says student",
      expected: "403/401 — role must be re-checked server-side",
      actual: String(res.status),
      status: blocked ? "PASS" : "FAIL",
      severity: blocked ? "-" : "Critical",
      evidence: blocked
        ? "Role is resolved from the database, not trusted from the JWT claim"
        : "Server trusted the role claim inside the JWT",
    });
  }

  // Logout must actually revoke.
  const logout = await req("POST", "/auth/logout", {
    token: studentToken,
    body: { refreshToken: studentRefresh },
  });
  const afterLogout = await req("POST", "/auth/refresh", { body: { refreshToken: studentRefresh } });
  record({
    id: "SEC-API2-007",
    phase: "Security",
    owasp: "API2 Broken Authentication",
    name: "Logout revokes the refresh token",
    expected: "logout 204, subsequent refresh 401",
    actual: `logout=${logout.status}, refresh=${afterLogout.status}`,
    status: afterLogout.status === 401 ? "PASS" : "FAIL",
    severity: afterLogout.status === 401 ? "-" : "High",
  });
}

// ------------------------------- OWASP API3: property-level authz / exposure

async function owaspPropertyLevel() {
  // Mass assignment: try to self-provision an admin account at signup.
  const email = `qa-escalate-${Date.now()}@${ALLOWED_DOMAIN}`;
  const res = await req("POST", "/auth/signup", {
    body: { email, password: "QaPassword123", fullName: "QA Escalate", role: "admin" },
  });
  if (res.status === 201 || res.status === 200) createdEmails.push(email);

  const rejected = res.status === 400;
  const createdAsStudent = res.json?.user?.role === ROLE_STUDENT;
  record({
    id: "SEC-API3-001",
    phase: "Security",
    owasp: "API3 Broken Object Property Level Authorization",
    name: "Mass assignment: extra 'role' field at signup cannot grant admin",
    expected: `400 (whitelist rejects unknown property) or account created as "${ROLE_STUDENT}"`,
    actual: `${res.status}, role=${res.json?.user?.role ?? "n/a"}`,
    status: rejected || createdAsStudent ? "PASS" : "FAIL",
    severity: rejected || createdAsStudent ? "-" : "Critical",
    evidence: rejected ? "ValidationPipe forbidNonWhitelisted rejected the payload" : "",
  });

  // Excessive data exposure: no password material in any auth response.
  const login = await req("POST", "/auth/login", {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const bodyText = login.text || "";
  const leaks = ["passwordHash", "$argon2", "tokenHash"].filter((s) => bodyText.includes(s));
  record({
    id: "SEC-API3-002",
    phase: "Security",
    owasp: "API3 Broken Object Property Level Authorization",
    name: "Login response contains no password hash or token hash",
    expected: "no credential material in body",
    actual: leaks.length ? `leaked: ${leaks.join(",")}` : "clean",
    status: leaks.length === 0 ? "PASS" : "FAIL",
    severity: leaks.length === 0 ? "-" : "Critical",
  });

  // Public paper listing should not expose uploader identity or storage keys.
  const papers = await req("GET", "/papers");
  const sample = Array.isArray(papers.json) ? papers.json[0] : null;
  if (sample) {
    const sensitive = ["fileKey", "checksum"].filter((k) => k in sample);
    record({
      id: "SEC-API3-003",
      phase: "Security",
      owasp: "API3 Broken Object Property Level Authorization",
      name: "Public paper DTO omits storage key and checksum",
      expected: "no fileKey/checksum",
      actual: sensitive.length ? `exposed: ${sensitive.join(",")}` : `fields: ${Object.keys(sample).join(",")}`,
      status: sensitive.length === 0 ? "PASS" : "WARN",
      severity: sensitive.length === 0 ? "-" : "Low",
    });
  }
}

// ------------------------------ OWASP API4/API6: resource consumption & flows

async function owaspResourceConsumption() {
  // Brute force: fire sequential bad logins and see whether anything throttles.
  const attempts = 25;
  const codes = [];
  const started = Date.now();
  for (let i = 0; i < attempts; i += 1) {
    const r = await req("POST", "/auth/login", {
      body: { email: ADMIN_EMAIL, password: `wrong-${i}` },
    });
    codes.push(r.status);
  }
  const elapsed = Date.now() - started;
  const throttled = codes.filter((c) => c === 429).length;
  record({
    id: "SEC-API4-001",
    phase: "Security",
    owasp: "API4 Unrestricted Resource Consumption",
    name: `Brute-force protection on login (${attempts} bad attempts)`,
    expected: "some 429 Too Many Requests / lockout",
    actual: `0 throttled, all ${codes.length} answered ${[...new Set(codes)].join("/")} in ${elapsed}ms`,
    status: throttled > 0 ? "PASS" : "FAIL",
    severity: throttled > 0 ? "-" : "High",
    evidence: "No rate limiter (@nestjs/throttler) is registered in AppModule",
  });

  // API6: password-reset flow abuse — unlimited emails to one address.
  const resetCodes = [];
  for (let i = 0; i < 6; i += 1) {
    const r = await req("POST", "/auth/forgot-password", { body: { email: ADMIN_EMAIL } });
    resetCodes.push(r.status);
  }
  const resetThrottled = resetCodes.filter((c) => c === 429).length;
  record({
    id: "SEC-API6-001",
    phase: "Security",
    owasp: "API6 Unrestricted Access to Sensitive Business Flows",
    name: "Password-reset requests are rate limited per address",
    expected: "throttling after a few requests",
    actual: `${resetCodes.length} accepted (${[...new Set(resetCodes)].join("/")}), 0 throttled`,
    status: resetThrottled > 0 ? "PASS" : "FAIL",
    severity: resetThrottled > 0 ? "-" : "Medium",
    evidence: "Each request consumes provider email quota (Brevo free tier: 300/day)",
  });

  // Oversized payload handling.
  const big = "x".repeat(2 * 1024 * 1024);
  const bigRes = await req("POST", "/auth/login", { body: { email: `${big}@x.com`, password: "p" } });
  record({
    id: "SEC-API4-002",
    phase: "Security",
    owasp: "API4 Unrestricted Resource Consumption",
    name: "Oversized JSON body is rejected rather than processed",
    expected: "413 / 400",
    actual: String(bigRes.status),
    status: [413, 400, 401].includes(bigRes.status) ? "PASS" : "WARN",
    severity: [413, 400, 401].includes(bigRes.status) ? "-" : "Medium",
  });

  // Enumeration oracle: compare timing of registered vs unregistered address.
  const timeIt = async (addr) => {
    const t0 = process.hrtime.bigint();
    await req("POST", "/auth/forgot-password", { body: { email: addr } });
    return Number(process.hrtime.bigint() - t0) / 1e6;
  };
  const unknownTimes = [];
  const knownTimes = [];
  for (let i = 0; i < 4; i += 1) {
    unknownTimes.push(await timeIt(`ghost-${i}-${Date.now()}@${ALLOWED_DOMAIN}`));
    knownTimes.push(await timeIt(ADMIN_EMAIL));
  }
  const avg = (a) => a.reduce((s, n) => s + n, 0) / a.length;
  const unknownAvg = avg(unknownTimes);
  const knownAvg = avg(knownTimes);
  const ratio = knownAvg / unknownAvg;
  record({
    id: "SEC-API6-002",
    phase: "Security",
    owasp: "API6 Unrestricted Access to Sensitive Business Flows",
    name: "Forgot-password timing does not reveal whether an account exists",
    expected: "comparable latency for known vs unknown addresses",
    actual: `registered ${knownAvg.toFixed(1)}ms vs unregistered ${unknownAvg.toFixed(1)}ms (${ratio.toFixed(2)}x)`,
    status: ratio < 1.5 ? "PASS" : "FAIL",
    severity: ratio < 1.5 ? "-" : "Medium",
    evidence: "Registered path performs 2 extra DB writes plus an awaited outbound mail call",
  });

  // Response-body uniformity (the defence the code actually implements).
  // Resend-verification must be as enumeration-safe as forgot-password: it also
  // distinguishes "registered", "unregistered" and "already verified".
  const resendKnown = await req("POST", "/auth/resend-verification", { body: { email: ADMIN_EMAIL } });
  const resendUnknown = await req("POST", "/auth/resend-verification", {
    body: { email: `nobody-${Date.now()}@${ALLOWED_DOMAIN}` },
  });
  record({
    id: "SEC-API6-004",
    phase: "Security",
    owasp: "API6 Unrestricted Access to Sensitive Business Flows",
    name: "Resend-verification answers identically for known, unknown and already-verified addresses",
    expected: "same status and body",
    actual: `${resendKnown.status}/${resendUnknown.status}, identical=${resendKnown.text === resendUnknown.text}`,
    status:
      resendKnown.status === resendUnknown.status && resendKnown.text === resendUnknown.text
        ? "PASS"
        : "FAIL",
    severity: "-",
  });

  const known = await req("POST", "/auth/forgot-password", { body: { email: ADMIN_EMAIL } });
  const unknown = await req("POST", "/auth/forgot-password", {
    body: { email: `nobody-${Date.now()}@${ALLOWED_DOMAIN}` },
  });
  record({
    id: "SEC-API6-003",
    phase: "Security",
    owasp: "API6 Unrestricted Access to Sensitive Business Flows",
    name: "Forgot-password response body/status is identical for both cases",
    expected: "same status and body",
    actual: `${known.status}/${unknown.status}, identical=${known.text === unknown.text}`,
    status: known.status === unknown.status && known.text === unknown.text ? "PASS" : "FAIL",
    severity: "-",
  });
}

// --------------------------------- OWASP API7/API8/API9/API10: config & misc

async function owaspConfiguration() {
  const res = await req("GET", "/health", {
    headers: { Origin: "https://evil.example.com" },
  });
  const acao = res.headers.get("access-control-allow-origin");
  const permissive = acao === "*" || acao === "https://evil.example.com";
  record({
    id: "SEC-API8-001",
    phase: "Security",
    owasp: "API8 Security Misconfiguration",
    name: "CORS does not reflect/allow arbitrary origins",
    expected: "origin allowlist (not * or reflected)",
    actual: `Access-Control-Allow-Origin: ${acao ?? "(absent)"}`,
    status: permissive ? "FAIL" : "PASS",
    severity: permissive ? "Medium" : "-",
    evidence: permissive ? "main.ts uses NestFactory.create(AppModule, { cors: true })" : "",
  });

  const headerChecks = [
    ["x-content-type-options", "nosniff", "Medium"],
    ["x-frame-options", "DENY/SAMEORIGIN", "Medium"],
    ["strict-transport-security", "max-age=...", "Medium"],
    ["content-security-policy", "a policy", "Medium"],
  ];
  let hIdx = 1;
  for (const [header, expected, severity] of headerChecks) {
    hIdx += 1;
    const present = res.headers.get(header);
    record({
      id: `SEC-API8-${String(hIdx).padStart(3, "0")}`,
      phase: "Security",
      owasp: "API8 Security Misconfiguration",
      name: `Security header present: ${header}`,
      expected,
      actual: present ?? "(absent)",
      status: present ? "PASS" : "FAIL",
      severity: present ? "-" : severity,
      evidence: present ? "" : "helmet middleware is not registered",
    });
  }

  const poweredBy = res.headers.get("x-powered-by");
  record({
    id: "SEC-API9-001",
    phase: "Security",
    owasp: "API9 Improper Inventory Management",
    name: "Server does not advertise its framework via X-Powered-By",
    expected: "(absent)",
    actual: poweredBy ?? "(absent)",
    status: poweredBy ? "FAIL" : "PASS",
    severity: poweredBy ? "Low" : "-",
  });

  // Error handling must not leak stack traces or SQL.
  const boom = await req("POST", "/auth/login", { body: "{not json", raw: true, headers: { "content-type": "application/json" } });
  const leaky = /at\s+\/|node_modules|prisma\.|SELECT\s|\.ts:\d+/i.test(boom.text || "");
  record({
    id: "SEC-API8-006",
    phase: "Security",
    owasp: "API8 Security Misconfiguration",
    name: "Malformed request does not leak stack traces or internals",
    expected: "generic error body",
    actual: leaky ? "internals present in body" : `clean (${boom.status})`,
    status: leaky ? "FAIL" : "PASS",
    severity: leaky ? "High" : "-",
    evidence: (boom.text || "").slice(0, 160),
  });

  // Unhandled verbs / undocumented surface. undici refuses to emit TRACE at
  // all, so a rejection here means the client blocked it, not the server.
  let traceActual;
  let traceStatus;
  try {
    const trace = await req("TRACE", "/health");
    traceActual = String(trace.status);
    traceStatus = [404, 405, 501].includes(trace.status) ? "PASS" : "WARN";
  } catch (e) {
    traceActual = `not sent by client (${e.message})`;
    traceStatus = "INFO";
  }
  record({
    id: "SEC-API9-002",
    phase: "Security",
    owasp: "API9 Improper Inventory Management",
    name: "TRACE verb is not served",
    expected: "404/405",
    actual: traceActual,
    status: traceStatus,
    severity: "-",
  });

  // Undocumented/dangerous verbs that the client CAN send.
  for (const verb of ["PUT", "PATCH", "DELETE"]) {
    const r = await req(verb, "/health");
    record({
      id: `SEC-API9-00${3 + ["PUT", "PATCH", "DELETE"].indexOf(verb)}`,
      phase: "Security",
      owasp: "API9 Improper Inventory Management",
      name: `${verb} on a GET-only route is not served`,
      expected: "404/405",
      actual: String(r.status),
      status: [404, 405].includes(r.status) ? "PASS" : "WARN",
      severity: [404, 405].includes(r.status) ? "-" : "Low",
    });
  }

  // API7 SSRF — no endpoint accepts a caller-supplied URL to fetch. Verify that
  // the one outbound integration (Brevo) uses a hardcoded endpoint.
  const mailSrc = fs.readFileSync(
    path.join(__dirname, "..", "..", "src", "modules", "mail", "mail.service.ts"),
    "utf8",
  );
  const hardcoded = /const BREVO_ENDPOINT = "https:\/\/api\.brevo\.com/.test(mailSrc);
  record({
    id: "SEC-API7-001",
    phase: "Security",
    owasp: "API7 Server Side Request Forgery",
    name: "No user-controlled URL is fetched server-side",
    expected: "outbound endpoints are hardcoded",
    actual: hardcoded ? "Brevo endpoint is a module constant" : "endpoint may be configurable",
    status: hardcoded ? "PASS" : "WARN",
    severity: hardcoded ? "-" : "Medium",
  });

  // API10 — response from the third-party mail API is not echoed to clients.
  const echoesProvider = /return .*response\.(text|json)\(\)|throw new Error\(await response/.test(mailSrc);
  record({
    id: "SEC-API10-001",
    phase: "Security",
    owasp: "API10 Unsafe Consumption of APIs",
    name: "Third-party (Brevo) response is not reflected to API clients",
    expected: "provider errors logged server-side only",
    actual: echoesProvider ? "provider body may reach the client" : "provider body is logged, generic error thrown",
    status: echoesProvider ? "WARN" : "PASS",
    severity: echoesProvider ? "Low" : "-",
  });

  // Injection sanity: Prisma is parameterised, but confirm behaviour.
  const inject = await req("GET", "/papers?subjectId=' OR '1'='1");
  record({
    id: "SEC-INJ-001",
    phase: "Security",
    owasp: "API8 Security Misconfiguration",
    name: "SQL-injection style input is rejected by validation, not passed to the ORM",
    expected: "400",
    actual: String(inject.status),
    status: inject.status === 400 ? "PASS" : "WARN",
    severity: inject.status === 400 ? "-" : "Medium",
  });

  // Signup no longer echoes the created user back, so the stored value has to
  // be read from the database rather than from the response body.
  const xssEmail = `qa-xss-${Date.now()}@${ALLOWED_DOMAIN}`;
  const xss = await req("POST", "/auth/signup", {
    body: {
      email: xssEmail,
      password: "QaPassword123",
      fullName: "<script>alert(1)</script>",
    },
  });
  if (xss.status === 201 || xss.status === 200) createdEmails.push(xssEmail);
  const xssRow = await getPrisma().user.findUnique({ where: { email: xssEmail } });
  const storedRaw = xssRow?.fullName === "<script>alert(1)</script>";
  record({
    id: "SEC-INJ-002",
    phase: "Security",
    owasp: "API3 Broken Object Property Level Authorization",
    name: "Script payload in fullName is stored raw (relies on React escaping at render)",
    expected: "stored escaped, or documented as render-time escaped",
    actual: storedRaw ? "stored verbatim" : "modified on store",
    status: storedRaw ? "WARN" : "PASS",
    severity: storedRaw ? "Low" : "-",
    evidence: "React escapes by default; risk is limited to any future non-React consumer",
  });
}

// --------------------------------------------------------------- cleanup

async function cleanup() {
  try {
    if (createdEmails.length) {
      // Tokens cascade with the user row, so deleting the account is enough.
      const del = await getPrisma().user.deleteMany({ where: { email: { in: createdEmails } } });
      console.log(`\nCleanup: removed ${del.count} throwaway QA account(s).`);
    }
  } catch (e) {
    console.log(`\nCleanup FAILED (remove manually: ${createdEmails.join(", ")}): ${e.message}`);
  } finally {
    if (prismaClient) await prismaClient.$disconnect().catch(() => undefined);
  }
}

(async () => {
  console.log(`ScholarBase QA suite -> ${API}\n`);
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("ADMIN_EMAIL / ADMIN_PASSWORD must be set (they are read from backend/.env).");
    process.exit(1);
  }

  try {
    await e2eAuth();
    await e2eCatalog();
    await owaspAuthorization();
    await owaspAuthentication();
    await owaspPropertyLevel();
    await owaspResourceConsumption();
    await owaspConfiguration();
  } catch (err) {
    console.error("\nSuite aborted:", err);
  } finally {
    await cleanup();
  }

  const tally = results.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {});
  console.log("\n================ SUMMARY ================");
  console.log(
    `Total ${results.length} | PASS ${tally.PASS || 0} | FAIL ${tally.FAIL || 0} | WARN ${tally.WARN || 0} | INFO ${tally.INFO || 0}`,
  );
  const failures = results.filter((r) => r.status === "FAIL" || r.status === "WARN");
  if (failures.length) {
    console.log("\nIssues:");
    for (const f of failures) {
      console.log(`  [${f.severity}] ${f.id} ${f.name}\n        -> ${f.actual}`);
    }
  }

  fs.writeFileSync(path.join(process.cwd(), "qa-results.json"), JSON.stringify(results, null, 2));
  console.log("\nMachine-readable results written to qa-results.json");
})();

```

## backend\test\e2e\realtime-suite.js

```js
/**
 * ScholarBase — realtime (study room) regression suite.
 *
 * Drives two authenticated socket clients against the running gateway and
 * checks every realtime module: presence, chat, typing, the shared whiteboard,
 * the screen-share pointer, and WebRTC signalling relay — including the
 * authorization rules, which are the parts that must never regress.
 *
 *   node test/e2e/realtime-suite.js
 *
 * Creates throwaway accounts and a throwaway room, and deletes both at the end.
 * Point it at a development database, never production.
 */
require("dotenv/config");
const { io } = require("socket.io-client");

const API = process.env.API_BASE || "http://localhost:3000";
const DOMAIN = process.env.QA_DOMAIN || "mmcoe.edu.in";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const results = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function record({ id, module: mod, name, expected, actual, status, severity = "-" }) {
  results.push({ id, module: mod, name, expected, actual, status, severity });
  console.log(`[${status}] ${id.padEnd(14)} ${name}`);
  if (status !== "PASS") {
    console.log(`               expected: ${expected}`);
    console.log(`               actual  : ${actual}`);
  }
}

async function api(path, options = {}) {
  const res = await fetch(`${API}/api${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  const text = await res.text();
  try {
    return { status: res.status, json: JSON.parse(text) };
  } catch {
    return { status: res.status, json: null };
  }
}

async function login(email, password) {
  const r = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  if (!r.json?.accessToken) throw new Error(`login failed for ${email}: ${r.status}`);
  return r.json;
}

/** Signs up a throwaway student and marks it verified directly, since the
 * login gate now requires a confirmed address and we have no inbox here. */
async function makeStudent(prisma, label) {
  const email = `qa.rt.${label}.${Date.now()}@${DOMAIN}`;
  await api("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password: "QaPassword123", fullName: `QA ${label}` }),
  });
  await prisma.user.updateMany({ where: { email }, data: { emailVerifiedAt: new Date() } });
  return { email, ...(await login(email, "QaPassword123")) };
}

function connect(token) {
  const socket = io(`${API}/study-rooms`, { transports: ["websocket"], auth: { token } });
  const seen = [];
  const record = (event) => (payload) => seen.push({ event, payload });
  [
    "room:joined",
    "room:participant-joined",
    "room:participant-left",
    "chat:message",
    "chat:typing",
    "webrtc:signal",
    "media:state",
    "whiteboard:state",
    "whiteboard:stroke",
    "whiteboard:grants",
    "whiteboard:undo",
    "whiteboard:cleared",
    "whiteboard:draw-requested",
    "screen:pointer",
    "room:error",
  ].forEach((e) => socket.on(e, record(e)));
  return { socket, seen, of: (e) => seen.filter((x) => x.event === e) };
}

(async () => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("ADMIN_EMAIL / ADMIN_PASSWORD must be set (read from backend/.env)");
    process.exit(1);
  }

  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  const created = [];
  let roomId = null;

  try {
    const owner = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
    const student = await makeStudent(prisma, "student");
    created.push(student.email);

    const room = await api("/study-rooms", {
      method: "POST",
      headers: { authorization: `Bearer ${owner.accessToken}` },
      body: JSON.stringify({ name: `Realtime QA ${Date.now()}`, visibility: "public" }),
    });
    roomId = room.json?.id;
    if (!roomId) throw new Error(`could not create room: ${room.status}`);

    const A = connect(owner.accessToken);
    const B = connect(student.accessToken);
    await Promise.all([
      new Promise((r) => A.socket.on("connect", r)),
      new Promise((r) => B.socket.on("connect", r)),
    ]);

    // ---------------------------------------------------------------- presence
    A.socket.emit("room:join", { roomId });
    await wait(500);
    B.socket.emit("room:join", { roomId });
    await wait(800);

    record({
      id: "RT-PRES-001",
      module: "Presence",
      name: "Joining emits a roster to the joiner",
      expected: "room:joined with self + participants",
      actual: `joined events=${A.of("room:joined").length}`,
      status: A.of("room:joined").length === 1 ? "PASS" : "FAIL",
    });

    record({
      id: "RT-PRES-002",
      module: "Presence",
      name: "Existing members are told when someone joins",
      expected: "participant-joined on the earlier client",
      actual: `${A.of("room:participant-joined").length} event(s)`,
      status: A.of("room:participant-joined").length >= 1 ? "PASS" : "FAIL",
    });

    // -------------------------------------------------------------------- chat
    B.socket.emit("chat:send", { roomId, body: "hello from the realtime suite" });
    await wait(800);
    const gotMsg = A.of("chat:message").some((m) => m.payload.body.includes("realtime suite"));
    record({
      id: "RT-CHAT-001",
      module: "Chat",
      name: "A message reaches the other participant",
      expected: "chat:message delivered",
      actual: gotMsg ? "delivered" : "not received",
      status: gotMsg ? "PASS" : "FAIL",
    });

    const longBody = "x".repeat(5000);
    const beforeLong = A.of("chat:message").length;
    B.socket.emit("chat:send", { roomId, body: longBody });
    await wait(700);
    const overLimitBlocked = A.of("chat:message").length === beforeLong;
    record({
      id: "RT-CHAT-002",
      module: "Chat",
      name: "An over-length message is rejected, not broadcast",
      expected: "no broadcast",
      actual: overLimitBlocked ? "rejected" : "broadcast anyway",
      status: overLimitBlocked ? "PASS" : "FAIL",
      severity: overLimitBlocked ? "-" : "Medium",
    });

    B.socket.emit("chat:typing", { roomId, isTyping: true });
    await wait(600);
    record({
      id: "RT-CHAT-003",
      module: "Chat",
      name: "Typing indicator is relayed",
      expected: "chat:typing on the peer",
      actual: `${A.of("chat:typing").length} event(s)`,
      status: A.of("chat:typing").length >= 1 ? "PASS" : "FAIL",
    });

    // -------------------------------------------------------------- whiteboard
    A.socket.emit("whiteboard:claim", { roomId });
    await wait(700);
    const claimed = A.of("whiteboard:state").at(-1);
    record({
      id: "RT-WB-001",
      module: "Whiteboard",
      name: "Owner can claim the board",
      expected: "whiteboard:state naming the owner",
      actual: `owner=${claimed?.payload?.ownerName ?? "none"}`,
      status: claimed?.payload?.ownerSocketId ? "PASS" : "FAIL",
    });

    const secondClaim = B.of("room:error").length;
    B.socket.emit("whiteboard:claim", { roomId });
    await wait(600);
    record({
      id: "RT-WB-002",
      module: "Whiteboard",
      name: "A second person cannot seize an owned board",
      expected: "refused with an error",
      actual: B.of("room:error").length > secondClaim ? "refused" : "allowed",
      status: B.of("room:error").length > secondClaim ? "PASS" : "FAIL",
      severity: B.of("room:error").length > secondClaim ? "-" : "High",
    });

    const beforeUngranted = A.of("whiteboard:stroke").length;
    B.socket.emit("whiteboard:stroke", {
      roomId, strokeId: "rt-nogrant", color: "#f00", width: 3,
      points: [0.1, 0.1, 0.2, 0.2], done: true,
    });
    await wait(700);
    const ungrantedBlocked = A.of("whiteboard:stroke").length === beforeUngranted;
    record({
      id: "RT-WB-003",
      module: "Whiteboard",
      name: "SECURITY — drawing without a grant is ignored",
      expected: "no stroke broadcast",
      actual: ungrantedBlocked ? "ignored" : "broadcast (BUG)",
      status: ungrantedBlocked ? "PASS" : "FAIL",
      severity: ungrantedBlocked ? "-" : "High",
    });

    B.socket.emit("whiteboard:request-draw", { roomId });
    await wait(600);
    record({
      id: "RT-WB-004",
      module: "Whiteboard",
      name: "Ask-to-draw reaches the owner only",
      expected: "draw-requested on owner, not on others",
      actual: `owner=${A.of("whiteboard:draw-requested").length}, other=${B.of("whiteboard:draw-requested").length}`,
      status:
        A.of("whiteboard:draw-requested").length >= 1 &&
        B.of("whiteboard:draw-requested").length === 0
          ? "PASS"
          : "FAIL",
    });

    A.socket.emit("whiteboard:grant", { roomId, userId: student.user.id });
    await wait(700);
    const granted = B.of("whiteboard:grants").at(-1)?.payload?.grants ?? [];
    record({
      id: "RT-WB-005",
      module: "Whiteboard",
      name: "Owner can grant the pen",
      expected: "grant broadcast including the student",
      actual: JSON.stringify(granted),
      status: granted.includes(student.user.id) ? "PASS" : "FAIL",
    });

    B.socket.emit("whiteboard:stroke", {
      roomId, strokeId: "rt-granted", color: "#00f", width: 4,
      points: [0.3, 0.3, 0.6, 0.6], done: true,
    });
    await wait(700);
    const drew = A.of("whiteboard:stroke").some((s) => s.payload.strokeId === "rt-granted");
    record({
      id: "RT-WB-006",
      module: "Whiteboard",
      name: "A granted student's stroke reaches the room",
      expected: "stroke broadcast",
      actual: drew ? "received" : "missing",
      status: drew ? "PASS" : "FAIL",
    });

    const badCoords = A.of("whiteboard:stroke").length;
    B.socket.emit("whiteboard:stroke", {
      roomId, strokeId: "rt-bad", color: "#000", width: 2,
      points: [5, -3, 0.5, 0.5], done: true,
    });
    await wait(600);
    record({
      id: "RT-WB-007",
      module: "Whiteboard",
      name: "Out-of-range coordinates are rejected",
      expected: "no broadcast",
      actual: A.of("whiteboard:stroke").length === badCoords ? "rejected" : "accepted (BUG)",
      status: A.of("whiteboard:stroke").length === badCoords ? "PASS" : "FAIL",
      severity: A.of("whiteboard:stroke").length === badCoords ? "-" : "Medium",
    });

    B.socket.emit("whiteboard:undo", { roomId });
    await wait(700);
    const undone = A.of("whiteboard:undo").at(-1)?.payload?.strokeId;
    record({
      id: "RT-WB-008",
      module: "Whiteboard",
      name: "Undo removes the caller's own stroke",
      expected: "undo of rt-granted",
      actual: String(undone),
      status: undone === "rt-granted" ? "PASS" : "FAIL",
    });

    const clearErrors = B.of("room:error").length;
    B.socket.emit("whiteboard:clear", { roomId });
    await wait(600);
    record({
      id: "RT-WB-009",
      module: "Whiteboard",
      name: "SECURITY — a non-owner cannot clear the board",
      expected: "refused",
      actual: B.of("room:error").length > clearErrors ? "refused" : "cleared (BUG)",
      status: B.of("room:error").length > clearErrors ? "PASS" : "FAIL",
      severity: B.of("room:error").length > clearErrors ? "-" : "High",
    });

    A.socket.emit("whiteboard:clear", { roomId });
    await wait(600);
    record({
      id: "RT-WB-010",
      module: "Whiteboard",
      name: "Owner can clear the board",
      expected: "cleared broadcast",
      actual: `${B.of("whiteboard:cleared").length} event(s)`,
      status: B.of("whiteboard:cleared").length >= 1 ? "PASS" : "FAIL",
    });

    // ----------------------------------------------------------- screen pointer
    const pointerBefore = A.of("screen:pointer").length;
    B.socket.emit("screen:pointer", { roomId, x: 0.4, y: 0.4, visible: true });
    await wait(600);
    record({
      id: "RT-PTR-001",
      module: "Screen pointer",
      name: "SECURITY — pointer is dropped when nobody is sharing",
      expected: "no relay",
      actual: A.of("screen:pointer").length === pointerBefore ? "dropped" : "relayed (BUG)",
      status: A.of("screen:pointer").length === pointerBefore ? "PASS" : "FAIL",
      severity: A.of("screen:pointer").length === pointerBefore ? "-" : "Medium",
    });

    A.socket.emit("media:state", {
      roomId, inCall: true, audioEnabled: true, videoEnabled: false, screenEnabled: true,
    });
    await wait(700);
    B.socket.emit("screen:pointer", { roomId, x: 0.25, y: 0.75, visible: true });
    await wait(700);
    const ptr = A.of("screen:pointer").at(-1)?.payload;
    record({
      id: "RT-PTR-002",
      module: "Screen pointer",
      name: "Pointer relays while a screen share is active",
      expected: "x=0.25 y=0.75 with the sender's name",
      actual: ptr ? `x=${ptr.x} y=${ptr.y} from ${ptr.fullName}` : "not received",
      status: ptr && ptr.x === 0.25 && ptr.y === 0.75 ? "PASS" : "FAIL",
    });

    const ptrBad = A.of("screen:pointer").length;
    B.socket.emit("screen:pointer", { roomId, x: 9, y: -2, visible: true });
    B.socket.emit("screen:pointer", { roomId, x: null, y: 0.5, visible: true });
    await wait(700);
    record({
      id: "RT-PTR-003",
      module: "Screen pointer",
      name: "Malformed / out-of-range pointer coordinates are rejected",
      expected: "no relay",
      actual: A.of("screen:pointer").length === ptrBad ? "rejected" : "relayed (BUG)",
      status: A.of("screen:pointer").length === ptrBad ? "PASS" : "FAIL",
      severity: A.of("screen:pointer").length === ptrBad ? "-" : "Medium",
    });

    // ------------------------------------------------------- webrtc signalling
    const sigBefore = A.of("webrtc:signal").length;
    B.socket.emit("webrtc:signal", {
      roomId, targetSocketId: A.socket.id, kind: "offer", data: { sdp: "fake" },
    });
    await wait(600);
    record({
      id: "RT-SIG-001",
      module: "WebRTC signalling",
      name: "Signals route to a peer in the same room",
      expected: "delivered",
      actual: A.of("webrtc:signal").length > sigBefore ? "delivered" : "dropped",
      status: A.of("webrtc:signal").length > sigBefore ? "PASS" : "FAIL",
    });

    const strayBefore = A.of("webrtc:signal").length;
    B.socket.emit("webrtc:signal", {
      roomId, targetSocketId: "not-a-real-socket", kind: "offer", data: { sdp: "x" },
    });
    await wait(600);
    record({
      id: "RT-SIG-002",
      module: "WebRTC signalling",
      name: "SECURITY — signals to a non-member socket are refused",
      expected: "no relay",
      actual: A.of("webrtc:signal").length === strayBefore ? "refused" : "relayed (BUG)",
      status: A.of("webrtc:signal").length === strayBefore ? "PASS" : "FAIL",
      severity: A.of("webrtc:signal").length === strayBefore ? "-" : "High",
    });

    // ------------------------------------------------------------- leave/cleanup
    B.socket.emit("room:leave", { roomId });
    await wait(800);
    record({
      id: "RT-PRES-003",
      module: "Presence",
      name: "Leaving notifies the room",
      expected: "participant-left",
      actual: `${A.of("room:participant-left").length} event(s)`,
      status: A.of("room:participant-left").length >= 1 ? "PASS" : "FAIL",
    });

    A.socket.close();
    B.socket.close();
  } catch (err) {
    console.error("\nSuite aborted:", err.message);
  } finally {
    try {
      if (roomId) await prisma.studyRoom.deleteMany({ where: { id: roomId } });
      if (created.length) {
        const del = await prisma.user.deleteMany({ where: { email: { in: created } } });
        console.log(`\nCleanup: removed ${del.count} account(s) and the test room.`);
      }
    } catch (e) {
      console.log(`\nCleanup failed: ${e.message}`);
    }
    await prisma.$disconnect();
  }

  const tally = results.reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }), {});
  console.log("\n================ REALTIME SUMMARY ================");
  console.log(`Total ${results.length} | PASS ${tally.PASS || 0} | FAIL ${tally.FAIL || 0}`);
  const byModule = {};
  results.forEach((r) => {
    byModule[r.module] = byModule[r.module] || { pass: 0, fail: 0 };
    if (r.status === "PASS") byModule[r.module].pass += 1;
    else byModule[r.module].fail += 1;
  });
  Object.entries(byModule).forEach(([m, s]) =>
    console.log(`  ${m.padEnd(20)} ${s.pass} passed${s.fail ? `, ${s.fail} FAILED` : ""}`),
  );

  require("fs").writeFileSync("qa-realtime-results.json", JSON.stringify(results, null, 2));
  process.exit(results.some((r) => r.status === "FAIL") ? 1 : 0);
})();

```

## backend\test\integration\auth.service.spec.ts

```ts
/**
 * IT-AUTH — AuthService against a mocked persistence layer.
 *
 * Focus is on the security properties the service claims in its own comments:
 * credential handling, token hashing/domain separation, single-use reset links,
 * and session revocation. Prisma/JWT/Mail are mocked; argon2 and crypto are
 * real so hashing behaviour is genuinely exercised.
 */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { createHmac } from "crypto";
import * as argon2 from "argon2";
import { AuthService } from "../../src/modules/auth/auth.service";
import { PrismaService } from "../../src/prisma/prisma.service";
import { MailService } from "../../src/modules/mail/mail.service";

const REFRESH_SECRET = "test_refresh_secret";

const CONFIG: Record<string, string> = {
  JWT_ACCESS_SECRET: "test_access_secret",
  JWT_REFRESH_SECRET: REFRESH_SECRET,
  JWT_ACCESS_TTL: "15m",
  JWT_REFRESH_TTL: "30d",
  PASSWORD_RESET_TTL_MINUTES: "60",
  APP_BASE_URL: "http://localhost:5173",
};

function makeDeps() {
  const prisma = {
    allowedEmailDomain: { findFirst: jest.fn() },
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), findUniqueOrThrow: jest.fn() },
    refreshToken: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    passwordResetToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    emailVerificationToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  } as unknown as PrismaService;

  const jwt = { signAsync: jest.fn().mockResolvedValue("signed.jwt.token") } as unknown as JwtService;

  const config = {
    get: (k: string, d?: string) => CONFIG[k] ?? d,
    getOrThrow: (k: string) => {
      if (!CONFIG[k]) throw new Error(`missing ${k}`);
      return CONFIG[k];
    },
  } as unknown as ConfigService;

  const mail = {
    sendPasswordReset: jest.fn().mockResolvedValue(undefined),
    sendEmailVerification: jest.fn().mockResolvedValue(undefined),
  } as unknown as MailService;

  return { prisma, jwt, config, mail, service: new AuthService(prisma, jwt, config, mail) };
}

const USER = {
  id: "user-1",
  email: "student@youruniversity.edu.in",
  fullName: "A Student",
  role: "student",
  passwordHash: "",
  // Verified by default — login refuses unverified accounts, so the unverified
  // case is opted into explicitly by the tests that exercise that gate.
  emailVerifiedAt: new Date("2026-01-02T00:00:00Z"),
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("IT-AUTH signup", () => {
  it("IT-AUTH-001: rejects an email outside the allowed university domains", async () => {
    const { service, prisma } = makeDeps();
    (prisma.allowedEmailDomain.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      service.signup({ email: "outsider@gmail.com", password: "12345678", fullName: "X" }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("IT-AUTH-002: rejects a duplicate account with 409 rather than overwriting", async () => {
    const { service, prisma } = makeDeps();
    (prisma.allowedEmailDomain.findFirst as jest.Mock).mockResolvedValue({ domain: "youruniversity.edu.in" });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER);

    await expect(
      service.signup({ email: USER.email, password: "12345678", fullName: "X" }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("IT-AUTH-003: stores an argon2 hash, never the plaintext password", async () => {
    const { service, prisma } = makeDeps();
    (prisma.allowedEmailDomain.findFirst as jest.Mock).mockResolvedValue({ domain: "youruniversity.edu.in" });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ ...USER, passwordHash: "h", emailVerifiedAt: null });

    const plaintext = "SuperSecret123";
    await service.signup({ email: USER.email, password: plaintext, fullName: "X" });

    const written = (prisma.user.create as jest.Mock).mock.calls[0][0].data;
    expect(written.passwordHash).not.toBe(plaintext);
    expect(written.passwordHash.startsWith("$argon2")).toBe(true);
    expect(await argon2.verify(written.passwordHash, plaintext)).toBe(true);
    // The role must be forced to student — never taken from client input.
    expect(written.role).toBe("student");
  });

  it("IT-AUTH-004: normalizes the email to lowercase before persisting", async () => {
    const { service, prisma } = makeDeps();
    (prisma.allowedEmailDomain.findFirst as jest.Mock).mockResolvedValue({ domain: "youruniversity.edu.in" });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ ...USER, emailVerifiedAt: null });

    await service.signup({ email: "  STUDENT@YourUniversity.edu.in ", password: "12345678", fullName: "X" });

    expect((prisma.user.create as jest.Mock).mock.calls[0][0].data.email).toBe(
      "student@youruniversity.edu.in",
    );
  });

  it("IT-AUTH-025: issues NO session at signup — the account is unusable until confirmed", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.allowedEmailDomain.findFirst as jest.Mock).mockResolvedValue({ domain: "youruniversity.edu.in" });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ ...USER, emailVerifiedAt: null });

    const res = await service.signup({ email: USER.email, password: "12345678", fullName: "X" });

    expect(res).toEqual({ message: expect.any(String) });
    expect(res).not.toHaveProperty("accessToken");
    expect(res).not.toHaveProperty("refreshToken");
    // No refresh token row, and the account is left unverified.
    expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    expect((prisma.user.create as jest.Mock).mock.calls[0][0].data.emailVerifiedAt).toBeUndefined();
    expect(mail.sendEmailVerification).toHaveBeenCalledTimes(1);
  });

  it("IT-AUTH-026: the confirmation link mailed at signup is a hash-stored single-use token", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.allowedEmailDomain.findFirst as jest.Mock).mockResolvedValue({ domain: "youruniversity.edu.in" });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ ...USER, emailVerifiedAt: null });

    await service.signup({ email: USER.email, password: "12345678", fullName: "X" });

    const verifyUrl = (mail.sendEmailVerification as jest.Mock).mock.calls[0][2] as string;
    const rawToken = new URL(verifyUrl).searchParams.get("token")!;
    const storedHash = (prisma.emailVerificationToken.create as jest.Mock).mock.calls[0][0].data
      .tokenHash;

    expect(verifyUrl).toContain("/verify-email?token=");
    expect(rawToken).toMatch(/^[a-f0-9]{64}$/);
    expect(storedHash).not.toBe(rawToken);
  });

  it("IT-AUTH-027: verification hash is domain-separated from BOTH the refresh and reset hashes", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.allowedEmailDomain.findFirst as jest.Mock).mockResolvedValue({ domain: "youruniversity.edu.in" });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ ...USER, emailVerifiedAt: null });

    await service.signup({ email: USER.email, password: "12345678", fullName: "X" });

    const verifyUrl = (mail.sendEmailVerification as jest.Mock).mock.calls[0][2] as string;
    const rawToken = new URL(verifyUrl).searchParams.get("token")!;
    const storedHash = (prisma.emailVerificationToken.create as jest.Mock).mock.calls[0][0].data
      .tokenHash;

    const plainHmac = createHmac("sha256", REFRESH_SECRET).update(rawToken).digest("hex");
    const resetHmac = createHmac("sha256", `password-reset:${REFRESH_SECRET}`)
      .update(rawToken)
      .digest("hex");
    const verifyHmac = createHmac("sha256", `email-verification:${REFRESH_SECRET}`)
      .update(rawToken)
      .digest("hex");

    expect(storedHash).toBe(verifyHmac);
    expect(storedHash).not.toBe(plainHmac);
    expect(storedHash).not.toBe(resetHmac);
  });
});

describe("IT-AUTH login", () => {
  it("IT-AUTH-005: returns an identical generic error for unknown user and wrong password", async () => {
    const { service, prisma } = makeDeps();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const unknownErr = await service.login({ email: "nobody@x.com", password: "p" }).catch((e) => e);

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...USER,
      passwordHash: await argon2.hash("the-real-password"),
    });
    const wrongPwErr = await service.login({ email: USER.email, password: "wrong" }).catch((e) => e);

    expect(unknownErr).toBeInstanceOf(UnauthorizedException);
    expect(wrongPwErr).toBeInstanceOf(UnauthorizedException);
    // Identical wording is what prevents account enumeration via login.
    expect(unknownErr.message).toBe(wrongPwErr.message);
    expect(unknownErr.message).toBe("Invalid email or password");
  });

  it("IT-AUTH-006: issues tokens and never returns the password hash to the client", async () => {
    const { service, prisma } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...USER,
      passwordHash: await argon2.hash("pw12345678"),
    });

    const res = await service.login({ email: USER.email, password: "pw12345678" });

    expect(res.accessToken).toBeTruthy();
    expect(res.refreshToken).toBeTruthy();
    expect(JSON.stringify(res)).not.toContain("$argon2");
    expect(Object.keys(res.user).sort()).toEqual([
      "createdAt",
      "email",
      "emailVerifiedAt",
      "fullName",
      "id",
      "role",
    ]);
  });

  it("IT-AUTH-007: persists only an HMAC of the refresh token, never the raw value", async () => {
    const { service, prisma } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...USER,
      passwordHash: await argon2.hash("pw12345678"),
    });

    const res = await service.login({ email: USER.email, password: "pw12345678" });
    const stored = (prisma.refreshToken.create as jest.Mock).mock.calls[0][0].data;

    expect(stored.tokenHash).not.toBe(res.refreshToken);
    expect(stored.tokenHash).toBe(
      createHmac("sha256", REFRESH_SECRET).update(res.refreshToken).digest("hex"),
    );
  });
});

describe("IT-AUTH email verification gate", () => {
  it("IT-AUTH-028: login is refused with 403 while the address is unconfirmed", async () => {
    const { service, prisma } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...USER,
      emailVerifiedAt: null,
      passwordHash: await argon2.hash("pw12345678"),
    });

    const err = await service.login({ email: USER.email, password: "pw12345678" }).catch((e) => e);

    // 403 not 401: the frontend interceptor swallows 401s as expired sessions.
    expect(err).toBeInstanceOf(ForbiddenException);
    expect(err.message).toMatch(/confirm your email/i);
    // Crucially, no session is handed out.
    expect(prisma.refreshToken.create).not.toHaveBeenCalled();
  });

  it("IT-AUTH-029: the gate runs only after the password check, so it can't confirm an account for free", async () => {
    const { service, prisma } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...USER,
      emailVerifiedAt: null,
      passwordHash: await argon2.hash("pw12345678"),
    });

    // Wrong password against an unverified account must still look like any
    // other bad credential, not reveal that the account exists but is pending.
    const err = await service.login({ email: USER.email, password: "wrong" }).catch((e) => e);
    expect(err).toBeInstanceOf(UnauthorizedException);
    expect(err.message).toBe("Invalid email or password");
  });

  it("IT-AUTH-030: login succeeds once the address is confirmed", async () => {
    const { service, prisma } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...USER,
      passwordHash: await argon2.hash("pw12345678"),
    });

    const res = await service.login({ email: USER.email, password: "pw12345678" });
    expect(res.accessToken).toBeTruthy();
    expect(res.user.emailVerifiedAt).toBe("2026-01-02T00:00:00.000Z");
  });

  it("IT-AUTH-031: verifyEmail marks the account verified and burns the token atomically", async () => {
    const { service, prisma } = makeDeps();
    (prisma.emailVerificationToken.findUnique as jest.Mock).mockResolvedValue({
      id: "v1",
      userId: USER.id,
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: { ...USER, emailVerifiedAt: null },
    });

    await service.verifyEmail("valid-token");

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: USER.id },
      data: { emailVerifiedAt: expect.any(Date) },
    });
    expect(prisma.emailVerificationToken.update).toHaveBeenCalledWith({
      where: { id: "v1" },
      data: { usedAt: expect.any(Date) },
    });
  });

  it("IT-AUTH-032: an unknown or expired confirmation token is rejected with one generic message", async () => {
    const { service, prisma } = makeDeps();
    const messages: string[] = [];

    for (const row of [
      null,
      {
        id: "v1",
        userId: USER.id,
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 1000),
        user: { ...USER, emailVerifiedAt: null },
      },
      {
        id: "v1",
        userId: USER.id,
        usedAt: null,
        expiresAt: new Date(Date.now() - 1000),
        user: { ...USER, emailVerifiedAt: null },
      },
    ]) {
      (prisma.emailVerificationToken.findUnique as jest.Mock).mockResolvedValue(row);
      messages.push(await service.verifyEmail("t").catch((e) => e.message));
    }

    expect(new Set(messages).size).toBe(1);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("IT-AUTH-033: re-opening a spent link for an already-verified account succeeds instead of erroring", async () => {
    const { service, prisma } = makeDeps();
    (prisma.emailVerificationToken.findUnique as jest.Mock).mockResolvedValue({
      id: "v1",
      userId: USER.id,
      usedAt: new Date(),
      expiresAt: new Date(Date.now() - 1000),
      user: USER, // already verified
    });

    // A double click or a mail-client prefetch must not look like a failure.
    await expect(service.verifyEmail("spent")).resolves.toEqual({
      message: expect.stringMatching(/already confirmed/i),
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("IT-AUTH-034: resendVerification is silent for unknown and already-verified addresses", async () => {
    const { service, prisma, mail } = makeDeps();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.resendVerification("ghost@x.com")).resolves.toBeUndefined();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER); // verified
    await expect(service.resendVerification(USER.email)).resolves.toBeUndefined();

    expect(mail.sendEmailVerification).not.toHaveBeenCalled();
    expect(prisma.emailVerificationToken.create).not.toHaveBeenCalled();
  });

  it("IT-AUTH-035: resendVerification issues a fresh link and kills the previous one", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...USER, emailVerifiedAt: null });

    await service.resendVerification(USER.email);

    expect(prisma.emailVerificationToken.updateMany).toHaveBeenCalledWith({
      where: { userId: USER.id, usedAt: null },
      data: { usedAt: expect.any(Date) },
    });
    expect(mail.sendEmailVerification).toHaveBeenCalledTimes(1);
  });

  it("IT-AUTH-036: a mail failure during signup does not fail the signup itself", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.allowedEmailDomain.findFirst as jest.Mock).mockResolvedValue({ domain: "youruniversity.edu.in" });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ ...USER, emailVerifiedAt: null });
    (mail.sendEmailVerification as jest.Mock).mockRejectedValue(new Error("Brevo down"));

    // The account and token still exist; the user can ask for a resend.
    await expect(
      service.signup({ email: USER.email, password: "12345678", fullName: "X" }),
    ).resolves.toEqual({ message: expect.any(String) });
    expect(prisma.emailVerificationToken.create).toHaveBeenCalled();
  });
});

describe("IT-AUTH refresh", () => {
  it("IT-AUTH-008: rejects an expired refresh token", async () => {
    const { service, prisma } = makeDeps();
    (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue({
      id: "rt1",
      expiresAt: new Date(Date.now() - 1000),
      user: USER,
    });

    await expect(service.refresh("whatever")).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("IT-AUTH-009: rejects an unknown/revoked refresh token", async () => {
    const { service, prisma } = makeDeps();
    (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.refresh("revoked")).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("IT-AUTH-010: rotates the token — the presented one is revoked after use", async () => {
    const { service, prisma } = makeDeps();
    (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue({
      id: "rt1",
      expiresAt: new Date(Date.now() + 60_000),
      user: { ...USER, passwordHash: "h" },
    });

    await service.refresh("valid-token");

    expect(prisma.refreshToken.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "rt1" }, data: { revokedAt: expect.any(Date) } }),
    );
  });
});

describe("IT-AUTH forgot password", () => {
  it("IT-AUTH-011: resolves silently for an unregistered address (no enumeration via response)", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.forgotPassword("ghost@x.com")).resolves.toBeUndefined();
    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    expect(mail.sendPasswordReset).not.toHaveBeenCalled();
  });

  it("IT-AUTH-012: invalidates any outstanding reset link before issuing a new one", async () => {
    const { service, prisma } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER);

    await service.forgotPassword(USER.email);

    expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith({
      where: { userId: USER.id, usedAt: null },
      data: { usedAt: expect.any(Date) },
    });
  });

  it("IT-AUTH-013: stores only a hash of the reset token; the raw token goes to email only", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER);

    await service.forgotPassword(USER.email);

    const resetUrl = (mail.sendPasswordReset as jest.Mock).mock.calls[0][2] as string;
    const rawToken = new URL(resetUrl).searchParams.get("token")!;
    const storedHash = (prisma.passwordResetToken.create as jest.Mock).mock.calls[0][0].data.tokenHash;

    expect(rawToken).toMatch(/^[a-f0-9]{64}$/); // 32 random bytes, hex
    expect(storedHash).not.toBe(rawToken);
  });

  it("IT-AUTH-014: reset-token hash is domain-separated from the refresh-token hash", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER);

    await service.forgotPassword(USER.email);

    const resetUrl = (mail.sendPasswordReset as jest.Mock).mock.calls[0][2] as string;
    const rawToken = new URL(resetUrl).searchParams.get("token")!;
    const storedHash = (prisma.passwordResetToken.create as jest.Mock).mock.calls[0][0].data.tokenHash;

    const plainHmac = createHmac("sha256", REFRESH_SECRET).update(rawToken).digest("hex");
    const domainSeparated = createHmac("sha256", `password-reset:${REFRESH_SECRET}`)
      .update(rawToken)
      .digest("hex");

    // The same string must never be valid as both a reset and a refresh token.
    expect(storedHash).toBe(domainSeparated);
    expect(storedHash).not.toBe(plainHmac);
  });

  it("IT-AUTH-015: honours the configured TTL when setting expiry", async () => {
    const { service, prisma } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER);

    const before = Date.now();
    await service.forgotPassword(USER.email);
    const { expiresAt } = (prisma.passwordResetToken.create as jest.Mock).mock.calls[0][0].data;

    const deltaMin = (expiresAt.getTime() - before) / 60_000;
    expect(deltaMin).toBeGreaterThan(59);
    expect(deltaMin).toBeLessThanOrEqual(60.1);
  });

  it("IT-AUTH-016: a mail delivery failure does not surface to the caller", async () => {
    const { service, prisma, mail } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER);
    (mail.sendPasswordReset as jest.Mock).mockRejectedValue(new Error("SMTP down"));

    await expect(service.forgotPassword(USER.email)).resolves.toBeUndefined();
  });

  it("IT-AUTH-017: SECURITY — a DB failure DOES surface, creating a 500-vs-200 enumeration oracle", async () => {
    const { service, prisma } = makeDeps();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER);
    (prisma.passwordResetToken.updateMany as jest.Mock).mockRejectedValue(new Error("DB unavailable"));

    // Registered address -> error escapes -> 500.
    await expect(service.forgotPassword(USER.email)).rejects.toThrow("DB unavailable");

    // Unregistered address under the identical fault -> clean 200.
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.forgotPassword("ghost@x.com")).resolves.toBeUndefined();
  });

  it("IT-AUTH-018: SECURITY — the registered path performs strictly more awaited work (timing oracle)", async () => {
    const { service, prisma, mail } = makeDeps();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    await service.forgotPassword("ghost@x.com");
    const unregisteredCalls =
      (prisma.passwordResetToken.updateMany as jest.Mock).mock.calls.length +
      (prisma.passwordResetToken.create as jest.Mock).mock.calls.length +
      (mail.sendPasswordReset as jest.Mock).mock.calls.length;

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(USER);
    await service.forgotPassword(USER.email);
    const registeredCalls =
      (prisma.passwordResetToken.updateMany as jest.Mock).mock.calls.length +
      (prisma.passwordResetToken.create as jest.Mock).mock.calls.length +
      (mail.sendPasswordReset as jest.Mock).mock.calls.length;

    expect(unregisteredCalls).toBe(0);
    expect(registeredCalls).toBe(3); // 2 DB writes + 1 outbound HTTP send
  });
});

describe("IT-AUTH reset password", () => {
  it("IT-AUTH-019: rejects an unknown token", async () => {
    const { service, prisma } = makeDeps();
    (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.resetPassword("bogus", "newpassword")).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("IT-AUTH-020: rejects an already-used token (single use enforced)", async () => {
    const { service, prisma } = makeDeps();
    (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
      id: "t1",
      userId: USER.id,
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    });

    await expect(service.resetPassword("used", "newpassword")).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("IT-AUTH-021: rejects an expired token", async () => {
    const { service, prisma } = makeDeps();
    (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
      id: "t1",
      userId: USER.id,
      usedAt: null,
      expiresAt: new Date(Date.now() - 1),
    });

    await expect(service.resetPassword("expired", "newpassword")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("IT-AUTH-022: gives the same generic message for unknown, used and expired tokens", async () => {
    const { service, prisma } = makeDeps();
    const messages: string[] = [];

    for (const row of [
      null,
      { id: "t", userId: "u", usedAt: new Date(), expiresAt: new Date(Date.now() + 1000) },
      { id: "t", userId: "u", usedAt: null, expiresAt: new Date(Date.now() - 1000) },
    ]) {
      (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(row);
      messages.push(await service.resetPassword("t", "newpassword").catch((e) => e.message));
    }

    expect(new Set(messages).size).toBe(1);
  });

  it("IT-AUTH-023: on success, burns the token and revokes every live session atomically", async () => {
    const { service, prisma } = makeDeps();
    (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
      id: "t1",
      userId: USER.id,
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: USER,
    });

    await service.resetPassword("valid", "brand-new-password");

    // All three writes must go through a single $transaction call.
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.user.update).toHaveBeenCalled();
    expect(prisma.passwordResetToken.update).toHaveBeenCalledWith({
      where: { id: "t1" },
      data: { usedAt: expect.any(Date) },
    });
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: USER.id, revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it("IT-AUTH-024: the new password is argon2-hashed before it reaches the database", async () => {
    const { service, prisma } = makeDeps();
    (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
      id: "t1",
      userId: USER.id,
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: USER,
    });

    await service.resetPassword("valid", "brand-new-password");

    const { passwordHash } = (prisma.user.update as jest.Mock).mock.calls[0][0].data;
    expect(passwordHash.startsWith("$argon2")).toBe(true);
    expect(await argon2.verify(passwordHash, "brand-new-password")).toBe(true);
  });
});

```

## backend\test\integration\resources.service.spec.ts

```ts
/**
 * IT-RES — PapersService / NotesService upload + URL issuance.
 *
 * Covers the file-handling boundary: what the API accepts as an upload, how the
 * storage key is derived from user-controlled input, and that a missing row
 * produces 404 rather than a broken presigned URL.
 */
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PapersService } from "../../src/modules/papers/papers.service";
import { NotesService } from "../../src/modules/notes/notes.service";
import { PrismaService } from "../../src/prisma/prisma.service";
import type { StorageService } from "../../src/modules/storage/storage.service";
import type { StoredFileUrlService } from "../../src/modules/storage/stored-file-url.service";

function makeDeps() {
  const prisma = {
    questionPaper: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), delete: jest.fn() },
    note: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), delete: jest.fn() },
  } as unknown as PrismaService;

  const storage = {
    uploadObject: jest.fn().mockResolvedValue(undefined),
    deleteObject: jest.fn().mockResolvedValue(undefined),
  } as unknown as StorageService;

  const fileUrls = {
    getDownloadUrl: jest.fn().mockResolvedValue({ url: "u", expiresAt: "e" }),
    getViewUrl: jest.fn().mockResolvedValue({ url: "u", expiresAt: "e", fileName: "f", mimeType: "m" }),
  } as unknown as StoredFileUrlService;

  return {
    prisma,
    storage,
    fileUrls,
    papers: new PapersService(prisma, storage, fileUrls),
    notes: new NotesService(prisma, storage, fileUrls),
  };
}

function file(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    originalname: "CN UT.pdf",
    mimetype: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 fake pdf bytes"),
    size: 23,
    ...overrides,
  } as Express.Multer.File;
}

const PAPER_META = {
  subjectId: "3f7c1e2a-0b5d-4c6e-9a1b-2c3d4e5f6a7b",
  examTypeId: "4f7c1e2a-0b5d-4c6e-9a1b-2c3d4e5f6a7b",
  academicYear: 2026,
};

describe("IT-RES papers upload", () => {
  it("IT-RES-001: rejects a request with no file attached", async () => {
    const { papers } = makeDeps();
    await expect(
      papers.create(PAPER_META, undefined as unknown as Express.Multer.File, "admin-1"),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("IT-RES-002: rejects a non-PDF declared content type", async () => {
    const { papers, storage } = makeDeps();
    await expect(
      papers.create(PAPER_META, file({ mimetype: "image/png" }), "admin-1"),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(storage.uploadObject).not.toHaveBeenCalled();
  });

  it("IT-RES-003: SECURITY — accepts HTML bytes when the client declares application/pdf", async () => {
    const { papers, prisma, storage } = makeDeps();
    (prisma.questionPaper.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.questionPaper.create as jest.Mock).mockImplementation(({ data }) => ({
      ...data,
      id: "p1",
      createdAt: new Date(),
      updatedAt: new Date(),
      ingestionStatus: "not_ingested",
    }));

    // Content type is taken from the client's multipart header and never
    // checked against the actual bytes (no magic-number sniffing).
    const evil = file({
      mimetype: "application/pdf",
      originalname: "notes.pdf",
      buffer: Buffer.from("<html><script>alert(1)</script></html>"),
    });

    await expect(papers.create(PAPER_META, evil, "admin-1")).resolves.toBeDefined();
    expect(storage.uploadObject).toHaveBeenCalled();
    // The bogus type is then persisted and later forced onto the view URL.
    expect((prisma.questionPaper.create as jest.Mock).mock.calls[0][0].data.mimeType).toBe(
      "application/pdf",
    );
  });

  it("IT-RES-004: refuses a byte-identical duplicate via checksum", async () => {
    const { papers, prisma } = makeDeps();
    (prisma.questionPaper.findUnique as jest.Mock).mockResolvedValue({ id: "existing" });

    await expect(papers.create(PAPER_META, file(), "admin-1")).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("IT-RES-005: derives a namespaced storage key with a random component", async () => {
    const { papers, prisma, storage } = makeDeps();
    (prisma.questionPaper.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.questionPaper.create as jest.Mock).mockImplementation(({ data }) => ({
      ...data,
      id: "p1",
      createdAt: new Date(),
      updatedAt: new Date(),
      ingestionStatus: "not_ingested",
    }));

    await papers.create(PAPER_META, file(), "admin-1");
    const key = (storage.uploadObject as jest.Mock).mock.calls[0][1] as string;

    expect(key.startsWith(`${PAPER_META.subjectId}/${PAPER_META.academicYear}/`)).toBe(true);
    // A UUID prefix means two uploads of the same filename cannot collide.
    expect(key).toMatch(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-CN UT\.pdf$/,
    );
  });

  it("IT-RES-006: SECURITY — traversal sequences in the filename survive into the storage key", async () => {
    const { papers, prisma, storage } = makeDeps();
    (prisma.questionPaper.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.questionPaper.create as jest.Mock).mockImplementation(({ data }) => ({
      ...data,
      id: "p1",
      createdAt: new Date(),
      updatedAt: new Date(),
      ingestionStatus: "not_ingested",
    }));

    await papers.create(PAPER_META, file({ originalname: "../../etc/passwd.pdf" }), "admin-1");
    const key = (storage.uploadObject as jest.Mock).mock.calls[0][1] as string;

    // S3-compatible stores treat the key as an opaque string, so this does not
    // escape the bucket — but the sequence is stored unsanitized, which would
    // matter for any consumer that maps keys onto a filesystem path.
    expect(key).toContain("../../etc/passwd.pdf");
  });
});

describe("IT-RES notes upload", () => {
  it("IT-RES-007: accepts the documented office formats", async () => {
    const { notes, prisma } = makeDeps();
    (prisma.note.create as jest.Mock).mockImplementation(({ data }) => ({
      ...data,
      id: "n1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    for (const mimetype of [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ]) {
      await expect(
        notes.create(
          { subjectId: PAPER_META.subjectId, title: "Unit 2" },
          file({ mimetype }),
          "admin-1",
        ),
      ).resolves.toBeDefined();
    }
  });

  it("IT-RES-008: rejects an unsupported type for notes", async () => {
    const { notes, storage } = makeDeps();
    await expect(
      notes.create(
        { subjectId: PAPER_META.subjectId, title: "Unit 2" },
        file({ mimetype: "image/svg+xml" }),
        "admin-1",
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(storage.uploadObject).not.toHaveBeenCalled();
  });
});

describe("IT-RES URL issuance", () => {
  it("IT-RES-009: papers download/view 404 when the row does not exist", async () => {
    const { papers, prisma } = makeDeps();
    (prisma.questionPaper.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(papers.getDownloadUrl("missing")).rejects.toBeInstanceOf(NotFoundException);
    await expect(papers.getViewUrl("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("IT-RES-010: notes download/view 404 when the row does not exist", async () => {
    const { notes, prisma } = makeDeps();
    (prisma.note.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(notes.getDownloadUrl("missing")).rejects.toBeInstanceOf(NotFoundException);
    await expect(notes.getViewUrl("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("IT-RES-011: each resource presigns against its own bucket", async () => {
    const { papers, notes, prisma, fileUrls } = makeDeps();
    const row = { fileKey: "k", fileName: "f.pdf", mimeType: "application/pdf" };
    (prisma.questionPaper.findUnique as jest.Mock).mockResolvedValue(row);
    (prisma.note.findUnique as jest.Mock).mockResolvedValue(row);

    // Authenticated, so the free-paper lookup is skipped entirely.
    await papers.getViewUrl("p1", true);
    expect((fileUrls.getViewUrl as jest.Mock).mock.calls.at(-1)?.[0]).toBe("papers");

    await notes.getViewUrl("n1");
    expect((fileUrls.getViewUrl as jest.Mock).mock.calls.at(-1)?.[0]).toBe("notes");
  });
});

/**
 * IT-GATE — signed-out visitors get one free paper per semester.
 *
 * The rule is computed server-side so the lock the UI draws and the lock the API
 * enforces cannot drift. These tests pin both halves: the `locked` flag on the
 * DTO, and the hard refusal on the URL endpoints.
 */
describe("IT-GATE paper access gating", () => {
  // Full rows: the same findMany mock serves both freePaperIds() (which needs
  // the joined subject) and findAll() (which maps rows through toDto).
  const catalogueRow = (
    id: string,
    academicYear: number,
    department: string,
    semester: number,
  ) => ({
    id,
    subjectId: `${department}-${semester}`,
    examTypeId: "e1",
    academicYear,
    fileName: `${id}.pdf`,
    fileSizeBytes: 10,
    mimeType: "application/pdf",
    fileKey: "k",
    uploadStatus: "ready",
    ingestionStatus: "not_ingested",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    subject: { department, semester },
  });

  // Two departments x two semesters, newest-first within each group.
  const CATALOGUE = [
    catalogueRow("it4-new", 2026, "IT", 4),
    catalogueRow("it4-old", 2025, "IT", 4),
    catalogueRow("it3-new", 2026, "IT", 3),
    catalogueRow("cs4-new", 2026, "CS", 4),
    catalogueRow("cs4-old", 2024, "CS", 4),
  ];

  function gateDeps() {
    const d = makeDeps();
    // freePaperIds() reads the whole table; findMany is also used by findAll,
    // so it is pointed at the catalogue for both.
    (d.prisma.questionPaper.findMany as jest.Mock).mockResolvedValue(CATALOGUE);
    return d;
  }

  const paperRow = (id: string) => ({
    id,
    subjectId: "s1",
    examTypeId: "e1",
    academicYear: 2026,
    fileName: `${id}.pdf`,
    fileSizeBytes: 10,
    mimeType: "application/pdf",
    fileKey: "k",
    uploadStatus: "ready",
    ingestionStatus: "not_ingested",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it("IT-GATE-001: exactly one paper per (department, semester) is free", async () => {
    const { papers } = gateDeps();
    const dtos = await papers.findAll({}, false);

    const unlocked = dtos.filter((d) => !d.locked).map((d) => d.id).sort();
    // Newest in each group wins: IT/4, IT/3, CS/4 -> three groups, three frees.
    expect(unlocked).toEqual(["cs4-new", "it3-new", "it4-new"]);
    expect(dtos.filter((d) => d.locked).map((d) => d.id).sort()).toEqual(["cs4-old", "it4-old"]);
  });

  it("IT-GATE-002: nothing is locked for a logged-in caller", async () => {
    const { papers } = gateDeps();
    const dtos = await papers.findAll({}, true);
    expect(dtos.every((d) => d.locked === false)).toBe(true);
  });

  it("IT-GATE-003: the free paper is stable across calls (not order-dependent)", async () => {
    const { papers } = gateDeps();
    const first = (await papers.findAll({}, false)).filter((d) => !d.locked).map((d) => d.id);
    const second = (await papers.findAll({}, false)).filter((d) => !d.locked).map((d) => d.id);
    expect(first).toEqual(second);
  });

  it("IT-GATE-004: SECURITY — anonymous view/download of a locked paper is refused", async () => {
    const { papers, prisma, fileUrls } = gateDeps();
    (prisma.questionPaper.findUnique as jest.Mock).mockResolvedValue(paperRow("it4-old"));

    await expect(papers.getViewUrl("it4-old", false)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(papers.getDownloadUrl("it4-old", false)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    // No presigned URL may be minted for a refused request.
    expect(fileUrls.getViewUrl).not.toHaveBeenCalled();
    expect(fileUrls.getDownloadUrl).not.toHaveBeenCalled();
  });

  it("IT-GATE-005: anonymous access to the free paper is allowed", async () => {
    const { papers, prisma, fileUrls } = gateDeps();
    (prisma.questionPaper.findUnique as jest.Mock).mockResolvedValue(paperRow("it4-new"));

    await expect(papers.getViewUrl("it4-new", false)).resolves.toBeDefined();
    await expect(papers.getDownloadUrl("it4-new", false)).resolves.toBeDefined();
    expect(fileUrls.getViewUrl).toHaveBeenCalled();
  });

  it("IT-GATE-006: a logged-in caller may open a paper that is locked for visitors", async () => {
    const { papers, prisma } = gateDeps();
    (prisma.questionPaper.findUnique as jest.Mock).mockResolvedValue(paperRow("it4-old"));

    await expect(papers.getViewUrl("it4-old", true)).resolves.toBeDefined();
    await expect(papers.getDownloadUrl("it4-old", true)).resolves.toBeDefined();
  });

  it("IT-GATE-007: a missing paper still 404s rather than leaking the lock state", async () => {
    const { papers, prisma } = gateDeps();
    (prisma.questionPaper.findUnique as jest.Mock).mockResolvedValue(null);

    // 404 must win over 401 — otherwise the gate becomes an existence oracle
    // for ids that were never in the archive.
    await expect(papers.getViewUrl("does-not-exist", false)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

```

## backend\test\integration\whiteboard.presence.spec.ts

```ts
/**
 * IT-WB — the shared whiteboard's state machine, in StudyRoomsPresence.
 *
 * The rules worth pinning here are the ones that bite in a live room: an owner
 * whose tab crashes must not freeze the board, undo must never reach another
 * person's strokes, and an empty room must not lose its work the instant two
 * people happen to reload together.
 */
import { StudyRoomsPresence } from "../../src/modules/study-rooms/study-rooms.presence";
import {
  UserRole,
  WHITEBOARD_EMPTY_ROOM_GRACE_MS,
  WHITEBOARD_MAX_STROKES,
  type StudyRoomParticipantDto,
} from "@scholarbase/shared-types";

const ROOM = "room-1";

function participant(socketId: string, userId: string, fullName = userId): StudyRoomParticipantDto {
  return {
    socketId,
    userId,
    fullName,
    role: UserRole.STUDENT,
    isModerator: false,
    inCall: false,
    audioEnabled: false,
    videoEnabled: false,
    screenEnabled: false,
  };
}

/** Room with a host and a student already present. */
function roomWithTwo() {
  const presence = new StudyRoomsPresence();
  presence.add(ROOM, participant("sock-host", "user-host", "Host"));
  presence.add(ROOM, participant("sock-student", "user-student", "Student"));
  return presence;
}

afterEach(() => jest.useRealTimers());

describe("IT-WB board ownership", () => {
  it("IT-WB-001: the first claimant owns the board", () => {
    const p = roomWithTwo();
    expect(p.claimBoard(ROOM, "sock-host", "Host")).toBe(true);
    expect(p.isBoardOwner(ROOM, "sock-host")).toBe(true);
    expect(p.getBoard(ROOM)?.ownerName).toBe("Host");
  });

  it("IT-WB-002: a second person cannot take a board that is actively owned", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");

    expect(p.claimBoard(ROOM, "sock-student", "Student")).toBe(false);
    expect(p.isBoardOwner(ROOM, "sock-host")).toBe(true);
  });

  it("IT-WB-003: re-claiming your own board is a no-op, not a failure", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    expect(p.claimBoard(ROOM, "sock-host", "Host")).toBe(true);
  });

  it("IT-WB-004: a board held by a socket that has left can be claimed (crashed-owner recovery)", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");

    // Host's tab dies without releasing.
    p.remove(ROOM, "sock-host");

    expect(p.claimBoard(ROOM, "sock-student", "Student")).toBe(true);
    expect(p.isBoardOwner(ROOM, "sock-student")).toBe(true);
  });

  it("IT-WB-005: releasing keeps the strokes — it hands over the pen, it does not erase", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    p.appendStroke(
      ROOM,
      { id: "s1", authorId: "user-host", authorName: "Host", color: "#000", width: 2 },
      [0.1, 0.1, 0.2, 0.2],
    );

    p.releaseBoard(ROOM, "sock-host");

    expect(p.getBoard(ROOM)?.ownerSocketId).toBeNull();
    expect(p.getBoard(ROOM)?.strokes).toHaveLength(1);
  });

  it("IT-WB-006: grants are dropped when the owner leaves — they were the owner's to give", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    p.setGrant(ROOM, "user-student", true);
    expect(p.canDraw(ROOM, "sock-student", "user-student")).toBe(true);

    p.releaseBoard(ROOM, "sock-host");

    expect(p.canDraw(ROOM, "sock-student", "user-student")).toBe(false);
  });

  it("IT-WB-007: releasing a board you do not own does nothing", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");

    p.releaseBoard(ROOM, "sock-student");

    expect(p.isBoardOwner(ROOM, "sock-host")).toBe(true);
  });
});

describe("IT-WB draw permission", () => {
  it("IT-WB-008: the owner may always draw", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    expect(p.canDraw(ROOM, "sock-host", "user-host")).toBe(true);
  });

  it("IT-WB-009: everyone else is refused until granted, and again once revoked", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");

    expect(p.canDraw(ROOM, "sock-student", "user-student")).toBe(false);

    p.setGrant(ROOM, "user-student", true);
    expect(p.canDraw(ROOM, "sock-student", "user-student")).toBe(true);

    p.setGrant(ROOM, "user-student", false);
    expect(p.canDraw(ROOM, "sock-student", "user-student")).toBe(false);
  });

  it("IT-WB-010: nobody can draw on a room that has no board", () => {
    const p = roomWithTwo();
    expect(p.canDraw(ROOM, "sock-host", "user-host")).toBe(false);
  });
});

describe("IT-WB strokes", () => {
  it("IT-WB-011: chunks with the same id extend one stroke rather than creating many", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    const meta = { id: "s1", authorId: "user-host", authorName: "Host", color: "#000", width: 2 };

    p.appendStroke(ROOM, meta, [0.1, 0.1]);
    p.appendStroke(ROOM, meta, [0.2, 0.2]);

    const strokes = p.getBoard(ROOM)!.strokes;
    expect(strokes).toHaveLength(1);
    expect(strokes[0].points).toEqual([0.1, 0.1, 0.2, 0.2]);
  });

  it("IT-WB-012: SECURITY — you cannot extend somebody else's stroke", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    p.appendStroke(
      ROOM,
      { id: "s1", authorId: "user-host", authorName: "Host", color: "#000", width: 2 },
      [0.1, 0.1],
    );

    const hijack = p.appendStroke(
      ROOM,
      { id: "s1", authorId: "user-student", authorName: "Student", color: "#f00", width: 9 },
      [0.9, 0.9],
    );

    expect(hijack).toBe(false);
    expect(p.getBoard(ROOM)!.strokes[0].points).toEqual([0.1, 0.1]);
  });

  it("IT-WB-013: undo removes only the caller's most recent stroke", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    p.setGrant(ROOM, "user-student", true);

    const add = (id: string, authorId: string) =>
      p.appendStroke(ROOM, { id, authorId, authorName: authorId, color: "#000", width: 2 }, [0, 0]);

    add("host-1", "user-host");
    add("student-1", "user-student");
    add("host-2", "user-host");

    // The newest stroke overall is the student's? No — host-2 is. But the
    // student's undo must still take student-1, not the newest on the board.
    expect(p.undoLastStroke(ROOM, "user-student")).toBe("student-1");
    expect(p.getBoard(ROOM)!.strokes.map((s) => s.id)).toEqual(["host-1", "host-2"]);
  });

  it("IT-WB-014: undo with nothing of your own returns undefined and changes nothing", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    p.appendStroke(
      ROOM,
      { id: "s1", authorId: "user-host", authorName: "Host", color: "#000", width: 2 },
      [0, 0],
    );

    expect(p.undoLastStroke(ROOM, "user-student")).toBeUndefined();
    expect(p.getBoard(ROOM)!.strokes).toHaveLength(1);
  });

  it("IT-WB-015: the stroke buffer is bounded, dropping oldest first", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");

    for (let i = 0; i < WHITEBOARD_MAX_STROKES + 25; i += 1) {
      p.appendStroke(
        ROOM,
        { id: `s${i}`, authorId: "user-host", authorName: "Host", color: "#000", width: 2 },
        [0, 0],
      );
    }

    const strokes = p.getBoard(ROOM)!.strokes;
    expect(strokes).toHaveLength(WHITEBOARD_MAX_STROKES);
    expect(strokes[0].id).toBe("s25");
  });

  it("IT-WB-016: clear empties the strokes but keeps the board and its owner", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    p.appendStroke(
      ROOM,
      { id: "s1", authorId: "user-host", authorName: "Host", color: "#000", width: 2 },
      [0, 0],
    );

    p.clearStrokes(ROOM);

    expect(p.getBoard(ROOM)!.strokes).toHaveLength(0);
    expect(p.isBoardOwner(ROOM, "sock-host")).toBe(true);
  });
});

describe("IT-WB empty-room lifecycle", () => {
  it("IT-WB-017: the board survives the room emptying, until the grace period elapses", () => {
    jest.useFakeTimers();
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    p.appendStroke(
      ROOM,
      { id: "s1", authorId: "user-host", authorName: "Host", color: "#000", width: 2 },
      [0, 0],
    );

    p.remove(ROOM, "sock-host");
    p.remove(ROOM, "sock-student");
    expect(p.count(ROOM)).toBe(0);
    // Still there a moment after everyone left.
    expect(p.getBoard(ROOM)?.strokes).toHaveLength(1);

    jest.advanceTimersByTime(WHITEBOARD_EMPTY_ROOM_GRACE_MS + 1000);
    expect(p.getBoard(ROOM)).toBeUndefined();
  });

  it("IT-WB-018: rejoining inside the grace window saves the board (the reload case)", () => {
    jest.useFakeTimers();
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");
    p.appendStroke(
      ROOM,
      { id: "s1", authorId: "user-host", authorName: "Host", color: "#000", width: 2 },
      [0, 0],
    );

    p.remove(ROOM, "sock-host");
    p.remove(ROOM, "sock-student");

    // Everyone reloaded at once and came back before the timer fired.
    jest.advanceTimersByTime(WHITEBOARD_EMPTY_ROOM_GRACE_MS / 2);
    p.add(ROOM, participant("sock-host-2", "user-host", "Host"));

    jest.advanceTimersByTime(WHITEBOARD_EMPTY_ROOM_GRACE_MS + 1000);

    expect(p.getBoard(ROOM)?.strokes).toHaveLength(1);
  });

  it("IT-WB-019: closing the room drops the board immediately, with no grace period", () => {
    jest.useFakeTimers();
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");

    // A closed room is not coming back, unlike everyone happening to leave.
    p.clearRoom(ROOM);

    expect(p.getBoard(ROOM)).toBeUndefined();
  });

  it("IT-WB-020: a disconnect releases the board across every room the socket was in", () => {
    const p = roomWithTwo();
    p.claimBoard(ROOM, "sock-host", "Host");

    p.removeSocketEverywhere("sock-host");

    // Student is still present, so the board lives on — just unowned.
    expect(p.getBoard(ROOM)?.ownerSocketId).toBeNull();
    expect(p.claimBoard(ROOM, "sock-student", "Student")).toBe(true);
  });
});

```

## backend\test\jest.setup.ts

```ts
/**
 * Mirrors the first line of src/main.ts. class-transformer's @Type decorator
 * reads design-time type metadata via Reflect.getMetadata, which only exists
 * once this polyfill is loaded — without it, importing any DTO throws.
 */
import "reflect-metadata";

```

## backend\test\unit\dto-validation.spec.ts

```ts
/**
 * UT-DTO — Request DTO validation and transformation
 *
 * These DTOs are the app's input-validation boundary: main.ts registers a
 * global ValidationPipe with whitelist + forbidNonWhitelisted, so whatever
 * these classes declare is exactly what the API will accept. Treated here as a
 * security control, not just ergonomics.
 */
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { MIN_PASSWORD_LENGTH } from "@scholarbase/shared-types";
import { SignupDto } from "../../src/modules/auth/dto/signup.dto";
import { LoginDto } from "../../src/modules/auth/dto/login.dto";
import { ForgotPasswordDto } from "../../src/modules/auth/dto/forgot-password.dto";
import { ResetPasswordDto } from "../../src/modules/auth/dto/reset-password.dto";
import { FindPapersQueryDto } from "../../src/modules/papers/dto/find-papers-query.dto";
import { FindMessagesQueryDto } from "../../src/modules/study-rooms/dto/find-messages-query.dto";
import { CreateQuestionPaperBodyDto } from "../../src/modules/papers/dto/create-question-paper.dto";

/** Returns the set of failing property names for a plain input. */
async function failingProps<T extends object>(
  cls: new () => T,
  plain: Record<string, unknown>,
): Promise<string[]> {
  const instance = plainToInstance(cls, plain);
  const errors = await validate(instance as object);
  return errors.map((e) => e.property).sort();
}

describe("UT-DTO SignupDto", () => {
  it("UT-DTO-001: normalizes email to trimmed lowercase before validation", () => {
    const dto = plainToInstance(SignupDto, {
      email: "  Student@YourUniversity.EDU.in  ",
      password: "correct horse battery",
      fullName: "A Student",
    });
    expect(dto.email).toBe("student@youruniversity.edu.in");
  });

  it("UT-DTO-002: rejects malformed email addresses", async () => {
    for (const email of ["not-an-email", "a@", "@b.com", "a b@c.com", ""]) {
      const props = await failingProps(SignupDto, {
        email,
        password: "correct horse battery",
        fullName: "A Student",
      });
      expect(props).toContain("email");
    }
  });

  it("UT-DTO-003: enforces a minimum password length", async () => {
    const short = await failingProps(SignupDto, {
      email: "a@b.com",
      password: "1234567",
      fullName: "A",
    });
    expect(short).toContain("password");

    const ok = await failingProps(SignupDto, {
      email: "a@b.com",
      password: "12345678",
      fullName: "A",
    });
    expect(ok).not.toContain("password");
  });

  it("UT-DTO-004: rejects an empty full name", async () => {
    const props = await failingProps(SignupDto, {
      email: "a@b.com",
      password: "12345678",
      fullName: "",
    });
    expect(props).toContain("fullName");
  });

  it("UT-DTO-005: signup's password floor agrees with the shared MIN_PASSWORD_LENGTH constant", async () => {
    // Signup hardcodes MinLength(8) while the reset form uses the shared
    // constant. This test fails loudly if the two ever drift apart.
    const atConstant = await failingProps(SignupDto, {
      email: "a@b.com",
      password: "x".repeat(MIN_PASSWORD_LENGTH),
      fullName: "A",
    });
    expect(atConstant).not.toContain("password");

    const belowConstant = await failingProps(SignupDto, {
      email: "a@b.com",
      password: "x".repeat(MIN_PASSWORD_LENGTH - 1),
      fullName: "A",
    });
    expect(belowConstant).toContain("password");
  });

  it("UT-DTO-006: does not enforce any password complexity (documents current policy)", async () => {
    // Length is the only rule — "password" and "12345678" are accepted.
    const props = await failingProps(SignupDto, {
      email: "a@b.com",
      password: "12345678",
      fullName: "A",
    });
    expect(props).not.toContain("password");
  });
});

describe("UT-DTO LoginDto", () => {
  it("UT-DTO-007: normalizes email so login is case-insensitive", () => {
    const dto = plainToInstance(LoginDto, { email: " ADMIN@X.COM ", password: "p" });
    expect(dto.email).toBe("admin@x.com");
  });
});

describe("UT-DTO password reset DTOs", () => {
  it("UT-DTO-008: ForgotPasswordDto requires a valid email", async () => {
    expect(await failingProps(ForgotPasswordDto, { email: "nope" })).toContain("email");
    expect(await failingProps(ForgotPasswordDto, { email: "a@b.com" })).toHaveLength(0);
  });

  it("UT-DTO-009: ResetPasswordDto rejects an empty token", async () => {
    const props = await failingProps(ResetPasswordDto, {
      token: "",
      password: "x".repeat(MIN_PASSWORD_LENGTH),
    });
    expect(props).toContain("token");
  });

  it("UT-DTO-010: ResetPasswordDto enforces MIN_PASSWORD_LENGTH", async () => {
    const props = await failingProps(ResetPasswordDto, {
      token: "abc",
      password: "x".repeat(MIN_PASSWORD_LENGTH - 1),
    });
    expect(props).toContain("password");
  });

  it("UT-DTO-011: ForgotPasswordDto does not normalize case (asymmetry with login/signup)", () => {
    // Signup and Login carry @Transform; ForgotPassword does not. The service
    // lowercases defensively, so this is currently compensated for downstream.
    const dto = plainToInstance(ForgotPasswordDto, { email: "  MiXeD@Case.com " });
    expect(dto.email).toBe("  MiXeD@Case.com ");
  });
});

describe("UT-DTO query DTOs", () => {
  it("UT-DTO-012: coerces a numeric query string to a number", async () => {
    const dto = plainToInstance(FindPapersQueryDto, { academicYear: "2026" });
    expect(dto.academicYear).toBe(2026);
    expect(await validate(dto)).toHaveLength(0);
  });

  it("UT-DTO-013: treats an empty query value as absent rather than 0", async () => {
    const dto = plainToInstance(FindPapersQueryDto, { academicYear: "" });
    expect(dto.academicYear).toBeUndefined();
    expect(await validate(dto)).toHaveLength(0);
  });

  it("UT-DTO-014: rejects a non-numeric year instead of silently filtering by NaN", async () => {
    const dto = plainToInstance(FindPapersQueryDto, { academicYear: "abc" });
    const errors = await validate(dto);
    expect(errors.map((e) => e.property)).toContain("academicYear");
  });

  it("UT-DTO-015: rejects a non-UUID subjectId (prevents raw values reaching Prisma)", async () => {
    const props = await failingProps(FindPapersQueryDto, { subjectId: "1 OR 1=1" });
    expect(props).toContain("subjectId");
  });

  it("UT-DTO-016: enforces message limit boundaries 1..200", async () => {
    expect(await failingProps(FindMessagesQueryDto, { limit: "1" })).toHaveLength(0);
    expect(await failingProps(FindMessagesQueryDto, { limit: "200" })).toHaveLength(0);
    expect(await failingProps(FindMessagesQueryDto, { limit: "201" })).toContain("limit");
    // "0" is truthy-string -> Number("0") === 0 -> fails @Min(1) as intended.
    expect(await failingProps(FindMessagesQueryDto, { limit: "0" })).toContain("limit");
  });

  it("UT-DTO-017: enforces academic-year sanity bounds on upload", async () => {
    const base = {
      subjectId: "3f7c1e2a-0b5d-4c6e-9a1b-2c3d4e5f6a7b",
      examTypeId: "4f7c1e2a-0b5d-4c6e-9a1b-2c3d4e5f6a7b",
    };
    expect(await failingProps(CreateQuestionPaperBodyDto, { ...base, academicYear: "1999" })).toContain(
      "academicYear",
    );
    expect(await failingProps(CreateQuestionPaperBodyDto, { ...base, academicYear: "2101" })).toContain(
      "academicYear",
    );
    expect(
      await failingProps(CreateQuestionPaperBodyDto, { ...base, academicYear: "2026" }),
    ).toHaveLength(0);
  });
});

```

## backend\test\unit\duration.spec.ts

```ts
/**
 * UT-DUR — parseDurationMs (src/common/utils/duration.ts)
 *
 * This helper converts JWT_REFRESH_TTL into the refresh-token expiry that is
 * written to the database, so a silent mis-parse here would either expire
 * sessions immediately or keep them alive far longer than intended.
 */
import { parseDurationMs } from "../../src/common/utils/duration";

describe("UT-DUR parseDurationMs", () => {
  it("UT-DUR-001: converts each supported unit to milliseconds", () => {
    expect(parseDurationMs("45s")).toBe(45_000);
    expect(parseDurationMs("15m")).toBe(900_000);
    expect(parseDurationMs("12h")).toBe(43_200_000);
    expect(parseDurationMs("30d")).toBe(2_592_000_000);
  });

  it("UT-DUR-002: parses the production defaults used by the app", () => {
    // Defaults hardcoded in AuthService when the env var is absent.
    expect(parseDurationMs("30d")).toBe(30 * 86_400_000);
  });

  it("UT-DUR-003: tolerates surrounding whitespace", () => {
    expect(parseDurationMs("  15m  ")).toBe(900_000);
  });

  it("UT-DUR-004: tolerates internal whitespace between amount and unit", () => {
    expect(parseDurationMs("15 m")).toBe(900_000);
  });

  it("UT-DUR-005: rejects malformed values rather than silently defaulting", () => {
    expect(() => parseDurationMs("")).toThrow(/Invalid duration/);
    expect(() => parseDurationMs("15")).toThrow(/Invalid duration/);
    expect(() => parseDurationMs("m")).toThrow(/Invalid duration/);
    expect(() => parseDurationMs("15w")).toThrow(/Invalid duration/);
    expect(() => parseDurationMs("-5m")).toThrow(/Invalid duration/);
    expect(() => parseDurationMs("1.5h")).toThrow(/Invalid duration/);
    expect(() => parseDurationMs("15m30s")).toThrow(/Invalid duration/);
  });

  it("UT-DUR-006: accepts zero without throwing (boundary)", () => {
    expect(parseDurationMs("0m")).toBe(0);
  });
});

```

## backend\test\unit\mesh-negotiation.spec.ts

```ts
/**
 * UT-MESH — who offers to whom when several people join a call at once.
 *
 * This pins down the fix for the "3-2-1" report from a live session: with three
 * students on a call, one saw everyone, one saw two, one saw only themselves.
 * It was never a network problem — they were on the same Wi-Fi — it was the
 * offer/answer protocol.
 *
 * The old rule was "whoever joins offers to everyone already in the call".
 * Each client announces `inCall: true` *before* building its offer list, so
 * when two people click Join within a few milliseconds each can see the other
 * as already in the call, and both send an offer. The second offer lands while
 * the receiver is in `have-local-offer`, setRemoteDescription throws
 * InvalidStateError, and — with no try/catch and no retry anywhere — that pair
 * stayed dead for the rest of the session.
 *
 * The logic is pure, so it is modelled here rather than driven through real
 * peer connections.
 */

type SocketId = string;

/** What one client currently believes about the others. */
interface ClientView {
  self: SocketId;
  /** Peers this client has seen announce `inCall` so far. */
  seesInCall: Set<SocketId>;
}

const pairKey = (a: SocketId, b: SocketId) => [a, b].sort().join("|");

/** Old rule: offer to everyone you can see is already on the call. */
function offersUnderOldRule(view: ClientView): SocketId[] {
  return [...view.seesInCall].filter((peer) => peer !== view.self);
}

/** New rule: the lower socket id is the only one that offers. */
function offersUnderNewRule(view: ClientView, connected: Set<string>): SocketId[] {
  return [...view.seesInCall].filter(
    (peer) =>
      peer !== view.self &&
      !connected.has(pairKey(view.self, peer)) &&
      view.self < peer,
  );
}

interface RoundResult {
  connected: Set<string>;
  glared: Set<string>;
  offerCounts: Map<string, number>;
}

function runRound(
  views: ClientView[],
  rule: "old" | "new",
  connected: Set<string>,
): RoundResult {
  const offerCounts = new Map<string, number>();

  for (const view of views) {
    const targets =
      rule === "old" ? offersUnderOldRule(view) : offersUnderNewRule(view, connected);
    for (const target of targets) {
      const key = pairKey(view.self, target);
      offerCounts.set(key, (offerCounts.get(key) ?? 0) + 1);
    }
  }

  const nextConnected = new Set(connected);
  const glared = new Set<string>();
  for (const [key, count] of offerCounts) {
    // Exactly one offer negotiates cleanly. Two is glare: both sides are in
    // have-local-offer and the connection dies.
    if (count === 1) nextConnected.add(key);
    else if (count >= 2) glared.add(key);
  }

  return { connected: nextConnected, glared, offerCounts };
}

/** Three students, ids chosen so ordering is unambiguous. */
const A = "aaa-socket";
const B = "bbb-socket";
const C = "ccc-socket";

/** Everyone has heard everyone — the state a moment after simultaneous joins. */
function fullVisibility(): ClientView[] {
  return [
    { self: A, seesInCall: new Set([A, B, C]) },
    { self: B, seesInCall: new Set([A, B, C]) },
    { self: C, seesInCall: new Set([A, B, C]) },
  ];
}

/**
 * The real 3-2-1 shape: media-state frames are still in flight, so each client
 * has a different idea of who is on the call. A and B heard each other; C's
 * announcement went out but C has not yet heard anyone.
 */
function partialVisibility(): ClientView[] {
  return [
    { self: A, seesInCall: new Set([A, B, C]) },
    { self: B, seesInCall: new Set([A, B, C]) },
    { self: C, seesInCall: new Set([C]) }, // heard nobody yet
  ];
}

/**
 * The one case the id rule alone does not settle: the side that owes the offer
 * is the side that has not heard about its peer.
 */
function initiatorBlind(): ClientView[] {
  return [
    { self: A, seesInCall: new Set([A]) }, // A owes B an offer but cannot see B
    { self: B, seesInCall: new Set([A, B]) },
  ];
}

const ALL_PAIRS = [pairKey(A, B), pairKey(A, C), pairKey(B, C)];

describe("UT-MESH the old rule reproduces the failure", () => {
  it("UT-MESH-001: simultaneous joins make BOTH sides offer — glare on every pair", () => {
    const { glared, connected } = runRound(fullVisibility(), "old", new Set());

    // Every pair collides: this is the bug, not an edge case.
    expect([...glared].sort()).toEqual([...ALL_PAIRS].sort());
    expect(connected.size).toBe(0);
  });

  it("UT-MESH-002: with frames still in flight, one pair dies while the others work", () => {
    const { connected, glared, offerCounts } = runRound(partialVisibility(), "old", new Set());

    // A and B saw each other, so both offered -> collision -> that pair is dead.
    expect(glared.has(pairKey(A, B))).toBe(true);
    expect(offerCounts.get(pairKey(A, B))).toBe(2);

    // C heard nobody, so only one side offered to it and those pairs happen to
    // survive. The result is precisely the asymmetry the students reported:
    // C sees both, while A and B cannot see each other.
    expect(connected.has(pairKey(A, C))).toBe(true);
    expect(connected.has(pairKey(B, C))).toBe(true);
  });

  it("UT-MESH-003: retrying cannot save it — the rule itself has no arbitration", () => {
    // Even if the old code HAD retried (it did not: no timer, no
    // participant-change handler, no failure recovery), the same two clients
    // would collide again every single time.
    const first = runRound(partialVisibility(), "old", new Set());
    const second = runRound(fullVisibility(), "old", first.connected);

    expect(second.glared.has(pairKey(A, B))).toBe(true);
    expect(second.offerCounts.get(pairKey(A, B))).toBe(2);
  });
});

describe("UT-MESH the id rule removes glare by construction", () => {
  it("UT-MESH-004: with everyone visible, every pair gets exactly one offer", () => {
    const { connected, glared, offerCounts } = runRound(fullVisibility(), "new", new Set());

    expect(glared.size).toBe(0);
    expect([...connected].sort()).toEqual([...ALL_PAIRS].sort());
    for (const key of ALL_PAIRS) expect(offerCounts.get(key)).toBe(1);
  });

  it("UT-MESH-005: no pair can ever double-offer, whoever clicks first", () => {
    // Both orderings of the same pair resolve to one offerer.
    const both: ClientView[] = [
      { self: A, seesInCall: new Set([A, B]) },
      { self: B, seesInCall: new Set([A, B]) },
    ];
    const { offerCounts } = runRound(both, "new", new Set());
    expect(offerCounts.get(pairKey(A, B))).toBe(1);
  });

  it("UT-MESH-006: the same in-flight state that broke the old rule now connects everything", () => {
    const { connected, glared } = runRound(partialVisibility(), "new", new Set());

    // Identical inputs to UT-MESH-002, which lost the A<->B pair.
    expect(glared.size).toBe(0);
    expect([...connected].sort()).toEqual([...ALL_PAIRS].sort());
  });

  it("UT-MESH-006b: a pair whose initiator is still blind is pending, not broken", () => {
    const first = runRound(initiatorBlind(), "new", new Set());

    // A owes the offer but has not heard about B, so nothing happens yet —
    // crucially, nothing is destroyed either.
    expect(first.glared.size).toBe(0);
    expect(first.connected.size).toBe(0);

    // Once A hears about B, the reconcile pass closes it.
    const views: ClientView[] = [
      { self: A, seesInCall: new Set([A, B]) },
      { self: B, seesInCall: new Set([A, B]) },
    ];
    const second = runRound(views, "new", first.connected);
    expect(second.connected.has(pairKey(A, B))).toBe(true);
  });

  it("UT-MESH-007: reconciliation completes the mesh on the next pass", () => {
    // Round 1 with frames in flight, round 2 once everyone has heard everyone —
    // which is what the participant-change and interval passes now guarantee.
    const first = runRound(partialVisibility(), "new", new Set());
    const second = runRound(fullVisibility(), "new", first.connected);

    expect(second.glared.size).toBe(0);
    expect([...second.connected].sort()).toEqual([...ALL_PAIRS].sort());
  });

  it("UT-MESH-008: reconciling again is idempotent — no duplicate offers", () => {
    const first = runRound(fullVisibility(), "new", new Set());
    const second = runRound(fullVisibility(), "new", first.connected);

    // Already-connected pairs are skipped, so a 3-second timer cannot spam
    // offers at a healthy mesh.
    expect(second.offerCounts.size).toBe(0);
    expect([...second.connected].sort()).toEqual([...ALL_PAIRS].sort());
  });

  it("UT-MESH-009: scales — a room of six has one offerer per pair and no glare", () => {
    const ids = ["s1", "s2", "s3", "s4", "s5", "s6"];
    const views: ClientView[] = ids.map((self) => ({ self, seesInCall: new Set(ids) }));

    const { connected, glared, offerCounts } = runRound(views, "new", new Set());

    // 6 people -> 15 pairs, each negotiated exactly once.
    expect(glared.size).toBe(0);
    expect(connected.size).toBe(15);
    for (const count of offerCounts.values()) expect(count).toBe(1);
  });
});

```

## backend\test\unit\storage.service.spec.ts

```ts
/**
 * UT-STO — StorageService presigned-URL construction
 *
 * These are security-relevant: the file name is attacker-influenced (it is the
 * uploader's original filename, stored verbatim) and gets interpolated into a
 * Content-Disposition header value. A quote or CRLF that survived would let the
 * uploader break out of the quoted string / inject a header.
 *
 * The minio client is mocked so no network or object storage is required.
 */
const mockPresignedGetObject = jest.fn().mockResolvedValue("https://example.test/signed");
const mockPutObject = jest.fn().mockResolvedValue(undefined);
const mockRemoveObject = jest.fn().mockResolvedValue(undefined);

jest.mock("minio", () => ({
  Client: jest.fn().mockImplementation(() => ({
    presignedGetObject: mockPresignedGetObject,
    putObject: mockPutObject,
    removeObject: mockRemoveObject,
    bucketExists: jest.fn().mockResolvedValue(true),
    makeBucket: jest.fn().mockResolvedValue(undefined),
  })),
}));

import { ConfigService } from "@nestjs/config";
import { StorageService, PAPERS_BUCKET } from "../../src/modules/storage/storage.service";

function makeService(overrides: Record<string, string> = {}) {
  const values: Record<string, string> = {
    MINIO_ENDPOINT: "localhost",
    MINIO_PORT: "9000",
    MINIO_USE_SSL: "false",
    MINIO_ROOT_USER: "test-user",
    MINIO_ROOT_PASSWORD: "test-password",
    ...overrides,
  };
  const config = {
    get: (key: string, def?: string) => values[key] ?? def,
    getOrThrow: (key: string) => {
      if (values[key] === undefined) throw new Error(`missing ${key}`);
      return values[key];
    },
  } as unknown as ConfigService;
  return new StorageService(config);
}

/** Pulls the response-header override object passed to presignedGetObject. */
function lastHeaders(): Record<string, string> {
  const call = mockPresignedGetObject.mock.calls.at(-1);
  return call?.[3] as Record<string, string>;
}

describe("UT-STO StorageService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("UT-STO-001: download URL requests an attachment disposition", async () => {
    const svc = makeService();
    await svc.getPresignedDownloadUrl(PAPERS_BUCKET, "key.pdf", "DBMS UT.pdf");
    expect(lastHeaders()["response-content-disposition"]).toBe(
      'attachment; filename="DBMS UT.pdf"',
    );
  });

  it("UT-STO-002: view URL requests an inline disposition and pins the content type", async () => {
    const svc = makeService();
    await svc.getPresignedViewUrl(PAPERS_BUCKET, "key.pdf", "DBMS UT.pdf", "application/pdf");
    expect(lastHeaders()["response-content-disposition"]).toBe('inline; filename="DBMS UT.pdf"');
    expect(lastHeaders()["response-content-type"]).toBe("application/pdf");
  });

  it("UT-STO-003: neutralizes a double quote so the filename cannot escape the quoted string", async () => {
    const svc = makeService();
    await svc.getPresignedViewUrl(
      PAPERS_BUCKET,
      "key.pdf",
      'evil".pdf',
      "application/pdf",
    );
    const disposition = lastHeaders()["response-content-disposition"];
    // Exactly two quotes: the opening and closing delimiters, none from input.
    expect(disposition.match(/"/g)).toHaveLength(2);
    expect(disposition).toBe('inline; filename="evil_.pdf"');
  });

  it("UT-STO-004: neutralizes CR and LF so a header cannot be injected", async () => {
    const svc = makeService();
    await svc.getPresignedDownloadUrl(
      PAPERS_BUCKET,
      "key.pdf",
      "a.pdf\r\nX-Injected: yes",
    );
    const disposition = lastHeaders()["response-content-disposition"];
    expect(disposition).not.toMatch(/[\r\n]/);
    expect(disposition).not.toContain("X-Injected: yes\r");
    expect(disposition).toBe('attachment; filename="a.pdf__X-Injected: yes"');
  });

  it("UT-STO-005: neutralizes backslash escapes", async () => {
    const svc = makeService();
    await svc.getPresignedDownloadUrl(PAPERS_BUCKET, "key.pdf", 'a\\".pdf');
    expect(lastHeaders()["response-content-disposition"]).toBe('attachment; filename="a__.pdf"');
  });

  it("UT-STO-006: does NOT encode non-ASCII filenames (documents known defect QA-004)", async () => {
    const svc = makeService();
    await svc.getPresignedDownloadUrl(PAPERS_BUCKET, "key.pdf", "物理学ノート.pdf");
    const disposition = lastHeaders()["response-content-disposition"];
    // HTTP header values are ISO-8859-1; these code points are passed through
    // raw rather than RFC 5987 encoded (filename*=UTF-8''...).
    expect(disposition).toContain("物理学ノート.pdf");
    // eslint-disable-next-line no-control-regex
    expect(/^[\x00-\xFF]*$/.test(disposition)).toBe(false);
  });

  it("UT-STO-007: applies the documented default expiries (5 min download, 30 min view)", async () => {
    const svc = makeService();
    const dl = await svc.getPresignedDownloadUrl(PAPERS_BUCKET, "k", "f.pdf");
    expect(mockPresignedGetObject.mock.calls.at(-1)?.[2]).toBe(300);
    const view = await svc.getPresignedViewUrl(PAPERS_BUCKET, "k", "f.pdf", "application/pdf");
    expect(mockPresignedGetObject.mock.calls.at(-1)?.[2]).toBe(1800);

    // expiresAt must line up with the requested window, not the default.
    expect(dl.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(view.expiresAt.getTime()).toBeGreaterThan(dl.expiresAt.getTime());
  });

  it("UT-STO-008: resolves logical bucket names through env overrides", async () => {
    const svc = makeService({ MINIO_BUCKET_PAPERS: "prod-papers" });
    await svc.getPresignedDownloadUrl(PAPERS_BUCKET, "k", "f.pdf");
    expect(mockPresignedGetObject.mock.calls.at(-1)?.[0]).toBe("prod-papers");
  });
});

```

## backend\test\unit\stored-file-url.service.spec.ts

```ts
/**
 * UT-SFU — StoredFileUrlService
 *
 * The shared presign/DTO-shaping layer that papers and notes both delegate to.
 * Its contract is that the bucket and the record's own fields are forwarded
 * unchanged, and that dates are serialized as ISO strings for the wire.
 */
import { StoredFileUrlService } from "../../src/modules/storage/stored-file-url.service";
import type { StorageService } from "../../src/modules/storage/storage.service";

const EXPIRES = new Date("2026-01-01T00:30:00.000Z");

function makeStorage() {
  return {
    getPresignedDownloadUrl: jest
      .fn()
      .mockResolvedValue({ url: "https://example.test/dl", expiresAt: EXPIRES }),
    getPresignedViewUrl: jest
      .fn()
      .mockResolvedValue({ url: "https://example.test/view", expiresAt: EXPIRES }),
  } as unknown as StorageService;
}

const RECORD = {
  fileKey: "subject-id/2026/uuid-CN UT.pdf",
  fileName: "CN UT.pdf",
  mimeType: "application/pdf",
};

describe("UT-SFU StoredFileUrlService", () => {
  it("UT-SFU-001: forwards bucket and file key to the storage layer for downloads", async () => {
    const storage = makeStorage();
    const svc = new StoredFileUrlService(storage);

    await svc.getDownloadUrl("papers", RECORD);

    expect(storage.getPresignedDownloadUrl).toHaveBeenCalledWith(
      "papers",
      RECORD.fileKey,
      RECORD.fileName,
    );
  });

  it("UT-SFU-002: forwards the mime type for views (required to render inline)", async () => {
    const storage = makeStorage();
    const svc = new StoredFileUrlService(storage);

    await svc.getViewUrl("notes", RECORD);

    expect(storage.getPresignedViewUrl).toHaveBeenCalledWith(
      "notes",
      RECORD.fileKey,
      RECORD.fileName,
      RECORD.mimeType,
    );
  });

  it("UT-SFU-003: serializes expiry as an ISO string in the download DTO", async () => {
    const svc = new StoredFileUrlService(makeStorage());
    const dto = await svc.getDownloadUrl("papers", RECORD);

    expect(dto).toEqual({
      url: "https://example.test/dl",
      expiresAt: "2026-01-01T00:30:00.000Z",
    });
    // Download DTO must NOT leak the storage key.
    expect(JSON.stringify(dto)).not.toContain(RECORD.fileKey);
  });

  it("UT-SFU-004: view DTO carries the metadata the viewer needs, and no storage key", async () => {
    const svc = new StoredFileUrlService(makeStorage());
    const dto = await svc.getViewUrl("papers", RECORD);

    expect(dto).toEqual({
      url: "https://example.test/view",
      expiresAt: "2026-01-01T00:30:00.000Z",
      fileName: "CN UT.pdf",
      mimeType: "application/pdf",
    });
    expect(JSON.stringify(dto)).not.toContain(RECORD.fileKey);
  });

  it("UT-SFU-005: is agnostic to the record's concrete model (structural typing)", async () => {
    const storage = makeStorage();
    const svc = new StoredFileUrlService(storage);

    // A row carrying extra columns (as a real Prisma model does) is accepted,
    // and the extra columns must not leak into the response DTO.
    const noteRow = { ...RECORD, id: "n1", title: "Unit 2", uploadedById: "u1" };
    const dto = await svc.getViewUrl("notes", noteRow);

    expect(Object.keys(dto).sort()).toEqual(["expiresAt", "fileName", "mimeType", "url"]);
  });
});

```

## backend\test\unit\video-content-rect.spec.ts

```ts
/**
 * UT-VCR — letterbox-aware coordinate mapping for the screen-share pointer.
 *
 * This is the one piece of the laser pointer that can be subtly wrong in a way
 * nobody notices until two people with different window shapes disagree about
 * where the dot is. The tile renders the capture with `object-contain`, so the
 * picture is centred inside its box with bars on two sides, and coordinates
 * have to be measured against the picture rather than the box.
 *
 * The implementation lives in the frontend; it is pure arithmetic over a couple
 * of DOM properties, so it is mirrored here against a stub rather than pulling a
 * DOM environment into the backend suite.
 */

interface StubVideo {
  videoWidth: number;
  videoHeight: number;
  getBoundingClientRect(): { left: number; top: number; width: number; height: number };
}

// Mirrors frontend/src/lib/video-content-rect.ts.
function videoContentRect(video: StubVideo) {
  const box = video.getBoundingClientRect();
  const { videoWidth: iw, videoHeight: ih } = video;
  if (!iw || !ih) return { offsetX: 0, offsetY: 0, width: box.width, height: box.height };

  const scale = Math.min(box.width / iw, box.height / ih);
  const width = iw * scale;
  const height = ih * scale;
  return { offsetX: (box.width - width) / 2, offsetY: (box.height - height) / 2, width, height };
}

function pointerToNormalized(video: StubVideo, clientX: number, clientY: number) {
  const box = video.getBoundingClientRect();
  const c = videoContentRect(video);
  if (c.width <= 0 || c.height <= 0) return null;

  const x = (clientX - box.left - c.offsetX) / c.width;
  const y = (clientY - box.top - c.offsetY) / c.height;
  if (x < 0 || x > 1 || y < 0 || y > 1) return null;
  return { x, y };
}

function normalizedToOffset(video: StubVideo, x: number, y: number) {
  const c = videoContentRect(video);
  return { left: c.offsetX + x * c.width, top: c.offsetY + y * c.height };
}

const stub = (
  boxW: number,
  boxH: number,
  vidW: number,
  vidH: number,
  left = 0,
  top = 0,
): StubVideo => ({
  videoWidth: vidW,
  videoHeight: vidH,
  getBoundingClientRect: () => ({ left, top, width: boxW, height: boxH }),
});

describe("UT-VCR content rect", () => {
  it("UT-VCR-001: a 16:9 capture in a taller box gets horizontal bars", () => {
    // 800x600 box, 16:9 video -> scale by width, 450 tall, 75px bars top/bottom.
    const rect = videoContentRect(stub(800, 600, 1920, 1080));
    expect(rect.width).toBeCloseTo(800);
    expect(rect.height).toBeCloseTo(450);
    expect(rect.offsetX).toBeCloseTo(0);
    expect(rect.offsetY).toBeCloseTo(75);
  });

  it("UT-VCR-002: a 4:3 capture in a wider box gets vertical bars", () => {
    // 800x600 box, 4:3 video fills exactly; 1000x600 leaves 100px each side.
    const rect = videoContentRect(stub(1000, 600, 1024, 768));
    expect(rect.height).toBeCloseTo(600);
    expect(rect.width).toBeCloseTo(800);
    expect(rect.offsetX).toBeCloseTo(100);
    expect(rect.offsetY).toBeCloseTo(0);
  });

  it("UT-VCR-003: falls back to the whole box before metadata loads", () => {
    const rect = videoContentRect(stub(640, 360, 0, 0));
    expect(rect).toEqual({ offsetX: 0, offsetY: 0, width: 640, height: 360 });
  });
});

describe("UT-VCR pointer mapping", () => {
  it("UT-VCR-004: the centre of the picture is (0.5, 0.5)", () => {
    const v = stub(800, 600, 1920, 1080);
    // Picture spans y=75..525, so its centre is y=300 — same as the box centre.
    expect(pointerToNormalized(v, 400, 300)).toEqual({ x: 0.5, y: 0.5 });
  });

  it("UT-VCR-005: the picture's top edge is y=0, NOT the box's top edge", () => {
    const v = stub(800, 600, 1920, 1080);
    // y=75 is the first row of actual picture.
    const atPictureTop = pointerToNormalized(v, 400, 75);
    expect(atPictureTop?.y).toBeCloseTo(0);

    // Mapping against the box instead would have called this 0.125 — the class
    // of error that puts every dot in the wrong place.
    expect(atPictureTop?.y).not.toBeCloseTo(75 / 600);
  });

  it("UT-VCR-006: SECURITY/CORRECTNESS — a pointer over a letterbox bar is rejected", () => {
    const v = stub(800, 600, 1920, 1080);
    // y=20 is inside the element but above the picture.
    expect(pointerToNormalized(v, 400, 20)).toBeNull();
    // y=580 is below it.
    expect(pointerToNormalized(v, 400, 580)).toBeNull();
  });

  it("UT-VCR-007: the element's own page offset is subtracted", () => {
    const v = stub(800, 600, 1920, 1080, 120, 40);
    // Same relative spot as UT-VCR-004, shifted by the element's position.
    expect(pointerToNormalized(v, 120 + 400, 40 + 300)).toEqual({ x: 0.5, y: 0.5 });
  });

  it("UT-VCR-008: round-trips — normalize then position lands back where it started", () => {
    const v = stub(800, 600, 1920, 1080);
    const norm = pointerToNormalized(v, 300, 200)!;
    const back = normalizedToOffset(v, norm.x, norm.y);
    expect(back.left).toBeCloseTo(300);
    expect(back.top).toBeCloseTo(200);
  });

  it("UT-VCR-009: the same normalized point maps to different pixels on different windows", () => {
    // The whole reason coordinates are normalized: two viewers, two shapes,
    // one agreed position in the picture.
    const wide = stub(1200, 500, 1920, 1080);
    const narrow = stub(500, 700, 1920, 1080);

    const onWide = normalizedToOffset(wide, 0.25, 0.75);
    const onNarrow = normalizedToOffset(narrow, 0.25, 0.75);

    expect(onWide.left).not.toBeCloseTo(onNarrow.left);

    // …but each is a quarter across its own picture.
    const wideRect = videoContentRect(wide);
    const narrowRect = videoContentRect(narrow);
    expect((onWide.left - wideRect.offsetX) / wideRect.width).toBeCloseTo(0.25);
    expect((onNarrow.left - narrowRect.offsetX) / narrowRect.width).toBeCloseTo(0.25);
  });
});

```

## backend\test\unit\viewable-mime.spec.ts

```ts
/**
 * UT-MIME — isViewableMimeType (packages/shared-types/src/papers.ts)
 *
 * Decides whether DocumentViewer renders a file in an iframe or shows the
 * "can't preview this type" fallback. A false positive here means the user is
 * shown a blank grey frame instead of a useful message.
 */
import { isViewableMimeType, VIEWABLE_MIME_TYPES } from "@scholarbase/shared-types";

describe("UT-MIME isViewableMimeType", () => {
  it("UT-MIME-001: accepts every type declared viewable", () => {
    for (const type of VIEWABLE_MIME_TYPES) {
      expect(isViewableMimeType(type)).toBe(true);
    }
  });

  it("UT-MIME-002: accepts PDF, the only type papers uploads can produce", () => {
    expect(isViewableMimeType("application/pdf")).toBe(true);
  });

  it("UT-MIME-003: rejects renderable-but-dangerous types", () => {
    // Neither is in the allowlist; both would execute script if ever rendered.
    expect(isViewableMimeType("text/html")).toBe(false);
    expect(isViewableMimeType("image/svg+xml")).toBe(false);
  });

  it("UT-MIME-004: rejects office types that cannot render in an iframe", () => {
    expect(
      isViewableMimeType(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
    ).toBe(false);
    expect(isViewableMimeType("application/msword")).toBe(false);
  });

  it("UT-MIME-005: rejects empty/garbage input rather than throwing", () => {
    expect(isViewableMimeType("")).toBe(false);
    expect(isViewableMimeType("not-a-mime-type")).toBe(false);
  });

  it("UT-MIME-006: is case-sensitive and does not strip parameters (documents current behaviour)", () => {
    // Both are legal representations of a PDF per RFC 2045 but fail the
    // allowlist. Harmless today because upload validation stores the exact
    // lowercase string, but it makes the check brittle if that ever changes.
    expect(isViewableMimeType("APPLICATION/PDF")).toBe(false);
    expect(isViewableMimeType("application/pdf; charset=binary")).toBe(false);
  });
});

```

## backend\tsconfig.build.json

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "prisma", "**/*spec.ts"]
}

```

## backend\tsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "exclude": ["node_modules", "dist", "prisma"]
}

```

## packages\shared-types\package.json

```json
{
  "name": "@scholarbase/shared-types",
  "version": "0.1.0",
  "private": true,
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.js",
  "types": "dist/cjs/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/cjs/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    }
  },
  "license": "UNLICENSED",
  "scripts": {
    "build": "tsc -p tsconfig.cjs.json && tsc -p tsconfig.esm.json && node scripts/write-esm-package-json.js",
    "dev": "tsc -p tsconfig.cjs.json --watch"
  },
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}

```

## packages\shared-types\scripts\write-esm-package-json.js

```js
const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "dist", "esm", "package.json");
fs.writeFileSync(target, JSON.stringify({ type: "module" }, null, 2) + "\n");

```

## packages\shared-types\src\academic.ts

```ts
export interface YearLevelDto {
  id: string;
  yearNumber: number;
  label: string;
}

export interface SubjectDto {
  id: string;
  yearLevelId: string;
  code: string;
  name: string;
  department: string | null;
  semester: number | null;
  credits: number | null;
}

export interface ExamTypeDto {
  id: string;
  name: string;
}

/**
 * The exam types the UI renders a section for, in the order students sit them.
 *
 * Exam types are rows in the database, not an enum, so an admin can add one at
 * any time — but the pages that group papers by exam type need a fixed order
 * and cannot invent section headings from an unordered list. This constant is
 * that order, shared so the seed and the UI cannot drift apart: a name listed
 * here but missing from the database renders an empty section, and a name in
 * the database but missing here hides its papers entirely.
 *
 * RE-ETE is the re-examination of the end-term paper — the second attempt
 * offered so a failed subject does not become a back.
 */
export const EXAM_TYPE_LABELS = ["Unit Test", "End Term", "RE-ETE"] as const;

export interface CreateYearLevelDto {
  yearNumber: number;
  label: string;
}

export interface CreateSubjectDto {
  yearLevelId: string;
  code: string;
  name: string;
  department?: string | null;
  semester?: number | null;
  credits?: number | null;
}

export interface CreateExamTypeDto {
  name: string;
}

```

## packages\shared-types\src\auth.ts

```ts
import { UserRole } from "./enums";

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  /** ISO timestamp, or null while the address is still unconfirmed. */
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface SignupRequestDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDto extends AuthTokensDto {
  user: UserDto;
}

export interface RefreshRequestDto {
  refreshToken: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  password: string;
}

/**
 * Deliberately says nothing about whether the address exists. Both the "we
 * sent it" and "no such account" cases return this identical shape, so the
 * endpoint can't be used to enumerate which students have registered.
 */
export interface ForgotPasswordResponseDto {
  message: string;
}

/**
 * Signup no longer returns tokens: the account exists but cannot be used until
 * the emailed link is opened, so there is no session to hand back yet.
 */
export interface SignupResponseDto {
  message: string;
}

export interface VerifyEmailRequestDto {
  token: string;
}

export interface VerifyEmailResponseDto {
  message: string;
}

export interface ResendVerificationRequestDto {
  email: string;
}

/**
 * Same anti-enumeration reasoning as ForgotPasswordResponseDto — identical for
 * unknown addresses and already-verified accounts alike.
 */
export interface ResendVerificationResponseDto {
  message: string;
}

/** Shortest password the reset form will accept — mirrors signup. */
export const MIN_PASSWORD_LENGTH = 8;

```

## packages\shared-types\src\departments.ts

```ts
export interface DepartmentDef {
  code: string;
  label: string;
}

// Fixed set of departments shown on the landing page. `code` is what gets
// stored in Subject.department and used in routes/query params.
export const DEPARTMENTS: DepartmentDef[] = [
  { code: "IT", label: "IT" },
  { code: "CS", label: "CS" },
  { code: "AIDS", label: "AI & DS" },
  { code: "ENTC", label: "ENTC" },
  { code: "MECH", label: "MECH" },
  { code: "ELEC", label: "ELEC" },
];

```

## packages\shared-types\src\enums.ts

```ts
export enum UserRole {
  STUDENT = "student",
  ADMIN = "admin",
}

export enum StudyRoomVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
}

export enum UploadStatus {
  PENDING = "pending",
  READY = "ready",
  FAILED = "failed",
}

export enum IngestionStatus {
  NOT_INGESTED = "not_ingested",
  QUEUED = "queued",
  INGESTED = "ingested",
  FAILED = "failed",
}

```

## packages\shared-types\src\index.ts

```ts
export * from "./enums";
export * from "./auth";
export * from "./academic";
export * from "./papers";
export * from "./notes";
export * from "./departments";
export * from "./study-rooms";

```

## packages\shared-types\src\notes.ts

```ts
import { UploadStatus } from "./enums";

export interface NoteDto {
  id: string;
  subjectId: string;
  title: string;
  unitTopic: string | null;
  fileName: string;
  fileSizeBytes: number;
  uploadStatus: UploadStatus;
  createdAt: string;
}

export interface CreateNoteMetaDto {
  subjectId: string;
  title: string;
  unitTopic?: string | null;
}

```

## packages\shared-types\src\papers.ts

```ts
import { IngestionStatus, UploadStatus } from "./enums";

export interface QuestionPaperDto {
  id: string;
  subjectId: string;
  examTypeId: string;
  academicYear: number;
  fileName: string;
  fileSizeBytes: number;
  uploadStatus: UploadStatus;
  ingestionStatus: IngestionStatus;
  createdAt: string;
  /**
   * True when the caller must log in before the file can be opened. Signed-out
   * visitors get exactly one free paper per semester; everything else is
   * locked. Always false for a logged-in user.
   *
   * The server decides this rather than the client, so the lock the UI draws
   * and the lock the API enforces can never drift apart.
   */
  locked: boolean;
}

export interface CreateQuestionPaperMetaDto {
  subjectId: string;
  examTypeId: string;
  academicYear: number;
}

export interface DownloadUrlDto {
  url: string;
  expiresAt: string;
}

/**
 * Same presigned object, but requested with an `inline` content disposition so
 * the browser renders it instead of saving it. Carries the metadata the viewer
 * needs to decide whether it can preview the file at all.
 */
export interface FileViewUrlDto {
  url: string;
  expiresAt: string;
  fileName: string;
  mimeType: string;
}

/** Types the in-app viewer can render in an iframe; anything else downloads. */
export const VIEWABLE_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export function isViewableMimeType(mimeType: string): boolean {
  return (VIEWABLE_MIME_TYPES as readonly string[]).includes(mimeType);
}

```

## packages\shared-types\src\study-rooms.ts

```ts
import { StudyRoomVisibility, UserRole } from "./enums";

// Socket.io namespace the study-room gateway is mounted on.
export const STUDY_ROOM_NAMESPACE = "/study-rooms";

export const STUDY_ROOM_MESSAGE_MAX_LENGTH = 2000;

/** Path an invite link points at, e.g. /study-rooms/join/AbC123... */
export const STUDY_ROOM_INVITE_PATH = "/study-rooms/join";

/**
 * Pulls the invite code out of whatever the user pasted — a full link, a link
 * with a query string or trailing slash, or the bare code. Shared so the
 * browser and the API agree on what counts as a valid invite.
 */
export function parseInviteCode(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Strip any query/fragment, then take the last non-empty path segment.
  const withoutQuery = trimmed.split(/[?#]/)[0];
  const segment = withoutQuery.split("/").filter(Boolean).pop() ?? "";

  return /^[A-Za-z0-9_-]{8,64}$/.test(segment) ? segment : null;
}

export interface StudyRoomDto {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  createdByName: string;
  visibility: StudyRoomVisibility;
  /**
   * The secret half of the invite link. Only ever populated for the creator and
   * for users who already redeemed the invite — null for everyone else, so a
   * public room listing can never leak a way in.
   */
  inviteCode: string | null;
  isActive: boolean;
  /** Live count from the gateway's presence registry, not a stored column. */
  participantCount: number;
  createdAt: string;
}

export interface CreateStudyRoomRequestDto {
  name: string;
  description?: string | null;
  visibility?: StudyRoomVisibility;
}

/** Accepts either a full invite URL or the bare code pasted on its own. */
export interface RedeemInviteRequestDto {
  invite: string;
}

export interface StudyRoomMessageDto {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
}

/**
 * A connected socket in a room. `socketId` is the addressing unit for WebRTC:
 * one user with two tabs open is two participants with two peer connections.
 */
export interface StudyRoomParticipantDto {
  socketId: string;
  userId: string;
  fullName: string;
  role: UserRole;
  /**
   * True when this participant is an admin present via oversight rather than
   * membership — i.e. they entered a room they were not invited to. This is
   * shown in the UI on purpose: admin presence is never hidden from the room.
   */
  isModerator: boolean;
  /** True once the participant has published a media stream to the room. */
  inCall: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenEnabled: boolean;
}

/** Events the browser sends to the server. */
export enum StudyRoomClientEvent {
  JOIN = "room:join",
  LEAVE = "room:leave",
  SEND_MESSAGE = "chat:send",
  TYPING = "chat:typing",
  SIGNAL = "webrtc:signal",
  MEDIA_STATE = "media:state",
  WHITEBOARD_CLAIM = "whiteboard:claim",
  WHITEBOARD_RELEASE = "whiteboard:release",
  WHITEBOARD_STROKE = "whiteboard:stroke",
  WHITEBOARD_UNDO = "whiteboard:undo",
  WHITEBOARD_CLEAR = "whiteboard:clear",
  WHITEBOARD_REQUEST_DRAW = "whiteboard:request-draw",
  WHITEBOARD_GRANT = "whiteboard:grant",
  WHITEBOARD_REVOKE = "whiteboard:revoke",
  SCREEN_POINTER = "screen:pointer",
}

/** Events the server pushes to the browser. */
export enum StudyRoomServerEvent {
  JOINED = "room:joined",
  PARTICIPANT_JOINED = "room:participant-joined",
  PARTICIPANT_LEFT = "room:participant-left",
  MESSAGE = "chat:message",
  TYPING = "chat:typing",
  SIGNAL = "webrtc:signal",
  MEDIA_STATE = "media:state",
  /** The room was closed under us — moderation, or the creator ending it. */
  CLOSED = "room:closed",
  ERROR = "room:error",
  /** Full board sync: sent on join, and to whoever opens the board. */
  WHITEBOARD_STATE = "whiteboard:state",
  WHITEBOARD_STROKE = "whiteboard:stroke",
  WHITEBOARD_UNDO = "whiteboard:undo",
  WHITEBOARD_CLEARED = "whiteboard:cleared",
  /** Only ever sent to the board owner. */
  WHITEBOARD_DRAW_REQUESTED = "whiteboard:draw-requested",
  WHITEBOARD_GRANTS = "whiteboard:grants",
  SCREEN_POINTER = "screen:pointer",
}

// --- screen-share laser pointer --------------------------------------------

/**
 * A pointer position over the shared screen, in **normalized 0–1 coordinates
 * relative to the video content** — not the tile, and never pixels.
 *
 * Two reasons it must be normalized. Every viewer's window is a different size,
 * so pixels would land somewhere different on each screen. And the tile renders
 * the video with `object-contain`, so the picture is letterboxed inside its
 * box — coordinates are relative to the visible picture, with the bars excluded.
 *
 * `visible: false` retracts the pointer when the cursor leaves the video.
 */
export interface ScreenPointerPayload {
  roomId: string;
  x: number;
  y: number;
  visible: boolean;
}

export interface ScreenPointerBroadcastPayload extends ScreenPointerPayload {
  socketId: string;
  userId: string;
  fullName: string;
}

/** Outgoing pointer updates are throttled to this interval. Emitting per
 * pointermove would put ~100 messages/sec on the gateway per person. */
export const SCREEN_POINTER_THROTTLE_MS = 40;

/** A pointer with no update for this long is treated as gone, so a dot cannot
 * be left frozen on everyone's screen by a dropped connection. */
export const SCREEN_POINTER_STALE_MS = 2500;

// --- whiteboard ------------------------------------------------------------

/** How long an empty room keeps its board before it is wiped.
 *
 * Not instant on purpose. "Everyone left" and "the last two people reloaded at
 * the same moment" look identical to the server, and losing a board mid-session
 * is far worse than a stale board lingering for a couple of minutes. */
export const WHITEBOARD_EMPTY_ROOM_GRACE_MS = 2 * 60 * 1000;

/** Hard cap on stored strokes per room, so a long session cannot grow the
 * in-memory board without bound. Oldest strokes are dropped first. */
export const WHITEBOARD_MAX_STROKES = 3000;

/** Points accepted in a single stroke chunk. Clients batch on a timer rather
 * than emitting per pointermove; this bounds a malicious or buggy client. */
export const WHITEBOARD_MAX_POINTS_PER_CHUNK = 512;

export const WHITEBOARD_MAX_STROKE_WIDTH = 24;

/**
 * One drawn line.
 *
 * `points` is a flat [x0,y0,x1,y1,…] list in **normalized 0–1 coordinates**,
 * relative to the canvas — never pixels. Participants have different window
 * sizes, so pixel coordinates would land in a different place on every screen
 * but the author's.
 */
export interface WhiteboardStroke {
  id: string;
  authorId: string;
  authorName: string;
  color: string;
  width: number;
  points: number[];
}

/** Everything a client needs to render the board from cold. */
export interface WhiteboardStateDto {
  roomId: string;
  /** socketId of the current owner, or null when the board is unclaimed. */
  ownerSocketId: string | null;
  ownerName: string | null;
  strokes: WhiteboardStroke[];
  /** userIds the owner has allowed to draw. The owner is not listed here. */
  grants: string[];
}

export interface WhiteboardClaimPayload {
  roomId: string;
}

/**
 * A chunk of an in-progress stroke. The client keeps sending chunks with the
 * same `strokeId` as the pointer moves, then a final one with `done: true`.
 * Streaming rather than sending whole strokes is what makes drawing appear
 * live to everyone else.
 */
export interface WhiteboardStrokePayload {
  roomId: string;
  strokeId: string;
  color: string;
  width: number;
  points: number[];
  done: boolean;
}

export interface WhiteboardStrokeBroadcastPayload extends WhiteboardStrokePayload {
  authorId: string;
  authorName: string;
}

export interface WhiteboardUndoPayload {
  roomId: string;
}

/** Undo is scoped to the caller's own strokes — never anyone else's. */
export interface WhiteboardUndoBroadcastPayload {
  roomId: string;
  strokeId: string;
}

export interface WhiteboardClearPayload {
  roomId: string;
}

export interface WhiteboardRequestDrawPayload {
  roomId: string;
}

/** Transient — a nudge to the owner, not stored state. */
export interface WhiteboardDrawRequestedPayload {
  roomId: string;
  userId: string;
  fullName: string;
}

export interface WhiteboardGrantPayload {
  roomId: string;
  userId: string;
}

export interface WhiteboardGrantsPayload {
  roomId: string;
  ownerSocketId: string | null;
  ownerName: string | null;
  grants: string[];
}

export interface RoomClosedPayload {
  roomId: string;
  message: string;
}

export interface JoinRoomPayload {
  roomId: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

export interface SendMessagePayload {
  roomId: string;
  body: string;
}

export interface TypingPayload {
  roomId: string;
  isTyping: boolean;
}

export interface RoomJoinedPayload {
  roomId: string;
  self: StudyRoomParticipantDto;
  participants: StudyRoomParticipantDto[];
  recentMessages: StudyRoomMessageDto[];
}

export interface ParticipantJoinedPayload {
  roomId: string;
  participant: StudyRoomParticipantDto;
}

export interface ParticipantLeftPayload {
  roomId: string;
  socketId: string;
  userId: string;
}

export interface TypingBroadcastPayload {
  roomId: string;
  userId: string;
  fullName: string;
  isTyping: boolean;
}

export type SignalKind = "offer" | "answer" | "ice-candidate";

/**
 * WebRTC signalling envelope. The server only routes these between two sockets
 * in the same room — `data` (SDP or ICE candidate) is opaque to it.
 */
export interface SignalPayload {
  roomId: string;
  targetSocketId: string;
  kind: SignalKind;
  data: unknown;
}

export interface SignalBroadcastPayload {
  roomId: string;
  fromSocketId: string;
  fromUserId: string;
  fromName: string;
  kind: SignalKind;
  data: unknown;
}

export interface MediaStatePayload {
  roomId: string;
  inCall: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenEnabled: boolean;
}

export interface MediaStateBroadcastPayload extends MediaStatePayload {
  socketId: string;
  userId: string;
}

export interface RoomErrorPayload {
  message: string;
}

```

## packages\shared-types\tsconfig.cjs.json

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "moduleResolution": "node",
    "declaration": true,
    "outDir": "dist/cjs",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}

```

## packages\shared-types\tsconfig.esm.json

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ES2020",
    "moduleResolution": "bundler",
    "declaration": false,
    "outDir": "dist/esm",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}

```

