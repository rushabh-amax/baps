// Size List - Basic Functionality
// Essential business logic only, no workflow

// Helper function to get current workflow state
function get_workflow_state(frm) {
    // Check both workflow_state (Frappe workflow) and workflow_status (custom field)
    return frm.doc.workflow_state || get_workflow_state(frm) || frm.doc.__wf || '';
}

frappe.ui.form.on('Size List', {
    refresh: function(frm) {
        const workflow_state = get_workflow_state(frm);
        
        // If status is "Verified", lock fields and show Project Manager buttons
        if (workflow_state === 'Verified') {
            lock_all_fields_after_verification(frm);
            
            // Add custom button for Project Manager to generate Range Records
            const is_project_manager = frappe.user_roles.includes('Size List Project Manager');
            if (is_project_manager && !frm.is_new()) {
                frm.add_custom_button(__('Generate Range Records'), function() {
                    frappe.call({
                        method: 'baps.baps.doctype.size_list.size_list.generate_range_records',
                        args: {
                            size_list: frm.doc.name
                        },
                        callback: function(r) {
                            if (r.message) {
                                frappe.msgprint({
                                    title: __('Success'),
                                    message: __('Range Records generated successfully: {0}', [r.message.join(', ')]),
                                    indicator: 'green'
                                });
                                frm.reload_doc();
                            }
                        }
                    });
                }, __('Actions'));
            }
            
            return; // Exit early, no other setup needed
        }
        
        // Setup field permissions based on verification status
        setup_field_permissions(frm);
        
        // Setup child table verification columns
        hide_child_verification_columns(frm);
        
        // Control child table "Add Row" button visibility
        control_child_table_add_button(frm);
        
        // Lock header fields if child rows exist
        lock_header_fields_if_children_exist(frm);
        
        // Setup child table row permissions based on verification
        setup_child_row_verification_permissions(frm);
        
        // Set default values for new forms
        if (frm.is_new()) {
            // Set Polishing and Carving to checked by default
            if (!frm.doc.polishing) {
                frm.set_value('polishing', 1);
            }
            if (!frm.doc.carving) {
                frm.set_value('carving', 1);
            }
            
            // Auto-fill Prepared By with current logged-in user
            if (!frm.doc.prepared_by) {
                frm.set_value('prepared_by', frappe.session.user);
            }
        }
        
        // Add comprehensive duplicate check button
        if (frm.doc.baps_project) {
            frm.add_custom_button(__('Check All Duplicates'), function() {
                run_comprehensive_duplicate_check(frm);
            }, __('Tools'));
        }
    },
    
    // Event handlers for verification checkboxes - dynamically update field permissions
    baps_project_verified: function(frm) {
        update_field_by_verification(frm, 'baps_project', 'baps_project_verified');
    },
    
    stone_type_verified: function(frm) {
        update_field_by_verification(frm, 'stone_type', 'stone_type_verified');
    },
    
    main_part_verified: function(frm) {
        update_field_by_verification(frm, 'main_part', 'main_part_verified');
    },
    
    sub_part_verified: function(frm) {
        update_field_by_verification(frm, 'sub_part', 'sub_part_verified');
    },
    
    cutting_region_verified: function(frm) {
        update_field_by_verification(frm, 'cutting_region', 'cutting_region_verified');
    },
    
    polishing_verified: function(frm) {
        update_field_by_verification(frm, 'polishing', 'polishing_verified');
    },
    
    validate: function(frm) {
        // Validate only when moving to "Verified" status from "Under Verification"
        // Allow "Reject" action (Under Rechange/Under Recheck) even if fields are not verified
        const current_state = get_workflow_state(frm);
        const new_state = frm.doc.workflow_state;
        const is_data_checker = frappe.user_roles.includes('Size List Data Checker');
        
        // Check if trying to move to "Verified" status
        if (is_data_checker && current_state === 'Under Verification' && new_state === 'Verified') {
            const all_verified = validate_all_fields_verified(frm);
            if (!all_verified) {
                frappe.validated = false;
                frappe.throw('All fields must be verified (checkboxes checked) before approving to Verified status.');
                return false;
            }
        }
    },
    
    before_workflow_action: function(frm) {
        // Get the current workflow state and user role
        const current_state = get_workflow_state(frm);
        const is_data_checker = frappe.user_roles.includes('Size List Data Checker');
        
        // Only validate when trying to verify from "Under Verification" status
        if (current_state === 'Under Verification' && is_data_checker) {
            // We need to determine if this is a "Verify" or "Reject" action
            // Since we can't easily detect the action here, we'll rely on server-side validation
            // But let's add a basic check for verification status
            console.log("Workflow action triggered from Under Verification");
        }
        
        return true;  // Allow the action and rely on server-side validation
    },
    
    onload: function(frm) {
        // Setup field permissions based on verification status
        setup_field_permissions(frm);
        
        // Setup child table verification columns
        hide_child_verification_columns(frm);
        
        // Control child table "Add Row" button visibility
        control_child_table_add_button(frm);
        
        // Lock header fields if child rows exist
        lock_header_fields_if_children_exist(frm);
        
        // Override workflow button clicks to validate before "Verify" action
        setup_workflow_validation(frm);
        
        // Set default values for new forms
        if (frm.is_new()) {
            // Set Polishing and Carving to checked by default
            if (!frm.doc.polishing) {
                frm.set_value('polishing', 1);
            }
            if (!frm.doc.carving) {
                frm.set_value('carving', 1);
            }
            
            // Auto-fill Prepared By with current logged-in user
            if (!frm.doc.prepared_by) {
                frm.set_value('prepared_by', frappe.session.user);
            }
        }
    },
    
    // Verification field events - control field editability
    form_number_verified: function(frm) {
        control_field_editability(frm, 'form_number', frm.doc.form_number_verified);
    },
    
    baps_project_verified: function(frm) {
        control_field_editability(frm, 'baps_project', frm.doc.baps_project_verified);
    },
    
    prep_date_verified: function(frm) {
        control_field_editability(frm, 'prep_date', frm.doc.prep_date_verified);
    },
    
    stone_type_verified: function(frm) {
        control_field_editability(frm, 'stone_type', frm.doc.stone_type_verified);
    },
    
    main_part_verified: function(frm) {
        control_field_editability(frm, 'main_part', frm.doc.main_part_verified);
    },
    
    sub_part_verified: function(frm) {
        control_field_editability(frm, 'sub_part', frm.doc.sub_part_verified);
    },
    
    cutting_region_verified: function(frm) {
        control_field_editability(frm, 'cutting_region', frm.doc.cutting_region_verified);
    },
    
    polishing_verified: function(frm) {
        control_field_editability(frm, 'polishing', frm.doc.polishing_verified);
    },
    
    // BAPS Project handler
    baps_project: function(frm) {
        if (frm.doc.baps_project) {
            load_project_flags(frm);
            // Check for duplicates when project changes
            check_for_duplicates(frm);
        } else {
            frm._project_flags = { chemical: 0, dry_fitting: 0, polishing: 1, carving: 1 };
            // Clear the process flags when project is cleared (except polishing and carving which stay checked)
            frm.set_value('chemical', 0);
            frm.set_value('dry_fitting', 0);
            frm.set_value('polishing', 1);  // Keep checked by default
            frm.set_value('carving', 1);    // Keep checked by default
            set_child_grid_readonly(frm);
            // Clear any duplicate warnings
            frm.dashboard.clear_comment();
        }
    },
    
    // Main Part and Sub Part handlers
    main_part: function(frm) {
        if (!frm.doc.main_part) frm.set_value('sub_part', '');
        
        frm.set_query("sub_part", function() {
            if (!frm.doc.main_part) {
                frappe.throw("Please select Main Part before choosing a Sub Part.");
            }
            return {
                filters: {
                    main_part: frm.doc.main_part
                }
            };
        });

        // clear sub_part if mismatch
        if (frm.doc.sub_part) {
            frappe.db.get_value("Sub Part", frm.doc.sub_part, "main_part", function(r) {
                if (r && r.main_part !== frm.doc.main_part) {
                    frm.set_value("sub_part", null);
                }
            });
        }
        
        // Check for duplicates when main part changes
        check_for_duplicates(frm);
    },
    
    sub_part: function(frm) {
        if (!frm.doc.sub_part) frm.set_value('main_part', '');
        // Check for duplicates when sub part changes
        check_for_duplicates(frm);
    },
    
    stone_type: function(frm) {
        // Check for duplicates when stone type changes
        check_for_duplicates(frm);
    },
    
    cutting_region: function(frm) {
        // Check for duplicates when cutting region changes
        check_for_duplicates(frm);
    },
    
    // Stone details add handler
    stone_details_add: function(frm, cdt, cdn) {
        // Note: chemical, dry_fitting, polishing are parent-level fields
        // They are set on the Size List form, not on individual stone rows
        
        // Lock header fields after first child row is added
        lock_header_fields_if_children_exist(frm);
    },
    
    // Validation
    validate: function(frm) {
        if (!frm.doc.main_part && frm.doc.sub_part) {
            frappe.throw("You cannot add a Sub Part without selecting a Main Part.");
        }
    }
});

