document.addEventListener('DOMContentLoaded', () => {
    // Load actual gallery images
    const galleryData = [];
    
    // Create ordered pairs of macro and photography images
    for (let i = 1; i <= 52; i++) {
        // Add Macrophotography image
        galleryData.push({
            id: i * 2 - 1, // Odd IDs for macro images
            src: `images/Macrophotography/${i}.jpg`,
            thumbnail: `images/Macrophotography/${i}.jpg`,
            title: `Macro ${i}`,
            category: 'macro',
            description: `Macrophotography image ${i}`
        });
        
        // Add corresponding Photography image if it exists (for 1-1.jpg to 6-1.jpg)
        if (i <= 24) {
            galleryData.push({
                id: i * 2, // Even IDs for photography images
                src: `images/Photography/${i}-1.jpg`,
                thumbnail: `images/Photography/${i}-1.jpg`,
                title: `Photo ${i}`,
                category: 'photography',
                description: `Photography image ${i}-1`
            });
        }
    }
    
    // Add the special P3261247_DxO.jpg file at the end
    galleryData.push({
        id: 100,
        src: 'images/Macrophotography/P3261247_DxO.jpg',
        thumbnail: 'images/Macrophotography/P3261247_DxO.jpg',
        title: 'Special Macro',
        category: 'macro',
        description: 'Special macrophotography image'
    });

    // DOM Elements
    const gallery = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxSpinner = document.getElementById('lightbox-spinner');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const closeBtn = document.querySelector('.close');
    const prevPreview = document.getElementById('prev-preview');
    const nextPreview = document.getElementById('next-preview');
    const prevPreviewContainer = prevPreview.parentElement;
    const nextPreviewContainer = nextPreview.parentElement;
    const navItems = document.querySelectorAll('nav li');

    let currentImageIndex = 0;
    let filteredImages = [...galleryData];
    let lastDirection = ''; // Track last navigation direction

    // Initialize gallery
    function initGallery() {
        renderGallery(filteredImages);
        setupEventListeners();
    }

    // Render gallery items
    function renderGallery(images) {
        gallery.innerHTML = '';
        
        if (images.length === 0) {
            gallery.innerHTML = '<p class="no-images">No images found in this category.</p>';
            return;
        }

        images.forEach((item, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-index', index);
            
            // Add loading spinner
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            galleryItem.appendChild(spinner);
            
            const img = document.createElement('img');
            img.alt = item.title;
            img.loading = 'lazy';
            
            // Handle image loading
            img.onload = function() {
                galleryItem.classList.add('loaded');
                img.style.opacity = 1;
            };
            
            // Set initial opacity to 0
            img.style.opacity = 0;
            img.style.transition = 'opacity 0.3s ease';
            
            // Set src after adding onload handler
            img.src = item.thumbnail;
            
            galleryItem.appendChild(img);
            gallery.appendChild(galleryItem);
        });
    }

    // Setup event listeners
    function setupEventListeners() {
        // Gallery item click/touch
        gallery.addEventListener('click', (e) => {
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem) {
                const index = parseInt(galleryItem.getAttribute('data-index'));
                openLightbox(index);
            }
        });

        // Close lightbox when clicking outside the image or on X button
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeLightbox();
        });
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Preview clicks
        prevPreviewContainer.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent lightbox from closing
            showPrevImage();
        });
        
        nextPreviewContainer.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent lightbox from closing
            showNextImage();
        });
        
        // Swipe handling for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left - show next image
                showNextImage();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right - show previous image
                showPrevImage();
            }
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.style.display || lightbox.style.display === 'none') return;
            
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrevImage();
            if (e.key === 'ArrowRight') showNextImage();
        });
        
        // Handle orientation change for mobile
        window.addEventListener('orientationchange', () => {
            if (lightbox.style.display === 'block') {
                // Small delay to allow orientation to complete
                setTimeout(() => {
                    updateLightboxContent();
                }, 200);
            }
        });

        // Category filter
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Update active class
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Filter images
                const category = item.getAttribute('data-category');
                filterGallery(category);
            });
        });
    }

    // Filter gallery by category
    function filterGallery(category) {
        if (category === 'all') {
            filteredImages = [...galleryData];
        } else {
            filteredImages = galleryData.filter(item => item.category === category);
        }
        renderGallery(filteredImages);
    }

    // Open lightbox
    function openLightbox(index) {
        currentImageIndex = index;
        lastDirection = ''; // Reset direction when opening
        updateLightboxContent();
        lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    // Close lightbox
    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Update lightbox content
    function updateLightboxContent() {
        const currentImage = filteredImages[currentImageIndex];
        
        // Reset image opacity and show spinner
        lightboxImg.style.opacity = 0;
        lightboxSpinner.style.display = 'block';
        
        // Set up onload handler before setting src
        lightboxImg.onload = function() {
            // Hide spinner and show image
            lightboxSpinner.style.display = 'none';
            lightboxImg.style.opacity = 1;
        };
        
        // Set image src and alt
        lightboxImg.src = currentImage.src;
        lightboxImg.alt = currentImage.title;
        lightboxCaption.textContent = ''; // Remove caption text
        
        // Update preview images
        updatePreviewImages();
    }
    
    // Update preview images
    function updatePreviewImages() {
        const prevIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
        const nextIndex = (currentImageIndex + 1) % filteredImages.length;
        
        prevPreview.src = filteredImages[prevIndex].thumbnail;
        nextPreview.src = filteredImages[nextIndex].thumbnail;
        
        // Reset active classes
        prevPreviewContainer.classList.remove('active');
        nextPreviewContainer.classList.remove('active');
        
        // Set active class based on navigation direction
        if (lastDirection === 'prev') {
            nextPreviewContainer.classList.add('active');
        } else if (lastDirection === 'next') {
            prevPreviewContainer.classList.add('active');
        }
    }

    // Show previous image
    function showPrevImage() {
        lastDirection = 'prev';
        currentImageIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
        updateLightboxContent();
    }

    // Show next image
    function showNextImage() {
        lastDirection = 'next';
        currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
        updateLightboxContent();
    }

    // Initialize the gallery
    initGallery();
});