// function removePageTItles(){
//   const  pageTitle = document.querySelector(".page-title");
//     // Start observing changes in the body subtree
//   observer.observe(document.body, {
//     childList: true,
//     subtree: true,
//   });

// }
// document.addEventListener("DOMContentLoaded", movePageHeadContent);

// sliding active bar for ERPNext form tabs (no frappe.ready)



// from-tab sliding effect

document.addEventListener('DOMContentLoaded', function () {
  function initSlidingTabs(ul) {
    if (!ul || ul.dataset.slidingTabsInitialized) return;
    ul.dataset.slidingTabsInitialized = '1';
    ul.style.position = ul.style.position || 'relative';

    // create the highlight bar
    const bar = document.createElement('div');
    bar.className = 'sliding-tab-bar';
    Object.assign(bar.style, {
      position: 'absolute',
      bottom: '0',
      height: '4px',
      background: 'var(--_primary-bg-color)',
      borderRadius: '1em 1em 0em 0em',
      transition: 'transform 200ms ease, width 200ms ease',
      left: '0',
      width: '0',
      zIndex: '1',
      pointerEvents: 'none'
    });
    ul.appendChild(bar);

    const update = () => {
      const active =
        ul.querySelector('.nav-link.active') ||
        ul.querySelector('.nav-link');
      if (!active) return;
      const linkRect = active.getBoundingClientRect();
      const ulRect = ul.getBoundingClientRect();
      const left = linkRect.left - ulRect.left + ul.scrollLeft;
      bar.style.width = linkRect.width + 'px';
      bar.style.transform = `translateX(${left}px)`;
    };

    // update on clicks (wait for bootstrap to toggle .active)
    ul.addEventListener('click', (e) => {
      const link = e.target.closest('.nav-link');
      if (link && ul.contains(link)) {
        setTimeout(update, 150);
      }
    });

    // update on resize
    window.addEventListener('resize', update);

    // observe active class changes & DOM changes inside the tabs
    const mo = new MutationObserver(() => update());
    mo.observe(ul, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });

    // initial position
    setTimeout(update, 0);
  }

  function scanAndInit() {
    document.querySelectorAll('ul.form-tabs, ul.nav-tabs, #form-tabs').forEach(initSlidingTabs);
  }

  // initial scan
  scanAndInit();

  // ERPNext desk is SPA-like; watch for new forms/tabs injected later
  const bodyObserver = new MutationObserver(() => scanAndInit());
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  // also rescan after Bootstrap tab show (BS4/BS5 attribute variants)
  document.addEventListener('click', (e) => {
    if (e.target.closest('a[data-toggle="tab"], a[data-bs-toggle="tab"]')) {
      setTimeout(scanAndInit, 200);
    }
  });
});







// from-tab sliding effect

document.addEventListener('DOMContentLoaded', function () {
  function initSlidingTabs(ul) {
    if (!ul || ul.dataset.slidingTabsInitialized) return;
    ul.dataset.slidingTabsInitialized = '1';
    ul.style.position = ul.style.position || 'relative';

    // create the highlight bar
    const bar = document.createElement('div');
    bar.className = 'sliding-tab-bar';
    Object.assign(bar.style, {
      position: 'absolute',
      bottom: '0',
      height: '4px',
      background: 'var(--_primary-bg-color)',
      borderRadius: '1em 1em 0em 0em',
      transition: 'transform 200ms ease, width 200ms ease',
      left: '0',
      width: '0',
      zIndex: '1',
      pointerEvents: 'none'
    });
    ul.appendChild(bar);

    const update = () => {
      const active =
        ul.querySelector('.nav-link.active') ||
        ul.querySelector('.nav-link');
      if (!active) return;
      const linkRect = active.getBoundingClientRect();
      const ulRect = ul.getBoundingClientRect();
      const left = linkRect.left - ulRect.left + ul.scrollLeft;
      bar.style.width = linkRect.width + 'px';
      bar.style.transform = `translateX(${left}px)`;
    };

    // update on clicks (wait for bootstrap to toggle .active)
    ul.addEventListener('click', (e) => {
      const link = e.target.closest('.nav-link');
      if (link && ul.contains(link)) {
        setTimeout(update, 150);
      }
    });

    // update on resize
    window.addEventListener('resize', update);

    // observe active class changes & DOM changes inside the tabs
    const mo = new MutationObserver(() => update());
    mo.observe(ul, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });

    // initial position
    setTimeout(update, 0);
  }

  function scanAndInit() {
    document.querySelectorAll('ul.form-tabs, ul.nav-tabs, #form-tabs').forEach(initSlidingTabs);
  }

  // initial scan
  scanAndInit();

  // ERPNext desk is SPA-like; watch for new forms/tabs injected later
  const bodyObserver = new MutationObserver(() => scanAndInit());
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  // also rescan after Bootstrap tab show (BS4/BS5 attribute variants)
  document.addEventListener('click', (e) => {
    if (e.target.closest('a[data-toggle="tab"], a[data-bs-toggle="tab"]')) {
      setTimeout(scanAndInit, 200);
    }
  });
});