// Child table events
frappe.ui.form.on('Size List Details', {
    // Before grid row opens for editing
    before_stone_details_edit: function(frm, cdt, cdn) {
        setup_child_row_permissions(frm, cdt, cdn);
    },
    
    // Form render event to setup row-level permissions
    form_render: function(frm, cdt, cdn) {
        setup_child_row_permissions(frm, cdt, cdn);
        
        // Setup stone_name query to prevent duplicates
        setup_stone_name_query(frm, cdt, cdn);
    },
    
    // Before row is displayed - setup query
    stone_details_add: function(frm, cdt, cdn) {
        setup_stone_name_query(frm, cdt, cdn);
    },
    
    // Verification checkbox events for child table
    stone_name_verified: function(frm, cdt, cdn) {
        control_child_field_editability(frm, cdt, cdn, 'stone_name', locals[cdt][cdn].stone_name_verified);
    },
    
    stone_code_verified: function(frm, cdt, cdn) {
        control_child_field_editability(frm, cdt, cdn, 'stone_code', locals[cdt][cdn].stone_code_verified);
    },
    
    l1_verified: function(frm, cdt, cdn) {
        control_child_field_editability(frm, cdt, cdn, 'l1', locals[cdt][cdn].l1_verified);
    },
    
    l2_verified: function(frm, cdt, cdn) {
        control_child_field_editability(frm, cdt, cdn, 'l2', locals[cdt][cdn].l2_verified);
    },
    
    b1_verified: function(frm, cdt, cdn) {
        control_child_field_editability(frm, cdt, cdn, 'b1', locals[cdt][cdn].b1_verified);
    },
    
    b2_verified: function(frm, cdt, cdn) {
        control_child_field_editability(frm, cdt, cdn, 'b2', locals[cdt][cdn].b2_verified);
    },
    
    h1_verified: function(frm, cdt, cdn) {
        control_child_field_editability(frm, cdt, cdn, 'h1', locals[cdt][cdn].h1_verified);
    },
    
    h2_verified: function(frm, cdt, cdn) {
        control_child_field_editability(frm, cdt, cdn, 'h2', locals[cdt][cdn].h2_verified);
    },
    
    // Essential data field events only
    stone_name: function(frm, cdt, cdn) {
        calculate_volume(frm, cdt, cdn);
        
        // Check for duplicate stone names within the project
        check_stone_duplicates(frm, cdt, cdn);
    },
    
    stone_code: function(frm, cdt, cdn) {
        calculate_volume(frm, cdt, cdn);
    },
    
    l1: function(frm, cdt, cdn) {
        calculate_volume(frm, cdt, cdn);
    },
    
    l2: function(frm, cdt, cdn) {
        calculate_volume(frm, cdt, cdn);
    },
    
    b1: function(frm, cdt, cdn) {
        calculate_volume(frm, cdt, cdn);
    },
    
    b2: function(frm, cdt, cdn) {
        calculate_volume(frm, cdt, cdn);
    },
    
    h1: function(frm, cdt, cdn) {
        calculate_volume(frm, cdt, cdn);
    },
    
    h2: function(frm, cdt, cdn) {
        calculate_volume(frm, cdt, cdn);
    },
    
    start_stone_no: function(frm, cdt, cdn) {
        validate_number_range(frm, cdt, cdn);
        calculate_volume(frm, cdt, cdn);
    },
    
    end_stone_no: function(frm, cdt, cdn) {
        validate_number_range(frm, cdt, cdn);
        calculate_volume(frm, cdt, cdn);
    },
    
    group_of_stones: function(frm, cdt, cdn) {
        calculate_volume(frm, cdt, cdn);
    },
    
    size_list_details_remove: function(frm) {
        calculate_total_volume(frm);
    },

    // Range expansion functionality
    // range: function(frm, cdt, cdn) {
    //     let row = locals[cdt][cdn];
    //     if (!row || !row.range) return;

    //     let input = row.range.toString().trim();
    //     if (!input) return;

    //     // Parse input into list of numbers
    //     let numbers = [];
    //     let parts = input.split(',').map(s => s.trim()).filter(s => s);

    //     parts.forEach(part => {
    //         if (part.includes('-')) {
    //             let rangeParts = part.split('-').map(s => s.trim());
    //             if (rangeParts.length === 2) {
    //                 let start = parseInt(rangeParts[0], 10);
    //                 let end = parseInt(rangeParts[1], 10);
    //                 if (isNaN(start) || isNaN(end) || start > end) {
    //                     frappe.show_alert({ message: "Invalid range → " + part, indicator: "red" });
    //                     return;
    //                 }
    //                 for (let i = start; i <= end; i++) numbers.push(i);
    //             }
    //         } else {
    //             let n = parseInt(part, 10);
    //             if (!isNaN(n)) numbers.push(n);
    //         }
    //     });

    //     numbers = [...new Set(numbers)].sort((a, b) => a - b);

    //     if (numbers.length === 0) {
    //         frappe.show_alert({ message: "⚠️ No valid numbers found in range", indicator: "orange" });
    //         return;
    //     }

    //     // First number stays in current row, rest create new rows
    //     frappe.model.set_value(cdt, cdn, "stone_name", row.stone_name || numbers[0].toString());

    //     for (let i = 1; i < numbers.length; i++) {
    //         let new_row = frappe.model.add_child(frm.doc, "Size List Details", "stone_details");
    //         frappe.model.set_value(new_row.doctype, new_row.name, "stone_name", numbers[i].toString());
    //     }

    //     frm.refresh_field("stone_details");
        
    // }
});

// Essential business logic functions

function calculate_volume(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
     // Validate inches
    if ((row.l2 || 0) > 12 || (row.b2 || 0) > 12 || (row.h2 || 0) > 12) {
        frappe.msgprint(__("Inches (l2, b2, h2) must be less than 12"));
        return;
    }
    
    if (row) {
        let l = (row.l1 || 0) + (row.l2 || 0) / 12;
        let b = (row.b1 || 0) + (row.b2 || 0) / 12;
        let h = (row.h1 || 0) + (row.h2 || 0) / 12;
        
        row.volume = Math.round(l * b * h * 1000) / 1000;
        calculate_total_volume(frm);
        frm.refresh_field('stone_details');
    }
}

