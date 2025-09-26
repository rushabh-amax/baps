
# import frappe
# import json
# from frappe import _
# from frappe.model.document import Document

# class TransportationSender(Document):
#     def validate(self):
#         self.validate_gate_pass_no_usage()

#     def validate_gate_pass_no_usage(self):
#         if not self.gate_pass_no:
#             return

#         # Check if this Gate Pass No is already used in any submitted Transportation Sender (excluding self)
#         existing_sender = frappe.db.exists(
#             "Transportation Sender",
#             {
#                 "gate_pass_no": self.gate_pass_no,
#                 "name": ["!=", self.name],
#                 "docstatus": 1
#             }
#         )

#         if existing_sender:
#             frappe.throw(
#                 _("Gate Pass No {0} is already used in Transportation Sender {1}. Please select a different one.").format(
#                     self.gate_pass_no, existing_sender
#                 )
#             )

#         # Check if used in any submitted Transportation Receiver
#         existing_receiver = frappe.db.exists(
#             "Transportation Receiver",
#             {
#                 "gate_pass_no": self.gate_pass_no,
#                 "docstatus": 1
#             }
#         )

#         if existing_receiver:
#             frappe.throw(
#                 _("Gate Pass No {0} is already used in Transportation Receiver {1}. Please select a different one.").format(
#                     self.gate_pass_no, existing_receiver
#                 )
#             )

# @frappe.whitelist()
# def get_blocks_for_project(project):
#     block_numbers = []
#     block_selections = frappe.get_all("Block Selection", filters={"baps_project": project}, fields=["name"])
#     for bs in block_selections:
#         details = frappe.get_all("Block Selection Detail", filters={"parent": bs.name}, fields=["block_number"])
#         for d in details:
#             if d.block_number:
#                 block_numbers.append({"block_number": d.block_number})

#     # Deduplicate
#     seen = set()
#     unique_blocks = []
#     for block in block_numbers:
#         if block["block_number"] not in seen:
#             seen.add(block["block_number"])
#             unique_blocks.append(block)

#     return unique_blocks

# @frappe.whitelist()
# def add_blocks_to_table(sender_name, blocks):
#     if isinstance(blocks, str):
#         try:
#             blocks = json.loads(blocks)
#         except json.JSONDecodeError:
#             frappe.throw(_("Invalid format for blocks. Expected a valid JSON list."))

#     if not isinstance(blocks, list):
#         frappe.throw(_("Blocks must be a list of block data."))

#     doc = frappe.get_doc("Transportation Sender", sender_name)
#     existing = [row.block_number for row in doc.transport_material_type]

#     added_count = 0
#     for block_data in blocks:
#         block_num = block_data.get("block_number")
#         if not block_num or block_num in existing:
#             continue

#         doc.append("transport_material_type", {
#             "project": block_data.get("project"),
#             "material_type": block_data.get("material_type"),
#             "block_number": block_num,
#             "material_number": block_num
#         })
#         added_count += 1

#     doc.save(ignore_permissions=True)
#     frappe.msgprint(_(f"{added_count} block(s) added to material table."))


# transportation_sender.py

# import frappe
# import json
# from frappe import _
# from frappe.model.document import Document

# class TransportationSender(Document):
#     def validate(self):
#         self.validate_gate_pass_no_usage()

#     def validate_gate_pass_no_usage(self):
#         # ... (your existing validation code, no changes needed here)
#         if not self.gate_pass_no:
#             return
#         existing_sender = frappe.db.exists(
#             "Transportation Sender",1
#             {"gate_pass_no": self.gate_pass_no, "name": ["!=", self.name], "docstatus": 1}
#         )
#         if existing_sender:
#             frappe.throw(
#                 _("Gate Pass No {0} is already used in Transportation Sender {1}. Please select a different one.").format(
#                     self.gate_pass_no, existing_sender
#                 )
#             )
#         existing_receiver = frappe.db.exists(
#             "Transportation Receiver",
#             {"gate_pass_no": self.gate_pass_no, "docstatus": 1}
#         )
#         if existing_receiver:
#             frappe.throw(
#                 _("Gate Pass No {0} is already used in Transportation Receiver {1}. Please select a different one.").format(
#                     self.gate_pass_no, existing_receiver
#                 )
#             )
# # @frappe.whitelist()
# # def get_items_for_selection(project, item_type):
# #     """
# #     MODIFIED: This function now fetches items based on both project and item_type.
# #     It's now scalable for different item types like 'Stone', 'Box', etc.
# #     """
# #     if not project or not item_type:
# #         return []

# #     items = []
# #     if item_type == 'Block':
# #         # Step 1: Find all parent 'Block Selection' documents that match the project
# #         # and are in the 'submitted' state (docstatus=1).
# #         parent_doc_names = frappe.get_all(
# #             "Block Selection",
# #             filters={
# #                 "baps_project": project,
# #                 "docstatus": 1  # <-- THIS IS THE ONLY CHANGE NEEDED
# #             },
# #             pluck="name"
# #         )

# #         if not parent_doc_names:
# #             return []

# #         # Step 2: Use the list of parent names to fetch the 'block_number' from the child table.
# #         block_numbers = frappe.get_all(
# #             "Block Selection Detail",
# #             filters={
# #                 "parent": ["in", parent_doc_names]
# #             },
# #             fields=["block_number"],
# #             pluck="block_number"
# #         )

