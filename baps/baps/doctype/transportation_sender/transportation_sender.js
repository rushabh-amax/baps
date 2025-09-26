
// frappe.ui.form.on('Transportation Sender', {
//     refresh: function (frm) {
//         // Apply Gate Pass No filter on refresh
//         apply_gate_pass_no_filter(frm);
//     },

//     gate_pass_bookno: function(frm) {
//         frm.set_value("gate_pass_no", "");
//         apply_gate_pass_no_filter(frm);

//         if (frm.doc.gate_pass_no) {
//             validate_gate_pass_belongs_to_book(frm);
//         }
//     },

//     show_items: function (frm) {
//         show_items_dialog(frm);
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
// // --- End Gate Pass Filter Helpers ---

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

// transportation_sender.js

// frappe.ui.form.on('Transportation Sender', {
//     refresh: function (frm) {
//         apply_gate_pass_no_filter(frm);
//     },
//     gate_pass_bookno: function(frm) {
//         frm.set_value("gate_pass_no", "");
//         apply_gate_pass_no_filter(frm);
//         if (frm.doc.gate_pass_no) { validate_gate_pass_belongs_to_book(frm); }
//     },
//     show_items: function (frm) {
//         // MODIFIED: Pass the main form's values directly to the dialog function
//         show_items_dialog(frm, frm.doc.baps_project, frm.doc.item_type);
//     }
// });

// // --- Gate Pass Filter Helpers ---
// function apply_gate_pass_no_filter(frm) { /* ... (no changes) ... */ }
// function validate_gate_pass_belongs_to_book(frm) { /* ... (no changes) ... */ }

// // --- Show Items Dialog ---
// function show_items_dialog(frm, default_project, default_item_type) {
//     const d = new frappe.ui.Dialog({
//         title: 'Select Items to Add',
//         fields: [
//             {
//                 label: 'Baps Project',
//                 fieldname: 'baps_project',
//                 fieldtype: 'Link',
//                 options: 'Baps Project',
//                 reqd: true,
//                 default: default_project
//             },
//             {
//                 label: 'Item Type',
//                 fieldname: 'item_type',
//                 fieldtype: 'Link',
//                 options: 'Item Type',
//                 reqd: true,
//                 default: default_item_type
//             },
//             { fieldtype: 'Section Break', label: 'Available for Selection' },
//             { fieldname: 'items_html', fieldtype: 'HTML' }
//         ],
//         primary_action_label: 'Add Selected',
//         primary_action: function () {
//             const values = d.get_values();
//             const selected_items = [];

//             // MODIFIED: Updated selector for generic items
//             const checkedBoxes = d.$wrapper.find('input[data-item-checkbox="1"]:checked');
//             checkedBoxes.each(function() {
//                 selected_items.push({
//                     block_number: $(this).data('item-id'),
//                     project: values.baps_project,
//                     item_type: values.item_type
//                 });
//             });

//             if (selected_items.length === 0) {
//                 frappe.msgprint(__('Please select at least one item.'));
//                 return;
//             }
            
//             // Call your existing python method to add items to the table
//             frappe.call({
//                 method: 'baps.baps.doctype.transportation_sender.transportation_sender.add_blocks_to_table',
//                 args: {
//                     sender_name: frm.doc.name,
//                     blocks: selected_items
//                 },
//                 callback: function (r) {
//                     if (!r.exc) {
//                         frm.reload_doc(); // Reload to see the updated child table
//                         d.hide();
//                     }
//                 }
//             });
//         }
//     });

//     // When either filter in the dialog changes, update the list
//     d.fields_dict.baps_project.df.onchange = () => update_items_list(d);
//     d.fields_dict.item_type.df.onchange = () => update_items_list(d);

//     update_items_list(d); // Initial call to load items
//     d.show();
// }

// // function update_items_list(dialog) {
// //     const values = dialog.get_values();
// //     const project = values?.baps_project;
// //     const item_type = values?.item_type;
// //     const $items_wrapper = dialog.fields_dict.items_html.$wrapper;

