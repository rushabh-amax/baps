//              ============== navbar breadcrub ==============

// =======================================================================
//  relocate breadcrub
// =======================================================================
function relocateBreadcrumbs() {
    const sticky = document.querySelector(".sticky-top");
    const header = sticky?.querySelector("header.navbar");
    const breadcrumbs = document.getElementById("navbar-breadcrumbs");

    if (sticky && header && breadcrumbs) {
        // If breadcrumbs are still inside header → move them after header
        if (header.contains(breadcrumbs)) {
            header.after(breadcrumbs);
            console.log("✅ Breadcrumbs moved outside <header> into sticky-top");
        }

        // Always ensure "Modules" is the first <li>
        const firstLi = breadcrumbs.querySelector("li:first-child a");
        if (!firstLi || firstLi.getAttribute("href") !== "/app/modules") {
            const modulesLink = document.createElement("a");
            modulesLink.href = "/app/modules";
            modulesLink.textContent = "Modules";
            modulesLink.classList.add("navbar-breadcrumb-link");
            modulesLink.style.cursor = "pointer";
            modulesLink.style.fontWeight = "600";
            modulesLink.style.textDecoration = "none";

            const li = document.createElement("li");
            li.appendChild(modulesLink);

            breadcrumbs.insertBefore(li, breadcrumbs.firstChild || null);
            console.log("✅ 'Modules' breadcrumb injected once");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let attempts = 0;
    const timer = setInterval(() => {
        const bc = document.getElementById("navbar-breadcrumbs");
        if (bc || attempts > 20) {
            clearInterval(timer);
            relocateBreadcrumbs();

            // Watch for re-renders
            const observer = new MutationObserver(relocateBreadcrumbs);
            observer.observe(document.body, { childList: true, subtree: true });
        }
        attempts++;
    }, 200);





});



// =======================================================================
//  hide breadcrub on app/modules page
// =======================================================================
(function () {
    function applyHide() {
        const route = frappe.get_route ? frappe.get_route() : null;
        const isModulesPage = Array.isArray(route) && route[0] === 'modules';
        const bc = document.getElementById('navbar-breadcrumbs');

        // console.log("we are in hide navbreadcrub");

        if (!bc) {
            // console.log("⏳ #navbar-breadcrumbs not found");
            return;
        }

        if (isModulesPage) {
            bc.classList.add('hide-breadcrumb-force');
            // console.log("✅ HIDING breadcrumbs on /modules");
        } else {
            bc.classList.remove('hide-breadcrumb-force');
            // console.log("✅ SHOWING breadcrumbs on other routes");
        }
    }

    // Wait until frappe is defined
    function initWhenReady() {
        if (typeof frappe !== "undefined" && frappe.get_route && frappe.router) {
            // console.log("🚀 frappe is ready, initializing applyHide...");
            applyHide();

            // React to route changes
            frappe.router.on('change', () => {
                // console.log("🔄 Route changed, re-applying hide/show...");
                setTimeout(applyHide, 100);
            });
        } else {
            // Retry after a bit if frappe not ready yet
            setTimeout(initWhenReady, 100);
        }
    }

    // Start waiting for frappe
    document.addEventListener("DOMContentLoaded", initWhenReady);
})();

// ============================
// back button
// ==============================
 (function() {
  // console.log("[Back Button] Script loaded. Waiting for navbar...");

  let backButtonInjected = false;

  function injectBackButton() {
    if (document.getElementById('frappe-back-btn')) {
      // console.log("[Back Button] Already exists. Skipping.");
      return true;
    }

    const navbarNav = document.querySelector('header.navbar ul.navbar-nav');
    if (!navbarNav) {
      // console.warn("[Back Button] ❌ ul.navbar-nav not found in header. Retrying...");
      return false;
    }

    const backItem = document.createElement('li');
    backItem.className = 'nav-item';
    backItem.innerHTML = `


    <button 
    id="frappe-back-btn" 
    class="text-muted btn btn-default prev-doc icon-btn" 
    title="" data-original-title="back button"   
    onclick="console.log('[Back Button] Navigating back...'); window.history.back();"
    >
		<svg class="es-icon es-line  icon-sm" style="" aria-hidden="true">
			<use class="" href="#es-line-left-chevron"></use>
		</svg>
	</button>

    `;

    const navItems = navbarNav.querySelectorAll('li.nav-item');
    if (navItems.length >= 2) {
      navbarNav.insertBefore(backItem, navItems[navItems.length - 1]);
    } else {
      navbarNav.appendChild(backItem);
    }

    // console.log("[Back Button] ✅ Successfully injected into navbar-nav.");
    backButtonInjected = true;
    return true;
  }

  function shouldHideOnHomePage() {
    // Check via Frappe route (if available)
    if (typeof frappe !== 'undefined' && frappe.get_route) {
      const route = frappe.get_route();
      if (Array.isArray(route) && route[0] === 'home') {
        return true;
      }
    }

    // Fallback: check URL directly
    const path = window.location.pathname;
    return path === '/app/home' || path.startsWith('/app/home');
  }

  function updateVisibility() {
    const backButton = document.getElementById('frappe-back-btn');
    if (!backButton) return;

    const listItem = backButton.closest('li.nav-item');
    if (!listItem) return;

    const isHomePage = shouldHideOnHomePage();

    if (isHomePage) {
      listItem.style.display = 'none';
      // console.log("[Back Button] ✅ Hidden on /app/home");
    } else {
      listItem.style.display = '';
      // console.log("[Back Button] ✅ Shown on non-home page");
    }
  }

  function tryInject(maxAttempts = 10, interval = 500) {
    let attempts = 0;
    const attempt = () => {
      attempts++;
      const success = injectBackButton();
      if (success) {
        // console.log("[Back Button] 🎉 Injection complete.");
        if (typeof frappe !== "undefined" && frappe.router) {
          frappe.router.on('change', () => {
            // console.log("[Back Button] 🔄 Route changed, updating visibility...");
            setTimeout(updateVisibility, 100);
          });
        }
        updateVisibility();
      } else if (attempts < maxAttempts) {
        // console.log(`[Back Button] ⏳ Retry ${attempts}/${maxAttempts}...`);
        setTimeout(attempt, interval);
      } else {
        // console.error("[Back Button] ❌ Failed to inject after", maxAttempts, "attempts.");
      }
    };
    attempt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tryInject());
  } else {
    tryInject();
  }
})();



