// //==================================================
// // 1. Prevent Same Site Selection
// //================================================== 
// frappe.ui.form.on("Transportation", {
//     to_site: function(frm) {
//         if (frm.doc.from_site && frm.doc.to_site && frm.doc.from_site === frm.doc.to_site) {
//             frappe.msgprint(__("From Site and To Site cannot be the same."));
//             frm.set_value("to_site", ""); // clear invalid value
//         }
//     },
//     from_site: function(frm) {
//         if (frm.doc.from_site && frm.doc.to_site && frm.doc.from_site === frm.doc.to_site) {
//             frappe.msgprint(__("From Site and To Site cannot be the same."));
//             frm.set_value("from_site", ""); // clear invalid value
//         }
//     }
// });


// frappe.ui.form.on("Transportation", {
//     refresh: function(frm) {
//         // Apply filter on To Site whenever form loads
//         set_to_site_filter(frm);
//         set_child_site_filter(frm);
//     },

//     from_site: function(frm) {
//         // Re-apply filter when From Site changes
//         set_to_site_filter(frm);
//     }
// });

// // helper to filter To Site field
// function set_to_site_filter(frm) {
//     frm.set_query("to_site", function() {
//         let filters = {};
//         if (frm.doc.from_site) {
//             filters["name"] = ["!=", frm.doc.from_site]; // exclude the selected from_site
//         }
//         return { filters: filters };
//     });
// }

// //////////////////////////////////////////////////////////////////////////////////


// //==================================================
// // 2. Gate Pass No Filtering & Show Items Dialog
// //==================================================
// frappe.ui.form.on('Transportation', {
//     refresh: function(frm) {
//         // Apply Gate Pass No filter on refresh
//         apply_gate_pass_no_filter(frm);

//         // **NEW**: Apply the filter for the 'Gate Pass BookNo' dropdown
//         frm.set_query("gate_pass_bookno", function() {
//             return {
//                 query: "baps.baps.doctype.transportation.transportation.get_available_gate_pass_books"
//             };
//         });

//         // Also apply the filter for the child 'Gate Pass No' dropdown
//         apply_gate_pass_no_filter(frm);
//     },

//     // This function will run when you select a 'Gate Pass BookNo'
//     gate_pass_bookno: function(frm) {
//         // Clear the old 'Gate Pass No' value
//         frm.set_value("gate_pass_no", "");
//         // Re-apply the filter for the child dropdown
//         apply_gate_pass_no_filter(frm);
//     },

//     // show_items: function (frm) {
//     //     show_items_dialog(frm);
//     // }
//     show_items: function(frm) {
//         if (!frm.doc.from_site || !frm.doc.baps_project || !frm.doc.item_type) {
//             frappe.throw(__("Please select a From Site, Baps Project, and Item Type first."));
//             return;
//         }
//         show_items_dialog(frm);
//     }
// });
// ////////////////////////////////////////////////////////////////////////////////////

// //==================================================
// // 3. Auto-set Selected By (User)
// //==================================================
// frappe.ui.form.on("Transportation", {
//     onload: function(frm) {
//         if (!frm.doc.sender_name) {
//             frm.set_value("sender_name", frappe.session.user);
//         }
//     }
// });

// /////////////////////////////////////////////////////////////////////////////////////

// //==================================================
// // 4. Fetch and Populate Details on Gate Pass No Selection
// //==================================================
// // --- Gate Pass Filter Helpers (Copied from gate_pass_bookno.js for modularity) ---
// // This is the main filtering function
// function apply_gate_pass_no_filter(frm) {
//     // Only apply filters if a book is selected
//     if (frm.doc.gate_pass_bookno) {
//         frm.set_query("gate_pass_no", function() {
//             return {
//                 query: "baps.baps.doctype.transportation.transportation.get_available_gate_passes",
//                 filters: {
//                     'gate_pass_book_no': frm.doc.gate_pass_bookno
//                 }
//             };
//         });
//     }
// }

// //==================================================
// // 5.Transport item table add row button removed by this bellow code 
// //==================================================
// // 
// // frappe.ui.form.on("Transportation", {
// //     onload: function(frm) {
// //         // Disable "Add Row" button
// //         frm.fields_dict["transport_items"].grid.cannot_add_rows = true;
// //         frm.fields_dict["transport_item"].grid.cannot_add_rows = true;
// //         // Hide "Remove" buttons
// //         // frm.fields_dict["transport_items"].grid.only_sortable = true;

// //         frm.refresh_field("transport_items");
// //         frm.refresh_field("transport_item");
// //     }
// // });
// //==================================================
// // 6. validation and formatting for Driver Mobile No
// //==================================================
// // frappe.ui.form.on("Transportation", {
// //     driver_number: function(frm) {
// //         let phone_number = frm.doc.driver_number || "";

// //         // The phone field's value includes the country code from the dropdown.
// //         // We only apply this auto-correction logic if the selected country is India.
// //         // if (phone_number.startsWith("+91")) {

// //         //     // Extract the part after the country code
// //         //     let national_number = phone_number.substring(3).trim();

// //         //     // Remove all non-numeric characters
// //         //     let digits = national_number.replace(/\D/g, "");

// //             // SILENTLY check and remove invalid starting digits (0-5)
// //             if (digits.length > 0 && "012345".includes(digits[0])) {
// //                 digits = digits.substring(1); // Remove the invalid first digit
// //             }

// //             // Trim to a max of 10 digits
// //             if (digits.length > 10) {
// //                 digits = digits.substring(0, 10);
// //             }

// //             // Reconstruct the full number
// //             let corrected_number = "+91 " + digits;

// //             // Update the field only if we made a change. This prevents cursor jumping.
// //             if (frm.doc.driver_number !== corrected_number) {
// //                 frm.set_value("driver_number", corrected_number);
// //             }
// //         }
// //     }
// // );


// // // ------------------------------------------------------------------------------------------------
// // // phone no 

// // frappe.ui.form.on("Transportation", {
// //     // onload: function(frm) {
// //     //     // Set default +91 if empty
// //     //     if (!frm.doc.driver_mobile_no) {
// //     //         frm.set_value("driver_mobile_no", "+91 ");
// //     //     }
// //     // },

// //     driver_mobile_no: function(frm) {
// //         let phone = frm.doc.driver_mobile_no || "";

// //         // Ensure it starts with +91
// //         // if (!phone.startsWith("+91")) {
// //         //     phone = "+91 " + phone.replace(/[^0-9]/g, ""); // keep only numbers after prefix
// //         // }

// //         // Extract only digits after +91
// //         // let digits = phone.replace("+91", "").replace(/\D/g, "");

// //         // Validation: must be max 10 digits
// //         if (digits.length > 10) {
// //             frappe.msgprint(__("Phone number cannot be more than 10 digits after +91"));
// //             digits = digits.substring(0, 10); // trim to 10 digits
// //         }

// //         // Rebuild the number in correct format
// //         // frm.set_value("driver_mobile_no", "+91 " + digits);
// //     }
// // });


// // -----------------------------------------------------------------------------------------------
// // date form past 


// //date

// frappe.ui.form.on("Transportation", {
//     onload: function(frm) {
//         // (optional) if you want a default date you can enable the next line:
//         // if (!frm.doc.date) frm.set_value("date", frappe.datetime.get_today());
//     },

//     // runs when user changes the date field
//     date: function(frm) {
//         // if (frm.doc.date) {
//         //     let today = frappe.datetime.get_today(); // "YYYY-MM-DD"
//         //     if (frm.doc.date < today) {
//         //         frappe.msgprint(__("Date cannot be in the past. Please select today or a future date."));
//         //         frm.set_value("date", ""); // clear invalid value
//         //     }
//         // }
//     },

//     // final client-side safety check before save
//     validate: function(frm) {
//         // if (frm.doc.date) {
//         //     let today = frappe.datetime.get_today();
//         //     if (frm.doc.date < today) {
//         //         frappe.throw(__("Date cannot be in the past. Please select today or a future date."));
//         //     }
//         // }
//     }
// });




// //date

// frappe.ui.form.on("Transportation", {
//     onload: function(frm) {
//         // (optional) if you want a default date you can enable the next line:
//         // if (!frm.doc.date) frm.set_value("date", frappe.datetime.get_today());
//     },

//     // final client-side safety check before save####@@@@@@@@@@@^^^^^^^^^^
//     validate: function(frm) {
//     if (frm.doc.date) {
//         let today = frappe.datetime.get_today();
//         let past5Days = frappe.datetime.add_days(today, -5);  // Subtract 5 days from today

//         // Check if the selected date is more than 5 days ago or a future date
//         if (frm.doc.date > today || frm.doc.date < past5Days) {
//             frappe.throw(__("Date must be within the past 5 days. Please select a valid date."));
//         }
//     }
// }

// });





// // frappe.ui.form.on("Transportation", {
// //     onload: function(frm) {
// //         // Set default +91 if empty
// //         if (!frm.doc.driver_mobile_no) {
// //             frm.set_value("driver_mobile_no", "+91 ");
// //         }
// //     },

