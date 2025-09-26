// Copyright (c) 2025, Ayush Patel and contributors
// For license information, please see license.txt

frappe.ui.form.on('Size List Verification', {
    onload: function(frm) {
        // Auto-set checked_by to current user on form load
        if (!frm.doc.checked_by) {
            frm.set_value('checked_by', frappe.session.user);
        }
    },
    
    refresh: function(frm) {
        // Auto-set checked_by to current user if not set
        if (!frm.doc.checked_by) {
            frm.set_value('checked_by', frappe.session.user);
        }
        
        // Make sure the checked_by field is visible and set
        frm.set_df_property('checked_by', 'hidden', 0);
        frm.set_df_property('checked_by', 'read_only', 1);
    },
    
    before_save: function(frm) {
        // Ensure checked_by is always set before saving
        if (!frm.doc.checked_by) {
            frm.set_value('checked_by', frappe.session.user);
        }
        
        // Add custom CSS for verification status
        if (!$('#verification-styles').length) {
            $('head').append(`
                <style id="verification-styles">
                    .verification-verified {
                        background-color: #d4edda !important;
                        border-left: 4px solid #28a745 !important;
                    }
                    .verification-incorrect {
                        background-color: #f8d7da !important;
                        border-left: 4px solid #dc3545 !important;
                    }
                    .grid-row .verification-verified .grid-static-col {
                        background-color: #d4edda !important;
                    }
                    .grid-row .verification-incorrect .grid-static-col {
                        background-color: #f8d7da !important;
                    }
                    
                    /* Styles for permanently locked verified fields */
                    .verified-field-locked {
                        opacity: 0.6 !important;
                        cursor: not-allowed !important;
                        position: relative;
                    }
                    .verified-field-locked::after {
                        content: "🔒";
                        position: absolute;
                        top: 2px;
                        right: 2px;
                        font-size: 10px;
                        color: #28a745;
                    }
                    .verified-field-locked input[disabled] {
                        background-color: #e9ecef !important;
                        border-color: #28a745 !important;
                    }
                </style>
            `);
        }
        
        // Make specific fields read-only (keep form_number editable)
        make_specific_fields_read_only(frm);
        
        // Disable adding new rows to child table
        frm.set_df_property('stone_details', 'cannot_add_rows', 1);
        frm.set_df_property('stone_details', 'cannot_delete_rows', 1);
        
        // Make child table fields read-only except verified and incorrect checkboxes
        make_child_table_fields_read_only(frm);
        
        // Add verification summary if form has data
        // if (frm.doc.stone_details && frm.doc.stone_details.length > 0) {
        //     frm.add_custom_button(__('Verification Summary'), function() {
        //         show_verification_summary(frm);
        //     });
        // }
        
        // Add help text for users
        if (!frm.doc.form_number && !frm.doc.stone_details?.length) {
            frm.dashboard.add_comment(__('📝 Enter a Size List form number to load stone details for verification. Only form_number and verification checkboxes are editable.'), 'blue', true);
        }
        
        // CRITICAL: Initialize verification locks for verified stones
        initialize_verification_locks(frm);
    
    },
    
    form_number: function(frm) {
        if (!frm.doc.form_number) return;

        // Show loading indicator
        frappe.show_alert({
            message: __('Searching for Size List with Form Number: {0}...', [frm.doc.form_number]),
            indicator: 'blue'
        });

        // Use custom method to fetch Size List with elevated permissions
        frappe.call({
            method: "baps.baps.doctype.size_list_verification.size_list_verification.get_size_list_with_details",
            args: {
                size_list_name: frm.doc.form_number
            },
            callback: function(r) {
                if (r && r.message && r.message.success) {
                    auto_fill_from_size_list(frm, r.message.data);
                } else {
                    // If not found by name, search by form_number field using custom method
                    frappe.call({
                        method: "baps.baps.doctype.size_list_verification.size_list_verification.search_size_list_by_form_number",
                        args: {
                            form_number: frm.doc.form_number
                        },
                        callback: function(r2) {
                            if (r2 && r2.message && r2.message.success) {
                                auto_fill_from_size_list(frm, r2.message.data);
                            } else {
                                frappe.msgprint({
                                    title: __('Not Found'),
                                    message: __('No Size List found with Form Number: {0}', [frm.doc.form_number]),
                                    indicator: 'red'
                                });
                            }
                        }
                    });
                }
            }
        });
    }

});