function calculate_total_volume(frm) {
    let total = 0;
    if (frm.doc.stone_details) {
        frm.doc.stone_details.forEach(row => {
            total += (row.volume || 0);
        });
    }
    frm.set_value('total_volume', Math.round(total * 1000) / 1000);
}

function validate_number_range(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
    if (row && row.start_stone_no && row.end_stone_no) {
        if (parseInt(row.start_stone_no) > parseInt(row.end_stone_no)) {
            frappe.msgprint("Start stone number should be less than or equal to end stone number");
            frappe.model.set_value(cdt, cdn, 'end_stone_no', '');
        }
    }
}

// Field permission control functions
function setup_field_permissions(frm) {
    // Check user roles
    const is_data_operator = frappe.user_roles.includes('Size List Data Entry Operator');
    const is_data_checker = frappe.user_roles.includes('Size List Data Checker');
    const workflow_state = get_workflow_state(frm);
    const is_under_verification = workflow_state === 'Under Verification';
    const is_under_rechange = workflow_state === 'Under Rechange';
    const is_under_recheck = workflow_state === 'Under Recheck';
    const show_verification = is_under_rechange || is_under_recheck;
    

    
    // Main form field verification mapping
    const field_verification_map = {
        'form_number': 'form_number_verified',
        'baps_project': 'baps_project_verified',
        'prep_date': 'prep_date_verified',
        'stone_type': 'stone_type_verified',
        'main_part': 'main_part_verified',
        'sub_part': 'sub_part_verified',
        'cutting_region': 'cutting_region_verified',
        'polishing': 'polishing_verified'
    };
    
    // Fields to exclude for Data Entry Checker (no verification checkbox)
    const checker_excluded_fields = ['form_number', 'prep_date'];
    
    if (is_data_checker) {
        if (is_under_verification) {
            // Under Verification: Checkboxes editable, unticked fields editable, ticked fields read-only
            Object.keys(field_verification_map).forEach(field => {
                const verification_field = field_verification_map[field];
                const is_verified = frm.doc[verification_field];
                
                if (checker_excluded_fields.includes(field)) {
                    // Hide verification checkbox for form_number and prep_date
                    frm.set_df_property(verification_field, 'hidden', 1);
                    frm.set_df_property(field, 'read_only', 1);  // Read-only
                } else {
                    // Show verification checkbox (editable)
                    frm.set_df_property(verification_field, 'hidden', 0);
                    frm.set_df_property(verification_field, 'read_only', 0);  // Checkbox editable
                    // Control field editability based on verification status
                    control_field_editability(frm, field, is_verified);
                }
            });
            
        } else {
            // Other statuses: Show verification fields with normal edit control
            Object.keys(field_verification_map).forEach(field => {
                const verification_field = field_verification_map[field];
                const is_verified = frm.doc[verification_field];
                
                if (checker_excluded_fields.includes(field)) {
                    // Hide verification checkbox for form_number and prep_date
                    frm.set_df_property(verification_field, 'hidden', 1);
                    frm.set_df_property(field, 'read_only', 0);
                    frm.set_df_property(field, 'description', '');
                } else {
                    // Show verification checkbox and apply permissions
                    frm.set_df_property(verification_field, 'hidden', 0);
                    control_field_editability(frm, field, is_verified);
                }
            });
        }
        
    } else if (is_data_operator) {
        // Data Entry Operator: Show verification only in "Under Rechange" or "Under Recheck"
        if (show_verification) {
            // Show verification fields and apply permissions
            Object.keys(field_verification_map).forEach(field => {
                const verification_field = field_verification_map[field];
                const is_verified = frm.doc[verification_field];
                
                // Show verification checkbox but ALWAYS make it read-only for operator
                frm.set_df_property(verification_field, 'hidden', 0);
                frm.set_df_property(verification_field, 'read_only', 1);  // Operator cannot change checkboxes
                
                // Control field editability based on verification status
                control_field_editability(frm, field, is_verified);
            });
            
        } else {
            // Hide verification fields for other statuses
            Object.values(field_verification_map).forEach(verification_field => {
                frm.set_df_property(verification_field, 'hidden', 1);
            });
            
            // Make all fields editable when verification is not applicable
            Object.keys(field_verification_map).forEach(field => {
                frm.set_df_property(field, 'read_only', 0);
                frm.set_df_property(field, 'description', '');
            });
            
        }
    } else {
        // For other roles, always hide verification fields
        Object.values(field_verification_map).forEach(verification_field => {
            frm.set_df_property(verification_field, 'hidden', 1);
        });
    }
}

function control_field_editability(frm, field_name, is_verified) {
    // Control field editability based on verification status
    if (is_verified) {
        // Field is verified (ticked) - make read-only
        frm.set_df_property(field_name, 'read_only', 1);
        frm.set_df_property(field_name, 'description', '');
    } else {
        // Field is not verified (not ticked) - make editable
        frm.set_df_property(field_name, 'read_only', 0);
        frm.set_df_property(field_name, 'description', '');
    }
    frm.refresh_field(field_name);
}

function setup_child_row_permissions(frm, cdt, cdn) {
    const is_data_operator = frappe.user_roles.includes('Size List Data Entry Operator');
    const is_data_checker = frappe.user_roles.includes('Size List Data Checker');
    const is_under_verification = get_workflow_state(frm) === 'Under Verification';
    const is_under_rechange = get_workflow_state(frm) === 'Under Rechange';
    const is_under_recheck = get_workflow_state(frm) === 'Under Recheck';
    const show_verification = is_under_rechange || is_under_recheck;
    
    
    // Child table field verification mapping
    const child_field_verification_map = {
        'stone_name': 'stone_name_verified',
        'stone_code': 'stone_code_verified',
        'l1': 'l1_verified',
        'l2': 'l2_verified',
        'b1': 'b1_verified',
        'b2': 'b2_verified',
        'h1': 'h1_verified',
        'h2': 'h2_verified'
    };
    
    // Get the row wrapper for direct field manipulation
    const row_wrapper = frm.fields_dict.stone_details?.grid?.grid_rows_by_docname[cdn];
    
    if (is_data_checker && is_under_verification) {
        // Data Checker in Under Verification: Make ALL data fields READ-ONLY
        
        // Use setTimeout to ensure the dialog is fully rendered
        setTimeout(() => {
            if (row_wrapper) {
                Object.keys(child_field_verification_map).forEach(field => {
                    const field_wrapper = row_wrapper.get_field(field);
                    if (field_wrapper) {
                        // Make data field read-only
                        field_wrapper.df.read_only = 1;
                        if (field_wrapper.$input) {
                            field_wrapper.$input.prop('readonly', true);
                            field_wrapper.$input.prop('disabled', true);
                            field_wrapper.$input.css('background-color', '#f5f5f5');
                            field_wrapper.$input.css('cursor', 'not-allowed');
                            //field_wrapper.$input.attr('title', 'Read-only during verification. Use checkbox to verify.');
                        }
                        // For link fields
                        if (field_wrapper.$input_wrapper) {
                            field_wrapper.$input_wrapper.find('.link-btn').hide();
                        }
                    }
                    
                    // Make verification checkbox editable
                    const verification_field = child_field_verification_map[field];
                    const verification_wrapper = row_wrapper.get_field(verification_field);
                    if (verification_wrapper) {
                        verification_wrapper.df.read_only = 0;
                        verification_wrapper.df.hidden = 0;
                    }
                });
            }
        }, 100);
        
    } else if (is_data_operator && show_verification) {
        const row = locals[cdt][cdn];
        
        // Apply permissions to each field in this row based on verification values
        Object.keys(child_field_verification_map).forEach(field => {
            const verification_field = child_field_verification_map[field];
            const is_verified = row[verification_field];
            control_child_field_editability(frm, cdt, cdn, field, is_verified);
        });
        
    } else {
        // Make all child fields editable for normal statuses
        if (row_wrapper) {
            Object.keys(child_field_verification_map).forEach(field => {
                const field_wrapper = row_wrapper.get_field(field);
                if (field_wrapper && field_wrapper.$input) {
                    field_wrapper.$input.prop('readonly', false);
                    field_wrapper.$input.css('background-color', '');
                    field_wrapper.$input.attr('title', '');
                }
            });
        }
    }
}

