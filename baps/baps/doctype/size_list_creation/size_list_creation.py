# Copyright (c) 2025, Ayush Patel and contributors
# For license information, please see license.txt


import frappe
from frappe.model.document import Document

class SizeListCreation(Document):
    def validate(self):
        # Validate form_number if provided
        if self.form_number:
            self.validate_form_number()
    
    def before_save(self):
        # Set status to Published automatically on save (no draft state)
        if hasattr(self, 'status'):
            self.status = "Verified"
    
    def validate_form_number(self):
        """Validate that the form_number refers to an existing Size List"""
        try:
            # Skip validation if form_number is empty
            if not self.form_number:
                return
                
            # Clean the form_number in case there are any whitespace issues
            self.form_number = self.form_number.strip()
            
            # Check if Size List exists
            if not frappe.db.exists("Size List", self.form_number):
                # Get all available Size Lists for debugging
                available_lists = frappe.get_all("Size List", fields=["name"], limit=5)
                available_names = [sl.name for sl in available_lists]
                
                frappe.throw(f"Size List '{self.form_number}' not found. Available options: {', '.join(available_names)}")
            
            # Check for duplicate - prevent using the same Size List twice
            existing_creation = frappe.db.exists("Size List Creation", {
                "form_number": self.form_number,
                "name": ("!=", self.name)  # Exclude current document if updatin
            })
            
            if existing_creation:
                frappe.throw(f"Size List '{self.form_number}' has already been used in Size List Creation '{existing_creation}'. Each Size List can only be used once.")
            
            # Get the Size List document to check its state
            size_list_doc = frappe.get_doc("Size List", self.form_number)
            
            # Check if it's in a valid state for creation
            if hasattr(size_list_doc, 'workflow_state'):
                if size_list_doc.workflow_state not in ['Verified', 'Published']:
                    frappe.msgprint(f"Note: Size List '{self.form_number}' is in '{size_list_doc.workflow_state}' state. You can still proceed but it's recommended to use verified Size Lists.", 
                                   title="Size List Status", indicator="orange")
            
        except Exception as e:
            frappe.log_error(f"Error validating form_number '{self.form_number}': {str(e)}")
            # Don't re-throw the error, just log it for now
            pass


@frappe.whitelist()
def get_available_size_lists_for_creation(doctype, txt, searchfield, start, page_len, filters):
    """
    Get Size Lists that are Published and not already used in Size List Creation.
    This prevents duplicate Size List Creation records.
    """
    try:
        # Get all Size Lists that are already used in Size List Creation
        used_size_lists = frappe.get_all(
            "Size List Creation",
            fields=["form_number"],
            filters={"form_number": ("is", "set")}
        )
        
        # Extract the form numbers that are already used
        used_form_numbers = [item.form_number for item in used_size_lists if item.form_number]
        
        # Build filters for available Size Lists
        size_list_filters = {
            "workflow_state": ["in", ["Verified", "Published"]]  # Only include verified/published Size Lists
        }
        
        # Exclude already used Size Lists
        if used_form_numbers:
            size_list_filters["name"] = ["not in", used_form_numbers]
        
        # Add search text filter if provided
        if txt:
            size_list_filters["name"] = ["like", f"%{txt}%"]
        
        # Get available Size Lists
        available_size_lists = frappe.get_all(
            "Size List",
            fields=["name", "baps_project", "main_part", "sub_part"],
            filters=size_list_filters,
            order_by="creation desc",
            limit_start=start,
            limit_page_length=page_len
        )
        
        # Format for Link field dropdown
        result = []
        for size_list in available_size_lists:
            result.append([
                size_list.name,
                f"{size_list.name} - {size_list.baps_project or ''} - {size_list.main_part or ''}"
            ])
        
        return result
        
    except Exception as e:
        frappe.log_error(f"Error getting available size lists for creation: {str(e)}")
        return []


@frappe.whitelist()
def get_published_size_lists_for_creation():
    """
    Get all verified/published Size Lists that are available for Size List Creation.
    Project Manager can select from these to create items.
    """
    try:
        # Call the method from Size List doctype to get verified lists
        from baps.baps.doctype.size_list.size_list import get_verified_size_lists
        
        result = get_verified_size_lists()
        
        if result.get("success"):
            return {
                "success": True,
                "message": f"Found {result.get('count', 0)} verified Size Lists",
                "data": result.get("data", [])
            }
        else:
            return result
            
    except Exception as e:
        frappe.log_error(f"Error getting published size lists: {str(e)}")
        return {
            "success": False,
            "message": f"Error: {str(e)}"
        }