// Helper function to auto-fill fields & lock them
function auto_fill_from_size_list(frm, size_list) {

    // Map main fields (read-only)
    const field_map = {
        'prep_date': 'prep_date',
        'material_type': 'stone_type',
        'baps_project': 'baps_project',
        'project_name': 'project_name',
        'main_part': 'main_part',
        'sub_part': 'sub_part',
        'total_volume_cft': 'total_volume',
        'cutting_region': 'cutting_region',
        'polishing_required': 'polishing',
        'dry_fitting_required': 'dry_fitting',
        'carving_required': 'carving',  // Fixed: was 'client_inspection'
        'chemical_required': 'chemical',  // Fixed: was 'chemicaling'
        'approved_date': 'approved_date',
        'checked_by': 'checked_by'
    };

    // Fill fields (but don't make them read-only here, use refresh function instead)
    $.each(field_map, function(target, source) {
        if (size_list[source] !== undefined) {
            frm.set_value(target, size_list[source]);
        }
    });

    // Populate child table: stone_details with verification fields
    if (size_list.stone_details && size_list.stone_details.length > 0) {
        frm.clear_table('stone_details');
        
        size_list.stone_details.forEach(function(item, index) {
            let row = frm.add_child('stone_details');
            
            // Map all Size List Detail fields to Verification Details
            row.stone_name = item.stone_name;
            row.stone_code = item.stone_code;
            row.range = item.range;
            row.l1 = item.l1;
            row.l2 = item.l2;
            row.b1 = item.b1;
            row.b2 = item.b2;
            row.h1 = item.h1;
            row.h2 = item.h2;
            row.volume = item.volume;
            
            // Fields will be made read-only by the refresh function
        });
        
        frm.refresh_field('stone_details');
        
        // Disable adding/deleting rows in child table
        frm.set_df_property('stone_details', 'cannot_add_rows', 1);
        frm.set_df_property('stone_details', 'cannot_delete_rows', 1);
        
        // Apply read-only settings after data is loaded
        make_specific_fields_read_only(frm);
        make_child_table_fields_read_only(frm);
        
        frappe.show_alert({
            message: __('✅ Size List data loaded successfully! {0} stone details imported for verification.', [size_list.stone_details.length]),
            indicator: 'green'
        });
        
        // Show user instructions
        frappe.msgprint({
            title: __('Verification Ready'),
            message: __('All stone details from Size List <b>{0}</b> have been loaded.<br><br>Please review each stone entry and click:<br>• <b>Verified</b> if the data matches your manual form<br>• <b>Incorrect</b> if there are discrepancies', [size_list.name]),
            indicator: 'blue'
        });
    } else {
        frappe.show_alert({
            message: __('⚠️ Size List found but no stone details available to verify.'),
            indicator: 'orange'
        });
    }

    // Store reference to original size list for verification
    frm._original_size_list = size_list.name;
    
    frappe.show_alert({
        message: __('Size List {0} loaded for verification', [size_list.name]),
        indicator: 'green'
    });
}

// Function to make specific main form fields read-only (keep form_number editable)
function make_specific_fields_read_only(frm) {
    // List of main form fields that should be read-only (excluding form_number)
    const read_only_fields = [
        'prep_date', 'material_type', 'baps_project', 'project_name', 
        'main_part', 'sub_part', 'total_volume_cft', 'cutting_region',
        'polishing_required', 'dry_fitting_required', 'carving_required', 
        'chemical_required', 'approved_date', 'checked_by', 'data_tilw'
    ];
    
    // Make each field read-only
    read_only_fields.forEach(function(field) {
        frm.set_df_property(field, 'read_only', 1);
    });
    
    // Keep form_number editable always
    frm.set_df_property('form_number', 'read_only', 0);
}

