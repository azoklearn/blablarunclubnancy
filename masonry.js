class MasonryGallery {
  constructor(element, options = {}) {
    this.container = element;
    this.options = {
      ease: 'power3.out',
      duration: 0.6,
      stagger: 0.05,
      animateFrom: 'bottom',
      scaleOnHover: true,
      hoverScale: 0.95,
      blurToFocus: true,
      colorShiftOnHover: false,
      columns: this.getColumns(),
      ...options
    };

    this.items = [];
    this.grid = [];
    this.imagesReady = false;
    this.hasMounted = false;
    this.width = 0;

    this.masonryInstance = null;
    this.init();
  }

  getColumns() {
    if (window.matchMedia('(min-width: 1500px)').matches) return 5;
    if (window.matchMedia('(min-width: 1000px)').matches) return 4;
    if (window.matchMedia('(min-width: 600px)').matches) return 3;
    if (window.matchMedia('(min-width: 400px)').matches) return 2;
    return 1;
  }

  init() {
    this.container.classList.add('list');
    this.loadItems();
    this.setupResize();
    this.preloadImages().then(() => {
      this.render();
    });
  }

  loadItems() {
    const itemElements = this.container.querySelectorAll('.masonry-item');
    this.items = Array.from(itemElements).map((el, index) => {
      const img = el.querySelector('img');
      const height = parseInt(el.dataset.height) || this.calculateImageHeight(img);
      return {
        id: el.dataset.id || `item-${index}`,
        img: img ? img.src : el.dataset.img || '',
        url: el.dataset.url || '#',
        height: height
      };
    });
  }

  calculateImageHeight(img) {
    if (!img) return 300;
    return img.naturalHeight || 300;
  }

  setupResize() {
    this.resizeObserver = new ResizeObserver(() => {
      const rect = this.container.getBoundingClientRect();
      this.width = rect.width;
      this.options.columns = this.getColumns();
      this.updateGrid();
    });
    this.resizeObserver.observe(this.container);

    window.addEventListener('resize', () => {
      this.options.columns = this.getColumns();
      this.updateGrid();
    });
  }

  async preloadImages() {
    const urls = this.items.map(item => item.img).filter(url => url);
    if (urls.length === 0) {
      this.imagesReady = true;
      return;
    }
    
    await Promise.all(
      urls.map(
        src =>
          new Promise(resolve => {
            const img = new Image();
            img.src = src;
            img.onload = img.onerror = () => resolve();
          })
      )
    );
    this.imagesReady = true;
    const rect = this.container.getBoundingClientRect();
    if (rect.width > 0) {
      this.width = rect.width;
      this.updateGrid();
    }
  }

  getInitialPosition(item) {
    const containerRect = this.container.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction = this.options.animateFrom;

    if (direction === 'random') {
      const directions = ['top', 'bottom', 'left', 'right'];
      direction = directions[Math.floor(Math.random() * directions.length)];
    }

    switch (direction) {
      case 'top':
        return { x: item.x, y: -200 };
      case 'bottom':
        return { x: item.x, y: window.innerHeight + 200 };
      case 'left':
        return { x: -200, y: item.y };
      case 'right':
        return { x: window.innerWidth + 200, y: item.y };
      case 'center':
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  }

  updateGrid() {
    if (!this.width || !this.imagesReady) return;

    const columns = this.options.columns;
    const colHeights = new Array(columns).fill(0);
    const columnWidth = this.width / columns;

    this.grid = this.items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;
      const height = child.height / 2;
      const y = colHeights[col];

      colHeights[col] += height;

      return { ...child, x, y, w: columnWidth, h: height };
    });

    // Mettre à jour le height du container
    const maxHeight = Math.max(...colHeights);
    this.container.style.minHeight = `${maxHeight}px`;

    // Si déjà monté, juste animer. Sinon render() sera appelé après preloadImages()
    if (this.hasMounted) {
      this.animateGrid();
    } else if (this.imagesReady) {
      this.render();
    }
  }

  animateGrid() {
    if (typeof gsap === 'undefined') {
      console.error('GSAP is required for MasonryGallery');
      return;
    }

    this.grid.forEach((item, index) => {
      const element = this.container.querySelector(`[data-key="${item.id}"]`);
      if (!element) return;

      const animationProps = {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h
      };

      if (!this.hasMounted) {
        const initialPos = this.getInitialPosition(item);
        const initialState = {
          opacity: 0,
          x: initialPos.x,
          y: initialPos.y,
          width: item.w,
          height: item.h,
          ...(this.options.blurToFocus && { filter: 'blur(10px)' })
        };

        gsap.fromTo(element, initialState, {
          opacity: 1,
          ...animationProps,
          ...(this.options.blurToFocus && { filter: 'blur(0px)' }),
          duration: 0.8,
          ease: this.options.ease,
          delay: index * this.options.stagger
        });
      } else {
        gsap.to(element, {
          ...animationProps,
          duration: this.options.duration,
          ease: this.options.ease,
          overwrite: 'auto'
        });
      }
    });

    this.hasMounted = true;
  }

  handleMouseEnter(e, item) {
    const element = e.currentTarget;
    const selector = `[data-key="${item.id}"]`;
    const elem = this.container.querySelector(selector);
    if (!elem) return;

    if (this.options.scaleOnHover) {
      gsap.to(elem, {
        scale: this.options.hoverScale,
        duration: 0.3,
        ease: 'power2.out'
      });
    }

    if (this.options.colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0.3,
          duration: 0.3
        });
      }
    }
  }

  handleMouseLeave(e, item) {
    const element = e.currentTarget;
    const selector = `[data-key="${item.id}"]`;
    const elem = this.container.querySelector(selector);
    if (!elem) return;

    if (this.options.scaleOnHover) {
      gsap.to(elem, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }

    if (this.options.colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.3
        });
      }
    }
  }

  render() {
    // Ne pas vider si le conteneur a déjà des éléments rendus et que nous sommes en mode update
    if (!this.hasMounted) {
      // Cacher les éléments sources
      const sourceItems = this.container.querySelectorAll('.masonry-item');
      sourceItems.forEach(item => {
        item.style.display = 'none';
      });
    }
    
    // Créer ou mettre à jour les éléments de la grille
    this.grid.forEach(item => {
      let wrapper = this.container.querySelector(`[data-key="${item.id}"]`);
      
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'item-wrapper';
        wrapper.dataset.key = item.id;
        wrapper.style.position = 'absolute';
        wrapper.style.cursor = 'pointer';
        wrapper.style.borderRadius = '8px';
        wrapper.style.overflow = 'hidden';

        wrapper.addEventListener('click', () => {
          // Ouvrir l'image dans le lightbox
          this.openImageInLightbox(item);
        });

        wrapper.addEventListener('mouseenter', (e) => this.handleMouseEnter(e, item));
        wrapper.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, item));

        const imgDiv = document.createElement('div');
        imgDiv.className = 'item-img';
        imgDiv.style.backgroundImage = `url(${item.img})`;
        imgDiv.style.width = '100%';
        imgDiv.style.height = '100%';
        imgDiv.style.backgroundSize = 'cover';
        imgDiv.style.backgroundPosition = 'center';
        imgDiv.style.backgroundRepeat = 'no-repeat';

        wrapper.appendChild(imgDiv);

        if (this.options.colorShiftOnHover) {
          const overlay = document.createElement('div');
          overlay.className = 'color-overlay';
          wrapper.appendChild(overlay);
        }

        this.container.appendChild(wrapper);
      }
    });
    
    if (this.imagesReady && this.grid.length > 0) {
      requestAnimationFrame(() => this.animateGrid());
    }
  }

  openImageInLightbox(item) {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    
    if (!lightbox || !lightboxImg) return;
    
    // Créer des éléments img temporaires pour chaque image de la galerie Masonry
    // Cela permettra au système de navigation du lightbox de fonctionner
    if (window.masonryImagesForLightbox) {
      // Nettoyer les anciennes images
      window.masonryImagesForLightbox.forEach(img => {
        if (img.parentNode) img.parentNode.removeChild(img);
      });
    }
    
    window.masonryImagesForLightbox = this.items.map(itemData => {
      const img = document.createElement('img');
      img.src = itemData.img;
      img.alt = itemData.alt || 'Photo du club BlaBlaRun';
      img.style.display = 'none';
      document.body.appendChild(img);
      return img;
    });
    
    // Trouver l'index de l'image actuelle
    const currentIndex = this.items.findIndex(i => i.id === item.id);
    
    // Mettre à jour les variables globales du lightbox
    if (typeof window !== 'undefined') {
      window.allClickableImages = window.masonryImagesForLightbox;
      window.currentImageIndex = currentIndex >= 0 ? currentIndex : 0;
    }
    
    // Afficher l'image dans le lightbox
    lightboxImg.src = item.img;
    lightboxImg.alt = item.alt || 'Photo du club BlaBlaRun';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Mettre à jour les boutons de navigation
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    
    if (this.items.length > 1) {
      if (lightboxPrev) lightboxPrev.style.display = 'flex';
      if (lightboxNext) lightboxNext.style.display = 'flex';
    } else {
      if (lightboxPrev) lightboxPrev.style.display = 'none';
      if (lightboxNext) lightboxNext.style.display = 'none';
    }
  }
  
  getMasonryImages() {
    return this.items.map(item => {
      const img = document.createElement('img');
      img.src = item.img;
      img.alt = item.alt || 'Photo du club BlaBlaRun';
      return img;
    });
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

