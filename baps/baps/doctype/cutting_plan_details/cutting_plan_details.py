import frappe
from frappe.model.document import Document

class CuttingPlanDetails(Document):
    pass

# def validate(doc, method):
#     if not doc.block_code:
#         frappe.throw(_("Block Code is mandatory"))
#     if not doc.size_list_creation:
#         frappe.throw(_("Size List is mandatory"))
#     if not doc.cutting_plan_details:
#         frappe.throw(_("At least one final plan detail is required"))

    # total = 0
    # for d in doc.cutting_plan_details:
    #     if d.length and d.width and d.height and d.quantity:
    #         d.volume = round(d.length * d.width * d.height, 3)
    #         total += d.volume * d.quantity
    # doc.total_planned_volume = round(total, 3)