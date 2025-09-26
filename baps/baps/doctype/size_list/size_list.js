// // ============================
// // Size List - Field-Level Approval System with Verification Status
// // ============================

// // Add CSS for verification status styling
// if (!document.querySelector('#verification-status-styles')) {
//     const style = document.createElement('style');
//     style.id = 'verification-status-styles';
//     style.textContent = `
//         /* Enhanced Verified Row Styling - More Prominent Green */
//         .verification-verified {
//             background-color: #d4edda !important;
//             border-left: 5px solid #28a745 !important;
//             border-right: 2px solid #28a745 !important;
//         }
//         .verification-incorrect {
//             background-color: #fff3cd !important;
//             border-left: 5px solid #ffc107 !important;
//             border-right: 2px solid #ffc107 !important;
//         }
//         .verification-pending {
//             background-color: #f8f9fa !important;
//             border-left: 5px solid #6c757d !important;
//         }
        
//         /* Enhanced styling for verified row content */
//         .grid-row.verification-verified {
//             background: linear-gradient(90deg, #d4edda 0%, #e8f5e8 100%) !important;
//             box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2) !important;
//         }
        
//         /* Verified row cells and inputs */
//         .grid-row .verification-verified .grid-static-col,
//         .grid-row .verification-verified input,
//         .grid-row .verification-verified select,
//         .grid-row .verification-verified textarea,
//         .verification-verified .grid-static-col,
//         .verification-verified input,
//         .verification-verified select,
//         .verification-verified textarea {
//             background-color: #d4edda !important;
//             color: #155724 !important;
//             cursor: not-allowed !important;
//             font-weight: 500 !important;
//             border: 1px solid #c3e6cb !important;
//         }
        
//         /* Disabled verified fields */
//         .grid-row .verification-verified input:disabled,
//         .grid-row .verification-verified select:disabled,
//         .grid-row .verification-verified textarea:disabled,
//         .verification-verified input:disabled,
//         .verification-verified select:disabled,
//         .verification-verified textarea:disabled {
//             background-color: #d4edda !important;
//             color: #155724 !important;
//             border: 1px solid #28a745 !important;
//             opacity: 1 !important;
//         }
        
//         /* Incorrect row styling */
//         .grid-row .verification-incorrect .grid-static-col,
//         .grid-row .verification-incorrect input,
//         .grid-row .verification-incorrect select,
//         .grid-row .verification-incorrect textarea,
//         .verification-incorrect .grid-static-col,
//         .verification-incorrect input,
//         .verification-incorrect select,
//         .verification-incorrect textarea {
//             background-color: #fff3cd !important;
//             border: 1px solid #ffc107 !important;
//             color: #856404 !important;
//         }
        
//         /* Focus states for incorrect fields */
//         .grid-row .verification-incorrect input:focus,
//         .grid-row .verification-incorrect select:focus,
//         .grid-row .verification-incorrect textarea:focus,
//         .verification-incorrect input:focus,
//         .verification-incorrect select:focus,
//         .verification-incorrect textarea:focus {
//             background-color: #fff8e1 !important;
//             border: 2px solid #ff9800 !important;
//             box-shadow: 0 0 5px rgba(255, 152, 0, 0.3) !important;
//         }
//         .grid-row .verification-pending .grid-static-col {
//             background-color: #f8f9fa !important;
//         }
//         .verification-status-badge {
//             padding: 2px 6px;
//             border-radius: 3px;
//             font-size: 10px;
//             font-weight: bold;
//             margin-left: 5px;
//         }
//         .verification-status-verified {
//             background-color: #28a745;
//             color: white;
//         }
//         .verification-status-incorrect {
//             background-color: #ffc107;
//             color: #212529;
//         }
//         .verification-status-pending {
//             background-color: #6c757d;
//             color: white;
//         }
        
//         /* Animation for incorrect stones */
//         @keyframes pulse-orange {
//             0% { background-color: #fff3cd !important; }
//             50% { background-color: #ffe69c !important; }
//             100% { background-color: #fff3cd !important; }
//         }
        
//         /* Subtle animation for verified stones - gentle highlight */
//         @keyframes verified-glow {
//             0% { box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2) !important; }
//             50% { box-shadow: 0 4px 8px rgba(40, 167, 69, 0.4) !important; }
//             100% { box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2) !important; }
//         }
        
//         .verification-verified {
//             animation: verified-glow 3s ease-in-out infinite !important;
//         }
        
//         /* Enhanced verified row styling */
//         .verification-verified::before {
//             content: "✅";
//             position: absolute;
//             left: -15px;
//             top: 50%;
//             transform: translateY(-50%);
//             font-size: 14px;
//             z-index: 10;
//         }
        
//         /* Stronger styling for verified stones */
//         .verified-field-locked {
//             pointer-events: none !important;
//             user-select: none !important;
//             -webkit-user-select: none !important;
//             -moz-user-select: none !important;
//             -ms-user-select: none !important;
//         }
//     `;
//     document.head.appendChild(style);
// }

// // Child Table Handler - Size List Details
// frappe.ui.form.on('Size List Details', {
//     // Stone Name handler with verification status check
//     stone_name: function(frm, cdt, cdn) {
//         let row = locals[cdt][cdn];
        
//         // Check verification status first
//         if (is_stone_verified(row)) {
//             // Show prominent alert
//             frappe.show_alert({
//                 message: __('🚫 This stone is VERIFIED and cannot be modified!'),
//                 indicator: 'red'
//             });
            
//             // Also show msgprint for more visibility
//             frappe.msgprint({
//                 title: __('🔒 Stone is Verified'),
//                 message: __('This stone has been verified and is locked for editing. If you need to make changes, please mark it as incorrect in the Size List Verification form first.'),
//                 indicator: 'red'
//             });
            
//             // Reset the field to previous value
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'stone_name');
//                 frappe.model.set_value(cdt, cdn, 'stone_name', previous_value || '');
//             }, 100);
//             return false;
//         }
        
//         if (is_field_approved(frm, row, 'stone_name')) {
//             frappe.show_alert({message: __('Stone Name is approved and locked'), indicator: 'red'});
//             // Reset the field to previous value
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'stone_name');
//                 frappe.model.set_value(cdt, cdn, 'stone_name', previous_value);
                
//                 // Also force gray styling for the entire row
//                 let row_index = row.idx - 1;
//                 force_row_gray_styling(row_index);
//             }, 100);
//             return false;
//         }
//         // Save current value for future reference
//         save_previous_field_value(frm, row, 'stone_name', row.stone_name);
        
//         // Original stone_name logic
//         if (row && row.stone_name) {
//             frappe.db.get_value('Stone Name', row.stone_name, 'stone_code', (r) => {
//                 if (r && r.stone_code) {
//                     frappe.model.set_value(cdt, cdn, 'stone_code', r.stone_code);
//                 }
//             });
//         }
//         setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
//     },

//     stone_code: function(frm, cdt, cdn) {
//         let row = locals[cdt][cdn];
        
//         // Check verification status first
//         if (is_stone_verified(row)) {
//             frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'stone_code');
//                 frappe.model.set_value(cdt, cdn, 'stone_code', previous_value);
//             }, 100);
//             return false;
//         }
        
//         if (is_field_approved(frm, row, 'stone_code')) {
//             frappe.show_alert({message: __('Stone Code is approved and locked'), indicator: 'red'});
//             // Reset the field to previous value
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'stone_code');
//                 frappe.model.set_value(cdt, cdn, 'stone_code', previous_value);
//             }, 100);
//             return false;
//         }
//         // Save current value for future reference
//         save_previous_field_value(frm, row, 'stone_code', row.stone_code);
//         setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
//     },

//     // Dimension fields with verification and approval checks
//     l1: function(frm, cdt, cdn) { 
//         let row = locals[cdt][cdn];
        
//         // Check verification status first
//         if (is_stone_verified(row)) {
//             frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'l1');
//                 frappe.model.set_value(cdt, cdn, 'l1', previous_value);
//             }, 100);
//             return false;
//         }
        
//         if (is_field_approved(frm, row, 'l1')) {
//             frappe.show_alert({message: __('L1 field is approved and locked'), indicator: 'red'});
//             // Reset the field to previous value
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'l1');
//                 frappe.model.set_value(cdt, cdn, 'l1', previous_value);
//             }, 100);
//             return false;
//         }
//         // Save current value for future reference
//         save_previous_field_value(frm, row, 'l1', row.l1);
//         calculate_volume(frm, cdt, cdn); 
//         setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
//     },
    
//     l2: function(frm, cdt, cdn) {
//         let row = locals[cdt][cdn];
        
//         // Check verification status first
//         if (is_stone_verified(row)) {
//             frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'l2');
//                 frappe.model.set_value(cdt, cdn, 'l2', previous_value);
//             }, 100);
//             return false;
//         }
        
//         if (is_field_approved(frm, row, 'l2')) {
//             frappe.show_alert({message: __('L2 field is approved and locked'), indicator: 'red'});
//             // Reset the field to previous value
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'l2');
//                 frappe.model.set_value(cdt, cdn, 'l2', previous_value);
//             }, 100);
//             return false;
//         }
//         // Save current value for future reference
//         save_previous_field_value(frm, row, 'l2', row.l2);
//         if (row && row.l2 >= 12) {
//             frappe.msgprint(__('L2 must be less than 12 inches'));
//             frappe.model.set_value(cdt, cdn, 'l2', 0);
//         }
//         calculate_volume(frm, cdt, cdn);
//         setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
//     },
    
//     b1: function(frm, cdt, cdn) { 
//         let row = locals[cdt][cdn];
        
//         // Check verification status first
//         if (is_stone_verified(row)) {
//             frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'b1');
//                 frappe.model.set_value(cdt, cdn, 'b1', previous_value);
//             }, 100);
//             return false;
//         }
        
//         if (is_field_approved(frm, row, 'b1')) {
//             frappe.show_alert({message: __('B1 field is approved and locked'), indicator: 'red'});
//             // Reset the field to previous value
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'b1');
//                 frappe.model.set_value(cdt, cdn, 'b1', previous_value);
//             }, 100);
//             return false;
//         }
//         // Save current value for future reference
//         save_previous_field_value(frm, row, 'b1', row.b1);
//         calculate_volume(frm, cdt, cdn); 
//         setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
//     },
    
//     b2: function(frm, cdt, cdn) {
//         let row = locals[cdt][cdn];
        
//         // Check verification status first
//         if (is_stone_verified(row)) {
//             frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'b2');
//                 frappe.model.set_value(cdt, cdn, 'b2', previous_value);
//             }, 100);
//             return false;
//         }
        
//         if (is_field_approved(frm, row, 'b2')) {
//             frappe.show_alert({message: __('B2 field is approved and locked'), indicator: 'red'});
//             // Reset the field to previous value
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'b2');
//                 frappe.model.set_value(cdt, cdn, 'b2', previous_value);
//             }, 100);
//             return false;
//         }
//         // Save current value for future reference
//         save_previous_field_value(frm, row, 'b2', row.b2);
//         if (row && row.b2 >= 12) {
//             frappe.msgprint(__('B2 must be less than 12 inches'));
//             frappe.model.set_value(cdt, cdn, 'b2', 0);
//         }
//         calculate_volume(frm, cdt, cdn);
//         setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
//     },
    
//     h1: function(frm, cdt, cdn) { 
//         let row = locals[cdt][cdn];
        
//         // Check verification status first
//         if (is_stone_verified(row)) {
//             frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'h1');
//                 frappe.model.set_value(cdt, cdn, 'h1', previous_value);
//             }, 100);
//             return false;
//         }
        
//         if (is_field_approved(frm, row, 'h1')) {
//             frappe.show_alert({message: __('H1 field is approved and locked'), indicator: 'red'});
//             // Reset the field to previous value
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'h1');
//                 frappe.model.set_value(cdt, cdn, 'h1', previous_value);
//             }, 100);
//             return false;
//         }
//         // Save current value for future reference
//         save_previous_field_value(frm, row, 'h1', row.h1);
//         calculate_volume(frm, cdt, cdn); 
//         setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
//     },
    
//     h2: function(frm, cdt, cdn) {
//         let row = locals[cdt][cdn];
        
//         // Check verification status first
//         if (is_stone_verified(row)) {
//             frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'h2');
//                 frappe.model.set_value(cdt, cdn, 'h2', previous_value);
//             }, 100);
//             return false;
//         }
        
//         if (is_field_approved(frm, row, 'h2')) {
//             frappe.show_alert({message: __('H2 field is approved and locked'), indicator: 'red'});
//             // Reset the field to previous value
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'h2');
//                 frappe.model.set_value(cdt, cdn, 'h2', previous_value);
//             }, 100);
//             return false;
//         }
//         // Save current value for future reference
//         save_previous_field_value(frm, row, 'h2', row.h2);
//         if (row && row.h2 >= 12) {
//             frappe.msgprint(__('H2 must be less than 12 inches'));
//             frappe.model.set_value(cdt, cdn, 'h2', 0);
//         }
//         calculate_volume(frm, cdt, cdn);
//         setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
//     },

//     stone_details_remove: function(frm) {
//         update_total_volume(frm);
//         setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
//     }
// });

// // Parent Form Handler - Size List
// frappe.ui.form.on('Size List', {
//     refresh: function(frm) {
//         setup_approval_and_publish_buttons(frm);
        
//         // Restore approval states from saved data
//         restore_approval_states(frm);
        
//         // Initialize previous field values for all rows
//         initialize_previous_field_values(frm);
        
//         // Apply field-level approval styling when form loads
//         setTimeout(() => {
//             apply_all_field_approval_states(frm);
//         }, 800);
        
//         // Load verification status and apply styling with enhanced locking
//         if (frm.doc.name && frm.doc.stone_details && frm.doc.stone_details.length > 0) {
//             load_verification_summary(frm);
//             setTimeout(() => {
//                 apply_verification_status_styling(frm);
//                 lock_verified_fields(frm);
//             }, 1000);
//         }
        
//         // Load project flags if baps_project is selected
//         if (frm.doc.baps_project) {
//             load_project_flags(frm);
//         }
        
//         // Add refresh verification status button
//         if (frm.doc.name && frm.doc.stone_details && frm.doc.stone_details.length > 0) {
//             frm.add_custom_button(__('🔄 Refresh Verification Status'), function() {
//                 frappe.show_alert({
//                     message: __('🔄 Refreshing verification status from database...'),
//                     indicator: 'blue'
//                 });
                
//                 // Reload the entire form to get fresh data
//                 frm.reload_doc().then(() => {
//                     // After reload, apply styling
//                     setTimeout(() => {
//                         apply_verification_status_styling(frm);
//                         frappe.show_alert({
//                             message: __('✅ Verification status refreshed successfully!'),
//                             indicator: 'green'
//                         });
//                     }, 500);
//                 }).catch((error) => {
//                     console.error('Error reloading form:', error);
//                     frappe.show_alert({
//                         message: __('❌ Error refreshing verification status'),
//                         indicator: 'red'
//                     });
//                 });
                
//             }, __('🔧 Actions'));
            
//             // Also add a test button to force styling
//             frm.add_custom_button(__('🎨 Force Apply Styling'), function() {
//                 apply_verification_status_styling(frm);
//                 frappe.show_alert({
//                     message: __('🎨 Styling applied manually'),
//                     indicator: 'blue'
//                 });
//             }, __('🔧 Actions'));
//         }
//     },

//     onload: function(frm) {
//         // Auto-set prepared_by field to current user when creating a new document
//         if (frm.is_new() && !frm.doc.prepared_by) {
//             frm.set_value('prepared_by', frappe.session.user);
//         }
//     },

//     before_save: function(frm) {
//         // Ensure prepared_by is set before saving
//         if (!frm.doc.prepared_by) {
//             frm.set_value('prepared_by', frappe.session.user);
//         }
//     },

//     baps_project: function(frm) {
//         if (frm.doc.baps_project) {
//             load_project_flags(frm);
//         } else {
//             frm._project_flags = { chemical: 0, dry_fitting: 0, polishing: 0 };
//             set_child_grid_readonly(frm);
//         }
//     },
    
//     main_part: function(frm) {
//         if (!frm.doc.main_part) frm.set_value('sub_part', '');
        
//         frm.set_query("sub_part", function() {
//             if (!frm.doc.main_part) {
//                 frappe.throw("Please select Main Part before choosing a Sub Part.");
//             }
//             return {
//                 filters: {
//                     main_part: frm.doc.main_part
//                 }
//             };
//         });

//         // clear sub_part if mismatch
//         if (frm.doc.sub_part) {
//             frappe.db.get_value("Sub Part", frm.doc.sub_part, "main_part", function(r) {
//                 if (r && r.main_part !== frm.doc.main_part) {
//                     frm.set_value("sub_part", null);
//                 }
//             });
//         }
//     },
    
//     sub_part: function(frm) {
//         if (!frm.doc.sub_part) frm.set_value('main_part', '');
//     },
    
//     stone_details_add: function(frm, cdt, cdn) {
//         let row = locals[cdt][cdn];
//         if (frm._project_flags?.chemical) frappe.model.set_value(cdt, cdn, 'chemical', 1);
//         if (frm._project_flags?.dry_fitting) frappe.model.set_value(cdt, cdn, 'dry_fitting', 1);
//         if (frm._project_flags?.polishing) frappe.model.set_value(cdt, cdn, 'polishing', 1);
        
//         // Apply verification status styling after new row is added
//         setTimeout(() => {
//             apply_verification_status_styling(frm);
//         }, 500);
//     },
    
//     validate: function(frm) {
//         if (!frm.doc.main_part && frm.doc.sub_part) {
//             frappe.throw("You cannot add a Sub Part without selecting a Main Part.");
//         }
//     }
// });

// // ============================
// // PERSISTENT STORAGE FUNCTIONS (Browser localStorage)
// // ============================

// // Get unique key for this document's approval data
// function get_approval_storage_key(frm) {
//     return `size_list_approvals_${frm.doc.name || 'new'}`;
// }

// // Check if a field is approved (with persistent storage)
// function is_field_approved(frm, row, field_name) {
//     try {
//         let storage_key = get_approval_storage_key(frm);
//         let approval_data = localStorage.getItem(storage_key);
//         if (!approval_data) return false;
        
//         approval_data = JSON.parse(approval_data);
//         return !!(approval_data[row.name] && approval_data[row.name][field_name]);
//     } catch (e) {
//         console.error('Error checking field approval state:', e);
//         return false;
//     }
// }

// // Save approval state to localStorage
// function save_approval_state(frm, row_name, field_name, is_approved) {
//     try {
//         let storage_key = get_approval_storage_key(frm);
//         let approval_data = {};
        
//         // Load existing approval data
//         let existing_data = localStorage.getItem(storage_key);
//         if (existing_data) {
//             approval_data = JSON.parse(existing_data);
//         }
        
//         // Initialize row data if not exists
//         if (!approval_data[row_name]) {
//             approval_data[row_name] = {};
//         }
        
//         // Set approval state
//         approval_data[row_name][field_name] = is_approved;
        
//         // Save back to localStorage
//         localStorage.setItem(storage_key, JSON.stringify(approval_data));
//     } catch (e) {
//         console.error('Error saving approval state:', e);
//     }
// }

// // Restore approval states from localStorage
// function restore_approval_states(frm) {
//     if (!frm.doc.stone_details) return;
    
//     try {
//         let storage_key = get_approval_storage_key(frm);
//         let approval_data = localStorage.getItem(storage_key);
//         if (!approval_data) return;
        
//         approval_data = JSON.parse(approval_data);
        
//         frm.doc.stone_details.forEach(row => {
//             if (approval_data[row.name]) {
//                 // Restore client-side approval data for immediate use
//                 row._approved_fields = approval_data[row.name];
//             }
//         });
//     } catch (e) {
//         console.error('Error restoring approval states:', e);
//     }
// }

// // Helper functions for field value management
// function save_previous_field_value(frm, row, field_name, value) {
//     try {
//         let storage_key = `${get_approval_storage_key(frm)}_previous_values`;
//         let previous_data = {};
        
//         // Load existing previous value data
//         let existing_data = localStorage.getItem(storage_key);
//         if (existing_data) {
//             previous_data = JSON.parse(existing_data);
//         }
        
//         // Initialize row data if not exists
//         if (!previous_data[row.name]) {
//             previous_data[row.name] = {};
//         }
        
//         // Set previous value
//         previous_data[row.name][field_name] = value;
        
//         // Save back to localStorage
//         localStorage.setItem(storage_key, JSON.stringify(previous_data));
//     } catch (e) {
//         console.error('Error saving previous field value:', e);
//     }
// }

// function get_previous_field_value(frm, row, field_name) {
//     try {
//         let storage_key = `${get_approval_storage_key(frm)}_previous_values`;
//         let previous_data = localStorage.getItem(storage_key);
//         if (!previous_data) return null;
        
//         previous_data = JSON.parse(previous_data);
//         return previous_data[row.name] && previous_data[row.name][field_name] || null;
//     } catch (e) {
//         console.error('Error getting previous field value:', e);
//         return null;
//     }
// }

