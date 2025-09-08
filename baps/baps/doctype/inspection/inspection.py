# Copyright (c) 2025, Dharmesh Rathod and contributors
# For license information, please see license.txt

# import frappe
# from frappe.model.document import Document


# class Inspection(Document):
# 	pass

import frappe
from frappe import _

def validate(doc, method):
    if not doc.block_selection:
        frappe.throw(_("Block Selection is mandatory"))
    if not doc.region:
        frappe.throw(_("Region is mandatory"))
    if not doc.details:
        frappe.throw(_("At least one Inspection Detail is required"))

def on_update_after_submit(doc, method):
    frappe.db.set_value("Block Selection", doc.block_selection, "status", "Available for Cutting")
    frappe.msgprint(_("Block marked as 'Available for Cutting'"), alert=True)