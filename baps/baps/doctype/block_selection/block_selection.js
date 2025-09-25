// Copyright (c) 2025, Dharmesh Rathod and contributors
// For license information, please see license.txt

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
                        // frm.set_value('region', r.message.region);
                        // frm.set_value('site', r.message.site);
                        // frm.set_value('main_part', r.message.main_part);
                        // frm.set_value('sub_part', r.message.sub_part);
                    }
                }
            });
        }
    }
});

//==================================================
// 2. Auto-calculate Volume (Feet + Inches → Cubic Feet)
//==================================================
frappe.ui.form.on('Block Selection Detail', {
    l1: calculate_volume,
    l2: calculate_volume,
    b1: calculate_volume,
    b2: calculate_volume,
    h1: calculate_volume,
    h2: calculate_volume,
    block_selection_details_remove: function(frm) {
        // Optional: trigger recalc of parent total if you add one later
    }
});

function calculate_volume(frm, cdt, cdn) {
    let row = locals[cdt][cdn];

    // Validate inches
    if ((row.l2 || 0) > 12 || (row.b2 || 0) > 12 || (row.h2 || 0) > 12) {
        frappe.msgprint(__("Inches (l2, b2, h2) must be less than 12"));
        return;
    }

    // Convert feet + inches → total feet
    let L = (flt(row.l1) || 0) + ((flt(row.l2) || 0) / 12.0);
    let B = (flt(row.b1) || 0) + ((flt(row.b2) || 0) / 12.0);
    let H = (flt(row.h1) || 0) + ((flt(row.h2) || 0) / 12.0);

    let vol = 0.0;
    if (L > 0 && B > 0 && H > 0) {
        vol = parseFloat((L * B * H).toFixed(3));
    }

    frappe.model.set_value(cdt, cdn, 'volume', vol);
    frm.refresh_field('block_selection_details');
}

//==================================================
// 3. Auto-set Selected By (User)
//==================================================
frappe.ui.form.on("Block Selection", {
    onload: function(frm) {
        if (!frm.doc.selected_by) {
            frm.set_value("selected_by", frappe.session.user);
        }
    }
});

//==================================================
// 4. BLOCK NUMBER AUTO GENERATION — YOUR LOGIC
//==================================================

// ► Generate Project Code: First 2 initials (first letter of each word, or from first word)
function get_project_code(project_name) {
    if (!project_name) return "XX";
    let text = project_name.trim();
    let initials = "";
    let words = text.split(/\s+/);

    // Take first letter of each word until we have 2 letters
    for (let word of words) {
        if (initials.length >= 2) break;
        if (word.length > 0) {
            initials += word[0].toUpperCase();
        }
    }

    // If still less than 2, take from first word’s letters
    if (initials.length < 2 && words[0]) {
        for (let i = 0; i < words[0].length && initials.length < 2; i++) {
            initials += words[0][i].toUpperCase();
        }
    }

    // Pad with 'X' if still not 2
    while (initials.length < 2) {
        initials += "X";
    }

    return initials.substring(0, 2);
}

// ► Generate Trade Partner Code: First 3 initials (first letter of each word)
function get_partner_code(trade_partner) {
    if (!trade_partner) return "XXX";
    let text = trade_partner.trim();
    let initials = "";
    let words = text.split(/\s+/);

    // Take first letter of each word until we have 3 letters
    for (let word of words) {
        if (initials.length >= 3) break;
        if (word.length > 0) {
            initials += word[0].toUpperCase();
        }
    }

    // If still less than 3, take from first word’s letters
    if (initials.length < 3 && words[0]) {
        for (let i = 0; i < words[0].length && initials.length < 3; i++) {
            initials += words[0][i].toUpperCase();
        }
    }

    // Pad with 'X' if still not 3
    while (initials.length < 3) {
        initials += "X";
    }

    return initials.substring(0, 3);
}