function control_child_field_editability(frm, cdt, cdn, field_name, is_verified) {
    // Only apply for Data Entry Operators in "Under Rechange" status
    const is_data_operator = frappe.user_roles.includes('Size List Data Entry Operator');
    const is_under_rechange = get_workflow_state(frm) === 'Under Rechange';
    
    if (is_data_operator && is_under_rechange) {
        const row_wrapper = frm.fields_dict.stone_details.grid.grid_rows_by_docname[cdn];
        
        if (row_wrapper) {
            const field_wrapper = row_wrapper.get_field(field_name);
            if (field_wrapper && field_wrapper.$input) {
                if (is_verified) {
                    // Field is verified (ticked) - make read-only
                    field_wrapper.$input.prop('readonly', true);
                    field_wrapper.$input.css('background-color', '#e9ecef');
                    field_wrapper.$input.attr('title', '✅ Verified - Read Only');
                } else {
                    // Field is not verified (not ticked) - make editable
                    field_wrapper.$input.prop('readonly', false);
                    field_wrapper.$input.css('background-color', '');
                    //field_wrapper.$input.attr('title', '⚠️ Not verified - You can edit this field');
                }
            } else {
            }
        } else {
        }
    }
}

// Load project flags from Baps Project
function load_project_flags(frm) {
    if (frm.doc.baps_project) {
        
        frappe.db.get_value('Baps Project', frm.doc.baps_project, ['chemical', 'dry_fitting', 'polishing'], function(r) {
            if (r) {
                frm._project_flags = {
                    chemical: r.chemical || 0,
                    dry_fitting: r.dry_fitting || 0,
                    polishing: r.polishing || 0,
                    carving: 0  // Carving is not in Baps Project, defaults to 0
                };
                
                
                // Set flags on the parent Size List form
                // These are parent-level fields, not child table fields
                frm.set_value('chemical', r.chemical || 0);
                frm.set_value('dry_fitting', r.dry_fitting || 0);
                // Polishing and Carving are ALWAYS checked by default (regardless of project settings)
                frm.set_value('polishing', 1);
                frm.set_value('carving', 1);
                
                set_child_grid_readonly(frm);
                
                
            } else {
                frm._project_flags = { chemical: 0, dry_fitting: 0, polishing: 0, carving: 0 };
                set_child_grid_readonly(frm);
            }
        });
    }
}

// Set child grid readonly based on project flags
function set_child_grid_readonly(frm) {
    // This function can be used to set specific fields as readonly
    // based on project configuration if needed
    
    // Currently just logging, but can be extended to make certain fields readonly
    // based on the project configuration
}

// ALWAYS hide child table verification columns
function hide_child_verification_columns(frm) {
    const is_data_operator = frappe.user_roles.includes('Size List Data Entry Operator');
    const is_data_checker = frappe.user_roles.includes('Size List Data Checker');
    const is_under_verification = get_workflow_state(frm) === 'Under Verification';
    const is_under_rechange = get_workflow_state(frm) === 'Under Rechange';
    const is_under_recheck = get_workflow_state(frm) === 'Under Recheck';
    const show_verification = is_under_rechange || is_under_recheck;
    
    const verification_fields = [
        'stone_name_verified',
        'stone_code_verified',
        'l1_verified',
        'l2_verified',
        'b1_verified',
        'b2_verified',
        'h1_verified',
        'h2_verified',
        'row_verified'
    ];
    
    const data_fields = [
        'stone_name',
        'stone_code',
        'l1',
        'l2',
        'b1',
        'b2',
        'h1',
        'h2'
    ];
    
    // Get the grid field definition
    const grid = frm.fields_dict.stone_details;
    if (grid && grid.grid) {
        if (is_data_checker) {
            if (is_under_verification) {
                // Under Verification: Show verification checkboxes, make all data fields READ-ONLY
                
                // Show verification checkboxes, hide data fields as read-only
                verification_fields.forEach(fieldname => {
                    grid.grid.update_docfield_property(fieldname, 'hidden', 0);
                    grid.grid.update_docfield_property(fieldname, 'read_only', 0);
                });
                
                // Make all data fields READ-ONLY using grid method
                data_fields.forEach(fieldname => {
                    grid.grid.update_docfield_property(fieldname, 'read_only', 1);
                });
                
                // Also set at docfield level for initial render
                verification_fields.forEach(fieldname => {
                    const field = frappe.meta.get_docfield('Size List Details', fieldname, frm.doc.name);
                    if (field) {
                        field.hidden = 0;
                        field.read_only = 0;
                    }
                });
                
                data_fields.forEach(fieldname => {
                    const field = frappe.meta.get_docfield('Size List Details', fieldname, frm.doc.name);
                    if (field) {
                        field.read_only = 1;
                    }
                });
                
                
            } else {
                // Other statuses: Show all verification columns with normal behavior
                verification_fields.forEach(fieldname => {
                    const field = frappe.meta.get_docfield('Size List Details', fieldname, frm.doc.name);
                    if (field) {
                        field.hidden = 0;  // Show
                        field.read_only = 0;  // Editable
                    }
                });
            }
            
        } else if (is_data_operator && show_verification) {
            // Data Operator in correction mode: Show verification columns but make verified fields read-only
            verification_fields.forEach(fieldname => {
                const field = frappe.meta.get_docfield('Size List Details', fieldname, frm.doc.name);
                if (field) {
                    field.hidden = 0;  // Show verification checkboxes
                }
            });
            
            // For each row, make verified checkboxes and fields read-only
            if (frm.doc.stone_details && frm.doc.stone_details.length > 0) {
                frm.doc.stone_details.forEach(row => {
                    verification_fields.forEach((verification_field, index) => {
                        const data_field = data_fields[index];
                        const is_verified = row[verification_field];
                        
                        if (is_verified) {
                            // Make verification checkbox read-only
                            grid.grid.update_docfield_property(verification_field, 'read_only', 1, row.name);
                            // Make data field read-only
                            if (data_field) {
                                grid.grid.update_docfield_property(data_field, 'read_only', 1, row.name);
                            }
                        } else {
                            // Keep editable if not verified
                            grid.grid.update_docfield_property(verification_field, 'read_only', 0, row.name);
                            if (data_field) {
                                grid.grid.update_docfield_property(data_field, 'read_only', 0, row.name);
                            }
                        }
                    });
                });
            }
            
        } else {
            // For all other cases: Hide verification columns
            verification_fields.forEach(fieldname => {
                const field = frappe.meta.get_docfield('Size List Details', fieldname, frm.doc.name);
                if (field) {
                    field.hidden = 1;  // Hide
                }
            });
        }
        
        // Refresh the grid to apply changes
        grid.grid.refresh();
        frm.refresh_field('stone_details');
    }
}