// =============================
// module button
// ==============================
(function() {
  // console.log("[Modules Button] Script loaded. Waiting for navbar...");

  let modulesButtonInjected = false;

  function injectModulesButton() {
    if (document.getElementById('frappe-modules-btn')) {
      // console.log("[Modules Button] Already exists. Skipping.");
      return true;
    }

    const navbarNav = document.querySelector('header.navbar ul.navbar-nav');
    if (!navbarNav) {
      // console.warn("[Modules Button] ❌ ul.navbar-nav not found in header. Retrying...");
      return false;
    }

    const modulesItem = document.createElement('li');
    modulesItem.className = 'nav-item';
    modulesItem.innerHTML = `
      <button 
        id="frappe-modules-btn" 
        class="text-muted btn  prev-doc icon-btn" 
        title="Modules" 
        data-original-title="Modules"
        onclick="window.location.href='/app/modules'"
      >
<svg  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20 20L18.2678 18.2678M18.2678 18.2678C18.7202 17.8154 19 17.1904 19 16.5C19 15.1193 17.8807 14 16.5 14C15.1193 14 14 15.1193 14 16.5C14 17.8807 15.1193 19 16.5 19C17.1904 19 17.8154 18.7202 18.2678 18.2678ZM15.6 10H18.4C18.9601 10 19.2401 10 19.454 9.89101C19.6422 9.79513 19.7951 9.64215 19.891 9.45399C20 9.24008 20 8.96005 20 8.4V5.6C20 5.03995 20 4.75992 19.891 4.54601C19.7951 4.35785 19.6422 4.20487 19.454 4.10899C19.2401 4 18.9601 4 18.4 4H15.6C15.0399 4 14.7599 4 14.546 4.10899C14.3578 4.20487 14.2049 4.35785 14.109 4.54601C14 4.75992 14 5.03995 14 5.6V8.4C14 8.96005 14 9.24008 14.109 9.45399C14.2049 9.64215 14.3578 9.79513 14.546 9.89101C14.7599 10 15.0399 10 15.6 10ZM5.6 10H8.4C8.96005 10 9.24008 10 9.45399 9.89101C9.64215 9.79513 9.79513 9.64215 9.89101 9.45399C10 9.24008 10 8.96005 10 8.4V5.6C10 5.03995 10 4.75992 9.89101 4.54601C9.79513 4.35785 9.64215 4.20487 9.45399 4.10899C9.24008 4 8.96005 4 8.4 4H5.6C5.03995 4 4.75992 4 4.54601 4.10899C4.35785 4.20487 4.20487 4.35785 4.10899 4.54601C4 4.75992 4 5.03995 4 5.6V8.4C4 8.96005 4 9.24008 4.10899 9.45399C4.20487 9.64215 4.35785 9.79513 4.54601 9.89101C4.75992 10 5.03995 10 5.6 10ZM5.6 20H8.4C8.96005 20 9.24008 20 9.45399 19.891C9.64215 19.7951 9.79513 19.6422 9.89101 19.454C10 19.2401 10 18.9601 10 18.4V15.6C10 15.0399 10 14.7599 9.89101 14.546C9.79513 14.3578 9.64215 14.2049 9.45399 14.109C9.24008 14 8.96005 14 8.4 14H5.6C5.03995 14 4.75992 14 4.54601 14.109C4.35785 14.2049 4.20487 14.3578 4.10899 14.546C4 14.7599 4 15.0399 4 15.6V18.4C4 18.9601 4 19.2401 4.10899 19.454C4.20487 19.6422 4.35785 19.7951 4.54601 19.891C4.75992 20 5.03995 20 5.6 20Z" stroke="#000000" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
      </button>
    `;

    const navItems = navbarNav.querySelectorAll('li.nav-item');
    if (navItems.length >= 2) {
      navbarNav.insertBefore(modulesItem, navItems[navItems.length - 1]);
    } else {
      navbarNav.appendChild(modulesItem);
    }

    // console.log("[Modules Button] ✅ Successfully injected into navbar-nav.");
    modulesButtonInjected = true;
    return true;
  }

  function tryInject(maxAttempts = 10, interval = 500) {
    let attempts = 0;
    const attempt = () => {
      attempts++;
      const success = injectModulesButton();
      if (success) {
        // console.log("[Modules Button] 🎉 Injection complete.");
      } else if (attempts < maxAttempts) {
        // console.log(`[Modules Button] ⏳ Retry ${attempts}/${maxAttempts}...`);
        setTimeout(attempt, interval);
      } else {
        // console.error("[Modules Button] ❌ Failed to inject after", maxAttempts, "attempts.");
      }
    };
    attempt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tryInject());
  } else {
    tryInject();
  }
})();