// Function to make child table fields read-only except verified and incorrect checkboxes
function make_child_table_fields_read_only(frm) {
    if (!frm.doc.stone_details) return;
    
    // Fields in child table that should be read-only
    const child_read_only_fields = [
        'stone_name', 'stone_code', 'range', 'l1', 'l2', 'b1', 'b2', 'h1', 'h2', 'volume'
    ];
    
    // Make child table fields read-only except verified and incorrect
    child_read_only_fields.forEach(function(field) {
        frm.set_df_property('stone_details', field, 'read_only', 1);
    });
    
    // Ensure verified and incorrect checkboxes remain editable
    frm.set_df_property('stone_details', 'verified', 'read_only', 0);
    frm.set_df_property('stone_details', 'incorrect', 'read_only', 0);
}

// Handle verification button clicks in child table
frappe.ui.form.on('Size List Verification Details', {
    // Ensure editable fields remain editable when table is refreshed
    stone_details_add: function(frm, cdt, cdn) {
        make_child_table_fields_read_only(frm);
    },
    
    incorrect: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        
        // CRITICAL: Cannot mark verified stones as incorrect!
        if (row.verified && row.__verified_locked) {
            frappe.show_alert({
                message: __('❌ Cannot mark verified stone as incorrect! Verified stones are permanently locked.'),
                indicator: 'red'
            });
            // Reset incorrect to 0
            frappe.model.set_value(cdt, cdn, 'incorrect', 0);
            return false;
        }
        
        // If incorrect is checked, uncheck verified (only for non-locked stones)
        if (row.incorrect) {
            if (!row.__verified_locked) {
                frappe.model.set_value(cdt, cdn, 'verified', 0);
            }
            
            frappe.show_alert({
                message: __('Stone {0} marked as incorrect ❌ - needs correction in Size List', [row.stone_name || row.stone_code]),
                indicator: 'orange'
            });
            
            // Add visual feedback (red highlight)
            setTimeout(() => {
                let row_element = $(`[data-name="${cdn}"]`);
                row_element.addClass('verification-incorrect');
                row_element.removeClass('verification-verified');
            }, 100);
            
            // Notify Size List immediately when stone is marked as incorrect
            notify_size_list_verification_change(frm);
            
        } else {
            // Remove incorrect highlighting when unchecked
            setTimeout(() => {
                let row_element = $(`[data-name="${cdn}"]`);
                row_element.removeClass('verification-incorrect');
            }, 100);
            
            // Also notify when incorrect is unchecked
            notify_size_list_verification_change(frm);
        }
    },
    
    verified: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        
        // CRITICAL: Once verified, it cannot be unmarked!
        if (!row.verified && row.__verified_locked) {
            frappe.show_alert({
                message: __('❌ This stone is permanently verified and cannot be changed!'),
                indicator: 'red'
            });
            // Restore verified state
            frappe.model.set_value(cdt, cdn, 'verified', 1);
            return false;
        }
        
        // If verified is checked, uncheck incorrect and lock this stone permanently
        if (row.verified) {
            frappe.model.set_value(cdt, cdn, 'incorrect', 0);
            
            // Mark this stone as permanently verified
            row.__verified_locked = true;
            
            // Show confirmation that stone is now permanently verified
            frappe.show_alert({
                message: __('🔒 Stone {0} is now PERMANENTLY VERIFIED and cannot be changed', [row.stone_name || row.stone_code]),
                indicator: 'green'
            });
            
            // Make the verified checkbox read-only by disabling it
            setTimeout(() => {
                let row_element = $(`[data-name="${cdn}"]`);
                row_element.addClass('verification-verified');
                row_element.removeClass('verification-incorrect');
                
                // Disable the verified checkbox to prevent unchecking
                row_element.find('input[data-fieldname="verified"]').prop('disabled', true);
                row_element.find('input[data-fieldname="verified"]').parent().addClass('verified-field-locked');
            }, 100);
        }
        
        // Notify Size List immediately when stone is marked as verified
        notify_size_list_verification_change(frm);
    }
});