// Control "Add Row" button visibility in child table
function control_child_table_add_button(frm) {
    const is_data_operator = frappe.user_roles.includes('Size List Data Entry Operator');
    const is_under_rechange = get_workflow_state(frm) === 'Under Rechange';
    const is_under_recheck = get_workflow_state(frm) === 'Under Recheck';
    const is_correction_mode = is_under_rechange || is_under_recheck;
    
    
    const grid = frm.fields_dict.stone_details;
    
    if (grid && grid.grid) {
        if (is_data_operator) {
            if (is_correction_mode) {
                // Data Entry Operator in correction mode - HIDE add button
                grid.grid.cannot_add_rows = true;
            } else {
                // Data Entry Operator in normal mode - SHOW add button
                grid.grid.cannot_add_rows = false;
            }
        } else {
            // Non-Data Entry Operator - HIDE add button
            grid.grid.cannot_add_rows = true;
        }
        
        // Refresh the grid to apply changes
        grid.grid.refresh();
    }
}

// Lock header/parent fields after child rows are added
function lock_header_fields_if_children_exist(frm) {
    const has_children = frm.doc.stone_details && frm.doc.stone_details.length > 0;
    const workflow_state = get_workflow_state(frm);
    const is_under_verification = workflow_state === 'Under Verification';
    const is_under_rechange = workflow_state === 'Under Rechange';
    const is_under_recheck = workflow_state === 'Under Recheck';
    const is_data_operator = frappe.user_roles.includes('Size List Data Entry Operator');
    const is_data_checker = frappe.user_roles.includes('Size List Data Checker');
    
    // During verification workflow, let setup_field_permissions handle field locking
    if ((is_data_operator && (is_under_rechange || is_under_recheck)) || 
        (is_data_checker && is_under_verification)) {
        // Don't lock fields - verification-based permissions take priority
        return;
    }
    
    // Fields to lock when children exist
    const header_fields = [
        'form_number',
        'baps_project',
        'prep_date',
        'stone_type',
        'main_part',
        'sub_part',
        'cutting_region'
    ];
    
    if (has_children) {
        // Lock all header fields (for non-verification workflows)
        header_fields.forEach(fieldname => {
            frm.set_df_property(fieldname, 'read_only', 1);
        });
        
        // Show message to user
        if (!frm._header_lock_message_shown) {
            
            frm._header_lock_message_shown = true;
        }
    } else {
        // Unlock header fields if no children
        header_fields.forEach(fieldname => {
            // Only unlock if not already locked by verification
            const verification_field = fieldname + '_verified';
            const is_verified = frm.doc[verification_field];
            
            if (!is_verified) {
                frm.set_df_property(fieldname, 'read_only', 0);
            }
        });
        frm._header_lock_message_shown = false;
    }
}

// Setup stone_name query to prevent duplicate stone names
function setup_stone_name_query(frm, cdt, cdn) {
    // Get already selected stone names in this Size List
    const selected_stones = [];
    if (frm.doc.stone_details) {
        frm.doc.stone_details.forEach(row => {
            if (row.stone_name && row.name !== cdn) {
                selected_stones.push(row.stone_name);
            }
        });
    }
    
    
    // Set query with filters to exclude already selected stones
    if (selected_stones.length > 0) {
        frm.fields_dict.stone_details.grid.update_docfield_property(
            'stone_name', 
            'get_query', 
            function() {
                return {
                    filters: {
                        'name': ['not in', selected_stones]
                    }
                };
            }
        );
    } else {
        // No stones selected yet, show all
        frm.fields_dict.stone_details.grid.update_docfield_property(
            'stone_name', 
            'get_query', 
            function() {
                return {};
            }
        );
    }
}

// Setup workflow validation to check before "Verify" action
function setup_workflow_validation(frm) {
    const is_data_checker = frappe.user_roles.includes('Size List Data Checker');
    const workflow_state = get_workflow_state(frm);
    
    if (!is_data_checker || workflow_state !== 'Under Verification') {
        return;
    }
    
    // Wait for workflow buttons to be rendered
    setTimeout(function() {
        // Find the "Verify" workflow button
        const workflow_buttons = frm.page.actions.find('.workflow-button-group .btn');
        
        workflow_buttons.each(function() {
            const btn = $(this);
            const btn_text = btn.text().trim().toLowerCase();
            
            // Intercept "Verify" or "Approve" button click
            if (btn_text.includes('verify') || btn_text.includes('approve')) {
                // Remove existing click handlers
                btn.off('click');
                
                // Add new click handler with validation
                btn.on('click', function(e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    
                    // Validate all fields are verified
                    const all_verified = validate_all_fields_verified(frm);
                    
                    if (!all_verified) {
                        frappe.msgprint({
                            title: __('Verification Incomplete'),
                            message: __('Please verify all parent form fields and child table rows before approving to Verified status.'),
                            indicator: 'red'
                        });
                        return false;
                    }
                    
                    // If validation passes, proceed with the workflow action
                    // Trigger the original workflow action
                    const action = btn.attr('data-action');
                    if (action) {
                        frm.script_manager.trigger('before_workflow_action');
                        frappe.xcall('frappe.model.workflow.apply_workflow', {
                            doc: frm.doc,
                            action: action
                        }).then(function() {
                            frm.reload_doc();
                        });
                    }
                });
            }
        });
    }, 500);
}

// Validate all fields are verified
function validate_all_fields_verified(frm) {
    
    // Parent form fields to check (excluding form_number and prep_date)
    const parent_verification_fields = [
        'baps_project_verified',
        'stone_type_verified',
        'main_part_verified',
        'sub_part_verified',
        'cutting_region_verified',
        'polishing_verified'
    ];
    
    // Check parent fields
    let all_parent_verified = true;
    parent_verification_fields.forEach(field => {
        if (!frm.doc[field]) {
            all_parent_verified = false;
        }
    });
    
    if (!all_parent_verified) {
        frappe.msgprint({
            title: 'Verification Incomplete',
            message: 'Please verify all parent form fields before proceeding.',
            indicator: 'red'
        });
        return false;
    }
    
    // Child table verification fields (must match all fields that have verification checkboxes)
    const child_verification_fields = [
        'stone_name_verified',
        'stone_code_verified',
        'range_verified',  // Added range_verified
        'l1_verified',
        'l2_verified',
        'b1_verified',
        'b2_verified',
        'h1_verified',
        'h2_verified'
    ];
    
    // Check child table rows
    if (!frm.doc.stone_details || frm.doc.stone_details.length === 0) {
        frappe.msgprint({
            title: 'No Data',
            message: 'Please add at least one stone detail row.',
            indicator: 'red'
        });
        return false;
    }
    
    let all_child_verified = true;
    let unverified_rows = [];
    
    frm.doc.stone_details.forEach((row, index) => {
        let row_fully_verified = true;
        child_verification_fields.forEach(field => {
            if (!row[field]) {
                row_fully_verified = false;
            }
        });
        
        if (!row_fully_verified) {
            unverified_rows.push(index + 1);
            all_child_verified = false;
        }
    });
    
    if (!all_child_verified) {
        frappe.msgprint({
            title: 'Verification Incomplete',
            message: `Please verify all fields in child table rows: ${unverified_rows.join(', ')}`,
            indicator: 'red'
        });
        return false;
    }
    
    return true;
}

