import frappe
from frappe.model.document import Document

class SizeList(Document):
    def validate(self):
        """Basic validation for Size List"""
        
        # Check for duplicate configurations before saving
        self.check_duplicate_configuration()
        
        # Multiple checks to catch workflow state changes to "Verified"
        if (self.workflow_state == "Verified" or 
            self.get("workflow_state") == "Verified" or
            getattr(self, "_workflow_state", None) == "Verified"):
            self.validate_all_fields_verified()
        
        # Also check if docstatus is being set to 1 (submitted) with Verified status
        if self.docstatus == 1 and self.workflow_state == "Verified":
            self.validate_all_fields_verified()
    
    def before_save(self):
        """Calculations before saving"""
        self.calculate_total_volume()
    
    def before_workflow_action(self):
        """Validate before any workflow action"""
        # If trying to move to Verified status, validate all fields
        if hasattr(self, '_workflow_state') and self._workflow_state == "Verified":
            self.validate_all_fields_verified()
    
    def on_update_after_submit(self):
        """Validate after workflow updates"""
        if self.workflow_state == "Verified":
            self.validate_all_fields_verified()
    
    def calculate_total_volume(self):
        """Calculate total volume from stone details"""
        total = 0
        if hasattr(self, 'stone_details') and self.stone_details:
            for row in self.stone_details:
                if row.volume:
                    total += row.volume
        self.total_volume = round(total, 3)
    
    def validate_all_fields_verified(self):
        """Validate that all verification checkboxes are checked before moving to Verified status"""
        
        # Parent form verification fields (excluding form_number and prep_date)
        parent_verification_fields = [
            'baps_project_verified',
            'stone_type_verified',
            'main_part_verified',
            'sub_part_verified',
            'cutting_region_verified',
            'polishing_verified'
        ]
        
        # Check parent fields
        unverified_parent_fields = []
        for field in parent_verification_fields:
            if not self.get(field):
                # Get the field label for better error message
                field_label = field.replace('_verified', '').replace('_', ' ').title()
                unverified_parent_fields.append(field_label)
        
        if unverified_parent_fields:
            frappe.throw(
                f"Please verify all parent form fields before moving to Verified status. "
                f"Unverified fields: {', '.join(unverified_parent_fields)}",
                title="Verification Incomplete"
            )
        
        # Child table verification fields
        child_verification_fields = [
            'stone_name_verified',
            'stone_code_verified',
            'range_verified',
            'l1_verified',
            'l2_verified',
            'b1_verified',
            'b2_verified',
            'h1_verified',
            'h2_verified'
        ]
        
        # Check child table rows
        if not self.stone_details or len(self.stone_details) == 0:
            frappe.throw(
                "Please add at least one stone detail row before moving to Verified status.",
                title="No Data"
            )
        
        unverified_rows = []
        for idx, row in enumerate(self.stone_details, start=1):
            row_unverified_fields = []
            for field in child_verification_fields:
                if not row.get(field):
                    field_label = field.replace('_verified', '').replace('_', ' ').title()
                    row_unverified_fields.append(field_label)
            
            if row_unverified_fields:
                unverified_rows.append(f"Row {idx}: {', '.join(row_unverified_fields)}")
        
        if unverified_rows:
            frappe.throw(
                f"Please verify all fields in child table rows before moving to Verified status.<br><br>"
                f"Unverified fields:<br>{'<br>'.join(unverified_rows)}",
                title="Verification Incomplete"
            )

    def check_duplicate_configuration(self):
        """Check for duplicate Size Lists with same project configuration and stone details"""
        
        # Skip check if essential fields are missing
        if not self.baps_project or not self.stone_type or not self.main_part or not self.cutting_region:
            return
        
        # First check for header-level duplicates
        self.check_header_duplicates()
        
        # Then check for stone-level duplicates within this project
        self.check_stone_duplicates()
    
    def check_header_duplicates(self):
        """Check for duplicate Size Lists with same project configuration"""
        
        # Build filters for duplicate checking
        duplicate_filters = {
            "baps_project": self.baps_project,
            "stone_type": self.stone_type,
            "main_part": self.main_part,
            "cutting_region": self.cutting_region,
            "name": ("!=", self.name)  # Exclude current document
        }
        
        # Add sub_part to filters if it exists
        if self.sub_part:
            duplicate_filters["sub_part"] = self.sub_part
        else:
            # For documents without sub_part, check for others without sub_part
            duplicate_filters["sub_part"] = ["in", ["", None]]
        
        # Check for existing Size Lists with same configuration
        existing_duplicates = frappe.get_all(
            "Size List",
            filters=duplicate_filters,
            fields=["name", "form_number", "workflow_state", "creation"],
            order_by="creation desc",
            limit=5
        )
        
        if existing_duplicates:
            # Format duplicate information for error message
            duplicate_info = []
            for dup in existing_duplicates:
                status = dup.get('workflow_state', 'Draft')
                form_num = dup.get('form_number', 'Not Set')
                duplicate_info.append(f"• {dup.name} (Form: {form_num}, Status: {status})")
            
            # Create comprehensive error message
            error_message = f"""
A Size List with this exact configuration already exists!

<b>Your Configuration:</b>
• BAPS Project: {self.baps_project}
• Stone Type: {self.stone_type}
• Main Part: {self.main_part}
• Sub Part: {self.sub_part or 'Not specified'}
• Cutting Region: {self.cutting_region}

<b>Existing Size Lists with same configuration:</b>
{chr(10).join(duplicate_info)}

<b>What should you do?</b>
1. Use one of the existing Size Lists above
2. Modify your configuration to make it unique
3. Contact your supervisor if this is intentional

<i>This prevents confusion and ensures data consistency.</i>
            """
            
            frappe.throw(
                error_message,
                title="Duplicate Size List Configuration"
            )
    
    def check_stone_duplicates(self):
        """Check for duplicate stone details within the same project"""
        
        if not self.stone_details or len(self.stone_details) == 0:
            return
        
        # Get all existing stone names from Size Lists in the same project
        existing_stones_query = """
            SELECT 
                sld.stone_name,
                sl.name as size_list_name,
                sl.form_number,
                sl.workflow_state
            FROM `tabSize List Details` sld
            JOIN `tabSize List` sl ON sld.parent = sl.name
            WHERE sl.baps_project = %s 
                AND sl.name != %s
                AND sld.stone_name IS NOT NULL
                AND sld.stone_name != ''
        """
        
        existing_stones = frappe.db.sql(
            existing_stones_query,
            (self.baps_project, self.name or "new"),
            as_dict=True
        )
        
        if not existing_stones:
            return
        
        # Create a lookup dictionary for existing stones
        stone_lookup = {}
        for stone in existing_stones:
            stone_name = stone.stone_name.strip().lower()
            if stone_name not in stone_lookup:
                stone_lookup[stone_name] = []
            stone_lookup[stone_name].append(stone)
        
        # Check current stone details against existing ones
        duplicate_stones = []
        for row in self.stone_details:
            if not row.stone_name:
                continue
                
            stone_name = row.stone_name.strip().lower()
            if stone_name in stone_lookup:
                for existing in stone_lookup[stone_name]:
                    duplicate_stones.append({
                        'current_stone': row.stone_name,
                        'existing_stone': existing.stone_name,
                        'existing_size_list': existing.size_list_name,
                        'existing_form': existing.form_number or 'Not Set',
                        'existing_status': existing.workflow_state or 'Draft'
                    })
        
        if duplicate_stones:
            # Format error message for stone duplicates
            stone_info = []
            for dup in duplicate_stones[:5]:  # Show max 5 duplicates
                stone_info.append(
                    f"• Stone '{dup['current_stone']}' already exists in "
                    f"{dup['existing_size_list']} (Form: {dup['existing_form']}, Status: {dup['existing_status']})"
                )
            
            error_message = f"""
Duplicate stone names found within the same project!

<b>Project:</b> {self.baps_project}

<b>Duplicate Stones Detected:</b>
{chr(10).join(stone_info)}
{f'{chr(10)}... and {len(duplicate_stones) - 5} more duplicates' if len(duplicate_stones) > 5 else ''}

<b>Why this matters:</b>
• Each stone should have a unique name within a project
• Duplicate stone names can cause confusion during production
• Stone tracking becomes difficult with duplicate names

<b>Solutions:</b>
1. Use different stone names (e.g., add suffixes like -A, -B)
2. Check existing Size Lists before adding stones
3. Remove duplicate stones from your current list

<i>This ensures unique stone identification within each project.</i>
            """
            
            frappe.throw(
                error_message,
                title="Duplicate Stone Names in Project"
            )


