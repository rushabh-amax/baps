# Copyright (c) 2025, Dharmesh Rathod and contributors
# For license information, please see license.txt

import frappe
import re
from frappe.model.document import Document

# # Default process → sub-process mapping
# PROCESS_MAP = {
#     # "Carving": [
#     #     "Nakashikam",
#     #     "Additional Nakashikam",
#     #     "Roopkam",
#     #     "Additional Roopkam",
#     #     "Machining"
#     # ],
#     # "Cutting": ["Cutting"],
#     # "Fixing": ["Dry Fixing", "Final Fixing"],
#     # "Packing": ["Packing"],
#     # "Polishing": ["Polishing"],
#     # "Shipping": ["Shipping"],
#     # "Machining": ["Roughing", "Finishing"]
# }

class BapsProject(Document):
    def validate(self):
        """Validate project_code format: exactly 2 uppercase letters."""
        self.validate_project_code()

    def validate_project_code(self):
        if not self.project_code:
            frappe.throw("Project Code is mandatory.")
        
        # Normalize: trim and uppercase
        self.project_code = self.project_code.strip().upper()
        
        # Must be exactly 2 uppercase letters (A-Z only)
        if not re.match(r"^[A-Z]{2}$", self.project_code):
            frappe.throw("Project Code must be exactly 2 uppercase letters (e.g. AB).")

    def after_insert(self):
        """
        Auto-populate process_details child table right after a new
        Baps Project document is created (inserted).
        """
        # Avoid double-populating — only populate if empty
        if self.get("process_details"):
            return

        for process, sub_processes in PROCESS_MAP.items():
            for sub in sub_processes:
                self.append("process_details", {
                    "process": process,
                    "sub_process": sub,
                    "completed": 0
                })

        # Save changes (only updates the existing doc)
        self.save(ignore_permissions=True)