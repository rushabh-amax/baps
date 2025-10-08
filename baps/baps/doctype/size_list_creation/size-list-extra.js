// Copyright (c) 2025, Ayush Patel and contributors
// For license information, please see license.txt

frappe.ui.form.on("Size List Creation", {
    refresh: function(frm) {
        // Add button for Project Manager to load verified Size Lists
        const is_project_manager = frappe.user_roles.includes('Size List Project Manager');
        
        if (is_project_manager && !frm.is_new()) {
            // Add button to load from verified Size List
            frm.add_custom_button(__('Load from Verified Size List'), function() {
                show_verified_size_lists_dialog(frm);
            }, __('Get Stones'));
        }
        
        // Disable "Add Row" button for Project Manager in child table
        // Project Manager can only load stones from verified Size Lists, not add manually
        if (is_project_manager) {
            frm.fields_dict.stone_details.grid.cannot_add_rows = true;
            frm.refresh_field('stone_details');
        }
        
        // Hide Range column in child table
        hide_range_column(frm);
    },
    
    onload: function(frm) {
        // Hide Range column on form load
        hide_range_column(frm);
    },
    
    setup: function(frm) {
        // Set filter for form_number to show all Size Lists (no restrictions)
        frm.set_query('form_number', function() {
            return {
                // No filters - show all Size Lists
            };
        });
    },
    
    form_number: function(frm) {
        // When a Size List is selected, auto-fill all fields and load stones
        console.log('Form Number changed to:', frm.doc.form_number);
        
        if (frm.doc.form_number) {
            // First, auto-fill all header and footer fields (this will show its own success message)
            auto_fill_fields_from_size_list(frm, frm.doc.form_number);
            
            // Make all fields read-only except status (this will show its own message)
            make_fields_read_only(frm);
            
            // Ask user if they want to load stones (without showing extra alerts)
            frappe.confirm(
                __('Do you want to load stones from this Size List?'),
                function() {
                    // Yes - load stones (this will show its own success message)
                    load_stones_from_size_list(frm, frm.doc.form_number);
                }
                // Remove the extra alert message for "No" option
            );
        } else {
            // If form_number is cleared, make fields editable again
            make_fields_editable(frm);
        }
    }
});

function show_verified_size_lists_dialog(frm) {
    // Get all verified Size Lists
    frappe.call({
        method: 'baps.baps.doctype.size_list_creation.size_list_creation.get_published_size_lists_for_creation',
        callback: function(r) {
            if (r.message && r.message.success) {
                const verified_lists = r.message.data || [];
                
                if (verified_lists.length === 0) {
                    frappe.msgprint({
                        title: __('No Verified Size Lists'),
                        message: __('No verified Size Lists found. Please verify Size Lists first.'),
                        indicator: 'orange'
                    });
                    return;
                }
                
                // Create dialog to select Size List
                const dialog = new frappe.ui.Dialog({
                    title: __('Select Verified Size List'),
                    fields: [
                        {
                            label: __('Verified Size Lists'),
                            fieldname: 'size_list',
                            fieldtype: 'Select',
                            options: verified_lists.map(sl => sl.name),
                            reqd: 1,
                            onchange: function() {
                                const selected_name = dialog.get_value('size_list');
                                const selected_list = verified_lists.find(sl => sl.name === selected_name);
                                
                                if (selected_list) {
                                    dialog.set_df_property('info', 'options', 
                                        `<div class="text-muted">
                                            <p><strong>Form Number:</strong> ${selected_list.form_number || 'N/A'}</p>
                                            <p><strong>Project:</strong> ${selected_list.project_name || 'N/A'}</p>
                                            <p><strong>Main Part:</strong> ${selected_list.main_part || 'N/A'}</p>
                                            <p><strong>Sub Part:</strong> ${selected_list.sub_part || 'N/A'}</p>
                                            <p><strong>Stone Type:</strong> ${selected_list.stone_type || 'N/A'}</p>
                                            <p><strong>Total Volume:</strong> ${selected_list.total_volume || 0} CFT³</p>
                                        </div>`
                                    );
                                }
                            }
                        },
                        {
                            fieldname: 'info',
                            fieldtype: 'HTML',
                            options: '<div class="text-muted">Select a Size List to view details</div>'
                        }
                    ],
                    primary_action_label: __('Load Stones'),
                    primary_action: function(values) {
                        load_stones_from_size_list(frm, values.size_list);
                        dialog.hide();
                    }
                });
                
                dialog.show();
                
            } else {
                frappe.msgprint({
                    title: __('Error'),
                    message: r.message ? r.message.message : __('Failed to get verified Size Lists'),
                    indicator: 'red'
                });
            }
        }
    });
}

