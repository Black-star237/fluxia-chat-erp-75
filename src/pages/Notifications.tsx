import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Trash2,
  Eye
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  priority: string;
  userId: string;
  companyId: string;
  createdAt: string;
}

const Notifications = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      // Utilisation temporaire de données mockées car la table notifications n'existe pas encore
      const data = [
        {
          id: '1',
          type: 'info',
          title: 'Bienvenue sur Fluxiabiz',
          description: 'Votre compte a été créé avec succès',
          time: '2 heures',
          read: false,
          priority: 'low',
          userId: '1',
          companyId: '1',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'stock',
          title: 'Stock faible',
          description: 'Le produit "T-shirt" a un stock faible (5 unités restantes)',
          time: '1 heure',
          read: false,
          priority: 'medium',
          userId: '1',
          companyId: '1',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          type: 'sale',
          title: 'Nouvelle vente',
          description: 'Vente de 150€ réalisée avec succès',
          time: '30 minutes',
          read: true,
          priority: 'low',
          userId: '1',
          companyId: '1',
          createdAt: new Date(Date.now() - 1800000).toISOString()
        }
      ];

      console.log('Fetched notifications:', data);

      if (data) {
        const formattedNotifications = data.map(notification => ({
          ...notification,
          time: formatTime(notification.createdAt)
        }));
        setNotifications(formattedNotifications);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Erreur inattendue",
        description: "Une erreur inattendue est survenue.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      if (days === 1) return 'Hier';
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <ShoppingCart className="h-5 w-5 text-green-500" />;
      case 'stock':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'system':
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast({
      title: "Notification supprimée",
      description: "La notification a été supprimée avec succès.",
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    toast({
      title: "Toutes les notifications marquées comme lues",
      description: "Toutes vos notifications ont été marquées comme lues.",
    });
  };

  const clearAll = () => {
    setNotifications([]);
    toast({
      title: "Notifications supprimées",
      description: "Toutes les notifications ont été supprimées.",
    });
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notif.read;
    return notif.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes les notifications sont lues'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Effacer tout
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">
              Toutes
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Non lues
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sale">
              <ShoppingCart className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="stock">
              <Package className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="system">
              <CheckCircle className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="alert">
              <AlertTriangle className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune notification</h3>
                  <p className="text-muted-foreground text-center">
                    {activeTab === 'unread' 
                      ? 'Toutes vos notifications ont été lues !' 
                      : 'Vous n\'avez aucune notification pour le moment.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card key={notification.id} className={`transition-all hover:shadow-md ${
                    !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </h3>
                                <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                                  {notification.priority === 'high' ? 'Urgent' : 
                                   notification.priority === 'medium' ? 'Important' : 'Info'}
                                </Badge>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {notification.time}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Notifications;