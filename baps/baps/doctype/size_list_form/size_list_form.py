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
        self.validate_zero_volume()
        self.validate_main_part_sub_part_relationship()
        self.check_internal_duplicates()
        # Check and update duplicate flags
        if self.name:  # Only for existing documents
            self.update_duplicate_flags()

    def validate_main_part_sub_part_relationship(self):
        """Validate that Sub Part belongs to the selected Main Part"""
        if self.sub_part and self.main_part:
            # Get the main_part value from the Sub Part doctype
            sub_part_main_part = frappe.db.get_value("Sub Part", self.sub_part, "main_part")
            
            if sub_part_main_part and sub_part_main_part != self.main_part:
                frappe.throw(
                    f"Invalid Sub Part selection. '{self.sub_part}' belongs to '{sub_part_main_part}', "
                    f"not to the selected Main Part '{self.main_part}'. Please select a valid Sub Part."
                )
        
        # If Sub Part is selected but Main Part is not, throw error
        if self.sub_part and not self.main_part:
            frappe.throw("Cannot select Sub Part without selecting Main Part first.")

    def check_internal_duplicates(self):
        """Check for duplicate stone codes within the current form while entering data"""
        if not self.stone_details or len(self.stone_details) == 0:
            return
        
        local_stone_codes = {}  # Track stone codes: {code: [row_numbers]}
        duplicate_info = []
        
        for idx, row in enumerate(self.stone_details):
            stone_range = getattr(row, 'range', '') or ''
            stone_code_prefix = getattr(row, 'stone_code', '') or ''
            
            if not stone_range or not stone_range.strip() or not stone_code_prefix:
                continue
            
            # Get the alphabetic prefix
            prefix = ''.join([c for c in stone_code_prefix if not c.isdigit()])
            
            # Expand the range to get individual numbers
            range_numbers = expand_range(stone_range.strip())
            
            # Generate stone codes
            for num in range_numbers:
                potential_code = f"{prefix}{str(num).zfill(3)}".upper()
                
                # Check if this code already exists in our tracking
                if potential_code in local_stone_codes:
                    duplicate_info.append({
                        'code': potential_code,
                        'current_row': idx + 1,
                        'duplicate_rows': local_stone_codes[potential_code],
                        'stone_name': row.stone_name or 'N/A',
                        'range': stone_range
                    })
                else:
                    local_stone_codes[potential_code] = []
                
                local_stone_codes[potential_code].append(idx + 1)
        

    def update_duplicate_flags(self):
        """Update duplicate flags for all rows based on current data"""
        if not self.stone_details or len(self.stone_details) == 0:
            return
        
        # Get project for global checks
        project = getattr(self, "baps_project", None)
        if not project:
            return
        
        # Get existing stone codes from Size List Creations
        existing_stone_codes = set()
        creation_stone_codes = frappe.db.sql_list(
            """
            SELECT slci.stone_code
            FROM `tabSize List Creation Item` slci
            JOIN `tabSize List Creation` slc ON slc.name = slci.parent
            WHERE slc.baps_project = %s AND slci.stone_code IS NOT NULL AND slci.stone_code != ''
            """,
            (project,),
        )
        for code in creation_stone_codes:
            if code and code.strip():
                existing_stone_codes.add(code.strip().upper())
        
        # Get existing ranges from other Size List Forms
        other_size_list_stones = frappe.db.sql(
            """
            SELECT sld.stone_code, sld.range
            FROM `tabSize List Details` sld
            JOIN `tabSize List Form` slf ON slf.name = sld.parent
            WHERE slf.baps_project = %s AND slf.name != %s 
              AND sld.stone_code IS NOT NULL AND sld.stone_code != ''
              AND sld.range IS NOT NULL AND sld.range != ''
            """,
            (project, self.name),
            as_dict=True
        )
        
        # Expand other forms' stone codes
        for other_stone in other_size_list_stones:
            if other_stone.stone_code and other_stone.range:
                prefix = ''.join([c for c in other_stone.stone_code if not c.isdigit()])
                nums = expand_range(other_stone.range)
                for num in nums:
                    code = f"{prefix}{str(num).zfill(3)}".upper()
                    existing_stone_codes.add(code)
        
        # Track local stone codes
        local_stone_codes = {}
        
        # Check each row
        for row in self.stone_details:
            row_has_dup = False
            stone_range = getattr(row, 'range', '') or ''
            stone_code_prefix = getattr(row, 'stone_code', '') or ''
            
            if stone_range and stone_range.strip() and stone_code_prefix:
                prefix = ''.join([c for c in stone_code_prefix if not c.isdigit()])
                range_numbers = expand_range(stone_range.strip())
                
                for num in range_numbers:
                    potential_code = f"{prefix}{str(num).zfill(3)}".upper()
                    
                    # Check against existing codes (external)
                    if potential_code in existing_stone_codes:
                        row_has_dup = True
                        break
                    
                    # Check against local codes (internal)
                    if potential_code in local_stone_codes:
                        row_has_dup = True
                        # Mark the previous row too
                        prev_row_name = local_stone_codes[potential_code]
                        for prev_row in self.stone_details:
                            if prev_row.name == prev_row_name:
                                prev_row.duplicate_flag = 1
                        break
                    
                    local_stone_codes[potential_code] = row.name
            
            # Update the flag
            row.duplicate_flag = 1 if row_has_dup else 0

    def check_internal_duplicates_silent(self):
        """Check for duplicate stone codes within the current form - returns True/False without showing message"""
        if not self.stone_details or len(self.stone_details) == 0:
            return False
        
        local_stone_codes = {}  # Track stone codes: {code: [row_numbers]}
        has_duplicates = False
        
        for idx, row in enumerate(self.stone_details):
            stone_range = getattr(row, 'range', '') or ''
            stone_code_prefix = getattr(row, 'stone_code', '') or ''
            
            if not stone_range or not stone_range.strip() or not stone_code_prefix:
                continue
            
            # Get the alphabetic prefix
            prefix = ''.join([c for c in stone_code_prefix if not c.isdigit()])
            
            # Expand the range to get individual numbers
            range_numbers = expand_range(stone_range.strip())
            
            # Generate stone codes
            for num in range_numbers:
                potential_code = f"{prefix}{str(num).zfill(3)}".upper()
                
                # Check if this code already exists in our tracking
                if potential_code in local_stone_codes:
                    has_duplicates = True
                    break
                else:
                    local_stone_codes[potential_code] = []
                
                local_stone_codes[potential_code].append(idx + 1)
            
            if has_duplicates:
                break
        
        return has_duplicates

    def before_save(self):
        """Before saving - check workflow transitions and handle duplicates automatically"""
        # Get the current workflow state from DB
        if self.name:  # If document exists (not new)
            current_state = frappe.db.get_value("Size List Form", self.name, "workflow_state")
            new_state = getattr(self, "workflow_state", None)
            
            # If trying to move to Verified from Under Verification
            if current_state == "Under Verification" and new_state == "Verified":
                # Check for internal duplicates within this form
                has_internal_duplicates = self.check_internal_duplicates_silent()
                
                # Check for global duplicates across forms and Size List Creations
                result = check_global_duplicates(self.name)
                has_global_duplicates = result.get("has_duplicates", False)
                
                # If any duplicates exist, prevent verification
                if has_internal_duplicates or has_global_duplicates:
                    # Store flag to handle after save
                    self._has_duplicates_to_rechange = True
                    # Store which type of duplicates were found
                    self._has_internal_dup = has_internal_duplicates
                    self._has_global_dup = has_global_duplicates
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
            
            # Prepare detailed message based on which type of duplicates were found
            has_internal = getattr(self, '_has_internal_dup', False)
            has_global = getattr(self, '_has_global_dup', False)
            
            if has_internal and has_global:
                msg = (
                    "⚠️ <b>Verification Failed - Duplicates Found</b><br><br>"
                    "Status changed to <b>Under Rechange</b><br><br>"
                    "<b>Issues:</b><br>"
                    "• Internal duplicates (within form)<br>"
                    "• External duplicates (in other Size Lists)<br><br>"
                    "Check flagged rows and correct ranges."
                )
            elif has_internal:
                msg = (
                    "⚠️ <b>Verification Failed</b><br><br>"
                    "Status changed to <b>Under Rechange</b><br><br>"
                    "Internal duplicate stone codes found.<br>"
                    "Check flagged rows and correct overlapping ranges."
                )
            elif has_global:
                msg = (
                    "⚠️ <b>Verification Failed</b><br><br>"
                    "Status changed to <b>Under Rechange</b><br><br>"
                    "Stone codes exist in other Size Lists.<br>"
                    "Check flagged rows and correct ranges."
                )
            else:
                msg = "⚠️ Duplicates found! Status changed to Under Rechange."
            
            # Show message to user
            frappe.msgprint(
                msg,
                indicator="red",
                title="Verification Failed"
            )
            
            # Clear the flags
            self._has_duplicates_to_rechange = False
            self._has_internal_dup = False
            self._has_global_dup = False
            
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
                "Size List Form", {"form_number": self.name}, "name"
            )
            if not existing:
                create_size_list_creation_from_verified(self.name)
    
    def onload(self):
        """Load verified Size List Creation Items into Tab 2"""
        self.load_verified_items()
    
    def load_verified_items(self):
        """Fetch and populate verified Size List Creation Items in table_item"""
        # Clear existing items in Tab 2
        self.table_item = []
        
        # Find Size List Creation record linked to this form
        size_list_creation = frappe.db.get_value(
            "Size List Creation",
            {"form_number": self.name},
            "name"
        )
        
        if not size_list_creation:
            return
        
        # Fetch all items from Size List Creation
        items = frappe.get_all(
            "Size List Creation Item",
            filters={"parent": size_list_creation},
            fields=["stone_code", "stone_name", "range", "l1", "l2", "b1", "b2", "h1", "h2", "volume"],
            order_by="idx"
        )
        
        # Populate table_item with fetched data
        for item in items:
            self.append("table_item", {
                "stone_code": item.stone_code,
                "stone_name": item.stone_name,
                "range": item.range,
                "l1": item.l1,
                "l2": item.l2,
                "b1": item.b1,
                "b2": item.b2,
                "h1": item.h1,
                "h2": item.h2,
                "volume": item.volume
            })

    def calculate_total_volume(self):
        """Sum up total volume from child table"""
        total = 0
        if hasattr(self, "stone_details") and self.stone_details:
            for row in self.stone_details:
                if row.volume:
                    total += row.volume
        self.total_volume = round(total, 3)


    def validate_zero_volume(self):
        """Reject saving if any stone detail has 0 or missing volume."""
        invalid_rows = []
        for row in getattr(self, "stone_details", []):
            if not row.volume or float(row.volume) == 0:
                invalid_rows.append(row.stone_name or row.stone_code or f"Row {row.idx}")

        if invalid_rows:
            msg = (
                "Stone data with 0 volume should not be accepted.<br>"
                "Please correct the following rows:<br><ul>"
            )
            for name in invalid_rows:
                msg += f"<li>{frappe.utils.escape_html(name)}</li>"
            msg += "</ul>"
            frappe.throw(msg, title="Invalid Volume Entries")

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
            "(`tabSize List Form`.`workflow_state` IN ('Draft','Submitted','Under Verification','Under Rechange','Verified','Published'))"
        )

    if "Size List Data Checker" in roles:
        conditions.append(
            "(`tabSize List Form`.`workflow_state` IN ('Submitted','Under Verification','Under Rechange','Verified','Published'))"
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
        "Published",
    ]:
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
        f"✅ Size List generated successfully ({total} Records).",
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
    local_stone_codes = {}  # Track stone codes within this document: {code: row_idx}

    for row in doc.stone_details:
        if not row.stone_name or not row.stone_name.strip():
            continue
            
        stone_name_lower = row.stone_name.strip().lower()
        stone_range = getattr(row, 'range', '') or ''
        
        row_has_dup = False

        # Check if expanding this range would create stone codes that already exist
        current_row_codes = set()
        if stone_range and stone_range.strip():
            stone_code_prefix = getattr(row, 'stone_code', '') or ''
            if stone_code_prefix:
                # Get the alphabetic prefix (e.g., "FCBBH" from "FCBBH005" or "demo" from "demo2")
                prefix = ''.join([c for c in stone_code_prefix if not c.isdigit()])
                
                # Expand the range to get individual numbers
                range_numbers = expand_range(stone_range.strip())
                
                # Generate stone codes that would be created
                for num in range_numbers:
                    potential_code = f"{prefix}{str(num).zfill(3)}".upper()  # e.g., FCBBH005 or DEMO002
                    current_row_codes.add(potential_code)
                    
                    # Check against existing stone codes in Size List Creations
                    if potential_code in existing_stone_codes:
                        row_has_dup = True
                        break
                    
                    # Check against stone codes already seen in this document
                    if potential_code in local_stone_codes:
                        row_has_dup = True
                        # Mark the previous row as duplicate too
                        prev_row_idx = local_stone_codes[potential_code]
                        if prev_row_idx < len(doc.stone_details):
                            frappe.db.set_value("Size List Details", doc.stone_details[prev_row_idx].name, "duplicate_flag", 1)
                        break
                
                # Add current row's codes to local tracking
                if not row_has_dup:
                    for code in current_row_codes:
                        local_stone_codes[code] = row.idx - 1  # Store the index

        # Check against existing stones in other documents
        # Only check if this exact stone name+range combination exists in other Size List Forms
        if stone_range and stone_range.strip():
            range_identifier = f"{stone_name_lower}|{stone_range.strip()}".lower()
            if range_identifier in existing_range_combinations:
                row_has_dup = True
            
        # Check for exact duplicate ranges within this document (same range text)
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
def get_duplicate_records_for_row(row_data, current_size_list):
    """
    Get duplicate records for a specific row.
    Checks across:
      ✅ Size List Creation
      ✅ Other Size List Forms
      ✅ Same Size List Form (internal duplicates)
    """
    try:
        row_data = frappe.parse_json(row_data) if isinstance(row_data, str) else row_data or {}

        if not row_data.get("baps_project"):
            return []

        all_duplicates = []
        
        # --- Build expanded stone codes ---
        expanded_codes = set()
        stone_code_raw = (row_data.get("stone_code") or "").strip()
        base_code = ''.join([ch for ch in stone_code_raw if not ch.isdigit()]).strip() if stone_code_raw else ""

        if row_data.get("range"):
            nums = expand_range(row_data.get("range") or "")
            for n in nums:
                code = f"{base_code}{str(n).zfill(3)}".upper() if base_code else str(n).zfill(3).upper()
                expanded_codes.add(code)
        else:
            if stone_code_raw:
                expanded_codes.add(stone_code_raw.upper())

        # Convert to list for SQL query
        codes_list = list(expanded_codes) if expanded_codes else []
        
        # --- Query 1: Duplicates in Size List Creation Items (expanded codes) ---
        if codes_list:
            placeholders = ",".join(["%s"] * len(codes_list))
            creation_sql = f"""
                SELECT
                    p.name AS source_document,
                    'Size List Creation' AS source_type,
                    'Created' AS workflow_state,
                    c.stone_name,
                    c.stone_code,
                    '' AS `range`,
                    c.l1, c.l2, c.b1, c.b2, c.h1, c.h2
                FROM `tabSize List Creation Item` c
                JOIN `tabSize List Creation` p ON c.parent = p.name
                WHERE p.baps_project = %s
                  AND c.stone_code IN ({placeholders})
                  AND p.docstatus != 2
                ORDER BY p.creation DESC
            """
            params_creation = [row_data["baps_project"]] + codes_list
            creation_duplicates = frappe.db.sql(creation_sql, tuple(params_creation), as_dict=True)
            all_duplicates.extend(creation_duplicates or [])

        # --- Query 2: Duplicates in Other Size List Forms (check expanded stone codes) ---
        if codes_list:
            placeholders2 = ",".join(["%s"] * len(codes_list))
            size_list_sql = f"""
                SELECT
                    p.name AS source_document,
                    'Size List Form' AS source_type,
                    COALESCE(p.workflow_state, 'Draft') AS workflow_state,
                    d.stone_name,
                    d.stone_code,
                    d.`range`,
                    d.l1, d.l2, d.b1, d.b2, d.h1, d.h2
                FROM `tabSize List Details` d
                JOIN `tabSize List Form` p ON p.name = d.parent
                WHERE p.baps_project = %s
                  AND p.name != %s
                  AND p.docstatus != 2
                  AND d.stone_code IS NOT NULL AND d.stone_code != ''
                ORDER BY p.creation DESC
            """
            
            params_size_list = [row_data["baps_project"], current_size_list]
            other_form_rows = frappe.db.sql(size_list_sql, tuple(params_size_list), as_dict=True)
            
            # Check each row for overlapping expanded codes
            for other_row in other_form_rows:
                if not other_row.get('range') or not other_row.get('stone_code'):
                    continue
                    
                # Expand the other row's range
                other_prefix = ''.join([c for c in other_row['stone_code'] if not c.isdigit()])
                other_range_nums = expand_range(other_row['range'])
                
                # Generate other row's stone codes
                for num in other_range_nums:
                    other_code = f"{other_prefix}{str(num).zfill(3)}".upper()
                    if other_code in expanded_codes:
                        # Found a match - add this row to duplicates
                        all_duplicates.append(other_row)
                        break  # Only add once per row

        # --- Query 3: Duplicates within Same Size List Form (internal duplicates) ---
        internal_duplicates = []
        overlapping_codes = {}  # Track which codes overlap: {code: [row_names]}
        
        try:
            internal_rows = frappe.get_all(
                "Size List Details",
                filters={"parent": current_size_list},
                fields=["name", "stone_name", "stone_code", "range", "l1", "l2", "b1", "b2", "h1", "h2", "idx"]
            )

            for r in internal_rows:
                # Skip same row if name matches
                if r.name == row_data.get("name"):
                    continue

                # Check for overlapping expanded stone codes
                if not r.stone_code or not r.range:
                    continue
                    
                try:
                    # Expand the internal row's range
                    r_prefix = ''.join([c for c in r.stone_code if not c.isdigit()])
                    r_range_nums = expand_range(r.range)
                    
                    # Generate internal row's stone codes and check for overlaps
                    overlapping_codes_for_this_row = []
                    for num in r_range_nums:
                        r_code = f"{r_prefix}{str(num).zfill(3)}".upper()
                        if r_code in expanded_codes:
                            overlapping_codes_for_this_row.append(r_code)
                            # Track which rows have this code
                            if r_code not in overlapping_codes:
                                overlapping_codes[r_code] = []
                            overlapping_codes[r_code].append(r.idx)
                    
                    if overlapping_codes_for_this_row:
                        internal_duplicates.append({
                            "source_document": current_size_list,
                            "source_type": "Size List Form",
                            "workflow_state": "Same Form (Internal Duplicate)",
                            "stone_name": r.stone_name,
                            "stone_code": r.stone_code,
                            "range": r.range,
                            "l1": r.l1,
                            "l2": r.l2,
                            "b1": r.b1,
                            "b2": r.b2,
                            "h1": r.h1,
                            "h2": r.h2,
                            "idx": r.idx,
                            "overlapping_codes": overlapping_codes_for_this_row
                        })
                except Exception:
                    pass
            
            all_duplicates.extend(internal_duplicates or [])
            
        except Exception as e:
            frappe.log_error(frappe.get_traceback(), "Internal Duplicate Detection Error")

        # Add overlapping codes summary to response
        result = {
            "duplicates": all_duplicates,
            "overlapping_codes": overlapping_codes
        }
        
        return result

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_duplicate_records_for_row")
        frappe.throw(f"Error fetching duplicates: {str(e)}")