function load_stones_from_size_list(frm, size_list_name) {
    frappe.call({
        method: 'baps.baps.doctype.size_list_creation.size_list_creation.load_stones_from_verified_size_list',
        args: {
            size_list_name: size_list_name
        },
        callback: function(r) {
            if (r.message && r.message.success) {
                const data = r.message.data;
                
                // Clear existing stones
                frm.clear_table('stone_details');
                
                // Add stones from verified Size List
                if (data.stone_details && data.stone_details.length > 0) {
                    data.stone_details.forEach(stone => {
                        let row = frm.add_child('stone_details');
                        row.stone_name = stone.stone_name;
                        row.stone_code = stone.stone_code;
                        row.l1 = stone.l1;
                        row.l2 = stone.l2;
                        row.b1 = stone.b1;
                        row.b2 = stone.b2;
                        row.h1 = stone.h1;
                        row.h2 = stone.h2;
                        row.volume = stone.volume;
                    });
                    
                    frm.refresh_field('stone_details');
                    
                    // Copy header information
                    frm.set_value('form_number', data.form_number);
                    frm.set_value('baps_project', data.baps_project);
                    
                    // Show only one simple success message
                    frappe.show_alert({
                        message: __('Loaded {0} stones from Size List {1}', [data.total_stones, size_list_name]),
                        indicator: 'green'
                    }, 5);
                } else {
                    frappe.msgprint({
                        title: __('No Stones Found'),
                        message: __('No stone details found in the selected Size List.'),
                        indicator: 'orange'
                    });
                }
            } else {
                frappe.msgprint({
                    title: __('Error'),
                    message: r.message ? r.message.message : __('Failed to load stones'),
                    indicator: 'red'
                });
            }
        }
    });
}

// Keep the old commented code below for reference
// frappe.ui.form.on('Size List Creation', {
//     refresh: function(frm) {
//         // Hide the Add Row button for stone_details table
//         frm.fields_dict.stone_details.grid.custom_buttons = {};
//         frm.fields_dict.stone_details.grid.add_custom_button = function() {};
        
//         // Hide the default add row button
//         setTimeout(() => {
//             frm.fields_dict.stone_details.grid.wrapper.find('.grid-add-row, .btn-open-row').hide();
//             frm.fields_dict.stone_details.grid.wrapper.find('[data-fieldname="stone_details"] .grid-footer .btn').hide();
//         }, 100);
        
//         // Remove any existing custom messages
//         frm.fields_dict.stone_details.grid.wrapper.find('.grid-footer .text-muted').remove();
        
//         // Make stone details table read-only
//         frm.fields_dict.stone_details.grid.static_rows = true;
//         frm.fields_dict.stone_details.grid.only_sortable();
        
//         // Disable editing in stone details
//         frm.fields_dict.stone_details.grid.wrapper.find('input, select, textarea').prop('disabled', true);
//         frm.fields_dict.stone_details.grid.wrapper.find('.grid-row').css({
//             'background-color': '#f8f9fa',
//             'opacity': '0.9'
//         });
//     },
    
//     form_number: function(frm) {
//         if (!frm.doc.form_number) return;

//         // Check if form_number is a Size List Generation document
//         if (frm.doc.form_number && frm.doc.form_number.startsWith('SZGEN-')) {
//             // Get published stones from Size List Generation
//             frappe.call({
//                 method: "baps.baps.doctype.size_list_creation.size_list_creation.get_published_stones_from_generation",
//                 args: { generation_name: frm.doc.form_number },
//                 callback: function(r) {
//                     if (r.message && r.message.success) {
//                         frm.clear_table("stone_details");
                        
//                         if (r.message.data && r.message.data.stone_details) {
//                             r.message.data.stone_details.forEach(item => {
//                                 let row = frm.add_child("stone_details");
//                                 Object.assign(row, item);
//                             });
//                             frm.refresh_field("stone_details");

