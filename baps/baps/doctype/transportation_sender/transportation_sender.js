//==================================================
// 1. Prevent Same Site Selection
//================================================== 
frappe.ui.form.on("Transportation Sender", {
    to_site: function(frm) {
        if (frm.doc.from_site && frm.doc.to_site && frm.doc.from_site === frm.doc.to_site) {
            frappe.msgprint(__("From Site and To Site cannot be the same."));
            frm.set_value("to_site", ""); // clear invalid value
        }
    },
    from_site: function(frm) {
        if (frm.doc.from_site && frm.doc.to_site && frm.doc.from_site === frm.doc.to_site) {
            frappe.msgprint(__("From Site and To Site cannot be the same."));
            frm.set_value("from_site", ""); // clear invalid value
        }
    }
});


frappe.ui.form.on("Transportation Sender", {
    refresh: function(frm) {
        // Apply filter on To Site whenever form loads
        set_to_site_filter(frm);
    },

    from_site: function(frm) {
        // Re-apply filter when From Site changes
        set_to_site_filter(frm);
    }
});

// helper to filter To Site field
function set_to_site_filter(frm) {
    frm.set_query("to_site", function() {
        let filters = {};
        if (frm.doc.from_site) {
            filters["name"] = ["!=", frm.doc.from_site]; // exclude the selected from_site
        }
        return { filters: filters };
    });
}

//////////////////////////////////////////////////////////////////////////////////


//==================================================
// 2. Gate Pass No Filtering & Show Items Dialog
//==================================================
frappe.ui.form.on('Transportation Sender', {
    refresh: function(frm) {
        // Apply Gate Pass No filter on refresh
        apply_gate_pass_no_filter(frm);

        // **NEW**: Apply the filter for the 'Gate Pass BookNo' dropdown
        frm.set_query("gate_pass_bookno", function() {
            return {
                query: "baps.baps.doctype.transportation_sender.transportation_sender.get_available_gate_pass_books"
            };
        });

        // Also apply the filter for the child 'Gate Pass No' dropdown
        apply_gate_pass_no_filter(frm);
    },

    // This function will run when you select a 'Gate Pass BookNo'
    gate_pass_bookno: function(frm) {
        // Clear the old 'Gate Pass No' value
        frm.set_value("gate_pass_no", "");
        // Re-apply the filter for the child dropdown
        apply_gate_pass_no_filter(frm);
    },

    // show_items: function (frm) {
    //     show_items_dialog(frm);
    // }
    show_items: function(frm) {
        if (!frm.doc.from_site || !frm.doc.baps_project || !frm.doc.item_type) {
            frappe.throw(__("Please select a From Site, Baps Project, and Item Type first."));
            return;
        }
        show_items_dialog(frm);
    }
});
////////////////////////////////////////////////////////////////////////////////////

//==================================================
// 3. Auto-set Selected By (User)
//==================================================
frappe.ui.form.on("Transportation Sender", {
    onload: function(frm) {
        if (!frm.doc.sender_name) {
            frm.set_value("sender_name", frappe.session.user);
        }
    }
});

/////////////////////////////////////////////////////////////////////////////////////

//==================================================
// 4. Fetch and Populate Details on Gate Pass No Selection
//==================================================
// --- Gate Pass Filter Helpers (Copied from gate_pass_bookno.js for modularity) ---
// This is the main filtering function
function apply_gate_pass_no_filter(frm) {
    // Only apply filters if a book is selected
    if (frm.doc.gate_pass_bookno) {
        frm.set_query("gate_pass_no", function() {
            return {
                query: "baps.baps.doctype.transportation_sender.transportation_sender.get_available_gate_passes",
                filters: {
                    'gate_pass_book_no': frm.doc.gate_pass_bookno
                }
            };
        });
    }
}

//==================================================
// 5.Transport item table add row button removed by this bellow code 
//==================================================
// 







frappe.ui.form.on("Transportation Sender", {
    onload: function(frm) {
        // Disable "Add Row" button
        frm.fields_dict["transport_items"].grid.cannot_add_rows = true;

        // Hide "Remove" buttons
        // frm.fields_dict["transport_items"].grid.only_sortable = true;

        frm.refresh_field("transport_items");
    }
});









