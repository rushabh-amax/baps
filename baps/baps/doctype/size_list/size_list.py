

# baps/baps/doctype/size_list/size_list.py
import frappe
from frappe.model.document import Document


class SizeList(Document):

    # --------------------------
    # VALIDATION & TRIGGERS
    # --------------------------
    def validate(self):
        """Before saving — always calculate total volume"""
        self.calculate_total_volume()

    def before_save(self):
        """Before saving - check workflow transitions and handle duplicates automatically"""
        # Get the current workflow state from DB
        if self.name:  # If document exists (not new)
            current_state = frappe.db.get_value("Size List", self.name, "workflow_state")
            new_state = getattr(self, "workflow_state", None)
            
            # If trying to move to Verified from Under Verification
            if current_state == "Under Verification" and new_state == "Verified":
                result = check_global_duplicates(self.name)
                if result.get("has_duplicates"):
                    # Store flag to handle after save
                    self._has_duplicates_to_rechange = True
                    # Prevent the verification by keeping it in Under Verification
                    self.workflow_state = "Under Verification"

    def auto_send_for_rechange_due_to_duplicates(self):
        """Automatically send document back to Under Rechange when duplicates found during verification"""
        try:
            # Uncheck verification checkboxes for rows with duplicates first
            self.uncheck_verification_for_duplicate_rows()
            
            # Update the workflow state directly in database (after document is saved)
            frappe.db.set_value("Size List", self.name, "workflow_state", "Under Rechange")
            frappe.db.commit()
            
            # Reload the document to reflect changes
            self.reload()
            
            # Show message to user
            frappe.msgprint(
                "⚠️ Duplicates detected! Document automatically sent back to Under Rechange. Range verification unchecked for duplicate rows (highlighted in red) so Data Entry Operator can make corrections.",
                indicator="orange",
                title="Auto-Sent for Rechange"
            )
            
            # Clear the flag
            self._has_duplicates_to_rechange = False
            
        except Exception as e:
            frappe.log_error(f"Error in auto_send_for_rechange_due_to_duplicates: {str(e)}")
            # Show message to user about manual action needed
            frappe.msgprint(
                f"⚠️ Duplicates found. Please manually use 'Send for Rechange' action. Error: {str(e)}",
                indicator="red",
                title="Manual Action Required"
            )

    def uncheck_verification_for_duplicate_rows(self):
        """Uncheck only range verification checkboxes for rows that have duplicates"""
        if not self.stone_details:
            return
            
        for row in self.stone_details:
            if getattr(row, 'duplicate_flag', 0) == 1:
                # Only uncheck range verification field for duplicate rows
                row.range_verified = 0
                
                # Update in database immediately (only range_verified)
                frappe.db.set_value("Size List Details", row.name, {
                    "range_verified": 0
                })

    def on_update(self):
        """When updated — if Verified, auto generate Size List Creation"""
        # Handle duplicate rechange after save
        if hasattr(self, '_has_duplicates_to_rechange') and self._has_duplicates_to_rechange:
            self.auto_send_for_rechange_due_to_duplicates()
            return
            
        if getattr(self, "workflow_state", None) == "Verified":
            existing = frappe.db.get_value(
                "Size List Creation", {"form_number": self.name}, "name"
            )
            if not existing:
                create_size_list_creation_from_verified(self.name)

    def calculate_total_volume(self):
        """Sum up total volume from child table"""
        total = 0
        if hasattr(self, "stone_details") and self.stone_details:
            for row in self.stone_details:
                if row.volume:
                    total += row.volume
        self.total_volume = round(total, 3)


# =============================================================================
# PERMISSION CONTROL
# =============================================================================

def get_permission_query_conditions(user):
    if not user:
        user = frappe.session.user
    roles = frappe.get_roles(user)

    if "System Manager" in roles or user == "Administrator":
        return ""

    conditions = []

    if "Size List Data Entry Operator" in roles:
        conditions.append(
            f"(`tabSize List`.`workflow_state` IN ('Draft','Submitted','Under Verification','Under Rechange','Verified') "
            f"AND `tabSize List`.`owner` = '{user}')"
        )

    if "Size List Data Checker" in roles:
        conditions.append(
            "(`tabSize List`.`workflow_state` IN ('Submitted','Under Verification','Under Rechange','Verified'))"
        )

    if "Size List Project Manager" in roles:
        conditions.append("(`tabSize List`.`workflow_state` IN ('Verified','Published'))")

    return " OR ".join(conditions) if conditions else "1=0"


def has_permission(doc, ptype, user):
    if not user:
        user = frappe.session.user
    roles = frappe.get_roles(user)

    if "System Manager" in roles or user == "Administrator":
        return True

    state = doc.workflow_state
    owner = doc.owner

    if "Size List Data Entry Operator" in roles and state in [
        "Draft",
        "Submitted",
        "Under Verification",
        "Under Rechange",
        "Verified",
    ] and owner == user:
        return True

    if "Size List Data Checker" in roles and state in [
        "Submitted",
        "Under Verification",
        "Under Rechange",
        "Verified",
    ]:
        return True

    if "Size List Project Manager" in roles and state in ["Verified", "Published"]:
        return True

    return False


