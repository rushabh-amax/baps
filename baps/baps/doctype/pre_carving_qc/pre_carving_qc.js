// Copyright (c) 2025, Dhruvi Khant and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Pre Carving QC", {
// 	refresh(frm) {

// 	},
// });

// frappe.ui.form.on("Pre Carving QC", {
//     refresh(frm) {
//         // Set default QC By if not already set
//         if (!frm.doc.qc_by) {
//             frm.set_value("qc_by", frappe.session.user_fullname);
//         }

//         // Add custom button only in draft state
//         if (frm.doc.docstatus === 0) {
//             frm.add_custom_button(__('Confirm QC'), function() {
//                 if (confirm("Are you sure all checks are done?")) {
//                     frm.save();
//                     frappe.msgprint(__('QC Recorded Successfully!'));
//                 }
//             }).css({
//                 "background-color": "#4CAF50",
//                 "color": "white"
//             });
//         }
//     }
// });

// frappe.ui.form.on("Pre Carving QC Detail", {
//     stone_number(frm, cdt, cdn) {
//         let row = locals[cdt][cdn];

//         if (!row.qc_date) {
//             frappe.model.set_value(cdt, cdn, "qc_date", frappe.datetime.now_date());
//         }
//         if (!row.qc_by) {
//             frappe.model.set_value(cdt, cdn, "qc_by", frappe.session.user_fullname);
//         }
//     },

//     dimension_ok: validate_qc_row,
//     cracks_present: validate_qc_row,
//     color_match: validate_qc_row,
//     edge_damage: validate_qc_row
// });

// function validate_qc_row(frm, cdt, cdn) {
//     let row = locals[cdt][cdn];
//     if (!row.stone_number) return;

//     // Level 2 QC if any issues found
//     if (row.cracks_present || !row.dimension_ok || !row.color_match) {
//         frappe.model.set_value(cdt, cdn, "level_2_qc_needed", 1);
//     } else {
//         frappe.model.set_value(cdt, cdn, "level_2_qc_needed", 0);
//     }

//     // Mandatory QC fields
//     if (!row.qc_date || !row.qc_by) {
//         frappe.throw(__("QC Date and QC By are required for stone: ") + row.stone_number);
//     }
// }


frappe.ui.form.on('Pre Carving QC', {
    is_size_ok: set_qc_status,
    is_colour_ok: set_qc_status,
    free_from_all_defects: set_qc_status
});

function set_qc_status(frm) {
    const size = frm.doc.is_size_ok;
    const colour = frm.doc.is_colour_ok;
    const defects = frm.doc.free_from_all_defects;

    if (size === "Yes" && colour === "Yes" && defects === "Yes") {
        frm.set_value('level_2_qc_required', 0);
    } else {
        frm.set_value('level_2_qc_required', 1);
    }
}
