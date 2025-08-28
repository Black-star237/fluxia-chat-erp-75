import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  X, 
  Bot, 
  User, 
  Copy,
  Download,
  Trash2,
  Sparkles,
  MessageSquare,
  Upload
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: File[];
  images?: string[];
}

interface AttachedFile {
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

const AssistantIA = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '# Bonjour ! 👋\n\nJe suis votre **assistant IA FluxiaBiz**. Je peux vous aider avec :\n\n- 📊 Analyse de vos données de vente\n- 📈 Génération de rapports personnalisés\n- 💡 Conseils stratégiques pour votre business\n- 🔍 Recherche d\'informations\n- 📝 Rédaction de documents\n\n*Comment puis-je vous aider aujourd\'hui ?*',
      timestamp: new Date(),
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (type === 'image' && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachedFiles(prev => [...prev, {
            file,
            preview: e.target?.result as string,
            type: 'image'
          }]);
        };
        reader.readAsDataURL(file);
      } else if (type === 'document') {
        setAttachedFiles(prev => [...prev, {
          file,
          type: 'document'
        }]);
      }
    });

    // Reset input
    event.target.value = '';
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Le texte a été copié dans le presse-papiers.",
    });
  };

  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulation d'une réponse IA avec délai
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = [
      `Merci pour votre question ! Voici une analyse basée sur vos données FluxiaBiz :\n\n## 📊 Analyse\n\n- **Tendance générale** : Vos ventes montrent une progression positive\n- **Recommandation** : Concentrez-vous sur les produits les plus performants\n\n\`\`\`javascript\nconst analyseVentes = (data) => {\n  return data.reduce((total, vente) => total + vente.montant, 0);\n};\n\`\`\`\n\n*N'hésitez pas si vous avez d'autres questions !*`,
      
      `Excellente question ! Voici mes recommandations pour **optimiser votre business** :\n\n### 🎯 Stratégies recommandées\n\n1. **Fidélisation client**\n   - Programme de récompenses\n   - Suivi personnalisé\n\n2. **Optimisation des stocks**\n   - Analyse prédictive\n   - Réapprovisionnement automatique\n\n3. **Marketing digital**\n   - Présence en ligne\n   - Réseaux sociaux\n\n> 💡 **Conseil** : Commencez par un seul axe et développez progressivement.`,
      
      `Je vais vous aider à analyser cela ! Voici une approche structurée :\n\n## 🔍 Méthodologie d'analyse\n\n**Étape 1** : Collecte des données\n**Étape 2** : Segmentation\n**Étape 3** : Analyse des tendances\n**Étape 4** : Recommandations actionables\n\n\`\`\`sql\nSELECT produit, SUM(quantite) as total_vendu\nFROM ventes \nWHERE date >= '2024-01-01'\nGROUP BY produit\nORDER BY total_vendu DESC;\n\`\`\`\n\nSouhaitez-vous que j'approfondisse un aspect particulier ?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && attachedFiles.length === 0) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      files: attachedFiles.map(af => af.file),
      images: attachedFiles.filter(af => af.type === 'image').map(af => af.preview!),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setAttachedFiles([]);
    setIsTyping(true);

    try {
      const aiResponse = await simulateAIResponse(inputMessage);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer une réponse. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: '# Conversation effacée ! 🗑️\n\nVous pouvez commencer une nouvelle conversation.\n\n*Comment puis-je vous aider ?*',
      timestamp: new Date(),
    }]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b bg-gradient-to-r from-primary/10 to-purple-500/10 shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-xl font-bold truncate">Assistant IA FluxiaBiz</h1>
            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Powered by Intelligence Artificielle</p>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            <MessageSquare className="h-3 w-3" />
            <span className="hidden sm:inline">{messages.length - 1} messages</span>
            <span className="sm:hidden">{messages.length - 1}</span>
          </Badge>
          <Button variant="outline" size="sm" onClick={clearChat} className="px-2 md:px-4">
            <Trash2 className="h-4 w-4" />
            <span className="hidden md:inline ml-2">Effacer</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-2 md:p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-2 md:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <Avatar className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-primary to-purple-600 shrink-0">
                  <AvatarFallback>
                    <Bot className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[85%] md:max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                <Card className={`${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted/50'
                }`}>
                  <CardContent className="p-3 md:p-4">
                    {/* Images */}
                    {message.images && message.images.length > 0 && (
                      <div className="mb-3 grid grid-cols-2 gap-2">
                        {message.images.map((image, idx) => (
                          <img 
                            key={idx}
                            src={image} 
                            alt={`Upload ${idx + 1}`}
                            className="rounded-lg max-h-40 object-cover"
                          />
                        ))}
                      </div>
                    )}

                    {/* Files */}
                    {message.files && message.files.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {message.files.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm flex-1">{file.name}</span>
                            <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message Content */}
                    {message.role === 'assistant' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-lg"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                                {children}
                              </code>
                            );
                          },
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-primary pl-4 italic my-4">
                              {children}
                            </blockquote>
                          ),
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-4">
                              <table className="min-w-full border border-border rounded-lg">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({ children }) => (
                            <th className="border border-border p-2 bg-muted font-semibold text-left">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="border border-border p-2">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(message.content)}
                        className="h-6 px-2"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {message.role === 'user' && (
                <Avatar className="w-6 h-6 md:w-8 md:h-8 bg-primary shrink-0">
                  <AvatarFallback>
                    <User className="h-3 w-3 md:h-4 md:w-4 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-2 md:gap-3 justify-start">
              <Avatar className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-primary to-purple-600 shrink-0">
                <AvatarFallback>
                  <Bot className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-muted/50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-sm text-muted-foreground ml-2">L'IA réfléchit...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="p-2 md:p-4 border-t bg-muted/20">
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((attachedFile, index) => (
              <div key={index} className="relative">
                {attachedFile.type === 'image' ? (
                  <div className="relative">
                    <img 
                      src={attachedFile.preview} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-5 h-5 p-0 rounded-full"
                      onClick={() => removeAttachedFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-background p-2 rounded-lg border">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm max-w-20 truncate">{attachedFile.file.name}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-4 h-4 p-0 rounded-full ml-1"
                      onClick={() => removeAttachedFile(index)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-2 md:p-4 border-t bg-background shrink-0">
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              placeholder="Posez votre question à l'IA..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="min-h-[50px] md:min-h-[60px] resize-none text-sm md:text-base"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-1 md:gap-2 shrink-0">
            {/* File Upload Buttons */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                className="p-2 h-8 md:h-9"
              >
                <ImageIcon className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 h-8 md:h-9"
              >
                <Paperclip className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
            
            {/* Send Button */}
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() && attachedFiles.length === 0}
              className="h-8 md:h-12 px-3 md:px-4"
            >
              <Send className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileUpload(e, 'document')}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.ppt,.pptx"
        />
        <input
          ref={imageInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileUpload(e, 'image')}
          className="hidden"
          accept="image/*"
        />
      </div>
    </div>
  );
};

export default AssistantIA;