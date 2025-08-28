import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const openAssistant = () => {
    navigate('/assistant');
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 max-w-[calc(100vw-2rem)] z-50">
          <Card className="shadow-lg border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Assistant IA</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleChat}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-4">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-primary/50" />
                  <div>
                    <p className="text-sm font-medium">Assistant IA FluxiaBiz</p>
                    <p className="text-xs mt-1 text-muted-foreground">Chat intelligent pour vous aider</p>
                  </div>
                  <Button 
                    onClick={openAssistant}
                    className="w-full"
                  >
                    Ouvrir l'Assistant IA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-20 md:bottom-6 right-4 h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform z-40"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </Button>
    </>
  );
}