document.addEventListener("DOMContentLoaded", function () {
    checkLoginStatus();
    loadOrders();
});

// Dark Mode Toggle
const darkModeToggle = document.getElementById("darkModeToggle");

// Check if user has a preference stored
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️";
}

// Toggle function
darkModeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
        darkModeToggle.textContent = "☀️";
    } else {
        localStorage.setItem("darkMode", "disabled");
        darkModeToggle.textContent = "🌙";
    }
});

// Function to handle sign in
function signIn() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (username && password) {
        localStorage.setItem("user", username);
        document.getElementById("profileName").innerText = username;
        updateUI(true);
        document.getElementById("signInModal").classList.remove("show");
    } else {
        alert("Please enter username and password.");
    }
}

// Function to handle sign out
document.getElementById("signOutBtn").addEventListener("click", function () {
    localStorage.removeItem("user");
    localStorage.removeItem("orders"); // Clear orders on sign out
    updateUI(false);
    showLandingPage();
});

// Check if user is logged in
function checkLoginStatus() {
    let user = localStorage.getItem("user");
    if (user) {
        document.getElementById("profileName").innerText = user;
        updateUI(true);
    } else {
        updateUI(false);
    }
}

// Update UI based on login status
function updateUI(isLoggedIn) {
    document.getElementById("signInBtn").classList.toggle("d-none", isLoggedIn);
    document.getElementById("signOutBtn").classList.toggle("d-none", !isLoggedIn);
    document.getElementById("profile-link").classList.toggle("d-none", !isLoggedIn);
    document.getElementById("orders-link").classList.toggle("d-none", !isLoggedIn);
    document.getElementById("home-link").classList.toggle("d-none", !isLoggedIn);
}

/*
// Menu Filtering
function filterMenu(category) {
    const menuItems = document.querySelectorAll(".menu-item");

    menuItems.forEach(item => {
        if (category === "all") {
            item.style.display = "block";
        } else {
            if (item.classList.contains(category)) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        }
    });

    // If "See More" was clicked before, hide extra items unless "All" is selected
    if (category !== "all") {
        document.querySelectorAll(".menu-item.hidden").forEach(item => {
            item.style.display = "none";
        });
    }

    // Reset buttons when filtering
    //document.getElementById("seeMoreBtn").style.display = "inline-block";
    //document.getElementById("seeLessBtn").style.display = "none";
}

// Show only the selected section
function showSection(sectionId) {
    document.querySelectorAll("section").forEach(section => {
        section.classList.add("d-none");
    });
    document.getElementById(sectionId).classList.remove("d-none");
}
*/
// Menu Filtering
function filterMenu(category) {
    const menuItems = document.querySelectorAll(".menu-item");

    menuItems.forEach(item => {
        if (category === "all" || item.classList.contains(category)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });

    // Check if "See More" is active; if not, hide extra items when filtering
    if (!document.getElementById("seeLessBtn").classList.contains("active")) {
        document.querySelectorAll(".menu-item.extra").forEach(item => {
            item.style.display = "none";
        });
    }
}

// Show only the selected section
function showSection(sectionId) {
    document.querySelectorAll("section").forEach(section => {
        section.classList.add("d-none");
    });
    document.getElementById(sectionId).classList.remove("d-none");
}

// Toggle extra menu items (See More / See Less)
function toggleExtraMenu(show) {
    document.querySelectorAll(".menu-item.extra").forEach(item => {
        item.style.display = show ? "block" : "none";
    });

    document.getElementById("seeMoreBtn").style.display = show ? "none" : "inline-block";
    document.getElementById("seeLessBtn").style.display = show ? "inline-block" : "none";

    // Add an "active" class to track whether "See Less" is currently shown
    if (show) {
        document.getElementById("seeLessBtn").classList.add("active");
    } else {
        document.getElementById("seeLessBtn").classList.remove("active");
    }
}

// Event Listeners
document.getElementById("seeMoreBtn").addEventListener("click", () => toggleExtraMenu(true));
document.getElementById("seeLessBtn").addEventListener("click", () => toggleExtraMenu(false));


// Show landing page
function showLandingPage() {
    document.querySelectorAll("section").forEach(section => {
        section.classList.remove("d-none");
    });
    document.getElementById("profile").classList.add("d-none");
    document.getElementById("orders").classList.add("d-none");
}

// Event listeners for profile and orders
document.getElementById("profile-link").addEventListener("click", function () {
    showSection("profile");
});

document.getElementById("orders-link").addEventListener("click", function () {
    showSection("orders");
});

// Event listener for Home button
document.getElementById("home-link").addEventListener("click", function () {
    showLandingPage();
});

// Base URL for your API
const API_BASE_URL = 'http://localhost:3000/api';

// Handle reservation form submission
document.getElementById("reservationForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    let name = document.getElementById("name").value;
    let date = document.getElementById("date").value;
    let time = document.getElementById("time").value;
    let tableSize = document.getElementById("tableSize").value;

    if (!name || !date || !time || !tableSize) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                date,
                time,
                tableSize
            })
        });

        if (!response.ok) {
            throw new Error('Failed to make reservation');
        }

        const data = await response.json();
        
        document.getElementById("confirmation").innerHTML = 
            `<span class="text-success">Reservation confirmed for ${name} on ${date} at ${time}.</span>`;

        loadOrders(); // Update order history instantly
        document.getElementById("reservationForm").reset(); // Clear form
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("confirmation").innerHTML = 
            `<span class="text-danger">Failed to make reservation. Please try again.</span>`;
    }
});

