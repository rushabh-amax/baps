function toggleSearchBar() {
    const path = window.location.pathname;
    console.log("toggleSearchBar called, path:", path); // check if called

    const searchBar = document.querySelector('.input-group.search-bar');
    if (searchBar) {
        if (path === '/app/modules') {
            searchBar.style.display = 'none';
        } else {
            searchBar.style.display = ''; // show on all other pages
        }
    }
}

function toggleBreadCrumb() {
    const path = window.location.pathname;
    const breadcrumbs = document.querySelector('#navbar-breadcrumbs');

    if (breadcrumbs) {
        if (path === '/app/modules') {
            breadcrumbs.style.setProperty('display', 'none', 'important');
        } else {
            breadcrumbs.style.removeProperty('display');
        }
    }
}



// Run on initial load
document.addEventListener('DOMContentLoaded', toggleSearchBar);

document.addEventListener('DOMContentLoaded', toggleBreadCrumb);

// Run on SPA route change
frappe.router.on('change', toggleSearchBar);
frappe.router.on('change', toggleBreadCrumb);




// ============================================
// tab's
// ============================================
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
      background: 'orange',
      borderRadius: '1em 1em 0em 0em',
      transition: 'transform 200ms ease, width 200ms ease',
      left: '0',
      width: '0',
      zIndex: '1',
      pointerEvents: 'none'
    });
    ul.appendChild(bar);
    console.log("tab active slideer insterd")

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

// ============================================
// awsomebar shift
// ============================================

// document.addEventListener("DOMContentLoaded", function () {
//   console.log("Awesomplete shift start");

//   const observer = new MutationObserver(() => {
//     // find focused input inside form-grid that has awesomplete
//     const activeInput = document.querySelector(
//       '.form-grid .awesomplete input:focus[aria-owns]'
//     );

//     if (activeInput) {
//       const listId = activeInput.getAttribute("aria-owns");
//       const list = document.getElementById(listId);

//       if (list) {
//         console.log("Focused input:", activeInput.dataset.fieldname, activeInput);
//         console.log("Dropdown list:", listId, list);

//         // move list to <body> so it's not clipped by table/grid
//         if (!list.dataset.shifted) {
//           list.dataset.shifted = "1"; 
//           document.body.appendChild(list);

//           // reset base styles
//           list.style.position = "absolute";
//           list.style.background= "white";
//           list.style.width="350px"
//           list.style.border="1.4px solid whitesmoke"
//           list.style.zIndex = "9999"; // ensure it's above form
//           list.hidden = false;
//         }

//         // always recalc position relative to input
//         const rect = activeInput.getBoundingClientRect();
//         list.style.top = rect.bottom + window.scrollY + "px";
//         list.style.left = rect.left + window.scrollX + "px";
//         list.style.width = rect.width + "px";
//       }
//     }
//   });

//   observer.observe(document.body, {
//     childList: true,
//     subtree: true,
//   });
// });



// ============================================
// toggle sidebar 
// ============================================

// funtion works like should not show toggle sidebar button on all parent page or workspace pages 
// function toggleSidebarBtn() {
//     const path = window.location.pathname;
//     const toggleBtn = document.querySelector('[aria-label="Toggle Sidebar"]');

//     if (!toggleBtn) return;
//     console.log("seeing parent sidebar btn")

//     // Check if path matches exactly /app/<workspace_name> (no trailing slash or extra parts)
//     const isTopLevelWorkspace = /^\/app\/[^\/]+$/.test(path);

//     console.log("path checked:" , path)


//     if (isTopLevelWorkspace) {
//         toggleBtn.style.setProperty('display', 'none', 'important');
//         console.log("-----------------------")
//         console.log("hide the sidebar btn to this path checked:" , path)

//     } else {
//         toggleBtn.style.removeProperty('display');
//         console.log("-----------------------")
//         console.log("show the sidebar btn to this path checked:" , path)

//     }
// }

// // // Run on initial load
// document.addEventListener('DOMContentLoaded', toggleSidebarBtn);

