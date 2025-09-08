# Copyright (c) 2025, Dharmesh Rathod and contributors
# For license information, please see license.txt
import frappe
from frappe import _
from frappe.model.document import Document
from frappe.model.naming import make_autoname


class SizeListCreation(Document):



 def before_insert(self):
        # Auto-generate Form No only when creating a new document
        if not self.form_number:
            self.form_number = make_autoname("FORM-NO.-.#####")  
            

def validate(doc, method):
    total = 0
    for d in doc.stone_details:
        l = (d.l1 or 0) + (d.l2 or 0)/12
        b = (d.b1 or 0) + (d.b2 or 0)/12
        h = (d.h1 or 0) + (d.h2 or 0)/12
        d.volume = round(l * b * h, 3)
        total += d.volume

    doc.total_volume = round(total, 3)
            
        