// //     // MODIFIED: Require both fields before fetching
// //     if (!project || !item_type) {
// //         $items_wrapper.html(`<p class="text-muted">Please select a Baps Project and Item Type.</p>`);
// //         return;
// //     }

// //     frappe.call({
// //         method: 'baps.baps.doctype.transportation_sender.transportation_sender.get_items_for_selection',
// //         args: {
// //             project: project,
// //             item_type: item_type // Pass the item_type to the server
// //         },
// //         callback: function (r) {
// //             if (r.message && Array.isArray(r.message) && r.message.length > 0) {
// //                 let html = `<div class="p-2 border rounded" style="max-height: 300px; overflow-y: auto;">`;
// //                 r.message.forEach(item => {
// //                     const itemId = frappe.escape_html(item.item_id);
// //                     html += `
// //                         <div class="checkbox">
// //                             <label>
// //                                 <input type="checkbox" data-item-checkbox="1" data-item-id="${itemId}" class="mr-2" />
// //                                 ${itemId}
// //                             </label>
// //                         </div>`;
// //                 });
// //                 html += `</div>`;
// //                 $items_wrapper.html(html);
// //             } else {
// //                 $items_wrapper.html(`<p class="text-muted">No '${item_type}' items found for this project.</p>`);
// //             }
// //         }
// //     });
// // }

// function update_items_list(dialog) {
//     const values = dialog.get_values();
//     const project = values?.baps_project;
//     const item_type = values?.item_type;
//     const $items_wrapper = dialog.fields_dict.items_html.$wrapper;

//     if (!project || !item_type) {
//         $items_wrapper.html(`<p class="text-muted">Please select a Baps Project and Item Type.</p>`);
//         return;
//     }

//     frappe.call({
//         method: 'baps.baps.doctype.transportation_sender.transportation_sender.get_items_for_selection',
//         args: {
//             project: project,
//             item_type: item_type
//         },
//         callback: function (r) {
//             // --- THIS IS THE DEBUGGING PART ---
//             // It prints the full report from the Python function to the console.
//             console.log("Server Debug Report:", r.message);
//             // ------------------------------------

//             // Get the final list of items from the report
//             let items_to_render = r.message ? r.message.step3_final_items_sent : [];

//             if (items_to_render && Array.isArray(items_to_render) && items_to_render.length > 0) {
//                 let html = `<div class="p-2 border rounded" style="max-height: 300px; overflow-y: auto;">`;
//                 items_to_render.forEach(item => {
//                     const itemId = frappe.escape_html(item.item_id);
//                     html += `
//                         <div class="checkbox">
//                             <label>
//                                 <input type="checkbox" data-item-checkbox="1" data-item-id="${itemId}" class="mr-2" />
//                                 ${itemId}
//                             </label>
//                         </div>`;
//                 });
//                 html += `</div>`;
//                 $items_wrapper.html(html);
//             } else {
//                 $items_wrapper.html(`<p class="text-muted">No '${item_type}' items found for this project.</p>`);
//             }
//         }
//     });
// }

// --- Final Revised Code ---


// frappe.ui.form.on('Transportation Sender', {
//     refresh: function (frm) {
//         apply_gate_pass_no_filter(frm);
//     },

//     gate_pass_bookno: function(frm) {
//         frm.set_value("gate_pass_no", "");
//         apply_gate_pass_no_filter(frm);

//         if (frm.doc.gate_pass_no) {
//             validate_gate_pass_belongs_to_book(frm);
//         }
//     },

//     show_items: function (frm) {
//         show_items_dialog(frm);
//     }
// });

// // --- Gate Pass Filter Helpers ---
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
// // --- End Gate Pass Filter Helpers ---


