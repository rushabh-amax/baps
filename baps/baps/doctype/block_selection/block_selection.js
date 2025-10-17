//==================================================
// 0. Prevent auto-add row on load
//==================================================
frappe.ui.form.on('Block Selection', {
    onload: function(frm) {
        if (frm.doc.block_selection_details && frm.doc.block_selection_details.length === 1) {
            if (!frm.doc.block_selection_details[0].block_number) {
                frm.clear_table("block_selection_details");
                // Frappe auto-refreshes; no refresh_field needed
            }
        }
    }
});

//==================================================
// 1. Auto-fill fields from Baps Project
//==================================================
frappe.ui.form.on("Block Selection", {
    baps_project: function(frm) {
        if (frm.doc.baps_project) {
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Baps Project",
                    name: frm.doc.baps_project
                },
                callback: function(r) {
                    if (r.message) {
                        // Example: frm.set_value('region', r.message.region);
                    }
                }
            });
        }
    }
});

//==================================================
// 2. Volume calculation (DEBOUNCED)
//==================================================
const volumeDebounceTimers = {};

frappe.ui.form.on('Block Selection Detail', {
    l1: function(frm, cdt, cdn) { debounceVolumeCalc(frm, cdt, cdn); },
    l2: function(frm, cdt, cdn) { debounceVolumeCalc(frm, cdt, cdn); },
    b1: function(frm, cdt, cdn) { debounceVolumeCalc(frm, cdt, cdn); },
    b2: function(frm, cdt, cdn) { debounceVolumeCalc(frm, cdt, cdn); },
    h1: function(frm, cdt, cdn) { debounceVolumeCalc(frm, cdt, cdn); },
    h2: function(frm, cdt, cdn) { debounceVolumeCalc(frm, cdt, cdn); },
});

function debounceVolumeCalc(frm, cdt, cdn) {
    const key = cdt + '_' + cdn;
    if (volumeDebounceTimers[key]) {
        clearTimeout(volumeDebounceTimers[key]);
    }
    volumeDebounceTimers[key] = setTimeout(() => {
        calculate_volume(frm, cdt, cdn);
        delete volumeDebounceTimers[key];
    }, 150);
}

function calculate_volume(frm, cdt, cdn) {
    let row = locals[cdt][cdn];

    let inch_fields = ['l2', 'b2', 'h2'];
    for (let f of inch_fields) {
        if ((row[f] || 0) > 12) {
            // ✅ Use show_alert — does NOT close popup
            frappe.show_alert({
                message: __(f.toUpperCase() + ' must be ≤ 12 inches'),
                indicator: 'red'
            }, 5); // auto-dismiss after 5 seconds

            // ✅ Reset field to 0
            frappe.model.set_value(cdt, cdn, f, 0);

            // ✅ Optional: Focus back to field
            setTimeout(() => {
                if (frm.fields_dict[f]) {
                    frm.fields_dict[f].set_focus();
                }
            }, 300);

            return; // Skip volume calc
        }
    }

    // Proceed with volume calculation
    let L = (flt(row.l1) || 0) + ((flt(row.l2) || 0) / 12.0);
    let B = (flt(row.b1) || 0) + ((flt(row.b2) || 0) / 12.0);
    let H = (flt(row.h1) || 0) + ((flt(row.h2) || 0) / 12.0);

    let vol = 0.0;
    if (L > 0 && B > 0 && H > 0) {
        vol = parseFloat((L * B * H).toFixed(3));
    }

    frappe.model.set_value(cdt, cdn, 'volume', vol);
}

//==================================================
// 3. Block Number Logic
//==================================================
function get_project_code(project_name) {
    if (!project_name) return "XX";
    let text = project_name.trim();
    let initials = "";
    let words = text.split(/\s+/);

    for (let word of words) {
        if (initials.length >= 2) break;
        if (word.length > 0) {
            initials += word[0].toUpperCase();
        }
    }

    if (initials.length < 2 && words[0]) {
        for (let i = 0; i < words[0].length && initials.length < 2; i++) {
            initials += words[0][i].toUpperCase();
        }
    }

    while (initials.length < 2) {
        initials += "X";
    }

    return initials.substring(0, 2);
}

function get_partner_code(trade_partner) {
    if (!trade_partner) return "XXX";
    let text = trade_partner.trim();
    let initials = "";
    let words = text.split(/\s+/);

    for (let word of words) {
        if (initials.length >= 3) break;
        if (word.length > 0) {
            initials += word[0].toUpperCase();
        }
    }

    if (initials.length < 3 && words[0]) {
        for (let i = 0; i < words[0].length && initials.length < 3; i++) {
            initials += words[0][i].toUpperCase();
        }
    }

    while (initials.length < 3) {
        initials += "X";
    }

    return initials.substring(0, 3);
}

frappe.ui.form.on("Block Selection", {
    project_name: function(frm) {
        frm.trigger("update_block_numbers");
    },
    trade_partner: function(frm) {
        frm.trigger("update_block_numbers");
    },
    update_block_numbers: function(frm) {
        if (!frm.doc.project_name || !frm.doc.trade_partner) return;

        let prefix = get_project_code(frm.doc.project_name) + get_partner_code(frm.doc.trade_partner);
        let max_num = 0;

        (frm.doc.block_selection_details || []).forEach(row => {
            if (row.block_number && row.block_number.startsWith(prefix)) {
                let numPart = row.block_number.replace(prefix, "");
                let n = parseInt(numPart);
                if (!isNaN(n) && n > max_num) max_num = n;
            }
        });

        frm.last_block_no = max_num;
    }
});

