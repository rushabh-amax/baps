

frappe.ui.form.on('Size List Creation', {
    setup: function(frm) {
        // 🔒 Only allow Published Size Lists that haven't been used yet
        frm.set_query("form_number", function() {
            return {
                query: "baps.baps.doctype.size_list_creation.size_list_creation.get_available_size_lists_for_creation",
                txt: frm.doc.form_number || ""
            };
        });
    }, 
    

    refresh: function(frm) {
        // Hide the document status indicator that shows "Draft"
        setTimeout(() => {
            // Hide the status indicator in the form header
            frm.page.wrapper.find('.indicator-pill').hide();
            frm.page.wrapper.find('.form-footer .tag-text').hide();
            
            // If there's a status field, hide it
            if (frm.fields_dict.status) {
                frm.toggle_display('status', false);
            }
        }, 100);
        
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
        if (!frm.doc.form_number) {
            // If form_number is cleared, make fields editable again
            make_fields_editable(frm);
            return;
        }

        // Auto-fill all fields and load stones from the selected Size List
        auto_fill_fields_from_size_list(frm, frm.doc.form_number);
        
        // Make all fields read-only except status
        make_fields_read_only(frm);
    }


    
});

// Helper function to auto-fill all fields from selected Size List
function auto_fill_fields_from_size_list(frm, size_list_name) {
    if (!size_list_name) return;
    
    frappe.call({
        method: 'frappe.client.get',
        args: {
            doctype: 'Size List',
            name: size_list_name
        },
        callback: function(r) {
            if (r.message) {
                const size_list_doc = r.message;
                
                // Auto-fill header fields
                frm.set_value('baps_project', size_list_doc.baps_project);
                frm.set_value('project_name', size_list_doc.project_name);
                frm.set_value('prep_date', size_list_doc.prep_date);
                frm.set_value('stone_type', size_list_doc.stone_type);
                frm.set_value('main_part', size_list_doc.main_part);
                frm.set_value('sub_part', size_list_doc.sub_part);
                frm.set_value('cutting_region', size_list_doc.cutting_region);
                frm.set_value('total_volume', size_list_doc.total_volume);
                
                // Auto-fill footer fields (Process Required checkboxes)
                frm.set_value('polishing', size_list_doc.polishing || 0);
                frm.set_value('dry_fitting', size_list_doc.dry_fitting || 0);
                frm.set_value('carving', size_list_doc.carving || 0);
                frm.set_value('chemicaling', size_list_doc.chemical || 0); // Note: field name might be different
                
                // Auto-fill stone details from Size List
                if (size_list_doc.stone_details && size_list_doc.stone_details.length > 0) {
                    // Clear existing stone details
                    frm.clear_table("stone_details");
                    
                    // Load stone details with range expansion
                    frappe.call({
                        method: "baps.baps.doctype.size_list_creation.size_list_creation.create_size_list_items_from_range",
                        args: { form_number: size_list_name },
                        callback: function(range_r) {
                            if (range_r.message && range_r.message.items) {
                                // Add expanded items to stone_details table
                                range_r.message.items.forEach(item => {
                                    let row = frm.add_child("stone_details");
                                    Object.assign(row, item);
                                });
                                frm.refresh_field("stone_details");
                                
                                frappe.show_alert({
                                    message: __('All fields and {0} stones loaded from Size List {1}', [range_r.message.items.length, size_list_name]),
                                    indicator: 'green'
                                });
                            } else {
                                frappe.show_alert({
                                    message: __('All fields loaded from Size List {0} (no stones found)', [size_list_name]),
                                    indicator: 'blue'
                                });
                            }
                        }
                    });
                } else {
                    frappe.show_alert({
                        message: __('All fields loaded from Size List {0} (no stones found)', [size_list_name]),
                        indicator: 'blue'
                    });
                }
            }
        }
    });
}
// Helper function to make all fields read-only (except status)
function make_fields_read_only(frm) {
    // List of fields to make read-only
    const fields_to_lock = [
        'form_number', 'baps_project', 'project_name', 'prep_date',
        'stone_type', 'main_part', 'sub_part', 'cutting_region',
        'total_volume', 'polishing', 'dry_fitting', 'carving', 'chemicaling'
    ];
    
    fields_to_lock.forEach(field => {
        frm.set_df_property(field, 'read_only', 1);
    });
    
    // Make child table read-only
    if (frm.fields_dict.stone_details && frm.fields_dict.stone_details.grid) {
        frm.fields_dict.stone_details.grid.cannot_add_rows = true;
        frm.fields_dict.stone_details.grid.only_sortable();
        frm.refresh_field('stone_details');
    }
    
    // Removed duplicate alert message - auto_fill_fields_from_size_list already shows success
}

// Helper function to make fields editable again
function make_fields_editable(frm) {
    // List of fields to make editable (same as the read-only list)
    const fields_to_unlock = [
        'form_number', 'baps_project', 'project_name', 'prep_date',
        'stone_type', 'main_part', 'sub_part', 'cutting_region',
        'total_volume', 'polishing', 'dry_fitting', 'carving', 'chemicaling'
    ];
    
    fields_to_unlock.forEach(field => {
        frm.set_df_property(field, 'read_only', 0);
    });
    
    // Make child table editable again
    if (frm.fields_dict.stone_details && frm.fields_dict.stone_details.grid) {
        frm.fields_dict.stone_details.grid.cannot_add_rows = false;
        frm.refresh_field('stone_details');
    }
    
    // Clear the stone details table when form_number is cleared
    frm.clear_table("stone_details");
    frm.refresh_field("stone_details");
}

