# # import frappe
# # import json
# # from frappe import _
# # from frappe.model.document import Document

# # class Transportation(Document):
# #     def validate(self):
# #         self.validate_gate_pass_no_usage()

# #     def validate_gate_pass_no_usage(self):
# #         if not self.gate_pass_no:
# #             return

# #         # Check if this Gate Pass No is already used in any submitted Transportation Sender (excluding self)
# #         existing_sender = frappe.db.exists(
# #             "Transportation Sender",
# #             {
# #                 "gate_pass_no": self.gate_pass_no,
# #                 "name": ["!=", self.name],
# #                 "docstatus": 1
# #             }
# #         )

# #         if existing_sender:
# #             frappe.throw(
# #                 _("Gate Pass No {0} is already used in Transportation Sender {1}. Please select a different one.").format(
# #                     self.gate_pass_no, existing_sender
# #                 )
# #             )

# #         # Check if used in any submitted Transportation Receiver
# #         existing_receiver = frappe.db.exists(
# #             "Transportation Receiver",
# #             {
# #                 "gate_pass_no": self.gate_pass_no,
# #                 "docstatus": 1
# #             }
# #         )

# #         if existing_receiver:
# #             frappe.throw(
# #                 _("Gate Pass No {0} is already used in Transportation Receiver {1}. Please select a different one.").format(
# #                     self.gate_pass_no, existing_receiver
# #                 )
# #             )

# # @frappe.whitelist()
# # def get_blocks_for_project(project):
# #     block_numbers = []
# #     block_selections = frappe.get_all("Block Selection", filters={"baps_project": project}, fields=["name"])
# #     for bs in block_selections:
# #         details = frappe.get_all("Block Selection Detail", filters={"parent": bs.name}, fields=["block_number"])
# #         for d in details:
# #             if d.block_number:
# #                 block_numbers.append({"block_number": d.block_number})

# #     # Deduplicate
# #     seen = set()
# #     unique_blocks = []
# #     for block in block_numbers:
# #         if block["block_number"] not in seen:
# #             seen.add(block["block_number"])
# #             unique_blocks.append(block)

# #     return unique_blocks

# # @frappe.whitelist()
# # def add_blocks_to_table(sender_name, blocks):
# #     if isinstance(blocks, str):
# #         try:
# #             blocks = json.loads(blocks)
# #         except json.JSONDecodeError:
# #             frappe.throw(_("Invalid format for blocks. Expected a valid JSON list."))

# #     if not isinstance(blocks, list):
# #         frappe.throw(_("Blocks must be a list of block data."))

# #     doc = frappe.get_doc("Transportation Sender", sender_name)
# #     existing = [row.block_number for row in doc.transport_material_type]

# #     added_count = 0
# #     for block_data in blocks:
# #         block_num = block_data.get("block_number")
# #         if not block_num or block_num in existing:
# #             continue

# #         doc.append("transport_material_type", {
# #             "project": block_data.get("project"),
# #             "material_type": block_data.get("material_type"),
# #             "block_number": block_num,
# #             "material_number": block_num
# #         })
# #         added_count += 1

# #     doc.save(ignore_permissions=True)
# #     frappe.msgprint(_(f"{added_count} block(s) added to material table."))


# # transportation.py

# # import frappe
# # import json
# # from frappe import _
# # from frappe.model.document import Document

# # class Transportation(Document):
# #     def validate(self):
# #         self.validate_gate_pass_no_usage()

# #     def validate_gate_pass_no_usage(self):
# #         # ... (your existing validation code, no changes needed here)
# #         if not self.gate_pass_no:
# #             return
# #         existing_sender = frappe.db.exists(
# #             "Transportation Sender",1
# #             {"gate_pass_no": self.gate_pass_no, "name": ["!=", self.name], "docstatus": 1}
# #         )
# #         if existing_sender:
# #             frappe.throw(
# #                 _("Gate Pass No {0} is already used in Transportation Sender {1}. Please select a different one.").format(
# #                     self.gate_pass_no, existing_sender
# #                 )
# #             )
# #         existing_receiver = frappe.db.exists(
# #             "Transportation Receiver",
# #             {"gate_pass_no": self.gate_pass_no, "docstatus": 1}
# #         )
# #         if existing_receiver:
# #             frappe.throw(
# #                 _("Gate Pass No {0} is already used in Transportation Receiver {1}. Please select a different one.").format(
# #                     self.gate_pass_no, existing_receiver
# #                 )
# #             )
# # # @frappe.whitelist()
# # # def get_items_for_selection(project, item_type):
# # #     """
# # #     MODIFIED: This function now fetches items based on both project and item_type.
# # #     It's now scalable for different item types like 'Stone', 'Box', etc.
# # #     """
# # #     if not project or not item_type:
# # #         return []