// // --- Show Items Dialog ---
// function show_items_dialog(frm) {
//     const d = new frappe.ui.Dialog({
//         title: 'Select Items to Add',
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
//             { fieldtype: 'Section Break', label: 'Available for Selection' },
//             { fieldname: 'items_html', fieldtype: 'HTML' }
//         ],
//         primary_action_label: 'Add Selected',
//         primary_action: function () {
//             const values = d.get_values();
//             const selected_items = [];

//             const checkedBoxes = d.$wrapper.find('input[data-item-checkbox="1"]:checked');
//             checkedBoxes.each(function() {
//                 selected_items.push({
//                     block_number: $(this).data('item-id'),
//                     project: values.baps_project,
//                     item_type: values.item_type
//                 });
//             });

//             if (selected_items.length === 0) {
//                 frappe.msgprint(__('Please select at least one item.'));
//                 return;
//             }
            
//             frappe.call({
//                 method: 'baps.baps.doctype.transportation_sender.transportation_sender.add_blocks_to_table',
//                 args: {
//                     sender_name: frm.doc.name,
//                     blocks: selected_items
//                 },
//                 callback: function (r) {
//                     if (!r.exc) {
//                         frm.reload_doc();
//                         d.hide();
//                     }
//                 }
//             });
//         }
//     });

//     d.fields_dict.baps_project.df.onchange = () => update_items_list(d);
//     d.fields_dict.item_type.df.onchange = () => update_items_list(d);

//     update_items_list(d);
//     d.show();
// }

// function update_items_list(dialog) {
//     const values = dialog.get_values();
//     const project = values?.baps_project;
//     const item_type = values?.item_type;
//     const $items_wrapper = dialog.fields_dict.items_html.$wrapper;

//     if (!project || !item_type) {
//         $items_wrapper.html(`<p class="text-muted">Please select a Baps Project and Item Type.</p>`);
//         return;
//     }

//     frappe.call({
//         method: 'baps.baps.doctype.transportation_sender.transportation_sender.get_items_for_selection',
//         args: {
//             project: project,
//             item_type: item_type
//         },
//         callback: function (r) {
//             let items_to_render = r.message || [];

//             if (items_to_render.length > 0) {
//                 let html = `<div class="p-2 border rounded" style="max-height: 300px; overflow-y: auto;">`;
//                 items_to_render.forEach(item => {
//                     const itemId = item.item_id; 
//                     const escapedItemId = String(itemId).replace(/"/g, '&quot;');

//                     html += `
//                         <div class="checkbox">
//                             <label>
//                                 <input type="checkbox" data-item-checkbox="1" data-item-id="${escapedItemId}" class="mr-2" />
//                                 ${itemId}
//                             </label>
//                         </div>`;
//                 });
//                 html += `</div>`;
//                 $items_wrapper.html(html);
//             } else {
//                 $items_wrapper.html(`<p class="text-muted">No '${item_type}' items found for this project.</p>`);
//             }
//         }
//     });
// }

//////////////////////////////////////////////////////////////////////////////////////////

// --- Last Final Revised Code ---   


// frappe.ui.form.on('Transportation Sender', {
//     refresh: function (frm) {
//         apply_gate_pass_no_filter(frm);
//     },

//     gate_pass_bookno: function(frm) {
//         frm.set_value("gate_pass_no", "");
//         apply_gate_pass_no_filter(frm);

//         if (frm.doc.gate_pass_no) {
//             validate_gate_pass_belongs_to_book(frm);
//         }
//     },

//     show_items: function (frm) {
//         // Validation: Ensure all three filters are selected before opening the popup.
//         if (!frm.doc.from_site || !frm.doc.baps_project || !frm.doc.item_type) {
//             frappe.throw(__("Please select a From Site, Baps Project, and Item Type first."));
//             return;
//         }
//         show_items_dialog(frm);
//     }
// });

// // --- Gate Pass Filter Helpers ---
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
// // --- End Gate Pass Filter Helpers ---


