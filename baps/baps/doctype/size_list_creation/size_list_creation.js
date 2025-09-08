// Copyright (c) 2025, Dharmesh Rathod and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Size List Creation", {
// 	refresh(frm) {

// 	},
// });

    

frappe.ui.form.on('Size List Details', {
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
    stone_details_remove: function(frm) {
        update_total_volume(frm);
    }
});

function calculate_volume(frm, cdt, cdn) {
    let row = locals[cdt][cdn];

    // Convert feet+inches → inches
    let L = ((row.l1 || 0) * 12) + (row.l2 || 0);
    let B = ((row.b1 || 0) * 12) + (row.b2 || 0);
    let H = ((row.h1 || 0) * 12) + (row.h2 || 0);

    // Volume in cubic feet
    row.volume = ((L * B * H) / 1728).toFixed(2);

    frm.refresh_field("stone_details");
    update_total_volume(frm);
}

function update_total_volume(frm) {
    let total = 0;
    (frm.doc.stone_details || []).forEach(row => {
        total += flt(row.volume);
    });
    frm.set_value("total_volume", total.toFixed(2));
}