# =============================================================================
# MAIN AUTO-GENERATION LOGIC (Phase 1 + Phase 2 Combined)
# =============================================================================

@frappe.whitelist()
def create_size_list_creation_from_verified(size_list_name):
    """Create Size List Creation after Size List is verified."""
    if not frappe.db.exists("Size List", size_list_name):
        frappe.throw("Size List not found.")

    size_list = frappe.get_doc("Size List", size_list_name)
    project = getattr(size_list, "baps_project", None)

    # --- Run duplicate check first ---
    dup_result = check_global_duplicates(size_list_name)
    has_duplicates = dup_result.get("has_duplicates", False)

    # If duplicates exist → mark and stop creation
    if has_duplicates:
        frappe.db.set_value("Size List", size_list_name, "workflow_state", "Under Rechange")
        frappe.msgprint(
            "⚠️ Duplicates detected across Size Lists in this project. "
            "Please correct flagged rows before proceeding.",
            indicator="orange",
        )
        return {"success": False, "duplicates_found": True}

    # --- No duplicates: proceed to generate ---
    creation = frappe.new_doc("Size List Creation")
    creation.form_number = size_list.name
    creation.baps_project = project
    creation.project_name = getattr(size_list, "project_name", None)
    creation.prep_date = getattr(size_list, "prep_date", None)
    creation.stone_type = getattr(size_list, "stone_type", None)
    creation.main_part = getattr(size_list, "main_part", None)
    creation.sub_part = getattr(size_list, "sub_part", None)
    creation.cutting_region = getattr(size_list, "cutting_region", None)
    creation.status = "In Progress"

    total = 0
    for row in size_list.stone_details:
        codes = expand_range(row.range) if row.range else []
        prefix = "".join([c for c in (row.stone_code or "") if not c.isdigit()])
        for n in codes:
            code = f"{prefix}{str(n).zfill(3)}"
            creation.append(
                "stone_details",
                {
                    "stone_code": code,
                    "stone_name": row.stone_name,
                    "l1": row.l1,
                    "l2": row.l2,
                    "b1": row.b1,
                    "b2": row.b2,
                    "h1": row.h1,
                    "h2": row.h2,
                    "volume": row.volume,
                    "duplicate_flag": 0,
                },
            )
            total += 1

    creation.insert(ignore_permissions=True)
    frappe.db.commit()

    frappe.msgprint(
        f"✅ Size List Creation '{creation.name}' generated successfully ({total} items).",
        indicator="green",
    )
    return {"success": True, "creation": creation.name}


# =============================================================================
# DUPLICATE CHECKER (Phase 2)
# =============================================================================

@frappe.whitelist()
def check_global_duplicates(size_list_name):
    """
    Check duplicates across *all* Size Lists & Creations within same project.
    Flags duplicates in the source Size List without recursive save.
    """
    if not frappe.db.exists("Size List", size_list_name):
        return {"has_duplicates": False}

    doc = frappe.get_doc("Size List", size_list_name)
    project = getattr(doc, "baps_project", None)
    existing_codes = set()

    # --- Gather all stone codes for same project ---
    if project:
        creation_codes = frappe.db.sql_list(
            """
            SELECT c.stone_code
            FROM `tabSize List Creation Item` c
            JOIN `tabSize List Creation` p ON p.name = c.parent
            WHERE p.baps_project = %s AND c.stone_code IS NOT NULL
            """,
            (project,),
        )
        details_codes = frappe.db.sql_list(
            """
            SELECT d.stone_code
            FROM `tabSize List Details` d
            JOIN `tabSize List` p ON p.name = d.parent
            WHERE p.baps_project = %s AND p.name != %s
            """,
            (project, size_list_name),
        )
    else:
        creation_codes = frappe.db.sql_list(
            """SELECT stone_code FROM `tabSize List Creation Item` WHERE stone_code IS NOT NULL"""
        )
        details_codes = frappe.db.sql_list(
            """SELECT stone_code FROM `tabSize List Details` WHERE parent != %s""",
            (size_list_name,),
        )

    for c in creation_codes + details_codes:
        existing_codes.add(c.strip().upper())

    # --- Mark duplicates directly in DB ---
    has_duplicates = False
    local_seen = set()

    for row in doc.stone_details:
        codes = expand_range(row.range) if row.range else []
        prefix = "".join([c for c in (row.stone_code or "") if not c.isdigit()])
        row_has_dup = False

        for n in codes:
            code = f"{prefix}{str(n).zfill(3)}"
            cu = code.strip().upper()
            if cu in existing_codes or cu in local_seen:
                row_has_dup = True
            local_seen.add(cu)

        new_flag = 1 if row_has_dup else 0
        frappe.db.set_value("Size List Details", row.name, "duplicate_flag", new_flag)
        if row_has_dup:
            has_duplicates = True

    frappe.db.commit()
    return {"has_duplicates": has_duplicates}


