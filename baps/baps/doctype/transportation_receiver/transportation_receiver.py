
# import frappe
# from frappe import _
# from frappe.model.document import Document

# class TransportationReceiver(Document):
#     def validate(self):
#         self.validate_gate_pass_no_usage()

#     def validate_gate_pass_no_usage(self):
#         if not self.gate_pass_no:
#             return

#         # Check if this Gate Pass No is already used in any submitted Transportation Receiver (excluding self)
#         existing_receiver = frappe.db.exists(
#             "Transportation Receiver",
#             {
#                 "gate_pass_no": self.gate_pass_no,
#                 "name": ["!=", self.name],
#                 "docstatus": 1
#             }
#         )

#         if existing_receiver:
#             frappe.throw(
#                 _("Gate Pass No {0} is already used in Transportation Receiver {1}. Please select a different one.").format(
#                     self.gate_pass_no, existing_receiver
#                 )
#             )

#         # Check if used in any submitted Transportation Sender
#         existing_sender = frappe.db.exists(
#             "Transportation Sender",
#             {
#                 "gate_pass_no": self.gate_pass_no,
#                 "docstatus": 1
#             }
#         )

#         if existing_sender:
#             frappe.throw(
#                 _("Gate Pass No {0} is already used in Transportation Sender {1}. Please select a different one.").format(
#                     self.gate_pass_no, existing_sender
#                 )
#             )

##################################################################################
# Revised Code as per new requirements
##################################################################################
import frappe
from frappe.model.document import Document

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
            "item_number": row.item_number,
            # "status": "Received"
        })

    return data