//  login password

// document.addEventListener("DOMContentLoaded", () => {
//     const injectToggle = (input) => {
//         // avoid duplicate injection
//         if (input.parentNode.querySelector(".toggle-password")) return;

//         let toggle = document.createElement("div");
//         toggle.classList.add("toggle-password");
//         toggle.innerHTML = `
//             <svg class="icon icon-sm" aria-hidden="true">
//                 <use href="#icon-unhide"></use>
//             </svg>
//         `;

//         // style position relative so we can absolutely position the icon
//         input.parentNode.style.position = "relative";
//         toggle.style.position = "absolute";
//         toggle.style.right = "10px";
//         toggle.style.top = "50%";
//         toggle.style.transform = "translateY(-50%)";
//         toggle.style.cursor = "pointer";

//         input.parentNode.appendChild(toggle);

//         // toggle logic
//         toggle.addEventListener("click", () => {
//             if (input.type === "password") {
//                 input.type = "text";
//                 toggle.querySelector("use").setAttribute("href", "#icon-hide");
//             } else {
//                 input.type = "password";
//                 toggle.querySelector("use").setAttribute("href", "#icon-unhide");
//             }
//         });
//     };

//     // Initial injection
//     document.querySelectorAll('input[type="password"]').forEach(injectToggle);

//     // Observe for dynamically added inputs
//     const observer = new MutationObserver((mutations) => {
//         mutations.forEach((mutation) => {
//             mutation.addedNodes.forEach((node) => {
//                 if (node.nodeType === 1) {
//                     // direct input
//                     if (node.matches?.('input[type="password"]')) {
//                         injectToggle(node);
//                     }
//                     // nested inputs inside added container
//                     node.querySelectorAll?.('input[type="password"]').forEach(injectToggle);
//                 }
//             });
//         });
//     });

//     observer.observe(document.body, { childList: true, subtree: true });
// });


//     // Initial injection

//     // Observe for dynamically added inputs
//     const observer = new MutationObserver((mutations) => {
//         mutations.forEach((mutation) => {
//             mutation.addedNodes.forEach((node) => {
//                 if (node.nodeType === 1) {
//                     // direct input
//                     if (node.matches?.('input[type="password"]')) {
//                         injectToggle(node);
//                     }
//                     // nested inputs inside added container
//                     node.querySelectorAll?.('input[type="password"]').forEach(injectToggle);
//                 }
//             });
//         });
//     });

//     observer.observe(document.body, { childList: true, subtree: true });



// // sidebar remvoe
// document.addEventListener("DOMContentLoaded", function () {
//     console.log("✅ Pure JS script started");

//     const module_API_ROUTE = "/api/method/baps.api.login_api.login_with_permissions";

//     fetch(module_API_ROUTE, {
//         method: "GET",
//         credentials: "include",
//     })
//         .then((res) => res.json())
//         .then((res) => {
//             const modules = res.message?.modules || [];

//             if (!Array.isArray(modules) || modules.length === 0) {
//                 console.log("⚠️ No modules data from API");
//                 return;
//             }

//             // Extract parent module routes (e.g., "app/hr", "app/leaves")
//             const parentRoutes = modules.map((m) =>
//                 m.route?.replace(/^\//, "") // Remove leading slash
//             );
//             console.log("✅ Parent Module Routes:", parentRoutes);

