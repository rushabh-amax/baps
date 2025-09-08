# Copyright (c) 2025, Dhruvi Khant and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class PreCarvingQC(Document):
	pass

# import frappe
# from frappe import _

# def validate(self, method):
#     if self.cutting_entry_reference:
#         status = frappe.db.get_value("Cutting Entry", self.cutting_entry_reference, "docstatus")
#         if status != 1:
#             frappe.throw(_("Cutting Entry must be submitted before Pre-Carving QC"))

#     if not self.qc_by:
#         self.qc_by = frappe.session.user


# def before_save(self):
#     if not self.qc_by:
#         self.qc_by = frappe.session.user


import frappe
from frappe import _


def validate(doc, method):
    if not doc.stone_number:
        frappe.throw(_("Stone Number is mandatory"))
    if not doc.region:
        frappe.throw(_("Region is mandatory"))
    if not doc.is_size_ok or not doc.is_colour_ok or not doc.free_from_all_defects:
        frappe.throw(_("All QC fields (Size, Colour, Defects) are mandatory"))
    if doc.free_from_all_defects == "No" and not doc.remarks:
        frappe.throw(_("Remarks are required if stone has defects"))
    if doc.free_from_all_defects == "No" and not doc.photo_evidence:
        frappe.throw(_("Photo Evidence is required if stone is defective"))

def on_update_after_submit(doc, method):
    if doc.is_size_ok == "Yes" and doc.is_colour_ok == "Yes" and doc.free_from_all_defects == "Yes":
        frappe.db.set_value("Cutting Planning", doc.cutting_planning, "status", "Ready for Carving")
        frappe.msgprint(_("Stone marked as Ready for Carving"), alert=True)
    else:
        doc.level_2_qc_required = 1
