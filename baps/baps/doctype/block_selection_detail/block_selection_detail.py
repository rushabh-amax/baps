# Copyright (c) 2025, Tirthan Shah and contributors
# For license information, please see license.txt

# import frappe
import frappe
from frappe import _
from frappe.model.document import Document


class BlockSelectionDetail(Document):
	pass




def validate(doc, method):
    if not doc.block_number:
        frappe.throw(_("Block Number is mandatory"))
    if frappe.db.exists("Block Selection Detail", {"block_number": doc.block_number, "parent": ["!=", doc.parent]}):
        frappe.throw(_("Block Number must be unique"))

    # Auto-generate Block Custom Code: ABMCR009
    tp_abbr = frappe.db.get_value("Trade Partner", doc.parent.trade_partner, "abbreviation") or "TP"
    proj_abbr = frappe.db.get_value("Baps Project", doc.parent.baps_project, "abbreviation") or "PRJ"
    last = frappe.db.sql(f"SELECT MAX(CAST(SUBSTRING(block_custom_code, -3) AS UNSIGNED)) FROM `tabBlock Selection Detail` WHERE block_custom_code LIKE '{tp_abbr}{proj_abbr}%'")
    next_num = (last[0][0] or 0) + 1
    doc.block_custom_code = f"{tp_abbr}{proj_abbr}{next_num:03d}"

    # Volume: (L1 + L2/12) * (B1 + B2/12) * (H1 + H2/12)
    l = (doc.l1 or 0) + (doc.l2 or 0)/12
    b = (doc.b1 or 0) + (doc.b2 or 0)/12
    h = (doc.h1 or 0) + (doc.h2 or 0)/12
    doc.volume = round(l * b * h, 3)