// Vouch management with pagination
let allVouches = [];
let currentPage = 1;
const vouchesPerPage = 9;

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    
    // Function to switch sections
    function switchSection(sectionId) {
        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from all nav items
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Show target section and activate corresponding nav item
        document.getElementById(sectionId + '-section').classList.add('active');
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
        
        // Load vouches if switching to home section
        if (sectionId === 'home') {
            loadVouches();
        }
    }
    
    // Add click event listeners to nav items
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            switchSection(sectionId);
        });
    });
    
    // Load initial section (home)
    switchSection('home');
});

// Load all vouches
async function loadVouches() {
    try {
        let oldLength = allVouches.length;
        let oldPage = currentPage;

        let res = await fetch("https://vouch-api-u8zv.onrender.com/vouches/?c=" + Date.now());
        let newData = await res.json();

        allVouches = newData;

        const totalPages = Math.ceil(allVouches.length / vouchesPerPage);

        // Ensure currentPage is never out of range
        if (oldPage > totalPages) {
            currentPage = totalPages;
        } else {
            currentPage = oldPage;
        }

        // Rebuild pagination ONLY if number of pages changed
        if (oldLength !== allVouches.length) {
            setupPagination();
        }

        displayVouches();

    } catch (error) {
        console.error("Error loading vouches:", error);
    }
}



// Display vouches for current page
function displayVouches() {
    const startIndex = (currentPage - 1) * vouchesPerPage;
    const endIndex = startIndex + vouchesPerPage;
    const currentVouches = allVouches.slice(startIndex, endIndex);
    
    let c = document.getElementById("vouchContainer");
    c.innerHTML = "";
    currentVouches.forEach((v, i) => {
        const globalIndex = startIndex + i + 1;
        c.appendChild(card(v, globalIndex));
    });
    
    // Update page info
    updatePageInfo();
}

// Setup pagination
function setupPagination() {
    const totalPages = Math.ceil(allVouches.length / vouchesPerPage);
    const pageNumbers = document.getElementById("pageNumbers");
    pageNumbers.innerHTML = "";
    
    // Show max 5 page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement("div");
        pageNumber.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageNumber.textContent = i;
        pageNumber.addEventListener('click', () => goToPage(i));
        pageNumbers.appendChild(pageNumber);
    }
    
    // Update button states
    document.querySelector('.prev-btn').disabled = currentPage === 1;
    document.querySelector('.next-btn').disabled = currentPage === totalPages;
    
    // Add event listeners to pagination buttons
    document.querySelector('.prev-btn').addEventListener('click', () => {
        if (currentPage > 1) goToPage(currentPage - 1);
    });
    
    document.querySelector('.next-btn').addEventListener('click', () => {
        if (currentPage < totalPages) goToPage(currentPage + 1);
    });
}

// Go to specific page
function goToPage(page) {
    currentPage = page;
    displayVouches();
    setupPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update page information
function updatePageInfo() {
    const startIndex = (currentPage - 1) * vouchesPerPage + 1;
    const endIndex = Math.min(currentPage * vouchesPerPage, allVouches.length);
    
    document.getElementById('currentRange').textContent = `${startIndex}-${endIndex}`;
    document.getElementById('totalVouches').textContent = allVouches.length;
}

// Existing functions for vouch cards
function esc(s) {
    if (!s) return '';
    return s.replace(/[&<>]/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    }[c]));
}

function formatMsg(v) {
    let msg = v.message;

    if (v.mentioned_users && v.mentioned_users.length > 0) {
        v.mentioned_users.forEach(user => {
            const displayName = user.display_name || user.username;

            const discordMentionHTML =
                `<span class="discord-mention" onclick="window.open('https://discord.com/users/${user.id}', '_blank')">@${displayName}</span>`;

            const pattern1 = new RegExp(`<@${user.id}>`, 'g');
            const pattern2 = new RegExp(`<@!${user.id}>`, 'g');

            msg = msg.replace(pattern1, discordMentionHTML);
            msg = msg.replace(pattern2, discordMentionHTML);
        });
    }

    // Replace any unknown mentions
    msg = msg.replace(/<@!?(.*?)>/g, (match, id) => {
    return `<span class="discord-mention" data-id="${id}">@${id}</span>`;
});


    return msg; // DO NOT ESCAPE — we want HTML output
}

function card(v, i) {
    let d = document.createElement("div");
    d.className = "vouch-card";

    let finalMsg = formatMsg(v);

    d.innerHTML = `
        <img src="${v.avatar}" class="avatar">
        <div class="top-line">
            <span class="username">${v.username}</span>
            <span class="id-badge">#${String(i).padStart(3, "0")}</span>
        </div>
        <p class="message">${finalMsg}</p>
        <!-- Removed timestamp completely -->
    `;
    return d;
}


// Auto-refresh vouches on home section
setInterval(() => {
    if (document.getElementById('home-section').classList.contains('active')) {
        loadVouches();
    }
}, 3000);