# Server-side method to validate workflow actions
@frappe.whitelist()
def validate_workflow_action(doc, action):
    """Validate workflow actions before they are applied"""
    if isinstance(doc, str):
        doc = frappe.get_doc("Size List", doc)
    
    # If action leads to "Verified" status, validate all fields
    if action and "verify" in action.lower():
        size_list = frappe.get_doc("Size List", doc.name)
        size_list.validate_all_fields_verified()
    
    return True


@frappe.whitelist()
def check_duplicate_configuration(baps_project, stone_type, main_part, cutting_region, sub_part=None, exclude_name=None):
    """
    API method to check for duplicate Size List configurations from client-side
    
    Args:
        baps_project: BAPS Project name
        stone_type: Stone Type
        main_part: Main Part
        cutting_region: Cutting Region
        sub_part: Sub Part (optional)
        exclude_name: Name to exclude from search (for existing documents)
    
    Returns:
        dict: Contains duplicate information
    """
    
    # Build filters for duplicate checking
    filters = {
        "baps_project": baps_project,
        "stone_type": stone_type,
        "main_part": main_part,
        "cutting_region": cutting_region
    }
    
    # Handle sub_part
    if sub_part:
        filters["sub_part"] = sub_part
    else:
        filters["sub_part"] = ["in", ["", None]]
    
    # Exclude current document if specified
    if exclude_name:
        filters["name"] = ("!=", exclude_name)
    
    # Get existing duplicates
    duplicates = frappe.get_all(
        "Size List",
        filters=filters,
        fields=["name", "form_number", "workflow_state", "creation", "project_name"],
        order_by="creation desc"
    )
    
    return {
        "has_duplicates": len(duplicates) > 0,
        "count": len(duplicates),
        "duplicates": duplicates
    }


