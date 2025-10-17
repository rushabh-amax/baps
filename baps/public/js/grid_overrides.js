(function() {
    // console.log("🔄 Waiting for GridRow...");

    function override_gridrow() {
        if (frappe.ui && frappe.ui.form && frappe.ui.form.GridRow) {
            // console.log("✅ Overriding GridRow.get_menu_items");

            frappe.ui.form.GridRow.prototype.get_menu_items = function () {
                return [
                    {
                        label: __("Delete"),
                        action: () => this.remove(),
                        shortcut: "Shift+Ctrl+D",
                    },
                    {
                        label: __("Close"),
                        action: () => this.toggle_view(false),
                    },
                ];
            };

            return true;
        }
        return false;
    }

    // Keep checking until GridRow is loaded
    const interval = setInterval(() => {
        if (override_gridrow()) {
            clearInterval(interval);
        }
    }, 200);
})();