// // Run on SPA route changes (Frappe router)
// if (frappe && frappe.router) {
//     frappe.router.on('change', toggleSidebarBtn);
// }



//   force theme: "BAPS" forever
// force_baps_theme.js — Force 'baps' theme for everyone



// ============================================
// custom sidebar of erpnext
// ============================================

// (function () {
//   if (!window.frappe || !frappe.boot) {
//     console.log('[MiniSidebar] Not in Desk context. Skipping.');
//     return;
//   }

//   console.log('[MiniSidebar] Initializing...');

//   // --- Function to render the sidebar ---
//   function renderMiniSidebar() {
//     frappe.call({
//       method: 'frappe.desk.desktop.get_workspace_sidebar_items',
//       freeze: false,
//       callback: function (r) {
//         console.log('[MiniSidebar] API Response:', r);

//         if (!r.message || !Array.isArray(r.message.pages)) {
//           console.warn('[MiniSidebar] No workspace data received.');
//           return;
//         }

//         // Filter top-level, public, visible workspaces
//         const topLevelPages = r.message.pages.filter(page => {
//           const keep = page.public === 1 && page.is_hidden === 0 && page.parent_page === "";
//           console.log(`[MiniSidebar] Page "${page.name}" -> ${keep ? 'INCLUDED' : 'SKIPPED'}`);
//           return keep;
//         });

//         if (topLevelPages.length === 0) {
//           console.warn('[MiniSidebar] No top-level workspaces to show.');
//           return;
//         }

//         // Create container
//         let sidebarHTML = `
//           <div class="erpnext-minisidebar" style="
//             position: fixed;
//             top: var(--navbar-height, 56px);
//             left: 0;
//             height: calc(100vh - var(--navbar-height, 56px));
//             background: white;
//             border-right: 1px solid #ebedf0;
//             z-index: 1030;
//             padding: 12px 0;
//             overflow-y: auto;
//             width: 64px;
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//           ">
//             <div class="desk-sidebar list-unstyled sidebar-menu">
//         `;

//         // Render each item
//         topLevelPages.forEach(page => {
//           const route = `/app/${page.name.toLowerCase().replace(/\s+/g, '-')}`;
//           const icon = page.icon || 'file';
//           const label = page.label || page.name;

//           // Determine if we should show controls (drag + three dots)
//           const showControls = frappe.flags.in_edit_mode || false;

