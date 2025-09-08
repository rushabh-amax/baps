# Copyright (c) 2025, Dharmesh Rathod and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class TransportationSender(Document):
	pass
# import frappe
# from frappe import _

# def validate(self, method):
#     if self.is_received:
#         frappe.throw(_("Cannot edit Transport Sender after receiver confirms."))


# def on_submit(self):
#     # Mark as submitted
#     pass


# def on_cancel(self):
#     # Optional: reset receiver if needed
#     pass