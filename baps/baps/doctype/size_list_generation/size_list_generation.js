// Copyright (c) 2025, Amax Consultancy Pvt Ltd and contributors
// For license information, please see license.txt

// Copyright (c) 2025, Amax Consultancy Pvt Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on("Size List Generation", {
    onload: function(frm) {
        // Auto-set checked_by to current user if not already set
        if (!frm.doc.checked_by && frappe.session.user) {
            frm.set_value('checked_by', frappe.session.user);
        }
    },
    
    refresh: function(frm) {
        // Auto-set checked_by to current user if not already set
        if (!frm.doc.checked_by && frappe.session.user) {
            frm.set_value('checked_by', frappe.session.user);
        }
        
        // Set query filter for form_number field to show only verification documents with verified stones
        frm.set_query("form_number", function() {
            return {
                query: "baps.baps.doctype.size_list_generation.size_list_generation.query_verification_documents_with_verified_stones"
            };
        });
        
        // Auto-load verified stones if form_number exists but no stones are loaded
        if (frm.doc.form_number && (!frm.doc.stone_details || frm.doc.stone_details.length === 0)) {
            setTimeout(function() {
                load_verified_stones_manually(frm);
            }, 500);
        }
        
        // Add load button for manual loading
        // if (frm.doc.form_number) {
        //     frm.add_custom_button(__('Load Verified Stones'), function() {
        //         load_verified_stones_manually(frm);
        //     });
        // }
        
        // Add publish button if stones are loaded
        if (frm.doc.stone_details && frm.doc.stone_details.length > 0) {
            frm.add_custom_button(__('Publish to Size List Creation'), function() {
                publish_selected_stones(frm);
            }).addClass('btn-primary');
        }
    },

    form_number: function(frm) {
        if (!frm.doc.form_number) {
            frm.clear_table('stone_details');
            frm.refresh_field('stone_details');
            return;
        }

        // Show loading indicator
        frappe.show_alert({
            message: __('Loading verified stones from {0}...', [frm.doc.form_number]),
            indicator: 'blue'
        });

        // Auto-load verified stones when form_number is selected
        frappe.call({
            method: "baps.baps.doctype.size_list_generation.size_list_generation.get_verified_stones_from_verification",
            args: {
                verification_name: frm.doc.form_number
            },
            callback: function(r) {
                console.log('Response from get_verified_stones_from_verification:', r);
                
                if (r && r.message && r.message.success) {
                    auto_fill_from_verification(frm, r.message.data);
                    
                    frappe.show_alert({
                        message: __(r.message.message || 'Verified stones loaded successfully'),
                        indicator: 'green'
                    });
                    
                    // Refresh the form to show updated button
                    frm.refresh();
                } else {
                    let error_msg = r.message && r.message.message ? r.message.message : 'No verified stones found';
                    
                    frappe.msgprint({
                        title: __('No Verified Stones'),
                        message: __(error_msg),
                        indicator: 'orange'
                    });
                    
                    // Clear table if no verified stones found
                    frm.clear_table('stone_details');
                    frm.refresh_field('stone_details');
                }
            },
            error: function(err) {
                console.error('Error loading verified stones:', err);
                frappe.show_alert({
                    message: __('Error loading verified stones. Check console for details.'),
                    indicator: 'red'
                });
            }
        });
    },
    
    before_save: function(frm) {
        // Ensure checked_by is always set before saving
        if (!frm.doc.checked_by && frappe.session.user) {
            frm.set_value('checked_by', frappe.session.user);
        }
    }
});

// Function to load only verified stones from Size List Verification
function load_verified_stones_from_verification(frm) {
    if (!frm.doc.form_number) {
        frappe.msgprint({
            title: __('Verification Document Required'),
            message: __('Please select a Size List Verification document to load verified stones.'),
            indicator: 'orange'
        });
        return;
    }

    frappe.call({
        method: "baps.baps.doctype.size_list_verification.size_list_verification.get_verified_stones_for_generation",
        args: {
            form_number: frm.doc.form_number
        },
        callback: function(r) {
            
            if (r && r.message && r.message.success) {
                // Fill main form fields
                populate_generation_form(frm, r.message.data);
            } else {
                let error_message = r.message && r.message.message ? r.message.message : 'No verified stones available for generation.';
                frappe.msgprint({
                    title: __('No Verified Stones Found'),
                    message: __(error_message),
                    indicator: 'orange'
                });
            }
        },
        error: function(err) {
            frappe.msgprint({
                title: __('Error'),
                message: __('Failed to load verified stones. Please try again.'),
                indicator: 'red'
            });
            console.error("Error loading verified stones:", err);
        }
    });
}