# #         items = [{"item_id": item} for item in set(block_numbers) if item]

# #     # LATER: You can add logic for other item types here
# #     # elif item_type == 'Stone':
# #     #     # ... your logic to fetch stones ...
# #     #     # items = [{"item_id": "Stone001"}, {"item_id": "Stone002"}]
    
# #     return items

# @frappe.whitelist(allow_guest=True) # allow_guest helps with testing
# def get_items_for_selection(project, item_type):
#     # This dictionary will store a report of what happens at each step
#     debug_report = {}

#     if not project or not item_type:
#         debug_report['error'] = "Step 0 FAILED: Project or Item Type not received."
#         return debug_report

#     items = []
#     if item_type == 'Block':
#         # Step 1: Find the parent document
#         parent_doc_names = frappe.get_all(
#             "Block Selection",
#             filters={
#                 "baps_project": project,
#                 "docstatus": 1
#             },
#             pluck="name"
#         )
#         debug_report['step1_found_parents'] = parent_doc_names

#         if parent_doc_names:
#             # Step 2: Find the child items using the parents from step 1
#             block_numbers = frappe.get_all(
#                 "Block Selection Detail",
#                 filters={"parent": ["in", parent_doc_names]},
#                 fields=["block_number"],
#                 pluck="block_number"
#             )
#             debug_report['step2_found_blocks'] = block_numbers
#             items = [{"item_id": item} for item in set(block_numbers) if item]
#         else:
#             debug_report['step2_found_blocks'] = "Skipped, because no parent documents were found in Step 1."

#     debug_report['step3_final_items_sent'] = items
    
#     # We return the entire report to the browser
#     return debug_report

# @frappe.whitelist()
# def add_blocks_to_table(sender_name, blocks):
#     # ... (your existing function, no changes needed for now)
#     if isinstance(blocks, str):
#         try:
#             blocks = json.loads(blocks)
#         except json.JSONDecodeError:
#             frappe.throw(_("Invalid format for blocks. Expected a valid JSON list."))
#     if not isinstance(blocks, list):
#         frappe.throw(_("Blocks must be a list of block data."))

#     doc = frappe.get_doc("Transportation Sender", sender_name)
#     # NOTE: Your child table seems to be 'transport_material_type', not 'transport_items'.
#     # I am using 'transport_material_type' based on your code.
#     existing = [row.block_number for row in doc.get("transport_material_type", [])]

#     added_count = 0
#     for block_data in blocks:
#         block_num = block_data.get("block_number")
#         if not block_num or block_num in existing:
#             continue
        
#         doc.append("transport_material_type", {
#             "project": block_data.get("project"),
#             "item_type": block_data.get("item_type"), # Corrected from material_type
#             "block_number": block_num,
#             "item_number": block_num # Corrected from material_number
#         })
#         added_count += 1
    
#     if added_count > 0:
#         doc.save(ignore_permissions=True)
#         frappe.msgprint(_(f"{added_count} block(s) added to the table."))


############################################################### ################################################
# The above code is the original code with comments and some corrections.
# Below is the revised code with enhanced debugging and error handling for the get_items_for_selection function.
############################################################### ################################################

import frappe
import json
from frappe import _
from frappe.model.document import Document

class TransportationSender(Document):
    def validate(self):
        # ... your existing validation code ...
        pass

# @frappe.whitelist()
# def get_items_for_selection(project, item_type):
#     if not project or not item_type:
#         return []

#     items = []
#     if item_type == 'Block':
#         parent_doc_names = frappe.get_all(
#             "Block Selection",
#             filters={
#                 "baps_project": project,
#                 "docstatus": 1
#             },
#             pluck="name"
#         )

#         if not parent_doc_names:
#             return []

#         block_numbers = frappe.get_all(
#             "Block Selection Detail",
#             filters={
#                 "parent": ["in", parent_doc_names]
#             },
#             fields=["block_number"],
#             pluck="block_number"
#         )
#         items = [{"item_id": item} for item in set(block_numbers) if item]

#     return items
@frappe.whitelist()
def get_items_for_selection(project, item_type, from_site): # Add from_site as an argument
    if not project or not item_type or not from_site:
        return []

    items = []
    if item_type == 'Block':
        # Add the new 'trade_partner_site' filter to match the 'from_site'
        parent_doc_names = frappe.get_all(
            "Block Selection",
            filters={
                "baps_project": project,
                "trade_partner_site": from_site, # <-- ADD THIS NEW FILTER
                "docstatus": 0
            },
            pluck="name"
        )

        if not parent_doc_names:
            return []

        block_numbers = frappe.get_all(
            "Block Selection Detail",
            filters={
                "parent": ["in", parent_doc_names]
            },
            fields=["block_number"],
            pluck="block_number"
        )
        items = [{"item_id": item} for item in set(block_numbers) if item]

    return items

@frappe.whitelist()
def add_blocks_to_table(sender_name, blocks):
    # ... your existing function to add items ...
    pass




# this code is for preventing From Site and To Site being the same
class TransportationSender(Document):
    def validate(self):
        # Prevent From Site and To Site being the same
        if self.from_site and self.to_site and self.from_site == self.to_site:
            frappe.throw("From Site and To Site cannot be the same.")

#end of the code for preventing From Site and To Site being the same