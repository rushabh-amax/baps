# # # Copyright (c) 2025, Dharmesh Rathod and contributors
# # # For license information, please see license.txt




# # import frappe
# # from frappe.model.document import Document


# # class BlockSelection(Document):
# # 	pass



# # class BlockSelection(Document):
# #     # def autoname(self):
# #     #     self.name = frappe.db.get_next_sequence_val('BKSL')
# #     #     if self.name:
# #     #         self.name = f"BKSL-{int(self.name):04d}"

# #     def validate(self):
# #         # if not self.date:
# #         #     frappe.throw(_("Date is mandatory"))
# #         # if not self.trade_partner:
# #         #     frappe.throw(_("Trade Partner is mandatory"))
# #         # if not self.region:
# #         #     frappe.throw(_("Region is mandatory"))
# #         # if not self.block_selection_details:
# #         #     frappe.throw(_("At least one block must be selected"))

# #         # Prevent edit after processing
# #         before = self.get_doc_before_save()
# #         if before:
# #             if hasattr(before, "trade_partner_site") and before.trade_partner_site:
# #                 if self.trade_partner_site != before.trade_partner_site:
# #                     frappe.throw(_("Trade Partner Site cannot be changed after first save"))
# #             if hasattr(before, "party") and before.party:
# #                 if self.party != before.party:
# #                     frappe.throw(_("Party cannot be changed after first save"))
# #             if hasattr(before, "date") and before.date:
# #                 if self.date != before.date:
# #                     frappe.throw(_("Date cannot be changed after first save"))


# #         total = 0.0
# #         for d in (self.block_selection_details or []):
# #             l = (d.l1 or 0) + (d.l2 or 0) / 12.0
# #             b = (d.b1 or 0) + (d.b2 or 0) / 12.0
# #             h = (d.h1 or 0) + (d.h2 or 0) / 12.0
# #             d.volume = round(l * b * h, 3)
# #             total += d.volume

# #         # If you later add a parent field called 'total_volume' in Block Selection, this will populate it.
# #         for fieldname in [f.fieldname for f in self.meta.get("fields")]:
# #             self.total_volume = round(total, 3)

# #     def on_update_after_submit(self):
# #         for d in (self.block_selection_details or []):
# #             frappe.db.set_value("Block Stone Receipt Item", d.block_number, "block_status", "Selected")

# #     def on_trash(self):
# #         if frappe.db.exists("Inspection", {"block_selection": self.name}) or \
# #            frappe.db.exists("Transportation Sender", {"block_selection": self.name}) or \
# #            frappe.db.exists("Billing Type", {"block_procurement_items.block_number": ["in", [d.block_number for d in (self.block_selection_details or [])]]}):
# #             frappe.throw(_("Cannot delete: block is already inspected, transported, or billed"))

# #     def validate(self):
# #         """Ensure numbering is consistent before saving"""
# #         seq = 1
# #         for row in self.block_selection_details:
# #             if not row.block_number:
# #                 row.block_number = str(seq).zfill(3)

# #             if not row.block_custom_code:
# #                 project_code = (self.baps_project or "")[:3].upper()
# #                 party_code = (self.party or "")[:3].upper()
# #                 row.block_custom_code = f"{project_code}{party_code}{str(seq).zfill(3)}"

# #             seq += 1





# # Copyright (c) 2025, Ayush and contributors
# # For license information, please see license.txt

# # Copyright (c) 2025, Ayush and contributors
# # For license information, please see license.txt





# import frappe
# from frappe.model.document import Document


# class BlockSelection(Document):
# 	pass



# class BlockSelection(Document):
#     # def autoname(self):
#     #     self.name = frappe.db.get_next_sequence_val('BKSL')
#     #     if self.name:
#     #         self.name = f"BKSL-{int(self.name):04d}"

#     def validate(self):
#         # if not self.date:
#         #     frappe.throw(("Date is mandatory"))
#         # if not self.trade_partner:
#         #     frappe.throw(("Trade Partner is mandatory"))
#         # if not self.region:
#         #     frappe.throw(("Region is mandatory"))
#         # if not self.block_selection_details:
#         #     frappe.throw(("At least one block must be selected"))

