'use client'

import { useChat } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { SendHorizontal } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useState, useEffect } from 'react'

async function checkPromptSecurity(input: string) {
  try {
    const response = await fetch('/api/prompt-guard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    });
    
    const result = await response.json();
    return result.isMalicious;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error checking prompt security:', error);
    }
    return false;
  }
}

async function validatePrompt(prompt: string, messages: any[]) {
  try {
    const response = await fetch('/api/validate-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        messages,
      }),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error validating prompt:', error);
    return { isValid: false, reasoning: 'Error during validation' };
  }
}

export default function Chat() {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: ''
  });
  const [isValidating, setIsValidating] = useState(false);

  // Fetch user session info when component mounts
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setUserInfo({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            dateOfBirth: data.dateOfBirth || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    }
    
    fetchUserInfo();
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    initialMessages: [],
    maxSteps: 3,
    // Ensure frontend only sends user and assistant messages, never system messages
    onFinish: (message) => {
      if (message.role === 'system') {
        console.warn('System message received from API - this should not happen');
      }
    }
  })

  const handleSecureSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsValidating(true);
    
    try {
      // Check for SQL injection attempts
      var containsSelect = input.toUpperCase().includes(" SELECT ") || input.toUpperCase().startsWith("SELECT ");
      if (containsSelect) {
        setMessages([
          ...messages,
          { id: Date.now().toString(), role: 'user', content: input },
          { id: (Date.now() + 1).toString(), role: 'assistant', content: "Nice Try ;) You'll find I am a bit more SELECT-ive than that!" }
        ]);
        handleInputChange({ target: { value: '' } } as any);
        return;
      }

      var containsStar = input.toUpperCase().includes("*"); 
      if (containsStar) {
        setMessages([
          ...messages,
          { id: Date.now().toString(), role: 'user', content: input },
          { id: (Date.now() + 1).toString(), role: 'assistant', content: "Hey I just really don't like that character, can we not use '*'?" }
        ]);
        handleInputChange({ target: { value: '' } } as any);
        return;
      }

      var containsSQL = input.toUpperCase().includes("SQL");
      if (containsSQL) {
        setMessages([
          ...messages,
          { id: Date.now().toString(), role: 'user', content: input },
          { id: (Date.now() + 1).toString(), role: 'assistant', content: "What is SQL? I only know healthcare records!" }
        ]);
        handleInputChange({ target: { value: '' } } as any);
        return;
      }

      var containsPatientId = input.toUpperCase().includes("PATIENT_ID") || input.includes("ID") || input.includes(" id ");
      if (containsPatientId) {
        setMessages([
          ...messages,
          { id: Date.now().toString(), role: 'user', content: input },
          { id: (Date.now() + 1).toString(), role: 'assistant', content: "ID? More like ID rather not! haha...." }
        ]);
        handleInputChange({ target: { value: '' } } as any);
        return;
      }

      var containsTable = input.toUpperCase().includes(" TABLE ");
      if (containsTable) {
        setMessages([
          ...messages,
          { id: Date.now().toString(), role: 'user', content: input },
          { id: (Date.now() + 1).toString(), role: 'assistant', content: "Tables? what is this? an IKEA?" }
        ]);
        handleInputChange({ target: { value: '' } } as any);
        return;
      }

      var containsQuery = input.toUpperCase().includes("QUERY");
      if (containsQuery) {
        setMessages([
          ...messages,
          { id: Date.now().toString(), role: 'user', content: input },
          { id: (Date.now() + 1).toString(), role: 'assistant', content: "I'm sorry, I don't know what you mean by 'query'. Perhaps you meant to ask about your medical records?" }
        ]);
        handleInputChange({ target: { value: '' } } as any);
        return;
      }

      var containsPoem = input.toUpperCase().includes("POEM");
      if (containsPoem) {
        setMessages([
          ...messages,
          { id: Date.now().toString(), role: 'user', content: input },
          { id: (Date.now() + 1).toString(), role: 'assistant', content: "Hey I'm a healthcare chatbot, not shakespeare, alright?" }
        ]);
        handleInputChange({ target: { value: '' } } as any);
        return;
      }

      // First check with Prompt-Guard
      const isMalicious = await checkPromptSecurity(input);
      if (isMalicious) {
        setMessages([
          ...messages,
          { id: Date.now().toString(), role: 'user', content: input },
          { id: (Date.now() + 1).toString(), role: 'assistant', content: "Malicious prompt detected, request blocked" }
        ]);
        handleInputChange({ target: { value: '' } } as any);
        return;
      }

      // Then check with GPT-4 validator
      const validationResult = await validatePrompt(input, messages);

      if (!validationResult.isValid) {
        setMessages([
          ...messages,
          { id: Date.now().toString(), role: 'user', content: input },
          { id: (Date.now() + 1).toString(), role: 'assistant', content: "Request blocked due to security concerns" }
        ]);
        handleInputChange({ target: { value: '' } } as any);
        return;
      }

      // If both checks pass, proceed with normal submission
      handleSubmit(e);
    } finally {
      setIsValidating(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-6rem)] p-4 md:p-8">
        <Card className="flex-1 mb-4 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages
                .filter(m => m.role !== 'system')
                .filter(m => !m.toolInvocations)
                .map(m => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] bg-muted`}
                    >
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        className="prose prose-sm dark:prose-invert max-w-none"
                        components={{
                          table: props => (
                            <div className="overflow-x-auto">
                              <table {...props} className="min-w-full divide-y divide-gray-200" />
                            </div>
                          ),
                          th: props => <th {...props} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" />,
                          td: props => <td {...props} className="px-3 py-2 whitespace-nowrap text-sm" />,
                          pre: props => <pre {...props} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-x-auto" />,
                          code: props => <code {...props} className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-1 py-0.5" />,
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150" />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <form onSubmit={handleSecureSubmit} className="flex gap-2">
                <Input
                  className="flex-1"
                  value={input}
                  placeholder="Ask about your health records..."
                  onChange={handleInputChange}
                  disabled={isLoading || isValidating}
                />
                <Button type="submit" size="icon" disabled={isLoading || isValidating}>
                  {isValidating ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                  ) : (
                    <SendHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
} 
