# Copyright (c) 2025, Dharmesh Rathod and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


# class BlockSelection(Document):
# 	pass

class BlockSelection(Document):
    # def autoname(self):
    #     self.name = frappe.db.get_next_sequence_val('BKSL')
    #     if self.name:
    #         self.name = f"BKSL-{int(self.name):04d}"

    def validate(self):
        # if not self.date:
        #     frappe.throw(_("Date is mandatory"))
        # if not self.trade_partner:
        #     frappe.throw(_("Trade Partner is mandatory"))
        # if not self.region:
        #     frappe.throw(_("Region is mandatory"))
        # if not self.block_selection_details:
        #     frappe.throw(_("At least one block must be selected"))

        # Prevent edit after processing
        before = self.get_doc_before_save()
        if before and before.trade_partner_site:
            if self.trade_partner_site != before.trade_partner_site:
                frappe.throw(_("Trade Partner Site cannot be changed after first save"))
        if before and before.party:
            if self.party != before.party:
                frappe.throw(_("Party cannot be changed after first save"))
        if before and before.date:
            if self.date != before.date:
                frappe.throw(_("Date cannot be changed after first save"))

    def on_update_after_submit(self):
        for d in self.block_selection_details:
            frappe.db.set_value("Block Stone Receipt Item", d.block_number, "block_status", "Selected")

    def on_trash(self):
        if frappe.db.exists("Inspection", {"block_selection": self.name}) or \
           frappe.db.exists("Transportation Sender", {"block_selection": self.name}) or \
           frappe.db.exists("Billing Type", {"block_procurement_items.block_number": ["in", [d.block_number for d in self.block_selection_detail]]}):
            frappe.throw(_("Cannot delete: block is already inspected, transported, or billed"))