#         # Prevent edit after processing
#         # before = self.get_doc_before_save()
#         # if before:
#         #     if hasattr(before, "trade_partner_site") and before.trade_partner_site:
#         #         if self.trade_partner_site != before.trade_partner_site:
#         #             frappe.throw(_("Trade Partner Site cannot be changed after first save"))
#         #     if hasattr(before, "party") and before.party:
#         #         if self.party != before.party:
#         #             frappe.throw(_("Party cannot be changed after first save"))
#         #     if hasattr(before, "date") and before.date:
#         #         if self.date != before.date:
#         #             frappe.throw(_("Date cannot be changed after first save"))


#         total = 0.0
#         for d in (self.block_selection_details or []):
#             l = (d.l1 or 0) + (d.l2 or 0) / 12.0
#             b = (d.b1 or 0) + (d.b2 or 0) / 12.0
#             h = (d.h1 or 0) + (d.h2 or 0) / 12.0
#             d.volume = round(l * b * h, 3)
#             total += d.volume

#         # If you later add a parent field called 'total_volume' in Block Selection, this will populate it.
#         for fieldname in [f.fieldname for f in self.meta.get("fields")]:
#             self.total_volume = round(total, 3)

#     def on_update_after_submit(self):
#         for d in (self.block_selection_details or []):
#             frappe.db.set_value("Block Stone Receipt Item", d.block_number, "block_status", "Selected")

#     # def on_trash(self):
#     #     if frappe.db.exists("Inspection", {"block_selection": self.name}) or \
#     #        frappe.db.exists("Transportation Sender", {"block_selection": self.name}) or \
#     #        frappe.db.exists("Billing Type", {"block_procurement_items.block_number": ["in", [d.block_number for d in (self.block_selection_details or [])]]}):
#     #         frappe.throw(("Cannot delete: block is already inspected, transported, or billed"))

#     def validate(self):
#         """Ensure numbering is consistent before saving"""
#         seq = 1
#         for row in self.block_selection_details:
#             if not row.block_number:
#                 row.block_number = str(seq).zfill(3)

#             # if not row.block_custom_code:
#             #     project_code = (self.baps_project or "")[:3].upper()
#             #     party_code = (self.party or "")[:3].upper()
#             #     row.block_custom_code = f"{project_code}{party_code}{str(seq).zfill(3)}"

#             seq += 1

#         # def validate(self):
#         # # If already has 1st block saved, lock fields
#         #     if self.block_selection_details and len(self.block_selection_details) > 0:
#         #             allowed_fields = ["trade_partner_site", "party", "date"]

#         #     if self.is_new():  # skip for new record
#         #          return

#         #     old_doc = self.get_doc_before_save()

#         #     if old_doc:
#         #          for fieldname in self.as_dict():
#         #             if fieldname not in allowed_fields and self.get(fieldname) != old_doc.get(fieldname):
#         #                 frappe.throw(f"You cannot edit {fieldname} after saving first Block details.")

#         #         # Party field restriction
#         #     if old_doc.status == "Paid" and self.party != old_doc.party:
#         #             frappe.throw("Party cannot be changed after payment is done.")


#  # baps/baps/doctype/block_selection/block_selection.py



# def create_blocks_from_details(self):
#     if not self.block_selection_details:
#         return

#     for row in self.block_selection_details:
#         if not row.block_number:
#             continue

#         if frappe.db.exists("Block", {"block_number": row.block_number}):
#             continue

#         trade_partner_site = None
#         if self.trade_partner:
#             # Fetch the Site from Trade Partner's `site_type` field (which links to Site)
#             trade_partner_site = frappe.db.get_value("Trade Partner", self.trade_partner, "site_type")

#         block_doc = frappe.get_doc({
#             "doctype": "Block",
#             "block_number": row.block_number,
#             "date": self.date,
#             "baps_project": self.baps_project,
#             "project_name": self.project_name,
#             "trade_partner": self.trade_partner,
#             "trade_partner_site": trade_partner_site,  # ✅ Now correctly fetched
#             "party": self.party,
#             "material_type": self.material_type,
#             "status": "Available",
#             "colour": getattr(row, 'colour', None),
#             "l1": getattr(row, 'l1', None),
#             "l2": getattr(row, 'l2', None),
#             "b1": getattr(row, 'b1', None),
#             "b2": getattr(row, 'b2', None),
#             "h1": getattr(row, 'h1', None),
#             "h2": getattr(row, 'h2', None),
#             "wt": getattr(row, 'wt', None),
#             "volume": getattr(row, 'volume', None),
#             "block_custom_code": getattr(row, 'block_custom_code', None),
#         })
#         block_doc.insert(ignore_permissions=True)

