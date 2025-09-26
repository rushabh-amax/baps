// Copyright (c) 2025, Ayush Patel and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Size List Creation", {
// 	refresh(frm) {

// 	},
// });




frappe.ui.form.on('Size List Creation', {
    refresh: function(frm) {
        // Hide the Add Row button for stone_details table
        frm.fields_dict.stone_details.grid.custom_buttons = {};
        frm.fields_dict.stone_details.grid.add_custom_button = function() {};
        
        // Hide the default add row button
        setTimeout(() => {
            frm.fields_dict.stone_details.grid.wrapper.find('.grid-add-row, .btn-open-row').hide();
            frm.fields_dict.stone_details.grid.wrapper.find('[data-fieldname="stone_details"] .grid-footer .btn').hide();
        }, 100);
        
        // Remove any existing custom messages
        frm.fields_dict.stone_details.grid.wrapper.find('.grid-footer .text-muted').remove();
        
        // Make stone details table read-only
        frm.fields_dict.stone_details.grid.static_rows = true;
        frm.fields_dict.stone_details.grid.only_sortable();
        
        // Disable editing in stone details
        frm.fields_dict.stone_details.grid.wrapper.find('input, select, textarea').prop('disabled', true);
        frm.fields_dict.stone_details.grid.wrapper.find('.grid-row').css({
            'background-color': '#f8f9fa',
            'opacity': '0.9'
        });
    },
    
    form_number: function(frm) {
        if (!frm.doc.form_number) return;

        // Check if form_number is a Size List Generation document
        if (frm.doc.form_number && frm.doc.form_number.startsWith('SZGEN-')) {
            // Get published stones from Size List Generation
            frappe.call({
                method: "baps.baps.doctype.size_list_creation.size_list_creation.get_published_stones_from_generation",
                args: { generation_name: frm.doc.form_number },
                callback: function(r) {
                    if (r.message && r.message.success) {
                        frm.clear_table("stone_details");
                        
                        if (r.message.data && r.message.data.stone_details) {
                            r.message.data.stone_details.forEach(item => {
                                let row = frm.add_child("stone_details");
                                Object.assign(row, item);
                            });
                            frm.refresh_field("stone_details");

                            frappe.msgprint({
                                title: "Published Stones Loaded",
                                message: `✅ Loaded ${r.message.generation_stats.published_stones} published stones from Size List Generation<br>📊 ${r.message.generation_stats.unpublished_stones} stones not yet published`,
                                indicator: "green"
                            });
                        } else {
                            frappe.msgprint({
                                title: "No Published Stones",
                                message: "No published stones found in this Size List Generation document. Please publish stones first.",
                                indicator: "orange"
                            });
                        }
                    } else {
                        frappe.msgprint({
                            title: "Error",
                            message: r.message ? r.message.message : "Failed to load published stones",
                            indicator: "red"
                        });
                    }
                }
            });
        } else {
            // Fallback to original Size List method for backward compatibility
            frappe.call({
                method: "baps.baps.doctype.size_list_creation.size_list_creation.create_size_list_items_from_range",
                args: { form_number: frm.doc.form_number },
                callback: function(r) {
                    if (r.message) {
                        frm.clear_table("stone_details");
                        r.message.items.forEach(item => {
                            let row = frm.add_child("stone_details");
                            Object.assign(row, item);
                        });
                        frm.refresh_field("stone_details");

                        frappe.msgprint({
                            title: "Range Processing Complete",
                            message: `✅ Created ${r.message.created_count} items<br>⚠️ Skipped ${r.message.skipped_count} duplicates`,
                            indicator: r.message.skipped_count > 0 ? "orange" : "green"
                        });
                    }
                }
            });
        }
    }
});
