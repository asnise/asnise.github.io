document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('portfolio-gallery');
    const menu = document.getElementById('portfolio-menu');
    const body = document.body;

    // 1. ฟังก์ชันสำหรับดึงข้อมูลจาก JSON
    async function loadPortfolioData() {
        try {
            const response = await fetch('portfolio-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            renderPortfolio(data);
            createMenu(data);
        } catch (error) {
            console.error("Could not load portfolio data:", error);
            gallery.innerHTML = '<p>Sorry, the portfolio could not be loaded.</p>';
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
                const isVideo = imageUrl.match(/\.(mp4|webm|ogv)$/i);
                
                if (isVideo) {
                    const video = document.createElement('video');
                    video.src = imageUrl;
                    video.controls = true;
                    video.autoplay = false;
                    video.muted = true;
                    video.className = 'artwork-image';
                    artworkGrid.appendChild(video);
                } else {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = item.name;
                    img.className = 'artwork-image';
                    artworkGrid.appendChild(img);
                }
            });

            artworkContainer.appendChild(artworkGrid);

            const artworkInfo = document.createElement('div');
            artworkInfo.className = 'artwork-info';
            const formattedDescription = item.description.replace(/\n/g, '<br>');
            artworkInfo.innerHTML = `
                <h2>${item.name}</h2>
                <p>${formattedDescription}</p>
            `;
            
            if (item.button) {
                const buttonLink = document.createElement('a');
                buttonLink.href = item.button.link;
                buttonLink.className = 'portfolio-button';
                buttonLink.textContent = item.button.name;
                buttonLink.target = '_blank';
                artworkInfo.appendChild(buttonLink);
                
                if (item.button.link === "Openimage" && item.button.another_url) {
                    buttonLink.addEventListener('click', (event) => {
                        event.preventDefault();
                        openImageModal(item.button.another_url);
                    });
                } 
            
            }

            portfolioItem.appendChild(artworkContainer);
            if (item.layout !== 'full-width') {
                portfolioItem.appendChild(artworkInfo);
            }
            
            gallery.appendChild(portfolioItem);
        });

        setupIntersectionObserver();
    }

    // ฟังก์ชันใหม่: สร้างเมนูปุ่มสำหรับนำทาง
    function createMenu(portfolioData) {
        portfolioData.forEach(item => {
            if (item.name) {
                const button = document.createElement('a');
                button.href = `#${item.name.replace(/\s/g, '-')}`;
                button.textContent = item.name;
                button.className = 'menu-button';
                menu.appendChild(button);
            }
        });
    }

    // ฟังก์ชันใหม่: openImageModal
    function openImageModal(images) {
        const modal = document.getElementById('image-modal');
        const modalImageContainer = modal.querySelector('.modal-image-container');
        const closeButton = modal.querySelector('.modal-close-button');

        modalImageContainer.innerHTML = '';

        images.forEach(mediaUrl => {
            const isVideo = mediaUrl.match(/\.(mp4|webm|ogv)$/i);

            if (isVideo) {
                const video = document.createElement('video');
                video.src = mediaUrl;
                video.controls = true;
                video.className = 'modal-media';
                video.autoplay = true;
                video.muted = true;
                modalImageContainer.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = mediaUrl;
                img.alt = 'Artwork detail';
                img.className = 'modal-media';
                modalImageContainer.appendChild(img);
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

    // โค้ดที่แก้ไข: ทำให้แอนิเมชันทำงานซ้ำได้
    function setupIntersectionObserver() {
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                } else {
                    entry.target.classList.remove('visible');
                }
            });
        }, observerOptions);

        portfolioItems.forEach(item => {
            observer.observe(item);
        });
    }

    // ฟังก์ชันใหม่: updateActiveMenu
    function updateActiveMenu() {
        const sections = document.querySelectorAll('.portfolio-item');
        let activeSection = null;
        const center = window.innerHeight / 2;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= center && rect.bottom >= center) {
                activeSection = section;
            }
        });
        
        const menuButtons = document.querySelectorAll('.menu-button');
        menuButtons.forEach(btn => btn.classList.remove('active'));
        
        if (activeSection) {
            const activeMenu = document.querySelector(`.menu-button[href="#${activeSection.id}"]`);
            if (activeMenu) {
                activeMenu.classList.add('active');
            }
        }
    }

    window.addEventListener('scroll', updateActiveMenu);
    window.addEventListener('resize', updateActiveMenu);

    // Optionally call on load to set the active menu immediately.
    updateActiveMenu();

    // เริ่มต้นกระบวนการทั้งหมด
    loadPortfolioData();
});

document.addEventListener("DOMContentLoaded", function() {
    const portfolioItems = document.querySelectorAll(".portfolio-item");
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.1 });

    portfolioItems.forEach(item => {
        observer.observe(item);
    });
});

window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500); // Match the CSS transition duration
    }
});

function initBannerCarousel() {
    const carouselInner = document.querySelector('.carousel-inner');
    const prevButton = document.querySelector('.carousel-control-prev');
    const nextButton = document.querySelector('.carousel-control-next');
    const items = document.querySelectorAll('.carousel-item');
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

    // เลื่อนอัตโนมัติทุก 5 วินาที
    setInterval(() => {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    initBannerCarousel();
    // …existing code สำหรับ portfolio และ modal…
});