@frappe.whitelist()
def load_stones_from_verified_size_list(size_list_name):
    """
    Load stones from a verified Size List into Size List Creation.
    Expands ranges and prepares data for creation.
    """
    try:
        # Call the method from Size List doctype
        from baps.baps.doctype.size_list.size_list import get_verified_size_list_details
        
        result = get_verified_size_list_details(size_list_name)
        
        if result.get("success"):
            return {
                "success": True,
                "message": result.get("message"),
                "data": result.get("data")
            }
        else:
            return result
            
    except Exception as e:
        frappe.log_error(f"Error loading stones from size list: {str(e)}")
        return {
            "success": False,
            "message": f"Error: {str(e)}"
        }


@frappe.whitelist()
def create_size_list_items_from_range(form_number):
    """Fetch Size List rows, expand ranges, and create item rows."""
    size_list = frappe.get_doc("Size List", form_number)

    seen_codes = set()   # to track duplicates across all rows
    items = []

    for d in size_list.stone_details:
        if not d.range or not d.stone_code:
            continue

        expanded_numbers = expand_range(d.range)
        prefix = ''.join([c for c in d.stone_code if not c.isdigit()])  # AYUSH
        for num in expanded_numbers:
            code = f"{prefix}{str(num).zfill(3)}"  # → AYUSH005

            if code in seen_codes:
                continue

            seen_codes.add(code)
            items.append({
                "stone_code": code,
                "stone_name": d.stone_name,
                "l1": d.l1,
                "l2": d.l2,
                "b1": d.b1,
                "b2": d.b2,
                "h1": d.h1,
                "h2": d.h2,
                "volume": d.volume
            })

    return {
        "items": items,
        "created_count": len(items),
        "skipped_count": len(seen_codes) - len(items)
    }


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


def expand_stone_for_creation(generation_stone):
    """
    Expand a stone from Size List Generation for Size List Creation.
    This function creates individual stone records from ranges.
    """
    try:
        stone_range = getattr(generation_stone, 'range', '') or ""
        
        if not stone_range:
            # No range, return single record
            return [{
                "stone_name": generation_stone.stone_name,
                "stone_code": generation_stone.stone_code,
                "l1": generation_stone.l1,
                "l2": generation_stone.l2,
                "b1": generation_stone.b1,
                "b2": generation_stone.b2,
                "h1": generation_stone.h1,
                "h2": generation_stone.h2,
                "volume": generation_stone.volume
            }]
        
        # Extract base code (letters part) and range numbers
        base_stone_code = generation_stone.stone_code or ""
        # Remove any existing numbers from the end to get base code
        base_code = ''.join([c for c in base_stone_code if not c.isdigit()])
        
        # Expand the range
        expanded_numbers = expand_range(stone_range)
        
        expanded_records = []
        for num in expanded_numbers:
            # Create new stone code with zero-padded number
            new_stone_code = f"{base_code}{str(num).zfill(3)}"
            
            expanded_records.append({
                "stone_name": generation_stone.stone_name,
                "stone_code": new_stone_code,
                "l1": generation_stone.l1,
                "l2": generation_stone.l2,
                "b1": generation_stone.b1,
                "b2": generation_stone.b2,
                "h1": generation_stone.h1,
                "h2": generation_stone.h2,
                "volume": generation_stone.volume
            })
        
        return expanded_records
        
    except Exception as e:
        frappe.log_error(f"Error expanding stone for creation: {str(e)}")
        # Return single record if expansion fails
        return [{
            "stone_name": generation_stone.stone_name,
            "stone_code": generation_stone.stone_code,
            "l1": generation_stone.l1,
            "l2": generation_stone.l2,
            "b1": generation_stone.b1,
            "b2": generation_stone.b2,
            "h1": generation_stone.h1,
            "h2": generation_stone.h2,
            "volume": generation_stone.volume
        }]


@frappe.whitelist()
def get_project_statistics(project):
    """
    Get statistics for all Size List Creation records for a specific project.
    Returns counts by status.
    """
    try:
        records = frappe.get_all(
            "Size List Creation",
            filters={"baps_project": project},
            fields=["name", "status"]
        )
        
        stats = {
            "total_records": len(records),
            "published": sum(1 for r in records if r.status == "Published"),
            "in_progress": sum(1 for r in records if r.status == "In Progress"),
            #"draft": sum(1 for r in records if r.status == "Draft"),
            "cancelled": sum(1 for r in records if r.status == "Cancelled")
        }
        
        return stats
        
    except Exception as e:
        frappe.log_error(f"Error getting project statistics: {str(e)}")
        return {
            "total_records": 0,
            "published": 0,
            "in_progress": 0,
            #"draft": 0,
            "cancelled": 0
        }


