import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function PwaInstallPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Check if app was installed
  useEffect(() => {
    window.addEventListener("appinstalled", () => {
      // Hide the app-provided install promotion
      setIsInstallable(false);
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      // Log install to analytics
      console.log("PWA was installed");
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }
    
    // We no longer need the prompt. Clear it up
    setDeferredPrompt(null);
    setIsOpen(false);
  };

  if (!isInstallable) {
    return null;
  }

  return (
    <>
      <Button 
        variant="outline" 
        className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg md:bottom-8"
        onClick={() => setIsOpen(true)}
      >
        Installer l'app
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Installer FluxiaBiz</DialogTitle>
            <DialogDescription>
              Installez FluxiaBiz sur votre appareil pour un accès rapide et une utilisation hors ligne.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-white font-bold">F</div>
              <div>
                <p className="font-medium">FluxiaBiz</p>
                <p className="text-sm text-muted-foreground">Solution ERP complète pour PME</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium">Avantages :</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Accès rapide depuis l'écran d'accueil</li>
                <li>• Fonctionne hors ligne</li>
                <li>• Performance améliorée</li>
                <li>• Pas besoin de navigateur</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Plus tard
            </Button>
            <Button onClick={handleInstallClick}>
              Installer maintenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}