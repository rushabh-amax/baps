import frappe
from frappe.model.document import Document

class TransportationReceiver(Document):
##################################################################################
#this below method is added to validate the status field in the child table
##################################################################################
    
    def validate(self):
        """
        This method is triggered automatically when the document is saved.
        """
        # Check if there are any items in the child table to validate.
        if not self.transportation_status_r:
            # If the table is empty, there's nothing to check, so we can stop.
            return

        # Loop through each row in the 'transportation_status_r' child table.
        for item_row in self.transportation_status_r:
            # Check if the 'status' field for the current row is empty.
            if not item_row.status:
                # If a status is missing, stop the save and show an error message.
                # The message includes the row number (item_row.idx) to help the user.
                frappe.throw(
                    ("Please select a status for row #{0} in the items table before saving.").format(item_row.idx),
                    title=("Missing Status")
                )

###############################################################################
# This below method fetches details from Transportation Sender based on Gate Pass No
###############################################################################
@frappe.whitelist()
def fetch_sender_details(gate_pass_no):
    """Fetch Transportation Sender details for given Gate Pass"""
    sender = frappe.get_doc("Transportation Sender",{"gate_pass_no": gate_pass_no})
    if not sender:
        frappe.throw(f"No Transportation Sender found for GatePass {gate_pass_no}")
    data = {
        "gate_pass_bookno": sender.gate_pass_bookno,
        "from_site": sender.from_site,
        "to_site": sender.to_site,
        "baps_project": sender.baps_project,
        "item_type": sender.item_type,
        "items": []
    }
    for row in sender.transport_items:
        data["items"].append({
            "baps_project": sender.baps_project,
            "item_type": row.item_type,
            "item_no": row.item_no,
            # "status": "Received"
        })
    return data





# ----------------------------------------------------------------------------------------
# fecth 

# tr.r.py

# import frappe
# from frappe.model.document import Document

class TransportationReceiver(Document):
    pass

@frappe.whitelist()
def fetch_sender_details(gate_pass_no):
    """Fetch Transportation Sender details for given Gate Pass"""
    sender = frappe.get_doc("Transportation Sender", {"gate_pass_no": gate_pass_no})

    if not sender:
        frappe.throw(f"No Transportation Sender found for Gate Pass {gate_pass_no}")

    data = {
        "gate_pass_bookno": sender.gate_pass_bookno,
        "from_site": sender.from_site,
        "to_site": sender.to_site,
        "baps_project": sender.baps_project,
        "item_type": sender.item_type,
        "items": []
    }

    for row in sender.transport_items:
        data["items"].append({
            "baps_project": sender.baps_project,
            "item_type": row.item_type,
            "item_no": row.item_no,
            # "status": "Received"
        })

    return data