// // Initialize previous field values for all rows
// function initialize_previous_field_values(frm) {
//     if (!frm.doc.stone_details) return;
    
//     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
    
//     frm.doc.stone_details.forEach(row => {
//         required_fields.forEach(field => {
//             if (row[field] !== undefined && row[field] !== null) {
//                 save_previous_field_value(frm, row, field, row[field]);
//             }
//         });
//     });
// }


// // ============================
// // CORE FUNCTIONS
// // ============================

// // Volume calculation for a single row
// function calculate_volume(frm, cdt, cdn) {
//     let row = locals[cdt][cdn];
//     if (!row) return;
    
//     let L = ((row.l1 || 0) * 12) + (row.l2 || 0);
//     let B = ((row.b1 || 0) * 12) + (row.b2 || 0);
//     let H = ((row.h1 || 0) * 12) + (row.h2 || 0);
    
//     row.volume = ((L * B * H) / 1728).toFixed(2);
//     frm.refresh_field('stone_details');
//     update_total_volume(frm);
// }

// // Total volume across all rows
// function update_total_volume(frm) {
//     let total = 0;
//     (frm.doc.stone_details || []).forEach(r => {
//         total += flt(r.volume);
//     });
//     frm.set_value('total_volume', total.toFixed(2));
// }

// // Load project flags from Baps Project
// function load_project_flags(frm) {
//     if (!frm.doc.baps_project) {
//         frm._project_flags = { chemical: 0, dry_fitting: 0, polishing: 0 };
//         set_child_grid_readonly(frm);
//         return;
//     }
    
//     frappe.db.get_doc('Baps Project', frm.doc.baps_project).then(project_doc => {
//         if (project_doc) {
            
//             // Store project flags for child table reference
//             frm._project_flags = {
//                 chemical: project_doc.chemical ? 1 : 0,
//                 dry_fitting: project_doc.dry_fitting ? 1 : 0,
//                 polishing: project_doc.polishing ? 1 : 0
//             };
            
//             // Apply to all existing child rows
//             apply_project_checkboxes(frm);
            
//             // Set child grid readonly based on flags
//             set_child_grid_readonly(frm);
//         }
//     }).catch(err => {
//         frm._project_flags = { chemical: 0, dry_fitting: 0, polishing: 0 };
//     });
// }

// // ============================
// // APPROVAL SYSTEM FUNCTIONS
// // ============================

// // // Setup approval and publish buttons
// // function setup_approval_and_publish_buttons(frm) {
// //     // Remove ALL existing custom buttons to prevent duplicates
// //     Object.keys(frm.custom_buttons || {}).forEach(key => {
// //         if (frm.custom_buttons[key] && frm.custom_buttons[key].remove) {
// //             frm.custom_buttons[key].remove();
// //         }
// //     });
// //     frm.custom_buttons = {};

// //     // Primary button - Approve Selected Fields (with multiple fallback methods)
// //     frm.add_custom_button(__('Approve Selected Fields'), () => approve_selected_fields(frm))
// //         .addClass('btn-primary');
    
// //     // Alternative button - Approve All Filled Fields (simpler approach)
// //     frm.add_custom_button(__('Approve All Filled Fields'), () => approve_all_filled_fields(frm))
// //         .addClass('btn-info');

// //     // Check if all fields in all rows are filled and approved
// //     let all_complete = check_all_fields_complete(frm);
    
// //     if (all_complete) {
// //         // Show Publish button only when everything is complete
// //         frm.add_custom_button(__('Publish'), () => publish_data(frm))
// //             .addClass('btn-success');
// //     } else {
// //         // Show single progress message - only one button
// //         let progress = get_completion_progress(frm);
// //         frm.add_custom_button(__(`Progress: ${progress.filled}/${progress.total} fields`), () => {
// //             frappe.msgprint(__('Complete all fields to enable publishing.'));
// //         }).addClass('btn-secondary');
// //     }
// // }

// // // Check if all fields in all rows are completely filled
// // function check_all_fields_complete(frm) {
// //     if (!frm.doc.stone_details || frm.doc.stone_details.length === 0) return false;
    
// //     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
    
// //     for (let row of frm.doc.stone_details) {
// //         for (let field of required_fields) {
// //             let value = row[field];
// //             if (value === undefined || value === null || value === '' || value === 0) {
// //                 return false; // Found empty field
// //             }
// //         }
        
// //         // Also check if all fields are approved
// //         for (let field of required_fields) {
// //             if (!is_field_approved(frm, row, field)) return false;
// //         }
// //     }
// //     return true; // All fields filled and approved
// // }

// // // Get completion progress
// // function get_completion_progress(frm) {
// //     if (!frm.doc.stone_details) return {filled: 0, total: 0};
    
// //     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
// //     let total_fields = frm.doc.stone_details.length * required_fields.length;
// //     let filled_fields = 0;
    
// //     frm.doc.stone_details.forEach(row => {
// //         required_fields.forEach(field => {
// //             let value = row[field];
// //             if (value !== undefined && value !== null && value !== '' && value !== 0) {
// //                 filled_fields++;
// //             }
// //         });
// //     });
    
// //     return {filled: filled_fields, total: total_fields};
// // }

// // // Approve selected fields in selected rows
// // function approve_selected_fields(frm) {
// //     if (!frm.doc.stone_details || frm.doc.stone_details.length === 0) {
// //         frappe.msgprint(__('No rows to approve'));
// //         return;
// //     }
    
// //     // Method 1: Try to get selected rows from grid
// //     let selected_rows = [];
    
// //     // Check if grid exists and has selected rows
// //     let grid = frm.get_field('stone_details').grid;
// //     if (grid && grid.get_selected_children) {
// //         selected_rows = grid.get_selected_children();
// //     }
    
// //     // Method 2: Fallback - use jQuery to find selected checkboxes
// //     if (selected_rows.length === 0) {
// //         $('.grid-row').each(function() {
// //             let $row = $(this);
// //             let checkbox = $row.find('.grid-row-check input[type="checkbox"]');
// //             if (checkbox.length && checkbox.is(':checked')) {
// //                 let row_index = parseInt($row.attr('data-idx'));
// //                 if (!isNaN(row_index) && frm.doc.stone_details[row_index]) {
// //                     let row_doc = frm.doc.stone_details[row_index];
// //                     if (row_doc && !selected_rows.find(r => r.name === row_doc.name)) {
// //                         selected_rows.push(row_doc);

// //                     }
// //                 }
// //             }
// //         });
// //     }
    
// //     // Method 3: If still no selection, try alternative grid approach
// //     if (selected_rows.length === 0) {
// //         try {
// //             selected_rows = frm.fields_dict.stone_details.grid.get_selected();
// //         } catch (e) {
// //             console.error('Grid selection method failed:', e);
// //         }
// //     }
    
// //     // Method 4: If no rows selected, show dialog to select specific rows
// //     if (selected_rows.length === 0) {
// //         show_row_selection_dialog(frm);
// //         return;
// //     }
    
// //     let approved_count = 0;
// //     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
    
// //     selected_rows.forEach(row => {
// //         approved_count += approve_filled_fields_in_row(frm, row, required_fields);
// //     });
    
// //     if (approved_count > 0) {
// //         frappe.show_alert({
// //             message: __('Approved {0} fields in {1} selected rows', [approved_count, selected_rows.length]),
// //             indicator: 'gray'
// //         });
        
// //         // Apply visual styling
// //         apply_all_field_approval_states(frm);
        
// //         // Update buttons
// //         setup_approval_and_publish_buttons(frm);
// //     } else {
// //         frappe.msgprint(__('No filled fields found to approve in selected rows'));
// //     }
// // }

// // // Show dialog to select rows when no rows are selected
// // function show_row_selection_dialog(frm) {
// //     if (!frm.doc.stone_details || frm.doc.stone_details.length === 0) {
// //         frappe.msgprint(__('No rows available'));
// //         return;
// //     }
    
// //     let row_options = frm.doc.stone_details.map((row, index) => {
// //         let stone_info = row.stone_name || `Row ${index + 1}`;
// //         let filled_count = count_filled_fields(row);
// //         return {
// //             label: `${stone_info} (${filled_count} fields filled)`,
// //             value: index
// //         };
// //     });
    
// //     frappe.prompt([
// //         {
// //             label: 'Select Rows to Approve',
// //             fieldname: 'selected_rows',
// //             fieldtype: 'MultiSelectPills',
// //             options: row_options,
// //             reqd: 1
// //         }
// //     ], function(values) {
// //         let selected_indices = values.selected_rows;
// //         if (!selected_indices || selected_indices.length === 0) {
// //             frappe.msgprint(__('No rows selected'));
// //             return;
// //         }
        
// //         let selected_rows = selected_indices.map(index => frm.doc.stone_details[index]);
// //         let approved_count = 0;
// //         let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
        
// //         selected_rows.forEach(row => {
// //             approved_count += approve_filled_fields_in_row(frm, row, required_fields);
// //         });
        
// //         if (approved_count > 0) {
// //             frappe.show_alert({
// //                 message: __('Approved {0} fields in {1} selected rows', [approved_count, selected_rows.length]),
// //                 indicator: 'gray'
// //             });
            
// //             // Apply visual styling
// //             apply_all_field_approval_states(frm);
            
// //             // Update buttons
// //             setup_approval_and_publish_buttons(frm);
// //         } else {
// //             frappe.msgprint(__('No filled fields found to approve in selected rows'));
// //         }
// //     }, __('Approve Fields'), __('Approve Selected'));
// // }

// // // Simpler approach - approve all filled fields in all rows
// // function approve_all_filled_fields(frm) {
// //     if (!frm.doc.stone_details || frm.doc.stone_details.length === 0) {
// //         frappe.msgprint(__('No rows to approve'));
// //         return;
// //     }
    
// //     let approved_count = 0;
// //     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
    
// //     frm.doc.stone_details.forEach(row => {
// //         approved_count += approve_filled_fields_in_row(frm, row, required_fields);
// //     });
    
// //     if (approved_count > 0) {
// //         frappe.show_alert({
// //             message: __('Approved {0} filled fields across all rows', [approved_count]),
// //             indicator: 'gray'
// //         });
        
// //         // Apply visual styling
// //         apply_all_field_approval_states(frm);
        
// //         // Update buttons
// //         setup_approval_and_publish_buttons(frm);
// //     } else {
// //         frappe.msgprint(__('No filled fields found to approve'));
// //     }
// // }

// // // Count filled fields in a row
// // function count_filled_fields(row) {
// //     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
// //     let count = 0;
    
// //     required_fields.forEach(field => {
// //         let value = row[field];
// //         if (value !== undefined && value !== null && value !== '' && value !== 0) {
// //             count++;
// //         }
// //     });
    
// //     return count;
// // }

// // // Approve filled fields in a single row (with persistent storage)
// // function approve_filled_fields_in_row(frm, row, required_fields) {
// //     if (!row._approved_fields) {
// //         row._approved_fields = {};
// //     }
    
// //     let approved_count = 0;
    
// //     required_fields.forEach(field => {
// //         let value = row[field];
// //         if (value !== undefined && value !== null && value !== '' && value !== 0) {
// //             if (!row._approved_fields[field]) {
// //                 row._approved_fields[field] = true;
// //                 // Save to persistent storage (localStorage)
// //                 save_approval_state(frm, row.name, field, true);
// //                 approved_count++;
// //             }
// //         }
// //     });
    
// //     return approved_count;
// // }

// // // Apply visual styling to all approved fields
// // function apply_all_field_approval_states(frm) {
// //     if (!frm.doc.stone_details) return;
    
// //     frm.doc.stone_details.forEach((row, row_index) => {
// //         // Check both _approved_fields and localStorage for approval states
// //         let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
        
// //         required_fields.forEach(field => {
// //             // Check if field is approved using the persistent storage function
// //             if (is_field_approved(frm, row, field)) {
// //                 lock_individual_field(frm, row_index, field);
// //             }
// //         });
        
// //         // Also apply styling from _approved_fields (legacy support)
// //         if (row._approved_fields) {
// //             Object.keys(row._approved_fields).forEach(field => {
// //                 if (row._approved_fields[field]) {
// //                     lock_individual_field(frm, row_index, field);
// //                 }
// //             });
// //         }
        
// //         // Check if this row is fully approved and force gray styling
// //         if (is_row_fully_approved(frm, row)) {
// //             force_row_gray_styling(row_index);
// //         }
// //     });
// // }

// // // Lock individual field with visual styling
// // function lock_individual_field(frm, row_index, field) {
// //     setTimeout(() => {
// //         // Try multiple selector strategies for robust field selection
// //         let selectors = [
// //             `.grid-row[data-idx="${row_index}"] [data-fieldname="${field}"]`,
// //             `.grid-row:nth-child(${row_index + 1}) [data-fieldname="${field}"]`,
// //             `[data-fieldname="${field}"]`
// //         ];
        
// //         let $field = null;
// //         let $row = $(`.grid-row[data-idx="${row_index}"]`);
        
// //         // Try each selector until we find the field
// //         for (let selector of selectors) {
// //             if (selector === `[data-fieldname="${field}"]`) {
// //                 // For the generic selector, filter by row
// //                 $field = $(selector).filter(function() {
// //                     let $parent_row = $(this).closest('.grid-row');
// //                     let idx = $parent_row.attr('data-idx');
// //                     return idx == row_index || $parent_row.index() == row_index;
// //                 });
// //             } else {
// //                 $field = $(selector);
// //             }
            
// //             if ($field.length > 0) break;
// //         }

// //         if ($field && $field.length > 0) {
// //             $field.addClass('field-approved');
            
// //             // Make inputs truly uneditable
// //             $field.find('input, select, textarea').each(function() {
// //                 $(this).prop('readonly', true)
// //                        .prop('disabled', true)
// //                        .addClass('field-approved-input')
// //                        .attr('title', 'This field is approved and locked');
// //             });
            
// //             // Prevent any click/focus events
// //             $field.find('input, select, textarea').off('click focus keydown keypress keyup change input')
// //                    .on('click focus keydown keypress keyup change input', function(e) {
// //                 e.preventDefault();
// //                 e.stopPropagation();
// //                 frappe.show_alert({message: __('This field is approved and locked'), indicator: 'red'});
// //                 return false;
// //             });
// //         } else {

// //         }
        
// //         // Check if this row should be fully grayed out
// //         let row_doc = frm.doc.stone_details[row_index];
// //         if (row_doc && is_row_fully_approved(frm, row_doc)) {
// //             // Make the entire row gray
// //             if ($row.length) {
// //                 $row.addClass('row-fully-approved');
                
// //                 // Style all elements in the row
// //                 $row.find('*').each(function() {
// //                     $(this).css({
// //                         'background-color': '#f5f5f5 !important',
// //                         'color': '#666666 !important',
// //                         'border-color': '#bdbdbd !important'
// //                     });
// //                 });
                
// //                 // Specifically target all input elements
// //                 $row.find('input, select, textarea, .form-control').each(function() {
// //                     $(this).css({
// //                         'background-color': '#f5f5f5 !important',
// //                         'color': '#666666 !important',
// //                         'border-color': '#bdbdbd !important'
// //                     }).prop('readonly', true).prop('disabled', true);
// //                 });
                
// //                 // Add visual indicator to row
// //                 if (!$row.find('.row-approved-indicator').length) {
// //                     $row.find('.grid-row-index').append('<span class="row-approved-indicator">✓</span>');
// //                 }
// //             }
// //         }
// //     }, 300);
// // }

// // // Publish data (final step)
// // function publish_data(frm) {
// //     frappe.confirm(
// //         __('Are you sure you want to publish this data? This will finalize all approvals.'),
// //         () => {
// //             // Add your publish logic here
// //             frappe.msgprint(__('Data published successfully!'));
            
// //             // You can add additional logic here such as:
// //             // - Setting a "published" flag
// //             // - Sending notifications
// //             // - Creating related documents
// //             // - etc.
// //         }
// //     );
// // }

// // // Check if a row has all its required fields approved
// // function is_row_fully_approved(frm, row) {
// //     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
    
// //     for (let field of required_fields) {
// //         // Check if field has value and is approved
// //         let value = row[field];
// //         if (value !== undefined && value !== null && value !== '' && value !== 0) {
// //             if (!is_field_approved(frm, row, field)) {
// //                 return false; // Found a filled field that's not approved
// //             }
// //         }
// //     }
    
// //     // Check if row has at least some approved fields
// //     let has_approved_fields = false;
// //     for (let field of required_fields) {
// //         if (is_field_approved(frm, row, field)) {
// //             has_approved_fields = true;
// //             break;
// //         }
// //     }
    
// //     return has_approved_fields;
// // }

// // // Force entire row to be gray when approved
// // function force_row_gray_styling(row_index) {
// //     setTimeout(() => {
// //         let $row = $(`.grid-row[data-idx="${row_index}"]`);
// //         if ($row.length) {
// //             // Apply gray styling to the entire row
// //             $row.css({
// //                 'background': 'linear-gradient(90deg, #f5f5f5 0%, #e9e9e9 100%)',
// //                 'border': '1px solid #bdbdbd',
// //                 'border-radius': '4px'
// //             });
            
// //             // Style all cells in the row
// //             $row.find('td, .grid-static-col').each(function() {
// //                 $(this).css({
// //                     'background-color': '#f5f5f5 !important',
// //                     'border-color': '#bdbdbd !important'
// //                 });
// //             });
            
// //             // Style all inputs, selects, textareas
// //             $row.find('input, select, textarea, .form-control, .input-with-feedback').each(function() {
// //                 $(this).css({
// //                     'background-color': '#f5f5f5 !important',
// //                     'color': '#666666 !important',
// //                     'border-color': '#bdbdbd !important'
// //                 }).prop('readonly', true).prop('disabled', true);
// //             });
            
// //             // Style checkboxes and other elements
// //             $row.find('.grid-row-check, .grid-row-index').each(function() {
// //                 $(this).css({
// //                     'background-color': '#f5f5f5 !important',
// //                     'color': '#666666 !important'
// //                 });
// //             });
// //         }
// //     }, 500);
// // }

// // // ============================
// // // CSS STYLING
// // // ============================

// // // Add CSS styling for approved fields
// // if (!document.querySelector('#approval-field-styles')) {
// //     const style = document.createElement('style');
// //     style.id = 'approval-field-styles';
// //     style.textContent = `
// //         .field-approved {
// //             background-color: #e8f5e8 !important;
// //             border: 1px solid #4caf50 !important;
// //             position: relative;
// //             opacity: 1;
// //         }
// //         .field-approved::after {
// //             content: '✓';
// //             position: absolute;
// //             top: 2px;
// //             right: 5px;
// //             font-size: 12px;
// //             color: #2e7d32;
// //             font-weight: bold;
// //             pointer-events: none;
// //             z-index: 1000;
// //         }
// //         .field-approved-input {
// //             background-color: #f1f8e9 !important;
// //             color: #2e7d32 !important;
// //             cursor: not-allowed !important;
// //             pointer-events: none !important;
// //             border: 1px solid #81c784 !important;
// //         }
// //         .field-approved-input:focus,
// //         .field-approved-input:hover {
// //             background-color: #f1f8e9 !important;
// //             border-color: #81c784 !important;
// //             box-shadow: 0 0 0 0.2rem rgba(76, 175, 80, 0.25) !important;
// //         }
// //         .row-fully-approved {
// //             background: linear-gradient(90deg, #f5f5f5 0%, #e9e9e9 100%) !important;
// //             border: 1px solid #bdbdbd !important;
// //             border-radius: 4px;
// //             opacity: 1;
// //         }
// //         .row-fully-approved .grid-static-col,
// //         .row-fully-approved .grid-static-col input,
// //         .row-fully-approved .grid-static-col select,
// //         .row-fully-approved .grid-static-col textarea,
// //         .row-fully-approved .grid-row-check,
// //         .row-fully-approved .grid-row-index,
// //         .row-fully-approved [data-fieldname] {
// //             background-color: #f5f5f5 !important;
// //             color: #666666 !important;
// //             border-color: #bdbdbd !important;
// //         }
// //         .row-fully-approved td,
// //         .row-fully-approved .form-control,
// //         .row-fully-approved .input-with-feedback {
// //             background-color: #f5f5f5 !important;
// //             color: #666666 !important;
// //             border-color: #bdbdbd !important;
// //         }
// //         .row-approved-indicator {
// //             color: #2e7d32;
// //             font-weight: bold;
// //             margin-left: 5px;
// //             background: #4caf50;
// //             color: white;
// //             border-radius: 50%;
// //             padding: 2px 6px;
// //             font-size: 10px;
// //         }
// //         .approval-progress {
// //             font-weight: bold;
// //             color: #1976d2;
// //             margin: 5px 0;
// //         }
        