# # #     items = []
# # #     if item_type == 'Block':
# # #         # Step 1: Find all parent 'Block Selection' documents that match the project
# # #         # and are in the 'submitted' state (docstatus=1).
# # #         parent_doc_names = frappe.get_all(
# # #             "Block Selection",
# # #             filters={
# # #                 "baps_project": project,
# # #                 "docstatus": 1  # <-- THIS IS THE ONLY CHANGE NEEDED
# # #             },
# # #             pluck="name"
# # #         )

# # #         if not parent_doc_names:
# # #             return []

# # #         # Step 2: Use the list of parent names to fetch the 'block_number' from the child table.
# # #         block_numbers = frappe.get_all(
# # #             "Block Selection Detail",
# # #             filters={
# # #                 "parent": ["in", parent_doc_names]
# # #             },
# # #             fields=["block_number"],
# # #             pluck="block_number"
# # #         )

# # #         items = [{"item_id": item} for item in set(block_numbers) if item]

# # #     # LATER: You can add logic for other item types here
# # #     # elif item_type == 'Stone':
# # #     #     # ... your logic to fetch stones ...
# # #     #     # items = [{"item_id": "Stone001"}, {"item_id": "Stone002"}]
    
# # #     return items

# # @frappe.whitelist(allow_guest=True) # allow_guest helps with testing
# # def get_items_for_selection(project, item_type):
# #     # This dictionary will store a report of what happens at each step
# #     debug_report = {}

# #     if not project or not item_type:
# #         debug_report['error'] = "Step 0 FAILED: Project or Item Type not received."
# #         return debug_report

# #     items = []
# #     if item_type == 'Block':
# #         # Step 1: Find the parent document
# #         parent_doc_names = frappe.get_all(
# #             "Block Selection",
# #             filters={
# #                 "baps_project": project,
# #                 "docstatus": 1
# #             },
# #             pluck="name"
# #         )
# #         debug_report['step1_found_parents'] = parent_doc_names

# #         if parent_doc_names:
# #             # Step 2: Find the child items using the parents from step 1
# #             block_numbers = frappe.get_all(
# #                 "Block Selection Detail",
# #                 filters={"parent": ["in", parent_doc_names]},
# #                 fields=["block_number"],
# #                 pluck="block_number"
# #             )
# #             debug_report['step2_found_blocks'] = block_numbers
# #             items = [{"item_id": item} for item in set(block_numbers) if item]
# #         else:
# #             debug_report['step2_found_blocks'] = "Skipped, because no parent documents were found in Step 1."

# #     debug_report['step3_final_items_sent'] = items
    
# #     # We return the entire report to the browser
# #     return debug_report

# # @frappe.whitelist()
# # def add_blocks_to_table(sender_name, blocks):
# #     # ... (your existing function, no changes needed for now)
# #     if isinstance(blocks, str):
# #         try:
# #             blocks = json.loads(blocks)
# #         except json.JSONDecodeError:
# #             frappe.throw(_("Invalid format for blocks. Expected a valid JSON list."))
# #     if not isinstance(blocks, list):
# #         frappe.throw(_("Blocks must be a list of block data."))

# #     doc = frappe.get_doc("Transportation Sender", sender_name)
# #     # NOTE: Your child table seems to be 'transport_material_type', not 'transport_items'.
# #     # I am using 'transport_material_type' based on your code.
# #     existing = [row.block_number for row in doc.get("transport_material_type", [])]

# #     added_count = 0
# #     for block_data in blocks:
# #         block_num = block_data.get("block_number")
# #         if not block_num or block_num in existing:
# #             continue
        
# #         doc.append("transport_material_type", {
# #             "project": block_data.get("project"),
# #             "item_type": block_data.get("item_type"), # Corrected from material_type
# #             "block_number": block_num,
# #             "item_number": block_num # Corrected from material_number
# #         })
# #         added_count += 1
    
# #     if added_count > 0:
# #         doc.save(ignore_permissions=True)
# #         frappe.msgprint(_(f"{added_count} block(s) added to the table."))


# ############################################################### ################################################
# # The above code is the original code with comments and some corrections.
# # Below is the revised code with enhanced debugging and error handling for the get_items_for_selection function.
# ############################################################### ################################################