@frappe.whitelist()
def check_stone_name_duplicates(baps_project, stone_name, exclude_size_list=None):
    """
    API method to check for duplicate stone names within a project
    
    Args:
        baps_project: BAPS Project name
        stone_name: Stone name to check
        exclude_size_list: Size List name to exclude from search
    
    Returns:
        dict: Contains duplicate stone information
    """
    
    # SQL query to find stone name duplicates within the project
    query = """
        SELECT 
            sld.stone_name,
            sl.name as size_list_name,
            sl.form_number,
            sl.workflow_state
        FROM `tabSize List Details` sld
        JOIN `tabSize List` sl ON sld.parent = sl.name
        WHERE sl.baps_project = %s 
            AND LOWER(TRIM(sld.stone_name)) = %s
            AND sld.stone_name IS NOT NULL
            AND sld.stone_name != ''
    """
    
    params = [baps_project, stone_name.strip().lower()]
    
    # Exclude current Size List if specified
    if exclude_size_list and exclude_size_list != 'new':
        query += " AND sl.name != %s"
        params.append(exclude_size_list)
    
    duplicates = frappe.db.sql(query, params, as_dict=True)
    
    return {
        "has_duplicates": len(duplicates) > 0,
        "count": len(duplicates),
        "duplicates": duplicates
    }