// //     driver_mobile_no: function(frm) {
// //         let phone = frm.doc.driver_mobile_no || "";

// //         // Ensure it starts with +91
// //         if (!phone.startsWith("+91")) {
// //             phone = "+91 " + phone.replace(/[^0-9]/g, ""); // keep only numbers after prefix
// //         }

// //         // Extract only digits after +91
// //         let digits = phone.replace("+91", "").replace(/\D/g, "");

// //         // Validation: must be max 10 digits
// //         if (digits.length > 10) {
// //             frappe.msgprint(__("Phone number cannot be more than 10 digits after +91"));
// //             digits = digits.substring(0, 10); // trim to 10 digits
// //         }

// //         // Rebuild the number in correct format
// //         frm.set_value("driver_mobile_no", "+91 " + digits);
// //     }
// // });





// // --- Show Items Dialog ---
// function show_items_dialog(frm) {
//     const d = new frappe.ui.Dialog({
//         title: 'Select Items to Add',
//         fields: [{
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
//         primary_action: function() {
//             const values = d.get_values();
//             const selected_items = [];

//             const checkedBoxes = d.$wrapper.find('input[data-item-checkbox="1"]:checked');
//             checkedBoxes.each(function() {
//                 selected_items.push({
//                     item_no: $(this).data('item-id'),
//                     baps_project: values.baps_project,
//                     item_type: values.item_type
//                 });
//             });

//             if (selected_items.length === 0) {
//                 frappe.msgprint(__('Please select at least one item.'));
//                 return;
//             }

//             // --- THIS IS THE UPDATED LOGIC ---
//             // Get a list of items already in the table to avoid adding duplicates
//             const existing_items = (frm.doc.transport_item || []).map(row => row.item_no);

//             let added_count = 0;
//             selected_items.forEach(item => {
//                 // If the item is not already in the table, add it
//                 if (!existing_items.includes(item.item_no)) {
//                     let child_row = frm.add_child('transport_item');
//                     child_row.baps_project = item.baps_project;
//                     child_row.item_type = item.item_type;
//                     child_row.item_no = item.item_no;
//                     added_count++;
//                 }
//             });

//             // Refresh the child table to show the new rows
//             frm.refresh_field('transport_item');
//             frappe.show_alert({ message: __(added_count + " item(s) added to the table."), indicator: 'green' });
//             d.hide();
//         }
//     });

//     d.fields_dict.baps_project.df.onchange = () => update_items_list(d, frm);
//     d.fields_dict.item_type.df.onchange = () => update_items_list(d, frm);

//     update_items_list(d, frm);
//     d.show();
// }

// function update_items_list(dialog, frm) {
//     const values = dialog.get_values();
//     const project = values ?.baps_project;
//     const item_type = values ?.item_type;
//     const from_site = frm.doc.from_site;
//     const $items_wrapper = dialog.fields_dict.items_html.$wrapper;

//     if (!project || !item_type) {
//         $items_wrapper.html(`<p class="text-muted">Please select a Baps Project and Item Type.</p>`);
//         return;
//     }

//     // Only support "Block" for now
//     if (item_type !== "Block") {
//         $items_wrapper.html(`<p class="text-muted">Only 'Block' is currently supported.</p>`);
//         return;
//     }

//     // 1️⃣ Get already added block names
//     const existing_blocks = (frm.doc.transport_item || [])
//         .filter(row => row.item_type === "Block")
//         .map(row => row.item_no);

//     // 2️⃣ Fetch blocks for the selected project
//     frappe.call({
//         method: "frappe.client.get_list",
//         args: {
//             doctype: "Block",
//             filters: {
//                 baps_project: project
//             },
//             fields: ["name", "block_number", "baps_project"],
//             limit_page_length: 1000
//         },
//         callback: function(r) {
//             let blocks = r.message || [];

//             // 3️⃣ Filter out already selected blocks
//             const new_blocks = blocks.filter(b => !existing_blocks.includes(b.name));

//             if (new_blocks.length === 0) {
//                 $items_wrapper.html(`<p class="text-muted">All blocks from this project have already been added.</p>`);
//                 return;
//             }

//             // 4️⃣ Render remaining blocks
//             let html = `<div class="p-2 border rounded" style="max-height: 300px; overflow-y: auto;">`;
//             new_blocks.forEach(block => {
//                 const block_id = frappe.utils.escape_html(block.name);
//                 const block_number = frappe.utils.escape_html(block.block_number || block.name);
//                 html += `
//                     <div class="checkbox">
//                         <label>
//                             <input type="checkbox" data-item-checkbox="1" data-item-id="${block_id}" />
//                             ${block_number}
//                         </label>
//                     </div>`;
//             });
//             html += `</div>`;

//             $items_wrapper.html(html);
//         }
//     });
// }

// frappe.ui.form.on('YourDocTypeName', {
//     // This function runs when the button with the fieldname 'show_table_button' is clicked
//     show_table_button: function(frm) {
//         // This single line makes the table visible
//         frm.toggle_display('my_item_table', true);
//     }
// });


// // frappe.ui.form.on('Transportation', {
// //     refresh(frm) {
// //         var sender = frappe.user_roles.includes("Transportation Sender");
// //         var receiver = frappe.user_roles.includes("Transportation Receiver");
// //         var status = frm.doc.status; // your status field

// //         // Sender logic
// //         if(sender && !receiver) {
// //             frm.set_df_property('transportation_status_r', 'hidden', 1);
// //             frm.set_df_property('additional_material_received', 'hidden', 1);
// //             frm.set_df_property('additional_item_received', 'hidden', 1);
// //             // ...hide more fields/tables for sender as specified
// //         }

// //         // Receiver logic
// //         if(receiver && !sender) {
// //             frm.set_df_property('transport_item_table', 'hidden', 1);
// //             frm.set_df_property('gate_pass_bookno', 'read_only', 1);
// //             // ...hide/make read-only sender fields in receiver view
// //         }

// //         // If both roles, use status
// //         if(sender && receiver) {
// //             if(status == 'Draft') {
// //                 // treat as sender
// //             } else {
// //                 // treat as receiver
// //             }
// //         }
// //     },
// //     // Auto-copy logic on status change
// //     after_save(frm) {
// //         if(frappe.user_roles.includes("Transportation Receiver") && frm.doc.status == "Pending To Receive") {
// //             // use frappe.call to trigger server-side script that copies the children
// //         }
// //     }
// // });


// //////////////////////////////////////////////////////////////////////////////////
// // 7. Gate Pass Book No Filtering Based on Assignment
// //==================================================
// frappe.ui.form.on('Transportation', {
//   refresh(frm) {
//     frm.set_query('gate_pass_bookno', () => ({
//       filters: { assigned_to: frappe.session.user }
//     }));
//   },
// });

// // ✅ Date Validation: Allow past 5 days + today + any future date
// frappe.ui.form.on("Transportation", {
//     date: function (frm) {
//         if (frm.doc.date) {
//             let today = frappe.datetime.get_today();
//             let past5 = frappe.datetime.add_days(today, -5);

//             // Only check lower limit (older than 5 days)
//             if (frm.doc.date < past5) {
//                 frappe.show_alert({
//                     message: __("Date cannot be older than 5 days."),
//                     indicator: "red",
//                 });
//                 frm.set_value("date", "");
//             }
//         }
//     },

//     validate: function (frm) {
//         if (frm.doc.date) {
//             let today = frappe.datetime.get_today();
//             let past5 = frappe.datetime.add_days(today, -5);

//             // Only restrict if older than 5 days
//             if (frm.doc.date < past5) {
//                 frappe.throw(__("Date cannot be older than 5 days. Please select a valid date."));
//             }
//         }
//     },
// });
// ////////////////////////////////////////////////////////////////////////////////////

// // 8. Auto-set Sender Name to Current User on New Document
// //==================================================
// frappe.ui.form.on("Transportation", {
// //     /**
// //      * This function runs when the form is loaded.
// //      */
// //     onload: function(frm) {
// //         // This condition checks if the document is new (not yet saved).
// //         if (frm.is_new()) {
// //             // Set the 'sender_name' field to the current user's full name.
// //             frm.set_value('sender_name', frappe.session.name);
// //         }
// //     }
//      // This is the updated 'refresh' function inside your script
//     refresh: function(frm) {
//     // Requirement: Hide the "Add Row" button for the child table.
//         frm.grid("transport_item").cannot_add_rows = true;

//     // --- ADD THE NEW CODE BLOCK HERE ---
//         frm.set_query('your_status_field', function() { // � ***CHANGE THIS FIELDNAME***
//             return {
//                 filters: {
//                     'name': ['in', ['Available', 'In Transit']] // � ***CHANGE THESE STATES***
//                 }
//             };
//         });
//     // --- END OF NEW CODE BLOCK ---

//     // Filter for Gate Pass BookNo (existing code)
//         frm.set_query('gate_pass_bookno', () => {
//             return {
//                 query: "baps.baps.doctype.transportation.transportation.get_available_gate_pass_books"
//             };
//         });

//     // Filter for Gate Pass No (existing code)
//         apply_gate_pass_no_filter(frm);