// //         /* Hover effects for approved elements */
// //         .row-fully-approved:hover {
// //             box-shadow: 0 4px 8px rgba(76, 175, 80, 0.15);
// //             transform: translateY(-1px);
// //             transition: all 0.2s ease-in-out;
// //         }
        
// //         /* Better styling for locked state */
// //         .row-fully-approved .grid-row-check {
// //             background-color: #e8f5e8 !important;
// //         }
// //     `;
// //     document.head.appendChild(style);
// // }

// // ============================
// // Additional Size List Details Handlers
// // ============================

// // --- Range Handler (supports "1-5" or "1,8,12" but NOT mixing) ---
// frappe.ui.form.on('Size List Details', {
//     range: function(frm, cdt, cdn) {
//         let row = locals[cdt][cdn];
        
//         // Check verification status first
//         if (row && is_stone_verified(row)) {
//             frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
//             setTimeout(() => {
//                 let previous_value = get_previous_field_value(frm, row, 'range');
//                 frappe.model.set_value(cdt, cdn, 'range', previous_value || '');
//             }, 100);
//             return false;
//         }
        
//         if (!row || !row.range) return;

//         let input = row.range.toString().trim();
//         if (!input) return;

//         // Disallow mixing comma + dash
//         if (input.indexOf('-') !== -1 && input.indexOf(',') !== -1) {
//             frappe.show_alert({message: "Invalid input → You cannot mix ranges and comma values", indicator: "red"});
//             frappe.model.set_value(cdt, cdn, "range", "");
//             return;
//         }

//         // Parse numbers
//         let numbers = [];
//         if (input.indexOf('-') !== -1) {
//             let parts = input.split('-').map(s => s.trim());
//             let start = cint(parts[0]), end = cint(parts[1]);
//             if (isNaN(start) || isNaN(end) || start > end) {
//                 frappe.show_alert({message: "Invalid range → " + input, indicator: "red"});
//                 return;
//             }
//             for (let i = start; i <= end; i++) numbers.push(i);
//         } else if (input.indexOf(',') !== -1) {
//             numbers = input.split(',').map(s => cint(s.trim())).filter(n => !isNaN(n));
//         } else {
//             let n = cint(input);
//             if (!isNaN(n)) numbers = [n];
//         }

//         numbers = [...new Set(numbers)].sort((a,b) => a-b);
//         if (numbers.length === 0) return;

//         // First row must have stone_code
//         if (!row.stone_code) {
//             frappe.show_alert({message: "Please enter Stone Code in the first row before using range", indicator: "red"});
//             return;
//         }

//         let match = row.stone_code.match(/^(.*?)(\d+)$/);
//         if (!match) {
//             frappe.show_alert({message: "Stone Code must end with numbers, e.g. ABCDE001", indicator: "red"});
//             return;
//         }

//         let prefix = match[1], num_width = match[2].length;

//         // Clear range field
//         frappe.model.set_value(cdt, cdn, "range", "");

//         let duplicate_codes = [];

//         numbers.forEach((n, idx) => {
//             let stone_code = prefix + String(n).padStart(num_width, "0");

//             let exists = frm.doc.stone_details.some(r => r.stone_code === stone_code || r.serial_no === n);
//             if (exists) {
//                 duplicate_codes.push(stone_code);
//                 return;
//             }

//             let target_row;
//             if (idx === 0) {
//                 target_row = row;
//                 target_row.stone_code = stone_code;
//                 target_row.serial_no = n;
//             } else {
//                 target_row = frm.add_child("stone_details");
//                 Object.keys(row).forEach(f => {
//                     if (!["name","idx","doctype","stone_code","range","serial_no"].includes(f)) {
//                         target_row[f] = row[f];
//                     }
//                 });
//                 target_row.stone_code = stone_code;
//                 target_row.serial_no = n;
//             }

//             calculate_volume(frm, target_row.doctype, target_row.name);
//         });

//         // Show non-blocking alert for duplicates
//         if (duplicate_codes.length) {
//             frappe.show_alert({
//                 message: "Skipped duplicates: " + duplicate_codes.join(", "),
//                 indicator: "orange"
//             });
//         }

//         frm.refresh_field("stone_details");
//     },

//     // --- Dimension fields with inch validation ---
//     l2: function(frm, cdt, cdn) {
//         let row = locals[cdt][cdn];
//         if (row.l2 >= 12) {
//             frappe.msgprint(__('L2 must be less than 12 inches'));
//             frappe.model.set_value(cdt, cdn, 'l2', 0);
//         }
//         calculate_volume(frm, cdt, cdn);
//     },
//     b2: function(frm, cdt, cdn) {
//         let row = locals[cdt][cdn];
//         if (row.b2 >= 12) {
//             frappe.msgprint(__('B2 must be less than 12 inches'));
//             frappe.model.set_value(cdt, cdn, 'b2', 0);
//         }
//         calculate_volume(frm, cdt, cdn);
//     },
//     h2: function(frm, cdt, cdn) {
//         let row = locals[cdt][cdn];
//         if (row.h2 >= 12) {
//             frappe.msgprint(__('H2 must be less than 12 inches'));
//             frappe.model.set_value(cdt, cdn, 'h2', 0);
//         }
//         calculate_volume(frm, cdt, cdn);
//     },

//     stone_details_remove: function(frm) {
//         update_total_volume(frm);
//     },

//     // --- Process fields handlers (only if fields exist) ---
//     // Note: These fields don't exist in current Size List Details doctype
//     // Uncomment and add fields to doctype if needed:
//     // chemical: function(frm, cdt, cdn) {
//     //     if (frm._project_flags?.chemical) {
//     //         frappe.model.set_value(cdt, cdn, 'chemical', 1);
//     //         frappe.msgprint(__("Chemical is controlled by the selected Baps Project and cannot be changed."));
//     //     }
//     // },
//     // dry_fitting: function(frm, cdt, cdn) {
//     //     if (frm._project_flags?.dry_fitting) {
//     //         frappe.model.set_value(cdt, cdn, 'dry_fitting', 1);
//     //         frappe.msgprint(__("Dry Fitting is controlled by the selected Baps Project and cannot be changed."));
//     //     }
//     // },
//     // polishing: function(frm, cdt, cdn) {
//     //     if (frm._project_flags?.polishing) {
//     //         frappe.model.set_value(cdt, cdn, 'polishing', 1);
//     //         frappe.msgprint(__("Polishing is controlled by the selected Baps Project and cannot be changed."));
//     //     }
//     // },

//     refresh: function(frm) {
//         // Use the safer function that checks for field existence
//         set_child_grid_readonly(frm);
//     }
// });

// // --- Volume calculation for a single row ---
// function calculate_volume(frm, cdt, cdn) {
//     let row = locals[cdt][cdn];
//     if (!row) return;
//     let L = ((row.l1 || 0) * 12) + (row.l2 || 0);
//     let B = ((row.b1 || 0) * 12) + (row.b2 || 0);
//     let H = ((row.h1 || 0) * 12) + (row.h2 || 0);
//     row.volume = ((L * B * H) / 1728).toFixed(2);
//     frm.refresh_field('stone_details');
//     update_total_volume(frm);
// }

// // --- Total volume across all rows ---
// function update_total_volume(frm) {
//     let total = 0;
//     (frm.doc.stone_details || []).forEach(r => {
//         total += flt(r.volume);
//     });
//     frm.set_value('total_volume', total.toFixed(2));
// }

// // --- Helper: set child grid checkboxes read-only based on project flags ---
// function set_child_grid_readonly(frm) {
//     if (!frm.fields_dict || !frm.fields_dict.stone_details) return;
    
//     let grid = frm.fields_dict.stone_details.grid;
//     if (!grid) return;
    
//     // Check if fields exist before trying to set properties
//     let fields_to_check = ['chemical', 'dry_fitting', 'polishing'];
    
//     fields_to_check.forEach(field_name => {
//         try {
//             // Check if the field exists in the grid
//             let field_exists = grid.docfields.find(df => df.fieldname === field_name);
            
//             if (field_exists) {
//                 let read_only_value = frm._project_flags?.[field_name] ? 1 : 0;
//                 grid.update_docfield_property(field_name, 'read_only', read_only_value);
//             }
//         } catch (error) {
//             console.log(`Field ${field_name} not found in Size List Details, skipping...`);
//         }
//     });
// }

// // --- Apply project checkboxes to all child rows ---
// function apply_project_checkboxes(frm) {
//     console.log('=== APPLYING PROJECT CHECKBOXES ===');
//     console.log('Current project flags:', frm._project_flags);
    
//     // Check if main form has these fields before setting
//     let main_form_fields = ['chemical', 'dry_fitting', 'polishing'];
    
//     main_form_fields.forEach(field => {
//         if (frm.get_field(field) && frm._project_flags?.[field] !== undefined) {
//             console.log(`Setting main form ${field}=${frm._project_flags[field]}`);
//             frm.set_value(field, frm._project_flags[field]);
//         }
//     });
    
//     // Check if child table has these fields before setting
//     console.log('Number of stone_details rows:', (frm.doc.stone_details || []).length);
    
//     if (frm.doc.stone_details && frm.doc.stone_details.length > 0) {
//         // Check if fields exist in child doctype by looking at the first row's meta
//         let child_meta = frappe.get_meta("Size List Details");
//         let available_fields = child_meta.fields.map(f => f.fieldname);
        
//         (frm.doc.stone_details || []).forEach((row, index) => {
//             console.log(`Processing row ${index + 1}:`, row.name);
            
//             ['chemical', 'dry_fitting', 'polishing'].forEach(field => {
//                 if (available_fields.includes(field) && frm._project_flags?.[field]) {
//                     console.log(`Setting ${field}=1 for row ${index + 1}`);
//                     try {
//                         frappe.model.set_value(row.doctype, row.name, field, 1);
//                     } catch (error) {
//                         console.log(`Could not set ${field} for row ${index + 1}:`, error);
//                     }
//                 }
//             });
//         });
//     }
    
//     console.log('Refreshing stone_details field...');
//     frm.refresh_field("stone_details");
//     console.log('=== PROJECT CHECKBOXES APPLIED ===');
// }

// // ============================
// // VERIFICATION STATUS HELPER FUNCTIONS
// // ============================

// // Check if a stone is verified (read-only)
// function is_stone_verified(row) {
//     return row.verification_status === 'Verified';
// }

// // Check if a stone needs correction (can be edited)
// function is_stone_needs_correction(row) {
//     return row.verification_status === 'Incorrect' || row.needs_correction === 1;
// }

// // Apply verification status styling to all rows
// function apply_verification_status_styling(frm) {
//     if (!frm.doc.stone_details) {
//         console.log('❌ No stone_details found in document');
//         return;
//     }
    
//     console.log('🎨 Applying verification status styling...', frm.doc.stone_details.length, 'stones found');
    
//     setTimeout(() => {
//         frm.doc.stone_details.forEach((row, row_index) => {
//             // Try multiple selectors to find the correct row
//             let row_element = $(`.grid-row[data-idx="${row_index}"]`);
//             if (row_element.length === 0) {
//                 row_element = $(`.grid-row:nth-child(${row_index + 1})`);
//             }
//             if (row_element.length === 0) {
//                 row_element = $(`[data-fieldname="stone_details"] .grid-row:eq(${row_index})`);
//             }
            
//             console.log(`🔍 Row ${row_index}: Found ${row_element.length} elements`, {
//                 selector1: $(`.grid-row[data-idx="${row_index}"]`).length,
//                 selector2: $(`.grid-row:nth-child(${row_index + 1})`).length,
//                 selector3: $(`[data-fieldname="stone_details"] .grid-row:eq(${row_index})`).length
//             });
            
//             if (row_element.length === 0) {
//                 console.log(`❌ Row element not found for index ${row_index}`);
//                 return;
//             }
            
//             console.log(`🔍 Processing row ${row_index}:`, {
//                 stone_name: row.stone_name,
//                 verification_status: row.verification_status,
//                 needs_correction: row.needs_correction
//             });
            
//             // Remove existing verification classes and badges
//             row_element.removeClass('verification-verified verification-incorrect verification-pending');
//             row_element.find('.verification-status-badge').remove();
            
//             // Apply appropriate styling based on verification status
//             if (row.verification_status === 'Verified') {
//                 console.log(`✅ Applying verified styling to row ${row_index}`);
//                 row_element.addClass('verification-verified');
                
//                 // Apply prominent green background to entire row
//                 row_element.css({
//                     'background': 'linear-gradient(90deg, #d4edda 0%, #e8f5e8 100%) !important',
//                     'border-left': '5px solid #28a745 !important',
//                     'border-right': '2px solid #28a745 !important',
//                     'box-shadow': '0 2px 4px rgba(40, 167, 69, 0.2) !important',
//                     'font-weight': '500 !important'
//                 });
                
//                 // Make all inputs read-only for verified stones with prominent green styling
//                 row_element.find('input, select, textarea, .form-control').each(function() {
//                     $(this).prop('readonly', true)
//                            .prop('disabled', true)
//                            .css({
//                                'background-color': '#d4edda !important',
//                                'color': '#155724 !important',
//                                'cursor': 'not-allowed !important',
//                                'border': '1px solid #28a745 !important',
//                                'font-weight': '500 !important',
//                                'opacity': '1 !important'
//                            })
//                            .attr('title', '✅ This stone is verified and cannot be modified')
//                            .addClass('verified-field-locked');
//                 });
                
//                 // Block all events on verified fields
//                 row_element.find('input, select, textarea').off().on('click focus keydown keypress change', function(e) {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     frappe.show_alert({
//                         message: __('❌ This stone is verified and cannot be modified'),
//                         indicator: 'red'
//                     });
//                     return false;
//                 });
                
//                 // Add verification status badge
//                 if (!row_element.find('.verification-status-badge').length) {
//                     row_element.find('.grid-row-index').append(
//                         '<span class="verification-status-badge verification-status-verified">✅ Verified</span>'
//                     );
//                 }
                
//             } else if (row.verification_status === 'Incorrect' || row.needs_correction === 1) {
//                 console.log(`🔴 Applying incorrect styling to row ${row_index}`);
//                 row_element.addClass('verification-incorrect');
                
//                 // Apply orange/yellow background to entire row for incorrect stones
//                 row_element.css({
//                     'background-color': '#fff3cd !important',
//                     'border-left': '4px solid #ffc107',
//                     'animation': 'pulse-orange 2s infinite'
//                 });
                
//                 // Allow editing for incorrect stones - make them prominent
//                 row_element.find('input, select, textarea, .form-control').each(function() {
//                     $(this).prop('readonly', false)
//                            .prop('disabled', false)
//                            .css({
//                                'background-color': '#fff3cd !important',
//                                'color': '#856404 !important',
//                                'cursor': 'text !important',
//                                'border': '2px solid #ffc107 !important'
//                            })
//                            .attr('title', '⚠️ This stone needs correction - please edit it')
//                            .removeClass('verified-field-locked');
//                 });
                
//                 // Add focus highlighting for incorrect fields
//                 row_element.find('input, select, textarea').off('focus blur').on('focus', function() {
//                     $(this).css({
//                         'background-color': '#fff8e1 !important',
//                         'border': '3px solid #ff9800 !important',
//                         'box-shadow': '0 0 10px rgba(255, 152, 0, 0.5) !important'
//                     });
//                     frappe.show_alert({
//                         message: __('📝 Editing stone that needs correction'),
//                         indicator: 'orange'
//                     });
//                 }).on('blur', function() {
//                     $(this).css({
//                         'background-color': '#fff3cd !important',
//                         'border': '2px solid #ffc107 !important',
//                         'box-shadow': 'none'
//                     });
//                 });
                
//                 // Add verification status badge
//                 if (!row_element.find('.verification-status-badge').length) {
//                     row_element.find('.grid-row-index').append(
//                         '<span class="verification-status-badge verification-status-incorrect">⚠️ Needs Correction</span>'
//                     );
//                 }
                
//             } else {
//                 // Pending verification or no verification status
//                 console.log(`⏳ Applying pending styling to row ${row_index}`);
//                 row_element.addClass('verification-pending');
                
//                 // Remove any previous styling
//                 row_element.css({
//                     'background-color': '',
//                     'border-left': '',
//                     'opacity': '',
//                     'animation': ''
//                 });
                
//                 // Allow editing for pending stones
//                 row_element.find('input, select, textarea, .form-control').each(function() {
//                     $(this).prop('readonly', false)
//                            .prop('disabled', false)
//                            .css({
//                                'background-color': '',
//                                'color': '',
//                                'cursor': 'text',
//                                'border': '',
//                                'opacity': ''
//                            })
//                            .attr('title', 'This stone is pending verification')
//                            .removeClass('verified-field-locked')
//                            .off('focus blur'); // Remove event handlers
//                 });
                
//                 // Add verification status badge
//                 if (!row_element.find('.verification-status-badge').length) {
//                     row_element.find('.grid-row-index').append(
//                         '<span class="verification-status-badge verification-status-pending">⏳ Pending</span>'
//                     );
//                 }
//             }
//         });
//     }, 500);
// }

// // Load verification summary for Size List
// function load_verification_summary(frm) {
//     if (!frm.doc.name) return;
    
//     frappe.call({
//         method: "baps.baps.doctype.size_list_verification.size_list_verification.get_verification_summary",
//         args: {
//             form_number: frm.doc.name
//         },
//         callback: function(r) {
//             if (r.message && r.message.success) {
//                 let summary = r.message.data;
                
//                 // Show verification summary in dashboard
//                 if (summary.total_stones > 0) {
//                     let status_text = `Verification Status: ${summary.verified_count} verified, ${summary.incorrect_count} incorrect, ${summary.pending_count} pending`;
                    
//                     frm.dashboard.clear_comment();
//                     if (summary.verification_complete) {
//                         frm.dashboard.add_comment(status_text + ' - ✅ Verification Complete!', 'green', true);
//                     } else if (summary.incorrect_count > 0) {
//                         frm.dashboard.add_comment(status_text + ' - ⚠️ Some stones need correction', 'orange', true);
//                     } else {
//                         frm.dashboard.add_comment(status_text + ' - ⏳ Verification in progress', 'blue', true);
//                     }
//                 }
//             }
//         }
//     });
// }

// // ============================
// // ENHANCED VERIFICATION FIELD LOCKING
// // ============================

// // Enhanced function to lock verified fields with multiple approaches
// function lock_verified_fields(frm) {
//     if (!frm.doc.stone_details) return;
    
//     console.log('🔒 Enhanced locking of verified fields...');
    
//     frm.doc.stone_details.forEach((row, row_index) => {
//         if (is_stone_verified(row)) {
//             console.log(`🔒 Locking verified stone at row ${row_index}:`, row.stone_name);
            
//             // Method 1: Lock using grid API
//             try {
//                 let grid = frm.get_field('stone_details').grid;
//                 if (grid && grid.grid_rows && grid.grid_rows[row_index]) {
//                     let grid_row = grid.grid_rows[row_index];
                    
//                     // Make individual fields read-only
//                     ['stone_name', 'stone_code', 'range', 'l1', 'l2', 'b1', 'b2', 'h1', 'h2'].forEach(fieldname => {
//                         if (grid_row.fields_dict && grid_row.fields_dict[fieldname]) {
//                             grid_row.fields_dict[fieldname].df.read_only = 1;
//                             grid_row.fields_dict[fieldname].refresh();
//                         }
//                     });
//                 }
//             } catch (e) {
//                 console.log('Grid API method failed:', e);
//             }
            
//             // Method 2: Direct DOM manipulation with aggressive locking
//             setTimeout(() => {
//                 let row_selector = `.grid-row[data-idx="${row_index}"]`;
//                 let $row = $(row_selector);
                
//                 if ($row.length === 0) {
//                     // Try alternative selectors
//                     $row = $(`.grid-row:nth-child(${row_index + 1})`);
//                 }
                
//                 if ($row.length > 0) {
//                     console.log(`🎯 Found row DOM element for locking: ${row_index}`);
                    
//                     // Lock all input fields in verified rows
//                     $row.find('input, select, textarea, .form-control, .input-with-feedback').each(function() {
//                         let $input = $(this);
                        
//                         // Make readonly and disabled
//                         $input.prop('readonly', true)
//                                .prop('disabled', true)
//                                .attr('tabindex', '-1')
//                                .addClass('verified-locked-field');
                        
//                         // Apply locked styling
//                         $input.css({
//                             'background-color': '#e8f5e8 !important',
//                             'color': '#155724 !important',
//                             'cursor': 'not-allowed !important',
//                             'border': '1px solid #28a745 !important',
//                             'opacity': '0.8 !important',
//                             'pointer-events': 'none !important'
//                         });
                        
//                         // Remove all existing event handlers and add blocking handlers
//                         $input.off();
//                         $input.on('click focus keydown keypress keyup change input paste cut copy', function(e) {
//                             e.preventDefault();
//                             e.stopImmediatePropagation();
                            
//                             frappe.show_alert({
//                                 message: '🔒 This stone is verified and cannot be modified',
//                                 indicator: 'red'
//                             });
                            