// Load order history
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/reservations`);
        if (!response.ok) {
            throw new Error('Failed to load orders');
        }
        
        const orders = await response.json();
        let tableBody = document.getElementById("orderTableBody");

        tableBody.innerHTML = ""; // Clear existing content

        if (orders.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='6'>No orders yet.</td></tr>";
        } else {
            orders.forEach((order, index) => {
                let row = `<tr>
                    <td>${order.name}</td>
                    <td>${order.date}</td>
                    <td>${order.time}</td>
                    <td>${order.tableSize}</td>
                    <td id="status-${index}">${order.status}</td>
                    <td>
                        ${order.status === "Table Reserved" 
                            ? `<button class="btn btn-success btn-sm" onclick="confirmPayment('${order._id}', ${index})">Pay Now</button>` 
                            : "Paid"}
                    </td>
                </tr>`;
                tableBody.innerHTML += row;
            });
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("orderTableBody").innerHTML = 
            "<tr><td colspan='6'>Error loading orders. Please try again.</td></tr>";
    }
}

// Confirm payment and update status
async function confirmPayment(orderId, index) {
    try {
        const response = await fetch(`${API_BASE_URL}/reservations/${orderId}/confirm`, {
            method: 'PUT'
        });

        if (!response.ok) {
            throw new Error('Failed to confirm payment');
        }

        document.getElementById(`status-${index}`).innerText = "Confirmed";
        loadOrders(); // Reload table to update payment buttons
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to confirm payment. Please try again.');
    }
}

// Load orders when page loads
document.addEventListener('DOMContentLoaded', loadOrders);
/*
function showMoreMenu() {
    document.querySelectorAll(".menu-item.extra").forEach(item => {
        item.classList.remove("hidden");
    });

    document.getElementById("seeMoreBtn").style.display = "none";
    document.getElementById("seeLessBtn").style.display = "inline-block";
}

function showLessMenu() {
    document.querySelectorAll(".menu-item.extra").forEach(item => {
        item.classList.add("hidden");
    });
    document.getElementById("seeMoreBtn").style.display = "inline-block";
    document.getElementById("seeLessBtn").style.display = "none";
}
*/

document.addEventListener("DOMContentLoaded", function() {
    const reviewForm = document.getElementById("reviewForm");
    const reviewList = document.getElementById("reviewList");
    const stars = document.querySelectorAll(".star-rating i");
    let selectedRating = 0;

    // Handle star rating selection
    stars.forEach(star => {
        star.addEventListener("click", function() {
            selectedRating = this.getAttribute("data-value");
            document.getElementById("reviewRating").value = selectedRating;
            stars.forEach(s => s.classList.remove("text-warning"));
            for (let i = 0; i < selectedRating; i++) {
                stars[i].classList.add("text-warning");
            }
        });
    });

    // Handle form submission
    reviewForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("reviewName").value;
        const reviewText = document.getElementById("reviewText").value;
        const rating = document.getElementById("reviewRating").value;

        if (name && reviewText && rating > 0) {
            const reviewHTML = `
                <div class="card p-3 mb-3">
                    <h5>${name}</h5>
                    <p>${reviewText}</p>
                    <p class="text-warning">${'⭐'.repeat(rating)}</p>
                </div>
            `;
            reviewList.innerHTML += reviewHTML;

            // Reset form
            reviewForm.reset();
            stars.forEach(s => s.classList.remove("text-warning"));
        } else {
            alert("Please fill in all fields and select a rating.");
        }
    });
});

document.getElementById("reserveTableBtn").addEventListener("click", function() {
    document.getElementById("reservation").classList.remove("d-none");
    document.getElementById("reservation").scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("DOMContentLoaded", function () {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    document.querySelectorAll(".favorite-btn").forEach((btn) => {
        let itemName = btn.getAttribute("data-item");
        if (favorites.includes(itemName)) {
            btn.innerHTML = "&#10084;"; // Solid heart when favorited
            btn.classList.add("favorited");
        } else {
            btn.innerHTML = "&#x2661;"; // Outline heart when not favorited
            btn.classList.remove("favorited");
        }
    });
});

function toggleFavorite(btn) {
    let itemName = btn.getAttribute("data-item");
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.includes(itemName)) {
        favorites = favorites.filter((item) => item !== itemName);
        btn.innerHTML = "&#x2661;"; // Outline heart
        btn.classList.remove("favorited");
    } else {
        favorites.push(itemName);
        btn.innerHTML = "&#10084;"; // Solid heart
        btn.classList.add("favorited");
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadFavorites();
}

function loadFavorites() {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    let favoriteList = document.getElementById("favorite-list");
    favoriteList.innerHTML = "";

    document.querySelectorAll(".favorite-btn").forEach((btn) => {
        let itemName = btn.getAttribute("data-item");
        if (favorites.includes(itemName)) {
            btn.innerHTML = "&#10084;"; // Solid heart ❤
            btn.classList.add("favorited");
        } else {
            btn.innerHTML = "&#x2661;"; // Outline heart ♡
            btn.classList.remove("favorited");
        }
    });

    favorites.forEach(item => {
        let li = document.createElement("li");
        li.textContent = item;
        let removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.classList.add("remove-btn");
        removeBtn.onclick = function () {
            removeFavorite(item);
        };
        li.appendChild(removeBtn);
        favoriteList.appendChild(li);
    });
    console.log("Favorites:", favorites);
}


function removeFavorite(item) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites = favorites.filter(fav => fav !== item);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadFavorites();
}

function signOut() {
    localStorage.removeItem("favorites"); // Clear favorites
    loadFavorites(); // Update UI
}

document.addEventListener("DOMContentLoaded", loadFavorites);


// Replace your reservation form handler with this:
document.getElementById("reservationForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const username = localStorage.getItem("username");
    const name = document.getElementById("name").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const tableSize = document.getElementById("tableSize").value;
  
    try {
      const response = await fetch("http://localhost:3000/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, name, date, time, tableSize }),
      });
  
      if (response.ok) {
        alert("Reservation saved to MongoDB!");
        loadReservations(); // Refresh the list
      } else {
        alert("Failed to save reservation.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
  
  // Function to load reservations from MongoDB
  async function loadReservations() {
    const username = localStorage.getItem("username");
    if (!username) return;
  
    const response = await fetch(`http://localhost:3000/api/reservations/${username}`);
    const reservations = await response.json();
  
    const tableBody = document.getElementById("orderTableBody");
    tableBody.innerHTML = reservations.map(res => `
      <tr>
        <td>${res.name}</td>
        <td>${res.date}</td>
        <td>${res.time}</td>
        <td>${res.tableSize}</td>
        <td>Confirmed</td>
      </tr>
    `).join("");
  }
  document.addEventListener('DOMContentLoaded', function() {
    // Optional: Add animation when modal opens
    $('#wineTastingModal').on('show.bs.modal', function () {
      $('.feature-list div').css('opacity', 0);
      $('.feature-list div').each(function(i) {
        $(this).delay(100 * i).animate({opacity: 1}, 200);
      });
    });
  });