//     // Filter for To Site (existing code)
//         set_to_site_filter(frm);
//     },
// });

// //==================================================
// // 9. validation and formatting for Driver Mobile No
// //==================================================
// frappe.ui.form.on("Transportation", {
//     driver_number: function(frm) {
//         let phone_number = frm.doc.driver_number || "";

//             // Extract the part after the country code
//             let national_number = phone_number.substring(3).trim();

//             // Remove all non-numeric characters
//             let digits = national_number.replace(/\D/g, "");

//             // SILENTLY check and remove invalid starting digits (0-5)
//             if (digits.length > 0 && "012345".includes(digits[0])) {
//                 digits = digits.substring(1); // Remove the invalid first digit
//             }

//             // Trim to a max of 10 digits
//             if (digits.length > 10) {
//                 digits = digits.substring(0, 10);
//             }

//             // Reconstruct the full number
//             let corrected_number = "+91 " + digits;

//             // Update the field only if we made a change. This prevents cursor jumping.
//             if (frm.doc.driver_number !== corrected_number) {
//                 frm.set_value("driver_number", corrected_number);
//             }
//         }
//     }
// );

// // ==========================================================
// // 10. Filter "Site" field in child table based on From/To Site
// // ==========================================================
// /**
//  * Applies a filter to the 'site' field in the 'transport_item' child table.
//  * It excludes the values from the parent 'from_site' and 'to_site' fields.
//  */
// function set_child_site_filter(frm) {
//     frm.set_query('site', 'transport_item', function(doc) {
//         let exclude_sites = [];

//         if (doc.from_site) {
//             exclude_sites.push(doc.from_site);
//         }
//         if (doc.to_site) {
//             exclude_sites.push(doc.to_site);
//         }

//         // This ensures the filter doesn't break if both fields are empty
//         if (exclude_sites.length === 0) {
//             return {}; // No filters, return all sites
//         }

//         return {
//             filters: {
//                 'name': ['not in', exclude_sites]
//             }
//         };
//     });
// }

// //==================================================
// // 1. HELPER: Filter Parent 'To Site'
// //==================================================
// function set_to_site_filter(frm) {
//     frm.set_query("to_site", function() {
//         let filters = {};
//         if (frm.doc.from_site) {
//             filters["name"] = ["!=", frm.doc.from_site]; // exclude the selected from_site
//         }
//         return { filters: filters };
//     });
// }

// //==================================================
// // 2. HELPER: Filter 'Gate Pass No'
// //==================================================
// function apply_gate_pass_no_filter(frm) {
//     if (frm.doc.gate_pass_bookno) {
//         frm.set_query("gate_pass_no", function() {
//             return {
//                 query: "baps.baps.doctype.transportation.transportation.get_available_gate_passes",
//                 filters: {
//                     'gate_pass_book_no': frm.doc.gate_pass_bookno
//                 }
//             };
//         });
//     }
// }

// //==================================================
// // 3. HELPER: Filter Child Table 'Site' (Your New Requirement)
// //==================================================
// function set_child_site_filter(frm) {
//     // Note: 'transport_item' is the fieldname of your child table
//     frm.set_query('site', 'transport_item', function(doc) {
//         let exclude_sites = [];

//         if (doc.from_site) {
//             exclude_sites.push(doc.from_site);
//         }
//         if (doc.to_site) {
//             exclude_sites.push(doc.to_site);
//         }

//         if (exclude_sites.length === 0) {
//             return {}; // No filters
//         }

//         return {
//             filters: {
//                 'name': ['not in', exclude_sites]
//             }
//         };
//     });
// }

// //==================================================
// // 4. MAIN EVENT HANDLERS
// //==================================================
// frappe.ui.form.on("Transportation", {
//     /**
//      * ONLOAD: Runs when the form wrapper is first created.
//      */
//     onload: function(frm) {
//         // Auto-set Sender Name (from your section 3)
//         if (!frm.doc.sender_name) {
//             frm.set_value("sender_name", frappe.session.user);
//         }
//     },

//     /**
//      * REFRESH: Runs when the form is loaded or re-rendered.
//      */
//     refresh: function(frm) {
//         // Hide "Add Row" button (from your section 8)
//         frm.grid("transport_item").cannot_add_rows = true;

//         // Filter 'To Site' (from your section 1)
//         set_to_site_filter(frm);

//         // Filter 'Gate Pass BookNo' (from your section 7)
//         frm.set_query('gate_pass_bookno', () => ({
//             filters: { assigned_to: frappe.session.user }
//         }));

//         // Filter 'Gate Pass No' (from your section 2)
//         apply_gate_pass_no_filter(frm);

//         // Filter 'Site' in child table (Your New Requirement)
//         set_child_site_filter(frm);

//         // This is from your section 8. Fix the fieldname.
//         frm.set_query('your_status_field', function() { //  ***CHANGE THIS FIELDNAME***
//             return {
//                 filters: {
//                     'name': ['in', ['Available', 'In Transit']] //  ***CHANGE THESE STATES***
//                 }
//             };
//         });
//     },

//     /**
//      * VALIDATE: Runs before saving.
//      */
//     validate: function(frm) {
//         // Date validation (from your section 7)
//         if (frm.doc.date) {
//             let today = frappe.datetime.get_today();
//             let past5 = frappe.datetime.add_days(today, -5);
//             if (frm.doc.date < past5) {
//                 frappe.throw(__("Date cannot be older than 5 days. Please select a valid date."));
//             }
//         }
//     },

//     //==================================================
//     // Field-level Event Handlers
//     //==================================================

//     from_site: function(frm) {
//         // Prevent same site (from your section 1)
//         if (frm.doc.from_site && frm.doc.to_site && frm.doc.from_site === frm.doc.to_site) {
//             frappe.msgprint(__("From Site and To Site cannot be the same."));
//             frm.set_value("from_site", "");
//         }
//         // Re-apply parent and child site filters
//         set_to_site_filter(frm);
//         set_child_site_filter(frm); // <-- Added this
//     },

//     to_site: function(frm) {
//         // Prevent same site (from your section 1)
//         if (frm.doc.from_site && frm.doc.to_site && frm.doc.from_site === frm.doc.to_site) {
//             frappe.msgprint(__("From Site and To Site cannot be the same."));
//             frm.set_value("to_site", "");
//         }
//         // Re-apply child site filter
//         set_child_site_filter(frm); // <-- Added this
//     },

//     date: function(frm) {
//         // Date validation on change (from your section 7)
//         if (frm.doc.date) {
//             let today = frappe.datetime.get_today();
//             let past5 = frappe.datetime.add_days(today, -5);
//             if (frm.doc.date < past5) {
//                 frappe.show_alert({
//                     message: __("Date cannot be older than 5 days."),
//                     indicator: "red",
//                 });
//                 frm.set_value("date", "");
//             }
//         }
//     },

//     gate_pass_bookno: function(frm) {
//         // (From your section 2)
//         frm.set_value("gate_pass_no", "");
//         apply_gate_pass_no_filter(frm);
//     },

//     show_items: function(frm) {
//         // (From your section 2)
//         if (!frm.doc.from_site || !frm.doc.baps_project || !frm.doc.item_type) {
//             frappe.throw(__("Please select a From Site, Baps Project, and Item Type first."));
//             return;
//         }
//         show_items_dialog(frm);
//     },

//     driver_number: function(frm) {
//         // (From your section 9)
//         let phone_number = frm.doc.driver_number || "";
//         let national_number = phone_number.substring(3).trim();
//         let digits = national_number.replace(/\D/g, "");

//         if (digits.length > 0 && "012345".includes(digits[0])) {
//             digits = digits.substring(1);
//         }
//         if (digits.length > 10) {
//             digits = digits.substring(0, 10);
//         }

//         let corrected_number = "+91 " + digits;
//         if (frm.doc.driver_number !== corrected_number) {
//             frm.set_value("driver_number", corrected_number);
//         }
//     },

//     /**
//      * Child Table Event: Runs when "Add Row" is clicked.
//      */
//     transport_item_add: function(frm) {
//         // (Your New Requirement)
//         set_child_site_filter(frm);
//     }
// });


// //==================================================
// // 5. 'Show Items' Dialog Functions
// // (Copied from your code)
// //==================================================

// function show_items_dialog(frm) {
//     const d = new frappe.ui.Dialog({
//         title: 'Select Items to Add',
//         fields: [{
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
//         primary_action: function() {
//             const values = d.get_values();
//             const selected_items = [];

//             const checkedBoxes = d.$wrapper.find('input[data-item-checkbox="1"]:checked');
//             checkedBoxes.each(function() {
//                 selected_items.push({
//                     item_no: $(this).data('item-id'),
//                     baps_project: values.baps_project,
//                     item_type: values.item_type
//                 });
//             });

//             if (selected_items.length === 0) {
//                 frappe.msgprint(__('Please select at least one item.'));
//                 return;
//             }

