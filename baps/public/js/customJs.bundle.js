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


// 

// sidebar false
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.querySelector(".sidebar"); // your sidebar element
  const toggleBtn = document.querySelector(".sidebar-toggle-btn");
  const toggleIcon = toggleBtn.querySelector(".sidebar-toggle-icon use");

  // ✅ Collapse by default
  sidebar.classList.add("collapsed");
  toggleIcon.setAttribute("href", "#es-line-sidebar-expand");

  // ✅ Toggle on click
  toggleBtn.addEventListener("click", function () {
    if (sidebar.classList.contains("collapsed")) {
      // Expand
      sidebar.classList.remove("collapsed");
      toggleIcon.setAttribute("href", "#es-line-sidebar-collapse");
      console.log("collapsed sidebar")
    } else {
      // Collapse
      sidebar.classList.add("collapsed");
      toggleIcon.setAttribute("href", "#es-line-sidebar-expand");
      console.log("expand  sidebar")

    }
  });
});
