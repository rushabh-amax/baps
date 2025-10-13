// Size List - Basic Functionality
// Essential business logic only, no workflow

// Helper function to get current workflow state
function get_workflow_state(frm) {
    // Check both workflow_state (Frappe workflow) and workflow_status (custom field)
    return frm.doc.workflow_state || get_workflow_state(frm) || frm.doc.__wf || '';
}

frappe.ui.form.on('Size List', {
    setup: function(frm) {
        // Ensure prepared_by is set as early as possible for new documents
        setTimeout(() => {
            if (!frm.doc.prepared_by && frappe.session.user && frm.is_new()) {
                console.log('Setup - Setting prepared_by:', frappe.session.user);
                frm.set_value('prepared_by', frappe.session.user);
            }
        }, 100);
    },
    
    refresh: function(frm) {
        const workflow_state = get_workflow_state(frm);
        
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
        
        // Check for duplicates and highlight rows (especially important for Under Rechange status)
        setTimeout(() => {
            // For testing: set first row as duplicate
            if (frm.doc.stone_details && frm.doc.stone_details.length > 0) {
                console.log('Setting first row as duplicate for testing');
                frappe.model.set_value('Size List Details', frm.doc.stone_details[0].name, 'duplicate_flag', 1);
            }
            
            // Test simple highlighting
            test_highlighting(frm);
            
            // Apply duplicate highlighting
            apply_duplicate_highlighting(frm);
            
            // Then do full duplicate check
            check_and_highlight_all_duplicate_rows(frm);
        }, 1000);
        
        // Auto-uncheck range verification for duplicate rows when in Under Rechange
        if (workflow_state === 'Under Rechange') {
            auto_uncheck_range_verification_for_duplicates(frm);
        }
        
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
            console.log('Setting prepared_by for new form:', frappe.session.user);
            if (!frm.doc.prepared_by) {
                frm.set_value('prepared_by', frappe.session.user);
            }
        }
        
        // Always ensure prepared_by is set for Data Entry Operators (more aggressive approach)
        if (!frm.doc.prepared_by) {
            console.log('Refresh - prepared_by is empty, setting to current user:', frappe.session.user);
            frm.set_value('prepared_by', frappe.session.user);
        }
        
        // Force refresh the field to ensure it displays
        frm.refresh_field('prepared_by');
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
            console.log('OnLoad - Setting prepared_by for new form:', frappe.session.user);
            if (!frm.doc.prepared_by) {
                frm.set_value('prepared_by', frappe.session.user);
            }
        }
        
        // Always ensure prepared_by is set (more aggressive approach)
        if (!frm.doc.prepared_by) {
            console.log('OnLoad - prepared_by is empty, setting to current user:', frappe.session.user);
            frm.set_value('prepared_by', frappe.session.user);
        }
        
        // Force refresh the field to ensure it displays
        frm.refresh_field('prepared_by');
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
        
        // Control Show Duplicates button visibility
        control_show_duplicates_button_visibility(frm, cdt, cdn);
    },
    
    // Form render event to setup row-level permissions
    form_render: function(frm, cdt, cdn) {
        setup_child_row_permissions(frm, cdt, cdn);
        
        // Setup stone_name query to prevent duplicates
        setup_stone_name_query(frm, cdt, cdn);
        
        // Control Show Duplicates button visibility
        control_show_duplicates_button_visibility(frm, cdt, cdn);
    },
    
    // Before row is displayed - setup query
    stone_details_add: function(frm, cdt, cdn) {
        setup_stone_name_query(frm, cdt, cdn);
    },
    
    // Verification checkbox events for child table
    stone_name_verified: function(frm, cdt, cdn) {
        control_child_field_editability(frm, cdt, cdn, 'stone_name', locals[cdt][cdn].stone_name_verified);
        control_range_verification_access(frm, cdt, cdn);
    },
    
    stone_code_verified: function(frm, cdt, cdn) {
        control_child_field_editability(frm, cdt, cdn, 'stone_code', locals[cdt][cdn].stone_code_verified);
        control_range_verification_access(frm, cdt, cdn);
    },
    
    range_verified: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        
        // Check if user is trying to check range_verified
        if (row.range_verified == 1) {
            // Check if all other verification checkboxes are checked
            // const required_verifications = [
            //     'stone_name_verified',
            //     'stone_code_verified', 
            //     'l1_verified',
            //     'l2_verified',
            //     'b1_verified',
            //     'b2_verified',
            //     'h1_verified',
            //     'h2_verified'
            // ];
            
            const unchecked_fields = required_verifications.filter(field => !row[field]);
            
            if (unchecked_fields.length > 0) {
                // Uncheck range_verified and show message
                frappe.model.set_value(cdt, cdn, 'range_verified', 0);
                
                const field_labels = {
                    'stone_name_verified': 'Stone Name',
                    'stone_code_verified': 'Stone Code',
                    'l1_verified': 'L1',
                    'l2_verified': 'L2', 
                    'b1_verified': 'B1',
                    'b2_verified': 'B2',
                    'h1_verified': 'H1',
                    'h2_verified': 'H2'
                };
                
                const missing_labels = unchecked_fields.map(field => field_labels[field]).join(', ');
                
                // frappe.msgprint({
                //     title: 'Range Verification Not Allowed',
                //     message: `Please verify all other fields first before verifying Range.<br><br><strong>Pending verifications:</strong> ${missing_labels}`,
                //     indicator: 'red'
                // });
                
                return;
            }
        }
        
        // control_child_field_editability(frm, cdt, cdn, 'range', locals[cdt][cdn].range_verified);
    },
    
    // l1_verified: function(frm, cdt, cdn) {
    //     control_child_field_editability(frm, cdt, cdn, 'l1', locals[cdt][cdn].l1_verified);
    //     control_range_verification_access(frm, cdt, cdn);
    // },
    
    // l2_verified: function(frm, cdt, cdn) {
    //     control_child_field_editability(frm, cdt, cdn, 'l2', locals[cdt][cdn].l2_verified);
    //     control_range_verification_access(frm, cdt, cdn);
    // },
    
    // b1_verified: function(frm, cdt, cdn) {
    //     control_child_field_editability(frm, cdt, cdn, 'b1', locals[cdt][cdn].b1_verified);
    //     control_range_verification_access(frm, cdt, cdn);
    // },
    
    // b2_verified: function(frm, cdt, cdn) {
    //     control_child_field_editability(frm, cdt, cdn, 'b2', locals[cdt][cdn].b2_verified);
    //     control_range_verification_access(frm, cdt, cdn);
    // },
    
    // h1_verified: function(frm, cdt, cdn) {
    //     control_child_field_editability(frm, cdt, cdn, 'h1', locals[cdt][cdn].h1_verified);
    //     control_range_verification_access(frm, cdt, cdn);
    // },
    
    // h2_verified: function(frm, cdt, cdn) {
    //     control_child_field_editability(frm, cdt, cdn, 'h2', locals[cdt][cdn].h2_verified);
    //     control_range_verification_access(frm, cdt, cdn);
    // },
    
    // Show Duplicates button event
    show_duplicates: function(frm, cdt, cdn) {
        show_duplicate_records(frm, cdt, cdn);
    },
    
    // Essential data field events only
    stone_name: function(frm, cdt, cdn) {
        calculate_volume(frm, cdt, cdn);
        
        // Check for duplicates after stone name changes
        setTimeout(() => {
            check_and_highlight_all_duplicate_rows(frm);
        }, 500);
    },
    
    stone_code: function(frm, cdt, cdn) {
        calculate_volume(frm, cdt, cdn);
        
        // Check for duplicates after stone code changes
        setTimeout(() => {
            check_and_highlight_all_duplicate_rows(frm);
        }, 500);
    },
    
    range: function(frm, cdt, cdn) {
        // Check for duplicates after range changes
        setTimeout(() => {
            check_and_highlight_all_duplicate_rows(frm);
        }, 500);
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
    
    // Always control range verification checkbox based on other verifications
    control_range_verification_access(frm, cdt, cdn);
}