// Function to auto-fill form from Size List Verification data
function auto_fill_from_verification(frm, verification_data) {
    console.log('Auto-filling from verification data:', verification_data);
    
    // Map fields from verification to generation
    const field_map = {
        'prep_date': 'prep_date',
        'material_type': 'material_type', 
        'baps_project': 'baps_project',
        'project_name': 'project_name',
        'main_part': 'main_part',
        'sub_part': 'sub_part',
        'cutting_region': 'cutting_region',
        'polishing_required': 'polishing_required',
        'dry_fitting_required': 'dry_fitting_required',
        'carving_required': 'carving_required',
        'chemical_required': 'chemical_required',
        'approved_date': 'approved_date',
        'checked_by': 'checked_by',
        'data_tilw': 'data_tilw'
    };

    // Fill main form fields from verification document
    $.each(field_map, function(target, source) {
        if (verification_data[source] !== undefined && verification_data[source] !== null) {
            console.log(`Setting ${target} = ${verification_data[source]}`);
            frm.set_value(target, verification_data[source]);
        }
    });

    // Clear and populate child table with verified stones
    frm.clear_table('stone_details');
    
    console.log('Stone details from verification:', verification_data.stone_details);
    
    if (verification_data.stone_details && verification_data.stone_details.length > 0) {
        console.log(`Adding ${verification_data.stone_details.length} verified stones to table`);
        
        verification_data.stone_details.forEach(function(stone, index) {
            console.log(`Adding stone ${index + 1}:`, stone);
            let row = frm.add_child('stone_details');
            
            // Map all stone fields
            row.stone_name = stone.stone_name;
            row.stone_code = stone.stone_code;
            row.range = stone.range;
            row.l1 = stone.l1;
            row.l2 = stone.l2;
            row.b1 = stone.b1;
            row.b2 = stone.b2;
            row.h1 = stone.h1;
            row.h2 = stone.h2;
            row.volume = stone.volume;
            row.weight = stone.weight;
            row.ctw = stone.ctw;
            row.pcs = stone.pcs;
        });
        
        frm.refresh_field('stone_details');
        console.log('Stone details table updated successfully');
    } else {
        console.log('No verified stones found in verification data');
        frappe.show_alert({
            message: __('No verified stones found to load'),
            indicator: 'orange'
        });
    }
}

// Function to populate the generation form with Size List data (legacy function - keeping for compatibility)
function populate_generation_form(frm, size_list_data) {
    // Map main fields
    const field_map = {
        'prep_date': 'prep_date',
        'material_type': 'stone_type', 
        'baps_project': 'baps_project',
        'project_name': 'project_name',
        'main_part': 'main_part',
        'sub_part': 'sub_part',
        'cutting_region': 'cutting_region',
        'polishing_required': 'polishing',
        'dry_fitting_required': 'dry_fitting',
        'carving_required': 'carving',
        'chemical_required': 'chemical',
        'approved_date': 'approved_date',
        'checked_by': 'checked_by'
    };

    // Fill main form fields
    $.each(field_map, function(target, source) {
        if (size_list_data[source] !== undefined) {
            frm.set_value(target, size_list_data[source]);
        }
    });

    // Clear and populate child table with only verified stones
    frm.clear_table('stone_details');
    
    if (size_list_data.stone_details && size_list_data.stone_details.length > 0) {
        size_list_data.stone_details.forEach(function(stone) {
            let row = frm.add_child('stone_details');
            row.stone_name = stone.stone_name;
            row.stone_code = stone.stone_code;
            row.range = stone.range;
            row.l1 = stone.l1;
            row.l2 = stone.l2;
            row.b1 = stone.b1;
            row.b2 = stone.b2;
            row.h1 = stone.h1;
            row.h2 = stone.h2;
            row.volume = stone.volume;
        });
        
        frm.refresh_field('stone_details');
    }
}