//           sidebarHTML += `
//             <div class="sidebar-item-container is-draggable" 
//                  item-parent="" 
//                  item-name="${page.name}" 
//                  item-public="${page.public}" 
//                  item-is-hidden="${page.is_hidden}">
//               <div class="desk-sidebar-item standard-sidebar-item">
//                 <a href="${route}" class="item-anchor" title="${label}">
//                   <span class="sidebar-item-icon" item-icon="${icon}">
//                     <svg class="icon icon-md" aria-hidden="true">
//                       <use href="#icon-${icon}"></use>
//                     </svg>
//                   </span>
//                   <span class="sidebar-item-label">${label}</span>
//                 </a>
//                 <div class="sidebar-item-control" style="${showControls ? '' : 'display: none;'}">
//                   <!-- Drag Handle -->
//                   <button class="btn btn-secondary btn-xs drag-handle" title="Drag" style="${showControls ? '' : 'display: none;'}">
//                     <svg class="es-icon es-line icon-xs" aria-hidden="true">
//                       <use href="#es-line-drag"></use>
//                     </svg>
//                   </button>
//                   <!-- Three-dot Menu -->
//                   <div class="btn btn-xs setting-btn dropdown-btn" title="Settings" style="${showControls ? '' : 'display: none;'}">
//                     <svg class="es-icon es-line icon-xs" aria-hidden="true">
//                       <use href="#es-line-dot-horizontal"></use>
//                     </svg>
//                   </div>
//                   <!-- Dropdown Menu -->
//                   <div class="dropdown-list hidden">
//                     <div class="dropdown-item" title="Edit Workspace" data-action="edit" data-page="${page.name}">
//                       <span class="dropdown-item-icon">
//                         <svg class="es-icon es-line icon-sm" aria-hidden="true">
//                           <use href="#es-line-edit"></use>
//                         </svg>
//                       </span>
//                       <span class="dropdown-item-label">Edit</span>
//                     </div>
//                     <div class="dropdown-item" title="Duplicate Workspace" data-action="duplicate" data-page="${page.name}">
//                       <span class="dropdown-item-icon">
//                         <svg class="es-icon es-line icon-sm" aria-hidden="true">
//                           <use href="#es-line-duplicate"></use>
//                         </svg>
//                       </span>
//                       <span class="dropdown-item-label">Duplicate</span>
//                     </div>
//                     <div class="dropdown-item" title="Hide Workspace" data-action="hide" data-page="${page.name}">
//                       <span class="dropdown-item-icon">
//                         <svg class="es-icon es-line icon-sm" aria-hidden="true">
//                           <use href="#es-line-hide"></use>
//                         </svg>
//                       </span>
//                       <span class="dropdown-item-label">Hide</span>
//                     </div>
//                     <div class="dropdown-item" title="Delete Workspace" data-action="delete" data-page="${page.name}">
//                       <span class="dropdown-item-icon">
//                         <svg class="icon icon-sm" aria-hidden="true">
//                           <use href="#icon-delete-active"></use>
//                         </svg>
//                       </span>
//                       <span class="dropdown-item-label">Delete</span>
//                     </div>
//                   </div>
//                   <!-- Drop Icon (for nested items) -->
//                   <button class="btn-reset drop-icon hidden">
//                     <svg class="es-icon es-line icon-sm" aria-hidden="true">
//                       <use href="#es-line-down"></use>
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//               <div class="sidebar-child-item nested-container"></div>
//             </div>
//           `;
//         });

//         sidebarHTML += `
//             </div>
//           </div>
//         `;

//         // Inject into body
//         document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
//         console.log('[MiniSidebar] Injected into DOM.');

//         // --- Add Event Listeners ---

//         // Toggle dropdown on three-dot click
//         $(document).on('click', '.erpnext-minisidebar .setting-btn', function (e) {
//           e.stopPropagation();
//           const $dropdown = $(this).siblings('.dropdown-list');
//           $('.dropdown-list').not($dropdown).addClass('hidden');
//           $dropdown.toggleClass('hidden');
//         });

//         // Close dropdown on click outside
//         $(document).on('click', function (e) {
//           if (!$(e.target).closest('.setting-btn, .dropdown-list').length) {
//             $('.dropdown-list').addClass('hidden');
//           }
//         });

//         // Handle action clicks
//         $(document).on('click', '.dropdown-item', function (e) {
//           e.preventDefault();
//           const action = $(this).data('action');
//           const pageName = $(this).data('page');

//           console.log(`[MiniSidebar] Action: ${action} on page: ${pageName}`);

//           if (action === 'edit') {
//             frappe.set_route('Form', 'Workspace', pageName);
//           } else if (action === 'duplicate') {
//             frappe.call({
//               method: 'frappe.desk.doctype.workspace.workspace.duplicate_workspace',
//               args: { name: pageName },
//               callback: function (r) {
//                 if (r.message) {
//                   frappe.msgprint(__('Workspace duplicated successfully.'));
//                   location.reload(); // Refresh to see changes
//                 }
//               }
//             });
//           } else if (action === 'hide') {
//             frappe.call({
//               method: 'frappe.desk.doctype.workspace.workspace.set_hidden',
//               args: { name: pageName, hidden: 1 },
//               callback: function (r) {
//                 if (r.message) {
//                   frappe.msgprint(__('Workspace hidden successfully.'));
//                   location.reload(); // Refresh to see changes
//                 }
//               }
//             });
//           } else if (action === 'delete') {
//             frappe.confirm(
//               __('Are you sure you want to delete the workspace "{0}"?', [pageName]),
//               function () {
//                 frappe.call({
//                   method: 'frappe.desk.doctype.workspace.workspace.delete_workspace',
//                   args: { name: pageName },
//                   callback: function (r) {
//                     if (r.message) {
//                       frappe.msgprint(__('Workspace deleted successfully.'));
//                       location.reload(); // Refresh to see changes
//                     }
//                   }
//                 });
//               }
//             );
//           }
//         });