//==================================================
// 6. validation and formatting for Driver Mobile No(somnath's code)
//==================================================
// frappe.ui.form.on("Transportation Sender", {
//     onload: function(frm) {
//         // Set default +91 if empty
//         if (!frm.doc.driver_number) {
//             frm.set_value("driver_number", "+91 ");
//         }
//     },

//     driver_number: function(frm) {
//         let phone = frm.doc.driver_number || "";

//         // Ensure it starts with +91
//         if (!phone.startsWith("+91")) {
//             phone = "+91 " + phone.replace(/[^0-9]/g, ""); // keep only numbers after prefix
//         }

//         // Extract only digits after +91
//         let digits = phone.replace("+91", "").replace(/\D/g, "");

//         // Validation: must be max 10 digits
//         if (digits.length > 10) {
//             frappe.msgprint(__("Phone number cannot be more than 10 digits after +91"));
//             digits = digits.substring(0, 10); // trim to 10 digits
//         }

//         // Rebuild the number in correct format
//         frm.set_value("driver_number", "+91 " + digits);
//     }
// });

//==================================================
// 6. validation and formatting for Driver Mobile No(my code)
//==================================================
frappe.ui.form.on("Transportation Sender", {
    driver_number: function(frm) {
        let phone_number = frm.doc.driver_number || "";

        // The phone field's value includes the country code from the dropdown.
        // We only apply this auto-correction logic if the selected country is India.
        if (phone_number.startsWith("+91")) {

            // Extract the part after the country code
            let national_number = phone_number.substring(3).trim();

            // Remove all non-numeric characters
            let digits = national_number.replace(/\D/g, "");

            // SILENTLY check and remove invalid starting digits (0-5)
            if (digits.length > 0 && "012345".includes(digits[0])) {
                digits = digits.substring(1); // Remove the invalid first digit
            }

            // Trim to a max of 10 digits
            if (digits.length > 10) {
                digits = digits.substring(0, 10);
            }

            // Reconstruct the full number
            let corrected_number = "+91 " + digits;

            // Update the field only if we made a change. This prevents cursor jumping.
            if (frm.doc.driver_number !== corrected_number) {
                frm.set_value("driver_number", corrected_number);
            }
        }
    }
});

// function validate_gate_pass_belongs_to_book(frm) {
//     frappe.db.get_value("Gate Pass No", frm.doc.gate_pass_no, "gate_pass_book_no", function(r) {
//         if (r && r.gate_pass_book_no !== frm.doc.gate_pass_bookno) {
//             frm.set_value("gate_pass_no", null);
//             frappe.msgprint(__("Selected Gate Pass No doesn't belong to the chosen Book. Selection cleared."));
//         }
//     });
// }
// --- End Gate Pass Filter Helpers ---

////////////////////////////////////////////////////////////////////////


//this below code , i am commenting because i wants to add my own code below it
// // --- Show Items Dialog (Your Original Code) ---
// function show_items_dialog(frm) {
//     const d = new frappe.ui.Dialog({
//         title: 'Select Blocks to Add',
//         fields: [
//             {
//                 label: 'Baps Project',
//                 fieldname: 'baps_project',
//                 fieldtype: 'Link',
//                 options: 'Baps Project',
//                 reqd: true,
//                 default: frm.doc.baps_project
//             },
//             {
//                 label: 'Item Type',
//                 fieldname: 'item_type',
//                 fieldtype: 'Link',
//                 options: 'Item Type',
//                 reqd: true,
//                 default: frm.doc.item_type
//             },
//             {
//                 fieldtype: 'Section Break',
//                 label: 'Available for Selection'
//             },
//             {
//                 fieldname: 'block_items',
//                 fieldtype: 'HTML'
//             }
//         ],
//         primary_action_label: 'Add Selected',
//         primary_action: function () {
//             const values = d.get_values();
//             const selected_blocks = [];

//             const checkedBoxes = document.querySelectorAll('input[data-block-checkbox="1"]:checked');
//             checkedBoxes.forEach((cb) => {
//                 selected_blocks.push({
//                     block_number: cb.dataset.block,
//                     project: values.baps_project,
//                     item_type: values.item_type
//                 });
//             });

