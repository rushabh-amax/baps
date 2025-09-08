# Copyright (c) 2025, Tirthan Shah and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class CuttingPlanFinal(Document):
	pass


import frappe
from frappe import _

# def validate(doc, method):
#     if not doc.stone_code:
#         frappe.throw(_("Stone Code is mandatory"))
#     if doc.quantity <= 0:
#         frappe.throw(_("Quantity must be > 0"))
#     for f in ["length", "width", "height"]:
#         if doc.get(f) and doc.get(f) <= 0:
#             frappe.throw(_(f"{f.title()} must be positive"))
#     if doc.length and doc.width and doc.height:
#         doc.volume = round(doc.length * doc.width * doc.height, 3)