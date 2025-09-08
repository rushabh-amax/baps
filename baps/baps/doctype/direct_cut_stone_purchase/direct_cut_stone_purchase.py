# Copyright (c) 2025, Dharmesh Rathod and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class DirectCutStonePurchase(Document):




 def validate(doc, method):
    total = 0
    for d in doc.stone_details:
        l = (d.l1 or 0) + (d.l2 or 0)/12
        b = (d.b1 or 0) + (d.b2 or 0)/12
        h = (d.h1 or 0) + (d.h2 or 0)/12
        d.volume = round(l * b * h, 3)
        total += d.volume

    doc.total_volume = round(total, 3)