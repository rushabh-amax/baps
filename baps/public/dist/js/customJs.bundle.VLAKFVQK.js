(() => {
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
})();
//# sourceMappingURL=customJs.bundle.VLAKFVQK.js.map