# import frappe
# import json
# from frappe import _
# from frappe.model.document import Document
# ##########################################################################
# ##this code is for preventing duplicate the From site and To Site
# ##########################################################################
# class Transportation(Document):
#     def validate(self):
#         self.validate_gate_pass_usage()
#         # this code is for preventing From Site and To Site being the same
#          # Prevent From Site and To Site being the same
#         if self.from_site and self.to_site and self.from_site == self.to_site:
#             frappe.throw("From Site and To Site cannot be the same.")
#             #end of the code for preventing From Site and To Site being the same

# #############################################################################
# # this code is for preventing duplicate Gate Pass No and Gate Pass Book No combination
# #############################################################################
#     def validate_gate_pass_usage(self):
#         # Do nothing if either of the fields is empty
#         if not self.gate_pass_no or not self.gate_pass_bookno:
#             return

#         # Check if another document already exists with the same combination
#         existing_sender = frappe.db.exists("Transportation", {
#             "gate_pass_bookno": self.gate_pass_bookno,
#             "gate_pass_no": self.gate_pass_no,
#             # This is important: exclude the current document from the check
#             "name": ["!=", self.name]
#         })

#         # If a document was found, stop the save and show an error
#         if existing_sender:
#             frappe.throw(
#                 _("The combination of Gate Pass Book '{0}' and Gate Pass No '{1}' has already been used in Sender document {2}.")
#                 .format(self.gate_pass_bookno, self.gate_pass_no, existing_sender),
#                 title=_("Duplicate Combination")
#             )

#         # If a document was found, stop the save and show an error
#         # if existing_sender:
#         #     frappe.throw(
#         #         _("The combination of Gate Pass Book '{0}' and Gate Pass No '{1}' has already been used in Sender document {2}.")
#         #         .format(self.gate_pass_bookno, self.gate_pass_no, existing_sender),
#         #         title=_("Duplicate Combination")
#         #     )
            
# ###############################################################################
# # this code is for fetching items based on project, item type, and from_site
# ###############################################################################
#     @frappe.whitelist()
#     def get_items_for_selection(project, item_type, from_site): # Add from_site as an argument
#         if not project or not item_type or not from_site:
#             return []

#         items = []
#         if item_type == 'Block':
#             # Add the new 'trade_partner_site' filter to match the 'from_site'
#             parent_doc_names = frappe.get_all(
#                 "Block Selection",
#                 filters={
#                     "baps_project": project,
#                     "trade_partner_site": from_site, # <-- ADD THIS NEW FILTER
#                     "docstatus": 0
#                 },
#                 pluck="name"
#             )

#             if not parent_doc_names:
#                 return []

#             block_numbers = frappe.get_all(
#                 "Block Selection Detail",
#                 filters={
#                     "parent": ["in", parent_doc_names]
#                 },
#                 fields=["block_number"],
#                 pluck="block_number"
#             )
#             items = [{"item_id": item} for item in set(block_numbers) if item]

#         return items

#     # @frappe.whitelist()
#     # def add_blocks_to_table(sender_name, blocks):
#     #     # ... your existing function to add items ...
#     #     pass
    
#     # @frappe.whitelist()
#     # @frappe.validate_and_sanitize_search_inputs
#     # def get_available_gate_passes(doctype, txt, searchfield, start, page_len, filters):
#     #     # Step 1: Find all Gate Pass numbers that have ALREADY been used
#     #     used_gate_passes = frappe.get_all(
#     #         "Transportation Sender",
#     #         fields=["gate_pass_no"],
#     #         filters={"docstatus": ["!=", 2]}, # Exclude cancelled documents
#     #         pluck="gate_pass_no"
#     #     )

#     #     # Step 2: Define the conditions for the search
#     #     conditions = [
#     #         # Filter by the selected Gate Pass Book, which is passed from the client script
#     #         ["gate_pass_book_no", "=", filters.get("gate_pass_book_no")],
#     #         # Show only passes that are NOT in the 'used_gate_passes' list
#     #         ["name", "not in", used_gate_passes]
#     #     ]

#     #     # Step 3: Search the "Gate Pass" DocType with the above conditions
#     #     return frappe.db.get_list(
#     #         "Gate Pass",
#     #         fields=["name", "gate_pass_display_no"], # Show both the unique ID and the display number
#     #         filters=conditions,
#     #         or_filters=[["name", "like", f"%{txt}%"], ["gate_pass_display_no", "like", f"%{txt}%"]],
#     #         start=start,
#     #         page_length=page_len,
#     #         as_list=True,
#     #     )

