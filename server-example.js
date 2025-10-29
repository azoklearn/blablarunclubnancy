// ==========================================
// SERVEUR BACKEND STRIPE - EXEMPLE
// ==========================================
// Ce fichier est un exemple de serveur Node.js pour gérer les paiements Stripe
// 
// Installation requise:
// npm install express stripe cors dotenv
//
// Créez un fichier .env avec:
// STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE
// STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_VOTRE_CLE_SECRETE');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Servir les fichiers statiques du site

// ==========================================
// ROUTE: Créer une session de paiement Stripe
// ==========================================
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
                            description: 'Adhésion annuelle au BlaBlaRun Club de Nancy',
                            images: ['https://votre-domaine.com/assets/logo.jpeg'], // Optionnel
                        },
                        unit_amount: 1000, // 10.00 EUR (en centimes)
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.origin || 'http://localhost:3000'}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin || 'http://localhost:3000'}/?canceled=true`,
            // Optionnel: Collecter des informations supplémentaires
            customer_email: req.body.email || undefined,
            metadata: {
                adhesion_type: 'annuelle',
                club: 'BlaBlaRun Nancy',
            },
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Erreur création session:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// ROUTE: Vérifier le statut du paiement
// ==========================================
app.get('/checkout-session', async (req, res) => {
    const { sessionId } = req.query;
    
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        res.json(session);
    } catch (error) {
        console.error('Erreur récupération session:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// WEBHOOK: Recevoir les événements Stripe
// ==========================================
// Important pour la production: Vérifier les paiements réussis
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Gérer l'événement
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Paiement réussi pour la session:', session.id);
            
            // TODO: Enregistrer l'adhésion dans votre base de données
            // TODO: Envoyer un email de confirmation
            // TODO: Créer le compte membre
            
            break;
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment Intent réussi:', paymentIntent.id);
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Paiement échoué:', failedPayment.id);
            break;
        default:
            console.log(`Événement non géré: ${event.type}`);
    }

    res.json({ received: true });
});

// ==========================================
// ROUTE: Page de succès
// ==========================================
app.get('/success', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Paiement réussi - BlaBlaRun Club</title>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    background: #0a0a0a;
                    color: #FFFFFF;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                }
                .container {
                    text-align: center;
                    max-width: 600px;
                    padding: 3rem;
                    background: #1a1a1a;
                    border-radius: 16px;
                    border: 3px solid #3b82f6;
                }
                h1 { color: #3b82f6; font-size: 3rem; margin-bottom: 1rem; }
                p { font-size: 1.2rem; line-height: 1.8; color: #b0b0b0; }
                .btn {
                    display: inline-block;
                    margin-top: 2rem;
                    padding: 1rem 2.5rem;
                    background: #3b82f6;
                    color: #0a0a0a;
                    text-decoration: none;
                    border-radius: 50px;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎉 Bienvenue au club !</h1>
                <p>Votre adhésion a été validée avec succès.</p>
                <p>Vous allez recevoir un email de confirmation avec tous les détails.</p>
                <a href="/" class="btn">Retour au site</a>
            </div>
        </body>
        </html>
    `);
});

// ==========================================
// DÉMARRAGE DU SERVEUR
// ==========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('==========================================');
    console.log('🏃 BlaBlaRun Club - Serveur Stripe');
    console.log('==========================================');
    console.log(`✓ Serveur démarré sur http://localhost:${PORT}`);
    console.log(`✓ Mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'PRODUCTION' : 'TEST'}`);
    console.log('==========================================');
});

// ==========================================
// GESTION DES ERREURS
// ==========================================
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});