// ► Generate block numbers for all child rows based on current project + trade partner
frappe.ui.form.on("Block Selection", {
    project_name: function(frm) {
        frm.trigger("update_block_numbers");
    },
    trade_partner: function(frm) {
        frm.trigger("update_block_numbers");
    },
    update_block_numbers: function(frm) {
        if (!frm.doc.project_name || !frm.doc.trade_partner) return;

        let project = get_project_code(frm.doc.project_name);
        let partner = get_partner_code(frm.doc.trade_partner);
        let prefix = project + partner;

        let max_seq = 0;

        // Find highest existing sequence number for this prefix
        (frm.doc.block_selection_details || []).forEach(row => {
            if (row.block_number && row.block_number.startsWith(prefix)) {
                let numPart = row.block_number.slice(-4);
                let num = parseInt(numPart);
                if (!isNaN(num) && num > max_seq) {
                    max_seq = num;
                }
            }
        });

        // Assign new block numbers only to rows that don’t match current prefix
        (frm.doc.block_selection_details || []).forEach(row => {
            let local_row = locals[row.doctype][row.name];

            // Skip if already has correct prefix
            if (local_row.block_number && local_row.block_number.startsWith(prefix)) {
                return;
            }

            max_seq += 1;
            let new_num = String(max_seq).padStart(4, "0");
            frappe.model.set_value(row.doctype, row.name, "block_number", prefix + new_num);
        });

        frm.refresh_field('block_selection_details');
    }
});

// ► Trigger on row add (if project & partner already set)
frappe.ui.form.on("Block Selection Detail", {
    block_selection_details_add: function(frm, cdt, cdn) {
        setTimeout(() => {
            if (frm.doc.project_name && frm.doc.trade_partner) {
                frm.trigger("update_block_numbers");
            }
        }, 500);
    }
});

//==================================================
// 5. Track Last Block Number in Parent Field
//==================================================
// frappe.ui.form.on("Block Selection Detail", {
//     block_selection_details_add: function(frm) {
//         setTimeout(() => frm.trigger("update_last_block_number"), 500);
//     },
//     block_selection_details_remove: function(frm) {
//         frm.trigger("update_last_block_number");
//     }
// });

// frappe.ui.form.on("Block Selection", {
//     update_last_block_number: function(frm) {
//         let last_block = '';
//         let rows = [];

//         $.each(frm.doc.block_selection_details || [], function(i, row) {
//             let local_row = locals[row.doctype][row.name];
//             if (local_row && local_row.block_number) {
//                 rows.push(local_row);
//             }
//         });

//         if (rows.length > 0) {
//             last_block = rows[rows.length - 1].block_number;
//         }

//         frm.set_value('last_block_number', last_block);
//         frm.refresh_field('last_block_number');
//     }
// });

//==================================================
// 6. Initial Trigger on Form Load/Refresh
//==================================================
frappe.ui.form.on("Block Selection", {
    refresh: function(frm) {
        frm.trigger("update_block_numbers");
        frm.trigger("update_last_block_number");
    }
});

frappe.ui.form.on("Block Selection", {
    last_block_number: function (frm) {
        if (frm.doc.block_selection_details && frm.doc.block_selection_details.length > 0) {
            // get last row from child table
            let last_row = frm.doc.block_selection_details[frm.doc.block_selection_details.length - 1];
            
            // frappe.msgprint({
            //     title: __("Last Block Number"),
            //     indicator: "blue",
            //     message: __("The last Block Number is: <b>{0}</b>", [last_row.block_number || "Not Set"])
            // });

            // if you also want to update the hidden field
            frm.set_value("last_blocknumber", last_row.block_number);
        } else {
            frappe.msgprint({
                title: __("No Blocks Found"),
                indicator: "red",
                message: __("No Block Selection Detail has been added yet.")
            });
        }
    }
});

frappe.ui.form.on("Block Selection", {
    refresh(frm) {
        // run on load/refresh
        frm.trigger("set_field_permissions");
    },

    after_save(frm) {
        // after saving, lock fields
        frm.trigger("set_field_permissions");
    },

    set_field_permissions(frm) {
        // check if there is at least 1 child row
        if (frm.doc.block_selection_details && frm.doc.block_selection_details.length > 0) {
            // Fields that remain editable
            let allowed_fields = ["trade_partner_site", "party", "date"];

            // Loop through all fields
            frm.fields_dict && Object.keys(frm.fields_dict).forEach(fieldname => {
                if (!allowed_fields.includes(fieldname)) {
                    frm.set_df_property(fieldname, "read_only", 1);
                }
            });

            // Special case for "party"
            if (frm.doc.status === "Paid") {
                frm.set_df_property("party", "read_only", 1);
            } else {
                frm.set_df_property("party", "read_only", 0);
            }
        }
    }
});


frappe.ui.form.on("Block Selection", {
    invoice_after_receipt: function(frm) {
        if (frm.doc.invoice_after_receipt) {
            frappe.msgprint({
                title: __("Notice"),
                message: __("This would be handled after payment method."),
                indicator: "orange"
            });
        }
    }
});