#     # This new function must be OUTSIDE the class, with no indentation.
# # The @frappe.whitelist() allows it to be called from the client script.
# @frappe.whitelist()
# @frappe.validate_and_sanitize_search_inputs
# def get_available_gate_passes(doctype, txt, searchfield, start, page_len, filters):
# 	# Step 1: Find all Gate Pass numbers that have ALREADY been used
# 	used_gate_passes = frappe.get_all(
# 		"Transportation",
# 		fields=["gate_pass_no"],
# 		filters={"docstatus": ["!=", 2]}, # Exclude cancelled documents
# 		pluck="gate_pass_no"
# 	)

# 	# Step 2: Define the conditions for the search
# 	conditions = [
# 		# Filter by the selected Gate Pass Book, which is passed from the client script
# 		["gate_pass_book_no", "=", filters.get("gate_pass_book_no")],
# 		# Show only passes that are NOT in the 'used_gate_passes' list
# 		["name", "not in", used_gate_passes or ['']] # Use [''] to prevent error on empty list
# 	]

# 	# Step 3: Search the "Gate Pass" DocType with the above conditions
# 	return frappe.db.get_list(
# 		"Gate Pass",
# 		fields=["name", "gate_pass_display_no"], # Show both the unique ID and the display number
# 		filters=conditions,
# 		or_filters=[["name", "like", f"%{txt}%"], ["gate_pass_display_no", "like", f"%{txt}%"]],
# 		start=start,
# 		page_length=page_len,
# 		as_list=True,
# 	)

# #################################################################
# #This one will find all the available books.
# #################################################################
# # === ADD THIS NEW FUNCTION AT THE END OF THE FILE ===
# # Make sure it is outside the Transportation class, with no indentation

# @frappe.whitelist()
# @frappe.validate_and_sanitize_search_inputs
# def get_available_gate_pass_books(doctype, txt, searchfield, start, page_len, filters):
#     # Step 1: Get a list of all Gate Pass numbers that are already used.
#     used_passes = frappe.get_all(
#         "Transportation",
#         fields=["gate_pass_no"],
#         filters={"docstatus": ["!=", 2]}, # Exclude cancelled documents
#         pluck="gate_pass_no"
#     )

#     # Step 2: Find all Gate Pass Books that have at least one pass NOT in the used list.
#     # The distinct=True ensures we get each book name only once.
#     available_books = frappe.get_all(
#         "Gate Pass",
#         fields=["gate_pass_book_no"],
#         filters=[
#             ["name", "not in", used_passes or ['']]
#         ],
#         pluck="gate_pass_book_no",
#         distinct=True
#     )

#     # Step 3: Create the final filter for the Gate Pass Book dropdown.
#     # It will only show books that were found in the 'available_books' list.
#     book_filters = [
#         ["name", "in", available_books or ['']],
#         ["name", "like", f"%{txt}%"]
#     ]

#     return frappe.db.get_list(
#         "Gate Pass Book",
#         fields=["name"],
#         filters=book_filters,
#         start=start,
#         page_length=page_len,
#         as_list=True,
#     )

# # This function fetches the full name of a user based on their email (user_id).
# # frappe.whitelist()
# # def get_user_full_name(user_id):
# #     """
# #     Returns the full_name of a User given their email (user_id).
# #     """
# #     # frappe.db.get_value is a highly efficient way to fetch a single field value.
# #     return frappe.db.get_value("User", user_id, "full_name")

import frappe
from frappe import _
from frappe.model.document import Document

