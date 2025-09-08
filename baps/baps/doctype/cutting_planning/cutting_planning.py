# Copyright (c) 2025, Kavin Dave and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.model.naming import make_autoname

class CuttingPlanning(Document):

   
    def before_insert(self):
        # Auto-generate Form No only when creating a new document
        if not self.form_no:
            self.form_no = make_autoname("FORM-NO.-.#####")  
            
            # Auto generate trial no based on existing entries
            if not self.trial_number:
                self.trial_number = make_autoname("TRIAL-NO.-.#####")

# def validate(doc, method):
    # if not doc.block_number:
    #     frappe.throw(_("Block Number is mandatory"))
    # if not doc.size_list_creation:
    #     frappe.throw(_("Size List is mandatory"))
    # if not doc.cutting_plan_details:
    #     frappe.throw(_("At least one final plan detail is required"))

    # total = 0
    # for d in doc.cutting_plan_details:
    #     if d.length and d.width and d.height and d.quantity:
    #         d.volume = round(d.length * d.width * d.height, 3)
    #         total += d.volume * d.quantity
    # doc.total_planned_volume = round(total, 3)
