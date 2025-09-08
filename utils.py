# import frappe
# users = frappe.get_all("User", filters={"enabled": 1}, pluck="name")

# for name in users:
#     if name not in ["Administrator", "Guest"]:
#         doc = frappe.get_doc("User", name)
#         doc.redirect_url = "/app/modules"
#         doc.save()

# frappe.db.commit()
# print(f"Updated {len(users)} users")


import frappe

def redirect_to_modules():
    # Skip redirect for specific users if needed
    if frappe.session.user not in ["Administrator", "Guest"]:
        frappe.local.response["location"] = "/app/modules"