// Function to show generation summary
function show_generation_summary(frm) {
    let total_stones = frm.doc.stone_details ? frm.doc.stone_details.length : 0;
    let total_volume = 0;
    
    if (frm.doc.stone_details) {
        frm.doc.stone_details.forEach(function(stone) {
            total_volume += (stone.volume || 0);
        });
    }
    
    let summary_html = `
        <div class="generation-summary">
            <h4>📋 Generation Summary</h4>
            <div class="row">
                <div class="col-sm-6">
                    <div class="alert alert-info">
                        <strong>${total_stones}</strong><br>Verified Stones Ready
                    </div>
                </div>
                <div class="col-sm-6">
                    <div class="alert alert-primary">
                        <strong>${total_volume.toFixed(2)} CFT</strong><br>Total Volume
                    </div>
                </div>
            </div>
            <div class="alert alert-success">
                <strong>Status:</strong> Ready for generation with ${total_stones} verified stones
            </div>
        </div>
    `;
    
    frappe.msgprint({
        title: __('Generation Summary'),
        message: summary_html,
        indicator: 'blue'
    });
}

// Debug function to check verification data
function debug_verification_data(frm) {
    if (!frm.doc.form_number) {
        frappe.msgprint('Please select a verification document to debug');
        return;
    }
    
    frappe.call({
        method: "baps.baps.doctype.size_list_verification.size_list_verification.debug_verification_stones",
        args: {
            form_number: frm.doc.form_number
        },
        callback: function(r) {
            console.log("Debug response:", r);
            
            let debug_html = '<h4>Debug Information</h4>';
            if (r.message.error) {
                debug_html += `<div class="alert alert-danger">Error: ${r.message.error}</div>`;
            } else {
                debug_html += `
                    <p><strong>Document:</strong> ${r.message.doc_name}</p>
                    <p><strong>Form Number:</strong> ${r.message.form_number}</p>
                    <p><strong>Stone Details Count:</strong> ${r.message.stone_details_count}</p>
                    <h5>Stones Details:</h5>
                `;
                
                if (r.message.stones && r.message.stones.length > 0) {
                    debug_html += '<table class="table table-bordered"><thead><tr><th>Name</th><th>Stone Name</th><th>Stone Code</th><th>Verified Value</th><th>Verified Type</th></tr></thead><tbody>';
                    r.message.stones.forEach(stone => {
                        debug_html += `<tr>
                            <td>${stone.name}</td>
                            <td>${stone.stone_name}</td>
                            <td>${stone.stone_code}</td>
                            <td><strong>${stone.verified}</strong></td>
                            <td>${stone.verified_type}</td>
                        </tr>`;
                    });
                    debug_html += '</tbody></table>';
                } else {
                    debug_html += '<p>No stones found</p>';
                }
            }
            
            frappe.msgprint({
                title: 'Debug Verification Data',
                message: debug_html,
                indicator: 'blue'
            });
        }
    });
}

// Function to show available verification documents
function show_available_verifications(frm) {
    frappe.call({
        method: "baps.baps.doctype.size_list_generation.size_list_generation.get_verification_documents_with_status",
        callback: function(r) {
            if (r.message && r.message.success) {
                let verifications = r.message.data;
                
                if (verifications.length === 0) {
                    frappe.msgprint({
                        title: __('No Verifications Available'),
                        message: __('No Size List Verification documents with verified stones found. Please create and verify stones in Size List Verification first.'),
                        indicator: 'orange'
                    });
                    return;
                }
                
                let html = `
                    <div class="available-verifications">
                        <h4>📋 Available Size List Verifications</h4>
                        <p class="text-muted">Click on any verification document to select it:</p>
                        <div class="table-responsive">
                            <table class="table table-bordered table-hover">
                                <thead>
                                    <tr>
                                        <th>Verification Document</th>
                                        <th>Form Number</th>
                                        <th>Project</th>
                                        <th>Material Type</th>
                                        <th>Verified Stones</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;
                
                verifications.forEach(function(doc) {
                    let verified_percentage = ((doc.verified_stones / doc.total_stones) * 100).toFixed(0);
                    let status_color = verified_percentage == 100 ? 'success' : 'warning';
                    
                    html += `
                        <tr>
                            <td><strong>${doc.name}</strong></td>
                            <td>${doc.form_number || 'N/A'}</td>
                            <td>${doc.project_name || 'N/A'}</td>
                            <td>${doc.material_type || 'N/A'}</td>
                            <td>
                                <span class="badge badge-${status_color}">
                                    ${doc.verified_stones}/${doc.total_stones} (${verified_percentage}%)
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary select-verification" 
                                        data-docname="${doc.name}">
                                    Select
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                html += `
                                </tbody>
                            </table>
                        </div>
                        <div class="alert alert-info mt-3">
                            <strong>💡 Tip:</strong> Only documents with at least one verified stone are shown.
                        </div>
                    </div>
                `;
                
                let dialog = frappe.msgprint({
                    title: __('Available Verification Documents'),
                    message: html,
                    indicator: 'blue'
                });
                
                // Add click handlers for select buttons
                setTimeout(function() {
                    $('.select-verification').click(function() {
                        let docname = $(this).data('docname');
                        frm.set_value('form_number', docname);
                        dialog.hide();
                        frappe.show_alert({
                            message: __('Selected: {0}', [docname]),
                            indicator: 'green'
                        });
                    });
                }, 500);
                
            } else {
                frappe.msgprint({
                    title: __('Error'),
                    message: __('Failed to load verification documents.'),
                    indicator: 'red'
                });
            }
        }
    });
}

