
// frappe.ui.form.on("Transportation Receiver", {
//     refresh: function(frm) {
//         apply_gate_pass_no_filter(frm);
//     },

//     gate_pass_bookno: function(frm) {
//         frm.set_value("gate_pass_no", "");
//         apply_gate_pass_no_filter(frm);

//         if (frm.doc.gate_pass_no) {
//             validate_gate_pass_belongs_to_book(frm);
//         }
//     }
// });

// // --- Gate Pass Filter Helpers (Copied from gate_pass_bookno.js for modularity) ---
// function apply_gate_pass_no_filter(frm) {
//     if (frm.doc.gate_pass_bookno) {
//         frm.set_query("gate_pass_no", function() {
//             return {
//                 filters: {
//                     gate_pass_book_no: frm.doc.gate_pass_bookno
//                 }
//             };
//         });
//     } else {
//         frm.set_query("gate_pass_no", function() {
//             return { query: "frappe.desk.search.search_link" };
//         });
//     }
// }

// function validate_gate_pass_belongs_to_book(frm) {
//     frappe.db.get_value("Gate Pass No", frm.doc.gate_pass_no, "gate_pass_book_no", function(r) {
//         if (r && r.gate_pass_book_no !== frm.doc.gate_pass_bookno) {
//             frm.set_value("gate_pass_no", null);
//             frappe.msgprint(__("Selected Gate Pass No doesn't belong to the chosen Book. Selection cleared."));
//         }
//     });
// }


/////////////////////////////////////////////////////////////////////////////
// 2. Somnath shared code
/////////////////////////////////////////////////////////////////////////////
frappe.ui.form.on("Transportation Receiver", {
    refresh: function(frm) {
        apply_gate_pass_no_filter(frm);
    },

    gate_pass_bookno: function(frm) {
        frm.set_value("gate_pass_no", "");
        apply_gate_pass_no_filter(frm);

        if (frm.doc.gate_pass_no) {
            validate_gate_pass_belongs_to_book(frm);
        }
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


frappe.ui.form.on('Transportation Receiver', {
    gate_pass_no: function(frm) {
        if (frm.doc.gate_pass_no) {
            frappe.call({
                method: "baps.baps.doctype.transportation_receiver.transportation_receiver.fetch_sender_details",
                args: {
                    gate_pass_no: frm.doc.gate_pass_no
                },
                callback: function(r) {
                    if (r.message) {
                        let data = r.message;

                        frm.set_value("site", data.site);
                        frm.set_value("gate_pass_bookno", data.gate_pass_bookno);
                        frm.set_value("from_site", data.from_site);
                        frm.set_value("to_site", data.to_site);
                        // frm.set_value("baps_project", data.baps_project);
                        // frm.set_value("item_type", data.item_type);

                        // clear and refill child table
                        frm.clear_table("transportation_status_r");
                        (data.items || []).forEach(function(d) {
                            let row = frm.add_child("transportation_status_r");
                            row.baps_project = d.baps_project;
                            row.item_type = d.item_type;
                            row.item_number = d.item_number;
                            // row.status = d.status;
                        });
                        frm.refresh_field("transportation_status_r");
                    }
                }
            });
        }
    }
});