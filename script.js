// ==========================================
// CONFIGURATION
// ==========================================
const isMobile = window.innerWidth < 768;
const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ==========================================
// LIGHTBOX POUR TOUTES LES IMAGES
// ==========================================
const lightbox = document.getElementById('imageLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

// Liste de toutes les images cliquables
let allClickableImages = [];
let currentImageIndex = -1;

// Fonction pour mettre à jour la liste des images
function updateImagesList() {
    allClickableImages = [];
    
    // Image actualité
    const actualiteImg = document.querySelector('#actualiteImage img');
    if (actualiteImg) allClickableImages.push(actualiteImg);
    
    // Autres images cliquables (hors galerie)
    document.querySelectorAll('.about-image img, .founder-image img').forEach(img => {
        allClickableImages.push(img);
    });
}

// Fonction pour obtenir uniquement les images de la galerie
function getGalleryImages() {
    // Vérifier si on a des images Masonry
    if (window.masonryImagesForLightbox && window.masonryImagesForLightbox.length > 0) {
        return window.masonryImagesForLightbox;
    }
    return Array.from(document.querySelectorAll('.gallery-item img'));
}

// Fonction pour ouvrir le lightbox
function openLightbox(imgElement) {
    if (!lightbox || !lightboxImg) return;
    
    // Vérifier si l'image fait partie de la galerie
    const isGalleryImage = imgElement.closest('.gallery-item') !== null;
    
    if (isGalleryImage) {
        // Si c'est une image de la galerie, utiliser uniquement les images de la galerie
        allClickableImages = getGalleryImages();
    } else {
        // Sinon, utiliser toutes les images cliquables
        updateImagesList();
    }
    
    // Trouver l'index de l'image actuelle
    currentImageIndex = allClickableImages.findIndex(img => img === imgElement);
    if (currentImageIndex === -1) currentImageIndex = 0;
    
    showImage(currentImageIndex);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateNavigationButtons();
}

// Fonction pour afficher une image par son index
function showImage(index) {
    // Utiliser les images Masonry si elles existent
    const images = window.masonryImagesForLightbox && window.masonryImagesForLightbox.length > 0 
        ? window.masonryImagesForLightbox 
        : allClickableImages;
    
    if (!lightboxImg || images.length === 0) return;
    
    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;
    
    // Mettre à jour les index globaux
    if (window.masonryImagesForLightbox) {
        window.currentImageIndex = index;
    } else {
        currentImageIndex = index;
    }
    
    const img = images[index];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || 'Image';
    updateNavigationButtons();
}

// Fonction pour mettre à jour la visibilité des boutons de navigation
function updateNavigationButtons() {
    if (!lightboxPrev || !lightboxNext) return;
    
    // Utiliser les images Masonry si elles existent
    const images = window.masonryImagesForLightbox && window.masonryImagesForLightbox.length > 0 
        ? window.masonryImagesForLightbox 
        : allClickableImages;
    
    if (images.length <= 1) {
        lightboxPrev.style.display = 'none';
        lightboxNext.style.display = 'none';
    } else {
        lightboxPrev.style.display = 'flex';
        lightboxNext.style.display = 'flex';
    }
}

// Fonction pour image précédente
function prevImage() {
    // Utiliser les images Masonry si elles existent
    const images = window.masonryImagesForLightbox && window.masonryImagesForLightbox.length > 0 
        ? window.masonryImagesForLightbox 
        : allClickableImages;
    
    if (images.length === 0) return;
    
    const currentIdx = window.masonryImagesForLightbox 
        ? (window.currentImageIndex || 0)
        : currentImageIndex;
    
    showImage(currentIdx - 1);
}

// Fonction pour image suivante
function nextImage() {
    // Utiliser les images Masonry si elles existent
    const images = window.masonryImagesForLightbox && window.masonryImagesForLightbox.length > 0 
        ? window.masonryImagesForLightbox 
        : allClickableImages;
    
    if (images.length === 0) return;
    
    const currentIdx = window.masonryImagesForLightbox 
        ? (window.currentImageIndex || 0)
        : currentImageIndex;
    
    showImage(currentIdx + 1);
}

// Image actualité
const actualiteImage = document.getElementById('actualiteImage');
if (actualiteImage) {
    actualiteImage.addEventListener('click', () => {
        const img = actualiteImage.querySelector('img');
        if (img) openLightbox(img);
    });
}

// Toutes les autres images cliquables
document.addEventListener('DOMContentLoaded', () => {
    updateImagesList();
    
    document.querySelectorAll('.about-image img, .founder-image img, .gallery-item img').forEach(img => {
        img.addEventListener('click', () => {
            openLightbox(img);
        });
    });
});

if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
}