class Transportation(Document):
    def validate(self):
        """
        Runs before save.
        """
        self.validate_gate_pass_usage()
        self.validate_sites()
        
        # Updated workflow logic
        self.update_child_block_statuses()
        self.update_parent_transportation_status()

    def validate_sites(self):
        """
        Prevent From Site and To Site being the same.
        """
        if self.from_site and self.to_site and self.from_site == self.to_site:
            frappe.throw(_("From Site and To Site cannot be the same."))

    def validate_gate_pass_usage(self):
        """
        Prevent duplicate Gate Pass No and Gate Pass Book No combination.
        """
        if not self.gate_pass_no or not self.gate_pass_bookno:
            return

        existing_sender = frappe.db.exists("Transportation", {
            "gate_pass_bookno": self.gate_pass_bookno,
            "gate_pass_no": self.gate_pass_no,
            "name": ["!=", self.name]
        })

        if existing_sender:
            frappe.throw(
                _("The combination of Gate Pass Book '{0}' and Gate Pass No '{1}' has already been used in document {2}.")
                .format(self.gate_pass_bookno, self.gate_pass_no, existing_sender),
                title=_("Duplicate Combination")
            )

    def update_child_block_statuses(self):
        """
        MODIFIED: Now also updates the 'site' field for received blocks.
        """
        if not self.transport_item:
            return

        block_names_to_update = {
            "in_transit": [],
            "can_transit": [],
            "update_site_location": []
        }
        
        for row in self.transport_item:
            if not row.item_no:
                continue
            
            if not row.status:
                # New item, set to In Transit
                block_names_to_update["in_transit"].append(row.item_no)
                
            elif row.status == "Received":
                # Item is received, set to Can Transit
                block_names_to_update["can_transit"].append(row.item_no)
                
                # If status is "Received", add this block to the list
                # of blocks that need their site updated.
                block_names_to_update["update_site_location"].append(row.item_no)
                
            elif row.status in ["Not in this", "Send to site"]:
                # Item is not received but processed, set/keep as In Transit
                block_names_to_update["in_transit"].append(row.item_no)
        
        
        # --- Perform bulk updates for 'transportation_status' (Existing Logic) ---
        if block_names_to_update["in_transit"]:
            frappe.db.set_value(
                "Block", 
                {"name": ["in", list(set(block_names_to_update["in_transit"])) ]}, 
                "transportation_status", 
                "In Transit"
            )

        if block_names_to_update["can_transit"]:
            frappe.db.set_value(
                "Block", 
                {"name": ["in", list(set(block_names_to_update["can_transit"])) ]}, 
                "transportation_status", 
                "Can Transit"
            )
            
        # --- NEW LOGIC: Perform bulk update for 'site' ---
        # Only run if the 'to_site' field is set and we have blocks to update.
        if self.to_site and block_names_to_update["update_site_location"]:
            frappe.db.set_value(
                "Block",  # Doctype to update
                {"name": ["in", list(set(block_names_to_update["update_site_location"])) ]}, # Filters
                "site",  # Field to update
                self.to_site  # The new value
            )


    def update_parent_transportation_status(self):
        """
        Calculates the master 'status' of this Transportation doc
        based on the precise "Full Received" vs "Partially Received" logic.
        """
        if not self.transport_item:
            self.status = "Pending To Receive"
            return

        total_rows = len(self.transport_item)
        received_count = 0
        processed_count = 0

        for row in self.transport_item:
            if row.status == "Received":
                received_count += 1
                processed_count += 1
            elif row.status in ["Not in this", "Send to site"]:
                processed_count += 1
            
        if processed_count == 0:
            self.status = "Pending To Receive"
        elif processed_count < total_rows:
            self.status = "Partially Received"
        elif processed_count == total_rows:
            if received_count == total_rows:
                self.status = "Full Received"
            else:
                self.status = "Partially Received"


# ==============================================================================
# WHITELISTED FUNCTIONS (Called from Client Script)
# ==============================================================================

@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_available_gate_passes(doctype, txt, searchfield, start, page_len, filters):
    used_gate_passes = frappe.get_all(
        "Transportation",
        fields=["gate_pass_no"],
        filters={"docstatus": ["!=", 2]},
        pluck="gate_pass_no"
    )

    conditions = [
        ["gate_pass_book_no", "=", filters.get("gate_pass_book_no")],
        ["name", "not in", used_gate_passes or ['']]
    ]

    return frappe.db.get_list(
        "Gate Pass",
        fields=["name", "gate_pass_display_no"],
        filters=conditions,
        or_filters=[["name", "like", f"%{txt}%"], ["gate_pass_display_no", "like", f"%{txt}%"]],
        start=start,
        page_length=page_len,
        as_list=True,
    )

@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_available_gate_pass_books(doctype, txt, searchfield, start, page_len, filters):
    used_passes = frappe.get_all(
        "Transportation",
        fields=["gate_pass_no"],
        filters={"docstatus": ["!=", 2]},
        pluck="gate_pass_no"
    )

    available_books = frappe.get_all(
        "Gate Pass",
        fields=["gate_pass_book_no"],
        filters=[
            ["name", "not in", used_passes or ['']]
        ],
        pluck="gate_pass_book_no",
        distinct=True
    )

    book_filters = [
        ["name", "in", available_books or ['']],
        ["name", "like", f"%{txt}%"]
    ]

    # --- THIS IS THE FIX ---
    # This line applies the 'assigned_to' filter that your client script sends.
    if filters and filters.get('assigned_to'):
        book_filters.append(["assigned_to", "=", filters.get('assigned_to')])
    # --- END OF FIX ---

    return frappe.db.get_list(
        "Gate Pass Book",
        fields=["name"],
        filters=book_filters,
        start=start,
        page_length=page_len,
        as_list=True,
    )