// Function to manually load verified stones (called by primary button)
function load_verified_stones_manually(frm) {
    if (!frm.doc.form_number) {
        frappe.msgprint({
            title: __('Form Number Required'),
            message: __('Please select a Size List Verification document first.'),
            indicator: 'orange'
        });
        return;
    }
    
    frappe.call({
        method: "baps.baps.doctype.size_list_generation.size_list_generation.get_verified_stones_from_verification",
        args: {
            verification_name: frm.doc.form_number
        },
        callback: function(r) {
            if (r && r.message && r.message.success) {
                auto_fill_from_verification(frm, r.message.data);
                frappe.show_alert({
                    message: __('Loaded {0} verified stones successfully', [r.message.verification_stats.verified_stones]),
                    indicator: 'green'
                });
            } else {
                frappe.msgprint({
                    title: __('No Verified Stones Found'),
                    message: __('No verified stones found in {0}', [frm.doc.form_number]),
                    indicator: 'orange'
                });
            }
        }
    });
}

// Function to publish selected stones to Size List Creation
function publish_selected_stones(frm) {
    // Force save the document first if it's dirty or new
    if (frm.is_dirty() || frm.is_new() || !frm.doc.name) {
        frappe.show_alert({
            message: __('Saving document before publishing...'),
            indicator: 'blue'
        });
        
        frm.save().then(function() {
            // After successful save, proceed with publishing
            show_stone_selection_dialog(frm);
        }).catch(function(error) {
            frappe.msgprint({
                title: __('Save Failed'),
                message: __('Failed to save the document. Please save manually before publishing: {0}', [error.message || 'Unknown error']),
                indicator: 'red'
            });
        });
        return;
    }

    // Additional check: ensure document name exists
    if (!frm.doc.name) {
        frappe.msgprint({
            title: __('Document Not Saved'),
            message: __('Please save the document first. The document name is required for publishing.'),
            indicator: 'orange'
        });
        return;
    }

    // Show stone selection dialog instead of trying to detect grid selection
    // This is more reliable and user-friendly
    show_stone_selection_dialog(frm);
}