//             const existing_items = (frm.doc.transport_item || []).map(row => row.item_no);
//             let added_count = 0;
//             selected_items.forEach(item => {
//                 if (!existing_items.includes(item.item_no)) {
//                     let child_row = frm.add_child('transport_item');
//                     child_row.baps_project = item.baps_project;
//                     child_row.item_type = item.item_type;
//                     child_row.item_no = item.item_no;
//                     added_count++;
//                 }
//             });

//             frm.refresh_field('transport_item');
//             frappe.show_alert({ message: __(added_count + " item(s) added to the table."), indicator: 'green' });
//             d.hide();
//         }
//     });

//     d.fields_dict.baps_project.df.onchange = () => update_items_list(d, frm);
//     d.fields_dict.item_type.df.onchange = () => update_items_list(d, frm);

//     update_items_list(d, frm);
//     d.show();
// }

// function update_items_list(dialog, frm) {
//     const values = dialog.get_values();
//     const project = values?.baps_project;
//     const item_type = values?.item_type;
//     const from_site = frm.doc.from_site;
//     const $items_wrapper = dialog.fields_dict.items_html.$wrapper;

//     if (!project || !item_type) {
//         $items_wrapper.html(`<p class="text-muted">Please select a Baps Project and Item Type.</p>`);
//         return;
//     }

//     if (item_type !== "Block") {
//         $items_wrapper.html(`<p class="text-muted">Only 'Block' is currently supported.</p>`);
//         return;
//     }

//     const existing_blocks = (frm.doc.transport_item || [])
//         .filter(row => row.item_type === "Block")
//         .map(row => row.item_no);

//     frappe.call({
//         method: "frappe.client.get_list",
//         args: {
//             doctype: "Block",
//             filters: {
//                 baps_project: project
//             },
//             fields: ["name", "block_number", "baps_project"],
//             limit_page_length: 1000
//         },
//         callback: function(r) {
//             let blocks = r.message || [];
//             const new_blocks = blocks.filter(b => !existing_blocks.includes(b.name));

//             if (new_blocks.length === 0) {
//                 $items_wrapper.html(`<p class="text-muted">All blocks from this project have already been added.</p>`);
//                 return;
//             }

//             let html = `<div class="p-2 border rounded" style="max-height: 300px; overflow-y: auto;">`;
//             new_blocks.forEach(block => {
//                 const block_id = frappe.utils.escape_html(block.name);
//                 const block_number = frappe.utils.escape_html(block.block_number || block.name);
//                 html += `
//                     <div class="checkbox">
//                         <label>
//                             <input type="checkbox" data-item-checkbox="1" data-item-id="${block_id}" />
//                             ${block_number}
//                         </label>
//                     </div>`;
//             });
//             html += `</div>`;
//             $items_wrapper.html(html);
//         }
//     });
// }


// // Date Validation: Allow past 5 days + today + Only one future date.
// frappe.ui.form.on("Transportation", {
//     date: function (frm) {
//         if (frm.doc.date) {
//             let today = frappe.datetime.get_today();
//             let past5 = frappe.datetime.add_days(today, -5);
//             let tomorrow = frappe.datetime.add_days(today, 1);

//             // If older than past 5 days
//             if (frm.doc.date < past5) {
//                 frappe.show_alert({
//                     message: __("Date cannot be older than 5 days."),
//                     indicator: "red",
//                 });
//                 frm.set_value("date", "");
//             }

//             // If more than 1 day in the future
//             else if (frm.doc.date > tomorrow) {
//                 frappe.show_alert({
//                     message: __("You can select only up to tomorrow’s date."),
//                     indicator: "red",
//                 });
//                 frm.set_value("date", "");
//             }
//         }
//     },

//     validate: function (frm) {
//         if (frm.doc.date) {
//             let today = frappe.datetime.get_today();
//             let past5 = frappe.datetime.add_days(today, -5);
//             let tomorrow = frappe.datetime.add_days(today, 1);

//             if (frm.doc.date < past5) {
//                 frappe.throw(__("Date cannot be older than 5 days. Please select a valid date."));
//             }

//             if (frm.doc.date > tomorrow) {
//                 frappe.throw(__("You can select only up to tomorrow’s date."));
//             }
//         }
//     },
// });

// // ----------------------------------------------------------------------
// // Show Items Dialog (Filter Blocks by Site instead of Project)
// // ----------------------------------------------------------------------
// // function show_items_dialog(frm) {
// //     const d = new frappe.ui.Dialog({
// //         title: "Select Items to Add",
// //         fields: [

// //             {
// //                 label: "Site",
// //                 fieldname: "site",
// //                 fieldtype: "Link",
// //                 options: "Site",
// //                 reqd: 1,
// //                 default: frm.doc.from_site || frm.doc.to_site, // auto pick if available
// //             },
// //             {
// //                 label: "Item Type",
// //                 fieldname: "item_type",
// //                 fieldtype: "Link",
// //                 options: "Item Type",
// //                 reqd: 1,
// //                 default: frm.doc.item_type,
// //             },
// //             { fieldtype: "Section Break", label: "Available Items" },
// //             { fieldname: "items_html", fieldtype: "HTML" },
// //         ],
// //         primary_action_label: "Add Selected",
// //         primary_action(values) {
// //             // (your add item logic here, unchanged)
// //         },
// //     });

// //     // 🔁 Update available list when site changes
// //     d.fields_dict.site.df.onchange = () => update_items_list(d, frm);
// //     d.fields_dict.item_type.df.onchange = () => update_items_list(d, frm);

// //     update_items_list(d, frm);
// //     d.show();
// // }

// // // ----------------------------------------------------------------------
// // // Fetch blocks filtered by Site only
// // // ----------------------------------------------------------------------
// // function update_items_list(dialog, frm) {
// //     const v = dialog.get_values();
// //     const site = v?.site;
// //     const item_type = v?.item_type;
// //     const $wrap = dialog.fields_dict.items_html.$wrapper;

// //     if (!site || !item_type) {
// //         $wrap.html(`<p class="text-muted">Please select a site and item type.</p>`);
// //         return;
// //     }

// //     frappe.call({
// //         method: "frappe.client.get_list",
// //         args: {
// //             doctype: "Block",
// //             filters: { site: site }, // ✅ only site filter
// //             fields: ["name", "block_number", "site"],
// //         },
// //         callback(r) {
// //             const blocks = r.message || [];
// //             if (!blocks.length) {
// //                 $wrap.html(`<p class="text-muted">No blocks found for this site.</p>`);
// //                 return;
// //             }

// //             // Simple display list
// //             let html = `
// //                 <table class="table table-bordered table-sm">
// //                     <thead>
// //                         <tr>
// //                             <th style="width:5%"></th>
// //                             <th>Block Number</th>
// //                             <th>Site</th>
// //                         </tr>
// //                     </thead>
// //                     <tbody>
// //             `;
// //             blocks.forEach(b => {
// //                 html += `
// //                     <tr>
// //                         <td><input type="checkbox" data-item-checkbox="1" data-item-id="${b.name}" /></td>
// //                         <td>${b.block_number || b.name}</td>
// //                         <td>${b.site || ""}</td>
// //                     </tr>
// //                 `;
// //             });
// //             html += "</tbody></table>";
// //             $wrap.html(html);
// //         },
// //     });
// // }
// //==================================================
// // 1. HELPER: Filter Parent 'To Site'
// //==================================================
// function set_to_site_filter(frm) {
//     frm.set_query("to_site", function () {
//         let filters = {};
//         if (frm.doc.from_site) {
//             filters["name"] = ["!=", frm.doc.from_site];
//         }
//         return { filters: filters };
//     });
// }

// //==================================================
// // 2. HELPER: Filter 'Gate Pass No'
// //==================================================
// function apply_gate_pass_no_filter(frm) {
//     if (frm.doc.gate_pass_bookno) {
//         frm.set_query("gate_pass_no", function () {
//             return {
//                 query: "baps.baps.doctype.transportation.transportation.get_available_gate_passes",
//                 filters: {
//                     'gate_pass_book_no': frm.doc.gate_pass_bookno
//                 }
//             };
//         });
//     }
// }

// //==================================================
// // 3. MAIN EVENT HANDLERS
// // (All logic is merged into this one block)
// //==================================================
// frappe.ui.form.on("Transportation", {
//     /**
//      * ONLOAD: Runs when the form wrapper is first created.
//      */
//     onload: function (frm) {
//         // Auto-set Sender Name
//         if (frm.is_new() && !frm.doc.sender_name) {
//             frm.set_value("sender_name", frappe.session.user);
//         }
//     },

//     /**
//      * REFRESH: Runs when the form is loaded or re-rendered.
//      */
//     refresh: function (frm) {
//         // Hide Add Row Button
//         frm.grid("transport_item").cannot_add_rows = true;
//         frm.refresh_field("transport_item");

//         // Filter 'To Site'
//         set_to_site_filter(frm);

//         // Filter 'Gate Pass BookNo' (based on assignment)
//         frm.set_query('gate_pass_bookno', () => ({
//             filters: { assigned_to: frappe.session.user }
//         }));

//         // Filter 'Gate Pass No'
//         apply_gate_pass_no_filter(frm);