// Control range verification checkbox - only enable when all other verifications are done
function control_range_verification_access(frm, cdt, cdn) {
    const row = locals[cdt][cdn];
    const row_wrapper = frm.fields_dict.stone_details?.grid?.grid_rows_by_docname[cdn];
    
    if (!row_wrapper) return;
    
    // Check if all other verification checkboxes are checked
    const required_verifications = [
        'stone_name_verified',
        'stone_code_verified',
        'l1_verified',
        'l2_verified', 
        'b1_verified',
        'b2_verified',
        'h1_verified',
        'h2_verified'
    ];
    
    const all_verified = required_verifications.every(field => row[field] == 1);
    const range_wrapper = row_wrapper.get_field('range_verified');
    
    if (range_wrapper && range_wrapper.$input) {
        if (all_verified) {
            // Enable range verification
            range_wrapper.$input.prop('disabled', false);
            range_wrapper.$input.css('opacity', '1');
            range_wrapper.$input.attr('title', 'All other fields verified. Range verification now available.');
        } else {
            // Disable range verification and uncheck if checked
            range_wrapper.$input.prop('disabled', true);
            range_wrapper.$input.css('opacity', '0.5');
            range_wrapper.$input.attr('title', 'Please verify all other fields first before verifying Range.');
            
            // If range is currently checked, uncheck it
            if (row.range_verified == 1) {
                frappe.model.set_value(cdt, cdn, 'range_verified', 0);
            }
        }
    }
}

