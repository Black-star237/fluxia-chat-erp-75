# Conception de l'interface utilisateur pour les invitations et demandes d'adhésion

## Diagramme de flux pour les invitations

```mermaid
flowchart TD
    A[Propriétaire/Manager] -->|Clique sur "Inviter un membre"| B[Formulaire d'invitation]
    B -->|Soumet l'invitation| C[Backend]
    C -->|Envoie email| D[Email d'invitation]
    C -->|Crée notification| E[Notification dans l'app]
    D -->|Utilisateur clique sur lien| F[Page d'acceptation]
    E -->|Utilisateur clique sur notification| F
    F -->|Accepte l'invitation| G[Backend]
    G -->|Ajoute à l'entreprise| H[Utilisateur devient membre]
    G -->|Met à jour statut| I[Invitation acceptée]
```

## Diagramme de flux pour les demandes d'adhésion

```mermaid
flowchart TD
    A[Utilisateur] -->|Clique sur "Demander à rejoindre"| B[Formulaire de demande]
    B -->|Soumet la demande| C[Backend]
    C -->|Crée notification| D[Notification pour admin]
    D -->|Admin clique sur notification| E[Page de gestion des demandes]
    E -->|Approuve la demande| F[Backend]
    F -->|Ajoute à l'entreprise| G[Utilisateur devient membre]
    F -->|Met à jour statut| H[Demande approuvée]
    E -->|Rejette la demande| I[Backend]
    I -->|Met à jour statut| J[Demande rejetée]
```

## Composants UI nécessaires

### 1. Formulaire d'invitation de membres

- Champ email (obligatoire)
- Sélecteur de rôle (employé, manager) - par défaut : employé
- Bouton d'envoi
- Message de succès/erreur

### 2. Page d'acceptation d'invitation

- Affichage des informations de l'entreprise
- Affichage du rôle proposé
- Boutons "Accepter" et "Refuser"
- Message de confirmation

### 3. Formulaire de demande d'adhésion

- Sélecteur d'entreprise (si plusieurs disponibles)
- Champ message (optionnel)
- Sélecteur de rôle souhaité (employé, manager) - par défaut : employé
- Bouton d'envoi
- Message de succès/erreur

### 4. Page de gestion des demandes (pour admins)

- Liste des demandes en attente
- Pour chaque demande :
  - Nom de l'utilisateur
  - Rôle demandé
  - Message
  - Boutons "Approuver" et "Rejeter"

### 5. Notifications

- Notification pour les utilisateurs invités
- Notification pour les admins lorsqu'une demande est faite
- Notification pour les utilisateurs lorsque leur demande est approuvée/rejetée

## Intégration avec les pages existantes

### Page Equipe.tsx
- Le bouton "Inviter un membre" ouvrira le formulaire d'invitation
- Ajouter un onglet ou une section pour gérer les demandes d'adhésion (pour les admins)

### Page Entreprises.tsx
- Le bouton "Rejoindre une entreprise" ouvrira le formulaire de demande d'adhésion
- Ajouter une section pour afficher les invitations en attente

## Composants réutilisables

- ModalDialog : Pour les formulaires d'invitation et de demande
- NotificationCard : Pour afficher les notifications d'invitation et de demande
- UserAvatar : Pour afficher les avatars des utilisateurs dans les listes
- RoleBadge : Pour afficher les rôles avec des couleurs appropriées