@frappe.whitelist()
def check_multiple_stone_duplicates(baps_project, stone_names, exclude_size_list=None):
    """
    Check for duplicates of multiple stone names within a project
    
    Args:
        baps_project: BAPS Project name
        stone_names: List of stone names to check
        exclude_size_list: Size List name to exclude from search
    
    Returns:
        dict: Contains grouped duplicate information
    """
    
    if not stone_names or not isinstance(stone_names, list):
        return {"has_duplicates": False, "duplicates": []}
    
    # Prepare stone names for case-insensitive search
    stone_name_map = {name.strip().lower(): name for name in stone_names}
    
    # SQL query to find all stone duplicates at once
    query = """
        SELECT 
            sld.stone_name,
            sl.name as size_list_name,
            sl.form_number,
            sl.workflow_state
        FROM `tabSize List Details` sld
        JOIN `tabSize List` sl ON sld.parent = sl.name
        WHERE sl.baps_project = %s 
            AND LOWER(TRIM(sld.stone_name)) IN ({})
            AND sld.stone_name IS NOT NULL
            AND sld.stone_name != ''
    """.format(','.join(['%s'] * len(stone_name_map)))
    
    params = [baps_project] + list(stone_name_map.keys())
    
    # Exclude current Size List if specified
    if exclude_size_list and exclude_size_list != 'new':
        query += " AND sl.name != %s"
        params.append(exclude_size_list)
    
    query += " ORDER BY sld.stone_name, sl.creation"
    
    results = frappe.db.sql(query, params, as_dict=True)
    
    # Group duplicates by stone name
    grouped_duplicates = {}
    for result in results:
        stone_key = result.stone_name.strip().lower()
        original_name = stone_name_map.get(stone_key, result.stone_name)
        
        if original_name not in grouped_duplicates:
            grouped_duplicates[original_name] = []
        
        grouped_duplicates[original_name].append({
            "size_list_name": result.size_list_name,
            "form_number": result.form_number or "Not Set",
            "workflow_state": result.workflow_state or "Draft"
        })
    
    # Format response
    duplicate_list = []
    total_duplicates = 0
    
    for stone_name, locations in grouped_duplicates.items():
        if len(locations) > 0:  # Any duplicate found
            duplicate_list.append({
                "stone_name": stone_name,
                "locations": locations,
                "count": len(locations)
            })
            total_duplicates += len(locations)
    
    return {
        "has_duplicates": len(duplicate_list) > 0,
        "duplicates": duplicate_list,
        "total_duplicates": total_duplicates,
        "unique_stones_with_duplicates": len(duplicate_list)
    }


@frappe.whitelist()
def get_verified_size_lists():
    """
    Get all Size Lists with 'Verified' workflow status.
    These are available for Size List Creation by Project Manager.
    """
    try:
        # Get all Size Lists with Verified status
        verified_lists = frappe.get_all(
            "Size List",
            filters={"workflow_state": "Verified"},
            fields=[
                "name",
                "form_number",
                "baps_project",
                "project_name",
                "main_part",
                "sub_part",
                "stone_type",
                "cutting_region",
                "prep_date",
                "total_volume",
                "prepared_by",
                "creation",
                "modified"
            ],
            order_by="creation desc"
        )
        
        return {
            "success": True,
            "count": len(verified_lists),
            "data": verified_lists
        }
        
    except Exception as e:
        frappe.log_error(f"Error getting verified size lists: {str(e)}")
        return {
            "success": False,
            "message": f"Error: {str(e)}"
        }


@frappe.whitelist()
def get_verified_size_list_details(size_list_name):
    """
    Get detailed information of a verified Size List including stone details.
    Used for Size List Creation.
    """
    try:
        # Check if exists and is verified
        if not frappe.db.exists("Size List", size_list_name):
            return {
                "success": False,
                "message": f"Size List '{size_list_name}' not found"
            }
        
        # Get the Size List document
        size_list = frappe.get_doc("Size List", size_list_name)
        
        # Allow any Size List to be used for creation (removed verification check)
        
        # Check if has stone details
        if not size_list.stone_details:
            return {
                "success": False,
                "message": "No stone details found in this Size List"
            }
        
        # Prepare stone details with expanded ranges
        expanded_stones = []
        for stone in size_list.stone_details:
            # Expand range for each stone
            if stone.range:
                expanded_records = expand_stone_range(stone)
                expanded_stones.extend(expanded_records)
            else:
                # Single stone without range
                expanded_stones.append({
                    "stone_name": stone.stone_name,
                    "stone_code": stone.stone_code,
                    "l1": stone.l1,
                    "l2": stone.l2,
                    "b1": stone.b1,
                    "b2": stone.b2,
                    "h1": stone.h1,
                    "h2": stone.h2,
                    "volume": stone.volume,
                    "range": stone.range
                })
        
        return {
            "success": True,
            "message": f"Found {len(expanded_stones)} stones from {len(size_list.stone_details)} rows",
            "data": {
                "name": size_list.name,
                "form_number": size_list.form_number,
                "baps_project": size_list.baps_project,
                "project_name": size_list.project_name,
                "main_part": size_list.main_part,
                "sub_part": size_list.sub_part,
                "stone_type": size_list.stone_type,
                "cutting_region": size_list.cutting_region,
                "stone_details": expanded_stones,
                "total_stones": len(expanded_stones),
                "total_rows": len(size_list.stone_details)
            }
        }
        
    except Exception as e:
        frappe.log_error(f"Error getting size list details: {str(e)}")
        return {
            "success": False,
            "message": f"Error: {str(e)}"
        }