# =============================================================================
# UTILITY
# =============================================================================

@frappe.whitelist()
def get_duplicate_records_for_row(row_data, current_size_list):
    """Get all duplicate records for a specific row to show to operator"""
    try:
        row_data = frappe.parse_json(row_data) if isinstance(row_data, str) else row_data
        
        # Check if baps_project is provided
        if not row_data.get('baps_project'):
            return []
        
        # First, let's check if there are any Size Lists in the same project/part
        count_sql = """
            SELECT COUNT(*) as count
            FROM `tabSize List` sl
            WHERE sl.baps_project = %(baps_project)s
                AND sl.main_part = %(main_part)s
                AND sl.sub_part = %(sub_part)s
                AND sl.name != %(current_size_list)s
                AND sl.docstatus != 2
        """
        
        count_result = frappe.db.sql(count_sql, {
            'baps_project': row_data.get('baps_project'),
            'main_part': row_data.get('main_part'),
            'sub_part': row_data.get('sub_part'),
            'current_size_list': current_size_list
        }, as_dict=True)
        

        
        # Query to find duplicate records - simplified search
        sql = """
            SELECT 
                sl.name as size_list,
                sl.workflow_state,
                sld.stone_name,
                sld.stone_code,
                sld.range,
                sld.l1,
                sld.l2,
                sld.b1,
                sld.b2,
                sld.h1,
                sld.h2
            FROM `tabSize List` sl
            INNER JOIN `tabSize List Details` sld ON sl.name = sld.parent
            WHERE sl.baps_project = %(baps_project)s
                AND sl.main_part = %(main_part)s
                AND sl.sub_part = %(sub_part)s
                AND sl.name != %(current_size_list)s
                AND sl.docstatus != 2
                AND (
                    (%(stone_name)s IS NOT NULL AND %(stone_name)s != '' AND sld.stone_name = %(stone_name)s) OR
                    (%(range)s IS NOT NULL AND %(range)s != '' AND sld.range = %(range)s) OR
                    (%(stone_code)s IS NOT NULL AND %(stone_code)s != '' AND sld.stone_code = %(stone_code)s)
                )
            ORDER BY sl.creation DESC
        """
        
        duplicates = frappe.db.sql(sql, {
            'baps_project': row_data.get('baps_project'),
            'main_part': row_data.get('main_part'),
            'sub_part': row_data.get('sub_part'),
            'current_size_list': current_size_list,
            'stone_name': row_data.get('stone_name'),
            'stone_code': row_data.get('stone_code'),
            'range': row_data.get('range')
        }, as_dict=True)
        

        
        # If no duplicates found, let's also return all records from same project for debugging
        if not duplicates:
            all_records_sql = """
                SELECT 
                    sl.name as size_list,
                    sl.workflow_state,
                    sld.stone_name,
                    sld.stone_code,
                    sld.range,
                    sld.l1,
                    sld.l2,
                    sld.b1,
                    sld.b2,
                    sld.h1,
                    sld.h2
                FROM `tabSize List` sl
                INNER JOIN `tabSize List Details` sld ON sl.name = sld.parent
                WHERE sl.baps_project = %(baps_project)s
                    AND sl.main_part = %(main_part)s
                    AND sl.sub_part = %(sub_part)s
                    AND sl.name != %(current_size_list)s
                    AND sl.docstatus != 2
                ORDER BY sl.creation DESC
                LIMIT 10
            """
            
            all_records = frappe.db.sql(all_records_sql, {
                'baps_project': row_data.get('baps_project'),
                'main_part': row_data.get('main_part'),
                'sub_part': row_data.get('sub_part'),
                'current_size_list': current_size_list
            }, as_dict=True)
            

        
        return duplicates
        
    except Exception as e:
        import traceback
        error_msg = f"Error in get_duplicate_records_for_row: {str(e)}\nTraceback: {traceback.format_exc()}\nRow Data: {row_data}\nCurrent Size List: {current_size_list}"
        frappe.log_error(error_msg, "Duplicate Records Error")
        frappe.throw(f"Error fetching duplicate records: {str(e)}")

def expand_range(rng):
    """Convert '1-5,8,10-12' → [1,2,3,4,5,8,10,11,12]."""
    result = []
    parts = [x.strip() for x in rng.split(",") if x.strip()]
    for p in parts:
        if "-" in p:
            try:
                s, e = map(int, p.split("-"))
                result.extend(range(s, e + 1))
            except Exception:
                pass
        else:
            try:
                result.append(int(p))
            except Exception:
                pass
    return result

def get_all_existing_stone_codes():
    """Get all stone codes from all Size List Creation items."""
    existing_codes = set()
    try:
        codes = frappe.db.sql_list("""
            SELECT stone_code 
            FROM `tabSize List Creation Item`
            WHERE stone_code IS NOT NULL AND stone_code != ''
        """)
        existing_codes.update([c.strip().upper() for c in codes if c])
    except Exception:
        frappe.log_error(frappe.get_traceback(), "Error fetching global codes")
    return existing_codes