@frappe.whitelist()
def get_all_verified_sources():
    """
    """
    try:
        records = frappe.get_all(
            "Size List Creation",
            filters={"form_number": ["!=", ""]},
            fields=[
                "name",
                "form_number",
                "baps_project",
                "main_part",
                "sub_part",
                "status",
                "prep_date"
            ],
            order_by="creation desc"
        )
        
        return records
        
    except Exception as e:
        frappe.log_error(f"Error getting verified sources: {str(e)}")
        return []


@frappe.whitelist()
def get_records_by_filter(filter_type, filter_value):
    try:
        filter_map = {
            'project': 'baps_project',
            'main_part': 'main_part',
            'sub_part': 'sub_part',
            'material_type': 'stone_type'
        }
        
        field_name = filter_map.get(filter_type)
        if not field_name:
            return {
                "success": False,
                "message": "Invalid filter type"
            }
        
        records = frappe.get_all(
            "Size List Creation",
            filters={field_name: filter_value},
            fields=[
                "name",
                "form_number",
                "baps_project",
                "project_name",
                "main_part",
                "sub_part",
                "stone_type",
                "status",
                "prep_date",
                "total_volume"
            ],
            order_by="prep_date desc"
        )
        
        # Calculate statistics
        stats = {
            "total_records": len(records),
            "published": sum(1 for r in records if r.status == "Published"),
            "in_progress": sum(1 for r in records if r.status == "In Progress"),
            #"draft": sum(1 for r in records if r.status == "Draft"),
            "total_volume": sum(float(r.total_volume or 0) for r in records)
        }
        
        return {
            "success": True,
            "records": records,
            "statistics": stats
        }
        
    except Exception as e:
        frappe.log_error(f"Error getting filtered records: {str(e)}")
        return {
            "success": False,
            "message": str(e)
        }


@frappe.whitelist()
def get_available_size_lists(doctype, txt, searchfield, start, page_len, filters):
    """
    Get all Size Lists that haven't been published yet.
    This prevents duplicate publishing of the same Size List.
    """
    try:
        # Get all Size Lists that are already published in Size List Creation
        published_size_lists = frappe.get_all(
            "Size List Creation",
            filters={"status": ["in", ["Published", "In Progress"]]},
            fields=["form_number"]
        )
        
        published_form_numbers = [item.form_number for item in published_size_lists if item.form_number]
        
        # Build filters for frappe.get_all
        query_filters = {}
        
        # Exclude already published Size Lists
        if published_form_numbers:
            query_filters["name"] = ["not in", published_form_numbers]
        
        # Add search text filter if provided
        if txt:
            query_filters["name"] = ["like", f"%{txt}%"]
        
        # Get Size Lists using frappe.get_all (more reliable)
        results = frappe.get_all(
            "Size List",
            filters=query_filters,
            fields=["name", "baps_project", "main_part", "sub_part", "stone_type"],
            order_by="name desc",
            limit_start=start,
            limit_page_length=page_len
        )
        
        # Format results for the link field dropdown
        formatted_results = []
        for result in results:
            # Return the format expected by Link field: [value, label]
            formatted_results.append([
                result.name,  # This is what gets stored in the field
                f"{result.name} - {result.baps_project or ''} - {result.main_part or ''}"  # This is what user sees
            ])
        
        return formatted_results
        
    except Exception as e:
        frappe.log_error(f"Error getting available size lists: {str(e)}")
        return []


@frappe.whitelist()
def get_size_list_usage_report():
    """
    Get a report showing which Size Lists are available and which have been used.
    This helps users understand what's available for new Size List Creation.
    """
    try:
        # Get all Published Size Lists
        all_published_size_lists = frappe.get_all(
            "Size List",
            fields=["name", "baps_project", "main_part", "sub_part"],
            filters={"workflow_state": "Published"},
            order_by="creation desc"
        )
        
        # Get all used Size Lists
        used_size_lists = frappe.get_all(
            "Size List Creation",
            fields=["form_number", "name as creation_name"],
            filters={"form_number": ("is", "set")},
            order_by="creation desc"
        )
        
        # Create sets for easy lookup
        used_form_numbers = {item.form_number for item in used_size_lists if item.form_number}
        
        # Separate available and used
        available_size_lists = []
        used_details = []
        
        for size_list in all_published_size_lists:
            if size_list.name in used_form_numbers:
                # Find which creation record uses this
                creation_record = next((item for item in used_size_lists if item.form_number == size_list.name), None)
                if creation_record:
                    used_details.append({
                        "form_number": size_list.name,
                        "creation_name": creation_record.creation_name,
                        "baps_project": size_list.baps_project,
                        "main_part": size_list.main_part
                    })
            else:
                available_size_lists.append(size_list)
        
        return {
            "available": available_size_lists,
            "used": used_details,
            "summary": {
                "total_published": len(all_published_size_lists),
                "available_count": len(available_size_lists),
                "used_count": len(used_details)
            }
        }
        
    except Exception as e:
        frappe.log_error(f"Error getting size list usage report: {str(e)}")
        return {
            "available": [],
            "used": [],
            "summary": {"total_published": 0, "available_count": 0, "used_count": 0}
        }