//         // Show/hide controls based on edit mode
//         function updateEditMode() {
//           const inEditMode = frappe.flags.in_edit_mode;
//           console.log(`[MiniSidebar] Edit mode: ${inEditMode}`);
//           $('.sidebar-item-control').css('display', inEditMode ? 'flex' : 'none');
//           $('.drag-handle, .setting-btn').css('display', inEditMode ? 'inline-flex' : 'none');
//         }

//         // Initial check
//         updateEditMode();

//         // Listen for edit mode changes
//         $(document).on('workspace:edit-mode-changed', updateEditMode);
//         $(document).on('click', '.edit-workspace-button', function () {
//           frappe.flags.in_edit_mode = true;
//           $(document).trigger('workspace:edit-mode-changed');
//         });
//         $(document).on('click', '.discard-workspace-button, .save-workspace-button', function () {
//           frappe.flags.in_edit_mode = false;
//           $(document).trigger('workspace:edit-mode-changed');
//         });

//       }
//     });
//   }

//   // --- Run on page load ---
//   document.addEventListener("DOMContentLoaded" , ()=> {
    
//     renderMiniSidebar();
  
//     // Also re-render if workspace is edited/saved
//     $(document).on('workspace:updated', renderMiniSidebar);
//   });
//   })();


//   if (!window.frappe || !frappe.boot) {
//     console.log('[MiniSidebar] Not in Desk context. Skipping.');
//     return;
//   }

//   console.log('[MiniSidebar] Initializing...');

//   frappe.call({
//     method: 'frappe.desk.desktop.get_workspace_sidebar_items',
//     freeze: false,
//     callback: function (r) {
//       console.log('[MiniSidebar] API Response:', r);

//       if (!r.message || !Array.isArray(r.message.pages)) {
//         console.warn('[MiniSidebar] No workspace data received.');
//         return;
//       }

//       // Filter top-level, public, visible workspaces
//       const topLevelPages = r.message.pages.filter(page => {
//         const keep = page.public === 1 && page.is_hidden === 0 && page.parent_page === "";
//         console.log(`[MiniSidebar] Page "${page.name}" -> ${keep ? 'INCLUDED' : 'SKIPPED'}`);
//         return keep;
//       });

//       if (topLevelPages.length === 0) {
//         console.warn('[MiniSidebar] No top-level workspaces to show.');
//         return;
//       }

//       // Create container
//       const sidebarHTML = `
//         <div class="erpnext-minisidebar" style="
//           position: fixed;
//           top: var(--navbar-height, 56px);
//           left: 0;
//           height: calc(100vh - var(--navbar-height, 56px));
//           background: white;
//           border-right: 1px solid #ebedf0;
//           z-index: 1030;
//           padding: 12px 0;
//           overflow-y: auto;
//           width: 64px;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//         ">
//           <div class="desk-sidebar list-unstyled sidebar-menu">
//             <!-- Items will be injected here -->
//           </div>
//         </div>
//       `;

//       document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
//       const $sidebarMenu = $('.erpnext-minisidebar .desk-sidebar');

//       // Render each item with native ERPNext styling
//       topLevelPages.forEach(page => {
//         const route = `/app/${page.name.toLowerCase().replace(/\s+/g, '-')}`;
//         const icon = page.icon || 'file';
//         const label = page.label || page.name;

