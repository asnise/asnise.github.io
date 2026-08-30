document.addEventListener('DOMContentLoaded', () => {
    
    
    const gallery = document.getElementById('portfolio-gallery');
    const menu = document.getElementById('portfolio-menu');
    const body = document.body;

    let isLoaderDismissed = false;

    function updateProgress(percent, statusText) {
        const fill = document.getElementById('progress-bar-fill');
        const percentEl = document.getElementById('loader-percent');
        const statusEl = document.getElementById('loader-status-text');

        if (fill) fill.style.width = `${Math.min(percent, 100)}%`;
        if (percentEl) percentEl.textContent = `${Math.min(Math.round(percent), 100)}%`;
        if (statusEl && statusText) statusEl.textContent = statusText;
    }

    function hideLoader() {
        if (isLoaderDismissed) return;
        isLoaderDismissed = true;

        updateProgress(100, 'Ready');
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader) {
                loader.classList.add('hidden');
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 400);
            }
        }, 180);
    }

    // 1. ฟังก์ชันสำหรับดึงข้อมูลจาก JSON
    async function loadPortfolioData() {
        updateProgress(20, 'Loading core assets...');
        try {
            updateProgress(45, 'Loading portfolio data...');
            const response = await fetch('portfolio-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            updateProgress(75, 'Rendering project gallery...');
            renderPortfolio(data);
            createMenu(data);

            updateProgress(90, 'Preparing media...');
            
            // Preload banner cover
            const coverImg = new Image();
            coverImg.onload = coverImg.onerror = () => {
                hideLoader();
            };
            coverImg.src = '/images/Cover.jpg';

            // Safeguard timeout to ensure zero delay
            setTimeout(hideLoader, 600);
        } catch (error) {
            console.error("Could not load portfolio data:", error);
            gallery.innerHTML = '<p>Sorry, the portfolio could not be loaded.</p>';
            hideLoader();
        }
    }

    // Helper function สำหรับสร้าง Lazy Media พร้อม Skeleton Ghost Placeholder
    function createLazyMedia(mediaUrl, altText, isModal = false) {
        const wrapper = document.createElement('div');
        wrapper.className = isModal ? 'modal-media-wrapper' : 'media-wrapper';

        const isVideo = mediaUrl && mediaUrl.match(/\.(mp4|webm|ogv)$/i);

        if (isVideo) {
            const video = document.createElement('video');
            video.className = (isModal ? 'modal-media' : 'artwork-image') + ' lazy-media';
            video.controls = true;
            video.autoplay = isModal;
            video.muted = true;
            video.preload = 'metadata';
            
            const onVideoLoaded = () => {
                video.classList.add('loaded');
                wrapper.classList.add('loaded');
            };

            video.addEventListener('loadeddata', onVideoLoaded);
            video.addEventListener('canplay', onVideoLoaded);
            video.src = mediaUrl;
            wrapper.appendChild(video);
            return wrapper;
        } else {
            const img = document.createElement('img');
            img.className = (isModal ? 'modal-media' : 'artwork-image') + ' lazy-media';
            img.alt = altText || 'Artwork';
            img.loading = 'lazy';

            const onLoaded = () => {
                img.classList.add('loaded');
                wrapper.classList.add('loaded');
            };

            img.addEventListener('load', onLoaded);
            img.addEventListener('error', onLoaded);
            
            img.src = mediaUrl;

            if (img.complete && img.naturalWidth > 0) {
                onLoaded();
            }

            wrapper.appendChild(img);
            return wrapper;
        }
    }

    // Counter animation utility for live stats
    function animateCounter(element, start, end, duration = 1200) {
        if (!element || isNaN(end)) return;
        const startTime = performance.now();
        function update(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * ease);
            element.textContent = current.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = end.toLocaleString();
            }
        }
        requestAnimationFrame(update);
    }

    // Dynamic scraper/fetcher for Blender Extensions platform download count
    async function fetchBlenderDownloads(slug, fallbackValue, targetElement) {
        if (!slug || !targetElement) return;

        const cacheKey = `blender_ext_dl_${slug}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            const cachedNum = parseInt(cached, 10);
            if (!isNaN(cachedNum)) {
                targetElement.textContent = cachedNum.toLocaleString();
                return;
            }
        }

        const targetUrl = `https://extensions.blender.org/add-ons/${slug}/`;
        const proxies = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
        ];

        for (const proxyUrl of proxies) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);

                const response = await fetch(proxyUrl, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) continue;
                const html = await response.text();
                const match = html.match(/<dt>\s*Downloads\s*<\/dt>\s*<dd>(\d+)<\/dd>/i);
                if (match && match[1]) {
                    const downloadCount = parseInt(match[1], 10);
                    if (!isNaN(downloadCount)) {
                        sessionStorage.setItem(cacheKey, downloadCount.toString());
                        const initialVal = fallbackValue ? parseInt(fallbackValue, 10) : 0;
                        animateCounter(targetElement, initialVal > 0 ? Math.floor(initialVal * 0.75) : 0, downloadCount);
                        return;
                    }
                }
            } catch (e) {
                // Continue to fallback
            }
        }
    }

    // 2. ฟังก์ชันสำหรับสร้าง HTML และแสดงผลในหน้าเว็บ
    function renderPortfolio(portfolioData) {
        if (!portfolioData || portfolioData.length === 0) {
            gallery.innerHTML = '<p>No portfolio items to display.</p>';
            return;
        }

        portfolioData.forEach(item => {
            const portfolioItem = document.createElement('section');
            portfolioItem.className = `portfolio-item layout-${item.layout}`;
            portfolioItem.id = item.name.replace(/\s/g, '-');

            const artworkContainer = document.createElement('div');
            artworkContainer.className = 'artwork-container';

            const artworkGrid = document.createElement('div');
            artworkGrid.className = 'artwork-grid';
            artworkGrid.dataset.count = item.images.length; 

            item.images.forEach(imageUrl => {
                const mediaWrapper = createLazyMedia(imageUrl, item.name, false);
                artworkGrid.appendChild(mediaWrapper);
            });

            artworkContainer.appendChild(artworkGrid);

            const artworkInfo = document.createElement('div');
            artworkInfo.className = 'artwork-info';
            const formattedDescription = item.description.replace(/\n/g, '<br>');
            artworkInfo.innerHTML = `
                <h2>${item.name}</h2>
                <p>${formattedDescription}</p>
            `;

            if (item.blender_addon_slug) {
                const statsBadge = document.createElement('div');
                statsBadge.className = 'addon-stats-badge';
                const initialCount = item.fallback_downloads ? Number(item.fallback_downloads).toLocaleString() : '4,565';
                statsBadge.innerHTML = `
                    <div class="stats-live-dot" title="Live Sync Active"></div>
                    <i class="fa-solid fa-cloud-arrow-down stats-icon"></i>
                    <span class="stats-text"><strong class="stats-count" id="blender-count-${item.blender_addon_slug}">${initialCount}</strong> Downloads on Blender Extensions</span>
                `;
                artworkInfo.appendChild(statsBadge);
                
                const countEl = statsBadge.querySelector('.stats-count');
                fetchBlenderDownloads(item.blender_addon_slug, item.fallback_downloads, countEl);
            }
            
            const buttonsToRender = item.buttons || (item.button ? [item.button] : []);
            if (buttonsToRender.length > 0) {
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'portfolio-button-group';
                buttonContainer.style.display = 'flex';
                buttonContainer.style.gap = '10px';
                buttonContainer.style.flexWrap = 'wrap';

                buttonsToRender.forEach(btn => {
                    const buttonLink = document.createElement('a');
                    buttonLink.href = btn.link;
                    buttonLink.className = 'portfolio-button';
                    buttonLink.textContent = btn.name;
                    buttonLink.target = '_blank';
                    if (btn.link === "Openimage" && btn.another_url) {
                        buttonLink.addEventListener('click', (event) => {
                            event.preventDefault();
                            openImageModal(btn.another_url);
                        });
                    }
                    buttonContainer.appendChild(buttonLink);
                });
                artworkInfo.appendChild(buttonContainer);
            }

            portfolioItem.appendChild(artworkContainer);
            if (item.layout !== 'full-width') {
                portfolioItem.appendChild(artworkInfo);
            }
            
            gallery.appendChild(portfolioItem);
        });
    }

    // ฟังก์ชันใหม่: สร้างเมนู Jump Directory สำหรับนำทาง
    function createMenu(portfolioData) {
        menu.innerHTML = `
            <div class="menu-brand">
                <span class="menu-label">INDEX</span>
                <span class="menu-divider">/</span>
                <span class="project-count">${portfolioData.length} WORKS</span>
            </div>
            <div class="jump-dropdown-container">
                <button class="jump-dropdown-btn" id="jump-dropdown-btn" aria-haspopup="true" aria-expanded="false">
                    <span class="jump-current-title" id="jump-current-title">Select Work</span>
                    <svg class="jump-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div class="jump-dropdown-menu" id="jump-dropdown-menu">
                    <div class="jump-dropdown-header">
                        <span>Directory</span>
                        <a href="#" class="jump-to-top">↑ Top</a>
                    </div>
                    <div class="jump-dropdown-list" id="jump-dropdown-list">
                    </div>
                </div>
            </div>
        `;

        const list = document.getElementById('jump-dropdown-list');
        const dropdownBtn = document.getElementById('jump-dropdown-btn');
        const dropdownMenu = document.getElementById('jump-dropdown-menu');

        portfolioData.forEach((item, index) => {
            if (item.name) {
                const id = item.name.replace(/\s/g, '-');
                const link = document.createElement('a');
                link.href = `#${id}`;
                link.className = 'jump-dropdown-item';
                link.dataset.id = id;
                
                const num = (index + 1).toString().padStart(2, '0');
                link.innerHTML = `
                    <span class="jump-item-num">${num}</span>
                    <span class="jump-item-name">${item.name}</span>
                `;

                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    dropdownMenu.classList.remove('open');
                    dropdownBtn.classList.remove('active');
                    dropdownBtn.setAttribute('aria-expanded', 'false');
                    const targetEl = document.getElementById(id);
                    if (targetEl) {
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });

                list.appendChild(link);
            }
        });

        // Toggle dropdown
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdownMenu.classList.toggle('open');
            dropdownBtn.classList.toggle('active', isOpen);
            dropdownBtn.setAttribute('aria-expanded', isOpen);
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target)) {
                dropdownMenu.classList.remove('open');
                dropdownBtn.classList.remove('active');
                dropdownBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Top button inside dropdown
        const topLink = menu.querySelector('.jump-to-top');
        if (topLink) {
            topLink.addEventListener('click', (e) => {
                e.preventDefault();
                dropdownMenu.classList.remove('open');
                dropdownBtn.classList.remove('active');
                dropdownBtn.setAttribute('aria-expanded', 'false');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    // ฟังก์ชันใหม่: openImageModal พร้อม Ghost Skeleton Loader
    function openImageModal(images) {
        const modal = document.getElementById('image-modal');
        const modalImageContainer = modal.querySelector('.modal-image-container');
        const closeButton = modal.querySelector('.modal-close-button');

        modalImageContainer.innerHTML = '';

        images.forEach(item => {
            const mediaUrl = typeof item === 'string' ? item : item.url;
            const title = typeof item === 'object' ? item.title : null;
            const description = typeof item === 'object' ? item.description : null;

            if (!mediaUrl) return;

            const mediaWrapper = createLazyMedia(mediaUrl, title || 'Artwork detail', true);

            if (title || description) {
                const card = document.createElement('div');
                card.className = 'modal-card';
                card.appendChild(mediaWrapper);

                const info = document.createElement('div');
                info.className = 'modal-card-info';
                
                if (title) {
                    const h3 = document.createElement('h3');
                    h3.className = 'modal-card-title';
                    h3.textContent = title;
                    info.appendChild(h3);
                }

                if (description) {
                    const p = document.createElement('div');
                    p.className = 'modal-card-desc';
                    p.innerHTML = description.replace(/\n/g, '<br>');
                    info.appendChild(p);
                }

                card.appendChild(info);
                modalImageContainer.appendChild(card);
            } else {
                modalImageContainer.appendChild(mediaWrapper);
            }
        });
        
        body.classList.add('modal-open');
        modal.classList.add('active');
        // Push state เมื่อ modal เปิด เพื่อรองรับการกด Back
        history.pushState({ modalOpen: true }, '');

        const closeModal = () => {
            modal.classList.remove('active');
            body.classList.remove('modal-open');
        };

        closeButton.onclick = closeModal;

        modal.onclick = (event) => {
            if (event.target === modal) {
                closeModal();
            }
        };
    }

    // ฟังก์ชันสำหรับปิด modal ทั้งหมด
    function closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay.active');
        modals.forEach(modal => {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        });
    }

    // รองรับการกด Esc เพื่อปิด modal
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            closeAllModals();
        }
    });

    // รองรับการกด Back (popstate) บนโทรศัพท์
    window.addEventListener('popstate', (e) => {
        closeAllModals();
    });

    // ฟังก์ชัน: updateActiveMenu สำหรับ Dropdown Jump List
    function updateActiveMenu() {
        const sections = document.querySelectorAll('.portfolio-item');
        let activeSection = null;
        const center = window.innerHeight / 3;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= center && rect.bottom >= center) {
                activeSection = section;
            }
        });
        
        const items = document.querySelectorAll('.jump-dropdown-item');
        items.forEach(item => item.classList.remove('active'));
        
        const currentTitleEl = document.getElementById('jump-current-title');
        if (activeSection) {
            const activeItem = document.querySelector(`.jump-dropdown-item[data-id="${activeSection.id}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
                if (currentTitleEl) {
                    const itemName = activeItem.querySelector('.jump-item-name');
                    if (itemName) {
                        currentTitleEl.textContent = itemName.textContent;
                    }
                }
            }
        } else if (window.scrollY < 200 && currentTitleEl) {
            currentTitleEl.textContent = "Select Project";
        }
    }

    window.addEventListener('scroll', updateActiveMenu);
    window.addEventListener('resize', updateActiveMenu);

    // Optionally call on load to set the active menu immediately.
    updateActiveMenu();

    // เริ่มต้นกระบวนการทั้งหมด
    loadPortfolioData();
});



function initBannerCarousel() {
    const carouselInner = document.querySelector('.carousel-inner');
    const prevButton = document.querySelector('.carousel-control-prev');
    const nextButton = document.querySelector('.carousel-control-next');
    const items = document.querySelectorAll('.carousel-item');
    
    if (!carouselInner || !prevButton || !nextButton || items.length === 0) {
        return;
    }

    let currentIndex = 0;
    const totalItems = items.length;
    
    function updateCarousel() {
        const translateX = -currentIndex * 100;
        carouselInner.style.transform = `translateX(${translateX}%)`;
    }
    
    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        updateCarousel();
    });
    
    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
    });

    setInterval(() => {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    initBannerCarousel();
});