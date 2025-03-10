      // Get DOM elements
const urlInput = document.getElementById('urlInput');
const addUrlBtn = document.getElementById('addUrlBtn');
const linkList = document.getElementById('linkList');

// Function to extract title from URL
async function getLinkTitle(url) {
    try {
        // Fallback method to get a meaningful title
        const hostname = new URL(url).hostname;
        const cleanHostname = hostname.replace('www.', '');
        
        // Try to fetch title using a proxy (note: this might not always work)
        try {
            const response = await fetch(`${url}`);
            const data = await response.json();
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');
            const title = doc.querySelector('title')?.textContent;

            return title || `Link from ${cleanHostname}`;
        } catch (proxyError) {
            // If proxy fails, return a default title
            return `Link from ${cleanHostname}`;
        }
    } catch (error) {
        console.error('Could not fetch title:', error);
        return 'Untitled Link';
    }
}

// Function to create a link card
function createLinkCard(url) {
    // Ensure URL is fully qualified
    const validUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const card = document.createElement('div');
    card.classList.add('link-card');
    
    const link = document.createElement('a');
    link.href = validUrl;
    link.textContent = 'Loading...';
    link.target = '_blank';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✖';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.onclick = () => {
        linkList.removeChild(card);
        saveLinkToLocalStorage();
    };
    
    card.appendChild(link);
    card.appendChild(deleteBtn);
    
    // Update title in the background without waiting
    updateLinkTitle(link, validUrl);
    
    return card;
}

// Separate function to update link title
async function updateLinkTitle(link, url) {
    try {
        const title = await getLinkTitle(url);
        link.textContent = title;
    } catch (error) {
        console.error('Could not fetch title:', error);
        link.textContent = 'Untitled Link';
    }
}

// Add link when button is clicked
addUrlBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    
    // Basic URL validation
    if (!url) {
        alert('Please enter a valid URL');
        return;
    }
    
    try {
        const linkCard = createLinkCard(url);
        linkList.appendChild(linkCard);
        
        // Clear input immediately
        urlInput.value = '';
        
        // Save to localStorage
        saveLinkToLocalStorage();
    } catch (error) {
        console.error('Error adding link:', error);
        alert('Could not add link. Please check the URL.');
    }
});

// Save links to localStorage
function saveLinkToLocalStorage() {
    const links = Array.from(linkList.children).map(card => 
        card.querySelector('a').href
    );
    localStorage.setItem('bookmarkedLinks', JSON.stringify(links));
}

// Load links from localStorage on page load
function loadLinksFromLocalStorage() {
    const savedLinks = JSON.parse(localStorage.getItem('bookmarkedLinks') || '[]');
    savedLinks.forEach(url => {
        const card = createLinkCard(url);
        linkList.appendChild(card);
    });
}

// Load saved links when page loads
loadLinksFromLocalStorage();

// Allow adding link by pressing Enter
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addUrlBtn.click();
    }
});