// // --- Show Items Dialog ---
// function show_items_dialog(frm) {
//     const d = new frappe.ui.Dialog({
//         title: 'Select Items to Add',
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
//             { fieldtype: 'Section Break', label: 'Available for Selection' },
//             { fieldname: 'items_html', fieldtype: 'HTML' }
//         ],
//         primary_action_label: 'Add Selected',
//         primary_action: function () {
//             const values = d.get_values();
//             const selected_items = [];

//             const checkedBoxes = d.$wrapper.find('input[data-item-checkbox="1"]:checked');
//             checkedBoxes.each(function() {
//                 selected_items.push({
//                     block_number: $(this).data('item-id'),
//                     project: values.baps_project,
//                     item_type: values.item_type
//                 });
//             });

//             if (selected_items.length === 0) {
//                 frappe.msgprint(__('Please select at least one item.'));
//                 return;
//             }
            
//             frappe.call({
//                 method: 'baps.baps.doctype.transportation_sender.transportation_sender.add_blocks_to_table',
//                 args: {
//                     sender_name: frm.doc.name,
//                     blocks: selected_items
//                 },
//                 callback: function (r) {
//                     if (!r.exc) {
//                         frm.reload_doc();
//                         d.hide();
//                     }
//                 }
//             });
//         }
//     });

//     // Pass the main form 'frm' to the update function so we can access 'from_site'
//     d.fields_dict.baps_project.df.onchange = () => update_items_list(d, frm);
//     d.fields_dict.item_type.df.onchange = () => update_items_list(d, frm);

//     update_items_list(d, frm);
//     d.show();
// }

// function update_items_list(dialog, frm) { // Add 'frm' as an argument here
//     const values = dialog.get_values();
//     const project = values?.baps_project;
//     const item_type = values?.item_type;
//     const from_site = frm.doc.from_site; // Get 'from_site' from the main form
//     const $items_wrapper = dialog.fields_dict.items_html.$wrapper;

//     if (!project || !item_type) {
//         $items_wrapper.html(`<p class="text-muted">Please select a Baps Project and Item Type.</p>`);
//         return;
//     }

//     frappe.call({
//         method: 'baps.baps.doctype.transportation_sender.transportation_sender.get_items_for_selection',
//         args: {
//             project: project,
//             item_type: item_type,
//             from_site: from_site // Send the new 'from_site' value
//         },
//         callback: function (r) {
//             let items_to_render = r.message || [];

//             if (items_to_render.length > 0) {
//                 let html = `<div class="p-2 border rounded" style="max-height: 300px; overflow-y: auto;">`;
//                 items_to_render.forEach(item => {
//                     const itemId = item.item_id; 
//                     const escapedItemId = String(itemId).replace(/"/g, '&quot;');

//                     html += `
//                         <div class="checkbox">
//                             <label>
//                                 <input type="checkbox" data-item-checkbox="1" data-item-id="${escapedItemId}" class="mr-2" />
//                                 ${itemId}
//                             </label>
//                         </div>`;
//                 });
//                 html += `</div>`;
//                 $items_wrapper.html(html);
//             } else {
//                 $items_wrapper.html(`<p class="text-muted">No '${item_type}' items found for this project and site.</p>`);
//             }
//         }
//     });
// }

frappe.ui.form.on('Transportation Sender', {
    refresh: function (frm) {
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
        if (!frm.doc.from_site || !frm.doc.baps_project || !frm.doc.item_type) {
            frappe.throw(__("Please select a From Site, Baps Project, and Item Type first."));
            return;
        }
        show_items_dialog(frm);
    }
});
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