//                             // Force blur if focused
//                             if (document.activeElement === this) {
//                                 this.blur();
//                             }
                            
//                             return false;
//                         });
                        
//                         // Set tooltip
//                         $input.attr('title', '🔒 This stone is verified and cannot be modified');
//                     });
                    
//                     // Lock entire row visually
//                     $row.css({
//                         'background-color': '#e8f5e8 !important',
//                         'opacity': '0.8',
//                         'border-left': '4px solid #28a745',
//                         'position': 'relative'
//                     });
                    
//                     // Add locked indicator if not exists
//                     if (!$row.find('.verified-lock-indicator').length) {
//                         $row.prepend('<div class="verified-lock-indicator">🔒 VERIFIED</div>');
//                     }
//                 } else {
//                     console.log(`❌ Could not find row DOM element for index ${row_index}`);
//                 }
//             }, 500);
            
//             // Method 3: Override frappe events for this row
//             setTimeout(() => {
//                 // Find and override any frappe form events for this row
//                 try {
//                     let grid = frm.get_field('stone_details').grid;
//                     if (grid && grid.grid_rows && grid.grid_rows[row_index]) {
//                         let grid_row = grid.grid_rows[row_index];
                        
//                         // Override the toggle_editable_row method for verified rows
//                         if (grid_row.toggle_editable_row) {
//                             grid_row.original_toggle_editable_row = grid_row.toggle_editable_row;
//                             grid_row.toggle_editable_row = function() {
//                                 frappe.show_alert({
//                                     message: '🔒 This verified stone cannot be edited',
//                                     indicator: 'red'
//                                 });
//                                 return false;
//                             };
//                         }
//                     }
//                 } catch (e) {
//                     console.log('Frappe event override failed:', e);
//                 }
//             }, 1000);
//         }
//     });
    
//     console.log('✅ Enhanced verification field locking completed');
// }

// // Additional CSS for locked verified fields
// if (!document.querySelector('#verified-lock-styles')) {
//     const style = document.createElement('style');
//     style.id = 'verified-lock-styles';
//     style.textContent = `
//         .verified-locked-field {
//             background-color: #e8f5e8 !important;
//             color: #155724 !important;
//             cursor: not-allowed !important;
//             border: 1px solid #28a745 !important;
//             opacity: 0.8 !important;
//             pointer-events: none !important;
//             user-select: none !important;
//         }
        
//         .verified-lock-indicator {
//             position: absolute;
//             top: 2px;
//             right: 5px;
//             background: #28a745;
//             color: white;
//             padding: 2px 6px;
//             border-radius: 3px;
//             font-size: 10px;
//             font-weight: bold;
//             z-index: 1000;
//             pointer-events: none;
//         }
        
//         .grid-row.verified-row-locked {
//             background-color: #e8f5e8 !important;
//             opacity: 0.8 !important;
//             border-left: 4px solid #28a745 !important;
//         }
        
//         .grid-row.verified-row-locked:hover {
//             background-color: #e8f5e8 !important;
//         }
        
//         .verification-verified .grid-static-col,
//         .verification-verified input,
//         .verification-verified select,
//         .verification-verified textarea {
//             background-color: #e8f5e8 !important;
//             color: #155724 !important;
//             cursor: not-allowed !important;
//             opacity: 0.8 !important;
//             pointer-events: none !important;
//         }
//     `;
//     document.head.appendChild(style);
// }








// ============================
// Size List - Field-Level Approval System with Verification Status
// ============================

// Add CSS for verification status styling
if (!document.querySelector('#verification-status-styles')) {
    const style = document.createElement('style');
    style.id = 'verification-status-styles';
    style.textContent = `
        /* Enhanced Verified Row Styling - More Prominent Green */
        .verification-verified {
            background-color: #d4edda !important;
            border-left: 5px solid #28a745 !important;
            border-right: 2px solid #28a745 !important;
        }
        .verification-incorrect {
            background-color: #fff3cd !important;
            border-left: 5px solid #ffc107 !important;
            border-right: 2px solid #ffc107 !important;
        }
        .verification-pending {
            background-color: #f8f9fa !important;
            border-left: 5px solid #6c757d !important;
        }
        
        /* Enhanced styling for verified row content */
        .grid-row.verification-verified {
            background: linear-gradient(90deg, #d4edda 0%, #e8f5e8 100%) !important;
            box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2) !important;
        }
        
        /* Verified row cells and inputs */
        .grid-row .verification-verified .grid-static-col,
        .grid-row .verification-verified input,
        .grid-row .verification-verified select,
        .grid-row .verification-verified textarea,
        .verification-verified .grid-static-col,
        .verification-verified input,
        .verification-verified select,
        .verification-verified textarea {
            background-color: #d4edda !important;
            color: #155724 !important;
            cursor: not-allowed !important;
            font-weight: 500 !important;
            border: 1px solid #c3e6cb !important;
        }
        
        /* Disabled verified fields */
        .grid-row .verification-verified input:disabled,
        .grid-row .verification-verified select:disabled,
        .grid-row .verification-verified textarea:disabled,
        .verification-verified input:disabled,
        .verification-verified select:disabled,
        .verification-verified textarea:disabled {
            background-color: #d4edda !important;
            color: #155724 !important;
            border: 1px solid #28a745 !important;
            opacity: 1 !important;
        }
        
        /* Incorrect row styling */
        .grid-row .verification-incorrect .grid-static-col,
        .grid-row .verification-incorrect input,
        .grid-row .verification-incorrect select,
        .grid-row .verification-incorrect textarea,
        .verification-incorrect .grid-static-col,
        .verification-incorrect input,
        .verification-incorrect select,
        .verification-incorrect textarea {
            background-color: #fff3cd !important;
            border: 1px solid #ffc107 !important;
            color: #856404 !important;
        }
        
        /* Focus states for incorrect fields */
        .grid-row .verification-incorrect input:focus,
        .grid-row .verification-incorrect select:focus,
        .grid-row .verification-incorrect textarea:focus,
        .verification-incorrect input:focus,
        .verification-incorrect select:focus,
        .verification-incorrect textarea:focus {
            background-color: #fff8e1 !important;
            border: 2px solid #ff9800 !important;
            box-shadow: 0 0 5px rgba(255, 152, 0, 0.3) !important;
        }
        .grid-row .verification-pending .grid-static-col {
            background-color: #f8f9fa !important;
        }
        .verification-status-badge {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
            margin-left: 5px;
        }
        .verification-status-verified {
            background-color: #28a745;
            color: white;
        }
        .verification-status-incorrect {
            background-color: #ffc107;
            color: #212529;
        }
        .verification-status-pending {
            background-color: #6c757d;
            color: white;
        }
        
        /* Animation for incorrect stones */
        @keyframes pulse-orange {
            0% { background-color: #fff3cd !important; }
            50% { background-color: #ffe69c !important; }
            100% { background-color: #fff3cd !important; }
        }
        
        /* Subtle animation for verified stones - gentle highlight */
        @keyframes verified-glow {
            0% { box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2) !important; }
            50% { box-shadow: 0 4px 8px rgba(40, 167, 69, 0.4) !important; }
            100% { box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2) !important; }
        }
        
        .verification-verified {
            animation: verified-glow 3s ease-in-out infinite !important;
        }
        
        /* Enhanced verified row styling */
        .verification-verified::before {
            content: "✅";
            position: absolute;
            left: -15px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 14px;
            z-index: 10;
        }
        
        /* Stronger styling for verified stones */
        .verified-field-locked {
            pointer-events: none !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
        }
    `;
    document.head.appendChild(style);
}

// Child Table Handler - Size List Details
frappe.ui.form.on('Size List Details', {
    // Stone Name handler with verification status check
    stone_name: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        
        // Check verification status first
        if (is_stone_verified(row)) {
            // Show prominent alert
            frappe.show_alert({
                message: __('🚫 This stone is VERIFIED and cannot be modified!'),
                indicator: 'red'
            });
            
            // Also show msgprint for more visibility
            frappe.msgprint({
                title: __('🔒 Stone is Verified'),
                message: __('This stone has been verified and is locked for editing. If you need to make changes, please mark it as incorrect in the Size List Verification form first.'),
                indicator: 'red'
            });
            
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'stone_name');
                frappe.model.set_value(cdt, cdn, 'stone_name', previous_value || '');
            }, 100);
            return false;
        }
        
        if (is_field_approved(frm, row, 'stone_name')) {
            frappe.show_alert({message: __('Stone Name is approved and locked'), indicator: 'red'});
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'stone_name');
                frappe.model.set_value(cdt, cdn, 'stone_name', previous_value);
                
                // Also force gray styling for the entire row
                let row_index = row.idx - 1;
                force_row_gray_styling(row_index);
            }, 100);
            return false;
        }
        // Save current value for future reference
        save_previous_field_value(frm, row, 'stone_name', row.stone_name);
        
        // Original stone_name logic
        if (row && row.stone_name) {
            frappe.db.get_value('Stone Name', row.stone_name, 'stone_code', (r) => {
                if (r && r.stone_code) {
                    frappe.model.set_value(cdt, cdn, 'stone_code', r.stone_code);
                }
            });
        }
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },

    stone_code: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        
        // Check verification status first
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'stone_code');
                frappe.model.set_value(cdt, cdn, 'stone_code', previous_value);
            }, 100);
            return false;
        }
        
        if (is_field_approved(frm, row, 'stone_code')) {
            frappe.show_alert({message: __('Stone Code is approved and locked'), indicator: 'red'});
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'stone_code');
                frappe.model.set_value(cdt, cdn, 'stone_code', previous_value);
            }, 100);
            return false;
        }
        // Save current value for future reference
        save_previous_field_value(frm, row, 'stone_code', row.stone_code);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },

    // Dimension fields with verification and approval checks
    l1: function(frm, cdt, cdn) { 
        let row = locals[cdt][cdn];
        
        // Check verification status first
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'l1');
                frappe.model.set_value(cdt, cdn, 'l1', previous_value);
            }, 100);
            return false;
        }
        
        if (is_field_approved(frm, row, 'l1')) {
            frappe.show_alert({message: __('L1 field is approved and locked'), indicator: 'red'});
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'l1');
                frappe.model.set_value(cdt, cdn, 'l1', previous_value);
            }, 100);
            return false;
        }
        // Save current value for future reference
        save_previous_field_value(frm, row, 'l1', row.l1);
        calculate_volume(frm, cdt, cdn); 
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },
    
    l2: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        
        // Check verification status first
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'l2');
                frappe.model.set_value(cdt, cdn, 'l2', previous_value);
            }, 100);
            return false;
        }
        
        if (is_field_approved(frm, row, 'l2')) {
            frappe.show_alert({message: __('L2 field is approved and locked'), indicator: 'red'});
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'l2');
                frappe.model.set_value(cdt, cdn, 'l2', previous_value);
            }, 100);
            return false;
        }
        // Save current value for future reference
        save_previous_field_value(frm, row, 'l2', row.l2);
        if (row && row.l2 >= 12) {
            frappe.msgprint(__('L2 must be less than 12 inches'));
            frappe.model.set_value(cdt, cdn, 'l2', 0);
        }
        calculate_volume(frm, cdt, cdn);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },
    
    b1: function(frm, cdt, cdn) { 
        let row = locals[cdt][cdn];
        
        // Check verification status first
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'b1');
                frappe.model.set_value(cdt, cdn, 'b1', previous_value);
            }, 100);
            return false;
        }
        
        if (is_field_approved(frm, row, 'b1')) {
            frappe.show_alert({message: __('B1 field is approved and locked'), indicator: 'red'});
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'b1');
                frappe.model.set_value(cdt, cdn, 'b1', previous_value);
            }, 100);
            return false;
        }
        // Save current value for future reference
        save_previous_field_value(frm, row, 'b1', row.b1);
        calculate_volume(frm, cdt, cdn); 
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },
    
    b2: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        
        // Check verification status first
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'b2');
                frappe.model.set_value(cdt, cdn, 'b2', previous_value);
            }, 100);
            return false;
        }
        
        if (is_field_approved(frm, row, 'b2')) {
            frappe.show_alert({message: __('B2 field is approved and locked'), indicator: 'red'});
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'b2');
                frappe.model.set_value(cdt, cdn, 'b2', previous_value);
            }, 100);
            return false;
        }
        // Save current value for future reference
        save_previous_field_value(frm, row, 'b2', row.b2);
        if (row && row.b2 >= 12) {
            frappe.msgprint(__('B2 must be less than 12 inches'));
            frappe.model.set_value(cdt, cdn, 'b2', 0);
        }
        calculate_volume(frm, cdt, cdn);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },
    
    h1: function(frm, cdt, cdn) { 
        let row = locals[cdt][cdn];
        
        // Check verification status first
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'h1');
                frappe.model.set_value(cdt, cdn, 'h1', previous_value);
            }, 100);
            return false;
        }
        
        if (is_field_approved(frm, row, 'h1')) {
            frappe.show_alert({message: __('H1 field is approved and locked'), indicator: 'red'});
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'h1');
                frappe.model.set_value(cdt, cdn, 'h1', previous_value);
            }, 100);
            return false;
        }
        // Save current value for future reference
        save_previous_field_value(frm, row, 'h1', row.h1);
        calculate_volume(frm, cdt, cdn); 
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },
    
    h2: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        
        // Check verification status first
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'h2');
                frappe.model.set_value(cdt, cdn, 'h2', previous_value);
            }, 100);
            return false;
        }
        
        if (is_field_approved(frm, row, 'h2')) {
            frappe.show_alert({message: __('H2 field is approved and locked'), indicator: 'red'});
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'h2');
                frappe.model.set_value(cdt, cdn, 'h2', previous_value);
            }, 100);
            return false;
        }
        // Save current value for future reference
        save_previous_field_value(frm, row, 'h2', row.h2);
        if (row && row.h2 >= 12) {
            frappe.msgprint(__('H2 must be less than 12 inches'));
            frappe.model.set_value(cdt, cdn, 'h2', 0);
        }
        calculate_volume(frm, cdt, cdn);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },

    stone_details_remove: function(frm) {
        update_total_volume(frm);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    }
});




// ============================
// LOCK VERIFIED ROWS
// ============================
function lock_verified_fields(frm) {
    if (!frm.doc.stone_details || !frm.fields_dict.stone_details) return;

    setTimeout(() => {
        let grid_rows = frm.fields_dict.stone_details.grid.grid_rows || [];

        frm.doc.stone_details.forEach(row => {
            // ✅ Use the actual verification_status field
            if (row.verification_status !== "Verified") return;

            // Find the grid row
            let grid_row = grid_rows.find(r => r.doc && r.doc.name === row.name);
            if (!grid_row) return;

            // Fields you want to lock
            let required_fields = [
                "stone_name", "stone_code", "l1", "b1", "h1",
                "l2", "b2", "h2", "volume"
            ];

            required_fields.forEach(field => {
                let $field = grid_row.row.find(`[data-fieldname="${field}"]`);
                if ($field.length && $field.closest("tbody").length) {
                    $field.addClass("field-approved");
                    $field.find("input, select, textarea")
                        .prop("readonly", true)
                        .prop("disabled", true)
                        .addClass("field-approved-input")
                        .attr("title", "This field is approved and locked")
                        .off("click focus keydown keypress keyup change input")
                        .on("click focus keydown keypress keyup change input", function(e){
                            e.preventDefault();
                            e.stopPropagation();
                            frappe.show_alert({
                                message: "This field is approved and locked",
                                indicator: "red"
                            });
                        });
                }
            });

            // ✅ Add row-level styling only for verified rows
            let $row = grid_row.row;
            $row.addClass("row-fully-approved");
            if (!$row.find(".row-approved-indicator").length) {
                $row.find(".grid-row-index").append(
                    '<span class="row-approved-indicator">✓</span>'
                );
            }
        });
    }, 300); // wait for grid to fully render
}








// Parent Form Handler - Size List
frappe.ui.form.on('Size List', {
    refresh: function(frm) {
        setup_approval_and_publish_buttons(frm);
        
        // Restore approval states from saved data
        restore_approval_states(frm);
        
        // Initialize previous field values for all rows
        initialize_previous_field_values(frm);
        
        // Apply field-level approval styling when form loads
        setTimeout(() => {
            apply_all_field_approval_states(frm);
        }, 800);
        
        // Load project flags if baps_project is selected
        if (frm.doc.baps_project) {
            load_project_flags(frm);
        }
    },

    baps_project: function(frm) {
        if (frm.doc.baps_project) {
            load_project_flags(frm);
        } else {
            frm._project_flags = { chemical: 0, dry_fitting: 0, polishing: 0 };
            set_child_grid_readonly(frm);
        }
    },
    
    main_part: function(frm) {
        if (!frm.doc.main_part) frm.set_value('sub_part', '');
        
        frm.set_query("sub_part", function() {
            if (!frm.doc.main_part) {
                frappe.throw("Please select Main Part before choosing a Sub Part.");
            }
            return {
                filters: {
                    main_part: frm.doc.main_part
                }
            };
        });

        // clear sub_part if mismatch
        if (frm.doc.sub_part) {
            frappe.db.get_value("Sub Part", frm.doc.sub_part, "main_part", function(r) {
                if (r && r.main_part !== frm.doc.main_part) {
                    frm.set_value("sub_part", null);
                }
            });
        }
    },
    
    sub_part: function(frm) {
        if (!frm.doc.sub_part) frm.set_value('main_part', '');
    },
    
    stone_details_add: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (frm._project_flags?.chemical) frappe.model.set_value(cdt, cdn, 'chemical', 1);
        if (frm._project_flags?.dry_fitting) frappe.model.set_value(cdt, cdn, 'dry_fitting', 1);
        if (frm._project_flags?.polishing) frappe.model.set_value(cdt, cdn, 'polishing', 1);
    },
    
    validate: function(frm) {
        if (!frm.doc.main_part && frm.doc.sub_part) {
            frappe.throw("You cannot add a Sub Part without selecting a Main Part.");
        }
    }
});

// ============================
// PERSISTENT STORAGE FUNCTIONS (Browser localStorage)
// ============================

// Get unique key for this document's approval data
function get_approval_storage_key(frm) {
    return `size_list_approvals_${frm.doc.name || 'new'}`;
}

// Check if a field is approved (with persistent storage)
function is_field_approved(frm, row, field_name) {
    try {
        let storage_key = get_approval_storage_key(frm);
        let approval_data = localStorage.getItem(storage_key);
        if (!approval_data) return false;
        
        approval_data = JSON.parse(approval_data);
        return !!(approval_data[row.name] && approval_data[row.name][field_name]);
    } catch (e) {
        console.error('Error checking field approval state:', e);
        return false;
    }
}

// Save approval state to localStorage
function save_approval_state(frm, row_name, field_name, is_approved) {
    try {
        let storage_key = get_approval_storage_key(frm);
        let approval_data = {};
        
        // Load existing approval data
        let existing_data = localStorage.getItem(storage_key);
        if (existing_data) {
            approval_data = JSON.parse(existing_data);
        }
        
        // Initialize row data if not exists
        if (!approval_data[row_name]) {
            approval_data[row_name] = {};
        }
        
        // Set approval state
        approval_data[row_name][field_name] = is_approved;
        
        // Save back to localStorage
        localStorage.setItem(storage_key, JSON.stringify(approval_data));
    } catch (e) {
        console.error('Error saving approval state:', e);
    }
}

// Restore approval states from localStorage
function restore_approval_states(frm) {
    if (!frm.doc.stone_details) return;
    
    try {
        let storage_key = get_approval_storage_key(frm);
        let approval_data = localStorage.getItem(storage_key);
        if (!approval_data) return;
        
        approval_data = JSON.parse(approval_data);
        
        frm.doc.stone_details.forEach(row => {
            if (approval_data[row.name]) {
                // Restore client-side approval data for immediate use
                row._approved_fields = approval_data[row.name];
            }
        });
    } catch (e) {
        console.error('Error restoring approval states:', e);
    }
}

// Helper functions for field value management
function save_previous_field_value(frm, row, field_name, value) {
    try {
        let storage_key = `${get_approval_storage_key(frm)}_previous_values`;
        let previous_data = {};
        
        // Load existing previous value data
        let existing_data = localStorage.getItem(storage_key);
        if (existing_data) {
            previous_data = JSON.parse(existing_data);
        }
        
        // Initialize row data if not exists
        if (!previous_data[row.name]) {
            previous_data[row.name] = {};
        }
        
        // Set previous value
        previous_data[row.name][field_name] = value;
        
        // Save back to localStorage
        localStorage.setItem(storage_key, JSON.stringify(previous_data));
    } catch (e) {
        console.error('Error saving previous field value:', e);
    }
}

function get_previous_field_value(frm, row, field_name) {
    try {
        let storage_key = `${get_approval_storage_key(frm)}_previous_values`;
        let previous_data = localStorage.getItem(storage_key);
        if (!previous_data) return null;
        
        previous_data = JSON.parse(previous_data);
        return previous_data[row.name] && previous_data[row.name][field_name] || null;
    } catch (e) {
        console.error('Error getting previous field value:', e);
        return null;
    }
}

