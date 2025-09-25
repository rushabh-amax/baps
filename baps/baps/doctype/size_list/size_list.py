# import frappe
# from frappe import _
# from frappe.model.document import Document

# class SizeList(Document):
#     pass


# def autoname(doc, method):
#     if frappe.db.exists("Size List Creation", {"form_number": doc.form_number}):
#         frappe.throw(_("Form No must be unique"))
#     doc.name = doc.form_number


# def validate(doc, method):
#     total = 0
#     new_stone_details = []

#     # 🔹 Fetch linked Baps Project (if any)
#     project_chemical = 0
#     project_dry_fitting = 0
#     if doc.baps_project:
#         project = frappe.get_doc("Baps Project", doc.baps_project)
#         project_chemical = 1 if project.chemical else 0
#         project_dry_fitting = 1 if project.dry_fitting else 0

#     for d in doc.stone_details:
#         # --- Validation: l2, b2, h2 must be less than 12 ---
#         if (d.l2 or 0) >= 12:
#             frappe.throw(_("L2 (inches) must be less than 12 in row {0}").format(d.idx))
#         if (d.b2 or 0) >= 12:
#             frappe.throw(_("B2 (inches) must be less than 12 in row {0}").format(d.idx))
#         if (d.h2 or 0) >= 12:
#             frappe.throw(_("H2 (inches) must be less than 12 in row {0}").format(d.idx))

#         # --- Apply project checkboxes to child rows ---
#         if project_chemical:
#             d.chemical = 1
#         # else: keep whatever user set

#         if project_dry_fitting:
#             d.dry_fitting = 1
#         # else: keep whatever user set

#         # --- Handle Range Expansion ---
#         if d.range:
#             numbers = []

#             if "-" in d.range:
#                 try:
#                     start, end = d.range.split("-")
#                     start, end = int(start), int(end)
#                 except Exception:
#                     frappe.throw(_("Invalid range format in row {0}. Use like 001-003").format(d.idx))

#                 if start > end:
#                     frappe.throw(_("Range start cannot be greater than end in row {0}").format(d.idx))

#                 numbers = [i for i in range(start, end + 1)]

#             elif "," in d.range:
#                 try:
#                     numbers = [int(x.strip()) for x in d.range.split(",") if x.strip()]
#                 except Exception:
#                     frappe.throw(_("Invalid list format in row {0}. Use like 001,002,005").format(d.idx))

#             else:
#                 frappe.throw(_("Invalid range/list format in row {0}. Use like 001-003 or 001,002,005").format(d.idx))

#             prefix = d.stone_code or (d.stone_name or "").upper()

#             for i in numbers:
#                 new_row = {
#                     "stone_name": d.stone_name,
#                     "stone_code": f"{prefix}{i:03d}",
#                     "l1": d.l1, "l2": d.l2,
#                     "b1": d.b1, "b2": d.b2,
#                     "h1": d.h1, "h2": d.h2,
#                     "chemical": d.chemical,
#                     "dry_fitting": d.dry_fitting
#                 }

#                 # Calculate volume
#                 l = (new_row["l1"] or 0) + (new_row["l2"] or 0) / 12
#                 b = (new_row["b1"] or 0) + (new_row["b2"] or 0) / 12
#                 h = (new_row["h1"] or 0) + (new_row["h2"] or 0) / 12
#                 new_row["volume"] = round(l * b * h, 3)

#                 total += new_row["volume"]
#                 new_stone_details.append(new_row)

#         else:
#             # --- Normal row ---
#             l = (d.l1 or 0) + (d.l2 or 0) / 12
#             b = (d.b1 or 0) + (d.b2 or 0) / 12
#             h = (d.h1 or 0) + (d.h2 or 0) / 12
#             d.volume = round(l * b * h, 3)
#             total += d.volume
#             new_stone_details.append(d.as_dict())

#     # --- Replace child table with expanded rows ---
#     doc.stone_details = []
#     for row in new_stone_details:
#         doc.append("stone_details", row)

#     doc.total_volume = round(total, 3)

import frappe
from frappe import _
from frappe.model.document import Document

class SizeList(Document):
    pass


def autoname(doc, method):
    if frappe.db.exists("Size List Creation", {"form_number": doc.form_number}):
        frappe.throw(_("Form No must be unique"))
    doc.name = doc.form_number


def validate(doc, method):
    total = 0
    new_stone_details = []

    # 🔹 Fetch linked Baps Project (if any)
    project_chemical = 0
    project_dry_fitting = 0
    if doc.baps_project:
        project = frappe.get_doc("Baps Project", doc.baps_project)
        project_chemical = 1 if project.chemical else 0
        project_dry_fitting = 1 if project.dry_fitting else 0

    for d in doc.stone_details:
        # --- Validation: l2, b2, h2 must be less than 12 ---
        if (d.l2 or 0) >= 12:
            frappe.throw(_("L2 (inches) must be less than 12 in row {0}").format(d.idx))
        if (d.b2 or 0) >= 12:
            frappe.throw(_("B2 (inches) must be less than 12 in row {0}").format(d.idx))
        if (d.h2 or 0) >= 12:
            frappe.throw(_("H2 (inches) must be less than 12 in row {0}").format(d.idx))

        # --- Apply project checkboxes to child rows (always override) ---
        if project_chemical:
            d.chemical = 1
        if project_dry_fitting:
            d.dry_fitting = 1

        # --- Handle Range Expansion ---
        if d.range:
            numbers = []

            if "-" in d.range:
                try:
                    start, end = d.range.split("-")
                    start, end = int(start), int(end)
                except Exception:
                    frappe.throw(_("Invalid range format in row {0}. Use like 001-003").format(d.idx))

                if start > end:
                    frappe.throw(_("Range start cannot be greater than end in row {0}").format(d.idx))

                numbers = [i for i in range(start, end + 1)]

            elif "," in d.range:
                try:
                    numbers = [int(x.strip()) for x in d.range.split(",") if x.strip()]
                except Exception:
                    frappe.throw(_("Invalid list format in row {0}. Use like 001,002,005").format(d.idx))

            else:
                frappe.throw(_("Invalid range/list format in row {0}. Use like 001-003 or 001,002,005").format(d.idx))

            prefix = d.stone_code or (d.stone_name or "").upper()

            for i in numbers:
                new_row = {
                    "stone_name": d.stone_name,
                    "stone_code": f"{prefix}{i:03d}",
                    "l1": d.l1, "l2": d.l2,
                    "b1": d.b1, "b2": d.b2,
                    "h1": d.h1, "h2": d.h2,
                    "chemical": 1 if project_chemical else d.chemical,
                    "dry_fitting": 1 if project_dry_fitting else d.dry_fitting
                }

                # Calculate volume
                l = (new_row["l1"] or 0) + (new_row["l2"] or 0) / 12
                b = (new_row["b1"] or 0) + (new_row["b2"] or 0) / 12
                h = (new_row["h1"] or 0) + (new_row["h2"] or 0) / 12
                new_row["volume"] = round(l * b * h, 3)

                total += new_row["volume"]
                new_stone_details.append(new_row)

        else:
            # --- Normal row ---
            l = (d.l1 or 0) + (d.l2 or 0) / 12
            b = (d.b1 or 0) + (d.b2 or 0) / 12
            h = (d.h1 or 0) + (d.h2 or 0) / 12
            d.volume = round(l * b * h, 3)
            total += d.volume
            new_stone_details.append(d.as_dict())

    # --- Replace child table with expanded rows ---
    doc.stone_details = []
    for row in new_stone_details:
        doc.append("stone_details", row)

    doc.total_volume = round(total, 3)