// --- Gate Pass Filter Helpers ---
function apply_gate_pass_no_filter(frm) {
    if (frm.doc.gate_pass_bookno) {
        frm.set_query("gate_pass_no", function() {
            return { filters: { gate_pass_book_no: frm.doc.gate_pass_bookno } };
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


// --- Show Items Dialog ---
function show_items_dialog(frm) {
    const d = new frappe.ui.Dialog({
        title: 'Select Items to Add',
        fields: [
            {
                label: 'Baps Project', fieldname: 'baps_project', fieldtype: 'Link',
                options: 'Baps Project', reqd: true, default: frm.doc.baps_project
            },
            {
                label: 'Item Type', fieldname: 'item_type', fieldtype: 'Link',
                options: 'Item Type', reqd: true, default: frm.doc.item_type
            },
            { fieldtype: 'Section Break', label: 'Available for Selection' },
            { fieldname: 'items_html', fieldtype: 'HTML' }
        ],
        primary_action_label: 'Add Selected',
        primary_action: function () {
            const values = d.get_values();
            const selected_items = [];

            const checkedBoxes = d.$wrapper.find('input[data-item-checkbox="1"]:checked');
            checkedBoxes.each(function() {
                selected_items.push({
                    item_number: $(this).data('item-id'),
                    project: values.baps_project,
                    item_type: values.item_type
                });
            });

            if (selected_items.length === 0) {
                frappe.msgprint(__('Please select at least one item.'));
                return;
            }
            
            // --- THIS IS THE UPDATED LOGIC ---
            // Get a list of items already in the table to avoid adding duplicates
            const existing_items = (frm.doc.transport_items || []).map(row => row.item_number);

            let added_count = 0;
            selected_items.forEach(item => {
                // If the item is not already in the table, add it
                if (!existing_items.includes(item.item_number)) {
                    let child_row = frm.add_child('transport_items');
                    child_row.project = item.project;
                    child_row.item_type = item.item_type;
                    child_row.item_number = item.item_number;
                    added_count++;
                }
            });

            // Refresh the child table to show the new rows
            frm.refresh_field('transport_items');
            frappe.show_alert({message: __(added_count + " item(s) added to the table."), indicator: 'green'});
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
    const project = values?.baps_project;
    const item_type = values?.item_type;
    const from_site = frm.doc.from_site;
    const $items_wrapper = dialog.fields_dict.items_html.$wrapper;

    if (!project || !item_type) {
        $items_wrapper.html(`<p class="text-muted">Please select a Baps Project and Item Type.</p>`);
        return;
    }

    frappe.call({
        method: 'baps.baps.doctype.transportation_sender.transportation_sender.get_items_for_selection',
        args: {
            project: project,
            item_type: item_type,
            from_site: from_site
        },
        callback: function (r) {
            let items_to_render = r.message || [];

            if (items_to_render.length > 0) {
                let html = `<div class="p-2 border rounded" style="max-height: 300px; overflow-y: auto;">`;
                items_to_render.forEach(item => {
                    const itemId = item.item_id; 
                    const escapedItemId = String(itemId).replace(/"/g, '&quot;');
                    html += `
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" data-item-checkbox="1" data-item-id="${escapedItemId}" class="mr-2" />
                                ${itemId}
                            </label>
                        </div>`;
                });
                html += `</div>`;
                $items_wrapper.html(html);
            } else {
                $items_wrapper.html(`<p class="text-muted">No '${item_type}' items found for this project and site.</p>`);
            }
        }
    });
}




//==================================================
// 2. Prevent Same Site Selection
//==================================================    
frappe.ui.form.on("Transportation Sender", {
    to_site: function(frm) {
        if (frm.doc.from_site && frm.doc.to_site && frm.doc.from_site === frm.doc.to_site) {
            frappe.msgprint(__("From Site and To Site cannot be the same."));
            frm.set_value("to_site", "");  // clear invalid value
        }
    },
    from_site: function(frm) {
        if (frm.doc.from_site && frm.doc.to_site && frm.doc.from_site === frm.doc.to_site) {
            frappe.msgprint(__("From Site and To Site cannot be the same."));
            frm.set_value("from_site", "");  // clear invalid value
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
            filters["name"] = ["!=", frm.doc.from_site];  // exclude the selected from_site
        }
        return { filters: filters };
    });
}