// Initialize previous field values for all rows
function initialize_previous_field_values(frm) {
    if (!frm.doc.stone_details) return;
    
    let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
    
    frm.doc.stone_details.forEach(row => {
        required_fields.forEach(field => {
            if (row[field] !== undefined && row[field] !== null) {
                save_previous_field_value(frm, row, field, row[field]);
            }
        });
    });
}


// ============================
// CORE FUNCTIONS
// ============================

// Volume calculation for a single row
function calculate_volume(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
    if (!row) return;
    
    let L = ((row.l1 || 0) * 12) + (row.l2 || 0);
    let B = ((row.b1 || 0) * 12) + (row.b2 || 0);
    let H = ((row.h1 || 0) * 12) + (row.h2 || 0);
    
    row.volume = ((L * B * H) / 1728).toFixed(2);
    frm.refresh_field('stone_details');
    update_total_volume(frm);
}

// Total volume across all rows
function update_total_volume(frm) {
    let total = 0;
    (frm.doc.stone_details || []).forEach(r => {
        total += flt(r.volume);
    });
    frm.set_value('total_volume', total.toFixed(2));
}

// Load project flags from Baps Project
function load_project_flags(frm) {
    if (!frm.doc.baps_project) {
        frm._project_flags = { chemical: 0, dry_fitting: 0, polishing: 0 };
        set_child_grid_readonly(frm);
        return;
    }
    
    frappe.db.get_doc('Baps Project', frm.doc.baps_project).then(project_doc => {
        if (project_doc) {
            
            // Store project flags for child table reference
            frm._project_flags = {
                chemical: project_doc.chemical ? 1 : 0,
                dry_fitting: project_doc.dry_fitting ? 1 : 0,
                polishing: project_doc.polishing ? 1 : 0
            };
            
            // Apply to all existing child rows
            apply_project_checkboxes(frm);
            
            // Set child grid readonly based on flags
            set_child_grid_readonly(frm);
        }
    }).catch(err => {
        frm._project_flags = { chemical: 0, dry_fitting: 0, polishing: 0 };
    });
}


frappe.ui.form.on('Size List', {
    refresh: function(frm) {
        setup_main_part_sub_part(frm); 
        setup_volume_calculation('stone_details');
    }
});

// ============================
// APPROVAL SYSTEM FUNCTIONS
// ============================

// // Setup approval and publish buttons
// function setup_approval_and_publish_buttons(frm) {
//     // Remove ALL existing custom buttons to prevent duplicates
//     Object.keys(frm.custom_buttons || {}).forEach(key => {
//         if (frm.custom_buttons[key] && frm.custom_buttons[key].remove) {
//             frm.custom_buttons[key].remove();
//         }
//     });
//     frm.custom_buttons = {};

//     // Primary button - Approve Selected Fields (with multiple fallback methods)
//     frm.add_custom_button(__('Approve Selected Fields'), () => approve_selected_fields(frm))
//         .addClass('btn-primary');
    
//     // Alternative button - Approve All Filled Fields (simpler approach)
//     frm.add_custom_button(__('Approve All Filled Fields'), () => approve_all_filled_fields(frm))
//         .addClass('btn-info');

//     // Check if all fields in all rows are filled and approved
//     let all_complete = check_all_fields_complete(frm);
    
//     if (all_complete) {
//         // Show Publish button only when everything is complete
//         frm.add_custom_button(__('Publish'), () => publish_data(frm))
//             .addClass('btn-success');
//     } else {
//         // Show single progress message - only one button
//         let progress = get_completion_progress(frm);
//         frm.add_custom_button(__(`Progress: ${progress.filled}/${progress.total} fields`), () => {
//             frappe.msgprint(__('Complete all fields to enable publishing.'));
//         }).addClass('btn-secondary');
//     }
// }

// // Check if all fields in all rows are completely filled
// function check_all_fields_complete(frm) {
//     if (!frm.doc.stone_details || frm.doc.stone_details.length === 0) return false;
    
//     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
    
//     for (let row of frm.doc.stone_details) {
//         for (let field of required_fields) {
//             let value = row[field];
//             if (value === undefined || value === null || value === '' || value === 0) {
//                 return false; // Found empty field
//             }
//         }
        
//         // Also check if all fields are approved
//         for (let field of required_fields) {
//             if (!is_field_approved(frm, row, field)) return false;
//         }
//     }
//     return true; // All fields filled and approved
// }

// // Get completion progress
// function get_completion_progress(frm) {
//     if (!frm.doc.stone_details) return {filled: 0, total: 0};
    
//     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
//     let total_fields = frm.doc.stone_details.length * required_fields.length;
//     let filled_fields = 0;
    
//     frm.doc.stone_details.forEach(row => {
//         required_fields.forEach(field => {
//             let value = row[field];
//             if (value !== undefined && value !== null && value !== '' && value !== 0) {
//                 filled_fields++;
//             }
//         });
//     });
    
//     return {filled: filled_fields, total: total_fields};
// }

// // Approve selected fields in selected rows
// function approve_selected_fields(frm) {
//     if (!frm.doc.stone_details || frm.doc.stone_details.length === 0) {
//         frappe.msgprint(__('No rows to approve'));
//         return;
//     }
    
//     // Method 1: Try to get selected rows from grid
//     let selected_rows = [];
    
//     // Check if grid exists and has selected rows
//     let grid = frm.get_field('stone_details').grid;
//     if (grid && grid.get_selected_children) {
//         selected_rows = grid.get_selected_children();
//     }
    
//     // Method 2: Fallback - use jQuery to find selected checkboxes
//     if (selected_rows.length === 0) {
//         $('.grid-row').each(function() {
//             let $row = $(this);
//             let checkbox = $row.find('.grid-row-check input[type="checkbox"]');
//             if (checkbox.length && checkbox.is(':checked')) {
//                 let row_index = parseInt($row.attr('data-idx'));
//                 if (!isNaN(row_index) && frm.doc.stone_details[row_index]) {
//                     let row_doc = frm.doc.stone_details[row_index];
//                     if (row_doc && !selected_rows.find(r => r.name === row_doc.name)) {
//                         selected_rows.push(row_doc);

//                     }
//                 }
//             }
//         });
//     }
    
//     // Method 3: If still no selection, try alternative grid approach
//     if (selected_rows.length === 0) {
//         try {
//             selected_rows = frm.fields_dict.stone_details.grid.get_selected();
//         } catch (e) {
//             console.error('Grid selection method failed:', e);
//         }
//     }
    
//     // Method 4: If no rows selected, show dialog to select specific rows
//     if (selected_rows.length === 0) {
//         show_row_selection_dialog(frm);
//         return;
//     }
    
//     let approved_count = 0;
//     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
    
//     selected_rows.forEach(row => {
//         approved_count += approve_filled_fields_in_row(frm, row, required_fields);
//     });
    
//     if (approved_count > 0) {
//         frappe.show_alert({
//             message: __('Approved {0} fields in {1} selected rows', [approved_count, selected_rows.length]),
//             indicator: 'gray'
//         });
        
//         // Apply visual styling
//         apply_all_field_approval_states(frm);
        
//         // Update buttons
//         setup_approval_and_publish_buttons(frm);
//     } else {
//         frappe.msgprint(__('No filled fields found to approve in selected rows'));
//     }
// }

// // Show dialog to select rows when no rows are selected
// function show_row_selection_dialog(frm) {
//     if (!frm.doc.stone_details || frm.doc.stone_details.length === 0) {
//         frappe.msgprint(__('No rows available'));
//         return;
//     }
    
//     let row_options = frm.doc.stone_details.map((row, index) => {
//         let stone_info = row.stone_name || `Row ${index + 1}`;
//         let filled_count = count_filled_fields(row);
//         return {
//             label: `${stone_info} (${filled_count} fields filled)`,
//             value: index
//         };
//     });
    
//     frappe.prompt([
//         {
//             label: 'Select Rows to Approve',
//             fieldname: 'selected_rows',
//             fieldtype: 'MultiSelectPills',
//             options: row_options,
//             reqd: 1
//         }
//     ], function(values) {
//         let selected_indices = values.selected_rows;
//         if (!selected_indices || selected_indices.length === 0) {
//             frappe.msgprint(__('No rows selected'));
//             return;
//         }
        
//         let selected_rows = selected_indices.map(index => frm.doc.stone_details[index]);
//         let approved_count = 0;
//         let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
        
//         selected_rows.forEach(row => {
//             approved_count += approve_filled_fields_in_row(frm, row, required_fields);
//         });
        
//         if (approved_count > 0) {
//             frappe.show_alert({
//                 message: __('Approved {0} fields in {1} selected rows', [approved_count, selected_rows.length]),
//                 indicator: 'gray'
//             });
            
//             // Apply visual styling
//             apply_all_field_approval_states(frm);
            
//             // Update buttons
//             setup_approval_and_publish_buttons(frm);
//         } else {
//             frappe.msgprint(__('No filled fields found to approve in selected rows'));
//         }
//     }, __('Approve Fields'), __('Approve Selected'));
// }

// // Simpler approach - approve all filled fields in all rows
// function approve_all_filled_fields(frm) {
//     if (!frm.doc.stone_details || frm.doc.stone_details.length === 0) {
//         frappe.msgprint(__('No rows to approve'));
//         return;
//     }
    
//     let approved_count = 0;
//     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
    
//     frm.doc.stone_details.forEach(row => {
//         approved_count += approve_filled_fields_in_row(frm, row, required_fields);
//     });
    
//     if (approved_count > 0) {
//         frappe.show_alert({
//             message: __('Approved {0} filled fields across all rows', [approved_count]),
//             indicator: 'gray'
//         });
        
//         // Apply visual styling
//         apply_all_field_approval_states(frm);
        
//         // Update buttons
//         setup_approval_and_publish_buttons(frm);
//     } else {
//         frappe.msgprint(__('No filled fields found to approve'));
//     }
// }

// // Count filled fields in a row
// function count_filled_fields(row) {
//     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
//     let count = 0;
    
//     required_fields.forEach(field => {
//         let value = row[field];
//         if (value !== undefined && value !== null && value !== '' && value !== 0) {
//             count++;
//         }
//     });
    
//     return count;
// }

// // Approve filled fields in a single row (with persistent storage)
// function approve_filled_fields_in_row(frm, row, required_fields) {
//     if (!row._approved_fields) {
//         row._approved_fields = {};
//     }
    
//     let approved_count = 0;
    
//     required_fields.forEach(field => {
//         let value = row[field];
//         if (value !== undefined && value !== null && value !== '' && value !== 0) {
//             if (!row._approved_fields[field]) {
//                 row._approved_fields[field] = true;
//                 // Save to persistent storage (localStorage)
//                 save_approval_state(frm, row.name, field, true);
//                 approved_count++;
//             }
//         }
//     });
    
//     return approved_count;
// }

// // Apply visual styling to all approved fields
// function apply_all_field_approval_states(frm) {
//     if (!frm.doc.stone_details) return;
    
//     frm.doc.stone_details.forEach((row, row_index) => {
//         // Check both _approved_fields and localStorage for approval states
//         let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
        
//         required_fields.forEach(field => {
//             // Check if field is approved using the persistent storage function
//             if (is_field_approved(frm, row, field)) {
//                 lock_individual_field(frm, row_index, field);
//             }
//         });
        
//         // Also apply styling from _approved_fields (legacy support)
//         if (row._approved_fields) {
//             Object.keys(row._approved_fields).forEach(field => {
//                 if (row._approved_fields[field]) {
//                     lock_individual_field(frm, row_index, field);
//                 }
//             });
//         }
        
//         // Check if this row is fully approved and force gray styling
//         if (is_row_fully_approved(frm, row)) {
//             force_row_gray_styling(row_index);
//         }
//     });
// }

// // Lock individual field with visual styling
// function lock_individual_field(frm, row_index, field) {
//     setTimeout(() => {
//         // Try multiple selector strategies for robust field selection
//         let selectors = [
//             `.grid-row[data-idx="${row_index}"] [data-fieldname="${field}"]`,
//             `.grid-row:nth-child(${row_index + 1}) [data-fieldname="${field}"]`,
//             `[data-fieldname="${field}"]`
//         ];
        
//         let $field = null;
//         let $row = $(`.grid-row[data-idx="${row_index}"]`);
        
//         // Try each selector until we find the field
//         for (let selector of selectors) {
//             if (selector === `[data-fieldname="${field}"]`) {
//                 // For the generic selector, filter by row
//                 $field = $(selector).filter(function() {
//                     let $parent_row = $(this).closest('.grid-row');
//                     let idx = $parent_row.attr('data-idx');
//                     return idx == row_index || $parent_row.index() == row_index;
//                 });
//             } else {
//                 $field = $(selector);
//             }
            
//             if ($field.length > 0) break;
//         }

//         if ($field && $field.length > 0) {
//             $field.addClass('field-approved');
            
//             // Make inputs truly uneditable
//             $field.find('input, select, textarea').each(function() {
//                 $(this).prop('readonly', true)
//                        .prop('disabled', true)
//                        .addClass('field-approved-input')
//                        .attr('title', 'This field is approved and locked');
//             });
            
//             // Prevent any click/focus events
//             $field.find('input, select, textarea').off('click focus keydown keypress keyup change input')
//                    .on('click focus keydown keypress keyup change input', function(e) {
//                 e.preventDefault();
//                 e.stopPropagation();
//                 frappe.show_alert({message: __('This field is approved and locked'), indicator: 'red'});
//                 return false;
//             });
//         } else {

//         }
        
//         // Check if this row should be fully grayed out
//         let row_doc = frm.doc.stone_details[row_index];
//         if (row_doc && is_row_fully_approved(frm, row_doc)) {
//             // Make the entire row gray
//             if ($row.length) {
//                 $row.addClass('row-fully-approved');
                
//                 // Style all elements in the row
//                 $row.find('*').each(function() {
//                     $(this).css({
//                         'background-color': '#f5f5f5 !important',
//                         'color': '#666666 !important',
//                         'border-color': '#bdbdbd !important'
//                     });
//                 });
                
//                 // Specifically target all input elements
//                 $row.find('input, select, textarea, .form-control').each(function() {
//                     $(this).css({
//                         'background-color': '#f5f5f5 !important',
//                         'color': '#666666 !important',
//                         'border-color': '#bdbdbd !important'
//                     }).prop('readonly', true).prop('disabled', true);
//                 });
                
//                 // Add visual indicator to row
//                 if (!$row.find('.row-approved-indicator').length) {
//                     $row.find('.grid-row-index').append('<span class="row-approved-indicator">✓</span>');
//                 }
//             }
//         }
//     }, 300);
// }

// // Publish data (final step)
// function publish_data(frm) {
//     frappe.confirm(
//         __('Are you sure you want to publish this data? This will finalize all approvals.'),
//         () => {
//             // Add your publish logic here
//             frappe.msgprint(__('Data published successfully!'));
            
//             // You can add additional logic here such as:
//             // - Setting a "published" flag
//             // - Sending notifications
//             // - Creating related documents
//             // - etc.
//         }
//     );
// }

// // Check if a row has all its required fields approved
// function is_row_fully_approved(frm, row) {
//     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
    
//     for (let field of required_fields) {
//         // Check if field has value and is approved
//         let value = row[field];
//         if (value !== undefined && value !== null && value !== '' && value !== 0) {
//             if (!is_field_approved(frm, row, field)) {
//                 return false; // Found a filled field that's not approved
//             }
//         }
//     }
    
//     // Check if row has at least some approved fields
//     let has_approved_fields = false;
//     for (let field of required_fields) {
//         if (is_field_approved(frm, row, field)) {
//             has_approved_fields = true;
//             break;
//         }
//     }
    
//     return has_approved_fields;
// }

// // Force entire row to be gray when approved
// function force_row_gray_styling(row_index) {
//     setTimeout(() => {
//         let $row = $(`.grid-row[data-idx="${row_index}"]`);
//         if ($row.length) {
//             // Apply gray styling to the entire row
//             $row.css({
//                 'background': 'linear-gradient(90deg, #f5f5f5 0%, #e9e9e9 100%)',
//                 'border': '1px solid #bdbdbd',
//                 'border-radius': '4px'
//             });
            
//             // Style all cells in the row
//             $row.find('td, .grid-static-col').each(function() {
//                 $(this).css({
//                     'background-color': '#f5f5f5 !important',
//                     'border-color': '#bdbdbd !important'
//                 });
//             });
            
//             // Style all inputs, selects, textareas
//             $row.find('input, select, textarea, .form-control, .input-with-feedback').each(function() {
//                 $(this).css({
//                     'background-color': '#f5f5f5 !important',
//                     'color': '#666666 !important',
//                     'border-color': '#bdbdbd !important'
//                 }).prop('readonly', true).prop('disabled', true);
//             });
            
//             // Style checkboxes and other elements
//             $row.find('.grid-row-check, .grid-row-index').each(function() {
//                 $(this).css({
//                     'background-color': '#f5f5f5 !important',
//                     'color': '#666666 !important'
//                 });
//             });
//         }
//     }, 500);
// }

// // ============================
// // CSS STYLING
// // ============================

// // Add CSS styling for approved fields
// if (!document.querySelector('#approval-field-styles')) {
//     const style = document.createElement('style');
//     style.id = 'approval-field-styles';
//     style.textContent = `
//         .field-approved {
//             background-color: #e8f5e8 !important;
//             border: 1px solid #4caf50 !important;
//             position: relative;
//             opacity: 1;
//         }
//         .field-approved::after {
//             content: '✓';
//             position: absolute;
//             top: 2px;
//             right: 5px;
//             font-size: 12px;
//             color: #2e7d32;
//             font-weight: bold;
//             pointer-events: none;
//             z-index: 1000;
//         }
//         .field-approved-input {
//             background-color: #f1f8e9 !important;
//             color: #2e7d32 !important;
//             cursor: not-allowed !important;
//             pointer-events: none !important;
//             border: 1px solid #81c784 !important;
//         }
//         .field-approved-input:focus,
//         .field-approved-input:hover {
//             background-color: #f1f8e9 !important;
//             border-color: #81c784 !important;
//             box-shadow: 0 0 0 0.2rem rgba(76, 175, 80, 0.25) !important;
//         }
//         .row-fully-approved {
//             background: linear-gradient(90deg, #f5f5f5 0%, #e9e9e9 100%) !important;
//             border: 1px solid #bdbdbd !important;
//             border-radius: 4px;
//             opacity: 1;
//         }
//         .row-fully-approved .grid-static-col,
//         .row-fully-approved .grid-static-col input,
//         .row-fully-approved .grid-static-col select,
//         .row-fully-approved .grid-static-col textarea,
//         .row-fully-approved .grid-row-check,
//         .row-fully-approved .grid-row-index,
//         .row-fully-approved [data-fieldname] {
//             background-color: #f5f5f5 !important;
//             color: #666666 !important;
//             border-color: #bdbdbd !important;
//         }
//         .row-fully-approved td,
//         .row-fully-approved .form-control,
//         .row-fully-approved .input-with-feedback {
//             background-color: #f5f5f5 !important;
//             color: #666666 !important;
//             border-color: #bdbdbd !important;
//         }
//         .row-approved-indicator {
//             color: #2e7d32;
//             font-weight: bold;
//             margin-left: 5px;
//             background: #4caf50;
//             color: white;
//             border-radius: 50%;
//             padding: 2px 6px;
//             font-size: 10px;
//         }
//         .approval-progress {
//             font-weight: bold;
//             color: #1976d2;
//             margin: 5px 0;
//         }
        
//         /* Hover effects for approved elements */
//         .row-fully-approved:hover {
//             box-shadow: 0 4px 8px rgba(76, 175, 80, 0.15);
//             transform: translateY(-1px);
//             transition: all 0.2s ease-in-out;
//         }
        
//         /* Better styling for locked state */
//         .row-fully-approved .grid-row-check {
//             background-color: #e8f5e8 !important;
//         }
//     `;
//     document.head.appendChild(style);
// }

// ============================
// Additional Size List Details Handlers
// ============================





// ============================
// Size List - Field-Level Approval System with Verification Status
// ============================

