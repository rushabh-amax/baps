import frappe

@frappe.whitelist()
def switch_theme(theme):
    theme = theme.strip().lower()

    allowed_themes = ["dark", "light", "automatic", "baps"]
    if theme not in allowed_themes:
        frappe.throw(f"Invalid theme: {theme}")

    frappe.db.set_value("User", frappe.session.user, "desk_theme", theme)
    frappe.local.cookie_manager.set_cookie("desk_theme", theme)
    frappe.db.commit()