//         // Create item HTML mimicking ERPNext's structure
//         const itemHTML = `
//           <div class="sidebar-item-container is-draggable" 
//                item-parent="" 
//                item-name="${page.name}" 
//                item-public="${page.public}" 
//                item-is-hidden="${page.is_hidden}">
//             <div class="desk-sidebar-item standard-sidebar-item">
//               <a href="${route}" class="item-anchor" title="${label}">
//                 <span class="sidebar-item-icon" item-icon="${icon}">
//                   <svg class="icon icon-md" aria-hidden="true">
//                     <use href="#icon-${icon}"></use>
//                   </svg>
//                 </span>
//                 <span class="sidebar-item-label">${label}</span>
//               </a>
//               <div class="sidebar-item-control">
//                 <!-- Drag Handle -->
//                 <button class="btn btn-secondary btn-xs drag-handle" title="Drag">
//                   <svg class="es-icon es-line icon-xs" aria-hidden="true">
//                     <use href="#es-line-drag"></use>
//                   </svg>
//                 </button>
//                 <!-- Three-dot Menu -->
//                 <div class="btn btn-xs setting-btn dropdown-btn" title="Settings">
//                   <svg class="es-icon es-line icon-xs" aria-hidden="true">
//                     <use href="#es-line-dot-horizontal"></use>
//                   </svg>
//                 </div>
//                 <!-- Dropdown Menu -->
//                 <div class="dropdown-list hidden">
//                   <div class="dropdown-item" title="Edit Workspace">
//                     <span class="dropdown-item-icon">
//                       <svg class="es-icon es-line icon-sm" aria-hidden="true">
//                         <use href="#es-line-edit"></use>
//                       </svg>
//                     </span>
//                     <span class="dropdown-item-label">Edit</span>
//                   </div>
//                   <div class="dropdown-item" title="Duplicate Workspace">
//                     <span class="dropdown-item-icon">
//                       <svg class="es-icon es-line icon-sm" aria-hidden="true">
//                         <use href="#es-line-duplicate"></use>
//                       </svg>
//                     </span>
//                     <span class="dropdown-item-label">Duplicate</span>
//                   </div>
//                   <div class="dropdown-item" title="Hide Workspace">
//                     <span class="dropdown-item-icon">
//                       <svg class="es-icon es-line icon-sm" aria-hidden="true">
//                         <use href="#es-line-hide"></use>
//                       </svg>
//                     </span>
//                     <span class="dropdown-item-label">Hide</span>
//                   </div>
//                   <div class="dropdown-item" title="Delete Workspace">
//                     <span class="dropdown-item-icon">
//                       <svg class="icon icon-sm" aria-hidden="true">
//                         <use href="#icon-delete-active"></use>
//                       </svg>
//                     </span>
//                     <span class="dropdown-item-label">Delete</span>
//                   </div>
//                 </div>
//                 <!-- Drop Icon (for nested items) -->
//                 <button class="btn-reset drop-icon hidden">
//                   <svg class="es-icon es-line icon-sm" aria-hidden="true">
//                     <use href="#es-line-down"></use>
//                   </svg>
//                 </button>
//               </div>
//             </div>
//             <div class="sidebar-child-item nested-container"></div>
//           </div>
//         `;

//         $sidebarMenu.append(itemHTML);
//       });

//       console.log('[MiniSidebar] Injected into DOM.');

//       // --- Add Event Listeners for Dropdown ---
//       $(document).on('click', '.erpnext-minisidebar .setting-btn', function (e) {
//         e.stopPropagation();
//         const $dropdown = $(this).siblings('.dropdown-list');
//         $('.dropdown-list').not($dropdown).addClass('hidden');
//         $dropdown.toggleClass('hidden');
//       });

//       // Close dropdown on click outside
//       $(document).on('click', function (e) {
//         if (!$(e.target).closest('.setting-btn, .dropdown-list').length) {
//           $('.dropdown-list').addClass('hidden');
//         }
//       });

//       // Optional: Add hover effect for active state
//       $('.erpnext-minisidebar .desk-sidebar-item').hover(
//         function () { $(this).addClass('selected'); },
//         function () { $(this).removeClass('selected'); }
//       );

//     }
//   });
// })();