

# baps/baps/doctype/size_list/size_list.py
import frappe
from frappe.model.document import Document


class SizeListForm(Document):

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
            current_state = frappe.db.get_value("Size List Form", self.name, "workflow_state")
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
            frappe.db.set_value("Size List Form", self.name, "workflow_state", "Under Rechange")
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
            f"(`tabSize List Form`.`workflow_state` IN ('Draft','Submitted','Under Verification','Under Rechange','Verified') "
            f"AND `tabSize List Form`.`owner` = '{user}')"
        )

    if "Size List Data Checker" in roles:
        conditions.append(
            "(`tabSize List Form`.`workflow_state` IN ('Submitted','Under Verification','Under Rechange','Verified'))"
        )

    if "Project Manager" in roles:
        conditions.append("(`tabSize List Form`.`workflow_state` IN ('Verified','Published'))")

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
    if not frappe.db.exists("Size List Form", size_list_name):
        frappe.throw("Size List Form not found.")

    size_list = frappe.get_doc("Size List Form", size_list_name)
    project = getattr(size_list, "baps_project", None)

    # --- Run duplicate check first ---
    dup_result = check_global_duplicates(size_list_name)
    has_duplicates = dup_result.get("has_duplicates", False)

    # If duplicates exist → mark and stop creation
    if has_duplicates:
        frappe.db.set_value("Size List Form", size_list_name, "workflow_state", "Under Rechange")
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
    creation.baps_project = getattr(size_list, "baps_project", None)
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
    Check duplicates across *all* Size List Forms & Size List Creations within same project.
    Flags duplicates in the source Size List Form without recursive save.
    """
    if not frappe.db.exists("Size List Form", size_list_name):
        return {"has_duplicates": False}

    doc = frappe.get_doc("Size List Form", size_list_name)
    project = getattr(doc, "baps_project", None)
    
    if not project:
        return {"has_duplicates": False}
    
    # Check if document has any stone details
    if not doc.stone_details or len(doc.stone_details) == 0:
        return {"has_duplicates": False}
    
    existing_range_combinations = set()  # From other Size List Forms
    existing_stone_codes = set()  # From Size List Creations (individual stones)

    # --- Get existing individual stone codes from Size List Creations ---
    creation_stone_codes = frappe.db.sql_list(
        """
        SELECT slci.stone_code
        FROM `tabSize List Creation Item` slci
        JOIN `tabSize List Creation` slc ON slc.name = slci.parent
        WHERE slc.baps_project = %s AND slci.stone_code IS NOT NULL AND slci.stone_code != ''
        """,
        (project,),
    )
    
    # Store existing stone codes
    for code in creation_stone_codes:
        if code and code.strip():
            existing_stone_codes.add(code.strip().upper())

    # --- Check against other Size List Forms for range conflicts ---
    other_size_list_stones = frappe.db.sql(
        """
        SELECT sld.stone_name, sld.range
        FROM `tabSize List Details` sld
        JOIN `tabSize List Form` slf ON slf.name = sld.parent
        WHERE slf.baps_project = %s AND slf.name != %s AND sld.stone_name IS NOT NULL AND sld.stone_name != ''
        """,
        (project, size_list_name),
        as_dict=True
    )

    # Store stone+range combinations from other Size List Forms
    for stone in other_size_list_stones:
        stone_name = stone.stone_name.strip().lower() if stone.stone_name else ''
        stone_range = stone.range.strip() if stone.range else ''
        if stone_name and stone_range:
            range_identifier = f"{stone_name}|{stone_range}".lower()
            existing_range_combinations.add(range_identifier)

    # --- Check current document for duplicates ---
    has_duplicates = False
    local_seen_ranges = set()

    for row in doc.stone_details:
        if not row.stone_name or not row.stone_name.strip():
            continue
            
        stone_name_lower = row.stone_name.strip().lower()
        stone_range = getattr(row, 'range', '') or ''
        
        row_has_dup = False

        # Check if expanding this range would create stone codes that already exist
        if stone_range and stone_range.strip():
            stone_code_prefix = getattr(row, 'stone_code', '') or ''
            if stone_code_prefix:
                # Get the alphabetic prefix (e.g., "FCBBH" from "FCBBH005")
                prefix = ''.join([c for c in stone_code_prefix if not c.isdigit()])
                
                # Expand the range to get individual numbers
                range_numbers = expand_range(stone_range.strip())
                
                # Generate stone codes that would be created
                for num in range_numbers:
                    potential_code = f"{prefix}{str(num).zfill(3)}"  # e.g., FCBBH005
                    if potential_code.upper() in existing_stone_codes:
                        row_has_dup = True
                        break

        # Check against existing stones in other documents
        # Only check if this exact stone name+range combination exists in other Size List Forms
        if stone_range and stone_range.strip():
            range_identifier = f"{stone_name_lower}|{stone_range.strip()}".lower()
            if range_identifier in existing_range_combinations:
                row_has_dup = True
            
        # Check for duplicate ranges within this document
        # Skip empty ranges
        if stone_range and stone_range.strip():
            range_lower = stone_range.strip().lower()
            if range_lower in local_seen_ranges:
                row_has_dup = True
            local_seen_ranges.add(range_lower)

        # Update duplicate flag
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
    """Get all duplicate records for a specific row to show to operator - checks both Size List Forms AND Size List Creations"""
    try:
        row_data = frappe.parse_json(row_data) if isinstance(row_data, str) else row_data
        
        # Check if baps_project is provided
        if not row_data.get('baps_project'):
            return []
        
        all_duplicates = []
        
        # 1. Check in Size List Forms
        size_list_sql = """
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
                sld.h2,
                'Size List Form' as source_type
            FROM `tabSize List Form` sl
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
        
        size_list_duplicates = frappe.db.sql(size_list_sql, {
            'baps_project': row_data.get('baps_project'),
            'main_part': row_data.get('main_part'),
            'sub_part': row_data.get('sub_part'),
            'current_size_list': current_size_list,
            'stone_name': row_data.get('stone_name'),
            'stone_code': row_data.get('stone_code'),
            'range': row_data.get('range')
        }, as_dict=True)
        
        all_duplicates.extend(size_list_duplicates)
        
        # 2. Check in Size List Creations 
        creation_sql = """
            SELECT 
                slc.name as size_list,
                'Created' as workflow_state,
                slci.stone_name,
                slci.stone_code,
                slci.range,
                slci.l1,
                slci.l2,
                slci.b1,
                slci.b2,
                slci.h1,
                slci.h2,
                'Size List Creation' as source_type
            FROM `tabSize List Creation` slc
            INNER JOIN `tabSize List Creation Item` slci ON slc.name = slci.parent
            WHERE slc.baps_project = %(baps_project)s
                AND slc.main_part = %(main_part)s
                AND slc.sub_part = %(sub_part)s
                AND (
                    (%(stone_name)s IS NOT NULL AND %(stone_name)s != '' AND slci.stone_name = %(stone_name)s) OR
                    (%(range)s IS NOT NULL AND %(range)s != '' AND slci.range = %(range)s) OR
                    (%(stone_code)s IS NOT NULL AND %(stone_code)s != '' AND slci.stone_code = %(stone_code)s)
                )
            ORDER BY slc.creation DESC
        """
        
        creation_duplicates = frappe.db.sql(creation_sql, {
            'baps_project': row_data.get('baps_project'),
            'main_part': row_data.get('main_part'),
            'sub_part': row_data.get('sub_part'),
            'stone_name': row_data.get('stone_name'),
            'stone_code': row_data.get('stone_code'),
            'range': row_data.get('range')
        }, as_dict=True)
        
        all_duplicates.extend(creation_duplicates)
        
        return all_duplicates
        
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

