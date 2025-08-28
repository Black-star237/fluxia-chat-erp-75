import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: error.message,
        });
      } else {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur d'inscription",
          description: error.message,
        });
      } else {
        toast({
          title: "Inscription réussie",
          description: "Vérifiez votre email pour confirmer votre compte",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur Google",
          description: error.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la connexion avec Google",
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2070&auto=format&fit=crop')"
        }}
      />
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-green-400/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-emerald-300/5 rounded-full blur-2xl" />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-emerald-500/20 shadow-2xl">
          <div className="p-8">
            {!isSignUp ? (
              // Sign In Form
              <>
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Leaf className="w-8 h-8 text-emerald-400" />
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">Bonjour !</h1>
                  <p className="text-emerald-200/80 text-sm">
                    Connectez-vous pour accéder à FluxiaBiz
                  </p>
                </div>

                <div className="space-y-6">
                  <Button
                    onClick={handleGoogleSignIn}
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">G</span>
                      </div>
                      SIGN IN WITH GOOGLE
                    </div>
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-emerald-200/60">ou</span>
                    </div>
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="exemple@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/60 backdrop-blur-sm focus:border-emerald-400 focus:ring-emerald-400"
                    />
                    
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/60 backdrop-blur-sm focus:border-emerald-400 focus:ring-emerald-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-200/60 hover:text-emerald-400"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg"
                    >
                      {loading ? "Connexion..." : "SIGN IN"}
                    </Button>
                  </form>

                  <div className="text-center">
                    <button
                      onClick={() => setIsSignUp(true)}
                      className="text-emerald-200/80 text-sm hover:text-emerald-400 transition-colors"
                    >
                      Pas de compte ? Inscrivez-vous
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Sign Up Form
              <>
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Leaf className="w-8 h-8 text-emerald-400" />
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">Créer un compte</h1>
                  <p className="text-emerald-200/80 text-sm">
                    Rejoignez FluxiaBiz dès maintenant
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      placeholder="Prénom"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/60 backdrop-blur-sm focus:border-emerald-400 focus:ring-emerald-400"
                    />
                    <Input
                      type="text"
                      placeholder="Nom"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/60 backdrop-blur-sm focus:border-emerald-400 focus:ring-emerald-400"
                    />
                  </div>
                  
                  <Input
                    type="email"
                    placeholder="exemple@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/60 backdrop-blur-sm focus:border-emerald-400 focus:ring-emerald-400"
                  />
                  
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200/60 backdrop-blur-sm focus:border-emerald-400 focus:ring-emerald-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-200/60 hover:text-emerald-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg"
                  >
                    {loading ? "Inscription..." : "SIGN UP"}
                  </Button>
                </form>

                <div className="text-center mt-6">
                  <button
                    onClick={() => setIsSignUp(false)}
                    className="text-emerald-200/80 text-sm hover:text-emerald-400 transition-colors"
                  >
                    Déjà un compte ? Connectez-vous
                  </button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;