// Function to show stone selection dialog when grid selection doesn't work
function show_stone_selection_dialog(frm) {
    if (!frm.doc.stone_details || frm.doc.stone_details.length === 0) {
        frappe.msgprint({
            title: __('No Verified Stones Available'),
            message: __('No verified stones available to publish. Please load verified stones from Size List Verification first using the Form Number field.'),
            indicator: 'orange'
        });
        return;
    }

    let html = `
        <div class="stone-selection-dialog">
            <div class="alert alert-info">
                <strong>📋 Publishing from Size List Generation:</strong> {0}
                <br><small>These are verified stones loaded from Size List Verification: {1}</small>
            </div>
            <p class="text-muted">Select the verified stones you want to publish to Size List Creation:</p>
            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th width="5%">
                                <input type="checkbox" id="select-all-stones" />
                            </th>
                            <th>Stone Name</th>
                            <th>Stone Code</th>
                            <th>Range</th>
                            <th>L1</th>
                            <th>L2</th>
                            <th>Volume</th>
                        </tr>
                    </thead>
                    <tbody>
    `.replace('{0}', frm.doc.name || 'Current Document').replace('{1}', frm.doc.form_number || 'N/A');

    frm.doc.stone_details.forEach(function(stone, index) {
        html += `
            <tr>
                <td>
                    <input type="checkbox" class="stone-checkbox" data-index="${index}" />
                </td>
                <td>${stone.stone_name || ''}</td>
                <td>${stone.stone_code || ''}</td>
                <td>${stone.range || ''}</td>
                <td>${stone.l1 || ''}</td>
                <td>${stone.l2 || ''}</td>
                <td>${stone.volume || ''}</td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
            <div class="alert alert-success mt-3">
                <strong>✅ Verified Stones:</strong> These stones have been verified from Size List Verification and are ready for publication to Size List Creation.
            </div>
            <div class="alert alert-warning">
                <strong>🔢 Range Expansion:</strong> Stones with ranges (e.g., "1-10") will be automatically expanded into individual records in Size List Creation.
                <br><small>Example: Range "1-10" will create 10 separate records with codes like FCBBH001, FCBBH002, ..., FCBBH010</small>
            </div>
            <div class="alert alert-info">
                <strong>💡 Tip:</strong> You can select multiple stones or use "Select All" checkbox. Only verified stones from this Generation document will be published.
            </div>
        </div>
    `;

    let dialog = new frappe.ui.Dialog({
        title: __('Select Stones to Publish'),
        fields: [
            {
                fieldtype: 'HTML',
                fieldname: 'stone_selection',
                options: html
            }
        ],
        primary_action_label: __('Publish Selected'),
        primary_action: function() {
            let selected_stones = [];
            $('.stone-checkbox:checked').each(function() {
                let index = parseInt($(this).data('index'));
                selected_stones.push(frm.doc.stone_details[index]);
            });

            if (selected_stones.length === 0) {
                frappe.show_alert({
                    message: __('Please select at least one stone'),
                    indicator: 'orange'
                });
                return;
            }

            dialog.hide();
            publish_stones_with_selection(frm, selected_stones);
        }
    });

    dialog.show();

    // Add select all functionality
    setTimeout(function() {
        $('#select-all-stones').change(function() {
            $('.stone-checkbox').prop('checked', $(this).is(':checked'));
        });
    }, 500);
}

// Function to publish stones with manual selection
function publish_stones_with_selection(frm, selected_stones) {
    // Confirm publication
    frappe.confirm(
        __('Publish {0} selected stone(s) to Size List Creation?', [selected_stones.length]),
        function() {
            // Show progress
            frappe.show_alert({
                message: __('Publishing {0} selected stones...', [selected_stones.length]),
                indicator: 'blue'
            });

            // Call server method to create Size List Creation document
            frappe.call({
                method: "baps.baps.doctype.size_list_generation.size_list_generation.publish_stones_to_creation",
                args: {
                    generation_doc: frm.doc.name,
                    selected_stones: selected_stones
                },
                callback: function(r) {
                    if (r && r.message && r.message.success) {
                        let expanded_count = r.message.stones_published || selected_stones.length;
                        frappe.msgprint({
                            title: __('Successfully Published'),
                            message: __('Created Size List Creation document: <a href="/app/size-list-creation/{0}" target="_blank">{0}</a><br><br>📊 <strong>Publication Summary:</strong><br>• Selected stones: {1}<br>• Expanded records: {2}<br>• Total volume: {3} CFT<br><br>🔢 <strong>Range Expansion:</strong> Stones with ranges were automatically expanded into individual records.', [
                                r.message.creation_doc, 
                                selected_stones.length,
                                expanded_count,
                                (r.message.total_volume || 0).toFixed(2)
                            ]),
                            indicator: 'green'
                        });

                        // Show option to open the created document
                        frappe.show_alert({
                            message: __('Size List Creation {0} created with {1} expanded records from {2} selected stones', [
                                r.message.creation_doc, 
                                expanded_count,
                                selected_stones.length
                            ]),
                            indicator: 'green'
                        });

                    } else {
                        let error_msg = r.message && r.message.message ? r.message.message : 'Failed to publish stones';
                        frappe.msgprint({
                            title: __('Publication Failed'),
                            message: __(error_msg),
                            indicator: 'red'
                        });
                    }
                },
                error: function(err) {
                    frappe.msgprint({
                        title: __('Error'),
                        message: __('Failed to publish stones. Please try again.'),
                        indicator: 'red'
                    });
                    console.error("Error publishing stones:", err);
                }
            });
        }
    );
}
