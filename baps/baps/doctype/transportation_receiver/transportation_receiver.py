# Copyright (c) 2025, Dharmesh Rathod and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class TransportationReceiver(Document):
	pass

# import frappe
# from frappe import _

# def on_submit(self):
#     if self.transport_sender_reference:
#         sender = frappe.get_doc("Transportation Sender", self.transport_sender_reference)
#         sender.is_received = 1
#         sender.db_update()


# def on_cancel(self):
#     if self.transport_sender_reference:
#         sender = frappe.get_doc("Transportation Sender", self.transport_sender_reference)
#         sender.is_received = 0
#         sender.db_update()