//             if (selected_blocks.length === 0) {
//                 frappe.msgprint(__('Please select at least one block.'));
//                 return;
//             }

//             frappe.call({
//                 method: 'baps.baps.doctype.transportation_sender.transportation_sender.add_blocks_to_table',
//                 args: {
//                     sender_name: frm.doc.name,
//                     blocks: selected_blocks
//                 },
//                 callback: function (r) {
//                     if (!r.exc) {
//                         frappe.show_alert({
//                             message: __('Blocks added successfully'),
//                             indicator: 'green'
//                         });
//                         frm.reload_doc();
//                         d.hide();
//                     } else {
//                         frappe.msgprint(__('Error adding blocks. Please try again.'));
//                     }
//                 }
//             });
//         }
//     });

//     d.fields_dict.baps_project.df.onchange = d.fields_dict.item_type.df.onchange = () => {
//         update_block_list(d, frm);
//     };

//     update_block_list(d, frm);
//     d.show();
// }

// function update_block_list(dialog, frm) {
//     const values = dialog.get_values();
//     const project = values?.baps_project;

//     if (!project) {
//         dialog.fields_dict.block_items.$wrapper.html(
//             '<p style="color: var(--text-color-light); font-style: italic;">Select a Baps Project to load blocks.</p>'
//         );
//         return;
//     }

//     frappe.call({
//         method: 'baps.baps.doctype.transportation_sender.transportation_sender.get_blocks_for_project',
//         args: {
//             project: project
//         },
//         callback: function (r) {
//             if (r.message && Array.isArray(r.message) && r.message.length > 0) {
//                 let html = `
//                     <div style="max-height: 300px; overflow-y: auto; border: 1px solid #d1d8dd; border-radius: 5px; padding: 8px; background: #fafbfc;">
//                         <p style="margin: 0 0 8px; font-weight: 500; color: var(--text-color);">Select blocks:</p>
//                 `;

//                 r.message.forEach(block => {
//                     const blockNum = block.block_number || 'Unknown';
//                     html += `
//                         <div class="checkbox" style="margin: 4px 0;">
//                             <label style="font-size: 14px; color: var(--text-color);">
//                                 <input type="checkbox" 
//                                        data-block-checkbox="1" 
//                                        data-block="${blockNum}" 
//                                        style="margin-right: 6px;" />
//                                 ${blockNum}
//                             </label>
//                         </div>
//                     `;
//                 });

//                 html += `</div>`;
//                 dialog.fields_dict.block_items.$wrapper.html(html);
//             } else {
//                 dialog.fields_dict.block_items.$wrapper.html(
//                     '<p style="color: #7d8588; font-style: italic;">No blocks found for this project.</p>'
//                 );
//             }
//         }
//     });
// }

///the upper code i am commenting because i wants to add my own code below it


// ------------------------------------------------------------------------------------------------
// phone no 

frappe.ui.form.on("Transportation Sender", {
    onload: function(frm) {
        // Set default +91 if empty
        if (!frm.doc.driver_mobile_no) {
            frm.set_value("driver_mobile_no", "+91 ");
        }
    },

    driver_mobile_no: function(frm) {
        let phone = frm.doc.driver_mobile_no || "";

        // Ensure it starts with +91
        if (!phone.startsWith("+91")) {
            phone = "+91 " + phone.replace(/[^0-9]/g, ""); // keep only numbers after prefix
        }

        // Extract only digits after +91
        let digits = phone.replace("+91", "").replace(/\D/g, "");

        // Validation: must be max 10 digits
        if (digits.length > 10) {
            frappe.msgprint(__("Phone number cannot be more than 10 digits after +91"));
            digits = digits.substring(0, 10); // trim to 10 digits
        }

        // Rebuild the number in correct format
        frm.set_value("driver_mobile_no", "+91 " + digits);
    }
});


// -----------------------------------------------------------------------------------------------
// date form past 


//date