if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        prevImage();
    });
}

if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        nextImage();
    });
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightboxImg) {
            closeLightbox();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        prevImage();
    } else if (e.key === 'ArrowRight') {
        nextImage();
    }
});

function closeLightbox() {
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        currentImageIndex = -1;
        // Réinitialiser les variables Masonry si elles existent
        if (window.masonryImagesForLightbox) {
            window.masonryImagesForLightbox.forEach(img => {
                if (img.parentNode) img.parentNode.removeChild(img);
            });
            window.masonryImagesForLightbox = null;
            window.currentImageIndex = -1;
        }
    }
}

// ==========================================
// MENU MOBILE (HAMBURGER)
// ==========================================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (hamburger && navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

document.addEventListener('click', (e) => {
    if (navMenu && hamburger && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// ==========================================
// HEADER - EFFET AU SCROLL
// ==========================================
const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (header) {
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    lastScroll = currentScroll;
});

// ==========================================
// SCROLL SMOOTH
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        if (href === '#' || href === '') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            const headerOffset = 90;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==========================================
// ANIMATIONS AU SCROLL (REVEAL)
// ==========================================
const revealElements = () => {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach((element, index) => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 100;
        
        if (elementTop < windowHeight - elementVisible) {
            setTimeout(() => {
                element.classList.add('active');
            }, index * 80);
        }
    });
    
    // Effet de scroll horizontal pour la section fondateur (gauche vers droite)
    const founderSection = document.querySelector('.founder');
    const founderImage = document.querySelector('.founder-image');
    const founderInfo = document.querySelector('.founder-info');
    
    if (founderSection && founderImage && founderInfo) {
        const sectionRect = founderSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Vérifier si la section est visible
        if (sectionRect.top < windowHeight && sectionRect.bottom > 0) {
            // Calculer le pourcentage de scroll dans la section
            const scrollProgress = 1 - (sectionRect.top / windowHeight);
            const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
            
            // Déplacement horizontal : de gauche (plus loin) à droite (0px)
            const imageMove = -800 + (clampedProgress * 800);
            const infoMove = -1200 + (clampedProgress * 1200);
            
            founderImage.style.transform = `translateX(${imageMove}px)`;
            founderInfo.style.transform = `translateX(${infoMove}px)`;
        }
    }
    
    // Effet de scroll horizontal pour la section À propos (droite vers gauche - sens inverse)
    const aboutSection = document.querySelector('.about');
    const aboutText = document.querySelector('.about-text');
    const aboutImage = document.querySelector('.about-image');
    
    if (aboutSection && aboutText && aboutImage) {
        const sectionRect = aboutSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Vérifier si la section est visible
        if (sectionRect.top < windowHeight && sectionRect.bottom > 0) {
            // Calculer le pourcentage de scroll dans la section
            const scrollProgress = 1 - (sectionRect.top / windowHeight);
            const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
            
            // Déplacement horizontal : de droite (800px) vers gauche (0px) - sens inverse
            const textMove = 1200 - (clampedProgress * 1200);
            const imageMove = 800 - (clampedProgress * 800);
            
            aboutText.style.transform = `translateX(${textMove}px)`;
            aboutImage.style.transform = `translateX(${imageMove}px)`;
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    // Ajouter la classe reveal aux éléments à animer
    document.querySelectorAll('.group-card').forEach(card => {
        card.classList.add('reveal');
    });
    
    document.querySelectorAll('.info-card').forEach(card => {
        card.classList.add('reveal');
    });
    
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.classList.add('reveal');
    });
    
    document.querySelectorAll('.link-card').forEach(card => {
        card.classList.add('reveal');
    });
    
    document.querySelectorAll('.promo-card').forEach(card => {
        card.classList.add('reveal');
    });
    
    document.querySelectorAll('.adhesion-card, .feature-item').forEach(card => {
        card.classList.add('reveal');
    });
    
    revealElements();
});

window.addEventListener('scroll', revealElements);

// ==========================================
// EFFET PARALLAXE LÉGER SUR LE HERO
// ==========================================
const hero = document.querySelector('.hero');

if (hero && !isReducedMotion && !isMobile) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;
        
        hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    });
}

// ==========================================
// COPIE DU CODE PROMO AU CLIC
// ==========================================
const promoCodes = document.querySelectorAll('.promo-code');

