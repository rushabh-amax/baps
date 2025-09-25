
frappe.ui.form.on('Transportation Sender', {
    refresh: function (frm) {
        // Apply Gate Pass No filter on refresh
        apply_gate_pass_no_filter(frm);
    },

    gate_pass_bookno: function(frm) {
        frm.set_value("gate_pass_no", "");
        apply_gate_pass_no_filter(frm);

        if (frm.doc.gate_pass_no) {
            validate_gate_pass_belongs_to_book(frm);
        }
    },

    show_items: function (frm) {
        show_items_dialog(frm);
    }
});

// --- Gate Pass Filter Helpers (Copied from gate_pass_bookno.js for modularity) ---
function apply_gate_pass_no_filter(frm) {
    if (frm.doc.gate_pass_bookno) {
        frm.set_query("gate_pass_no", function() {
            return {
                filters: {
                    gate_pass_book_no: frm.doc.gate_pass_bookno
                }
            };
        });
    } else {
        frm.set_query("gate_pass_no", function() {
            return { query: "frappe.desk.search.search_link" };
        });
    }
}

function validate_gate_pass_belongs_to_book(frm) {
    frappe.db.get_value("Gate Pass No", frm.doc.gate_pass_no, "gate_pass_book_no", function(r) {
        if (r && r.gate_pass_book_no !== frm.doc.gate_pass_bookno) {
            frm.set_value("gate_pass_no", null);
            frappe.msgprint(__("Selected Gate Pass No doesn't belong to the chosen Book. Selection cleared."));
        }
    });
}
// --- End Gate Pass Filter Helpers ---

// --- Show Items Dialog (Your Original Code) ---
function show_items_dialog(frm) {
    const d = new frappe.ui.Dialog({
        title: 'Select Blocks to Add',
        fields: [
            {
                label: 'Baps Project',
                fieldname: 'baps_project',
                fieldtype: 'Link',
                options: 'Baps Project',
                reqd: true,
                default: frm.doc.baps_project
            },
            {
                label: 'Material Type',
                fieldname: 'material_type',
                fieldtype: 'Link',
                options: 'Stone Type',
                reqd: true,
                default: frm.doc.material_type
            },
            {
                fieldtype: 'Section Break',
                label: 'Available Blocks'
            },
            {
                fieldname: 'block_items',
                fieldtype: 'HTML'
            }
        ],
        primary_action_label: 'Add Selected',
        primary_action: function () {
            const values = d.get_values();
            const selected_blocks = [];

            const checkedBoxes = document.querySelectorAll('input[data-block-checkbox="1"]:checked');
            checkedBoxes.forEach((cb) => {
                selected_blocks.push({
                    block_number: cb.dataset.block,
                    project: values.baps_project,
                    material_type: values.material_type
                });
            });

            if (selected_blocks.length === 0) {
                frappe.msgprint(__('Please select at least one block.'));
                return;
            }

            frappe.call({
                method: 'baps.baps.doctype.transportation_sender.transportation_sender.add_blocks_to_table',
                args: {
                    sender_name: frm.doc.name,
                    blocks: selected_blocks
                },
                callback: function (r) {
                    if (!r.exc) {
                        frappe.show_alert({
                            message: __('Blocks added successfully'),
                            indicator: 'green'
                        });
                        frm.reload_doc();
                        d.hide();
                    } else {
                        frappe.msgprint(__('Error adding blocks. Please try again.'));
                    }
                }
            });
        }
    });

    d.fields_dict.baps_project.df.onchange = d.fields_dict.material_type.df.onchange = () => {
        update_block_list(d, frm);
    };

    update_block_list(d, frm);
    d.show();
}

function update_block_list(dialog, frm) {
    const values = dialog.get_values();
    const project = values?.baps_project;

    if (!project) {
        dialog.fields_dict.block_items.$wrapper.html(
            '<p style="color: var(--text-color-light); font-style: italic;">Select a Baps Project to load blocks.</p>'
        );
        return;
    }

    frappe.call({
        method: 'baps.baps.doctype.transportation_sender.transportation_sender.get_blocks_for_project',
        args: {
            project: project
        },
        callback: function (r) {
            if (r.message && Array.isArray(r.message) && r.message.length > 0) {
                let html = `
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid #d1d8dd; border-radius: 5px; padding: 8px; background: #fafbfc;">
                        <p style="margin: 0 0 8px; font-weight: 500; color: var(--text-color);">Select blocks:</p>
                `;

                r.message.forEach(block => {
                    const blockNum = block.block_number || 'Unknown';
                    html += `
                        <div class="checkbox" style="margin: 4px 0;">
                            <label style="font-size: 14px; color: var(--text-color);">
                                <input type="checkbox" 
                                       data-block-checkbox="1" 
                                       data-block="${blockNum}" 
                                       style="margin-right: 6px;" />
                                ${blockNum}
                            </label>
                        </div>
                    `;
                });

                html += `</div>`;
                dialog.fields_dict.block_items.$wrapper.html(html);
            } else {
                dialog.fields_dict.block_items.$wrapper.html(
                    '<p style="color: #7d8588; font-style: italic;">No blocks found for this project.</p>'
                );
            }
        }
    });
}