# Copyright (c) 2025, Ayush and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class BlockSelection(Document):
    
    def validate(self):
        """Ensure numbering is consistent before saving"""
        seq = 1
        for row in self.block_selection_details:
            if not row.block_number:
                row.block_number = str(seq).zfill(3)
            seq += 1

        # Calculate total volume
        total = 0.0
        for d in (self.block_selection_details or []):
            l = (d.l1 or 0) + (d.l2 or 0) / 12.0
            b = (d.b1 or 0) + (d.b2 or 0) / 12.0
            h = (d.h1 or 0) + (d.h2 or 0) / 12.0
            d.volume = round(l * b * h, 3)
            total += d.volume
        
        # Set total_volume if field exists
        if hasattr(self, 'total_volume'):
            self.total_volume = round(total, 3)

    def on_update(self):
        # Auto-submit new documents
        if self.is_new() and self.docstatus == 0:
            # Optional: add validation before auto-submit
            if not self.trade_partner:
                frappe.throw("Trade Partner is mandatory.")
            if not self.block_selection_details:
                frappe.throw("At least one block must be selected.")
            
            # Create blocks first, then submit
            self.create_blocks_from_details()
            self.submit()  # This changes docstatus from 0 → 1

    def on_update_after_submit(self):
        for d in (self.block_selection_details or []):
            frappe.db.set_value("Block Stone Receipt Item", d.block_number, "block_status", "Selected")

    # def on_trash(self):
    #     if frappe.db.exists("Inspection", {"block_selection": self.name}) or \
    #        frappe.db.exists("Transportation Sender", {"block_selection": self.name}) or \
    #        frappe.db.exists("Billing Type", {"block_procurement_items.block_number": ["in", [d.block_number for d in (self.block_selection_details or [])]]}):
    #         frappe.throw("Cannot delete: block is already inspected, transported, or billed")

    def on_update(self):
        self.create_blocks_from_details()

    def create_blocks_from_details(self):
        if not self.block_selection_details:
            return

        for row in self.block_selection_details:
            # Skip if no block_number (shouldn't happen if your JS works)
            if not row.block_number:
                continue

            # Check if Block with this block_number already exists
            if frappe.db.exists("Block", {"block_number": row.block_number}):
                continue  # Already created → skip

            # Create Block using data from parent + child row
            block_doc = frappe.get_doc({
                "doctype": "Block",
                "block_number": row.block_number,  # ← from your JS logic!
                "date": self.date,
                "baps_project": self.baps_project,
                "project_name": self.project_name,
                "trade_partner": self.trade_partner,
                # "trade_partner_site": self.trade_partner_site,
                "party": self.party,
                "material_type": self.material_type,
                "status": "Available",
                # Pull fields from child row (must exist in Block Selection Detail)
                "colour": getattr(row, 'colour', None),
                "l1": getattr(row, 'l1', None),
                "l2": getattr(row, 'l2', None),
                "b1": getattr(row, 'b1', None),
                "b2": getattr(row, 'b2', None),
                "h1": getattr(row, 'h1', None),
                "h2": getattr(row, 'h2', None),
                "wt": getattr(row, 'wt', None),
                "volume": getattr(row, 'volume', None),
                "block_custom_code": getattr(row, 'block_custom_code', None),
            })
            block_doc.insert(ignore_permissions=True)




@frappe.whitelist()
def get_last_block_number(trade_partner, project_name, current_docname=None):
    """
    Get the last generated block number for given Trade Partner and Project Name
    """
    filters = {
        "trade_partner": trade_partner,
        "project_name": project_name,
        "docstatus": ["!=", 2]  # Exclude cancelled documents
    }
    
    # Exclude current document if it exists
    if current_docname:
        filters["name"] = ["!=", current_docname]
    
    # Get last block number ordered by creation date
    last_block = frappe.get_all(
        "Block",
        filters=filters,
        fields=["block_number"],
        order_by="creation desc",
        limit_page_length=1
    )
    
    if last_block:
        return last_block[0].block_number
    return None