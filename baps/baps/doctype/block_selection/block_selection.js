// Copyright (c) 2025, Dharmesh Rathod and contributors
// For license information, please see license.txt

// ---------------- Block Selection Detail ----------------
frappe.ui.form.on("Block Selection Detail", {
    l1: calculate_volume,
    l2: calculate_volume,
    b1: calculate_volume,
    b2: calculate_volume,
    h1: calculate_volume,
    h2: calculate_volume
});

// ---------------- Block Selection ----------------
frappe.ui.form.on("Block Selection", {
    block_selection_details_remove: function(frm) {
        update_total_volume(frm);
    }
});

// ---------------- Functions ----------------
function calculate_volume(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
    let l = (row.l1 || 0) + (row.l2 || 0);
    let b = (row.b1 || 0) + (row.b2 || 0);
    let h = (row.h1 || 0) + (row.h2 || 0);

    let volume = (l / 12) * (b / 12) * (h / 12); // convert inches to feet (12)
    frappe.model.set_value(cdt, cdn, "volume", parseFloat(volume.toFixed(4)));

    update_total_volume(frm);
}

function update_total_volume(frm) {
    let total = 0;
    (frm.doc.block_selection_details || []).forEach(row => {
        total += flt(row.volume);
    });
    // frm.set_value("volume", parseFloat(total.toFixed(4)));
}
