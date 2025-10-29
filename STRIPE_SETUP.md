# Configuration Stripe pour l'Adhésion BlaBlaRun Club

Ce guide vous explique comment configurer Stripe pour accepter les paiements d'adhésion à 10€/an.

## 📋 Prérequis

1. Un compte Stripe (gratuit) : https://stripe.com
2. Un serveur backend (Node.js, PHP, Python, etc.) ou utiliser Stripe Links

## 🚀 Option 1 : Stripe Payment Links (Le plus simple - Aucun code backend requis)

### Étape 1 : Créer un compte Stripe
1. Allez sur https://stripe.com
2. Créez un compte gratuit
3. Complétez les informations de votre entreprise

### Étape 2 : Créer un produit
1. Dans le Dashboard Stripe : https://dashboard.stripe.com
2. Allez dans **Produits** → **Ajouter un produit**
3. Nom : `Adhésion BlaBlaRun Club`
4. Prix : `10.00 EUR`
5. Mode de facturation : **Unique** (paiement ponctuel)
6. Sauvegardez

### Étape 3 : Créer un Payment Link
1. Dans le produit créé, cliquez sur **Créer un lien de paiement**
2. Personnalisez le message de réussite
3. Copiez le lien généré (ex: `https://buy.stripe.com/xxxxx`)

### Étape 4 : Modifier le code
Dans `script.js`, remplacez le code de paiement par :

```javascript
const checkoutButton = document.getElementById('checkout-button');

if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
        // Remplacez par votre Payment Link Stripe
        window.location.href = 'https://buy.stripe.com/VOTRE_LIEN_ICI';
    });
}
```

## 🔧 Option 2 : Stripe Checkout avec Backend (Plus avancé)

### Étape 1 : Obtenir vos clés API
1. Dashboard Stripe → **Développeurs** → **Clés API**
2. Copiez votre **Clé publique** (pk_test_...)
3. Copiez votre **Clé secrète** (sk_test_...)

### Étape 2 : Mettre à jour la clé publique
Dans `script.js`, ligne 397, remplacez :
```javascript
const stripePublicKey = 'YOUR_STRIPE_PUBLISHABLE_KEY';
```
Par :
```javascript
const stripePublicKey = 'pk_test_VOTRE_CLE_PUBLIQUE';
```

### Étape 3 : Créer le backend (Exemple Node.js)

Créez un fichier `server.js` :

```javascript
const express = require('express');
const stripe = require('stripe')('sk_test_VOTRE_CLE_SECRETE');
const app = express();

app.use(express.json());
app.use(express.static('.')); // Servir les fichiers statiques

app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'Adhésion BlaBlaRun Club',
                            description: 'Adhésion annuelle au club',
                        },
                        unit_amount: 1000, // 10.00 EUR en centimes
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.origin}/?success=true`,
            cancel_url: `${req.headers.origin}/?canceled=true`,
        });

        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
```

### Étape 4 : Installer les dépendances
```bash
npm install express stripe
```

### Étape 5 : Lancer le serveur
```bash
node server.js
```

## 🧪 Mode Test

Par défaut, vous êtes en mode **Test**. Les cartes de test Stripe :
- Carte valide : `4242 4242 4242 4242`
- Date d'expiration : N'importe quelle date future
- CVC : N'importe quel code à 3 chiffres
- Code postal : N'importe quel code

## 🎯 Passer en Production

1. Complétez les informations de votre entreprise dans Stripe
2. Activez votre compte
3. Remplacez les clés de test (`pk_test_`, `sk_test_`) par les clés de production (`pk_live_`, `sk_live_`)

## 📞 Support

- Documentation Stripe : https://stripe.com/docs
- Support Stripe : https://support.stripe.com

---

**Recommandation** : Commencez avec l'Option 1 (Payment Links) pour tester rapidement !