// Show verification summary function
// function show_verification_summary(frm) {
//     let total_stones = frm.doc.stone_details ? frm.doc.stone_details.length : 0;
//     let verified_count = 0;
//     let incorrect_count = 0;
//     let pending_count = 0;
    
//     if (frm.doc.stone_details) {
//         frm.doc.stone_details.forEach(function(row) {
//             if (row.verified) verified_count++;
//             else if (row.issue_notes) incorrect_count++;
//             else pending_count++;
//         });
//     }
    
//     let summary_html = `
//         <div class="verification-summary">
//             <h4>📊 Verification Progress</h4>
//             <div class="row">
//                 <div class="col-sm-3">
//                     <div class="alert alert-info">
//                         <strong>${total_stones}</strong><br>Total Stones
//                     </div>
//                 </div>
//                 <div class="col-sm-3">
//                     <div class="alert alert-success">
//                         <strong>${verified_count}</strong><br>✅ Verified
//                     </div>
//                 </div>
//                 <div class="col-sm-3">
//                     <div class="alert alert-danger">
//                         <strong>${incorrect_count}</strong><br>❌ Incorrect
//                     </div>
//                 </div>
//                 <div class="col-sm-3">
//                     <div class="alert alert-warning">
//                         <strong>${pending_count}</strong><br>⏳ Pending
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `;
    
//     frappe.msgprint({
//         title: __('Verification Summary'),
//         message: summary_html,
//         indicator: total_stones === verified_count ? 'green' : 'blue'
//     });
// }

// Function to notify Size List about verification changes
function notify_size_list_verification_change(frm) {
    if (!frm.doc.form_number) return;
    
    // Debounce the notification to avoid too many calls
    if (frm._notification_timeout) {
        clearTimeout(frm._notification_timeout);
    }
    
    frm._notification_timeout = setTimeout(() => {
        // Save the form first to trigger on_update in Python
        frm.save().then(() => {
            frappe.show_alert({
                message: __('Size List verification status updated automatically'),
                indicator: 'green'
            });
        }).catch((error) => {
            console.log('Error saving verification form:', error);
            
            // Fallback: call the method directly if save fails
            frappe.call({
                method: "baps.baps.doctype.size_list_verification.size_list_verification.update_size_list_verification_status",
                args: {
                    form_number: frm.doc.form_number,
                    verification_details: frm.doc.stone_details || []
                },
                callback: function(r) {
                    if (r.message && r.message.success) {
                        frappe.show_alert({
                            message: __('Size List updated: {0} stones status changed', [r.message.updated_count]),
                            indicator: 'blue'
                        });
                    } else {
                        console.log('Failed to update Size List verification status:', r.message);
                    }
                }
            });
        });
    }, 1500); // Wait 1.5 seconds before sending notification
}

// CRITICAL: Initialize verification locks for stones that are already verified
function initialize_verification_locks(frm) {
    if (!frm.doc.stone_details || !frm.doc.stone_details.length) return;
    
    console.log('🔒 Initializing verification locks...');
    
    setTimeout(() => {
        frm.doc.stone_details.forEach((stone, index) => {
            if (stone.verified) {
                // Mark as permanently verified
                stone.__verified_locked = true;
                
                console.log(`🔒 Stone ${stone.stone_name} is permanently verified`);
                
                // Find the row element and disable verified checkbox
                let row_element = $(`.grid-row[data-idx="${index}"]`);
                if (row_element.length) {
                    row_element.addClass('verification-verified');
                    
                    // Disable the verified checkbox
                    row_element.find('input[data-fieldname="verified"]').prop('disabled', true);
                    row_element.find('input[data-fieldname="verified"]').parent().addClass('verified-field-locked');
                    
                    // Also disable incorrect checkbox for verified stones
                    row_element.find('input[data-fieldname="incorrect"]').prop('disabled', true);
                    row_element.find('input[data-fieldname="incorrect"]').parent().addClass('verified-field-locked');
                }
            }
        });
        
        frappe.show_alert({
            message: __('🔒 Verified stones are permanently locked'),
            indicator: 'blue'
        });
    }, 800);
}