@frappe.whitelist()
def check_stone_name_duplicates(baps_project, stone_name, exclude_size_list=None):
    """Check if stone name exists in other Size Lists OR Size List Creations within the same project"""
    try:
        if not baps_project or not stone_name:
            return []
        
        duplicates = []
        
        # 1. Check in Size List Forms
        conditions = ["sl.baps_project = %(baps_project)s", "sld.stone_name = %(stone_name)s"]
        args = {
            'baps_project': baps_project,
            'stone_name': stone_name
        }
        
        if exclude_size_list and exclude_size_list != 'new':
            conditions.append("sl.name != %(exclude_size_list)s")
            args['exclude_size_list'] = exclude_size_list
        
        sql_size_list = """
            SELECT sl.name as size_list_name, sl.form_number, sld.stone_name, 
                   sld.stone_code, sld.range, sl.main_part, sl.sub_part, 'Size List Form' as source_type
            FROM `tabSize List Form` sl
            INNER JOIN `tabSize List Details` sld ON sl.name = sld.parent
            WHERE {conditions}
            ORDER BY sl.creation DESC
        """.format(conditions=" AND ".join(conditions))
        
        size_list_duplicates = frappe.db.sql(sql_size_list, args, as_dict=True)
        duplicates.extend(size_list_duplicates)
        
        # 2. Check in Size List Creations
        sql_creation = """
            SELECT slc.name as size_list_name, slc.form_number, slci.stone_name, 
                   slci.stone_code, slci.range, slc.main_part, slc.sub_part, 'Size List Creation' as source_type
            FROM `tabSize List Creation` slc
            INNER JOIN `tabSize List Creation Item` slci ON slc.name = slci.parent
            WHERE slc.baps_project = %(baps_project)s 
            AND slci.stone_name = %(stone_name)s
            AND slci.stone_name IS NOT NULL
            AND slci.stone_name != ''
            ORDER BY slc.creation DESC
        """
        
        creation_duplicates = frappe.db.sql(sql_creation, {
            'baps_project': baps_project,
            'stone_name': stone_name
        }, as_dict=True)
        duplicates.extend(creation_duplicates)
        
        return duplicates
        
    except Exception as e:
        frappe.log_error(f"Error in check_stone_name_duplicates: {str(e)}", "Stone Name Duplicate Check")
        return []