// Update field editability dynamically when verification checkbox changes
function update_field_by_verification(frm, field_name, verification_field) {
    const is_data_operator = frappe.user_roles.includes('Size List Data Entry Operator');
    const is_data_checker = frappe.user_roles.includes('Size List Data Checker');
    const is_under_verification = get_workflow_state(frm) === 'Under Verification';
    const is_under_rechange = get_workflow_state(frm) === 'Under Rechange';
    const is_under_recheck = get_workflow_state(frm) === 'Under Recheck';
    const is_verified = frm.doc[verification_field];
    
    // For Data Entry Checker in Under Verification - update field editability when checkbox changes
    if (is_data_checker && is_under_verification) {
        control_field_editability(frm, field_name, is_verified);
        return;
    }
    
    // For Data Entry Operator in correction mode
    if (is_data_operator && (is_under_rechange || is_under_recheck)) {
        if (is_verified) {
            // Checkbox is CHECKED → Field becomes READ-ONLY
            frm.set_df_property(field_name, 'read_only', 1);
            frm.set_df_property(verification_field, 'read_only', 1);
        } else {
            // Checkbox is UNCHECKED → Field becomes EDITABLE
            frm.set_df_property(field_name, 'read_only', 0);
        }
        frm.refresh_field(field_name);
    }
}

// Setup child table row permissions based on verification status
function setup_child_row_verification_permissions(frm) {
    const is_data_operator = frappe.user_roles.includes('Size List Data Entry Operator');
    const is_data_checker = frappe.user_roles.includes('Size List Data Checker');
    const is_under_verification = get_workflow_state(frm) === 'Under Verification';
    const is_under_rechange = get_workflow_state(frm) === 'Under Rechange';
    const is_under_recheck = get_workflow_state(frm) === 'Under Recheck';
    const show_verification_operator = is_under_rechange || is_under_recheck;
    
    if (!frm.doc.stone_details || frm.doc.stone_details.length === 0) {
        return;
    }
    
    // Apply permissions to each row based on its verification status
    setTimeout(function() {
        frm.doc.stone_details.forEach((row, idx) => {
            const grid_row = frm.fields_dict.stone_details.grid.grid_rows[idx];
            if (!grid_row) return;
            
            // Child table field verification mapping
            const child_fields = {
                'stone_name': 'stone_name_verified',
                'stone_code': 'stone_code_verified',
                'range': 'range_verified',
                'l1': 'l1_verified',
                'l2': 'l2_verified',
                'b1': 'b1_verified',
                'b2': 'b2_verified',
                'h1': 'h1_verified',
                'h2': 'h2_verified'
            };
            
            // For Data Entry Checker in Under Verification mode
            if (is_data_checker && is_under_verification) {
                Object.keys(child_fields).forEach(field => {
                    const verification_field = child_fields[field];
                    const is_verified = row[verification_field];
                    const field_obj = grid_row.get_field(field);
                    
                    // Control field editability based on verification status
                    if (field_obj) {
                        if (is_verified) {
                            // Verified field → READ-ONLY
                            field_obj.$input.prop('readonly', true);
                        } else {
                            // Not verified field → EDITABLE
                            field_obj.$input.prop('readonly', false);
                        }
                    }
                });
            }
            
            // For Data Entry Operator in correction mode
            if (is_data_operator && show_verification_operator) {
                Object.keys(child_fields).forEach(field => {
                    const verification_field = child_fields[field];
                    const is_verified = row[verification_field];
                    const field_obj = grid_row.get_field(field);
                    const verify_field_obj = grid_row.get_field(verification_field);
                    
                    // Control field editability based on verification status
                    if (field_obj) {
                        if (is_verified) {
                            // Verified field → READ-ONLY
                            field_obj.$input.prop('readonly', true);
                        } else {
                            // Not verified field → EDITABLE
                            field_obj.$input.prop('readonly', false);
                        }
                    }
                    
                    // ALWAYS make verification checkbox read-only for operator
                    if (verify_field_obj) {
                        verify_field_obj.$input.prop('disabled', true);
                    }
                });
            }
        });
        
        frm.refresh_field('stone_details');
    }, 200);
}

// Control individual child table field editability based on verification checkbox
function control_child_field_editability(frm, cdt, cdn, field_name, is_verified) {
    const is_data_operator = frappe.user_roles.includes('Size List Data Entry Operator');
    const is_data_checker = frappe.user_roles.includes('Size List Data Checker');
    const is_under_verification = get_workflow_state(frm) === 'Under Verification';
    const is_under_rechange = get_workflow_state(frm) === 'Under Rechange';
    const is_under_recheck = get_workflow_state(frm) === 'Under Recheck';
    const show_verification = is_under_rechange || is_under_recheck;
    
    const grid_row_idx = frm.fields_dict.stone_details.grid.grid_rows_by_docname[cdn];
    if (!grid_row_idx) return;
    
    // For Data Entry Checker in Under Verification - update field editability when checkbox changes
    if (is_data_checker && is_under_verification) {
        setTimeout(function() {
            const field_obj = grid_row_idx.get_field(field_name);
            
            if (field_obj) {
                if (is_verified) {
                    // Checkbox CHECKED → Field becomes READ-ONLY
                    field_obj.$input.prop('readonly', true);
                } else {
                    // Checkbox UNCHECKED → Field becomes EDITABLE
                    field_obj.$input.prop('readonly', false);
                }
            }
            
            frm.refresh_field('stone_details');
        }, 100);
    }
    
    // For Data Entry Operator in correction mode
    if (is_data_operator && show_verification) {
        setTimeout(function() {
            const field_obj = grid_row_idx.get_field(field_name);
            
            if (field_obj) {
                if (is_verified) {
                    // Checkbox CHECKED → Field becomes READ-ONLY
                    field_obj.$input.prop('readonly', true);
                } else {
                    // Checkbox UNCHECKED → Field becomes EDITABLE
                    field_obj.$input.prop('readonly', false);
                }
            }
            
            frm.refresh_field('stone_details');
        }, 100);
    }
}

// Lock all fields after verification (except for Project Manager)
function lock_all_fields_after_verification(frm) {
    const is_project_manager = frappe.user_roles.includes('Size List Project Manager');
    
    
    if (is_project_manager) {
        // Project Manager: Make data fields read-only but allow workflow actions
        
        // Make all data fields read-only
        frm.fields.forEach(field => {
            // Don't lock workflow-related fields or special fields
            if (!field.df.fieldname.includes('workflow') && 
                field.df.fieldname !== 'amended_from' &&
                field.df.fieldname !== 'docstatus') {
                frm.set_df_property(field.df.fieldname, 'read_only', 1);
            }
        });
        
        // Lock child table data but keep it visible
        const grid = frm.fields_dict.stone_details;
        if (grid && grid.grid) {
            grid.grid.wrapper.find('.grid-add-row').hide();
            grid.grid.wrapper.find('.grid-remove-rows').hide();
            grid.grid.static_rows = true;
            grid.grid.refresh();
        }
        
        frappe.show_alert({
            message: 'Verified form - Data is read-only. Use workflow actions to publish.',
            indicator: 'blue'
        }, 5);
        
    } else {
        // Other users: Lock everything completely
        
        // Disable the form completely
        frm.disable_save();
        
        // Make all parent fields read-only
        frm.fields.forEach(field => {
            frm.set_df_property(field.df.fieldname, 'read_only', 1);
        });
        
        // Lock all child table fields
        const grid = frm.fields_dict.stone_details;
        if (grid && grid.grid) {
            // Disable add/delete buttons
            grid.grid.wrapper.find('.grid-add-row').hide();
            grid.grid.wrapper.find('.grid-remove-rows').hide();
            grid.grid.wrapper.find('.grid-upload').hide();
            grid.grid.wrapper.find('.grid-download').hide();
            
            // Make all grid rows read-only
            if (frm.doc.stone_details) {
                frm.doc.stone_details.forEach(row => {
                    frappe.model.set_value(row.doctype, row.name, 'editable', 0);
                });
            }
            
            // Disable grid edit
            grid.grid.static_rows = true;
            grid.grid.refresh();
        }
        
        frappe.show_alert({
            message: 'This form is Verified and cannot be edited',
            indicator: 'green'
        }, 5);
    }
}