def expand_stone_range(stone):
    """
    Expand a stone row with range into individual stone records.
    E.g., stone_code='AYUSH' with range='1-5' becomes AYUSH001, AYUSH002, etc.
    """
    try:
        stone_range = stone.range or ""
        
        if not stone_range:
            # No range, return single record
            return [{
                "stone_name": stone.stone_name,
                "stone_code": stone.stone_code,
                "l1": stone.l1,
                "l2": stone.l2,
                "b1": stone.b1,
                "b2": stone.b2,
                "h1": stone.h1,
                "h2": stone.h2,
                "volume": stone.volume,
                "range": stone.range
            }]
        
        # Extract base code (letters part)
        base_stone_code = stone.stone_code or ""
        base_code = ''.join([c for c in base_stone_code if not c.isdigit()])
        
        # Expand the range using the existing function
        expanded_numbers = expand_range(stone_range)
        
        expanded_records = []
        for num in expanded_numbers:
            # Create new stone code with zero-padded number
            new_stone_code = f"{base_code}{str(num).zfill(3)}"
            
            expanded_records.append({
                "stone_name": stone.stone_name,
                "stone_code": new_stone_code,
                "l1": stone.l1,
                "l2": stone.l2,
                "b1": stone.b1,
                "b2": stone.b2,
                "h1": stone.h1,
                "h2": stone.h2,
                "volume": stone.volume,
                "range": f"{num}"  # Individual number from range
            })
        
        return expanded_records
        
    except Exception as e:
        frappe.log_error(f"Error expanding stone range: {str(e)}")
        # Return single record if expansion fails
        return [{
            "stone_name": stone.stone_name,
            "stone_code": stone.stone_code,
            "l1": stone.l1,
            "l2": stone.l2,
            "b1": stone.b1,
            "b2": stone.b2,
            "h1": stone.h1,
            "h2": stone.h2,
            "volume": stone.volume,
            "range": stone.range
        }]


def expand_range(rng):
    """Convert string like '1-10,12,15-17' → [1,2,...,10,12,15,16,17]."""
    result = []
    parts = [x.strip() for x in rng.split(",") if x.strip()]
    for part in parts:
        if "-" in part:
            start, end = part.split("-")
            result.extend(range(int(start), int(end) + 1))
        else:
            result.append(int(part))
    return result


class SizeList(Document):
    def before_workflow_action(self, action):
        """Triggered before workflow state changes"""
        if action == "Verify":  # action name from your workflow transition
            unchecked = [
                f for f in ["baps_project_verified", "main_part_verified", "sub_part_verified"]
                if not getattr(self, f)
            ]
            if unchecked:
                frappe.throw("❌ Cannot Verify. All checkboxes must be ticked before approval. You have to Reject this form.")



def get_size_list_permission_query(user):
    """Apply permission-based filtering for Size List based on user roles"""
    if not user:
        user = frappe.session.user

    user_roles = frappe.get_roles(user)
    
    # Administrator and System Manager: can see all records without restrictions
    if "Administrator" in user_roles or "System Manager" in user_roles:
        return ""
    
    # Size List Project Manager: can see Verified and Published states for project oversight
    elif "Project Manager" in user_roles:
        allowed_states = ["Verified", "Published"]
        return f"(`tabSize List`.workflow_state IN ({', '.join(frappe.db.escape(s) for s in allowed_states)}))"
    
    # Data Entry Operator: can see Draft, Under Verification, Under Rechange
    elif "Size List Data Entry Operator" in user_roles:
        allowed_states = ["Draft", "Under Verification", "Under Rechange"]
        return f"(`tabSize List`.workflow_state IN ({', '.join(frappe.db.escape(s) for s in allowed_states)}))"
    
    # Data Entry Checker: can see Under Verification, Under Rechange, Verified (NOT Draft)
    elif "Size List Data Checker" in user_roles:
        allowed_states = ["Under Verification", "Under Rechange", "Verified"]
        return f"(`tabSize List`.workflow_state IN ({', '.join(frappe.db.escape(s) for s in allowed_states)}))"
    
    # For other users, no additional restrictions
    return ""