//                             frappe.msgprint({
//                                 title: "Published Stones Loaded",
//                                 message: `✅ Loaded ${r.message.generation_stats.published_stones} published stones from Size List Generation<br>📊 ${r.message.generation_stats.unpublished_stones} stones not yet published`,
//                                 indicator: "green"
//                             });
//                         } else {
//                             frappe.msgprint({
//                                 title: "No Published Stones",
//                                 message: "No published stones found in this Size List Generation document. Please publish stones first.",
//                                 indicator: "orange"
//                             });
//                         }
//                     } else {
//                         frappe.msgprint({
//                             title: "Error",
//                             message: r.message ? r.message.message : "Failed to load published stones",
//                             indicator: "red"
//                         });
//                     }
//                 }
//             });
//         } else {
//             // Fallback to original Size List method for backward compatibility
//             frappe.call({
//                 method: "baps.baps.doctype.size_list_creation.size_list_creation.create_size_list_items_from_range",
//                 args: { form_number: frm.doc.form_number },
//                 callback: function(r) {
//                     if (r.message) {
//                         frm.clear_table("stone_details");
//                         r.message.items.forEach(item => {
//                             let row = frm.add_child("stone_details");
//                             Object.assign(row, item);
//                         });
//                         frm.refresh_field("stone_details");

//                         frappe.msgprint({
//                             title: "Range Processing Complete",
//                             message: `✅ Created ${r.message.created_count} items<br>⚠️ Skipped ${r.message.skipped_count} duplicates`,
//                             indicator: r.message.skipped_count > 0 ? "orange" : "green"
//                         });
//                     }
//                 }
//             });
//         }
//     }
// });



frappe.ui.form.on('Size List Creation', {
    setup: function(frm) {
        // 🔒 Only allow Published Size Lists in link field
        frm.set_query("form_number", function() {
            return {
                filters: {
                    workflow_state: "Published"
                }
            };
        });
    }, 
    

    // refresh: function(frm) {
    //     // Hide the Add Row button for stone_details table
    //     frm.fields_dict.stone_details.grid.custom_buttons = {};
    //     frm.fields_dict.stone_details.grid.add_custom_button = function() {};

    //     // Hide the default add row button
    //     setTimeout(() => {
    //         frm.fields_dict.stone_details.grid.wrapper.find('.grid-add-row, .btn-open-row').hide();
    //         frm.fields_dict.stone_details.grid.wrapper.find('[data-fieldname="stone_details"] .grid-footer .btn').hide();
    //     }, 100);

    //     // Remove any existing custom messages
    //     frm.fields_dict.stone_details.grid.wrapper.find('.grid-footer .text-muted').remove();

    //     // Make stone details table read-only
    //     frm.fields_dict.stone_details.grid.static_rows = true;
    //     frm.fields_dict.stone_details.grid.only_sortable();

    //     // Disable editing in stone details
    //     frm.fields_dict.stone_details.grid.wrapper.find('input, select, textarea').prop('disabled', true);
    //     frm.fields_dict.stone_details.grid.wrapper.find('.grid-row').css({
    //         'background-color': '#f8f9fa',
    //         'opacity': '0.9'
    //     });
    // },

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
                                message: `✅ Loaded ${r.message.generation_stats.published_stones} published stones from Size List.<br>📊 ${r.message.generation_stats.unpublished_stones} stones not yet published`,
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

                        // frappe.msgprint({
                        //     title: "Range Processing Complete",
                        //     message: `✅ Created ${r.message.created_count} items<br>⚠️ Skipped ${r.message.skipped_count} duplicates`,
                        //     indicator: r.message.skipped_count > 0 ? "orange" : "green"
                        // });
                    }
                }
            });
        }
    }
});

// // Helper function to hide Range column in child table
// function hide_range_column(frm) {
//     setTimeout(function() {
//         if (frm.fields_dict.stone_details && frm.fields_dict.stone_details.grid) {
//             // Hide Range column in grid view
//             frm.fields_dict.stone_details.grid.set_column_disp('range', false);
//             frm.refresh_field('stone_details');
//         }
//     }, 500);
// }

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

// // Helper function to make fields editable again
// function make_fields_editable(frm) {
//     // List of fields to make editable
//     const fields_to_unlock = [
//         'form_number', 'baps_project', 'project_name', 'prep_date',
//         'stone_type', 'main_part', 'sub_part', 'cutting_region',
//         'total_volume', 'polishing', 'dry_fitting', 'carving', 'chemicaling'
//     ];
    
//     fields_to_unlock.forEach(field => {
//         frm.set_df_property(field, 'read_only', 0);
//     });
    
//     // Make child table editable (for Project Manager if applicable)
//     const is_project_manager = frappe.user_roles.includes('Size List Project Manager');
//     if (frm.fields_dict.stone_details && frm.fields_dict.stone_details.grid && !is_project_manager) {
//         frm.fields_dict.stone_details.grid.cannot_add_rows = false;
//         frm.refresh_field('stone_details');
//     }
// }