frappe.ui.form.on("Transportation Sender", {
    onload: function(frm) {
        // (optional) if you want a default date you can enable the next line:
        // if (!frm.doc.date) frm.set_value("date", frappe.datetime.get_today());
    },

    // runs when user changes the date field
    date: function(frm) {
        if (frm.doc.date) {
            let today = frappe.datetime.get_today(); // "YYYY-MM-DD"
            if (frm.doc.date < today) {
                frappe.msgprint(__("Date cannot be in the past. Please select today or a future date."));
                frm.set_value("date", ""); // clear invalid value
            }
        }
    },

    // final client-side safety check before save
    validate: function(frm) {
        if (frm.doc.date) {
            let today = frappe.datetime.get_today();
            if (frm.doc.date < today) {
                frappe.throw(__("Date cannot be in the past. Please select today or a future date."));
            }
        }
    }
});






// phone no
// frappe.ui.form.on("Transportation Sender", {
//     onload: function(frm) {
//         if (!frm.doc.driver_mobile_no) {
//             frm.set_value("driver_mobile_no", "+91 ");
//         }
//     }
// });


// frappe.ui.form.on("Transportation Sender", {
//     onload: function(frm) {
//         // Set default +91 if empty
//         if (!frm.doc.driver_mobile_no) {
//             frm.set_value("driver_mobile_no", "+91 ");
//         }
//     },

//     driver_mobile_no: function(frm) {
//         let phone = frm.doc.driver_mobile_no || "";

//         // Ensure it starts with +91
//         if (!phone.startsWith("+91")) {
//             phone = "+91 " + phone.replace(/[^0-9]/g, ""); // keep only numbers after prefix
//         }

//         // Extract only digits after +91
//         let digits = phone.replace("+91", "").replace(/\D/g, "");

//         // Validation: must be max 10 digits
//         if (digits.length > 10) {
//             frappe.msgprint(__("Phone number cannot be more than 10 digits after +91"));
//             digits = digits.substring(0, 10); // trim to 10 digits
//         }

//         // Rebuild the number in correct format
//         frm.set_value("driver_mobile_no", "+91 " + digits);
//     }
// });

//date

frappe.ui.form.on("Transportation Sender", {
    onload: function(frm) {
        // (optional) if you want a default date you can enable the next line:
        // if (!frm.doc.date) frm.set_value("date", frappe.datetime.get_today());
    },

    // runs when user changes the date field
    date: function(frm) {
        if (frm.doc.date) {
            let today = frappe.datetime.get_today(); // "YYYY-MM-DD"
            if (frm.doc.date < today) {
                frappe.msgprint(__("Date cannot be in the past. Please select today or a future date."));
                frm.set_value("date", ""); // clear invalid value
            }
        }
    },

    // final client-side safety check before save
    validate: function(frm) {
        if (frm.doc.date) {
            let today = frappe.datetime.get_today();
            if (frm.doc.date < today) {
                frappe.throw(__("Date cannot be in the past. Please select today or a future date."));
            }
        }
    }
});






// phone no
// frappe.ui.form.on("Transportation Sender", {
//     onload: function(frm) {
//         if (!frm.doc.driver_mobile_no) {
//             frm.set_value("driver_mobile_no", "+91 ");
//         }
//     }
// });


frappe.ui.form.on("Transportation Sender", {
    onload: function(frm) {
        // Set default +91 if empty
        if (!frm.doc.driver_mobile_no) {
            frm.set_value("driver_mobile_no", "+91 ");
        }
    },

    driver_mobile_no: function(frm) {
        let phone = frm.doc.driver_mobile_no || "";

        // Ensure it starts with +91
        if (!phone.startsWith("+91")) {
            phone = "+91 " + phone.replace(/[^0-9]/g, ""); // keep only numbers after prefix
        }

        // Extract only digits after +91
        let digits = phone.replace("+91", "").replace(/\D/g, "");

        // Validation: must be max 10 digits
        if (digits.length > 10) {
            frappe.msgprint(__("Phone number cannot be more than 10 digits after +91"));
            digits = digits.substring(0, 10); // trim to 10 digits
        }

        // Rebuild the number in correct format
        frm.set_value("driver_mobile_no", "+91 " + digits);
    }
});