// Check for duplicate Size List configurations
function check_for_duplicates(frm) {
    // Only check if we have all required fields and this is a new document
    if (!frm.doc.baps_project || !frm.doc.stone_type || !frm.doc.main_part || !frm.doc.cutting_region) {
        return;
    }
    
    // Don't check for existing saved documents (only for new ones being created)
    if (!frm.is_new() && frm.doc.__islocal !== 1) {
        return;
    }
    
    // Clear any previous warnings
    frm.dashboard.clear_comment();
    
    // Build filters to check for duplicates
    const filters = {
        "baps_project": frm.doc.baps_project,
        "stone_type": frm.doc.stone_type,
        "main_part": frm.doc.main_part,
        "cutting_region": frm.doc.cutting_region
    };
    
    // Add sub_part filter if exists
    if (frm.doc.sub_part) {
        filters["sub_part"] = frm.doc.sub_part;
    }
    
    // Search for existing Size Lists with same configuration
    frappe.call({
        method: 'frappe.client.get_list',
        args: {
            doctype: 'Size List',
            filters: filters,
            fields: ['name', 'form_number', 'workflow_state', 'creation'],
            limit_page_length: 10,
            order_by: 'creation desc'
        },
        callback: function(r) {
            if (r.message && r.message.length > 0) {
                show_duplicate_warning(frm, r.message);
            }
        }
    });
}

// Show duplicate warning in form
function show_duplicate_warning(frm, duplicates) {
    let warning_html = `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px;">
            <div style="color: #856404; font-weight: bold; margin-bottom: 10px;">
                🚫 DUPLICATE SIZE LIST CONFIGURATION DETECTED!
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>Your Configuration:</strong><br>
                • Project: <span style="color: #0066cc;">${frm.doc.baps_project}</span><br>
                • Stone Type: <span style="color: #0066cc;">${frm.doc.stone_type}</span><br>
                • Main Part: <span style="color: #0066cc;">${frm.doc.main_part}</span><br>
                • Sub Part: <span style="color: #0066cc;">${frm.doc.sub_part || 'Not specified'}</span><br>
                • Cutting Region: <span style="color: #0066cc;">${frm.doc.cutting_region}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong style="color: #d73e48;">⚠️ ${duplicates.length} existing Size List(s) found with identical configuration:</strong>
            </div>
    `;
    
    // Add up to 5 duplicate entries
    duplicates.slice(0, 5).forEach(duplicate => {
        const status = duplicate.workflow_state || 'Draft';
        const form_num = duplicate.form_number || 'Not Set';
        const created_date = frappe.datetime.str_to_user(duplicate.creation);
        
        warning_html += `
            <div style="margin: 5px 0; padding: 8px; background: white; border-left: 3px solid #dc3545; border-radius: 3px;">
                📄 <a href="/app/size-list/${duplicate.name}" target="_blank" style="font-weight: bold; text-decoration: none;">${duplicate.name}</a><br>
                <small style="color: #666;">Form: ${form_num} | Status: ${status} | Created: ${created_date}</small>
            </div>
        `;
    });
    
    if (duplicates.length > 5) {
        warning_html += `<div style="color: #666; font-style: italic;">... and ${duplicates.length - 5} more</div>`;
    }
    
    warning_html += `
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 10px; border-radius: 3px; margin-top: 15px;">
                <strong>⚠️ WARNING:</strong> Creating duplicate Size Lists can cause:<br>
               
            </div>
            
           
        </div>
    `;
    
    // Show warning in form dashboard
    frm.dashboard.add_comment(warning_html, 'red', true);
    
    // Show alert message
    frappe.show_alert({
        message: `🚫 DUPLICATE FOUND! ${duplicates.length} Size List(s) already exist with this configuration`,
        indicator: 'red'
    }, 10);
    
    // Add action buttons
    setTimeout(() => {
        add_duplicate_action_buttons(frm, duplicates);
    }, 500);
}

// Add action buttons to handle duplicates
function add_duplicate_action_buttons(frm, duplicates) {
    // Add button to view the first duplicate
    if (duplicates && duplicates.length > 0) {
        frm.add_custom_button(__('View Existing Size List'), function() {
            frappe.set_route('Form', 'Size List', duplicates[0].name);
        }, __('Duplicate Actions'));
        
        // Add button to clear current configuration
        frm.add_custom_button(__('Clear Configuration'), function() {
            frappe.confirm(
                'This will clear the current configuration fields. Are you sure?',
                function() {
                    // Clear the key fields that cause duplicates
                    frm.set_value('baps_project', '');
                    frm.set_value('stone_type', '');
                    frm.set_value('main_part', '');
                    frm.set_value('sub_part', '');
                    frm.set_value('cutting_region', '');
                    
                    // Clear the warning
                    frm.dashboard.clear_comment();
                    
                    // Remove action buttons
                    frm.page.clear_inner_toolbar();
                    
                    frappe.show_alert({
                        message: 'Configuration cleared. You can now enter a unique configuration.',
                        indicator: 'green'
                    }, 5);
                }
            );
        }, __('Duplicate Actions'));
    }
}

// Check for duplicate stone names within the same project
function check_stone_duplicates(frm, cdt, cdn) {
    const row = locals[cdt][cdn];
    
    // Only check if we have a stone name and project
    if (!row.stone_name || !frm.doc.baps_project) {
        return;
    }
    
    // Skip check for existing saved documents (only check for new ones)
    if (!frm.is_new() && frm.doc.__islocal !== 1) {
        return;
    }
    
    // Clear any previous stone warnings
    clear_stone_warnings(frm);
    
    // Check for duplicates in current document first
    const current_stone_name = row.stone_name.trim().toLowerCase();
    let internal_duplicates = [];
    
    if (frm.doc.stone_details) {
        frm.doc.stone_details.forEach((stone_row, index) => {
            if (stone_row.name !== row.name && 
                stone_row.stone_name && 
                stone_row.stone_name.trim().toLowerCase() === current_stone_name) {
                internal_duplicates.push(index + 1);
            }
        });
    }
    
    if (internal_duplicates.length > 0) {
        show_stone_duplicate_warning(frm, row.stone_name, internal_duplicates, [], 'internal');
        return;
    }
    
    // Check for duplicates in other Size Lists within the same project
    frappe.call({
        method: 'baps.baps.doctype.size_list.size_list.check_stone_name_duplicates',
        args: {
            baps_project: frm.doc.baps_project,
            stone_name: row.stone_name,
            exclude_size_list: frm.doc.name || 'new'
        },
        callback: function(r) {
            if (r.message && r.message.has_duplicates) {
                show_stone_duplicate_warning(frm, row.stone_name, [], r.message.duplicates, 'external');
            }
        }
    });
}