promoCodes.forEach(codeElement => {
    codeElement.addEventListener('click', function() {
        const code = this.textContent.trim();
        
        // Copier dans le presse-papier
        navigator.clipboard.writeText(code).then(() => {
            const originalText = this.textContent;
            const originalBg = this.style.background;
            const originalColor = this.style.color;
            
            this.textContent = '✓ COPIÉ !';
            this.style.background = 'linear-gradient(135deg, #3b82f6, #60a5fa)';
            this.style.color = '#0a0a0a';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = originalBg;
                this.style.color = originalColor;
            }, 2000);
        }).catch(err => {
            console.error('Erreur de copie:', err);
        });
    });
});

// ==========================================
// FORMULAIRE DE CONTACT
// ==========================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        console.log('Formulaire soumis:', { name, email, message });
        
        // Afficher un message de confirmation simple
        alert(`Merci ${name} ! Votre message a été envoyé.`);
        
        contactForm.reset();
    });
}

// ==========================================
// INDICATEUR DE PROGRESSION DE LECTURE
// ==========================================
const createProgressBar = () => {
    const progressBar = document.createElement('div');
    progressBar.id = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 4px;
        background: linear-gradient(90deg, #3b82f6, #60a5fa);
        z-index: 10000;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
};

createProgressBar();

// ==========================================
// LAZY LOADING DES IMAGES
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('fade-in');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
});

// ==========================================
// PRÉCHARGEMENT DES RESSOURCES
// ==========================================
window.addEventListener('load', () => {
    const criticalImages = [
        'assets/actualite.jpeg',
        'assets/groupe.jpeg',
        'assets/val.jpeg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});

// ==========================================
// GESTION DE LA PRÉFÉRENCE DE MOUVEMENT RÉDUIT
// ==========================================
if (isReducedMotion) {
    document.documentElement.style.setProperty('--transition', 'none');
    console.log('✓ Mode mouvement réduit activé');
}

// ==========================================
// CONSOLE MESSAGE
// ==========================================
console.log('%cBlaBlaRun Club - Nancy', 'font-size: 24px; font-weight: bold; color: #3b82f6;');
console.log('%cCourir, Partager, Sourire.', 'font-size: 16px; color: #60a5fa; font-weight: 600;');
console.log('%cRendez-vous chaque mardi à 18h30 - Place Stanislas, Nancy', 'font-size: 14px; color: #b0b0b0;');

// ==========================================
// PERFORMANCE MONITORING
// ==========================================
window.addEventListener('load', () => {
    if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page chargée en ${pageLoadTime}ms`);
    }
});

// ==========================================
// STRIPE PAYMENT - ADHÉSION - TEMPORAIREMENT DÉSACTIVÉ
// ==========================================
// IMPORTANT: Remplacez 'YOUR_STRIPE_PUBLISHABLE_KEY' par votre vraie clé publique Stripe
// Obtenez votre clé sur: https://dashboard.stripe.com/apikeys
/*
const stripePublicKey = 'YOUR_STRIPE_PUBLISHABLE_KEY';
const stripe = window.Stripe ? window.Stripe(stripePublicKey) : null;

const checkoutButton = document.getElementById('checkout-button');

if (checkoutButton) {
    checkoutButton.addEventListener('click', async () => {
        if (!stripe) {
            alert('Erreur: Stripe n\'est pas chargé correctement.');
            return;
        }

        // Désactiver le bouton pour éviter les doubles clics
        checkoutButton.disabled = true;
        checkoutButton.textContent = 'Chargement...';

        try {
            // IMPORTANT: Vous devrez créer un endpoint sur votre serveur
            // Pour l'instant, ceci est un exemple avec Stripe Checkout
            // Vous aurez besoin de:
            // 1. Créer un compte Stripe: https://stripe.com
            // 2. Créer un produit "Adhésion BlaBlaRun" à 10€
            // 3. Créer une session de paiement côté serveur
            
            // Exemple de call API vers votre serveur (à créer)
            const response = await fetch('/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: 'price_XXXXXXXX', // Remplacer par votre Price ID Stripe
                    quantity: 1
                })
            });

            const session = await response.json();

            // Redirection vers Stripe Checkout
            const result = await stripe.redirectToCheckout({
                sessionId: session.id
            });

            if (result.error) {
                alert(result.error.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors du paiement. Veuillez réessayer.');
        } finally {
            // Réactiver le bouton
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Adhérer maintenant';
        }
    });
}
*/

// Alternative simple - Message "Bientôt disponible"
const checkoutButton = document.getElementById('checkout-button');
if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
        alert('Le système d\'adhésion en ligne arrive bientôt !\n\nEn attendant, venez nous rencontrer le mardi à 18h30 Place Stanislas pour adhérer sur place.');
        // Rediriger vers la section contact
        window.location.hash = '#rejoindre';
    });
}
