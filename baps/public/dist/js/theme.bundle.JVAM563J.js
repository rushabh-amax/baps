(() => {
  // ../baps/baps/public/js/theme_switcher.js
  frappe.provide("frappe.ui");
  frappe.ui.ThemeSwitcher = class CustomThemeSwitcher extends frappe.ui.ThemeSwitcher {
    fetch_themes() {
      return new Promise((resolve) => {
        this.themes = [
          {
            name: "light",
            label: "Frappe Light",
            info: "Light Theme"
          },
          {
            name: "dark",
            label: "Timeless Night",
            info: "Dark Theme"
          },
          {
            name: "automatic",
            label: "Automatic",
            info: "Uses system's theme to switch between light and dark mode"
          },
          {
            name: "baps",
            label: "baps",
            info: "baps Theme"
          }
        ];
        resolve(this.themes);
      });
    }
  };

  // ../baps/baps/public/js/login.bundle.js
  var eyeSVG = `
<svg class="icon-eye" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z" stroke="gray" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z" stroke="gray" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
  var eyeSlashSVG = `
<svg class="icon-eye-slash" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="gray" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
  function addCustomPasswordToggle(input) {
    console.log("in login file : in custom toggle funton");
    if (input.parentNode.querySelector(".custom-toggle-password"))
      return;
    const wrapper = input.parentNode;
    const button = document.createElement("span");
    button.classList.add("custom-toggle-password");
    button.style.cursor = "pointer";
    button.style.marginLeft = "8px";
    button.innerHTML = eyeSlashSVG;
    wrapper.appendChild(button);
    console.log("in login file : apped");
    button.addEventListener("click", () => {
      if (input.type === "password") {
        input.type = "text";
        button.innerHTML = eyeSVG;
      } else {
        input.type = "password";
        button.innerHTML = eyeSlashSVG;
      }
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement("style");
    style.innerHTML = `
    .toggle-password { display: none !important; }
    .custom-toggle-password svg {
      vertical-align: middle;
    }
  `;
    document.head.appendChild(style);
    document.querySelectorAll('input[type="password"]').forEach(addCustomPasswordToggle);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          var _a;
          if (node.nodeType === 1) {
            if (node.matches('input[type="password"]')) {
              addCustomPasswordToggle(node);
            } else {
              const inputs = ((_a = node.querySelectorAll) == null ? void 0 : _a.call(node, 'input[type="password"]')) || [];
              inputs.forEach(addCustomPasswordToggle);
            }
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

  // ../baps/baps/public/js/customJs.bundle.js
  function toggleSearchBar() {
    const path = window.location.pathname;
    const searchBar = document.querySelector(".input-group.search-bar");
    if (searchBar) {
      if (path === "/app/modules") {
        searchBar.style.display = "none";
      } else {
        searchBar.style.display = "";
      }
    }
  }
  function toggleBreadCrumb() {
    const path = window.location.pathname;
    const breadcrumbs = document.querySelector("#navbar-breadcrumbs");
    if (breadcrumbs) {
      if (path === "/app/modules") {
        breadcrumbs.style.setProperty("display", "none", "important");
      } else {
        breadcrumbs.style.removeProperty("display");
      }
    }
  }
  document.addEventListener("DOMContentLoaded", toggleSearchBar);
  document.addEventListener("DOMContentLoaded", toggleBreadCrumb);
  frappe.router.on("change", toggleSearchBar);
  frappe.router.on("change", toggleBreadCrumb);
  document.addEventListener("DOMContentLoaded", function() {
    function initSlidingTabs(ul) {
      if (!ul || ul.dataset.slidingTabsInitialized)
        return;
      ul.dataset.slidingTabsInitialized = "1";
      ul.style.position = ul.style.position || "relative";
      const bar = document.createElement("div");
      bar.className = "sliding-tab-bar";
      Object.assign(bar.style, {
        position: "absolute",
        bottom: "0",
        height: "4px",
        background: "orange",
        borderRadius: "1em 1em 0em 0em",
        transition: "transform 200ms ease, width 200ms ease",
        left: "0",
        width: "0",
        zIndex: "1",
        pointerEvents: "none"
      });
      ul.appendChild(bar);
      const update = () => {
        const active = ul.querySelector(".nav-link.active") || ul.querySelector(".nav-link");
        if (!active)
          return;
        const linkRect = active.getBoundingClientRect();
        const ulRect = ul.getBoundingClientRect();
        const left = linkRect.left - ulRect.left + ul.scrollLeft;
        bar.style.width = linkRect.width + "px";
        bar.style.transform = `translateX(${left}px)`;
      };
      ul.addEventListener("click", (e) => {
        const link = e.target.closest(".nav-link");
        if (link && ul.contains(link)) {
          setTimeout(update, 150);
        }
      });
      window.addEventListener("resize", update);
      const mo = new MutationObserver(() => update());
      mo.observe(ul, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
      setTimeout(update, 0);
    }
    function scanAndInit() {
      document.querySelectorAll("ul.form-tabs, ul.nav-tabs, #form-tabs").forEach(initSlidingTabs);
    }
    scanAndInit();
    const bodyObserver = new MutationObserver(() => scanAndInit());
    bodyObserver.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", (e) => {
      if (e.target.closest('a[data-toggle="tab"], a[data-bs-toggle="tab"]')) {
        setTimeout(scanAndInit, 200);
      }
    });
  });

  // ../baps/baps/public/js/breadcrubOverride.js
  function relocateBreadcrumbs() {
    const sticky = document.querySelector(".sticky-top");
    const header = sticky == null ? void 0 : sticky.querySelector("header.navbar");
    const breadcrumbs = document.getElementById("navbar-breadcrumbs");
    if (sticky && header && breadcrumbs) {
      if (header.contains(breadcrumbs)) {
        header.after(breadcrumbs);
        console.log("\u2705 Breadcrumbs moved outside <header> into sticky-top");
      }
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
        console.log("\u2705 'Modules' breadcrumb injected once");
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
        const observer = new MutationObserver(relocateBreadcrumbs);
        observer.observe(document.body, { childList: true, subtree: true });
      }
      attempts++;
    }, 200);
  });
  (function() {
    function applyHide() {
      const route = frappe.get_route ? frappe.get_route() : null;
      const isModulesPage = Array.isArray(route) && route[0] === "modules";
      const bc = document.getElementById("navbar-breadcrumbs");
      if (!bc) {
        return;
      }
      if (isModulesPage) {
        bc.classList.add("hide-breadcrumb-force");
      } else {
        bc.classList.remove("hide-breadcrumb-force");
      }
    }
    function initWhenReady() {
      if (typeof frappe !== "undefined" && frappe.get_route && frappe.router) {
        applyHide();
        frappe.router.on("change", () => {
          setTimeout(applyHide, 100);
        });
      } else {
        setTimeout(initWhenReady, 100);
      }
    }
    document.addEventListener("DOMContentLoaded", initWhenReady);
  })();
  (function() {
    let backButtonInjected = false;
    function injectBackButton() {
      if (document.getElementById("frappe-back-btn")) {
        return true;
      }
      const navbarNav = document.querySelector("header.navbar ul.navbar-nav");
      if (!navbarNav) {
        return false;
      }
      const backItem = document.createElement("li");
      backItem.className = "nav-item";
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
      const navItems = navbarNav.querySelectorAll("li.nav-item");
      if (navItems.length >= 2) {
        navbarNav.insertBefore(backItem, navItems[navItems.length - 1]);
      } else {
        navbarNav.appendChild(backItem);
      }
      backButtonInjected = true;
      return true;
    }
    function shouldHideOnHomePage() {
      if (typeof frappe !== "undefined" && frappe.get_route) {
        const route = frappe.get_route();
        if (Array.isArray(route) && route[0] === "home") {
          return true;
        }
      }
      const path = window.location.pathname;
      return path === "/app/home" || path.startsWith("/app/home");
    }
    function updateVisibility() {
      const backButton = document.getElementById("frappe-back-btn");
      if (!backButton)
        return;
      const listItem = backButton.closest("li.nav-item");
      if (!listItem)
        return;
      const isHomePage = shouldHideOnHomePage();
      if (isHomePage) {
        listItem.style.display = "none";
      } else {
        listItem.style.display = "";
      }
    }
    function tryInject(maxAttempts = 10, interval = 500) {
      let attempts = 0;
      const attempt = () => {
        attempts++;
        const success = injectBackButton();
        if (success) {
          if (typeof frappe !== "undefined" && frappe.router) {
            frappe.router.on("change", () => {
              setTimeout(updateVisibility, 100);
            });
          }
          updateVisibility();
        } else if (attempts < maxAttempts) {
          setTimeout(attempt, interval);
        } else {
        }
      };
      attempt();
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => tryInject());
    } else {
      tryInject();
    }
  })();
  (function() {
    let modulesButtonInjected = false;
    function injectModulesButton() {
      if (document.getElementById("frappe-modules-btn")) {
        return true;
      }
      const navbarNav = document.querySelector("header.navbar ul.navbar-nav");
      if (!navbarNav) {
        return false;
      }
      const modulesItem = document.createElement("li");
      modulesItem.className = "nav-item";
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
      const navItems = navbarNav.querySelectorAll("li.nav-item");
      if (navItems.length >= 2) {
        navbarNav.insertBefore(modulesItem, navItems[navItems.length - 1]);
      } else {
        navbarNav.appendChild(modulesItem);
      }
      modulesButtonInjected = true;
      return true;
    }
    function tryInject(maxAttempts = 10, interval = 500) {
      let attempts = 0;
      const attempt = () => {
        attempts++;
        const success = injectModulesButton();
        if (success) {
        } else if (attempts < maxAttempts) {
          setTimeout(attempt, interval);
        } else {
        }
      };
      attempt();
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => tryInject());
    } else {
      tryInject();
    }
  })();

  // ../baps/baps/public/js/grid_overrides.js
  (function() {
    function override_gridrow() {
      if (frappe.ui && frappe.ui.form && frappe.ui.form.GridRow) {
        frappe.ui.form.GridRow.prototype.get_menu_items = function() {
          return [
            {
              label: __("Delete"),
              action: () => this.remove(),
              shortcut: "Shift+Ctrl+D"
            },
            {
              label: __("Close"),
              action: () => this.toggle_view(false)
            }
          ];
        };
        return true;
      }
      return false;
    }
    const interval = setInterval(() => {
      if (override_gridrow()) {
        clearInterval(interval);
      }
    }, 200);
  })();
})();
//# sourceMappingURL=theme.bundle.JVAM563J.js.map