//==================================================
// 4. Auto-number new child rows manually
//==================================================
frappe.ui.form.on('Block Selection Detail', {
    block_selection_details_add: function(frm, cdt, cdn) {
        if (!frm.doc.project_name || !frm.doc.trade_partner) return;

        let prefix = get_project_code(frm.doc.project_name) + get_partner_code(frm.doc.trade_partner);
        let next_num = (frm.last_block_no || 0) + 1;

        frappe.model.set_value(cdt, cdn, 'block_number', prefix + String(next_num).padStart(4, "0"));
        frm.last_block_no = next_num;
        // NO refresh_field — Frappe updates UI automatically
    }
});

//==================================================
// 5. Site Filter
//==================================================
frappe.ui.form.on("Block Selection", {
    trade_partner: function(frm) {
        frm.set_value("site", "");
        frm.fields_dict.site.get_query = null;
        if (frm.doc.trade_partner) {
            frm.set_query("site", function() {
                return { filters: { trade_partner: frm.doc.trade_partner } };
            });
        }
    }
});

//==================================================
// 6. Last block number popup
//==================================================
frappe.ui.form.on('Block Selection', {
    last_block_number: function(frm) {
        if (!frm.doc.project_name || !frm.doc.trade_partner) {
            frappe.msgprint({ title: _('Missing Info'), message: _('Fill Trade Partner & Project first'), indicator: 'orange' });
            return;
        }

        frappe.call({
            method: 'baps.baps.doctype.block_selection.block_selection.get_last_block_number',
            args: {
                trade_partner: frm.doc.trade_partner,
                project_name: frm.doc.project_name,
                current_docname: frm.doc.name
            },
            callback: function(r) {
                if (r.message) {
                    frappe.msgprint({
                        title: __('Last Block Number'),
                        message: __('Last block number: <b>{0}</b>', [r.message]),
                        indicator: 'green'
                    });
                    frm.last_block_no = parseInt(r.message.replace(/[^\d]/g, "")) || 0;
                } else {
                    frappe.msgprint({
                        title: __('No Previous Blocks'),
                        message: __('No previous blocks found'),
                        indicator: 'blue'
                    });
                    frm.last_block_no = 0;
                }
            }
        });
    }
});

//==================================================
// 9. Header fields lock after saving or when child rows exist
//==================================================
let headerLockState = { has_rows: false, is_saved: false };

frappe.ui.form.on('Block Selection', {
    refresh: function(frm) { toggle_header_fields(frm); },
    after_save: function(frm) {
        toggle_header_fields(frm);
        frappe.msgprint({ message: __('Header fields are now locked.'), indicator: 'blue' });
    },
    block_selection_details_add: function(frm) { toggle_header_fields(frm); },
    block_selection_details_remove: function(frm) { toggle_header_fields(frm); }
});

function toggle_header_fields(frm) {
    const has_rows = (frm.doc.block_selection_details || []).length > 0;
    const is_saved = !frm.is_new();

    if (headerLockState.has_rows === has_rows && headerLockState.is_saved === is_saved) {
        return; // Skip redundant updates
    }
    headerLockState.has_rows = has_rows;
    headerLockState.is_saved = is_saved;

    const permanently_locked = ['trade_partner', 'site', 'baps_project', 'material_type'];
    const conditional_locked = ['date', 'party', 'invoice_to_be_paid_after_block_receipt', 'selected_by'];

    permanently_locked.forEach(fieldname => {
        if (frm.fields_dict[fieldname]) {
            frm.set_df_property(fieldname, 'read_only', is_saved);
        }
    });

    const lock_fields = has_rows || is_saved;
    conditional_locked.forEach(fieldname => {
        if (frm.fields_dict[fieldname]) {
            frm.set_df_property(fieldname, 'read_only', lock_fields);
        }
    });

    if (frm.fields_dict['party']) {
        frm.set_df_property('party', 'read_only', 0);
    }
}

//==================================================
// Auto-set Selected By (User)
//==================================================
frappe.ui.form.on("Block Selection", {
    onload: function(frm) {
        if (!frm.doc.selected_by) {
            frm.set_value("selected_by", frappe.session.user);
        }
    }
});

//==================================================
// Invoice after receipt
//==================================================
frappe.ui.form.on('Block Selection', {
    invoice_after_receipt: function(frm) {
        if (frm.doc.invoice_after_receipt) {
            frappe.msgprint({
                title: __("Notice"),
                message: __("This will be handled after payment method."),
                indicator: "orange"
            });
        }
    }
});

//==================================================
// Party filter
//==================================================
frappe.ui.form.on('Block Selection', {
    trade_partner: function(frm) {
        frm.set_value('party', '');
        if (frm.doc.trade_partner) {
            frm.set_query('party', function() {
                return { filters: { trade_partner: frm.doc.trade_partner } };
            });
        }
    }
});