// Add CSS for verification status styling
if (!document.querySelector('#verification-status-styles')) {
    const style = document.createElement('style');
    style.id = 'verification-status-styles';
    style.textContent = `
        /* Enhanced Verified Row Styling - More Prominent Green */
        .verification-verified {
            background-color: #d4edda !important;
            border-left: 5px solid #28a745 !important;
            border-right: 2px solid #28a745 !important;
        }
        .verification-incorrect {
            background-color: #fff3cd !important;
            border-left: 5px solid #ffc107 !important;
            border-right: 2px solid #ffc107 !important;
        }
        .verification-pending {
            background-color: #f8f9fa !important;
            border-left: 5px solid #6c757d !important;
        }
        
        /* Enhanced styling for verified row content */
        .grid-row.verification-verified {
            background: linear-gradient(90deg, #d4edda 0%, #e8f5e8 100%) !important;
            box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2) !important;
        }
        
        /* Verified row cells and inputs */
        .grid-row .verification-verified .grid-static-col,
        .grid-row .verification-verified input,
        .grid-row .verification-verified select,
        .grid-row .verification-verified textarea,
        .verification-verified .grid-static-col,
        .verification-verified input,
        .verification-verified select,
        .verification-verified textarea {
            background-color: #d4edda !important;
            color: #155724 !important;
            cursor: not-allowed !important;
            font-weight: 500 !important;
            border: 1px solid #c3e6cb !important;
        }
        
        /* Disabled verified fields */
        .grid-row .verification-verified input:disabled,
        .grid-row .verification-verified select:disabled,
        .grid-row .verification-verified textarea:disabled,
        .verification-verified input:disabled,
        .verification-verified select:disabled,
        .verification-verified textarea:disabled {
            background-color: #d4edda !important;
            color: #155724 !important;
            border: 1px solid #28a745 !important;
            opacity: 1 !important;
        }
        
        /* Incorrect row styling */
        .grid-row .verification-incorrect .grid-static-col,
        .grid-row .verification-incorrect input,
        .grid-row .verification-incorrect select,
        .grid-row .verification-incorrect textarea,
        .verification-incorrect .grid-static-col,
        .verification-incorrect input,
        .verification-incorrect select,
        .verification-incorrect textarea {
            background-color: #fff3cd !important;
            border: 1px solid #ffc107 !important;
            color: #856404 !important;
        }
        
        /* Focus states for incorrect fields */
        .grid-row .verification-incorrect input:focus,
        .grid-row .verification-incorrect select:focus,
        .grid-row .verification-incorrect textarea:focus,
        .verification-incorrect input:focus,
        .verification-incorrect select:focus,
        .verification-incorrect textarea:focus {
            background-color: #fff8e1 !important;
            border: 2px solid #ff9800 !important;
            box-shadow: 0 0 5px rgba(255, 152, 0, 0.3) !important;
        }
        .grid-row .verification-pending .grid-static-col {
            background-color: #f8f9fa !important;
        }
        .verification-status-badge {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
            margin-left: 5px;
        }
        .verification-status-verified {
            background-color: #28a745;
            color: white;
        }
        .verification-status-incorrect {
            background-color: #ffc107;
            color: #212529;
        }
        .verification-status-pending {
            background-color: #6c757d;
            color: white;
        }
        
        /* Animation for incorrect stones */
        @keyframes pulse-orange {
            0% { background-color: #fff3cd !important; }
            50% { background-color: #ffe69c !important; }
            100% { background-color: #fff3cd !important; }
        }
        
        /* Subtle animation for verified stones - gentle highlight */
        @keyframes verified-glow {
            0% { box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2) !important; }
            50% { box-shadow: 0 4px 8px rgba(40, 167, 69, 0.4) !important; }
            100% { box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2) !important; }
        }
        
        .verification-verified {
            animation: verified-glow 3s ease-in-out infinite !important;
        }
        
        /* Enhanced verified row styling */
        .verification-verified::before {
            content: "✅";
            position: absolute;
            left: -15px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 14px;
            z-index: 10;
        }
        
        /* Stronger styling for verified stones */
        .verified-field-locked {
            pointer-events: none !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
        }
    `;
    document.head.appendChild(style);
}

// Child Table Handler - Size List Details
frappe.ui.form.on('Size List Details', {
    // Stone Name handler with verification status check
    stone_name: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        
        // Check verification status first
        if (is_stone_verified(row)) {
            // Show prominent alert
            frappe.show_alert({
                message: __('🚫 This stone is VERIFIED and cannot be modified!'),
                indicator: 'red'
            });
            
            // Also show msgprint for more visibility
            frappe.msgprint({
                title: __('🔒 Stone is Verified'),
                message: __('This stone has been verified and is locked for editing. If you need to make changes, please mark it as incorrect in the Size List Verification form first.'),
                indicator: 'red'
            });
            
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'stone_name');
                frappe.model.set_value(cdt, cdn, 'stone_name', previous_value || '');
            }, 100);
            return false;
        }
        
        if (is_field_approved(frm, row, 'stone_name')) {
            frappe.show_alert({message: __('Stone Name is approved and locked'), indicator: 'red'});
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'stone_name');
                frappe.model.set_value(cdt, cdn, 'stone_name', previous_value);
                
                // Also force gray styling for the entire row
                let row_index = row.idx - 1;
                force_row_gray_styling(row_index);
            }, 100);
            return false;
        }
        // Save current value for future reference
        save_previous_field_value(frm, row, 'stone_name', row.stone_name);
        
        // Original stone_name logic
        if (row && row.stone_name) {
            frappe.db.get_value('Stone Name', row.stone_name, 'stone_code', (r) => {
                if (r && r.stone_code) {
                    frappe.model.set_value(cdt, cdn, 'stone_code', r.stone_code);
                }
            });
        }
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },

    stone_code: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        
        // Check verification status first
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'stone_code');
                frappe.model.set_value(cdt, cdn, 'stone_code', previous_value);
            }, 100);
            return false;
        }
        
        if (is_field_approved(frm, row, 'stone_code')) {
            frappe.show_alert({message: __('Stone Code is approved and locked'), indicator: 'red'});
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'stone_code');
                frappe.model.set_value(cdt, cdn, 'stone_code', previous_value);
            }, 100);
            return false;
        }
        // Save current value for future reference
        save_previous_field_value(frm, row, 'stone_code', row.stone_code);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },

    // Dimension fields with verification and approval checks
    l1: function(frm, cdt, cdn) { 
        let row = locals[cdt][cdn];
        
        // Check verification status first
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'l1');
                frappe.model.set_value(cdt, cdn, 'l1', previous_value);
            }, 100);
            return false;
        }
        
        if (is_field_approved(frm, row, 'l1')) {
            frappe.show_alert({message: __('L1 field is approved and locked'), indicator: 'red'});
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'l1');
                frappe.model.set_value(cdt, cdn, 'l1', previous_value);
            }, 100);
            return false;
        }
        // Save current value for future reference
        save_previous_field_value(frm, row, 'l1', row.l1);
        calculate_volume(frm, cdt, cdn); 
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },
    
    l2: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        
        // Check verification status first
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'l2');
                frappe.model.set_value(cdt, cdn, 'l2', previous_value);
            }, 100);
            return false;
        }
        
        if (is_field_approved(frm, row, 'l2')) {
            frappe.show_alert({message: __('L2 field is approved and locked'), indicator: 'red'});
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'l2');
                frappe.model.set_value(cdt, cdn, 'l2', previous_value);
            }, 100);
            return false;
        }
        // Save current value for future reference
        save_previous_field_value(frm, row, 'l2', row.l2);
        if (row && row.l2 >= 12) {
            frappe.msgprint(__('L2 must be less than 12 inches'));
            frappe.model.set_value(cdt, cdn, 'l2', 0);
        }
        calculate_volume(frm, cdt, cdn);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },
    
    b1: function(frm, cdt, cdn) { 
        let row = locals[cdt][cdn];
        
        // Check verification status first
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'b1');
                frappe.model.set_value(cdt, cdn, 'b1', previous_value);
            }, 100);
            return false;
        }
        
        if (is_field_approved(frm, row, 'b1')) {
            frappe.show_alert({message: __('B1 field is approved and locked'), indicator: 'red'});
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'b1');
                frappe.model.set_value(cdt, cdn, 'b1', previous_value);
            }, 100);
            return false;
        }
        // Save current value for future reference
        save_previous_field_value(frm, row, 'b1', row.b1);
        calculate_volume(frm, cdt, cdn); 
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },
    
    b2: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        
        // Check verification status first
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'b2');
                frappe.model.set_value(cdt, cdn, 'b2', previous_value);
            }, 100);
            return false;
        }
        
        if (is_field_approved(frm, row, 'b2')) {
            frappe.show_alert({message: __('B2 field is approved and locked'), indicator: 'red'});
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'b2');
                frappe.model.set_value(cdt, cdn, 'b2', previous_value);
            }, 100);
            return false;
        }
        // Save current value for future reference
        save_previous_field_value(frm, row, 'b2', row.b2);
        if (row && row.b2 >= 12) {
            frappe.msgprint(__('B2 must be less than 12 inches'));
            frappe.model.set_value(cdt, cdn, 'b2', 0);
        }
        calculate_volume(frm, cdt, cdn);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },
    
    h1: function(frm, cdt, cdn) { 
        let row = locals[cdt][cdn];
        
        // Check verification status first
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'h1');
                frappe.model.set_value(cdt, cdn, 'h1', previous_value);
            }, 100);
            return false;
        }
        
        if (is_field_approved(frm, row, 'h1')) {
            frappe.show_alert({message: __('H1 field is approved and locked'), indicator: 'red'});
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'h1');
                frappe.model.set_value(cdt, cdn, 'h1', previous_value);
            }, 100);
            return false;
        }
        // Save current value for future reference
        save_previous_field_value(frm, row, 'h1', row.h1);
        calculate_volume(frm, cdt, cdn); 
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },
    
    h2: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        
        // Check verification status first
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'h2');
                frappe.model.set_value(cdt, cdn, 'h2', previous_value);
            }, 100);
            return false;
        }
        
        if (is_field_approved(frm, row, 'h2')) {
            frappe.show_alert({message: __('H2 field is approved and locked'), indicator: 'red'});
            // Reset the field to previous value
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'h2');
                frappe.model.set_value(cdt, cdn, 'h2', previous_value);
            }, 100);
            return false;
        }
        // Save current value for future reference
        save_previous_field_value(frm, row, 'h2', row.h2);
        if (row && row.h2 >= 12) {
            frappe.msgprint(__('H2 must be less than 12 inches'));
            frappe.model.set_value(cdt, cdn, 'h2', 0);
        }
        calculate_volume(frm, cdt, cdn);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },

    stone_details_remove: function(frm) {
        update_total_volume(frm);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    }
});




// ============================
// LOCK VERIFIED ROWS
// ============================
function lock_verified_fields(frm) {
    if (!frm.doc.stone_details || !frm.fields_dict.stone_details) return;

    setTimeout(() => {
        let grid_rows = frm.fields_dict.stone_details.grid.grid_rows || [];

        frm.doc.stone_details.forEach(row => {
            // ✅ Use the actual verification_status field
            if (row.verification_status !== "Verified") return;

            // Find the grid row
            let grid_row = grid_rows.find(r => r.doc && r.doc.name === row.name);
            if (!grid_row) return;

            // Fields you want to lock
            let required_fields = [
                "stone_name", "stone_code", "l1", "b1", "h1",
                "l2", "b2", "h2", "volume"
            ];

            required_fields.forEach(field => {
                let $field = grid_row.row.find(`[data-fieldname="${field}"]`);
                if ($field.length && $field.closest("tbody").length) {
                    $field.addClass("field-approved");
                    $field.find("input, select, textarea")
                        .prop("readonly", true)
                        .prop("disabled", true)
                        .addClass("field-approved-input")
                        .attr("title", "This field is approved and locked")
                        .off("click focus keydown keypress keyup change input")
                        .on("click focus keydown keypress keyup change input", function(e){
                            e.preventDefault();
                            e.stopPropagation();
                            frappe.show_alert({
                                message: "This field is approved and locked",
                                indicator: "red"
                            });
                        });
                }
            });

            // ✅ Add row-level styling only for verified rows
            let $row = grid_row.row;
            $row.addClass("row-fully-approved");
            if (!$row.find(".row-approved-indicator").length) {
                $row.find(".grid-row-index").append(
                    '<span class="row-approved-indicator">✓</span>'
                );
            }
        });
    }, 300); // wait for grid to fully render
}








// Parent Form Handler - Size List
frappe.ui.form.on('Size List', {
    refresh: function(frm) {
        setup_approval_and_publish_buttons(frm);
        
        // Restore approval states from saved data
        restore_approval_states(frm);
        
        // Initialize previous field values for all rows
        initialize_previous_field_values(frm);
        
        // Apply field-level approval styling when form loads
        setTimeout(() => {
            apply_all_field_approval_states(frm);
        }, 800);
        
        // Load project flags if baps_project is selected
        if (frm.doc.baps_project) {
            load_project_flags(frm);
        }
    },

    baps_project: function(frm) {
        if (frm.doc.baps_project) {
            load_project_flags(frm);
        } else {
            frm._project_flags = { chemical: 0, dry_fitting: 0, polishing: 0 };
            set_child_grid_readonly(frm);
        }
    },
    
    main_part: function(frm) {
        if (!frm.doc.main_part) frm.set_value('sub_part', '');
        
        frm.set_query("sub_part", function() {
            if (!frm.doc.main_part) {
                frappe.throw("Please select Main Part before choosing a Sub Part.");
            }
            return {
                filters: {
                    main_part: frm.doc.main_part
                }
            };
        });

        // clear sub_part if mismatch
        if (frm.doc.sub_part) {
            frappe.db.get_value("Sub Part", frm.doc.sub_part, "main_part", function(r) {
                if (r && r.main_part !== frm.doc.main_part) {
                    frm.set_value("sub_part", null);
                }
            });
        }
    },
    
    sub_part: function(frm) {
        if (!frm.doc.sub_part) frm.set_value('main_part', '');
    },
    
    stone_details_add: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (frm._project_flags?.chemical) frappe.model.set_value(cdt, cdn, 'chemical', 1);
        if (frm._project_flags?.dry_fitting) frappe.model.set_value(cdt, cdn, 'dry_fitting', 1);
        if (frm._project_flags?.polishing) frappe.model.set_value(cdt, cdn, 'polishing', 1);
    },
    
    validate: function(frm) {
        if (!frm.doc.main_part && frm.doc.sub_part) {
            frappe.throw("You cannot add a Sub Part without selecting a Main Part.");
        }
    }
});

// ============================
// PERSISTENT STORAGE FUNCTIONS (Browser localStorage)
// ============================

// Get unique key for this document's approval data
function get_approval_storage_key(frm) {
    return `size_list_approvals_${frm.doc.name || 'new'}`;
}

// Check if a field is approved (with persistent storage)
function is_field_approved(frm, row, field_name) {
    try {
        let storage_key = get_approval_storage_key(frm);
        let approval_data = localStorage.getItem(storage_key);
        if (!approval_data) return false;
        
        approval_data = JSON.parse(approval_data);
        return !!(approval_data[row.name] && approval_data[row.name][field_name]);
    } catch (e) {
        console.error('Error checking field approval state:', e);
        return false;
    }
}

// Save approval state to localStorage
function save_approval_state(frm, row_name, field_name, is_approved) {
    try {
        let storage_key = get_approval_storage_key(frm);
        let approval_data = {};
        
        // Load existing approval data
        let existing_data = localStorage.getItem(storage_key);
        if (existing_data) {
            approval_data = JSON.parse(existing_data);
        }
        
        // Initialize row data if not exists
        if (!approval_data[row_name]) {
            approval_data[row_name] = {};
        }
        
        // Set approval state
        approval_data[row_name][field_name] = is_approved;
        
        // Save back to localStorage
        localStorage.setItem(storage_key, JSON.stringify(approval_data));
    } catch (e) {
        console.error('Error saving approval state:', e);
    }
}

// Restore approval states from localStorage
function restore_approval_states(frm) {
    if (!frm.doc.stone_details) return;
    
    try {
        let storage_key = get_approval_storage_key(frm);
        let approval_data = localStorage.getItem(storage_key);
        if (!approval_data) return;
        
        approval_data = JSON.parse(approval_data);
        
        frm.doc.stone_details.forEach(row => {
            if (approval_data[row.name]) {
                // Restore client-side approval data for immediate use
                row._approved_fields = approval_data[row.name];
            }
        });
    } catch (e) {
        console.error('Error restoring approval states:', e);
    }
}

// Helper functions for field value management
function save_previous_field_value(frm, row, field_name, value) {
    try {
        let storage_key = `${get_approval_storage_key(frm)}_previous_values`;
        let previous_data = {};
        
        // Load existing previous value data
        let existing_data = localStorage.getItem(storage_key);
        if (existing_data) {
            previous_data = JSON.parse(existing_data);
        }
        
        // Initialize row data if not exists
        if (!previous_data[row.name]) {
            previous_data[row.name] = {};
        }
        
        // Set previous value
        previous_data[row.name][field_name] = value;
        
        // Save back to localStorage
        localStorage.setItem(storage_key, JSON.stringify(previous_data));
    } catch (e) {
        console.error('Error saving previous field value:', e);
    }
}

function get_previous_field_value(frm, row, field_name) {
    try {
        let storage_key = `${get_approval_storage_key(frm)}_previous_values`;
        let previous_data = localStorage.getItem(storage_key);
        if (!previous_data) return null;
        
        previous_data = JSON.parse(previous_data);
        return previous_data[row.name] && previous_data[row.name][field_name] || null;
    } catch (e) {
        console.error('Error getting previous field value:', e);
        return null;
    }
}

// Initialize previous field values for all rows
function initialize_previous_field_values(frm) {
    if (!frm.doc.stone_details) return;
    
    let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
    
    frm.doc.stone_details.forEach(row => {
        required_fields.forEach(field => {
            if (row[field] !== undefined && row[field] !== null) {
                save_previous_field_value(frm, row, field, row[field]);
            }
        });
    });
}


// ============================
// CORE FUNCTIONS
// ============================

// Volume calculation for a single row
function calculate_volume(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
    if (!row) return;
    
    let L = ((row.l1 || 0) * 12) + (row.l2 || 0);
    let B = ((row.b1 || 0) * 12) + (row.b2 || 0);
    let H = ((row.h1 || 0) * 12) + (row.h2 || 0);
    
    row.volume = ((L * B * H) / 1728).toFixed(2);
    frm.refresh_field('stone_details');
    update_total_volume(frm);
}

// Total volume across all rows
function update_total_volume(frm) {
    let total = 0;
    (frm.doc.stone_details || []).forEach(r => {
        total += flt(r.volume);
    });
    frm.set_value('total_volume', total.toFixed(2));
}

// Load project flags from Baps Project
function load_project_flags(frm) {
    if (!frm.doc.baps_project) {
        frm._project_flags = { chemical: 0, dry_fitting: 0, polishing: 0 };
        set_child_grid_readonly(frm);
        return;
    }
    
    frappe.db.get_doc('Baps Project', frm.doc.baps_project).then(project_doc => {
        if (project_doc) {
            
            // Store project flags for child table reference
            frm._project_flags = {
                chemical: project_doc.chemical ? 1 : 0,
                dry_fitting: project_doc.dry_fitting ? 1 : 0,
                polishing: project_doc.polishing ? 1 : 0
            };
            
            // Apply to all existing child rows
            apply_project_checkboxes(frm);
            
            // Set child grid readonly based on flags
            set_child_grid_readonly(frm);
        }
    }).catch(err => {
        frm._project_flags = { chemical: 0, dry_fitting: 0, polishing: 0 };
    });
}


frappe.ui.form.on('Size List', {
    refresh: function(frm) {
        setup_main_part_sub_part(frm); 
        setup_volume_calculation('stone_details');
    }
});

// ============================
// APPROVAL SYSTEM FUNCTIONS
// ============================

// // Setup approval and publish buttons
// function setup_approval_and_publish_buttons(frm) {
//     // Remove ALL existing custom buttons to prevent duplicates
//     Object.keys(frm.custom_buttons || {}).forEach(key => {
//         if (frm.custom_buttons[key] && frm.custom_buttons[key].remove) {
//             frm.custom_buttons[key].remove();
//         }
//     });
//     frm.custom_buttons = {};

//     // Primary button - Approve Selected Fields (with multiple fallback methods)
//     frm.add_custom_button(__('Approve Selected Fields'), () => approve_selected_fields(frm))
//         .addClass('btn-primary');
    
//     // Alternative button - Approve All Filled Fields (simpler approach)
//     frm.add_custom_button(__('Approve All Filled Fields'), () => approve_all_filled_fields(frm))
//         .addClass('btn-info');

//     // Check if all fields in all rows are filled and approved
//     let all_complete = check_all_fields_complete(frm);
    
//     if (all_complete) {
//         // Show Publish button only when everything is complete
//         frm.add_custom_button(__('Publish'), () => publish_data(frm))
//             .addClass('btn-success');
//     } else {
//         // Show single progress message - only one button
//         let progress = get_completion_progress(frm);
//         frm.add_custom_button(__(`Progress: ${progress.filled}/${progress.total} fields`), () => {
//             frappe.msgprint(__('Complete all fields to enable publishing.'));
//         }).addClass('btn-secondary');
//     }
// }

// // Check if all fields in all rows are completely filled
// function check_all_fields_complete(frm) {
//     if (!frm.doc.stone_details || frm.doc.stone_details.length === 0) return false;
    
//     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
    
//     for (let row of frm.doc.stone_details) {
//         for (let field of required_fields) {
//             let value = row[field];
//             if (value === undefined || value === null || value === '' || value === 0) {
//                 return false; // Found empty field
//             }
//         }
        
