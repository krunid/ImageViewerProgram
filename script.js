document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const folderInput = document.getElementById('folder-input');
    const imagesContainer = document.getElementById('images-container');
    const statusMessage = document.getElementById('status-message');
    const loadingElement = document.getElementById('loading');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const imageCounter = document.getElementById('image-counter');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    // Modal elements
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalOkBtn = document.getElementById('modal-ok');
    const modalCloseBtn = document.querySelector('#modal-overlay .modal-close');
    
    // Manual elements
    const helpBtn = document.getElementById('help-btn');
    const manualModal = document.getElementById('manual-modal');
    const manualCloseBtn = document.getElementById('manual-close');
    const manualLink = document.getElementById('manual-link');
    const manualCloseX = document.querySelector('#manual-modal .modal-close');
    
    // Cookie notice
    const cookieNotice = document.getElementById('cookie-notice');
    const cookieAcceptBtn = document.querySelector('.cookie-accept');
    const cookieDeclineBtn = document.querySelector('.cookie-decline');
    
    // รายการรูปภาพ
    let images = [];
    let currentImageIndex = 0;
    
    // รายการพื้นหลังธรรมชาติ
    const natureBackgrounds = [
        'https://source.unsplash.com/1600x900/?nature,mountains',
        'https://source.unsplash.com/1600x900/?nature,forest',
        'https://source.unsplash.com/1600x900/?nature,beach',
        'https://source.unsplash.com/1600x900/?nature,sunset',
        'https://source.unsplash.com/1600x900/?nature,river',
        'https://source.unsplash.com/1600x900/?nature,waterfall',
        'https://source.unsplash.com/1600x900/?nature,lake',
        'https://source.unsplash.com/1600x900/?nature,sky'
    ];
    
    // สุ่มพื้นหลังเมื่อโหลดหน้า
    function setRandomBackground() {
        const randomIndex = Math.floor(Math.random() * natureBackgrounds.length);
        const imgUrl = natureBackgrounds[randomIndex];
        
        // สร้าง Image object เพื่อโหลดรูปภาพ
        const img = new Image();
        img.onload = function() {
            document.body.style.backgroundImage = `url('${imgUrl}')`;
            document.body.classList.add('bg-loaded');
        };
        img.onerror = function() {
            // ใช้สีพื้นหลังเป็นแบคอัพ
            document.body.style.backgroundColor = '#f0f7f0';
        };
        img.src = imgUrl;
    }
    
    // เรียกใช้ฟังก์ชันเมื่อโหลดหน้า
    setRandomBackground();
    
    // ฟังก์ชันแสดง modal popup
    function showModal(title, message) {
        modalTitle.textContent = title;
        modalBody.textContent = message;
        modalOverlay.style.display = 'flex';
    }
    
    // ปิด modal popup
    modalOkBtn.addEventListener('click', function() {
        modalOverlay.style.display = 'none';
    });
    
    modalCloseBtn.addEventListener('click', function() {
        modalOverlay.style.display = 'none';
    });
    
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    });
    
    // เปิดคู่มือการใช้งาน
    helpBtn.addEventListener('click', function() {
        manualModal.style.display = 'flex';
    });
    
    manualLink.addEventListener('click', function(e) {
        e.preventDefault();
        manualModal.style.display = 'flex';
    });
    
    // ปิดคู่มือการใช้งาน
    manualCloseBtn.addEventListener('click', function() {
        manualModal.style.display = 'none';
    });
    
    manualCloseX.addEventListener('click', function() {
        manualModal.style.display = 'none';
    });
    
    manualModal.addEventListener('click', function(e) {
        if (e.target === manualModal) {
            manualModal.style.display = 'none';
        }
    });
    
    // สุ่มแสดง cookie notice หลังจากโหลดหน้า 3 วินาที
    setTimeout(function() {
        if (Math.random() > 0.5) {
            cookieNotice.style.display = 'block';
        }
    }, 3000);
    
    // จัดการ cookie notice
    cookieAcceptBtn.addEventListener('click', function() {
        cookieNotice.style.display = 'none';
        showModal('ยืนยันการอัปโหลด', 'ยืนยันการอัปโหลดไฟล์เรียบร้อยแล้ว ขอบคุณที่ใช้บริการ');
    });
    
    cookieDeclineBtn.addEventListener('click', function() {
        cookieNotice.style.display = 'none';
    });
    
    // ฟังก์ชันอัพเดทข้อความสถานะ
    function updateStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
    }
    
    // จัดการกับการเลือกโฟลเดอร์
    folderInput.addEventListener('change', function(event) {
        const files = event.target.files;
        
        // ล้างข้อมูลรูปภาพเดิม
        imagesContainer.innerHTML = '';
        images = [];
        
        if (files.length === 0) {
            updateStatus('ไม่พบไฟล์ในโฟลเดอร์ที่เลือก', 'error');
            showModal('ไม่พบไฟล์', 'ไม่พบไฟล์ในโฟลเดอร์ที่เลือก กรุณาเลือกโฟลเดอร์ที่มีรูปภาพ');
            return;
        }
        
        // กรองเฉพาะไฟล์รูปภาพ
        const imageFiles = Array.from(files).filter(file => 
            file.type.startsWith('image/') || 
            /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(file.name)
        );
        
        if (imageFiles.length === 0) {
            updateStatus('ไม่พบไฟล์รูปภาพในโฟลเดอร์ที่เลือก', 'error');
            showModal('ไม่พบรูปภาพ', 'ไม่พบไฟล์รูปภาพในโฟลเดอร์ที่เลือก กรุณาเลือกโฟลเดอร์ที่มีรูปภาพ');
            return;
        }
        
        // ตรวจสอบจำนวนไฟล์
        if (imageFiles.length > 60) {
            cookieNotice.style.display = 'block';
        }
        
        // แสดงสถานะกำลังโหลด
        loadingElement.style.display = 'block';
        updateStatus(`กำลังโหลดรูปภาพ ${imageFiles.length} รูป...`, 'info');
        
        let loadedCount = 0;
        
        // โหลดและแสดงรูปภาพ
        imageFiles.forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // เก็บข้อมูลรูปภาพ
                const imageData = {
                    index: index,
                    name: file.name,
                    src: e.target.result
                };
                
                images.push(imageData);
                
                // สร้าง DOM element สำหรับรูปภาพ
                const imageItem = document.createElement('div');
                imageItem.className = 'image-item';
                imageItem.dataset.index = index;
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                
                // เพิ่ม event listener สำหรับ loading ของรูปภาพ
                img.onload = function() {
                    loadedCount++;
                    if (loadedCount === imageFiles.length) {
                        finishLoading();
                    }
                };
                
                img.onerror = function() {
                    loadedCount++;
                    if (loadedCount === imageFiles.length) {
                        finishLoading();
                    }
                };
                
                const nameElement = document.createElement('div');
                nameElement.className = 'image-name';
                nameElement.textContent = file.name;
                
                imageItem.appendChild(img);
                imageItem.appendChild(nameElement);
                
                // เพิ่ม event listener สำหรับการคลิก
                imageItem.addEventListener('click', function() {
                    openLightbox(index);
                });
                
                imagesContainer.appendChild(imageItem);
            };
            
            reader.onerror = function() {
                loadedCount++;
                console.error(`ไม่สามารถอ่านไฟล์ ${file.name} ได้`);
                
                if (loadedCount === imageFiles.length) {
                    finishLoading();
                }
            };
            
            // อ่านไฟล์เป็น Data URL
            reader.readAsDataURL(file);
        });
        
        // ฟังก์ชันเมื่อโหลดเสร็จสิ้น
        function finishLoading() {
            loadingElement.style.display = 'none';
            const successCount = images.length;
            
            if (successCount === imageFiles.length) {
                updateStatus(`แสดงรูปภาพทั้งหมด ${successCount} รูป`, 'success');
                showModal('สำเร็จ', `โหลดรูปภาพเสร็จสิ้น พบรูปภาพทั้งหมด ${successCount} รูป`);
            } else {
                updateStatus(`แสดงรูปภาพทั้งหมด ${successCount} รูป (มีบางรูปโหลดไม่สำเร็จ)`, 'success');
                showModal('สำเร็จบางส่วน', `โหลดรูปภาพเสร็จสิ้น แสดงได้ ${successCount} รูป จาก ${imageFiles.length} รูป`);
            }
            
            // เรียงลำดับรูปภาพตามชื่อไฟล์
            sortImages();
            
            // สุ่มพื้นหลังใหม่หลังจากโหลดรูปเสร็จ
            setRandomBackground();
        }
    });
    
    // ฟังก์ชันเรียงลำดับรูปภาพตามชื่อไฟล์
    function sortImages() {
        // เรียงลำดับข้อมูลรูปภาพ
        images.sort((a, b) => a.name.localeCompare(b.name));
        
        // อัพเดทดัชนีหลังจากเรียงลำดับ
        images.forEach((image, index) => {
            image.index = index;
        });
        
        // จัดเรียง DOM elements ใหม่
        const imageItems = imagesContainer.querySelectorAll('.image-item');
        const fragment = document.createDocumentFragment();
        
        images.forEach(image => {
            const item = Array.from(imageItems).find(el => el.querySelector('img').alt === image.name);
            if (item) {
                item.dataset.index = image.index;
                fragment.appendChild(item);
            }
        });
        
        imagesContainer.innerHTML = '';
        imagesContainer.appendChild(fragment);
    }
    
    // ฟังก์ชันเปิด lightbox
    function openLightbox(index) {
        if (images.length === 0) return;
        
        // ป้องกันดัชนีเกินขอบเขต
        currentImageIndex = Math.max(0, Math.min(index, images.length - 1));
        
        const image = images[currentImageIndex];
        lightboxImg.src = image.src;
        lightboxImg.alt = image.name;
        
        updateImageCounter();
        lightbox.style.display = 'block';
        
        // เพิ่ม event listener สำหรับปุ่มลูกศร
        document.addEventListener('keydown', handleKeyDown);
    }
    
    // ฟังก์ชันปิด lightbox
    function closeLightbox() {
        lightbox.style.display = 'none';
        document.removeEventListener('keydown', handleKeyDown);
    }
    
    // ฟังก์ชันเปลี่ยนรูปภาพในโหมด lightbox
    function changeImage(direction) {
        currentImageIndex += direction;
        
        // วนกลับเมื่อเลื่อนเกินขอบเขต
        if (currentImageIndex < 0) currentImageIndex = images.length - 1;
        if (currentImageIndex >= images.length) currentImageIndex = 0;
        
        const image = images[currentImageIndex];
        
        // สร้างการเปลี่ยนภาพแบบ fade effect
        lightboxImg.style.opacity = 0;
        
        setTimeout(() => {
            lightboxImg.src = image.src;
            lightboxImg.alt = image.name;
            lightboxImg.style.opacity = 1;
            updateImageCounter();
        }, 200);
    }
    
    // อัพเดทตัวนับรูปภาพ
    function updateImageCounter() {
        imageCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
    }
    
    // จัดการการกดปุ่มลูกศร
    function handleKeyDown(e) {
        if (e.key === 'ArrowLeft') {
            changeImage(-1);
        } else if (e.key === 'ArrowRight') {
            changeImage(1);
        } else if (e.key === 'Escape') {
            closeLightbox();
        }
    }
    
    // Event listeners สำหรับ lightbox
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => changeImage(-1));
    nextBtn.addEventListener('click', () => changeImage(1));
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // เพิ่ม swipe effect สำหรับมือถือ
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    lightbox.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            // Swipe left
            changeImage(1);
        }
        if (touchEndX > touchStartX + 50) {
            // Swipe right
            changeImage(-1);
        }
    }
});

