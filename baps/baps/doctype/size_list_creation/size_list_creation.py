# Copyright (c) 2025, Ayush Patel and contributors
# For license information, please see license.txt


import frappe
from frappe.model.document import Document

class SizeListCreation(Document):
    pass


import frappe

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


@frappe.whitelist()
def get_published_stones_from_generation(generation_name):
    """
    Get published stones from Size List Generation document.
    Only returns stones that have been published and are available for Size List Creation.
    """
    try:
        # Check if the Size List Generation document exists
        if not frappe.db.exists("Size List Generation", generation_name):
            return {
                "success": False,
                "message": f"Size List Generation document '{generation_name}' not found"
            }
        
        # Get the Size List Generation document
        generation_doc = frappe.get_doc("Size List Generation", generation_name)
        
        # Check if document has any stone details
        if not generation_doc.stone_details:
            return {
                "success": False,
                "message": "No stone details found in the Generation document"
            }
        
        # Filter published stones
        published_stones = []
        total_stones = len(generation_doc.stone_details)
        
        for stone in generation_doc.stone_details:
            # Check if stone is published - only published stones should be available for Size List Creation
            published_value = getattr(stone, 'published', 0) if hasattr(stone, 'published') else 0
            
            if published_value == 1:  # Only include published stones
                # Expand range for individual stone records if needed
                expanded_records = expand_stone_for_creation(stone)
                published_stones.extend(expanded_records)
        
        # Prepare response with generation data and published stones
        generation_dict = generation_doc.as_dict()
        generation_dict["stone_details"] = published_stones
        
        return {
            "success": True,
            "message": f"Found {len(published_stones)} published stones from {total_stones} total stones in Generation",
            "data": generation_dict,
            "generation_stats": {
                "total_stones": total_stones,
                "published_stones": len(published_stones),
                "unpublished_stones": total_stones - len(published_stones)
            }
        }
        
    except frappe.DoesNotExistError:
        return {
            "success": False,
            "message": f"Size List Generation {generation_name} not found"
        }
    except Exception as e:
        frappe.log_error(f"Error getting published stones from {generation_name}: {str(e)}")
        return {
            "success": False,
            "message": f"Error getting published stones: {str(e)}"
        }


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
