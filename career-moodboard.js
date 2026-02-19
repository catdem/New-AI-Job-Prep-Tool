// Career Moodboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Pexels API configuration
    const PEXELS_ACCESS_KEY = 'z5qwUhYoYREQBAd2LAe3yfng5dmQbk4hq27nQJ4ueZMWxxmMM0wMAtPl'; // Your Pexels API key
    const PEXELS_API_URL = 'https://api.pexels.com/v1/search';
    
    // Unsplash API configuration
    // To use real Unsplash images, get your API key from https://unsplash.com/developers
    // Create a developer account, register your app, and replace the empty string below
    const UNSPLASH_ACCESS_KEY = ''; // Add your Unsplash access key here
    const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
    
    // DOM elements
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const imageGrid = document.getElementById('results');
    const loading = document.getElementById('loading');
    const moodboardCanvas = document.getElementById('moodboard');
    const exportBtn = document.getElementById('export-btn');
    const exportOptions = document.getElementById('export-options');
    const exportMessage = document.getElementById('export-message');
    const exportPngBtn = document.getElementById('export-png');
    const exportPdfBtn = document.getElementById('export-pdf');
    const cancelExportBtn = document.getElementById('cancel-export');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadMoreContainer = document.querySelector('.load-more-container');
    const noMoreResultsMsg = document.getElementById('no-more-results');
    
    // Moodboard state
    let moodboardImages = [];
    let currentSearchResults = [];
    
    // LocalStorage key for moodboard persistence
    const MOODBOARD_STORAGE_KEY = 'career-moodboard-images';
    
    // Pagination state
    let currentPage = 1;
    let currentSearchTerm = '';
    let hasMoreResults = true;
    
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Initialize moodboard from LocalStorage on page load
    loadMoodboardFromStorage();
    
    async function performSearch() {
        const query = searchInput.value.trim();
        if (!query) {
            alert('Please enter a search term');
            return;
        }
        
        // Reset pagination for new search
        currentPage = 1;
        currentSearchTerm = query;
        hasMoreResults = true;
        
        loading.style.display = 'block';
        imageGrid.innerHTML = '';
        loadMoreContainer.style.display = 'none';
        noMoreResultsMsg.style.display = 'none';
        
        try {
            const images = await searchImages(query, currentPage);
            
            if (images && images.length > 0) {
                console.log('Found', images.length, 'images');
                displaySearchResults(images);
                showLoadMoreButton();
            } else {
                console.log('No results found');
                showNoResultsMessage();
            }
            
        } catch (error) {
            console.error('Search error:', error);
            // Fallback to demo images on error
            console.log('Falling back to demo images');
            await simulateAPICall(query);
        } finally {
            loading.style.display = 'none';
        }
    }
    
    // Function to search for images
    async function searchImages(query, page = 1) {
        console.log('Searching for:', query, 'Page:', page);
        
        // Use Pexels by default since we have the API key configured
        const selectedService = 'pexels';
        console.log('Using service:', selectedService);
        
        try {
            let images;
            
            if (selectedService === 'pexels') {
                if (PEXELS_ACCESS_KEY && PEXELS_ACCESS_KEY.trim() !== '') {
                    console.log('Using Pexels API');
                    images = await searchWithPexels(query, page);
                } else {
                    console.log('No Pexels API key found, falling back to Lorem Picsum');
                    showApiKeyMessage();
                    images = await searchWithPicsum(query);
                }
            } else if (selectedService === 'unsplash' && UNSPLASH_ACCESS_KEY && UNSPLASH_ACCESS_KEY.trim() !== '') {
                // Use Unsplash API if selected and key is available
                console.log('Using Unsplash API');
                const response = await fetch(`${UNSPLASH_API_URL}?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape&page=${page}`, {
                    headers: {
                        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Unsplash API error: ${response.status}`);
                }
                
                const data = await response.json();
                images = data.results;
                console.log('Fetched', images.length, 'images from Unsplash');
            } else if (selectedService === 'unsplash') {
                // Unsplash selected but no API key
                console.log('Unsplash selected but no API key, showing message');
                showApiKeyMessage();
                images = await searchWithPicsum(query);
            } else {
                // Use Lorem Picsum (default)
                console.log('Using Lorem Picsum');
                images = await searchWithPicsum(query);
            }
            
            return images || [];
            
        } catch (error) {
            console.error('Search failed:', error);
            
            // Fallback to Lorem Picsum if anything fails
            try {
                console.log('Falling back to Lorem Picsum');
                const images = await searchWithPicsum(query);
                if (selectedService === 'unsplash') {
                    showApiKeyMessage();
                }
                return images;
            } catch (fallbackError) {
                console.error('All image sources failed:', fallbackError);
                // Final fallback to demo images
                return simulateAPICall(query);
            }
        }
    }
    
    // Function to search for images using Pexels API (accurate search results)
    async function searchWithPexels(query, page = 1) {
        console.log('Using Pexels API for query:', query, 'Page:', page);
        
        if (!PEXELS_ACCESS_KEY || PEXELS_ACCESS_KEY.trim() === '') {
            console.log('No Pexels API key provided');
            throw new Error('Pexels API key required');
        }
        
        try {
            const response = await fetch(`${PEXELS_API_URL}?query=${encodeURIComponent(query)}&per_page=12&page=${page}`, {
                headers: {
                    'Authorization': PEXELS_ACCESS_KEY
                }
            });
            
            if (!response.ok) {
                throw new Error(`Pexels API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Check if we have more results available
            const totalResults = data.total_results;
            const currentResultCount = page * 12;
            hasMoreResults = currentResultCount < totalResults;
            
            // Convert Pexels format to our standard format
            const images = data.photos.map(photo => ({
                id: photo.id,
                urls: {
                    small: photo.src.medium,
                    regular: photo.src.large,
                    full: photo.src.original
                },
                alt_description: photo.alt || `Photo by ${photo.photographer}`,
                user: {
                    name: photo.photographer,
                    links: {
                        html: photo.photographer_url
                    }
                },
                links: {
                    html: photo.url
                }
            }));
            
            console.log('Fetched', images.length, 'images from Pexels');
            return images;
        } catch (error) {
            console.error('Pexels API failed:', error);
            throw error;
        }
    }
    
    // Function to search for images using Lorem Picsum (random images, not search-based)
    async function searchWithPicsum(query) {
        console.log('Using Lorem Picsum for query:', query, '(Note: Lorem Picsum shows random images, not search results)');
        
        try {
            // Get list of available images from Picsum
            const response = await fetch('https://picsum.photos/v2/list?page=1&limit=50');
            const imageList = await response.json();
            
            // Create image objects with Picsum URLs
            const images = imageList.slice(0, 12).map(img => ({
                id: img.id,
                urls: {
                    small: `https://picsum.photos/id/${img.id}/400/300`,
                    regular: `https://picsum.photos/id/${img.id}/800/600`,
                    full: `https://picsum.photos/id/${img.id}/1200/800`
                },
                alt_description: `Photo by ${img.author}`,
                user: {
                    name: img.author,
                    links: {
                        html: img.url
                    }
                },
                links: {
                    html: img.url
                }
            }));
            
            console.log('Fetched', images.length, 'random images from Lorem Picsum');
            return images;
        } catch (error) {
            console.error('Lorem Picsum failed:', error);
            return simulateAPICall(query);
        }
    }
    
    // Function to show API key message
    function showApiKeyMessage() {
        // Remove any existing message first
        const existingMessage = document.querySelector('.api-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const message = document.createElement('div');
        message.className = 'api-message';
        message.innerHTML = `
            <div style="background: #ffebee; border: 1px solid #f44336; padding: 15px; margin: 10px 0; border-radius: 8px; color: #c62828;">
                <strong>⚠️ Currently Showing Random Images</strong><br>
                <p style="margin: 8px 0;">These images are not related to your search term. For accurate search results, you need a free API key:</p>
                <div style="margin: 10px 0;">
                    <strong>🔥 Recommended: Pexels API</strong><br>
                    • Visit <a href="https://www.pexels.com/api/" target="_blank" style="color: #1976d2;">pexels.com/api</a><br>
                    • Sign up for free (no credit card needed)<br>
                    • Copy your API key<br>
                    • Add it to <code>PEXELS_ACCESS_KEY</code> in the code
                </div>
                <div style="margin: 10px 0;">
                    <strong>Alternative: Unsplash API</strong><br>
                    • Visit <a href="https://unsplash.com/developers" target="_blank" style="color: #1976d2;">unsplash.com/developers</a>
                </div>
            </div>
        `;
        
        const imageGrid = document.getElementById('results');
        imageGrid.insertBefore(message, imageGrid.firstChild);
    }
    
    // Fallback function that simulates API call with demo images
    async function simulateAPICall(query) {
        // Demo images with career-related themes
        const demoImages = [
            {
                id: '1',
                urls: { 
                    small: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=300&fit=crop',
                    regular: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&h=600&fit=crop'
                },
                alt_description: 'Modern office workspace',
                user: { name: 'Unsplash Demo' },
                description: 'Professional workspace environment'
            },
            {
                id: '2',
                urls: { 
                    small: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
                    regular: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop'
                },
                alt_description: 'Team collaboration meeting',
                user: { name: 'Unsplash Demo' },
                description: 'Collaborative team environment'
            },
            {
                id: '3',
                urls: { 
                    small: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
                    regular: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop'
                },
                alt_description: 'Business meeting discussion',
                user: { name: 'Unsplash Demo' },
                description: 'Professional business meeting'
            },
            {
                id: '4',
                urls: { 
                    small: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
                    regular: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop'
                },
                alt_description: 'Leadership presentation',
                user: { name: 'Unsplash Demo' },
                description: 'Executive leadership presentation'
            },
            {
                id: '5',
                urls: { 
                    small: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
                    regular: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'
                },
                alt_description: 'Professional workspace setup',
                user: { name: 'Unsplash Demo' },
                description: 'Clean professional workspace'
            },
            {
                id: '6',
                urls: { 
                    small: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop',
                    regular: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop'
                },
                alt_description: 'Creative workspace design',
                user: { name: 'Unsplash Demo' },
                description: 'Modern creative workspace'
            },
            {
                id: '7',
                urls: { 
                    small: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop',
                    regular: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop'
                },
                alt_description: 'Team strategy planning',
                user: { name: 'Unsplash Demo' },
                description: 'Strategic planning session'
            },
            {
                id: '8',
                urls: { 
                    small: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
                    regular: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop'
                },
                alt_description: 'Professional networking event',
                user: { name: 'Unsplash Demo' },
                description: 'Business networking opportunity'
            },
            {
                id: '9',
                urls: { 
                    small: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop',
                    regular: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop'
                },
                alt_description: 'Startup office environment',
                user: { name: 'Unsplash Demo' },
                description: 'Dynamic startup workspace'
            },
            {
                id: '10',
                urls: { 
                    small: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop',
                    regular: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop'
                },
                alt_description: 'Professional development',
                user: { name: 'Unsplash Demo' },
                description: 'Career growth and development'
            },
            {
                id: '11',
                urls: { 
                    small: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop',
                    regular: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop'
                },
                alt_description: 'Innovation and technology',
                user: { name: 'Unsplash Demo' },
                description: 'Technology-driven innovation'
            },
            {
                id: '12',
                urls: { 
                    small: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop',
                    regular: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop'
                },
                alt_description: 'Success and achievement',
                user: { name: 'Unsplash Demo' },
                description: 'Professional success milestone'
            }
        ];
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Filter images based on search query for more realistic demo
        let filteredImages = demoImages;
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('leadership') || lowerQuery.includes('leader')) {
            filteredImages = demoImages.filter(img => 
                img.alt_description.includes('leadership') || 
                img.alt_description.includes('presentation') ||
                img.description.includes('leadership')
            );
        } else if (lowerQuery.includes('team') || lowerQuery.includes('collaboration')) {
            filteredImages = demoImages.filter(img => 
                img.alt_description.includes('team') || 
                img.alt_description.includes('collaboration') ||
                img.description.includes('team')
            );
        } else if (lowerQuery.includes('workspace') || lowerQuery.includes('office')) {
            filteredImages = demoImages.filter(img => 
                img.alt_description.includes('workspace') || 
                img.alt_description.includes('office') ||
                img.description.includes('workspace')
            );
        }
        
        // Ensure we always have some results for demo
        if (filteredImages.length === 0) {
            filteredImages = demoImages.slice(0, 6);
        }
        
        displaySearchResults(filteredImages);
    }
    
    function showNoResultsMessage() {
        imageGrid.innerHTML = `
            <div class="no-results">
                <p>No images found. Please try another keyword.</p>
            </div>
        `;
    }
    
    function displaySearchResults(images) {
        currentSearchResults = images;
        imageGrid.innerHTML = '';
        
        images.forEach(image => {
            const imageCard = createImageCard(image);
            imageGrid.appendChild(imageCard);
        });
    }
    
    function addToMoodboard(image) {
        // Check if image is already in moodboard
        if (moodboardImages.find(img => img.id === image.id)) {
            alert('This image is already in your moodboard!');
            return;
        }
        
        moodboardImages.push(image);
        updateMoodboardDisplay();
        saveMoodboardToStorage(); // Save to LocalStorage
    }
    
    function updateMoodboardDisplay() {
        if (moodboardImages.length === 0) {
            moodboardCanvas.innerHTML = `
                <div class="empty-moodboard">
                    <p>Start building your moodboard by searching and adding images above.</p>
                </div>
            `;
            return;
        }
        
        moodboardCanvas.innerHTML = '';
        
        moodboardImages.forEach((image, index) => {
            const moodboardItem = document.createElement('div');
            moodboardItem.className = 'moodboard-item';
            moodboardItem.draggable = true;
            moodboardItem.dataset.index = index;
            moodboardItem.innerHTML = `
                <img src="${image.urls.small}" alt="${image.alt_description || 'Career inspiration'}" class="moodboard-image">
                <button class="remove-btn" data-index="${index}">×</button>
                <div class="arrow-controls">
                    <button class="arrow-btn arrow-left" data-index="${index}" title="Move left">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15,18 9,12 15,6"></polyline>
                        </svg>
                    </button>
                    <button class="arrow-btn arrow-right" data-index="${index}" title="Move right">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9,6 15,12 9,18"></polyline>
                        </svg>
                    </button>
                </div>
            `;
            
            // Add remove functionality
            const removeBtn = moodboardItem.querySelector('.remove-btn');
            removeBtn.addEventListener('click', () => removeFromMoodboard(index));
            
            // Add arrow button functionality
            const leftArrow = moodboardItem.querySelector('.arrow-left');
            const rightArrow = moodboardItem.querySelector('.arrow-right');
            
            leftArrow.addEventListener('click', (e) => {
                e.stopPropagation();
                moveImageLeft(index);
            });
            
            rightArrow.addEventListener('click', (e) => {
                e.stopPropagation();
                moveImageRight(index);
            });
            
            // Disable arrows at boundaries
            if (index === 0) {
                leftArrow.disabled = true;
                leftArrow.style.opacity = '0.3';
            }
            if (index === moodboardImages.length - 1) {
                rightArrow.disabled = true;
                rightArrow.style.opacity = '0.3';
            }
            
            // Add drag and drop event listeners
            moodboardItem.addEventListener('dragstart', handleDragStart);
            moodboardItem.addEventListener('dragend', handleDragEnd);
            moodboardItem.addEventListener('dragover', handleDragOver);
            moodboardItem.addEventListener('drop', handleDrop);
            moodboardItem.addEventListener('dragenter', handleDragEnter);
            moodboardItem.addEventListener('dragleave', handleDragLeave);
            
            moodboardCanvas.appendChild(moodboardItem);
        });
        
        // Add drag and drop listeners to the canvas
        moodboardCanvas.addEventListener('dragover', handleCanvasDragOver);
        moodboardCanvas.addEventListener('drop', handleCanvasDrop);
    }
    
    function removeFromMoodboard(index) {
        moodboardImages.splice(index, 1);
        updateMoodboardDisplay();
        saveMoodboardToStorage(); // Save to LocalStorage
    }
    
    // Export functionality
    exportBtn.addEventListener('click', function() {
        if (moodboardImages.length === 0) {
            alert('Please add some images to your moodboard before exporting.');
            return;
        }
        exportOptions.style.display = 'block';
    });
    
    cancelExportBtn.addEventListener('click', function() {
        exportOptions.style.display = 'none';
    });
    
    exportPngBtn.addEventListener('click', function() {
        exportMoodboard('png');
    });
    
    exportPdfBtn.addEventListener('click', function() {
        exportMoodboard('pdf');
    });
    
    function exportMoodboard(format) {
        // Create a high-resolution canvas for export
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set high-resolution canvas size for better quality
        const canvasWidth = 2400; // High resolution for quality
        const canvasHeight = 1600; // High resolution for quality
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Fill white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Masonry layout configuration
        const padding = 30;
        const gap = 15; // Gap between images
        const columnCount = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(moodboardImages.length)))); // 2-4 columns
        const columnWidth = (canvasWidth - (padding * 2) - (gap * (columnCount - 1))) / columnCount;
        
        // Initialize column heights for masonry layout
        const columnHeights = new Array(columnCount).fill(padding);
        const imagePositions = [];
        
        let loadedImages = 0;
        const totalImages = moodboardImages.length;
        
        // First pass: calculate positions for masonry layout
        moodboardImages.forEach((imageData, index) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = function() {
                // Calculate image dimensions preserving aspect ratio
                const imgAspectRatio = img.naturalWidth / img.naturalHeight;
                const imageWidth = columnWidth;
                const imageHeight = imageWidth / imgAspectRatio;
                
                // Find the shortest column for masonry effect
                let shortestColumn = 0;
                let shortestHeight = columnHeights[0];
                for (let i = 1; i < columnCount; i++) {
                    if (columnHeights[i] < shortestHeight) {
                        shortestHeight = columnHeights[i];
                        shortestColumn = i;
                    }
                }
                
                // Calculate position
                const x = padding + (shortestColumn * (columnWidth + gap));
                const y = columnHeights[shortestColumn];
                
                // Store position and dimensions
                imagePositions[index] = {
                    x: x,
                    y: y,
                    width: imageWidth,
                    height: imageHeight,
                    img: img
                };
                
                // Update column height
                columnHeights[shortestColumn] += imageHeight + gap;
                
                loadedImages++;
                
                // When all images are positioned, draw them
                if (loadedImages === totalImages) {
                    // Adjust canvas height to fit all content with minimal white space
                    const maxColumnHeight = Math.max(...columnHeights);
                    const optimalHeight = Math.min(canvasHeight, maxColumnHeight + padding);
                    
                    // If content is shorter than canvas, adjust canvas size
                    if (optimalHeight < canvasHeight) {
                        canvas.height = optimalHeight;
                        // Redraw background with new height
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, canvasWidth, optimalHeight);
                    }
                    
                    // Draw all images in their calculated positions
                    imagePositions.forEach((pos, idx) => {
                        if (pos && pos.img) {
                            ctx.drawImage(pos.img, pos.x, pos.y, pos.width, pos.height);
                        }
                    });
                    
                    // Export the final result
                    if (format === 'png') {
                        downloadCanvas(canvas, 'career-moodboard.png');
                    } else if (format === 'pdf') {
                        downloadAsPDF(canvas);
                    }
                    
                    exportOptions.style.display = 'none';
                    showExportMessage();
                }
            };
            
            img.onerror = function() {
                loadedImages++;
                if (loadedImages === totalImages) {
                    // Draw whatever we have
                    imagePositions.forEach((pos, idx) => {
                        if (pos && pos.img) {
                            ctx.drawImage(pos.img, pos.x, pos.y, pos.width, pos.height);
                        }
                    });
                    
                    if (format === 'png') {
                        downloadCanvas(canvas, 'career-moodboard.png');
                    } else if (format === 'pdf') {
                        downloadAsPDF(canvas);
                    }
                    
                    exportOptions.style.display = 'none';
                    showExportMessage();
                }
            };
            
            // Use higher quality image URL if available
            img.src = imageData.urls.regular || imageData.urls.small;
        });
    }
    
    function downloadCanvas(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL();
        link.click();
    }
    
    function downloadAsPDF(canvas) {
        // Use jsPDF library for high-quality PDF generation
        const { jsPDF } = window.jspdf;
        
        // Create PDF in landscape orientation for better moodboard layout
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
            compress: false // Disable compression for better quality
        });
        
        // Get PDF dimensions
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Convert canvas to high-quality image data
        const imgData = canvas.toDataURL('image/jpeg', 1.0); // Maximum quality
        
        // Calculate dimensions to fit the PDF while maintaining aspect ratio
        const canvasAspectRatio = canvas.width / canvas.height;
        const pdfAspectRatio = pdfWidth / pdfHeight;
        
        let imgWidth, imgHeight, x, y;
        
        if (canvasAspectRatio > pdfAspectRatio) {
            // Canvas is wider than PDF
            imgWidth = pdfWidth - 20; // 10mm margin on each side
            imgHeight = imgWidth / canvasAspectRatio;
            x = 10;
            y = (pdfHeight - imgHeight) / 2;
        } else {
            // Canvas is taller than PDF
            imgHeight = pdfHeight - 20; // 10mm margin on top and bottom
            imgWidth = imgHeight * canvasAspectRatio;
            x = (pdfWidth - imgWidth) / 2;
            y = 10;
        }
        
        // Add title
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Career Moodboard', 10, 15);
        
        // Add the image to PDF
        pdf.addImage(imgData, 'JPEG', x, y + 10, imgWidth, imgHeight - 10, '', 'FAST');
        
        // Save the PDF
        pdf.save('career-moodboard.pdf');
    }
    
    function showExportMessage() {
        exportMessage.style.display = 'block';
        setTimeout(() => {
            exportMessage.style.display = 'none';
        }, 3000);
    }
    
    // Initialize with empty moodboard and clear any cached images
    updateMoodboardDisplay();
    
    // Clear any existing images and perform an initial search to show functionality
    imageGrid.innerHTML = '';
    
    // Add a function to clear search results
    function clearSearchResults() {
        imageGrid.innerHTML = '';
        currentSearchResults = [];
    }
    
    // Load More functionality
    loadMoreBtn.addEventListener('click', async function() {
        if (!currentSearchTerm || !hasMoreResults) return;
        
        currentPage++;
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'Loading...';
        
        try {
            const images = await searchImages(currentSearchTerm, currentPage);
            
            if (images && images.length > 0) {
                // Append new images to existing results
                appendSearchResults(images);
                
                if (!hasMoreResults) {
                    showNoMoreResults();
                }
            } else {
                showNoMoreResults();
            }
        } catch (error) {
            console.error('Load more error:', error);
            showNoMoreResults();
        } finally {
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load More';
        }
    });
    
    // Function to show Load More button
    function showLoadMoreButton() {
        if (hasMoreResults) {
            loadMoreContainer.style.display = 'block';
            loadMoreBtn.style.display = 'inline-flex';
            noMoreResultsMsg.style.display = 'none';
        } else {
            showNoMoreResults();
        }
    }
    
    // Function to show no more results message
    function showNoMoreResults() {
        loadMoreBtn.style.display = 'none';
        noMoreResultsMsg.style.display = 'block';
        loadMoreContainer.style.display = 'block';
        hasMoreResults = false;
    }
    
    // Function to append search results (for Load More)
    function appendSearchResults(images) {
        images.forEach(image => {
            const imageCard = createImageCard(image);
            imageGrid.appendChild(imageCard);
        });
        currentSearchResults = currentSearchResults.concat(images);
    }
    
    // Function to create image card (extracted from displaySearchResults)
    function createImageCard(image) {
        const imageCard = document.createElement('div');
        imageCard.className = 'image-card';
        
        const img = document.createElement('img');
        img.src = image.urls.small;
        img.alt = image.alt_description || 'Career inspiration image';
        img.loading = 'lazy';
        img.className = 'search-image';
        
        const addBtn = document.createElement('button');
        addBtn.className = 'add-to-moodboard';
        addBtn.setAttribute('aria-label', 'Add to Moodboard');
        addBtn.onclick = () => addToMoodboard(image);
        
        imageCard.appendChild(img);
        imageCard.appendChild(addBtn);
        
        return imageCard;
    }
    
    // Drag and Drop Variables
    let draggedElement = null;
    let draggedIndex = null;
    
    // Drag and Drop Event Handlers
    function handleDragStart(e) {
        draggedElement = e.target;
        draggedIndex = parseInt(e.target.dataset.index);
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
    }
    
    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
        draggedElement = null;
        draggedIndex = null;
        
        // Remove any active drop indicators
        document.querySelectorAll('.drop-indicator').forEach(indicator => {
            indicator.remove();
        });
        
        // Remove drag-over class from canvas
        moodboardCanvas.classList.remove('drag-over');
    }
    
    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }
    
    function handleDragEnter(e) {
        if (e.target !== draggedElement) {
            e.target.classList.add('drag-over');
        }
    }
    
    function handleDragLeave(e) {
        e.target.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        
        if (draggedElement !== e.target) {
            const targetIndex = parseInt(e.target.dataset.index);
            
            if (draggedIndex !== null && targetIndex !== null && draggedIndex !== targetIndex) {
                // Reorder the moodboard images array
                const draggedImage = moodboardImages[draggedIndex];
                moodboardImages.splice(draggedIndex, 1);
                moodboardImages.splice(targetIndex, 0, draggedImage);
                
                // Update the display
                updateMoodboardDisplay();
                saveMoodboardToStorage(); // Save to LocalStorage
            }
        }
        
        return false;
    }
    
    function handleCanvasDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        moodboardCanvas.classList.add('drag-over');
        e.dataTransfer.dropEffect = 'move';
        return false;
    }
    
    function handleCanvasDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        moodboardCanvas.classList.remove('drag-over');
        return false;
    }
    
    // Arrow button functionality for reordering images
    function moveImageLeft(index) {
        if (index > 0) {
            // Swap with previous image
            const temp = moodboardImages[index];
            moodboardImages[index] = moodboardImages[index - 1];
            moodboardImages[index - 1] = temp;
            
            // Update display immediately
            updateMoodboardDisplay();
            saveMoodboardToStorage(); // Save to LocalStorage
        }
    }
    
    function moveImageRight(index) {
        if (index < moodboardImages.length - 1) {
            // Swap with next image
            const temp = moodboardImages[index];
            moodboardImages[index] = moodboardImages[index + 1];
            moodboardImages[index + 1] = temp;
            
            // Update display immediately
            updateMoodboardDisplay();
            saveMoodboardToStorage(); // Save to LocalStorage
        }
    }
    
    // LocalStorage functions for moodboard persistence
    function saveMoodboardToStorage() {
        try {
            localStorage.setItem(MOODBOARD_STORAGE_KEY, JSON.stringify(moodboardImages));
        } catch (error) {
            console.warn('Failed to save moodboard to localStorage:', error);
        }
    }
    
    function loadMoodboardFromStorage() {
        try {
            const savedMoodboard = localStorage.getItem(MOODBOARD_STORAGE_KEY);
            if (savedMoodboard) {
                moodboardImages = JSON.parse(savedMoodboard);
                updateMoodboardDisplay();
            }
        } catch (error) {
            console.warn('Failed to load moodboard from localStorage:', error);
            moodboardImages = []; // Reset to empty array if loading fails
        }
    }
    
    // Perform an initial search with "career" to demonstrate functionality
    setTimeout(() => {
        searchInput.value = 'career';
        performSearch();
    }, 1000);
});