// เพิ่ม event listener สำหรับการเลือกไฟล์แบบ multiple บนมือถือ
const filesInput = document.getElementById('files-input');
if (filesInput) {
    filesInput.addEventListener('change', function(event) {
        const files = event.target.files;
        handleImageFiles(files);
    });
}

// แยกฟังก์ชันการจัดการไฟล์รูปภาพออกมา เพื่อใช้ซ้ำได้
function handleImageFiles(files) {
    // ล้างข้อมูลรูปภาพเดิม
    imagesContainer.innerHTML = '';
    images = [];
    
    if (files.length === 0) {
        updateStatus('ไม่พบไฟล์ในการเลือก', 'error');
        showModal('ไม่พบไฟล์', 'ไม่พบไฟล์รูปภาพ กรุณาเลือกรูปภาพ');
        return;
    }
    
    // กรองเฉพาะไฟล์รูปภาพ
    const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/') || 
        /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(file.name)
    );
    
    // โค้ดการโหลดและแสดงรูปภาพต่อจากนี้...
}

// ปรับฟังก์ชันเดิมให้เรียกใช้ handleImageFiles
folderInput.addEventListener('change', function(event) {
    const files = event.target.files;
    handleImageFiles(files);
});
// ตรวจสอบว่าเป็นอุปกรณ์มือถือหรือไม่
function isMobileDevice() {
    return (window.innerWidth <= 768) || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// เมื่อโหลดหน้าเว็บเสร็จ ตรวจสอบอุปกรณ์และแสดงคำแนะนำที่เหมาะสม
if (isMobileDevice()) {
    showModal('คำแนะนำสำหรับมือถือ', 
        'ในอุปกรณ์มือถือ แนะนำให้ใช้ปุ่ม "เลือกรูปภาพหลายไฟล์" เพื่อเลือกรูปภาพหลายไฟล์พร้อมกัน');
}