// Show stone duplicate warning
function show_stone_duplicate_warning(frm, stone_name, internal_duplicates, external_duplicates, type) {
    let warning_html = '';
    
    if (type === 'internal') {
        warning_html = `
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 5px 0;">
                <div style="color: #856404; font-weight: bold; margin-bottom: 8px;">
                    ⚠️ DUPLICATE STONE NAME IN CURRENT SIZE LIST
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Stone Name:</strong> <span style="color: #d73e48;">${stone_name}</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Also found in rows:</strong> ${internal_duplicates.join(', ')}
                </div>
                <div style="font-size: 12px; color: #856404;">
                    <strong>Action required:</strong> Each stone must have a unique name within the Size List.
                </div>
            </div>
        `;
    } else if (type === 'external') {
        warning_html = `
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 10px; border-radius: 4px; margin: 5px 0;">
                <div style="color: #721c24; font-weight: bold; margin-bottom: 8px;">
                    🚫 DUPLICATE STONE NAME IN PROJECT
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Project:</strong> ${frm.doc.baps_project}<br>
                    <strong>Stone Name:</strong> <span style="color: #d73e48;">${stone_name}</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Already exists in:</strong>
        `;
        
        external_duplicates.forEach(dup => {
            warning_html += `
                <div style="margin: 3px 0; padding: 4px; background: white; border-left: 2px solid #dc3545;">
                    • <a href="/app/size-list/${dup.size_list_name}" target="_blank">${dup.size_list_name}</a> 
                    <span style="font-size: 11px; color: #666;">(Form: ${dup.form_number}, Status: ${dup.workflow_state})</span>
                </div>
            `;
        });
        
        warning_html += `
                </div>
                <div style="font-size: 12px; color: #721c24;">
                    <strong>Solutions:</strong> Use a different stone name or add suffix (e.g., ${stone_name}-A, ${stone_name}-v2)
                </div>
            </div>
        `;
    }
    
    // Add warning to form dashboard
    frm.dashboard.add_comment(warning_html, type === 'internal' ? 'orange' : 'red', true);
    
    // Show brief alert
    const alert_message = type === 'internal' 
        ? `⚠️ Stone "${stone_name}" already exists in this Size List` 
        : `🚫 Stone "${stone_name}" already exists in project ${frm.doc.baps_project}`;
    
    frappe.show_alert({
        message: alert_message,
        indicator: type === 'internal' ? 'orange' : 'red'
    }, 8);
}

// Clear stone duplicate warnings
function clear_stone_warnings(frm) {
    // Remove stone-specific warnings from dashboard
    const dashboard = frm.dashboard;
    if (dashboard && dashboard.wrapper) {
        dashboard.wrapper.find('.stone-duplicate-warning').remove();
    }
}

// Run comprehensive duplicate check for both header and stones
function run_comprehensive_duplicate_check(frm) {
    if (!frm.doc.baps_project) {
        frappe.msgprint({
            title: __('Missing Project'),
            message: __('Please select a BAPS Project before checking for duplicates.'),
            indicator: 'orange'
        });
        return;
    }
    
    frappe.show_progress(__('Checking for duplicates...'), 30, 100);
    
    // Check header duplicates first
    frappe.call({
        method: 'baps.baps.doctype.size_list.size_list.check_duplicate_configuration',
        args: {
            baps_project: frm.doc.baps_project,
            stone_type: frm.doc.stone_type || '',
            main_part: frm.doc.main_part || '',
            cutting_region: frm.doc.cutting_region || '',
            sub_part: frm.doc.sub_part || null,
            exclude_name: frm.doc.name || 'new'
        },
        callback: function(header_result) {
            frappe.show_progress(__('Checking stone duplicates...'), 60, 100);
            
            // Check stone duplicates if we have stones
            if (frm.doc.stone_details && frm.doc.stone_details.length > 0) {
                const stone_names = frm.doc.stone_details
                    .filter(row => row.stone_name)
                    .map(row => row.stone_name);
                
                if (stone_names.length > 0) {
                    frappe.call({
                        method: 'baps.baps.doctype.size_list.size_list.check_multiple_stone_duplicates',
                        args: {
                            baps_project: frm.doc.baps_project,
                            stone_names: stone_names,
                            exclude_size_list: frm.doc.name || 'new'
                        },
                        callback: function(stone_result) {
                            frappe.hide_progress();
                            show_comprehensive_duplicate_report(frm, header_result.message, stone_result.message);
                        }
                    });
                } else {
                    frappe.hide_progress();
                    show_comprehensive_duplicate_report(frm, header_result.message, {has_duplicates: false, duplicates: []});
                }
            } else {
                frappe.hide_progress();
                show_comprehensive_duplicate_report(frm, header_result.message, {has_duplicates: false, duplicates: []});
            }
        }
    });
}

// Show comprehensive duplicate report
function show_comprehensive_duplicate_report(frm, header_result, stone_result) {
    const has_header_duplicates = header_result && header_result.has_duplicates;
    const has_stone_duplicates = stone_result && stone_result.has_duplicates;
    
    if (!has_header_duplicates && !has_stone_duplicates) {
        frappe.msgprint({
            title: __('✅ No Duplicates Found'),
            message: __('Great! No duplicate configurations or stone names found for this project.'),
            indicator: 'green'
        });
        return;
    }
    
    let report_html = `
        <div style="max-height: 500px; overflow-y: auto;">
            <div class="alert alert-warning">
                <h5>📊 Duplicate Detection Report</h5>
                <p><strong>Project:</strong> ${frm.doc.baps_project}</p>
            </div>
    `;
    
    // Header duplicates section
    if (has_header_duplicates) {
        report_html += `
            <div class="alert alert-danger">
                <h6>🚫 Header Configuration Duplicates</h6>
                <p>Found ${header_result.count} Size List(s) with identical configuration:</p>
                <ul class="mb-0">
        `;
        
        header_result.duplicates.forEach(dup => {
            report_html += `
                <li>
                    <a href="/app/size-list/${dup.name}" target="_blank">${dup.name}</a> 
                    (Form: ${dup.form_number || 'Not Set'}, Status: ${dup.workflow_state || 'Draft'})
                </li>
            `;
        });
        
        report_html += `</ul></div>`;
    } else {
        report_html += `
            <div class="alert alert-success">
                <h6>✅ Header Configuration</h6>
                <p>No duplicate Size List configurations found.</p>
            </div>
        `;
    }
    
    // Stone duplicates section
    if (has_stone_duplicates) {
        report_html += `
            <div class="alert alert-danger">
                <h6>🚫 Stone Name Duplicates</h6>
                <p>Found ${stone_result.total_duplicates} duplicate stone name(s):</p>
        `;
        
        stone_result.duplicates.forEach(stone_group => {
            report_html += `
                <div class="mb-2">
                    <strong>Stone: "${stone_group.stone_name}"</strong>
                    <ul class="mb-1">
            `;
            
            stone_group.locations.forEach(location => {
                report_html += `
                    <li>
                        <a href="/app/size-list/${location.size_list_name}" target="_blank">${location.size_list_name}</a>
                        (Form: ${location.form_number || 'Not Set'}, Status: ${location.workflow_state || 'Draft'})
                    </li>
                `;
            });
            
            report_html += `</ul></div>`;
        });
        
        report_html += `</div>`;
    } else {
        report_html += `
            <div class="alert alert-success">
                <h6>✅ Stone Names</h6>
                <p>No duplicate stone names found within the project.</p>
            </div>
        `;
    }
    
    report_html += `
            <div class="alert alert-info">
                <h6>💡 Recommendations</h6>
                <ul class="mb-0">
    `;
    
    if (has_header_duplicates) {
        report_html += `<li><strong>Header duplicates:</strong> Consider using existing Size Lists or modify configuration</li>`;
    }
    
    if (has_stone_duplicates) {
        report_html += `<li><strong>Stone duplicates:</strong> Use unique stone names (add suffixes like -A, -B, -v2)</li>`;
    }
    
    if (!has_header_duplicates && !has_stone_duplicates) {
        report_html += `<li>Your Size List configuration and stone names are unique within the project!</li>`;
    }
    
    report_html += `
                </ul>
            </div>
        </div>
    `;
    
    const dialog = new frappe.ui.Dialog({
        title: __('Duplicate Detection Report'),
        fields: [
            {
                fieldtype: 'HTML',
                fieldname: 'report_html',
                options: report_html
            }
        ],
        size: 'large',
        primary_action_label: __('Close')
    });
    
    dialog.show();
}



