# import frappe


# def format_route(name: str) -> str:
#     """Format workspace name into clean route: lowercase, spaces → dashes"""
#     return name.strip().lower().replace(" ", "-")


# @frappe.whitelist(allow_guest=True)
# def login_with_permissions():
#     """Return current session user's roles and active workspaces (modules) with icons & routes"""

#     usr = frappe.session.user
#     if usr in ("Guest", None):
#         return {"status": "error", "message": "Not logged in"}

#     user = frappe.get_doc("User", usr)

#     default_roles_to_exclude = {"All", "Guest", "Desk User"}
#     roles = frappe.get_roles(usr)
#     filtered_roles = [role for role in roles if role not in default_roles_to_exclude]

#     if not filtered_roles:
#         return {
#             "status": "success",
#             "user": {
#                 "id": user.name,
#                 "full_name": user.full_name,
#                 "email": user.email,
#                 "roles": []
#             },
#             "modules": []
#         }

#     # 🔑 Fetch public workspaces (visible in sidebar)
#     workspaces = frappe.get_all(
#         "Workspace",
#         fields=["name", "label", "icon", "parent_page", "public"],
#           filters={
#         "public": 1,
#         "parent_page": ["is", "not set"]   # only fetch parents
#     },
#         order_by="label asc",
#         # ignore_permissions=True
#     )

#     active_modules = []
#     for ws in workspaces:
#         active_modules.append({
#             "name": ws.name,
#             "label": ws.label,
#             "icon": ws.icon or "cube",   # return just icon key
#             "route": f"/{format_route(ws.name)}"
#         })

#     return {
#         "status": "success",
#         "user": {
#             "id": user.name,
#             "full_name": user.full_name,
#             "email": user.email,
#             "roles": filtered_roles
#         },
#         "modules": active_modules
#     }


# role shows


# # shows our modules.page
# import frappe 


# def format_route(name: str) -> str:
#     """Format workspace name into clean route: lowercase, spaces → dashes"""
#     return name.strip().lower().replace(" ", "-")


# @frappe.whitelist(allow_guest=True)
# def login_with_permissions():
#     """Return current session user's roles and accessible workspaces (including child pages)"""
    
#     usr = frappe.session.user
#     if usr in ("Guest", None):
#         return {"status": "error", "message": "Not logged in"}

#     user = frappe.get_doc("User", usr)

#     # ✅ Filter out default roles
#     default_roles_to_exclude = {"All", "Guest", "Desk User"}
#     user_roles = set(frappe.get_roles(usr)) - default_roles_to_exclude

#     # ✅ Get blocked modules (from user settings)
#     blocked_modules = {bm.module for bm in (user.block_modules or [])}

#     # ✅ Get all modules from Module Def
#     all_modules = {m.name for m in frappe.get_all("Module Def", fields=["name"])}

#     # ✅ Allowed modules = all - blocked
#     allowed_modules = all_modules - blocked_modules

#     # 🔑 Fetch ALL workspaces (including child pages) in allowed modules
#     workspace_list = frappe.get_all(
#         "Workspace",
#         fields=["name", "label", "icon", "module", "parent_page"],
#         filters={
#             "module": ["in", list(allowed_modules)],
#         },
#         order_by="module, label asc",
#     )

#     active_modules = []

#     for ws in workspace_list:
#         # Double-check module is still allowed
#         if ws.module not in allowed_modules:
#             continue

#         try:
#             doc = frappe.get_doc("Workspace", ws.name)
#         except frappe.DoesNotExistError:
#             continue

#         # Get roles assigned to this workspace
#         ws_roles = {r.role for r in doc.roles}

#         # ✅ Allow if:
#         # - No roles set (public), OR
#         # - User has at least one role in the workspace's allowed roles
#         if not ws_roles or (user_roles & ws_roles):
#             active_modules.append({
#                 "name": ws.name,
#                 "label": ws.label,
#                 "icon": ws.icon or "box",  # Fallback icon
#                 "route": f"/app/{format_route(ws.name)}",  # Standard Frappe route
#                 "module": ws.module,
#                 "parent_page": ws.parent_page,  # Useful for UI nesting
#             })

#     # ✅ Sort by module, then by label
#     active_modules.sort(key=lambda x: (x["module"], x["label"]))

#     return {
#         "status": "success",
#         "user": {
#             "id": user.name,
#             "full_name": user.full_name,
#             "email": user.email,
#             "roles": list(user_roles),
#             "allowed_modules": list(allowed_modules),
#         },
#         "modules": active_modules,
#     }
# # ======================== 