// --- Show Items Dialog ---
function show_items_dialog(frm) {
    const d = new frappe.ui.Dialog({
        title: 'Select Items to Add',
        fields: [{
                label: 'Baps Project',
                fieldname: 'baps_project',
                fieldtype: 'Link',
                options: 'Baps Project',
                reqd: true,
                default: frm.doc.baps_project
            },
            {
                label: 'Item Type',
                fieldname: 'item_type',
                fieldtype: 'Link',
                options: 'Item Type',
                reqd: true,
                default: frm.doc.item_type
            },
            { fieldtype: 'Section Break', label: 'Available for Selection' },
            { fieldname: 'items_html', fieldtype: 'HTML' }
        ],
        primary_action_label: 'Add Selected',
        primary_action: function() {
            const values = d.get_values();
            const selected_items = [];

            const checkedBoxes = d.$wrapper.find('input[data-item-checkbox="1"]:checked');
            checkedBoxes.each(function() {
                selected_items.push({
                    item_no: $(this).data('item-id'),
                    baps_project: values.baps_project,
                    item_type: values.item_type
                });
            });

            if (selected_items.length === 0) {
                frappe.msgprint(__('Please select at least one item.'));
                return;
            }

            // --- THIS IS THE UPDATED LOGIC ---
            // Get a list of items already in the table to avoid adding duplicates
            const existing_items = (frm.doc.transport_items || []).map(row => row.item_no);

            let added_count = 0;
            selected_items.forEach(item => {
                // If the item is not already in the table, add it
                if (!existing_items.includes(item.item_no)) {
                    let child_row = frm.add_child('transport_items');
                    child_row.baps_project = item.baps_project;
                    child_row.item_type = item.item_type;
                    child_row.item_no = item.item_no;
                    added_count++;
                }
            });

            // Refresh the child table to show the new rows
            frm.refresh_field('transport_items');
            frappe.show_alert({ message: __(added_count + " item(s) added to the table."), indicator: 'green' });
            d.hide();
        }
    });

    d.fields_dict.baps_project.df.onchange = () => update_items_list(d, frm);
    d.fields_dict.item_type.df.onchange = () => update_items_list(d, frm);

    update_items_list(d, frm);
    d.show();
}

function update_items_list(dialog, frm) {
    const values = dialog.get_values();
    const project = values ?.baps_project;
    const item_type = values ?.item_type;
    const from_site = frm.doc.from_site;
    const $items_wrapper = dialog.fields_dict.items_html.$wrapper;

    if (!project || !item_type) {
        $items_wrapper.html(`<p class="text-muted">Please select a Baps Project and Item Type.</p>`);
        return;
    }

    // Only support "Block" for now
    if (item_type !== "Block") {
        $items_wrapper.html(`<p class="text-muted">Only 'Block' is currently supported.</p>`);
        return;
    }

    // 1️⃣ Get already added block names
    const existing_blocks = (frm.doc.transport_items || [])
        .filter(row => row.item_type === "Block")
        .map(row => row.item_no);

    // 2️⃣ Fetch blocks for the selected project
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Block",
            filters: {
                baps_project: project
            },
            fields: ["name", "block_number", "baps_project"],
            limit_page_length: 1000
        },
        callback: function(r) {
            let blocks = r.message || [];

            // 3️⃣ Filter out already selected blocks
            const new_blocks = blocks.filter(b => !existing_blocks.includes(b.name));

            if (new_blocks.length === 0) {
                $items_wrapper.html(`<p class="text-muted">All blocks from this project have already been added.</p>`);
                return;
            }

            // 4️⃣ Render remaining blocks
            let html = `<div class="p-2 border rounded" style="max-height: 300px; overflow-y: auto;">`;
            new_blocks.forEach(block => {
                const block_id = frappe.utils.escape_html(block.name);
                const block_number = frappe.utils.escape_html(block.block_number || block.name);
                html += `
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" data-item-checkbox="1" data-item-id="${block_id}" />
                            ${block_number}
                        </label>
                    </div>`;
            });
            html += `</div>`;

            $items_wrapper.html(html);
        }
    });
}