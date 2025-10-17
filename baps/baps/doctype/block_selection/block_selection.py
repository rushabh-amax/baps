# Copyright (c) 2025, Shruti and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

def generate_block_prefix(project_name, trade_partner):
    """Generate a prefix code from Project Name + Trade Partner"""
    # Project code: first letters of each word
    project_code = "".join([w[0].upper() for w in (project_name or "").split() if w])
    # Trade Partner code: first letters of each word
    partner_code = "".join([w[0].upper() for w in (trade_partner or "").split() if w])
    # Combine
    return project_code + partner_code

class BlockSelection(Document):
    
    def validate(self):
        """Ensure numbering, volume calculation, and validation before saving"""
        seq = 1
        total = 0.0

        for row in (self.block_selection_details or []):
            # Auto-generate block number if missing
            if not row.block_number:
                row.block_number = str(seq).zfill(3)
            seq += 1

            # Calculate volume (ft/inch conversion)
            l = (row.l1 or 0) + (row.l2 or 0) / 12.0
            b = (row.b1 or 0) + (row.b2 or 0) / 12.0
            h = (row.h1 or 0) + (row.h2 or 0) / 12.0
            row.volume = round(l * b * h, 3)

            # ✅ Check for 0 or invalid volume
            if not row.volume or row.volume <= 0:
                frappe.throw(
                    f'Block "{row.block_number or seq}" has 0 or invalid volume. '
                    'Please enter valid L, B, and H values before saving.'
                )

            total += row.volume

        # Save total volume to parent if field exists
        if hasattr(self, 'total_volume'):
            self.total_volume = round(total, 3)

    def on_update(self):
        """Auto-create Block documents when updating"""
        self.create_blocks_from_details()

    def on_update_after_submit(self):
        """Mark linked Block Stone Receipt Items as Selected"""
        for d in (self.block_selection_details or []):
            frappe.db.set_value("Block Stone Receipt Item", d.block_number, "block_status", "Selected")

    def create_blocks_from_details(self):
        """Create Block docs from Block Selection child rows"""
        if not self.block_selection_details:
            return

        prefix = generate_block_prefix(self.project_name, self.trade_partner)

        for row in self.block_selection_details:
            if not row.block_number:
                continue

            if frappe.db.exists("Block", {"block_number": row.block_number}):
                continue  # Skip if already exists

            # Auto-generate block_custom_code as PREFIX + block_number
            block_custom_code = f"{prefix}{row.block_number}"

            block_doc = frappe.get_doc({
                "doctype": "Block",
                "block_number": row.block_number,
                "date": self.date,
                "baps_project": self.baps_project,
                "project_name": self.project_name,
                "trade_partner": self.trade_partner,
                "party": self.party,
                "material_type": self.material_type,
                "status": "Available",
                "colour": getattr(row, 'colour', None),
                "grain": getattr(row, 'grain', None),
                "l1": getattr(row, 'l1', None),
                "l2": getattr(row, 'l2', None),
                "b1": getattr(row, 'b1', None),
                "b2": getattr(row, 'b2', None),
                "h1": getattr(row, 'h1', None),
                "h2": getattr(row, 'h2', None),
                "wt": getattr(row, 'wt', None),
                "volume": getattr(row, 'volume', None),
                "block_custom_code": block_custom_code,
            })
            block_doc.insert(ignore_permissions=True)


@frappe.whitelist()
def get_last_block_number(trade_partner, project_name, current_docname=None):
    """Get the last generated block number for a Trade Partner + Project"""
    filters = {
        "trade_partner": trade_partner,
        "project_name": project_name,
        "docstatus": ["!=", 2]  # exclude cancelled
    }

    if current_docname:
        filters["name"] = ["!=", current_docname]

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