// Control Show Duplicates button visibility based on user roles and workflow state
function control_show_duplicates_button_visibility(frm, cdt, cdn) {
    const row_wrapper = frm.fields_dict.stone_details?.grid?.grid_rows_by_docname[cdn];
    if (!row_wrapper) return;
    
    // Check user roles and workflow state
    const is_data_entry_operator = frappe.user_roles.includes('Size List Data Entry Operator');
    const is_administrator = frappe.user_roles.includes('Administrator');
    const workflow_state = get_workflow_state(frm);
    const is_under_rechange = workflow_state === 'Under Rechange';
    
    // Button is visible only to Data Entry Operator when status is Under Rechange
    // OR to Administrator (always visible for admin for troubleshooting)
    const can_see_button = (is_data_entry_operator && is_under_rechange) || is_administrator;
    
    // Get the Show Duplicates button field
    const show_duplicates_wrapper = row_wrapper.get_field('show_duplicates');
    
    if (show_duplicates_wrapper) {
        if (can_see_button) {
            // Show button for authorized conditions
            show_duplicates_wrapper.df.hidden = 0;
            show_duplicates_wrapper.$wrapper.show();
        } else {
            // Hide button for other conditions
            show_duplicates_wrapper.df.hidden = 1;
            show_duplicates_wrapper.$wrapper.hide();
        }
        
        // Refresh the field to apply changes
        show_duplicates_wrapper.refresh();
    }
    
    console.log(`Show Duplicates button visibility: ${can_see_button ? 'VISIBLE' : 'HIDDEN'} - Role: Data Entry Operator: ${is_data_entry_operator}, Admin: ${is_administrator}, Under Rechange: ${is_under_rechange}`);
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
        'range_verified',
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
        'range',
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
            
        } else if (is_data_operator && show_verification) {
            // Data Entry Operator in Under Rechange/Recheck: Show verification columns but make them read-only
            verification_fields.forEach(fieldname => {
                grid.grid.update_docfield_property(fieldname, 'hidden', 0);
                grid.grid.update_docfield_property(fieldname, 'read_only', 1); // Read-only for operator
                
                const field = frappe.meta.get_docfield('Size List Details', fieldname, frm.doc.name);
                if (field) {
                    field.hidden = 0;
                    field.read_only = 1;
                }
            });
            
            // Data fields should be editable for operators to make corrections
            data_fields.forEach(fieldname => {
                grid.grid.update_docfield_property(fieldname, 'read_only', 0);
                
                const field = frappe.meta.get_docfield('Size List Details', fieldname, frm.doc.name);
                if (field) {
                    field.read_only = 0;
                }
            });
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
// function setup_stone_name_query(frm, cdt, cdn) {
//     // Get already selected stone names in this Size List
//     const selected_stones = [];
//     if (frm.doc.stone_details) {
//         frm.doc.stone_details.forEach(row => {
//             if (row.stone_name && row.name !== cdn) {
//                 selected_stones.push(row.stone_name);
//             }
//         });
//     }
    
    
//     // Set query with filters to exclude already selected stones
//     if (selected_stones.length > 0) {
//         frm.fields_dict.stone_details.grid.update_docfield_property(
//             'stone_name', 
//             'get_query', 
//             function() {
//                 return {
//                     filters: {
//                         'name': ['not in', selected_stones]
//                     }
//                 };
//             }
//         );
//     } else {
//         // No stones selected yet, show all
//         frm.fields_dict.stone_details.grid.update_docfield_property(
//             'stone_name', 
//             'get_query', 
//             function() {
//                 return {};
//             }
//         );
//     }
// }

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









// frappe.listview_settings['Size List'] = {    
//     onload: function(listview) {
//         // Get current user's roles
//         const roles = frappe.user_roles;

//         // If user is a Data Entry Checker
//         if (roles.includes("Size List Data Checker")) {
//             // Apply a filter so only non-draft records are visible
//             listview.filter_area.add([
//                 ["Size List", "workflow_state", "!=", "Draft"]
//             ]);
//         }
//     }
// };






















// -------------------------------------------------------

frappe.ui.form.on('Size List', {
    refresh(frm) {
        highlight_duplicate_rows(frm);
        // Ensure duplicate_flag visibility for all rows
        if (frm.doc.stone_details) {
            frm.doc.stone_details.forEach(row => {
                update_duplicate_flag_visibility(frm, row.doctype, row.name);
            });
        }
    },
    onload_post_render(frm) {
        highlight_duplicate_rows(frm);
        if (frm.doc.stone_details) {
            frm.doc.stone_details.forEach(row => {
                update_duplicate_flag_visibility(frm, row.doctype, row.name);
            });
        }
    }
});

frappe.ui.form.on('Size List Details', {
    stone_code: function (frm, cdt, cdn) {
        handle_field_edit(frm, cdt, cdn);
    },
    range: function (frm, cdt, cdn) {
        handle_field_edit(frm, cdt, cdn);
    },
    l1: function (frm, cdt, cdn) {
        handle_field_edit(frm, cdt, cdn);
    },
    l2: function (frm, cdt, cdn) {
        handle_field_edit(frm, cdt, cdn);
    },
    b1: function (frm, cdt, cdn) {
        handle_field_edit(frm, cdt, cdn);
    },
    b2: function (frm, cdt, cdn) {
        handle_field_edit(frm, cdt, cdn);
    },
    h1: function (frm, cdt, cdn) {
        handle_field_edit(frm, cdt, cdn);
    },
    h2: function (frm, cdt, cdn) {
        handle_field_edit(frm, cdt, cdn);
    },
    volume: function (frm, cdt, cdn) {
        handle_field_edit(frm, cdt, cdn);
    }
});


// ------------------------------
// Helper Functions
// ------------------------------

function highlight_duplicate_rows(frm) {
    if (!frm.doc.stone_details) {
        console.log('No stone_details found');
        return;
    }

    console.log('Highlighting duplicate rows, found', frm.doc.stone_details.length, 'rows');
    
    frm.doc.stone_details.forEach((row, index) => {
        console.log(`Row ${index}: duplicate_flag = ${row.duplicate_flag}, stone_code = ${row.stone_code}`);
        
        const gridRow = frm.fields_dict.stone_details.grid.grid_rows_by_docname[row.name];

        if (!gridRow) {
            console.log(`No gridRow found for row ${row.name}`);
            return;
        }

        // Remove previous styles first
        $(gridRow.row).css({
            backgroundColor: '',
            borderLeft: ''
        });
        
        // Remove existing warning
        $(gridRow.row).find('.duplicate-warning').remove();

        // Add ⚠️ icon and red background if duplicate
        if (row.duplicate_flag == 1) {
            console.log(`Applying red styling to duplicate row: ${row.stone_code}`);
            
            $(gridRow.row).css({
                backgroundColor: '#ffe5e5',
                borderLeft: '4px solid #e60000'
            });

            const $warning = $(`<span class="duplicate-warning" style="color:#e60000; font-weight:600;"> ⚠️ Duplicate</span>`);
            const $cell = $(gridRow.row).find('.data-row .row-index');
            if ($cell.length > 0) {
                $cell.append($warning);
                console.log('Warning icon added');
            } else {
                console.log('Could not find .row-index cell');
            }
        }
    });
}


function handle_field_edit(frm, cdt, cdn) {
    const row = frappe.get_doc(cdt, cdn);

    // If this row was previously duplicate, user is editing it
    if (row.duplicate_flag == 1) {
        frappe.model.set_value(cdt, cdn, 'duplicate_flag', 0);
        // frappe.show_alert({
        //     message: `⚠️ Duplicate flag removed because you edited this row.`,
        //     indicator: 'orange'
        // });

        // Optional: if you have "verified" checkbox field, auto uncheck it
        if (row.is_verified) {
            frappe.model.set_value(cdt, cdn, 'is_verified', 0);
        }
    }

    // Repaint UI (remove red background)
    setTimeout(() => {
        highlight_duplicate_rows(frm);
    }, 300);
}

// baps/baps/doctype/size_list/size_list.js
frappe.ui.form.on('Size List', {
    refresh: function(frm) {
        // highlight duplicates on refresh
        highlight_duplicate_rows(frm);
        attach_grid_change_handler(frm);
    },
    stone_details_add: function(frm, cdt, cdn) {
        setTimeout(() => highlight_duplicate_rows(frm), 150);
    },
    stone_details_remove: function(frm) {
        setTimeout(() => highlight_duplicate_rows(frm), 150);
    }
});















function highlight_duplicate_rows(frm) {
    if (!frm.fields_dict || !frm.fields_dict.stone_details) return;
    let grid = frm.fields_dict.stone_details.grid;
    if (!grid) return;

    // small delay to ensure grid rows are rendered
    setTimeout(() => {
        grid.wrapper.find('.grid-row').each(function() {
            let $row = $(this);
            let idx = $row.attr('data-idx');
            if (!idx) return;
            let row_doc = frm.doc.stone_details[idx];
            if (!row_doc) return;

            // add/remove visual
            if (row_doc.duplicate_flag == 1 || row_doc.duplicate_flag === true) {
                $row.addClass('row-duplicate');
                if (!$row.find('.duplicate-badge').length) {
                    $row.find('.grid-row-index').append('<span class="duplicate-badge" title="Duplicate">⚠️</span>');
                }
            } else {
                $row.removeClass('row-duplicate');
                $row.find('.duplicate-badge').remove();
            }
        });
    }, 200);
}


// Attach a single delegated change handler on the grid wrapper
function attach_grid_change_handler(frm) {
    if (!frm.fields_dict || !frm.fields_dict.stone_details) return;
    let grid = frm.fields_dict.stone_details.grid;
    if (!grid) return;

    // Avoid attaching multiple times
    if (grid._dup_change_handler_attached) return;
    grid._dup_change_handler_attached = true;

    grid.wrapper.on('change input', 'input, select, textarea', function(e) {
        // Find closest grid row and index
        let $row = $(this).closest('.grid-row');
        let idx = $row.attr('data-idx');
        if (!idx) return;

        idx = parseInt(idx);
        let row = frm.doc.stone_details[idx];
        if (!row) return;

        // If user edits the row, clear duplicate_flag for that row (client-side + server)
        if (row.duplicate_flag) {
            // clear client-side immediately
            frappe.model.set_value(row.doctype, row.name, 'duplicate_flag', 0);
            update_duplicate_flag_visibility(frm, row.doctype, row.name);
            // Also clear parent verification so operator must resubmit
            if (frm.doc.overall_form_verified) {
                frm.set_value('overall_form_verified', 0);
            }
            // Refresh visuals
            setTimeout(() => highlight_duplicate_rows(frm), 150);
        }

        // Additionally: if the operator changes critical fields, we want the checker to recheck those fields.
        // Optionally clear verification progress field (if present)
        if (frm.fields_dict && frm.fields_dict.verification_progress) {
            frm.set_value('verification_progress', 0);
        }
    });
}

// Auto-uncheck range verification for duplicate rows when document is Under Rechange
function auto_uncheck_range_verification_for_duplicates(frm) {
    if (!frm.doc.stone_details) return;
    
    let unchecked_count = 0;
    
    frm.doc.stone_details.forEach(row => {
        // If this row has duplicate flag and range_verified is checked
        if (row.duplicate_flag == 1 && row.range_verified == 1) {
            // Uncheck the range_verified checkbox
            frappe.model.set_value('Size List Details', row.name, 'range_verified', 0);
            unchecked_count++;
        }
    });
    
    if (unchecked_count > 0) {
        // Show alert about automatic unchecking
        frappe.show_alert({
            message: `⚠️ Auto-unchecked Range verification for ${unchecked_count} duplicate row(s). Please fix the duplicates and resubmit.`,
            indicator: 'orange'
        });
        
        // Refresh the form to show the changes
        setTimeout(() => {
            frm.refresh();
        }, 1000);
    }
}

// Show duplicate records for a specific row
function show_duplicate_records(frm, cdt, cdn) {
    const row = locals[cdt][cdn];
    
    // Check if row has any data to search for duplicates
    if (!row.stone_name && !row.range && !row.stone_code && !row.l1 && !row.l2 && !row.b1 && !row.b2 && !row.h1 && !row.h2) {
        frappe.msgprint('This row has no data to check for duplicates.');
        return;
    }
    
    // Get the current row data for comparison
    const current_data = {
        stone_name: row.stone_name,
        stone_code: row.stone_code,
        range: row.range,
        l1: row.l1,
        l2: row.l2,
        b1: row.b1,
        b2: row.b2,
        h1: row.h1,
        h2: row.h2,
        baps_project: frm.doc.baps_project,
        main_part: frm.doc.main_part,
        sub_part: frm.doc.sub_part
    };
    
    // Debug: Check what data we're sending
    console.log("Searching for duplicates with data:", current_data);
    
    // Validate required fields
    if (!current_data.baps_project) {
        frappe.msgprint('BAPS Project is required to search for duplicates.');
        return;
    }
    
    // Call server method to get duplicate records
    frappe.call({
        method: 'baps.baps.doctype.size_list.size_list.get_duplicate_records_for_row',
        args: {
            row_data: current_data,
            current_size_list: frm.doc.name
        },
        callback: function(r) {
            console.log("Server response:", r);
            if (r.message && r.message.length > 0) {
                frappe.model.set_value(row.doctype, row.name, 'duplicate_flag', 1);
                update_duplicate_flag_visibility(frm, row.doctype, row.name);
                
                show_duplicate_records_dialog(r.message, row);
            } else {
                frappe.model.set_value(row.doctype, row.name, 'duplicate_flag', 1);
                update_duplicate_flag_visibility(frm, row.doctype, row.name);

                frappe.msgprint({
                    title: 'No Duplicates Found',
                    message: `No duplicate records found for:<br>
                            <strong>Stone Name:</strong> ${current_data.stone_name || 'Not set'}<br>
                            <strong>Range:</strong> ${current_data.range || 'Not set'}<br>
                            <strong>Stone Code:</strong> ${current_data.stone_code || 'Not set'}<br>
                            <br>This means this row is unique in the current project/part combination.`,
                    indicator: 'green'
                });
            }
        }
    });
}

function update_duplicate_flag_visibility(frm, cdt, cdn) {
    const row = locals[cdt][cdn];
    const grid_row = frm.fields_dict.stone_details.grid.grid_rows_by_docname[row.name];
    if (!grid_row) return;

    // ✅ Just refresh the field to apply the updated display logic
    grid_row.get_field('duplicate_flag').refresh();

    // Optional: refresh the entire grid if needed (usually not necessary)
    // frm.refresh_field('stone_details');
}

// Show duplicate records in a dialog
// function show_duplicate_records_dialog(duplicate_records, current_row) {
//     let dialog = new frappe.ui.Dialog({
//         title: `Duplicate Records for Range: ${current_row.range}`,
//         size: 'extra-large',
//         fields: [
//             {
//                 fieldtype: 'HTML',
//                 fieldname: 'duplicate_info'
//             }
//         ]
//     });
    
//     // Create HTML table to show duplicate records
//     let html = `
//         <div style="margin: 10px 0;">
//             <p><strong>Found ${duplicate_records.length} duplicate record(s):</strong></p>
//             <table class="table table-bordered table-striped" style="font-size: 12px;">
                
//                 <tbody>
//     `;
    
//     // duplicate_records.forEach(record => {
//     //     html += `
//     //         <tr style="background-color: #ffebee;">
//     //             <td><a href="/app/size-list/${record.size_list}" target="_blank">${record.size_list}</a></td>
//     //             <td>${record.stone_name || ''}</td>
//     //             <td><strong style="color: red;">${record.range || ''}</strong></td>
//     //             <td>${record.stone_code || ''}</td>
//     //             <td>${record.l1 || ''}</td>
//     //             <td>${record.l2 || ''}</td>
//     //             <td>${record.b1 || ''}</td>
//     //             <td>${record.b2 || ''}</td>
//     //             <td>${record.h1 || ''}</td>
//     //             <td>${record.h2 || ''}</td>
//     //             <td><span class="indicator ${get_status_indicator(record.workflow_state)}">${record.workflow_state || 'Draft'}</span></td>
//     //             <td>
//     //                 <button class="btn btn-xs btn-secondary" onclick="frappe.set_route('Form', 'Size List', '${record.size_list}')">
//     //                     View
//     //                 </button>
//     //             </td>
//     //         </tr>
//     //     `;
//     // });
    
//     html += `
//                 </tbody>
//             </table>
//             <div class="alert alert-warning" style="margin-top: 15px;">
//                 <strong>Action Required:</strong> 
//                 <ul style="margin-bottom: 0;">
//                     <li>Either <strong>delete this duplicate row</strong> from the current Size List</li>
//                     <li>Or <strong>change the range value</strong> to make it unique</li>
//                     <li>Then resubmit the document for verification</li>
//                 </ul>
//             </div>
//         </div>
//     `;
    
//     dialog.fields_dict.duplicate_info.$wrapper.html(html);
//     dialog.show();
// }
function show_duplicate_records_dialog(duplicate_records, current_row) {
    let dialog = new frappe.ui.Dialog({
        title: `⚠️ Range "${current_row.range}" Already Exists`,
        size: 'large',
        fields: [{ fieldtype: 'HTML', fieldname: 'duplicate_info' }]
    });

    let rows = duplicate_records.map(record => {
        // Safely escape single quotes in size_list name to prevent JS break
        const safeName = String(record.size_list).replace(/'/g, "\\'");
        return `
            <tr>
                <td style="font-family: monospace;">${record.size_list}</td>
                <td>${record.stone_name || ''}</td>
                <td><strong>${record.range}</strong></td>
                <td>
                    <button class="btn btn-xs btn-secondary"
                            onclick="frappe.set_route('Form', 'Size List', '${safeName}')">
                        View
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    let html = `
        <div style="padding: 12px; font-size: 13px; color: #555;">
            <p style="margin: 0 0 12px;">
                The range <strong>"${current_row.range}"</strong> is already defined in 
                <strong>${duplicate_records.length}</strong> other Size List record(s).
            </p>
            <div style="max-height: 200px; overflow: auto; border: 1px solid #eee; border-radius: 4px;">
                <table class="table table-bordered" style="margin: 0; font-size: 12px;">
                    <thead>
                        <tr>
                            <th>Size List</th>
                            <th>Stone Name</th>
                            <th>Range</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
            <p style="margin-top: 12px; font-size: 12px; color: #888;">
                → Change the range or remove this row to proceed.
            </p>
        </div>
    `;

    dialog.fields_dict.duplicate_info.$wrapper.html(html);
    dialog.show();
}

// Get status indicator color
function get_status_indicator(status) {
    switch(status) {
        case 'Draft': return 'gray';
        case 'Under Verification': return 'orange';
        case 'Under Rechange': return 'red';
        case 'Verified': return 'green';
        case 'Published': return 'blue';
        default: return 'gray';
    }
}

// Test function to check if highlighting works
// function test_highlighting(frm) {
//     console.log('=== Testing highlighting system ===');
    
//     if (!frm.fields_dict || !frm.fields_dict.stone_details) {
//         console.log('No stone_details field found');
//         return;
//     }
    
//     let grid = frm.fields_dict.stone_details.grid;
//     if (!grid) {
//         console.log('No grid found');
//         return;
//     }
    
//     console.log('Grid found:', grid);
//     console.log('Grid wrapper:', grid.wrapper);
    
//     // Try to find and highlight the first row as a test
//     let $firstRow = grid.wrapper.find('.grid-row').first();
//     console.log('First row found:', $firstRow);
    
//     if ($firstRow.length > 0) {
//         console.log('Applying test highlighting to first row');
//         $firstRow.css({
//             'background-color': '#ffebee',
//             'border-left': '5px solid #f44336'
//         });
        
//         // Add test badge
//         if (!$firstRow.find('.test-badge').length) {
//             $firstRow.find('.grid-row-index').append('<span class="test-badge" style="background: red; color: white; padding: 2px 4px; margin-left: 5px;">TEST</span>');
//         }
        
//         console.log('Test highlighting applied successfully');
//     } else {
//         console.log('No grid rows found to highlight');
//     }
// }

// Check each row individually for duplicates and highlight
function check_and_highlight_all_duplicate_rows(frm) {
    console.log('=== Starting duplicate check ===');
    console.log('Form doc:', frm.doc);
    console.log('Stone details:', frm.doc.stone_details);
    
    if (!frm.doc.stone_details || frm.doc.stone_details.length === 0) {
        console.log('No stone details found, skipping duplicate check');
        return;
    }
    
    console.log('Checking duplicates for', frm.doc.stone_details.length, 'rows');
    console.log('Current workflow state:', get_workflow_state(frm));
    
    // Check each row individually
    let promises = frm.doc.stone_details.map((row, index) => {
        return check_single_row_for_duplicates(frm, row, index);
    });
    
    // Wait for all checks to complete, then apply highlighting
    Promise.all(promises).then(() => {
        setTimeout(() => {
            apply_duplicate_highlighting(frm);
        }, 300);
    });
}

// Check a single row for duplicates
function check_single_row_for_duplicates(frm, row, index) {
    return new Promise((resolve) => {
        // Skip if row has no meaningful data
        if (!row.stone_name && !row.range && !row.stone_code) {
            resolve();
            return;
        }
        
        const row_data = {
            stone_name: row.stone_name,
            stone_code: row.stone_code,
            range: row.range,
            l1: row.l1,
            l2: row.l2,
            b1: row.b1,
            b2: row.b2,
            h1: row.h1,
            h2: row.h2,
            baps_project: frm.doc.baps_project,
            main_part: frm.doc.main_part,
            sub_part: frm.doc.sub_part
        };
        
        // Call server to check for duplicates
        frappe.call({
            method: 'baps.baps.doctype.size_list.size_list.get_duplicate_records_for_row',
            args: {
                row_data: row_data,
                current_size_list: frm.doc.name || 'new'
            },
            callback: function(r) {
                let has_duplicates = r.message && r.message.length > 0;
                
                console.log(`Row ${index} (${row.stone_name || row.range}): ${has_duplicates ? 'HAS DUPLICATES' : 'No duplicates'}`);
                
                // Set duplicate flag on the row
                frappe.model.set_value('Size List Details', row.name, 'duplicate_flag', has_duplicates ? 1 : 0);
                update_duplicate_flag_visibility(frm, row.doctype, row.name);
                resolve();
            },
            error: function() {
                console.log(`Error checking duplicates for row ${index}`);
                resolve();
            }
        });
    });
}

// Apply visual highlighting to duplicate rows
// function apply_duplicate_highlighting(frm) {
//     console.log('=== Applying duplicate highlighting ===');
    
//     if (!frm.fields_dict || !frm.fields_dict.stone_details) {
//         console.log('No stone_details field found');
//         return;
//     }
    
//     let grid = frm.fields_dict.stone_details.grid;
//     if (!grid) {
//         console.log('No grid found');
//         return;
//     }
    
//     console.log('Grid found, looking for rows...');
    
//     // Use a more reliable way to find grid rows
//     setTimeout(() => {
//         // Try different selectors for grid rows
//         let $gridRows = grid.wrapper.find('.grid-row, [data-fieldname="stone_details"] .grid-row');
//         console.log('Found grid rows:', $gridRows.length);
        
//         if ($gridRows.length === 0) {
//             // Try alternative approach using grid rows by docname
//             console.log('Trying alternative approach...');
//             console.log('Grid rows by docname:', grid.grid_rows_by_docname);
            
//             if (grid.grid_rows_by_docname) {
//                 Object.keys(grid.grid_rows_by_docname).forEach(docname => {
//                     let gridRow = grid.grid_rows_by_docname[docname];
//                     if (gridRow && gridRow.row) {
//                         console.log('Found grid row via docname:', docname);
//                         let $row = $(gridRow.row);
                        
//                         // Apply test styling to see if it works
//                         $row.css({
//                             'background-color': '#ffebee !important',
//                             'border-left': '5px solid #f44336'
//                         });
                        
//                         console.log('Applied test styling to row');
//                     }
//                 });
//             }
//         }
        
//         // Clear existing highlighting first
//         $gridRows.removeClass('row-duplicate');
//         $gridRows.find('.duplicate-badge').remove();
        
//         // Apply highlighting to duplicate rows
//         if (frm.doc.stone_details) {
//             frm.doc.stone_details.forEach((row, index) => {
//                 console.log(`Checking row ${index}: duplicate_flag = ${row.duplicate_flag}`);
                
//                 if (row.duplicate_flag == 1) {
//                     console.log(`Row ${index} is duplicate, finding grid element...`);
                    
//                     // Try multiple ways to find the grid row
//                     let $gridRow = $gridRows.eq(index);
                    
//                     if ($gridRow.length === 0) {
//                         // Try by docname
//                         let gridRowObj = grid.grid_rows_by_docname[row.name];
//                         if (gridRowObj && gridRowObj.row) {
//                             $gridRow = $(gridRowObj.row);
//                         }
//                     }
                    
//                     if ($gridRow.length > 0) {
//                         console.log(`Highlighting duplicate row ${index}: ${row.stone_name || row.range}`);
                        
//                         // Apply highlighting
//                         $gridRow.addClass('row-duplicate');
//                         $gridRow.css({
//                             'background-color': '#ffebee',
//                             'border-left': '5px solid #f44336'
//                         });
                        
//                         // Add warning badge
//                         if (!$gridRow.find('.duplicate-badge').length) {
//                             let $badge = $('<span class="duplicate-badge" title="This row has duplicate data">⚠️ DUPLICATE</span>');
//                             $badge.css({
//                                 'background': '#f44336',
//                                 'color': 'white',
//                                 'padding': '2px 6px',
//                                 'border-radius': '12px',
//                                 'font-size': '10px',
//                                 'margin-left': '8px'
//                             });
//                             $gridRow.find('.grid-row-index, .row-index').first().append($badge);
//                         }
                        
//                         console.log('Highlighting applied successfully');
//                     } else {
//                         console.log(`Could not find grid element for row ${index}`);
//                     }
//                 }
//             });
//         }
//     }, 200);
// }

// CSS injection for duplicate row highlighting
// if (!document.getElementById('size-list-duplicate-styles')) {
//     let style = document.createElement('style');
//     style.id = 'size-list-duplicate-styles';
//     style.innerHTML = `
//         .row-duplicate { 
//             background: linear-gradient(90deg, #ffebee 0%, #fce4ec 100%) !important; 
//             border-left: 5px solid #f44336 !important;
//             box-shadow: 0 2px 4px rgba(244, 67, 54, 0.2) !important;
//         }
//         .duplicate-badge { 
//             margin-left: 8px; 
//             font-size: 11px; 
//             color: #ffffff; 
//             background: #f44336; 
//             padding: 2px 6px; 
//             border-radius: 12px; 
//             font-weight: 600;
//             text-shadow: none;
//         }
//         .row-duplicate .grid-row-check {
//             background: #ffcdd2 !important;
//         }
//     `;
//     document.head.appendChild(style);
// }