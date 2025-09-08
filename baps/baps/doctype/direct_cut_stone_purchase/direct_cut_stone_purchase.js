// Copyright (c) 2025, Dharmesh Rathod and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Direct Cut Stone Purchase", {
// 	refresh(frm) {

// 	},
// });
// Custom Script: Direct Cut Stone Purchase
// Parent Doctype: Direct Cut Stone Purchase
frappe.ui.form.on('Direct Cut Stone Purchase', {
    refresh(frm) {
        // Allow adding/removing rows (ensure any previous settings are undone)
        const grid = frm.get_field('stone_details').grid;
        grid.cannot_add_rows = false;
        grid.cannot_delete_rows = false;
        grid.only_sortable = false; // in case this was set somewhere
        grid.refresh();

        // Optional helper button to add a row programmatically
        if (frm.doc.docstatus === 0) {
            frm.add_custom_button('Add Stone Row', () => {
                const child = frm.add_child('stone_details');
                // Set defaults on creation
                frappe.model.set_value(child.doctype, child.name, 'process', 'Direct Cut Purchase');
                frappe.model.set_value(child.doctype, child.name, 'finish_date', frappe.datetime.now_date());
                frm.refresh_field('stone_details');
            }, 'Actions');
        }
    },

    // Fires whenever a row is added via "Add Row" or via the button above
    stone_details_add(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        if (!row.process) row.process = 'Direct Cut Purchase';
        if (!row.finish_date) row.finish_date = frappe.datetime.now_date();
        frm.refresh_field('stone_details');
    }
});

// Child Doctype: Direct Cut Stone Purchase Detail
frappe.ui.form.on('Direct Cut Stone Purchase Detail', {
    stone_number(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        if (!row.finish_date) {
            frappe.model.set_value(cdt, cdn, 'finish_date', frappe.datetime.now_date());
        }
        if (!row.process) {
            frappe.model.set_value(cdt, cdn, 'process', 'Direct Cut Purchase');
        }
    }
});


//auto volume cauculation in this     

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