//         // Filter 'Site' in child table (from previous request)
//         frm.fields_dict['transport_item'].grid.get_field('site').get_query = function (doc, cdt, cdn) {
//             let exclude_sites = [];
//             if (frm.doc.from_site) {
//                 exclude_sites.push(frm.doc.from_site);
//             }
//             if (frm.doc.to_site) {
//                 exclude_sites.push(frm.doc.to_site);
//             }

//             return {
//                 filters: {
//                     'name': ['not in', exclude_sites.length ? exclude_sites : ['']]
//                 }
//             };
//         };

//         // This is from your old code. Fix the fieldname.
//         frm.set_query('your_status_field', function () { //  ***FIX THIS FIELDNAME***
//             return {
//                 filters: {
//                     'name': ['in', ['Available', 'In Transit']] //  ***FIX THESE STATES***
//                 }
//             };
//         });
//     },

//     /**
//      * VALIDATE: Runs before saving. (Merged from your new snippet)
//      */
//     validate: function (frm) {
//         if (frm.doc.date) {
//             let today = frappe.datetime.get_today();
//             let past5 = frappe.datetime.add_days(today, -5);
//             let tomorrow = frappe.datetime.add_days(today, 1);

//             if (frm.doc.date < past5) {
//                 frappe.throw(__("Date cannot be older than 5 days. Please select a valid date."));
//             }

//             if (frm.doc.date > tomorrow) {
//                 frappe.throw(__("You can select only up to tomorrow’s date."));
//             }
//         }
//     },

//     //==================================================
//     // Field-level Event Handlers
//     //==================================================

//     from_site: function (frm) {
//         if (frm.doc.from_site && frm.doc.to_site && frm.doc.from_site === frm.doc.to_site) {
//             frappe.msgprint(__("From Site and To Site cannot be the same."));
//             frm.set_value("from_site", "");
//         }
//         set_to_site_filter(frm);
//     },

//     to_site: function (frm) {
//         if (frm.doc.from_site && frm.doc.to_site && frm.doc.from_site === frm.doc.to_site) {
//             frappe.msgprint(__("From Site and To Site cannot be the same."));
//             frm.set_value("to_site", "");
//         }
//     },

//     date: function (frm) {
//         // (Merged from your new snippet)
//         if (frm.doc.date) {
//             let today = frappe.datetime.get_today();
//             let past5 = frappe.datetime.add_days(today, -5);
//             let tomorrow = frappe.datetime.add_days(today, 1);

//             if (frm.doc.date < past5) {
//                 frappe.show_alert({
//                     message: __("Date cannot be older than 5 days."),
//                     indicator: "red",
//                 });
//                 frm.set_value("date", "");
//             }
//             else if (frm.doc.date > tomorrow) {
//                 frappe.show_alert({
//                     message: __("You can select only up to tomorrow’s date."),
//                     indicator: "red",
//                 });
//                 frm.set_value("date", "");
//             }
//         }
//     },

//     gate_pass_bookno: function (frm) {
//         frm.set_value("gate_pass_no", "");
//         apply_gate_pass_no_filter(frm);
//     },

//     show_items: function (frm) {
//         // This validation is CRITICAL for your new request.
//         if (!frm.doc.from_site || !frm.doc.baps_project || !frm.doc.item_type) {
//             frappe.throw(__("Please select a From Site, Baps Project, and Item Type first."));
//             return;
//         }
//         show_items_dialog(frm);
//     },

//     driver_number: function (frm) {
//         let phone_number = frm.doc.driver_number || "";
//         let national_number = phone_number.substring(3).trim();
//         let digits = national_number.replace(/\D/g, "");

//         if (digits.length > 0 && "012345".includes(digits[0])) {
//             digits = digits.substring(1);
//         }
//         if (digits.length > 10) {
//             digits = digits.substring(0, 10);
//         }

//         let corrected_number = "+91 " + digits;
//         if (frm.doc.driver_number !== corrected_number) {
//             frm.set_value("driver_number", corrected_number);
//         }
//     }
// });


// //==================================================
// // 4. 'Show Items' Dialog Functions
// //==================================================

// /**
//  * This function creates the pop-up dialog.
//  * It has NOT been changed.
//  */
// function show_items_dialog(frm) {
//     const d = new frappe.ui.Dialog({
//         title: 'Select Items to Add',
//         fields: [{
//             label: 'Baps Project',
//             fieldname: 'baps_project',
//             fieldtype: 'Link',
//             options: 'Baps Project',
//             reqd: true,
//             default: frm.doc.baps_project
//         },
//         {
//             label: 'Item Type',
//             fieldname: 'item_type',
//             fieldtype: 'Link',
//             options: 'Item Type',
//             reqd: true,
//             default: frm.doc.item_type
//         },
//         { fieldtype: 'Section Break', label: 'Available for Selection' },
//         { fieldname: 'items_html', fieldtype: 'HTML' }
//         ],
//         primary_action_label: 'Add Selected',
//         primary_action: function () {
//             const values = d.get_values();
//             const selected_items = [];

//             const checkedBoxes = d.$wrapper.find('input[data-item-checkbox="1"]:checked');
//             checkedBoxes.each(function () {
//                 selected_items.push({
//                     item_no: $(this).data('item-id'),
//                     baps_project: values.baps_project,
//                     item_type: values.item_type
//                 });
//             });

//             if (selected_items.length === 0) {
//                 frappe.msgprint(__('Please select at least one item.'));
//                 return;
//             }

//             const existing_items = (frm.doc.transport_item || []).map(row => row.item_no);
//             let added_count = 0;
//             selected_items.forEach(item => {
//                 if (!existing_items.includes(item.item_no)) {
//                     let child_row = frm.add_child('transport_item');
//                     child_row.baps_project = item.baps_project;
//                     child_row.item_type = item.item_type;
//                     child_row.item_no = item.item_no;
//                     added_count++;
//                 }
//             });

//             frm.refresh_field('transport_item');
//             frappe.show_alert({ message: __(added_count + " item(s) added to the table."), indicator: 'green' });
//             d.hide();
//         }
//     });

//     d.fields_dict.baps_project.df.onchange = () => update_items_list(d, frm);
//     d.fields_dict.item_type.df.onchange = () => update_items_list(d, frm);

//     update_items_list(d, frm);
//     d.show();
// }

// /**
//  * --- THIS IS THE MODIFIED FUNCTION ---
//  * It now fetches blocks based on Project, Site, and Status.
//  */
// function update_items_list(dialog, frm) {
//     const values = dialog.get_values();
//     const $items_wrapper = dialog.fields_dict.items_html.$wrapper;

//     // Get values from the dialog
//     const project = values?.baps_project;
//     const item_type = values?.item_type;

//     // Get values from the PARENT form
//     const from_site = frm.doc.from_site;

//     if (!project || !item_type) {
//         $items_wrapper.html(`<p class="text-muted">Please select a Baps Project and Item Type.</p>`);
//         return;
//     }

//     // This check is redundant because of the 'show_items' click handler, but it's safe.
//     if (!from_site) {
//         $items_wrapper.html(`<p class="text-muted">Please set a 'From Site' on the main form first.</p>`);
//         return;
//     }

//     if (item_type !== "Block") {
//         $items_wrapper.html(`<p class="text-muted">Only 'Block' is currently supported.</p>`);
//         return;
//     }

//     // 1. Get blocks already in the child table to prevent duplicates
//     const existing_blocks = (frm.doc.transport_item || [])
//         .filter(row => row.item_type === "Block")
//         .map(row => row.item_no);

//     // 2. Define the new, precise filters
//     const new_filters = {
//         'baps_project': project,
//         'site': from_site,
//         'transportation_status': 'Can Transit' // As per your requirement
//     };

//     // 3. Fetch blocks from "Block" doctype
//     frappe.call({
//         method: "frappe.client.get_list",
//         args: {
//             doctype: "Block",
//             filters: new_filters,
//             fields: ["name", "block_number", "site", "transportation_status"],
//             limit_page_length: 1000
//         },
//         callback: function (r) {
//             let blocks = r.message || [];

//             // 4. Filter out blocks already added to the table
//             const new_blocks = blocks.filter(b => !existing_blocks.includes(b.name));

//             if (new_blocks.length === 0) {
//                 if (blocks.length > 0) {
//                     $items_wrapper.html(`<p class="text-muted">All available blocks from this site have already been added.</p>`);
//                 } else {
//                     $items_wrapper.html(`<p class="text-muted">No blocks found matching your criteria:<br>
//                         - Project: ${project}<br>
//                         - Site: ${from_site}<br>
//                         - Status: 'Can Transit'
//                     </p>`);
//                 }
//                 return;
//             }

//             // 5. Render the list of available blocks as a table
//             let html = `<table class="table table-bordered table-sm" style="font-size: 12px;">
//                             <thead class="text-muted">
//                                 <tr>
//                                     <th style="width: 30px;"></th>
//                                     <th>Block Number</th>
//                                     <th>Site</th>
//                                     <th>Status</th>
//                                 </tr>
//                             </thead>
//                             <tbody>`;
//             new_blocks.forEach(block => {
//                 const block_id = frappe.utils.escape_html(block.name);
//                 const block_number = frappe.utils.escape_html(block.block_number || block.name);
//                 const site = frappe.utils.escape_html(block.site || "");
//                 const status = frappe.utils.escape_html(block.transportation_status || "");