//             // Get current route in format: "app/hr", "app/leaves", etc.
//             function getCurrentRoute() {
//                 const pathParts = window.location.pathname.split("/").filter(Boolean);
//                 if (pathParts[0] === "app") {
//                     return "app/" + pathParts.slice(1).join("/");
//                 }
//                 return pathParts.join("/") || "/";
//             }

//             // Main function to show/hide sidebar
//             function toggleSidebar() {
//                 const currentRoute = getCurrentRoute();
//                 const side = document.querySelector(".layout-side-section");

//                 console.log("👉 Current Route:", currentRoute);
//                 console.log("👉 Parent Routes:", parentRoutes);
//                 console.log("👉 Sidebar element:", side);

//                 if (!Array.isArray(parentRoutes)) {
//                     console.warn("⚠️ parentRoutes is invalid");
//                     return;
//                 }

//                 if (side) {
//                     if (currentRoute && parentRoutes.includes(currentRoute)) {
//                         side.style.display = "none";
//                         console.log("🛑 Sidebar hidden for parent route:", currentRoute);
//                     } else {
//                         side.style.display = ""; // show (default)
//                         console.log("✅ Sidebar visible for:", currentRoute);
//                     }
//                 } else {
//                     console.warn("⚠️ Sidebar element not found");
//                 }
//             }

//             // Run on initial load
//             toggleSidebar();

//             // Handle browser back/forward
//             window.addEventListener("popstate", toggleSidebar);

//             // Patch history.pushState to dispatch custom event
//             const originalPushState = history.pushState;
//             history.pushState = function (...args) {
//                 originalPushState.apply(this, args);
//                 window.dispatchEvent(new Event("pushstate"));
//             };

//             // Listen to pushstate
//             window.addEventListener("pushstate", toggleSidebar);

//             // Optional: hash-based routing
//             window.addEventListener("hashchange", toggleSidebar);

//         })
//         .catch((err) => {
//             console.error("❌ API fetch error:", err);
//         });
// });


// document.addEventListener("DOMContentLoaded", function () {
//     // ✅ Only run if we're on a page where sidebar is hidden
//     const sidebar = document.querySelector(".layout-side-section");
//     const shouldShowBackButton = !sidebar || getComputedStyle(sidebar).display === "none";

//     if (!shouldShowBackButton) {
//         return; // Sidebar is visible → no need for back button
//     }

//     // ✅ Find the navbar nav element: d-none d-sm-flex (right side of nav)
//     const targetNav = document.querySelector("nav.navbar-nav.d-none.d-sm-flex");

//     if (!targetNav) {
//         console.warn("⚠️ Could not find target navbar (.navbar-nav.d-none.d-sm-flex)");
//         return;
//     }

//     // ✅ Create back button
//     const backButtonLi = document.createElement("li");
//     backButtonLi.className = "nav-item";

//     const backButton = document.createElement("a");
//     backButton.className = "nav-link pointer";
//     backButton.style = "cursor: pointer; font-weight: 500; padding: 0.5rem 1rem;";
//     backButton.innerHTML = `
//         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16" style="vertical-align: middle; margin-right: 0.3rem;">
//             <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l4.147 4.146a.5.5 0 0 1-.708.708l-5-5a.5.5 0 0 1 0-.708l5-5a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
//         </svg>
//         Back
//     `;

//     // ✅ Handle click: go to referrer or fallback to /app/modules
//     backButton.addEventListener("click", function (e) {
//         e.preventDefault();
//         const referrer = document.referrer;
//         const fallbackUrl = "/app/modules"; // or "/app" if no modules page

//         // Optional: Don't go back to login or blank
//         if (referrer && referrer.includes(window.location.origin) && !referrer.includes("login")) {
//             window.location.href = referrer;
//         } else {
//             window.location.href = fallbackUrl;
//         }
//     });

//     backButtonLi.appendChild(backButton);

//     // ✅ Inject at the start of the right navbar
//     targetNav.prepend(backButtonLi);

//     console.log("✅ Back button injected into navbar");
// });