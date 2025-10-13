

// frappe.ui.form.on("Block", {
//     refresh(frm) {
//         // Hide Save button for existing docs
//         if (!frm.is_new()) {
//             frm.disable_save();
//         } else {
//             frm.enable_save();
//         }

//         // Auto update status based on stage or conditions
//         if (frm.doc.project_name === "Baps Project") {
//             if (frm.doc.status !== "Selected" && frm.doc.status !== "Transport") {
//                 // You can define custom logic here based on your fields
//                 // For example, check if block_custom_code or some other field indicates its stage
//                 if (frm.doc.block_custom_code && frm.doc.block_custom_code.startsWith("BAPS")) {
//                     frm.set_value("status", "Selected");
//                 }
//             }
//         }

//         // Example: if block is in transportation
//         if (frm.doc.is_in_transportation) {
//             frm.set_value("status", "Transport");
//         }
//     },
// });






// frappe.ui.form.on("Block", {
//     refresh(frm) {
//         // Hide Save button for existing docs
//         if (!frm.is_new()) {
//             frm.disable_save();
//         } else {
//             frm.enable_save();
//         }

//         // Auto update status based on stage or conditions
//         if (frm.doc.project_name === "Baps Project") {
//             if (frm.doc.status !== "Selected" && frm.doc.status !== "Transport") {
//                 // You can define custom logic here based on your fields
//                 // For example, check if block_custom_code or some other field indicates its stage
//                 if (frm.doc.block_custom_code && frm.doc.block_custom_code.startsWith("BAPS")) {
//                     frm.set_value("status", "Selected");
//                 }
//             }
//         }

//         // Example: if block is in transportation
//         if (frm.doc.is_in_transportation) {
//             frm.set_value("status", "Transport");
//         }
//     },
// });






frappe.ui.form.on("Block", {
    refresh(frm) {
        // Hide Save button for existing docs
        if (!frm.is_new()) {
            frm.disable_save();
        } else {
            frm.enable_save();
        }

        // Only run status logic if we're in a stable state (not dirty from a set_value)
        if (frm._status_update_in_progress) return;

        // Auto update status based on stage or conditions
        if (frm.doc.project_name === "Baps Project") {
            if (frm.doc.status !== "Selected" && frm.doc.status !== "Transport") {
                if (frm.doc.block_custom_code && frm.doc.block_custom_code.startsWith("BAPS")) {
                    frm._status_update_in_progress = true;
                    frm.set_value("status", "Selected").then(() => {
                        frm._status_update_in_progress = false;
                    });
                }
            }
        }

        // Example: if block is in transportation
        if (frm.doc.is_in_transportation && frm.doc.status !== "Transport") {
            frm._status_update_in_progress = true;
            frm.set_value("status", "Transport").then(() => {
                frm._status_update_in_progress = false;
            });
        }
    },
}); 