//                 html += `
//                     <tr>
//                         <td><input type="checkbox" data-item-checkbox="1" data-item-id="${block_id}" /></td>
//                         <td>${block_number}</td>
//                         <td>${site}</td>
//                         <td>${status}</td>
//                     </tr>`;
//             });
//             html += `</tbody></table>`;

//             // Add the wrapper div
//             $items_wrapper.html(`<div class="p-2 border rounded" style="max-height: 300px; overflow-y: auto;">${html}</div>`);
//         }
//     });
// }

// // 2️⃣ Gate Pass No Filtering & Show Items Dialog
// // ----------------------------------------------------------------------
// frappe.ui.form.on("Transportation", {
//     refresh: function (frm) {
//         apply_gate_pass_no_filter(frm);
//         set_to_site_filter(frm);

//         frm.set_query("gate_pass_bookno", function () {
//             return {
//                 query: "baps.baps.doctype.transportation.transportation.get_available_gate_pass_books",
//             };
//         });

//         frm.set_query("gate_pass_bookno", () => ({
//             filters: { assigned_to: frappe.session.user },
//         }));

//         // Hide Add Row Button
//         if (frm.fields_dict.transport_item && frm.fields_dict.transport_item.grid) {
//             frm.fields_dict.transport_item.grid.cannot_add_rows = true;
//             frm.refresh_field("transport_item");
//         }
//     },

//     gate_pass_bookno: function (frm) {
//         frm.set_value("gate_pass_no", "");
//         apply_gate_pass_no_filter(frm);
//     },

//     show_items: function (frm) {
//         if (!frm.doc.from_site || !frm.doc.baps_project || !frm.doc.item_type) {
//             frappe.throw(__("Please select a From Site, Baps Project, and Item Type first."));
//             return;
//         }
//         show_items_dialog(frm);
//     },
// });

// //==================================================
// // 1. HELPER: Filter Parent 'To Site'
// //==================================================
// function set_to_site_filter(frm) {
//     frm.set_query("to_site", function () {
//         let filters = {};
//         if (frm.doc.from_site) {
//             filters["name"] = ["!=", frm.doc.from_site];
//         }
//         return { filters: filters };
//     });
// }

// //==================================================
// // 2. HELPER: Filter 'Gate Pass No'
// //==================================================
// function apply_gate_pass_no_filter(frm) {
//     if (frm.doc.gate_pass_bookno) {
//         frm.set_query("gate_pass_no", function () {
//             return {
//                 query: "baps.baps.doctype.transportation.transportation.get_available_gate_passes",
//                 filters: {
//                     'gate_pass_book_no': frm.doc.gate_pass_bookno
//                 }
//             };
//         });
//     }
// }

// //==================================================
// // 3. MAIN EVENT HANDLERS
// // (All your logic is now merged into this one block)
// //==================================================
// frappe.ui.form.on("Transportation", {
//     /**
//      * ONLOAD: Runs when the form wrapper is first created.
//      */
//     onload: function (frm) {
//         // Auto-set Sender Name
//         if (frm.is_new() && !frm.doc.sender_name) {
//             frm.set_value("sender_name", frappe.session.user);
//         }
//     },

//     /**
//      * REFRESH: Runs when the form is loaded or re-rendered.
//      */
//     refresh: function (frm) {
//         // --- THIS IS THE FIX ---
//         // It's now inside the one block that actually runs.
//         if (frm.fields_dict.transport_item && frm.fields_dict.transport_item.grid) {
//             frm.fields_dict.transport_item.grid.cannot_add_rows = true;
//             frm.refresh_field("transport_item");
//         }
//         // --- END OF FIX ---

//         // Filter 'To Site'
//         set_to_site_filter(frm);

//         // Filter 'Gate Pass BookNo'
//         // Your code had two conflicting queries. This one combines them.
//         // It calls the server query AND filters by 'assigned_to'.
//         frm.set_query("gate_pass_bookno", function () {
//             return {
//                 query: "baps.baps.doctype.transportation.transportation.get_available_gate_pass_books",
//                 filters: { 
//                     'assigned_to': frappe.session.user 
//                 }
//             };
//         });

//         // Filter 'Gate Pass No'
//         apply_gate_pass_no_filter(frm);

//         // Filter 'Site' in child table
//         frm.fields_dict['transport_item'].grid.get_field('site').get_query = function (doc, cdt, cdn) {
//             let exclude_sites = [];
//             if (frm.doc.from_site) {
//                 exclude_sites.push(frm.doc.from_site);
//             }
//             if (frm.doc.to_site) {
//                 exclude_sites.push(frm.doc.to_site);
//             }

//             return {
//                 filters: {
//                     'name': ['not in', exclude_sites.length ? exclude_sites : ['']]
//                 }
//             };
//         };

//         // This query from your file is probably dead code, but I've kept it.
//         // You must fix 'your_status_field'
//         frm.set_query('your_status_field', function () { //  ***FIX THIS FIELDNAME***
//             return {
//                 filters: {
//                     'name': ['in', ['Available', 'In Transit']] //  ***FIX THESE STATES***
//                 }
//             };
//         });
//     },

//     /**
//      * VALIDATE: Runs before saving.
//      */
//     validate: function (frm) {
//         // Merged Date Validation
//         if (frm.doc.date) {
//             let today = frappe.datetime.get_today();
//             let past5 = frappe.datetime.add_days(today, -5);
//             let tomorrow = frappe.datetime.add_days(today, 1);

//             if (frm.doc.date < past5) {
//                 frappe.throw(__("Date cannot be older than 5 days. Please select a valid date."));
//             }

//             if (frm.doc.date > tomorrow) {
//                 frappe.throw(__("You can select only up to tomorrow’s date."));
//             }
//         }
//     },

//     //==================================================
//     // Field-level Event Handlers
//     //==================================================

//     from_site: function (frm) {
//         if (frm.doc.from_site && frm.doc.to_site && frm.doc.from_site === frm.doc.to_site) {
//             frappe.msgprint(__("From Site and To Site cannot be the same."));
//             frm.set_value("from_site", "");
//         }
//         set_to_site_filter(frm);
//     },

//     to_site: function (frm) {
//         if (frm.doc.from_site && frm.doc.to_site && frm.doc.from_site === frm.doc.to_site) {
//             frappe.msgprint(__("From Site and To Site cannot be the same."));
//             frm.set_value("to_site", "");
//         }
//     },

//     date: function (frm) {
//         // Merged Date Validation (on change)
//         if (frm.doc.date) {
//             let today = frappe.datetime.get_today();
//             let past5 = frappe.datetime.add_days(today, -5);
//             let tomorrow = frappe.datetime.add_days(today, 1);

//             if (frm.doc.date < past5) {
//                 frappe.show_alert({
//                     message: __("Date cannot be older than 5 days."),
//                     indicator: "red",
//                 });
//                 frm.set_value("date", "");
//             }
//             else if (frm.doc.date > tomorrow) {
//                 frappe.show_alert({
//                     message: __("You can select only up to tomorrow’s date."),
//                     indicator: "red",
//                 });
//                 frm.set_value("date", "");
//             }
//         }
//     },

//     gate_pass_bookno: function (frm) {
//         frm.set_value("gate_pass_no", "");
//         apply_gate_pass_no_filter(frm);
//     },

//     show_items: function (frm) {
//         if (!frm.doc.from_site || !frm.doc.baps_project || !frm.doc.item_type) {
//             frappe.throw(__("Please select a From Site, Baps Project, and Item Type first."));
//             return;
//         }
//         show_items_dialog(frm);
//     },

//     driver_number: function (frm) {
//         let phone_number = frm.doc.driver_number || "";
//         let national_number = phone_number.substring(3).trim();
//         let digits = national_number.replace(/\D/g, "");

//         if (digits.length > 0 && "012345".includes(digits[0])) {
//             digits = digits.substring(1);
//         }
//         if (digits.length > 10) {
//             digits = digits.substring(0, 10);
//         }

//         let corrected_number = "+91 " + digits;
//         if (frm.doc.driver_number !== corrected_number) {
//             frm.set_value("driver_number", corrected_number);
//         }
//     }
// });


// //==================================================
// // 4. 'Show Items' Dialog Functions
// //==================================================

// function show_items_dialog(frm) {
//     const d = new frappe.ui.Dialog({
//         title: 'Select Items to Add',
//         fields: [{
//             label: 'Baps Project',
//             fieldname: 'baps_project',
//             fieldtype: 'Link',
//             options: 'Baps Project',
//             reqd: true,
//             default: frm.doc.baps_project,
//             read_only: 1
//         },
//         {
//             label: 'Item Type',
//             fieldname: 'item_type',
//             fieldtype: 'Link',
//             options: 'Item Type',
//             reqd: true,
//             default: frm.doc.item_type,
//             read_only: 1
//         },
//         { fieldtype: 'Section Break', label: `Available Blocks at ${frm.doc.from_site}` },
//         { fieldname: 'items_html', fieldtype: 'HTML' }
//         ],
//         primary_action_label: 'Add Selected',
//         primary_action: function () {
//             const values = d.get_values();
//             const selected_items = [];

