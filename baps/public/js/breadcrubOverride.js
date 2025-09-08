
// for only hide
// function waitForBreadcrumbs() {
//     const el = document.getElementById("navbar-breadcrumbs");
//     if (el) {
//         console.log("✅ Found:", el);

//         // ✅ Add CSS with !important
//         const style = document.createElement('style');
//         style.id = 'hide-navbar-breadcrumbs';
//         style.textContent = `
//             #navbar-breadcrumbs {
//                 display: none !important;
//             }
//         `;
//         document.head.appendChild(style);

//         el.dataset.hiddenByBaps = '1';
//         console.log("✅ #navbar-breadcrumbs hidden with !important");
//     } else {
//         console.log("⏳ Not found yet... retrying");
//         setTimeout(waitForBreadcrumbs, 200);
//     }
// }

// waitForBreadcrumbs();



// function moveBreadcrumbsToSticky() {
//     const sticky = document.querySelector(".sticky-top");
//     const breadcrumbs = document.getElementById("navbar-breadcrumbs");

//     if (sticky && breadcrumbs && !sticky.contains(breadcrumbs)) {
//         sticky.appendChild(breadcrumbs); // ✅ Move from navbar into sticky
//         console.log("✅ Breadcrumbs moved into .sticky-top");
//     }
// }

// function injectModulesBreadcrumb() {
//     const breadcrumbs = document.getElementById("navbar-breadcrumbs");
//     if (!breadcrumbs) return;

//     // Already added?
//     const firstLink = breadcrumbs.querySelector("a[href='/app/modules']");
//     if (firstLink) return;

//     // Create Modules link
//     const modulesLink = document.createElement("a");
//     modulesLink.href = "/app/modules";
//     modulesLink.textContent = "Modules";
//     modulesLink.classList.add("navbar-breadcrumb-link");
//     modulesLink.style.cursor = "pointer";
//     modulesLink.style.fontWeight = "600";
//     modulesLink.style.textDecoration = "none";

//     // Insert at the beginning
//     const li = document.createElement("li");
//     li.appendChild(modulesLink);

//     breadcrumbs.insertBefore(li, breadcrumbs.firstChild || null);

//     console.log("✅ 'Modules' breadcrumb injected");
// }

// function watchBreadcrumbs() {
//     const breadcrumbs = document.getElementById("navbar-breadcrumbs");
//     if (!breadcrumbs) return;

//     // Ensure it's placed in sticky
//     moveBreadcrumbsToSticky();

//     // Observe DOM mutations inside breadcrumbs
//     const observer = new MutationObserver(() => {
//         moveBreadcrumbsToSticky(); // in case Frappe re-inserts it back in navbar
//         injectModulesBreadcrumb();
//     });

//     observer.observe(breadcrumbs, { childList: true, subtree: true });

//     // Run once
//     injectModulesBreadcrumb();
// }

// // Run after DOM loads
// document.addEventListener("DOMContentLoaded", () => {
//     let attempts = 0;
//     const timer = setInterval(() => {
//         const bc = document.getElementById("navbar-breadcrumbs");
//         if (bc || attempts > 20) {
//             clearInterval(timer);
//             if (bc) watchBreadcrumbs();
//         }
//         attempts++;
//     }, 200);
// });

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


// $(document).on('app_ready hash_change', function () {
//     // Wait a bit for DOM to settle
//     setTimeout(() => {
//         // ✅ Safe check: does frappe.get_route exist and return a valid route?
//         const route = frappe.get_route ? frappe.get_route() : null;
//         const currentRoute = Array.isArray(route) && route.length > 0 ? route[0] : null;
//         const body = document.body;

//         if (currentRoute === 'modules') {
//             body.classList.add('route-modules');
//             console.log("✅ Added: route-modules → breadcrumb hidden");
//         } else {
//             body.classList.remove('route-modules');
//             console.log("✅ Removed: route-modules → breadcrumb visible");
//         }
//     }, 100);
// });

// Watch body class and hide/show breadcrumb based on 'no-breadcrumbs'
// Run once when app is ready

    $(document).on('app_ready hash_change', function () {
        let observer = null;

        function cleanupObserver() {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        }

        function applyHide() {
            const route = frappe.get_route ? frappe.get_route() : null;
            const isModulesPage = Array.isArray(route) && route.length > 0 && route[0] === 'modules';
            const bc = document.getElementById('navbar-breadcrumbs');

            if (!bc) {
                console.log("⏳ #navbar-breadcrumbs not found");
                return false;
            }

            if (isModulesPage) {
                bc.classList.add('hide-breadcrumb-force');
                console.log("✅ HIDING: .hide-breadcrumb-force added");
            } else {
                bc.classList.remove('hide-breadcrumb-force');
                console.log("✅ SHOWING: .hide-breadcrumb-force removed");
            }

            return true;
        }

        // Re-apply if Frappe removes the class
        function startObserver() {
            cleanupObserver();

            const bc = document.getElementById('navbar-breadcrumbs');
            if (!bc) return;

            observer = new MutationObserver(() => {
                const route = frappe.get_route ? frappe.get_route() : null;
                const isModulesPage = Array.isArray(route) && route.length > 0 && route[0] === 'modules';
                const bc = document.getElementById('navbar-breadcrumbs');

                if (!bc) return;

                if (isModulesPage && !bc.classList.contains('hide-breadcrumb-force')) {
                    bc.classList.add('hide-breadcrumb-force');
                    console.log("🔁 Re-applied .hide-breadcrumb-force (was removed by Frappe)");
                } else if (!isModulesPage && bc.classList.contains('hide-breadcrumb-force')) {
                    bc.classList.remove('hide-breadcrumb-force');
                }
            });

            observer.observe(bc, {
                attributes: true,
                attributeFilter: ['class', 'style']
            });
        }

        // Initial run
        if (applyHide()) {
            startObserver();
        }

        // Re-run on every hash change
        $(document).off('hash_change.breadcrumb').on('hash_change.breadcrumb', function () {
            console.log("🔄 Route changed, re-applying...");
            setTimeout(() => {
                if (applyHide()) {
                    startObserver();
                }
            }, 100);
        });
    });