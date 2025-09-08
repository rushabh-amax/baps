# Copyright (c) 2025, Tirthan Shah and contributors
# For license information, please see license.txt

# import frappe
# from frappe.model.document import Document


# class BillingType(Document):
# 	pass

import frappe
from frappe import _

def autoname(doc, method):
    doc.name = f"INV-{frappe.utils.nowdate()}-{frappe.db.get_next_sequence_val('INVOICE')}"

def validate(doc, method):
    if not doc.invoice_date:
        frappe.throw(_("Invoice Date is mandatory"))
    if not doc.region:
        frappe.throw(_("Region is mandatory"))

    total = 0
    if doc.billing_type == "Block Wise":
        for item in doc.block_procurement_items:
            item.amount = item.qty * item.rate
            total += item.amount
    elif doc.billing_type == "Truck Wise":
        for item in doc.truck_procurement_items:
            item.total_amount = item.qty * item.price_per_unit
            total += item.total_amount
    elif doc.billing_type == "Lot Wise":
        for item in doc.lot_procurement_items:
            item.amount = item.qty * item.rate
            total += item.amount
    doc.total_amount = round(total, 2)