//             const checkedBoxes = d.$wrapper.find('input[data-item-checkbox="1"]:checked');
//             checkedBoxes.each(function () {
//                 selected_items.push({
//                     item_no: $(this).data('item-id'),
//                     baps_project: values.baps_project,
//                     item_type: values.item_type
//                 });
//             });

//             if (selected_items.length === 0) {
//                 frappe.msgprint(__('Please select at least one item.'));
//                 return;
//             }

//             const existing_items = (frm.doc.transport_item || []).map(row => row.item_no);
//             let added_count = 0;
//             selected_items.forEach(item => {
//                 if (!existing_items.includes(item.item_no)) {
//                     let child_row = frm.add_child('transport_item');
//                     child_row.baps_project = item.baps_project;
//                     child_row.item_type = item.item_type;
//                     child_row.item_no = item.item_no;
//                     added_count++;
//                 }
//             });

//             frm.refresh_field('transport_item');
//             frappe.show_alert({ message: __(added_count + " item(s) added to the table."), indicator: 'green' });
//             d.hide();
//         }
//     });

//     // No onchange handlers needed since fields are read-only
//     update_items_list(d, frm);
//     d.show();
// }

// /**
//  * This function fetches blocks based on Project, Site, and Status.
//  */
// function update_items_list(dialog, frm) {
//     const values = dialog.get_values();
//     const $items_wrapper = dialog.fields_dict.items_html.$wrapper;
//     const project = values?.baps_project;
//     const item_type = values?.item_type;
//     const from_site = frm.doc.from_site; 

//     if (!project || !item_type || !from_site) {
//         $items_wrapper.html(`<p class="text-muted">Error: Missing Project, Item Type, or From Site.</p>`);
//         return;
//     }
//     if (item_type !== "Block") {
//         $items_wrapper.html(`<p class="text-muted">Only 'Block' is currently supported.</p>`);
//         return;
//     }

//     const existing_blocks = (frm.doc.transport_item || [])
//         .filter(row => row.item_type === "Block")
//         .map(row => row.item_no);

//     // These are your specific requirements for fetching blocks
//     const new_filters = {
//         'baps_project': project,
//         'site': from_site,
//         'transportation_status': 'Can Transit' 
//     };

//     frappe.call({
//         method: "frappe.client.get_list",
//         args: {
//             doctype: "Block",
//             filters: new_filters,
//             fields: ["name", "block_number", "site", "transportation_status"],
//             limit_page_length: 1000
//         },
//         callback: function (r) {
//             let blocks = r.message || [];
//             const new_blocks = blocks.filter(b => !existing_blocks.includes(b.name));

//             if (new_blocks.length === 0) {
//                 if (blocks.length > 0) {
//                     $items_wrapper.html(`<p class="text-muted">All available blocks from this site have already been added.</p>`);
//                 } else {
//                     $items_wrapper.html(`<p class="text-muted" style="font-size: 12px;">
//                         <b>No blocks found matching your criteria:</b><br>
//                         - Project: ${project}<br>
//                         - Site: ${from_site}<br>
//                         - Status: 'Can Transit'
//                     </p>`);
//                 }
//                 return;
//             }

//             // Render the list of available blocks
//             let html = `<table class="table table-bordered table-sm" style="font-size: 12px;">
//                             <thead class="text-muted">
//                                 <tr>
//                                     <th style="width: 30px;"></th>
//                                     <th>Block Number</th>
//                                     <th>Site</th>
//                                     <th>Status</th>
//                                 </tr>
//                             </thead>
//                             <tbody>`;
//             new_blocks.forEach(block => {
//                 const block_id = frappe.utils.escape_html(block.name);
//                 const block_number = frappe.utils.escape_html(block.block_number || block.name);
//                 const site = frappe.utils.escape_html(block.site || "");
//                 const status = frappe.utils.escape_html(block.transportation_status || "");

//                 html += `
//                     <tr>
//                         <td><input type="checkbox" data-item-checkbox="1" data-item-id="${block_id}" /></td>
//                         <td>${block_number}</td>
//                         <td>${site}</td>
//                         <td>${status}</td>
//                     </tr>`;
//             });
//             html += `</tbody></table>`;

//             $items_wrapper.html(`<div class="p-2 border rounded" style="max-height: 300px; overflow-y: auto;">${html}</div>`);
//         }
//     });
// }

//==================================================
// 1. HELPER: Filter Parent 'To Site'
//==================================================
function set_to_site_filter(frm) {
    frm.set_query("to_site", function () {
        let filters = {};
        if (frm.doc.from_site) {
            filters["name"] = ["!=", frm.doc.from_site];
        }
        return { filters: filters };
    });
}

//==================================================
// 2. HELPER: Filter 'Gate Pass No'
//==================================================
function apply_gate_pass_no_filter(frm) {
    if (frm.doc.gate_pass_bookno) {
        frm.set_query("gate_pass_no", function () {
            return {
                query: "baps.baps.doctype.transportation.transportation.get_available_gate_passes",
                filters: {
                    'gate_pass_book_no': frm.doc.gate_pass_bookno
                }
            };
        });
    }
}