@frappe.whitelist()
def get_unique_size_lists(baps_project=None, main_part=None, sub_part=None, stone_name=None):
    filters = []

    # Apply filters based on the passed values
    if baps_project:
        filters.append(f"parent_table.baps_project = {frappe.db.escape(baps_project)}")
    if main_part:
        filters.append(f"parent_table.main_part = {frappe.db.escape(main_part)}")
    if sub_part:
        filters.append(f"parent_table.sub_part = {frappe.db.escape(sub_part)}")
    if stone_name:
        filters.append(f"child_table.stone_name LIKE {frappe.db.escape('%' + stone_name + '%')}")  # Allow partial match for stone name

    # Build the WHERE clause with the filters
    where_clause = " AND ".join(filters)
    if where_clause:
        where_clause = "WHERE " + where_clause

    # Query to fetch unique size list items with filters applied
    query = f"""
        SELECT DISTINCT
            child_table.stone_code,
            child_table.stone_name,
            child_table.l1,
            child_table.l2,
            child_table.b1,
            child_table.b2,
            child_table.h1,
            child_table.h2,
            child_table.volume
        FROM `tabSize List Creation Item` AS child_table
        JOIN `tabSize List Creation` AS parent_table
            ON child_table.parent = parent_table.name
        {where_clause}
        ORDER BY child_table.stone_code
    """

    return frappe.db.sql(query, as_dict=True)


@frappe.whitelist()
def get_filter_options():
    # Fetch available filter options for each field
    baps_projects = frappe.get_all('Baps Project', fields=['name'])
    main_parts = frappe.get_all('Main Part', fields=['name'])
    sub_parts = frappe.get_all('Sub Part', fields=['name'])
    stone_names = frappe.get_all('Size List Creation Item', fields=['stone_name'], distinct=True)
    
    return {
        "baps_projects": [baps_project['name'] for baps_project in baps_projects],
        "main_parts": [main_part['name'] for main_part in main_parts],
        "sub_parts": [sub_part['name'] for sub_part in sub_parts],
        "stone_names": [stone_name['stone_name'] for stone_name in stone_names]
    }



@frappe.whitelist()
def auto_create_from_verified_size_list(size_list_name):
    """
    Automatically create a Size List Creation record from a verified Size List.
    """
    size_list = frappe.get_doc("Size List", size_list_name)
    
    # Safety check
    if size_list.workflow_state != "Verified":
        return {"success": False, "message": "Only verified Size Lists can be converted."}

    # Avoid duplicates
    existing = frappe.db.exists("Size List Creation", {"form_number": size_list_name})
    if existing:
        return {"success": False, "message": f"Size List Creation already exists: {existing}"}

    # Create the new Size List Creation document
    creation = frappe.new_doc("Size List Creation")
    creation.form_number = size_list.name
    creation.baps_project = getattr(size_list, "baps_project", "")
    creation.main_part = getattr(size_list, "main_part", "")
    creation.sub_part = getattr(size_list, "sub_part", "")
    creation.stone_type = getattr(size_list, "stone_type", "")
    creation.prep_date = frappe.utils.nowdate()

    # Expand stone ranges
    from baps.baps.doctype.size_list_creation.size_list_creation import expand_range
    seen = set()

    for d in size_list.stone_details:
        if not d.range or not d.stone_code:
            continue

        expanded = expand_range(d.range)
        prefix = ''.join([c for c in d.stone_code if not c.isdigit()])
        for num in expanded:
            code = f"{prefix}{str(num).zfill(3)}"
            is_duplicate = code in seen
            seen.add(code)

            creation.append("stone_details", {
                "stone_code": code,
                "stone_name": d.stone_name,
                "l1": d.l1,
                "l2": d.l2,
                "b1": d.b1,
                "b2": d.b2,
                "h1": d.h1,
                "h2": d.h2,
                "volume": d.volume,
                "duplicate_flag": 1 if is_duplicate else 0
            })

    creation.insert(ignore_permissions=True)
    frappe.db.commit()

    return {"success": True, "message": f"Created Size List Creation {creation.name} from {size_list_name}"}