//         // Also check if all fields are approved
//         for (let field of required_fields) {
//             if (!is_field_approved(frm, row, field)) return false;
//         }
//     }
//     return true; // All fields filled and approved
// }

// // Get completion progress
// function get_completion_progress(frm) {
//     if (!frm.doc.stone_details) return {filled: 0, total: 0};
    
//     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
//     let total_fields = frm.doc.stone_details.length * required_fields.length;
//     let filled_fields = 0;
    
//     frm.doc.stone_details.forEach(row => {
//         required_fields.forEach(field => {
//             let value = row[field];
//             if (value !== undefined && value !== null && value !== '' && value !== 0) {
//                 filled_fields++;
//             }
//         });
//     });
    
//     return {filled: filled_fields, total: total_fields};
// }

// // Approve selected fields in selected rows
// function approve_selected_fields(frm) {
//     if (!frm.doc.stone_details || frm.doc.stone_details.length === 0) {
//         frappe.msgprint(__('No rows to approve'));
//         return;
//     }
    
//     // Method 1: Try to get selected rows from grid
//     let selected_rows = [];
    
//     // Check if grid exists and has selected rows
//     let grid = frm.get_field('stone_details').grid;
//     if (grid && grid.get_selected_children) {
//         selected_rows = grid.get_selected_children();
//     }
    
//     // Method 2: Fallback - use jQuery to find selected checkboxes
//     if (selected_rows.length === 0) {
//         $('.grid-row').each(function() {
//             let $row = $(this);
//             let checkbox = $row.find('.grid-row-check input[type="checkbox"]');
//             if (checkbox.length && checkbox.is(':checked')) {
//                 let row_index = parseInt($row.attr('data-idx'));
//                 if (!isNaN(row_index) && frm.doc.stone_details[row_index]) {
//                     let row_doc = frm.doc.stone_details[row_index];
//                     if (row_doc && !selected_rows.find(r => r.name === row_doc.name)) {
//                         selected_rows.push(row_doc);

//                     }
//                 }
//             }
//         });
//     }
    
//     // Method 3: If still no selection, try alternative grid approach
//     if (selected_rows.length === 0) {
//         try {
//             selected_rows = frm.fields_dict.stone_details.grid.get_selected();
//         } catch (e) {
//             console.error('Grid selection method failed:', e);
//         }
//     }
    
//     // Method 4: If no rows selected, show dialog to select specific rows
//     if (selected_rows.length === 0) {
//         show_row_selection_dialog(frm);
//         return;
//     }
    
//     let approved_count = 0;
//     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
    
//     selected_rows.forEach(row => {
//         approved_count += approve_filled_fields_in_row(frm, row, required_fields);
//     });
    
//     if (approved_count > 0) {
//         frappe.show_alert({
//             message: __('Approved {0} fields in {1} selected rows', [approved_count, selected_rows.length]),
//             indicator: 'gray'
//         });
        
//         // Apply visual styling
//         apply_all_field_approval_states(frm);
        
//         // Update buttons
//         setup_approval_and_publish_buttons(frm);
//     } else {
//         frappe.msgprint(__('No filled fields found to approve in selected rows'));
//     }
// }

// // Show dialog to select rows when no rows are selected
// function show_row_selection_dialog(frm) {
//     if (!frm.doc.stone_details || frm.doc.stone_details.length === 0) {
//         frappe.msgprint(__('No rows available'));
//         return;
//     }
    
//     let row_options = frm.doc.stone_details.map((row, index) => {
//         let stone_info = row.stone_name || `Row ${index + 1}`;
//         let filled_count = count_filled_fields(row);
//         return {
//             label: `${stone_info} (${filled_count} fields filled)`,
//             value: index
//         };
//     });
    
//     frappe.prompt([
//         {
//             label: 'Select Rows to Approve',
//             fieldname: 'selected_rows',
//             fieldtype: 'MultiSelectPills',
//             options: row_options,
//             reqd: 1
//         }
//     ], function(values) {
//         let selected_indices = values.selected_rows;
//         if (!selected_indices || selected_indices.length === 0) {
//             frappe.msgprint(__('No rows selected'));
//             return;
//         }
        
//         let selected_rows = selected_indices.map(index => frm.doc.stone_details[index]);
//         let approved_count = 0;
//         let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
        
//         selected_rows.forEach(row => {
//             approved_count += approve_filled_fields_in_row(frm, row, required_fields);
//         });
        
//         if (approved_count > 0) {
//             frappe.show_alert({
//                 message: __('Approved {0} fields in {1} selected rows', [approved_count, selected_rows.length]),
//                 indicator: 'gray'
//             });
            
//             // Apply visual styling
//             apply_all_field_approval_states(frm);
            
//             // Update buttons
//             setup_approval_and_publish_buttons(frm);
//         } else {
//             frappe.msgprint(__('No filled fields found to approve in selected rows'));
//         }
//     }, __('Approve Fields'), __('Approve Selected'));
// }

// // Simpler approach - approve all filled fields in all rows
// function approve_all_filled_fields(frm) {
//     if (!frm.doc.stone_details || frm.doc.stone_details.length === 0) {
//         frappe.msgprint(__('No rows to approve'));
//         return;
//     }
    
//     let approved_count = 0;
//     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
    
//     frm.doc.stone_details.forEach(row => {
//         approved_count += approve_filled_fields_in_row(frm, row, required_fields);
//     });
    
//     if (approved_count > 0) {
//         frappe.show_alert({
//             message: __('Approved {0} filled fields across all rows', [approved_count]),
//             indicator: 'gray'
//         });
        
//         // Apply visual styling
//         apply_all_field_approval_states(frm);
        
//         // Update buttons
//         setup_approval_and_publish_buttons(frm);
//     } else {
//         frappe.msgprint(__('No filled fields found to approve'));
//     }
// }

// // Count filled fields in a row
// function count_filled_fields(row) {
//     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
//     let count = 0;
    
//     required_fields.forEach(field => {
//         let value = row[field];
//         if (value !== undefined && value !== null && value !== '' && value !== 0) {
//             count++;
//         }
//     });
    
//     return count;
// }

// // Approve filled fields in a single row (with persistent storage)
// function approve_filled_fields_in_row(frm, row, required_fields) {
//     if (!row._approved_fields) {
//         row._approved_fields = {};
//     }
    
//     let approved_count = 0;
    
//     required_fields.forEach(field => {
//         let value = row[field];
//         if (value !== undefined && value !== null && value !== '' && value !== 0) {
//             if (!row._approved_fields[field]) {
//                 row._approved_fields[field] = true;
//                 // Save to persistent storage (localStorage)
//                 save_approval_state(frm, row.name, field, true);
//                 approved_count++;
//             }
//         }
//     });
    
//     return approved_count;
// }

// // Apply visual styling to all approved fields
// function apply_all_field_approval_states(frm) {
//     if (!frm.doc.stone_details) return;
    
//     frm.doc.stone_details.forEach((row, row_index) => {
//         // Check both _approved_fields and localStorage for approval states
//         let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
        
//         required_fields.forEach(field => {
//             // Check if field is approved using the persistent storage function
//             if (is_field_approved(frm, row, field)) {
//                 lock_individual_field(frm, row_index, field);
//             }
//         });
        
//         // Also apply styling from _approved_fields (legacy support)
//         if (row._approved_fields) {
//             Object.keys(row._approved_fields).forEach(field => {
//                 if (row._approved_fields[field]) {
//                     lock_individual_field(frm, row_index, field);
//                 }
//             });
//         }
        
//         // Check if this row is fully approved and force gray styling
//         if (is_row_fully_approved(frm, row)) {
//             force_row_gray_styling(row_index);
//         }
//     });
// }

// // Lock individual field with visual styling
// function lock_individual_field(frm, row_index, field) {
//     setTimeout(() => {
//         // Try multiple selector strategies for robust field selection
//         let selectors = [
//             `.grid-row[data-idx="${row_index}"] [data-fieldname="${field}"]`,
//             `.grid-row:nth-child(${row_index + 1}) [data-fieldname="${field}"]`,
//             `[data-fieldname="${field}"]`
//         ];
        
//         let $field = null;
//         let $row = $(`.grid-row[data-idx="${row_index}"]`);
        
//         // Try each selector until we find the field
//         for (let selector of selectors) {
//             if (selector === `[data-fieldname="${field}"]`) {
//                 // For the generic selector, filter by row
//                 $field = $(selector).filter(function() {
//                     let $parent_row = $(this).closest('.grid-row');
//                     let idx = $parent_row.attr('data-idx');
//                     return idx == row_index || $parent_row.index() == row_index;
//                 });
//             } else {
//                 $field = $(selector);
//             }
            
//             if ($field.length > 0) break;
//         }

//         if ($field && $field.length > 0) {
//             $field.addClass('field-approved');
            
//             // Make inputs truly uneditable
//             $field.find('input, select, textarea').each(function() {
//                 $(this).prop('readonly', true)
//                        .prop('disabled', true)
//                        .addClass('field-approved-input')
//                        .attr('title', 'This field is approved and locked');
//             });
            
//             // Prevent any click/focus events
//             $field.find('input, select, textarea').off('click focus keydown keypress keyup change input')
//                    .on('click focus keydown keypress keyup change input', function(e) {
//                 e.preventDefault();
//                 e.stopPropagation();
//                 frappe.show_alert({message: __('This field is approved and locked'), indicator: 'red'});
//                 return false;
//             });
//         } else {

//         }
        
//         // Check if this row should be fully grayed out
//         let row_doc = frm.doc.stone_details[row_index];
//         if (row_doc && is_row_fully_approved(frm, row_doc)) {
//             // Make the entire row gray
//             if ($row.length) {
//                 $row.addClass('row-fully-approved');
                
//                 // Style all elements in the row
//                 $row.find('*').each(function() {
//                     $(this).css({
//                         'background-color': '#f5f5f5 !important',
//                         'color': '#666666 !important',
//                         'border-color': '#bdbdbd !important'
//                     });
//                 });
                
//                 // Specifically target all input elements
//                 $row.find('input, select, textarea, .form-control').each(function() {
//                     $(this).css({
//                         'background-color': '#f5f5f5 !important',
//                         'color': '#666666 !important',
//                         'border-color': '#bdbdbd !important'
//                     }).prop('readonly', true).prop('disabled', true);
//                 });
                
//                 // Add visual indicator to row
//                 if (!$row.find('.row-approved-indicator').length) {
//                     $row.find('.grid-row-index').append('<span class="row-approved-indicator">✓</span>');
//                 }
//             }
//         }
//     }, 300);
// }

// // Publish data (final step)
// function publish_data(frm) {
//     frappe.confirm(
//         __('Are you sure you want to publish this data? This will finalize all approvals.'),
//         () => {
//             // Add your publish logic here
//             frappe.msgprint(__('Data published successfully!'));
            
//             // You can add additional logic here such as:
//             // - Setting a "published" flag
//             // - Sending notifications
//             // - Creating related documents
//             // - etc.
//         }
//     );
// }

// // Check if a row has all its required fields approved
// function is_row_fully_approved(frm, row) {
//     let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
    
//     for (let field of required_fields) {
//         // Check if field has value and is approved
//         let value = row[field];
//         if (value !== undefined && value !== null && value !== '' && value !== 0) {
//             if (!is_field_approved(frm, row, field)) {
//                 return false; // Found a filled field that's not approved
//             }
//         }
//     }
    
//     // Check if row has at least some approved fields
//     let has_approved_fields = false;
//     for (let field of required_fields) {
//         if (is_field_approved(frm, row, field)) {
//             has_approved_fields = true;
//             break;
//         }
//     }
    
//     return has_approved_fields;
// }

// // Force entire row to be gray when approved
// function force_row_gray_styling(row_index) {
//     setTimeout(() => {
//         let $row = $(`.grid-row[data-idx="${row_index}"]`);
//         if ($row.length) {
//             // Apply gray styling to the entire row
//             $row.css({
//                 'background': 'linear-gradient(90deg, #f5f5f5 0%, #e9e9e9 100%)',
//                 'border': '1px solid #bdbdbd',
//                 'border-radius': '4px'
//             });
            
//             // Style all cells in the row
//             $row.find('td, .grid-static-col').each(function() {
//                 $(this).css({
//                     'background-color': '#f5f5f5 !important',
//                     'border-color': '#bdbdbd !important'
//                 });
//             });
            
//             // Style all inputs, selects, textareas
//             $row.find('input, select, textarea, .form-control, .input-with-feedback').each(function() {
//                 $(this).css({
//                     'background-color': '#f5f5f5 !important',
//                     'color': '#666666 !important',
//                     'border-color': '#bdbdbd !important'
//                 }).prop('readonly', true).prop('disabled', true);
//             });
            
//             // Style checkboxes and other elements
//             $row.find('.grid-row-check, .grid-row-index').each(function() {
//                 $(this).css({
//                     'background-color': '#f5f5f5 !important',
//                     'color': '#666666 !important'
//                 });
//             });
//         }
//     }, 500);
// }

// // ============================
// // CSS STYLING
// // ============================

// // Add CSS styling for approved fields
// if (!document.querySelector('#approval-field-styles')) {
//     const style = document.createElement('style');
//     style.id = 'approval-field-styles';
//     style.textContent = `
//         .field-approved {
//             background-color: #e8f5e8 !important;
//             border: 1px solid #4caf50 !important;
//             position: relative;
//             opacity: 1;
//         }
//         .field-approved::after {
//             content: '✓';
//             position: absolute;
//             top: 2px;
//             right: 5px;
//             font-size: 12px;
//             color: #2e7d32;
//             font-weight: bold;
//             pointer-events: none;
//             z-index: 1000;
//         }
//         .field-approved-input {
//             background-color: #f1f8e9 !important;
//             color: #2e7d32 !important;
//             cursor: not-allowed !important;
//             pointer-events: none !important;
//             border: 1px solid #81c784 !important;
//         }
//         .field-approved-input:focus,
//         .field-approved-input:hover {
//             background-color: #f1f8e9 !important;
//             border-color: #81c784 !important;
//             box-shadow: 0 0 0 0.2rem rgba(76, 175, 80, 0.25) !important;
//         }
//         .row-fully-approved {
//             background: linear-gradient(90deg, #f5f5f5 0%, #e9e9e9 100%) !important;
//             border: 1px solid #bdbdbd !important;
//             border-radius: 4px;
//             opacity: 1;
//         }
//         .row-fully-approved .grid-static-col,
//         .row-fully-approved .grid-static-col input,
//         .row-fully-approved .grid-static-col select,
//         .row-fully-approved .grid-static-col textarea,
//         .row-fully-approved .grid-row-check,
//         .row-fully-approved .grid-row-index,
//         .row-fully-approved [data-fieldname] {
//             background-color: #f5f5f5 !important;
//             color: #666666 !important;
//             border-color: #bdbdbd !important;
//         }
//         .row-fully-approved td,
//         .row-fully-approved .form-control,
//         .row-fully-approved .input-with-feedback {
//             background-color: #f5f5f5 !important;
//             color: #666666 !important;
//             border-color: #bdbdbd !important;
//         }
//         .row-approved-indicator {
//             color: #2e7d32;
//             font-weight: bold;
//             margin-left: 5px;
//             background: #4caf50;
//             color: white;
//             border-radius: 50%;
//             padding: 2px 6px;
//             font-size: 10px;
//         }
//         .approval-progress {
//             font-weight: bold;
//             color: #1976d2;
//             margin: 5px 0;
//         }
        
//         /* Hover effects for approved elements */
//         .row-fully-approved:hover {
//             box-shadow: 0 4px 8px rgba(76, 175, 80, 0.15);
//             transform: translateY(-1px);
//             transition: all 0.2s ease-in-out;
//         }
        
//         /* Better styling for locked state */
//         .row-fully-approved .grid-row-check {
//             background-color: #e8f5e8 !important;
//         }
//     `;
//     document.head.appendChild(style);
// }

// ============================
// Additional Size List Details Handlers
// ============================






// Add CSS for verification status styling
if (!document.querySelector('#verification-status-styles')) {
    const style = document.createElement('style');
    style.id = 'verification-status-styles';
    style.textContent = `
        .verification-verified {
            background-color: #e8f5e8 !important;
            border-left: 4px solid #28a745 !important;
            opacity: 0.7;
        }
        .verification-incorrect {
            background-color: #fff3cd !important;
            border-left: 4px solid #ffc107 !important;
        }
        .verification-pending {
            background-color: #f8f9fa !important;
            border-left: 4px solid #6c757d !important;
        }
        .grid-row .verification-verified .grid-static-col,
        .grid-row .verification-verified input,
        .grid-row .verification-verified select,
        .grid-row .verification-verified textarea {
            background-color: #e8f5e8 !important;
            color: #155724 !important;
            cursor: not-allowed !important;
            opacity: 0.8 !important;
        }
        .grid-row .verification-verified input:disabled,
        .grid-row .verification-verified select:disabled,
        .grid-row .verification-verified textarea:disabled {
            background-color: #e8f5e8 !important;
            color: #155724 !important;
            border: 1px solid #28a745 !important;
        }
        .grid-row .verification-incorrect .grid-static-col,
        .grid-row .verification-incorrect input,
        .grid-row .verification-incorrect select,
        .grid-row .verification-incorrect textarea {
            background-color: #fff3cd !important;
            border: 1px solid #ffc107 !important;
        }
        .grid-row .verification-incorrect input:focus,
        .grid-row .verification-incorrect select:focus,
        .grid-row .verification-incorrect textarea:focus {
            background-color: #fff8e1 !important;
            border: 2px solid #ff9800 !important;
            box-shadow: 0 0 5px rgba(255, 152, 0, 0.3) !important;
        }
        .grid-row .verification-pending .grid-static-col {
            background-color: #f8f9fa !important;
        }
        .verification-status-badge {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
            margin-left: 5px;
        }
        .verification-status-verified {
            background-color: #28a745;
            color: white;
        }
        .verification-status-incorrect {
            background-color: #ffc107;
            color: #212529;
        }
        .verification-status-pending {
            background-color: #6c757d;
            color: white;
        }
        /* Animation for incorrect stones */
        @keyframes pulse-orange {
            0% { background-color: #fff3cd !important; }
            50% { background-color: #ffe69c !important; }
            100% { background-color: #fff3cd !important; }
        }
        /* Stronger styling for verified stones */
        .verified-field-locked {
            pointer-events: none !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
        }
    `;
    document.head.appendChild(style);
}

// ============================
// VERIFICATION STATUS HELPER FUNCTIONS
// ============================

function is_stone_verified(row) {
    return row.verification_status === 'Verified';
}

function is_stone_needs_correction(row) {
    return row.verification_status === 'Incorrect' || row.needs_correction === 1;
}

