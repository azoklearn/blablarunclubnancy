# 🏃 BlaBlaRun Club - Site Web

Site web officiel du BlaBlaRun Club de Nancy avec système d'adhésion en ligne via Stripe.

## 🎨 Caractéristiques

- ✅ Design moderne avec fond noir et touches bleues
- ✅ Navigation responsive (mobile/desktop)
- ✅ Section adhésion avec paiement Stripe intégré
- ✅ Animations fluides au scroll
- ✅ Lightbox pour les images
- ✅ Codes promo partenaires
- ✅ Formulaire de contact

## 📁 Structure du projet

```
blablarun/
├── index.html              # Page principale
├── style.css               # Styles (fond noir, thème bleu)
├── script.js               # JavaScript (animations, Stripe)
├── assets/                 # Images et médias
├── server-example.js       # Serveur backend Stripe (exemple)
├── package.json            # Dépendances Node.js
├── STRIPE_SETUP.md         # Guide de configuration Stripe
└── README.md              # Ce fichier
```

## 🚀 Démarrage rapide

### Avec serveur et paiements Stripe

#### Prérequis
- Node.js 14+ installé
- Un compte Stripe (gratuit)

#### Installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer Stripe**
   - Créez un compte sur https://stripe.com
   - Copiez `.env.example` vers `.env`
   - Ajoutez vos clés Stripe dans `.env`

3. **Lancer le serveur**
```bash
npm start
```

4. **Ouvrir le site**
   - Allez sur http://localhost:3000

## 💳 Configuration Stripe

Consultez le fichier [STRIPE_SETUP.md](STRIPE_SETUP.md) pour un guide complet.

### Méthode rapide : Payment Links

1. Créez un produit "Adhésion BlaBlaRun" à 10€ sur Stripe
2. Générez un Payment Link
3. Modifiez `script.js` ligne 400 :

```javascript
if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
        window.location.href = 'https://buy.stripe.com/VOTRE_LIEN';
    });
}
```

## 🎨 Personnalisation

### Couleurs

Les couleurs sont définies dans `style.css` :

```css
:root {
    --color-lime: #3b82f6;        /* Bleu principal */
    --color-cream: #0a0a0a;       /* Fond noir */
    --color-black: #FFFFFF;       /* Texte blanc */
    --color-white: #1a1a1a;       /* Cartes foncées */
    --color-grey: #b0b0b0;        /* Texte secondaire */
}
```

### Contenu

Modifiez `index.html` pour changer :
- Les textes
- Les avantages de l'adhésion
- Les informations du club
- Les liens Strava et Drive

## 📱 Responsive

Le site est entièrement responsive :
- Desktop : Navigation horizontale
- Mobile : Menu hamburger
- Tablette : Layout adapté

## 🔒 Sécurité

⚠️ **IMPORTANT** :
- Ne commitez JAMAIS vos clés Stripe secrètes
- Le fichier `.env` est dans `.gitignore`
- Utilisez les clés de test (`sk_test_`) en développement
- Passez aux clés live (`sk_live_`) uniquement en production

## 📄 License

© 2025 BlaBlaRun Club - Tous droits réservés

## 🆘 Support

Pour toute question :
- Email : contact@blablarun.fr
- Instagram : @blablarunclub
- Strava : BlaBlaRun Club Nancy

---

**Fait avec ❤️ par Marine pour le BlaBlaRun Club**