def has_size_list_permission(doc, user=None, permission_type="read"):
    """Check if user has permission to access the Size List document"""
    if not user:
        user = frappe.session.user
        
    user_roles = frappe.get_roles(user)
    
    # Administrator and System Manager: full access to all records
    if "Administrator" in user_roles or "System Manager" in user_roles:
        return True
    
    # Get the workflow state from the document
    if hasattr(doc, 'workflow_state'):
        workflow_state = doc.workflow_state
    elif isinstance(doc, dict):
        workflow_state = doc.get('workflow_state')
    else:
        # If doc is a document name, fetch the workflow state
        workflow_state = frappe.db.get_value("Size List", doc, "workflow_state")
    
    # Size List Project Manager: can access Verified and Published states for project oversight
    if "Size List Project Manager" in user_roles:
        allowed_states = ["Verified", "Published"]
        return workflow_state in allowed_states
    
    # Data Entry Operator: can access Draft, Under Verification, Under Rechange
    elif "Size List Data Entry Operator" in user_roles:
        allowed_states = ["Draft", "Under Verification", "Under Rechange"]
        return workflow_state in allowed_states
    
    # Data Entry Checker: can access Under Verification, Under Rechange, Verified (NOT Draft)
    elif "Size List Data Checker" in user_roles:
        allowed_states = ["Under Verification", "Under Rechange", "Verified"]
        return workflow_state in allowed_states
    
    # For other users, allow all permissions
    return True


def get_size_list_list_query(doctype, txt, searchfield, start, page_len, filters, as_dict=False):
    """Custom list query for Size List with permission-based filtering"""
    user = frappe.session.user
    user_roles = frappe.get_roles(user)

    # Build base conditions
    conditions = []
    
    # Add permission-based filtering based on roles
    # Administrator and System Manager: no restrictions, can see all records
    if "Administrator" in user_roles or "System Manager" in user_roles:
        pass  # No workflow state restrictions
    elif "Size List Project Manager" in user_roles or "Project Manager" in user_roles:
        # Project Manager: can see Verified and Published states for project oversight
        allowed_states = ["Verified", "Published"]
        conditions.append(f"workflow_state IN ({', '.join(frappe.db.escape(s) for s in allowed_states)})")
    elif "Size List Data Entry Operator" in user_roles:
        # Data Entry Operator: can see Draft, Under Verification, Under Rechange
        allowed_states = ["Draft", "Under Verification", "Under Rechange"]
        conditions.append(f"workflow_state IN ({', '.join(frappe.db.escape(s) for s in allowed_states)})")
    elif "Size List Data Checker" in user_roles:
        # Data Entry Checker: can see Under Verification, Under Rechange, Verified (NOT Draft)
        allowed_states = ["Under Verification", "Under Rechange", "Verified"]
        conditions.append(f"workflow_state IN ({', '.join(frappe.db.escape(s) for s in allowed_states)})")
    
    # Add text search conditions
    if txt:
        txt_conditions = [
            "name LIKE %(txt)s",
            "baps_project LIKE %(txt)s", 
            "stone_type LIKE %(txt)s"
        ]
        conditions.append(f"({' OR '.join(txt_conditions)})")
    
    # Build WHERE clause
    where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
    
    query = f"""
        SELECT name, workflow_state, baps_project, stone_type, main_part, creation
        FROM `tabSize List`
        {where_clause}
        ORDER BY creation DESC
        LIMIT %(start)s, %(page_len)s
    """
    
    return query, {
        "txt": "%" + txt + "%" if txt else "",
        "start": start,
        "page_len": page_len
    }