function apply_verification_status_styling(frm) {
    if (!frm.doc.stone_details) return;
    console.log('🎨 Applying verification status styling...');
    setTimeout(() => {
        frm.doc.stone_details.forEach((row, row_index) => {
            let row_element = $(`.grid-row[data-idx="${row_index}"]`);
            if (row_element.length === 0) {
                row_element = $(`.grid-row:nth-child(${row_index + 1})`);
            }
            if (row_element.length === 0) {
                console.log(`❌ Row element not found for index ${row_index}`);
                return;
            }
            console.log(`🔍 Processing row ${row_index}:`, {
                stone_name: row.stone_name,
                verification_status: row.verification_status,
                needs_correction: row.needs_correction
            });

            row_element.removeClass('verification-verified verification-incorrect verification-pending');
            row_element.find('.verification-status-badge').remove();

            if (row.verification_status === 'Verified') {
                console.log(`✅ Applying verified styling to row ${row_index}`);
                row_element.addClass('verification-verified');
                row_element.css({
                    'background-color': '#e8f5e8 !important',
                    'opacity': '0.7',
                    'border-left': '4px solid #28a745'
                });
                row_element.find('input, select, textarea, .form-control').each(function() {
                    $(this).prop('readonly', true)
                           .prop('disabled', true)
                           .css({
                               'background-color': '#e8f5e8 !important',
                               'color': '#155724 !important',
                               'cursor': 'not-allowed !important',
                               'border': '1px solid #28a745 !important',
                               'opacity': '0.8 !important'
                           })
                           .attr('title', 'This stone is verified and cannot be modified')
                           .addClass('verified-field-locked');
                });
                row_element.find('input, select, textarea').off().on('click focus keydown keypress change', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    frappe.show_alert({
                        message: __('❌ This stone is verified and cannot be modified'),
                        indicator: 'red'
                    });
                    return false;
                });
                if (!row_element.find('.verification-status-badge').length) {
                    row_element.find('.grid-row-index').append(
                        '<span class="verification-status-badge verification-status-verified">✅ Verified</span>'
                    );
                }
            } else if (row.verification_status === 'Incorrect' || row.needs_correction === 1) {
                console.log(`🔴 Applying incorrect styling to row ${row_index}`);
                row_element.addClass('verification-incorrect');
                row_element.css({
                    'background-color': '#fff3cd !important',
                    'border-left': '4px solid #ffc107',
                    'animation': 'pulse-orange 2s infinite'
                });
                row_element.find('input, select, textarea, .form-control').each(function() {
                    $(this).prop('readonly', false)
                           .prop('disabled', false)
                           .css({
                               'background-color': '#fff3cd !important',
                               'color': '#856404 !important',
                               'cursor': 'text !important',
                               'border': '2px solid #ffc107 !important'
                           })
                           .attr('title', '⚠️ This stone needs correction - please edit it')
                           .removeClass('verified-field-locked');
                });
                row_element.find('input, select, textarea').off('focus blur').on('focus', function() {
                    $(this).css({
                        'background-color': '#fff8e1 !important',
                        'border': '3px solid #ff9800 !important',
                        'box-shadow': '0 0 10px rgba(255, 152, 0, 0.5) !important'
                    });
                    frappe.show_alert({
                        message: __('📝 Editing stone that needs correction'),
                        indicator: 'orange'
                    });
                }).on('blur', function() {
                    $(this).css({
                        'background-color': '#fff3cd !important',
                        'border': '2px solid #ffc107 !important',
                        'box-shadow': 'none'
                    });
                });
                if (!row_element.find('.verification-status-badge').length) {
                    row_element.find('.grid-row-index').append(
                        '<span class="verification-status-badge verification-status-incorrect">⚠️ Needs Correction</span>'
                    );
                }
            } else {
                console.log(`⏳ Applying pending styling to row ${row_index}`);
                row_element.addClass('verification-pending');
                row_element.css({
                    'background-color': '',
                    'border-left': '',
                    'opacity': '',
                    'animation': ''
                });
                row_element.find('input, select, textarea, .form-control').each(function() {
                    $(this).prop('readonly', false)
                           .prop('disabled', false)
                           .css({
                               'background-color': '',
                               'color': '',
                               'cursor': 'text',
                               'border': '',
                               'opacity': ''
                           })
                           .attr('title', 'This stone is pending verification')
                           .removeClass('verified-field-locked')
                           .off('focus blur');
                });
                if (!row_element.find('.verification-status-badge').length) {
                    row_element.find('.grid-row-index').append(
                        '<span class="verification-status-badge verification-status-pending">⏳ Pending</span>'
                    );
                }
            }
        });
    }, 500);
}

function load_verification_summary(frm) {
    if (!frm.doc.name) return;
    frappe.call({
        method: "baps.baps.doctype.size_list_verification.size_list_verification.get_verification_summary",
        args: {
            form_number: frm.doc.name
        },
        callback: function(r) {
            if (r.message && r.message.success) {
                let summary = r.message.data;
                if (summary.total_stones > 0) {
                    let status_text = `Verification Status: ${summary.verified_count} verified, ${summary.incorrect_count} incorrect, ${summary.pending_count} pending`;
                    frm.dashboard.clear_comment();
                    if (summary.verification_complete) {
                        frm.dashboard.add_comment(status_text + ' - ✅ Verification Complete!', 'green', true);
                    } else if (summary.incorrect_count > 0) {
                        frm.dashboard.add_comment(status_text + ' - ⚠️ Some stones need correction', 'orange', true);
                    } else {
                        frm.dashboard.add_comment(status_text + ' - ⏳ Verification in progress', 'blue', true);
                    }
                }
            }
        }
    });
}

// ============================
// PERSISTENT STORAGE FUNCTIONS (Browser localStorage)
// ============================

function get_approval_storage_key(frm) {
    return `size_list_approvals_${frm.doc.name || 'new'}`;
}

function is_field_approved(frm, row, field_name) {
    try {
        let storage_key = get_approval_storage_key(frm);
        let approval_data = localStorage.getItem(storage_key);
        if (!approval_data) return false;
        approval_data = JSON.parse(approval_data);
        return !!(approval_data[row.name] && approval_data[row.name][field_name]);
    } catch (e) {
        console.error('Error checking field approval state:', e);
        return false;
    }
}

function save_approval_state(frm, row_name, field_name, is_approved) {
    try {
        let storage_key = get_approval_storage_key(frm);
        let approval_data = {};
        let existing_data = localStorage.getItem(storage_key);
        if (existing_data) {
            approval_data = JSON.parse(existing_data);
        }
        if (!approval_data[row_name]) {
            approval_data[row_name] = {};
        }
        approval_data[row_name][field_name] = is_approved;
        localStorage.setItem(storage_key, JSON.stringify(approval_data));
    } catch (e) {
        console.error('Error saving approval state:', e);
    }
}

function restore_approval_states(frm) {
    if (!frm.doc.stone_details) return;
    try {
        let storage_key = get_approval_storage_key(frm);
        let approval_data = localStorage.getItem(storage_key);
        if (!approval_data) return;
        approval_data = JSON.parse(approval_data);
        frm.doc.stone_details.forEach(row => {
            if (approval_data[row.name]) {
                row._approved_fields = approval_data[row.name];
            }
        });
    } catch (e) {
        console.error('Error restoring approval states:', e);
    }
}

function save_previous_field_value(frm, row, field_name, value) {
    try {
        let storage_key = `${get_approval_storage_key(frm)}_previous_values`;
        let previous_data = {};
        let existing_data = localStorage.getItem(storage_key);
        if (existing_data) {
            previous_data = JSON.parse(existing_data);
        }
        if (!previous_data[row.name]) {
            previous_data[row.name] = {};
        }
        previous_data[row.name][field_name] = value;
        localStorage.setItem(storage_key, JSON.stringify(previous_data));
    } catch (e) {
        console.error('Error saving previous field value:', e);
    }
}

function get_previous_field_value(frm, row, field_name) {
    try {
        let storage_key = `${get_approval_storage_key(frm)}_previous_values`;
        let previous_data = localStorage.getItem(storage_key);
        if (!previous_data) return null;
        previous_data = JSON.parse(previous_data);
        return previous_data[row.name] && previous_data[row.name][field_name] || null;
    } catch (e) {
        console.error('Error getting previous field value:', e);
        return null;
    }
}

function initialize_previous_field_values(frm) {
    if (!frm.doc.stone_details) return;
    let required_fields = ['stone_name', 'stone_code', 'l1', 'b1', 'h1', 'l2', 'b2', 'h2', 'volume'];
    frm.doc.stone_details.forEach(row => {
        required_fields.forEach(field => {
            if (row[field] !== undefined && row[field] !== null) {
                save_previous_field_value(frm, row, field, row[field]);
            }
        });
    });
}

// ============================
// CORE FUNCTIONS
// ============================

function calculate_volume(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
    if (!row) return;
    let L = ((row.l1 || 0) * 12) + (row.l2 || 0);
    let B = ((row.b1 || 0) * 12) + (row.b2 || 0);
    let H = ((row.h1 || 0) * 12) + (row.h2 || 0);
    row.volume = ((L * B * H) / 1728).toFixed(2);
    frm.refresh_field('stone_details');
    update_total_volume(frm);
}

function update_total_volume(frm) {
    let total = 0;
    (frm.doc.stone_details || []).forEach(r => {
        total += flt(r.volume);
    });
    frm.set_value('total_volume', total.toFixed(2));
}

function load_project_flags(frm) {
    if (!frm.doc.baps_project) {
        frm._project_flags = { chemical: 0, dry_fitting: 0, polishing: 0 };
        set_child_grid_readonly(frm);
        return;
    }
    frappe.db.get_doc('Baps Project', frm.doc.baps_project).then(project_doc => {
        if (project_doc) {
            frm._project_flags = {
                chemical: project_doc.chemical ? 1 : 0,
                dry_fitting: project_doc.dry_fitting ? 1 : 0,
                polishing: project_doc.polishing ? 1 : 0
            };
            apply_project_checkboxes(frm);
            set_child_grid_readonly(frm);
        }
    }).catch(err => {
        frm._project_flags = { chemical: 0, dry_fitting: 0, polishing: 0 };
    });
}

function set_child_grid_readonly(frm) {
    if (!frm.fields_dict || !frm.fields_dict.stone_details) return;
    let grid = frm.fields_dict.stone_details.grid;
    if (!grid) return;
    let fields_to_check = ['chemical', 'dry_fitting', 'polishing'];
    fields_to_check.forEach(field_name => {
        try {
            let field_exists = grid.docfields.find(df => df.fieldname === field_name);
            if (field_exists) {
                let read_only_value = frm._project_flags?.[field_name] ? 1 : 0;
                grid.update_docfield_property(field_name, 'read_only', read_only_value);
            }
        } catch (error) {
            console.log(`Field ${field_name} not found in Size List Details, skipping...`);
        }
    });
}

function apply_project_checkboxes(frm) {
    let main_form_fields = ['chemical', 'dry_fitting', 'polishing'];
    main_form_fields.forEach(field => {
        if (frm.get_field(field) && frm._project_flags?.[field] !== undefined) {
            frm.set_value(field, frm._project_flags[field]);
        }
    });
    if (frm.doc.stone_details && frm.doc.stone_details.length > 0) {
        let child_meta = frappe.get_meta("Size List Details");
        let available_fields = child_meta.fields.map(f => f.fieldname);
        (frm.doc.stone_details || []).forEach((row) => {
            ['chemical', 'dry_fitting', 'polishing'].forEach(field => {
                if (available_fields.includes(field) && frm._project_flags?.[field]) {
                    frappe.model.set_value(row.doctype, row.name, field, 1);
                }
            });
        });
    }
    frm.refresh_field("stone_details");
}

// ============================
// SIZE LIST DETAILS HANDLERS
// ============================

frappe.ui.form.on('Size List Details', {
    stone_name: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (is_stone_verified(row)) {
            frappe.show_alert({
                message: __('🚫 This stone is VERIFIED and cannot be modified!'),
                indicator: 'red'
            });
            frappe.msgprint({
                title: __('🔒 Stone is Verified'),
                message: __('This stone has been verified and is locked for editing. If you need to make changes, please mark it as incorrect in the Size List Verification form first.'),
                indicator: 'red'
            });
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'stone_name');
                frappe.model.set_value(cdt, cdn, 'stone_name', previous_value || '');
            }, 100);
            return false;
        }
        if (is_field_approved(frm, row, 'stone_name')) {
            frappe.show_alert({message: __('Stone Name is approved and locked'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'stone_name');
                frappe.model.set_value(cdt, cdn, 'stone_name', previous_value);
            }, 100);
            return false;
        }
        save_previous_field_value(frm, row, 'stone_name', row.stone_name);
        if (row && row.stone_name) {
            frappe.db.get_value('Stone Name', row.stone_name, 'stone_code', (r) => {
                if (r && r.stone_code) {
                    frappe.model.set_value(cdt, cdn, 'stone_code', r.stone_code);
                }
            });
        }
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },

    stone_code: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'stone_code');
                frappe.model.set_value(cdt, cdn, 'stone_code', previous_value);
            }, 100);
            return false;
        }
        if (is_field_approved(frm, row, 'stone_code')) {
            frappe.show_alert({message: __('Stone Code is approved and locked'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'stone_code');
                frappe.model.set_value(cdt, cdn, 'stone_code', previous_value);
            }, 100);
            return false;
        }
        save_previous_field_value(frm, row, 'stone_code', row.stone_code);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },

    l1: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'l1');
                frappe.model.set_value(cdt, cdn, 'l1', previous_value);
            }, 100);
            return false;
        }
        if (is_field_approved(frm, row, 'l1')) {
            frappe.show_alert({message: __('L1 field is approved and locked'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'l1');
                frappe.model.set_value(cdt, cdn, 'l1', previous_value);
            }, 100);
            return false;
        }
        save_previous_field_value(frm, row, 'l1', row.l1);
        calculate_volume(frm, cdt, cdn);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },

    l2: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'l2');
                frappe.model.set_value(cdt, cdn, 'l2', previous_value);
            }, 100);
            return false;
        }
        if (is_field_approved(frm, row, 'l2')) {
            frappe.show_alert({message: __('L2 field is approved and locked'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'l2');
                frappe.model.set_value(cdt, cdn, 'l2', previous_value);
            }, 100);
            return false;
        }
        save_previous_field_value(frm, row, 'l2', row.l2);
        if (row && row.l2 >= 12) {
            frappe.msgprint(__('L2 must be less than 12 inches'));
            frappe.model.set_value(cdt, cdn, 'l2', 0);
        }
        calculate_volume(frm, cdt, cdn);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },

    b1: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'b1');
                frappe.model.set_value(cdt, cdn, 'b1', previous_value);
            }, 100);
            return false;
        }
        if (is_field_approved(frm, row, 'b1')) {
            frappe.show_alert({message: __('B1 field is approved and locked'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'b1');
                frappe.model.set_value(cdt, cdn, 'b1', previous_value);
            }, 100);
            return false;
        }
        save_previous_field_value(frm, row, 'b1', row.b1);
        calculate_volume(frm, cdt, cdn);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },

    b2: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'b2');
                frappe.model.set_value(cdt, cdn, 'b2', previous_value);
            }, 100);
            return false;
        }
        if (is_field_approved(frm, row, 'b2')) {
            frappe.show_alert({message: __('B2 field is approved and locked'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'b2');
                frappe.model.set_value(cdt, cdn, 'b2', previous_value);
            }, 100);
            return false;
        }
        save_previous_field_value(frm, row, 'b2', row.b2);
        if (row && row.b2 >= 12) {
            frappe.msgprint(__('B2 must be less than 12 inches'));
            frappe.model.set_value(cdt, cdn, 'b2', 0);
        }
        calculate_volume(frm, cdt, cdn);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },

    h1: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'h1');
                frappe.model.set_value(cdt, cdn, 'h1', previous_value);
            }, 100);
            return false;
        }
        if (is_field_approved(frm, row, 'h1')) {
            frappe.show_alert({message: __('H1 field is approved and locked'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'h1');
                frappe.model.set_value(cdt, cdn, 'h1', previous_value);
            }, 100);
            return false;
        }
        save_previous_field_value(frm, row, 'h1', row.h1);
        calculate_volume(frm, cdt, cdn);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },

    h2: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (is_stone_verified(row)) {
            frappe.show_alert({message: __('This stone is verified and cannot be modified'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'h2');
                frappe.model.set_value(cdt, cdn, 'h2', previous_value);
            }, 100);
            return false;
        }
        if (is_field_approved(frm, row, 'h2')) {
            frappe.show_alert({message: __('H2 field is approved and locked'), indicator: 'red'});
            setTimeout(() => {
                let previous_value = get_previous_field_value(frm, row, 'h2');
                frappe.model.set_value(cdt, cdn, 'h2', previous_value);
            }, 100);
            return false;
        }
        save_previous_field_value(frm, row, 'h2', row.h2);
        if (row && row.h2 >= 12) {
            frappe.msgprint(__('H2 must be less than 12 inches'));
            frappe.model.set_value(cdt, cdn, 'h2', 0);
        }
        calculate_volume(frm, cdt, cdn);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },

    range: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (!row || !row.range) return;
        let input = row.range.toString().trim();
        if (!input) return;
        let numbers = [];
        let parts = input.split(',').map(s => s.trim()).filter(s => s);
        parts.forEach(part => {
            if (part.includes('-')) {
                let rangeParts = part.split('-').map(s => s.trim());
                if (rangeParts.length === 2) {
                    let start = parseInt(rangeParts[0], 10);
                    let end = parseInt(rangeParts[1], 10);
                    if (isNaN(start) || isNaN(end) || start > end) {
                        frappe.show_alert({message: "Invalid range → " + part, indicator: "red"});
                        return;
                    }
                    for (let i = start; i <= end; i++) numbers.push(i);
                }
            } else {
                let n = parseInt(part, 10);
                if (!isNaN(n)) numbers.push(n);
            }
        });
        numbers = [...new Set(numbers)].sort((a,b) => a-b);
        if (numbers.length === 0) return;
        if (!row.stone_code) {
            frappe.show_alert({message: "Please enter Stone Code in the first row before using range", indicator: "red"});
            return;
        }
        let match = row.stone_code.match(/^(.*?)(\d+)$/);
        if (!match) {
            frappe.show_alert({message: "Stone Code must end with numbers, e.g. ABCDE001", indicator: "red"});
            return;
        }
        let prefix = match[1], num_width = match[2].length;
        frappe.model.set_value(cdt, cdn, "range", "");
        let duplicate_codes = [];
        numbers.forEach((n, idx) => {
            let stone_code = prefix + String(n).padStart(num_width, "0");
            let exists = frm.doc.stone_details.some(r => r.stone_code === stone_code || r.serial_no === n);
            if (exists) {
                duplicate_codes.push(stone_code);
                return;
            }
            let target_row;
            if (idx === 0) {
                target_row = row;
                target_row.stone_code = stone_code;
                target_row.serial_no = n;
            } else {
                target_row = frm.add_child("stone_details");
                Object.keys(row).forEach(f => {
                    if (!["name","idx","doctype","stone_code","range","serial_no"].includes(f)) {
                        target_row[f] = row[f];
                    }
                });
                target_row.stone_code = stone_code;
                target_row.serial_no = n;
            }
            calculate_volume(frm, target_row.doctype, target_row.name);
        });
        if (duplicate_codes.length) {
            frappe.show_alert({
                message: "Skipped duplicates: " + duplicate_codes.join(", "),
                indicator: "orange"
            });
        }
        frm.refresh_field("stone_details");
    },

    stone_details_remove: function(frm) {
        update_total_volume(frm);
        setTimeout(() => setup_approval_and_publish_buttons(frm), 100);
    },

    refresh: function(frm) {
        set_child_grid_readonly(frm);
    }
});

// ============================
// SIZE LIST (PARENT) HANDLERS
// ============================

frappe.ui.form.on('Size List', {
    refresh: function(frm) {
        setup_approval_and_publish_buttons(frm);
        restore_approval_states(frm);
        initialize_previous_field_values(frm);
        setTimeout(() => {
            apply_all_field_approval_states(frm);
        }, 800);
        if (frm.doc.name && frm.doc.stone_details && frm.doc.stone_details.length > 0) {
            load_verification_summary(frm);
            setTimeout(() => {
                apply_verification_status_styling(frm);
            }, 1000);
        }
        if (frm.doc.baps_project) {
            load_project_flags(frm);
        }
        if (frm.doc.name && frm.doc.stone_details && frm.doc.stone_details.length > 0) {
            frm.add_custom_button(__('🔄 Refresh Verification Status'), function() {
                frappe.show_alert({
                    message: __('🔄 Refreshing verification status from database...'),
                    indicator: 'blue'
                });
                frm.reload_doc().then(() => {
                    setTimeout(() => {
                        apply_verification_status_styling(frm);
                        frappe.show_alert({
                            message: __('✅ Verification status refreshed successfully!'),
                            indicator: 'green'
                        });
                    }, 500);
                }).catch((error) => {
                    console.error('Error reloading form:', error);
                    frappe.show_alert({
                        message: __('❌ Error refreshing verification status'),
                        indicator: 'red'
                    });
                });
            }, __('🔧 Actions'));

            frm.add_custom_button(__('🎨 Force Apply Styling'), function() {
                apply_verification_status_styling(frm);
                frappe.show_alert({
                    message: __('🎨 Styling applied manually'),
                    indicator: 'blue'
                });
            }, __('🔧 Actions'));
        }
    },

    baps_project: function(frm) {
        if (frm.doc.baps_project) {
            load_project_flags(frm);
        } else {
            frm._project_flags = { chemical: 0, dry_fitting: 0, polishing: 0 };
            set_child_grid_readonly(frm);
        }
    },

    main_part: function(frm) {
        if (!frm.doc.main_part) frm.set_value('sub_part', '');
        frm.set_query("sub_part", function() {
            if (!frm.doc.main_part) {
                frappe.throw("Please select Main Part before choosing a Sub Part.");
            }
            return {
                filters: {
                    main_part: frm.doc.main_part
                }
            };
        });
        if (frm.doc.sub_part) {
            frappe.db.get_value("Sub Part", frm.doc.sub_part, "main_part", function(r) {
                if (r && r.main_part !== frm.doc.main_part) {
                    frm.set_value("sub_part", null);
                }
            });
        }
    },

    sub_part: function(frm) {
        if (!frm.doc.sub_part) frm.set_value('main_part', '');
    },

    stone_details_add: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (frm._project_flags?.chemical) frappe.model.set_value(cdt, cdn, 'chemical', 1);
        if (frm._project_flags?.dry_fitting) frappe.model.set_value(cdt, cdn, 'dry_fitting', 1);
        if (frm._project_flags?.polishing) frappe.model.set_value(cdt, cdn, 'polishing', 1);
        setTimeout(() => {
            apply_verification_status_styling(frm);
        }, 500);
    },

    validate: function(frm) {
        if (!frm.doc.main_part && frm.doc.sub_part) {
            frappe.throw("You cannot add a Sub Part without selecting a Main Part.");
        }
    }
});