# @frappe.whitelist()
# def duplicate_workspace(workspace_name):
#     frappe.has_permission("Workspace", "write", throw=True)
#     doc = frappe.get_doc("Workspace", workspace_name)
#     new_doc = frappe.copy_doc(doc)
#     new_doc.name = f"{workspace_name} Copy"
#     new_doc.insert()
#     return new_doc.name

# @frappe.whitelist()
# def delete_workspace(workspace_name):
#     frappe.has_permission("Workspace", "write", throw=True)
#     frappe.delete_doc("Workspace", workspace_name)


import frappe
import os
from xml.etree import ElementTree as ET

def format_route(name: str) -> str:
    return name.strip().lower().replace(" ", "-")

def clean_svg_namespaces(svg_element):
    """
    Remove namespace prefixes so <ns0:path> becomes <path>
    """
    for elem in svg_element.iter():
        if '}' in elem.tag:
            elem.tag = elem.tag.split('}', 1)[1]  # strip namespace
    return svg_element

def get_symbol_as_svg(symbol_id: str) -> str:
    """
    Extract <symbol> from Frappe's timeless icons.svg and return a standalone <svg> string
    with cleaned namespaces so browsers render it properly.
    """
    icons_path = frappe.get_app_path("frappe", "public", "icons", "timeless", "icons.svg")
    if not os.path.exists(icons_path):
        return None

    tree = ET.parse(icons_path)
    root = tree.getroot()

    # Find <symbol> by id
    symbol = root.find(f".//{{http://www.w3.org/2000/svg}}symbol[@id='{symbol_id}']")
    if not symbol:
        return None

    # Create standalone <svg>
    svg_attrib = {
        "viewBox": symbol.attrib.get("viewBox", "0 0 24 24"),
        "xmlns": "http://www.w3.org/2000/svg",
        "aria-hidden": "true",
        "class": "icon icon-xl",
    }
    svg = ET.Element("svg", svg_attrib)

    # Copy children paths and set stroke="currentColor" if missing
    for child in symbol:
        if "stroke" not in child.attrib:
            child.attrib["stroke"] = "currentColor"
        svg.append(child)

    # Clean all namespaces
    svg = clean_svg_namespaces(svg)

    # Return SVG string
    return ET.tostring(svg, encoding="unicode", method="xml")


@frappe.whitelist(allow_guest=True)
def login_with_permissions():
    usr = frappe.session.user
    if usr in ("Guest", None):
        return {"status": "error", "message": "Not logged in"}

    user = frappe.get_doc("User", usr)
    default_roles_to_exclude = {"All", "Guest", "Desk User"}
    user_roles = set(frappe.get_roles(usr)) - default_roles_to_exclude

    blocked_modules = {bm.module for bm in (user.block_modules or [])}
    all_modules = {m.name for m in frappe.get_all("Module Def", fields=["name"])}
    allowed_modules = all_modules - blocked_modules

    workspace_list = frappe.get_all(
        "Workspace",
        fields=["name", "label", "icon", "module", "parent_page"],
        filters={"module": ["in", list(allowed_modules)]},
        order_by="module, label asc",
    )

    active_modules = []

    for ws in workspace_list:
        if ws.module not in allowed_modules:
            continue

        try:
            doc = frappe.get_doc("Workspace", ws.name)
        except frappe.DoesNotExistError:
            continue

        ws_roles = {r.role for r in doc.roles}
        if not ws_roles or (user_roles & ws_roles):
            icon_name = ws.icon or "box"
            symbol_id = f"icon-{icon_name}"

            # ✅ Get inline SVG with cleaned namespaces
            icon_svg = get_symbol_as_svg(symbol_id)

            active_modules.append({
                "name": ws.name,
                "label": ws.label,
                "icon": icon_name,
                "icon_svg": icon_svg,   # frontend renders directly
                "route": f"/app/{format_route(ws.name)}",
                "module": ws.module,
                "parent_page": ws.parent_page,
            })

    active_modules.sort(key=lambda x: (x["module"], x["label"]))

    return {
        "status": "success",
        "user": {
            "id": user.name,
            "full_name": user.full_name,
            "email": user.email,
            "roles": list(user_roles),
            "allowed_modules": list(allowed_modules),
        },
        "modules": active_modules,
    }
