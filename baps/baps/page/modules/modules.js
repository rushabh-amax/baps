frappe.pages['modules'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: '',
        single_column: true
    });

    $(`<style>
        .page-modules #navbar-breadcrumbs 
        { 
        display: none !important; 
        }
        #page-modules{
        height:86vh;}
        
    </style>`).appendTo('head');

    const module_API_ROUTE = `/api/method/baps.api.login_api.login_with_permissions`;

    let container = $(`
        <div class="container mt-4">
            <div id="modules-search-container" class="text-center mb-4" style="display:none;">
                <div class="input-group search-bar text-muted" style="max-width: 500px; margin: 0 auto;">
                    <div class="awesomplete">
                        <input id="modules-search" type="text" class="form-control"
                            placeholder="Search modules..."
                            autocomplete="off" aria-haspopup="true"
                            aria-expanded="false" role="combobox">
                        <ul hidden role="listbox" id="modules-awesomplete-list"></ul>
                        <span class="visually-hidden" role="status" aria-live="assertive" aria-atomic="true">
                            Begin typing for results.
                        </span>
                    </div>
                    <span class="search-icon">
                        <svg class="icon icon-sm"><use href="#icon-search"></use></svg>
                    </span>
                </div>
            </div>
            <div class="d-flex align-content-start flex-wrap" style="gap:20px; justify-content: center;" id="modules-container"></div>
            <div id="no-modules-message" class="text-center mt-5" style="display:none;">
                <h5 class="text-muted">No module named "<span id="search-term"></span>"</h5>
            </div>
        </div>
    `).appendTo(page.body);

    console.log("Fetching modules from API...");

    fetch(module_API_ROUTE, {
        method: "GET",
        credentials: "include"
    })
    .then(r => r.json())
    .then(data => {
        console.log("Modules API Response:", data);

        let modules = data.message ? data.message.modules : data.modules;
        const hasModules = modules && modules.length > 0;

        const moduleContainer = $("#modules-container");
        const noModulesMsg = $("#no-modules-message");
        const searchContainer = $("#modules-search-container");
        const searchInput = $("#modules-search");

        if (hasModules) {
            if (modules.length > 5) {
                searchContainer.css('display', 'block');
            }

            modules.forEach(mod => {
                let modName = mod.label || mod.name;
                let modIcon = mod.icon || 'cube';
                let modRoute = mod.route || `/${mod.name}`;

                let card = $(`
                    <div class="w-100px module-card">
                        <div class="rounded card app-card text-center h-100 w-100 border-0" style="cursor:pointer;">
                            <div class="card-body d-flex flex-column align-items-center justify-content-center p-3">
                                <span class="sidebar-item-icon module-icon mb-2" item-icon="${modIcon}">
                                    <svg class="icon icon-xl" aria-hidden="true">
                                        <use href="#icon-${modIcon}"></use>
                                    </svg>
                                </span>
                                <div class="app-title fw-medium text-wrap-custom">${modName}</div>
                            </div>
                        </div>
                    </div>
                `);

                card.on("click", function () {
                    if (modRoute) frappe.set_route(modRoute);
                });

                moduleContainer.append(card);
            });

            // ✅ FIXED SEARCH HERE
            if (modules.length > 5) {
                searchInput.on('input', function () {
                    const query = $(this).val().trim().toLowerCase();
                    const cards = $('.module-card');
                    let matchFound = false;

                    cards.each(function () {
                        const title = $(this).find('.app-title').text().toLowerCase();
                        const isMatch = title.includes(query);
                        $(this).toggle(isMatch);
                        if (isMatch) matchFound = true;
                    });

                    if (query !== "" && !matchFound) {
                        noModulesMsg.show();
                        $('#search-term').text(query);
                    } else {
                        noModulesMsg.hide();
                    }
                });
            }
        } else {
            moduleContainer.hide();
            $("#modules-container").html(`
                <div class="text-center mt-5 w-100">
                    <h4 class="text-muted">You do not have any permission to access modules</h4>
                    <p class="mb-3">Head back to the home page</p>
                    <button class="btn btn-primary" id="go-home-btn">Go to Home</button>
                </div>
            `);

            $("#go-home-btn").on("click", function () {
                frappe.set_route("home").catch(() => {
                    frappe.set_route("welcome-workspace");
                });
            });
        }
    })
    .catch(err => {
        console.error("Error fetching modules:", err);
        $("#modules-container").html(`<p class='text-danger text-center'>Failed to load modules</p>`);
    });
};