//==================================================
// 3. MAIN EVENT HANDLERS
// (All logic is merged into this one block)
//==================================================
frappe.ui.form.on("Transportation", {
    /**
     * ONLOAD: Runs when the form wrapper is first created.
     */
    onload: function (frm) {
        // Auto-set Sender Name
        if (frm.is_new() && !frm.doc.sender_name) {
            frm.set_value("sender_name", frappe.session.user);
        }
    },

    /**
     * REFRESH: Runs when the form is loaded or re-rendered.
     */
    refresh: function (frm) {
        // --- HIDE "ADD ROW" FOR TRANSPORT ITEM ---
        if (frm.fields_dict.transport_item && frm.fields_dict.transport_item.grid) {
            frm.fields_dict.transport_item.grid.cannot_add_rows = true;
            frm.refresh_field("transport_item");
        }
        // --- END OF FIX ---

        // Filter 'from_site' to exclude 'Project Site'
        frm.set_query("from_site", function() {
            return {
                filters: {
                    'site_type': ['!=', 'Project Site']
                }
            };
        });

        // Filter 'To Site'
        set_to_site_filter(frm);

        // Filter 'Gate Pass BookNo'
        frm.set_query("gate_pass_bookno", function () {
            return {
                query: "baps.baps.doctype.transportation.transportation.get_available_gate_pass_books",
                filters: { 
                    'assigned_to': frappe.session.user 
                }
            };
        });

        // Filter 'Gate Pass No'
        apply_gate_pass_no_filter(frm);

        // Filter 'Site' in child table 'transport_item'
        frm.fields_dict['transport_item'].grid.get_field('site').get_query = function (doc, cdt, cdn) {
            let exclude_sites = [];
            if (frm.doc.from_site) {
                exclude_sites.push(frm.doc.from_site);
            }
            if (frm.doc.to_site) {
                exclude_sites.push(frm.doc.to_site);
            }

            return {
                filters: {
                    'name': ['not in', exclude_sites.length ? exclude_sites : ['']]
                }
            };
        };
        
        // --- DYNAMIC READ-ONLY FOR CHILD TABLE ---
        let is_locked = (frm.doc.status === "Full Received" || 
                         frm.doc.status === "Partially Received" || 
                         frm.doc.status === "Receiving");

        if (frm.fields_dict.transport_item && frm.fields_dict.transport_item.grid) {
            frm.get_field("transport_item").grid.update_docfield_property("item_no", "read_only", is_locked);
            frm.get_field("transport_item").grid.update_docfield_property("baps_project", "read_only", is_locked);
            frm.get_field("transport_item").grid.update_docfield_property("item_type", "read_only", is_locked);
            
            let receiver_can_edit = frappe.user.has_role("Transportation Receiver") && frm.doc.status !== "Full Received";
            
            frm.get_field("transport_item").grid.update_docfield_property("status", "read_only", !receiver_can_edit);
            frm.get_field("transport_item").grid.update_docfield_property("site", "read_only", !receiver_can_edit);
        }
        // --- END OF FIX ---

        // This query from your file is probably dead code. You must fix 'your_status_field'.
        frm.set_query('your_status_field', function () { //  ***FIX THIS FIELDNAME***
            return {
                filters: {
                    'name': ['in', ['Available', 'In Transit']] //  ***FIX THESE STATES***
                }
            };
        });
    },

    /**
     * VALIDATE: Runs before saving.
     */
    validate: function (frm) {
        // Merged Date Validation
        if (frm.doc.date) {
            let today = frappe.datetime.get_today();
            let past5 = frappe.datetime.add_days(today, -5);
            let tomorrow = frappe.datetime.add_days(today, 1);

            if (frm.doc.date < past5) {
                frappe.throw(__("Date cannot be older than 5 days. Please select a valid date."));
            }

            if (frm.doc.date > tomorrow) {
                frappe.throw(__("You can select only up to tomorrow’s date."));
            }
        }
    },

    //==================================================
    // Field-level Event Handlers
    //==================================================

    from_site: function (frm) {
        if (frm.doc.from_site && frm.doc.to_site && frm.doc.from_site === frm.doc.to_site) {
            frappe.msgprint(__("From Site and To Site cannot be the same."));
            frm.set_value("from_site", "");
        }
        set_to_site_filter(frm);
    },

    to_site: function (frm) {
        if (frm.doc.from_site && frm.doc.to_site && frm.doc.from_site === frm.doc.to_site) {
            frappe.msgprint(__("From Site and To Site cannot be the same."));
            frm.set_value("to_site", "");
        }
    },

    date: function (frm) {
        // Merged Date Validation (on change)
        if (frm.doc.date) {
            let today = frappe.datetime.get_today();
            let past5 = frappe.datetime.add_days(today, -5);
            let tomorrow = frappe.datetime.add_days(today, 1);

            if (frm.doc.date < past5) {
                frappe.show_alert({
                    message: __("Date cannot be older than 5 days."),
                    indicator: "red",
                });
                frm.set_value("date", "");
            }
            else if (frm.doc.date > tomorrow) {
                frappe.show_alert({
                    message: __("You can select only up to tomorrow’s date."),
                    indicator: "red",
                });
                frm.set_value("date", "");
            }
        }
    },

    gate_pass_bookno: function (frm) {
        frm.set_value("gate_pass_no", "");
        apply_gate_pass_no_filter(frm);
    },

    show_items: function (frm) {
        if (!frm.doc.from_site || !frm.doc.baps_project || !frm.doc.item_type) {
            frappe.throw(__("Please select a From Site, Baps Project, and Item Type first."));
            return;
        }
        show_items_dialog(frm);
    },

    // Using 'driver_mobile_no' as per your Doctype JSON
    driver_mobile_no: function (frm) {
        let field_name = 'driver_mobile_no';
        let phone_number = frm.doc[field_name] || "";
        
        let national_number = phone_number.substring(3).trim();
        let digits = national_number.replace(/\D/g, "");

        if (digits.length > 0 && "012345".includes(digits[0])) {
            digits = digits.substring(1);
        }
        if (digits.length > 10) {
            digits = digits.substring(0, 10);
        }

        let corrected_number = "+91 " + digits;
        if (frm.doc[field_name] !== corrected_number) {
            frm.set_value(field_name, corrected_number);
        }
    },
    
    //==================================================
    // LOGIC FOR 'Additional Material Received'
    //==================================================
    // 'additional_items' is the fieldname for the table in Transportation
    // 'item_number' is the fieldname in the child table "Additional Material Received"
    additional_items_item_number: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        let item_number = row.item_number;
        let from_site = frm.doc.from_site;

        // 1. Clear fields if item_number is erased
        if (!item_number) {
            frappe.model.set_value(cdt, cdn, 'baps_project', '');
            frappe.model.set_value(cdt, cdn, 'item_type', '');
            return;
        }

        // 2. Check if 'From Site' is set on the parent
        if (!from_site) {
            frappe.msgprint(__("Please set the 'From Site' on the main form first."));
            frappe.model.set_value(cdt, cdn, 'item_number', ''); // Clear the row
            return;
        }

        // 3. Fetch the block from the server to validate it
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Block",
                // 'name' is the primary key (which is 'block_number')
                filters: {
                    'name': item_number,
                    'site': from_site,
                    'transportation_status': ['!=', 'In Transit'] // Your requirement
                },
                // Fetch the fields you need to populate
                fields: ["name", "site", "baps_project", "material_type"] // 'material_type' is the field in Block JSON
            },
            callback: function(r) {
                if (r.message && r.message.length > 0) {
                    // --- Success ---
                    let block = r.message[0];
                    
                    frappe.model.set_value(cdt, cdn, 'baps_project', block.baps_project);
                    // Set 'item_type' from the block's 'material_type'
                    frappe.model.set_value(cdt, cdn, 'item_type', block.material_type);
                    
                    frappe.show_alert({ 
                        message: __("Block {0} found at {1} and details populated.").format(item_number, from_site), 
                        indicator: 'green' 
                    });

                } else {
                    // --- Failure ---
                    frappe.msgprint(__("Error: Block {0} not found. It must be at site '{1}' and not 'In Transit'.").format(item_number, from_site));
                    frappe.model.set_value(cdt, cdn, 'item_number', ''); // Clear the invalid entry
                    frappe.model.set_value(cdt, cdn, 'baps_project', '');
                    frappe.model.set_value(cdt, cdn, 'item_type', '');
                }
            }
        });
    }
});


//==================================================
// 4. 'Show Items' Dialog Functions
//==================================================

function show_items_dialog(frm) {
    const d = new frappe.ui.Dialog({
        title: 'Select Items to Add',
        fields: [{
            label: 'Baps Project',
            fieldname: 'baps_project',
            fieldtype: 'Link',
            options: 'Baps Project',
            reqd: true,
            default: frm.doc.baps_project,
            read_only: 1
        },
        {
            label: 'Item Type',
            fieldname: 'item_type',
            fieldtype: 'Link',
            options: 'Item Type',
            reqd: true,
            default: frm.doc.item_type,
            read_only: 1
        },
        { fieldtype: 'Section Break', label: `Available Blocks at ${frm.doc.from_site}` },
        { fieldname: 'items_html', fieldtype: 'HTML' }
        ],
        primary_action_label: 'Add Selected',
        primary_action: function () {
            const values = d.get_values();
            const selected_items = [];

            const checkedBoxes = d.$wrapper.find('input[data-item-checkbox="1"]:checked');
            checkedBoxes.each(function () {
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

            const existing_items = (frm.doc.transport_item || []).map(row => row.item_no);
            let added_count = 0;
            selected_items.forEach(item => {
                if (!existing_items.includes(item.item_no)) {
                    let child_row = frm.add_child('transport_item');
                    child_row.baps_project = item.baps_project;
                    child_row.item_type = item.item_type;
                    child_row.item_no = item.item_no;
                    added_count++;
                }
            });

            frm.refresh_field('transport_item');
            frappe.show_alert({ message: __(added_count + " item(s) added to the table."), indicator: 'green' });
            d.hide();
        }
    });

    update_items_list(d, frm);
    d.show();
}

/**
 * This function fetches blocks for the 'Show Items' dialog
 */
function update_items_list(dialog, frm) {
    const values = dialog.get_values();
    const $items_wrapper = dialog.fields_dict.items_html.$wrapper;
    const project = values?.baps_project;
    const item_type = values?.item_type;
    const from_site = frm.doc.from_site; 

    if (!project || !item_type || !from_site) {
        $items_wrapper.html(`<p class="text-muted">Error: Missing Project, Item Type, or From Site.</p>`);
        return;
    }
    if (item_type !== "Block") {
        $items_wrapper.html(`<p class="text-muted">Only 'Block' is currently supported.</p>`);
        return;
    }

    const existing_blocks = (frm.doc.transport_item || [])
        .filter(row => row.item_type === "Block")
        .map(row => row.item_no);

    // Filters for the main dialog
    const new_filters = {
        'baps_project': project,
        'site': from_site,
        'transportation_status': 'Can Transit' 
    };

    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Block",
            filters: new_filters,
            fields: ["name", "block_number", "site", "transportation_status"],
            limit_page_length: 1000
        },
        callback: function (r) {
            let blocks = r.message || [];
            const new_blocks = blocks.filter(b => !existing_blocks.includes(b.name));

            if (new_blocks.length === 0) {
                if (blocks.length > 0) {
                    $items_wrapper.html(`<p class="text-muted">All available blocks from this site have already been added.</p>`);
                } else {
                    $items_wrapper.html(`<p class="text-muted">No blocks found matching your criteria</p>`);
                }
                return;
            }

            // Render the list of available blocks
            let html = `<table class="table table-bordered table-sm" style="font-size: 12px;">
                            <thead class="text-muted">
                                <tr>
                                    <th style="width: 30px;"></th>
                                    <th>Block Number</th>
                                    <th>Site</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>`;
            new_blocks.forEach(block => {
                const block_id = frappe.utils.escape_html(block.name);
                const block_number = frappe.utils.escape_html(block.block_number || block.name);
                const site = frappe.utils.escape_html(block.site || "");
                const status = frappe.utils.escape_html(block.transportation_status || "");

                html += `
                    <tr>
                        <td><input type="checkbox" data-item-checkbox="1" data-item-id="${block_id}" /></td>
                        <td>${block_number}</td>
                        <td>${site}</td>
                        <td>${status}</td>
                    </tr>`;
            });
            html += `</tbody></table>`;

            $items_wrapper.html(`<div class="p-2 border rounded" style="max-height: 300px; overflow-y: auto;">${html}</div>`);
        }
    });
}