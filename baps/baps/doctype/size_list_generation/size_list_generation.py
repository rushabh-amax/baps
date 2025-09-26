# Copyright (c) 2025, Amax Consultancy Pvt Ltd and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class SizeListGeneration(Document):
	pass

# For license information, please see license.txt


@frappe.whitelist()
def get_verified_stones_from_verification(verification_name):
	"""
	Get verified stones from Size List Verification document - similar to how Size List Verification fetches from Size List
	"""
	try:
		# Get the Size List Verification document
		verification_doc = frappe.get_doc("Size List Verification", verification_name)
		
		# Get only verified stone details
		verified_stones = []
		total_stones = len(verification_doc.stone_details) if verification_doc.stone_details else 0
		
		if verification_doc.stone_details:
			for stone in verification_doc.stone_details:
				verified_value = getattr(stone, 'verified', 0)
				
				# Only include stones that are marked as verified (verified checkbox = 1)
				if verified_value == 1:
					verified_stones.append({
						"stone_name": stone.stone_name,
						"stone_code": stone.stone_code,
						"range": stone.range,
						"l1": stone.l1,
						"l2": stone.l2,
						"b1": stone.b1,
						"b2": stone.b2,
						"h1": stone.h1,
						"h2": stone.h2,
						"volume": stone.volume
					})
		
		# Prepare response with verification data and only verified stones
		verification_dict = verification_doc.as_dict()
		verification_dict["stone_details"] = verified_stones
		
		return {
			"success": True,
			"message": f"Found {len(verified_stones)} verified stones out of {total_stones} total stones",
			"data": verification_dict,
			"verification_stats": {
				"total_stones": total_stones,
				"verified_stones": len(verified_stones),
				"pending_stones": total_stones - len(verified_stones)
			}
		}
		
	except frappe.DoesNotExistError:
		return {
			"success": False,
			"message": f"Size List Verification {verification_name} not found"
		}
	except Exception as e:
		frappe.log_error(f"Error getting verified stones from {verification_name}: {str(e)}")
		return {
			"success": False,
			"message": f"Error getting verified stones: {str(e)}"
		}


@frappe.whitelist()
def get_verification_documents_with_status():
	"""
	Get list of Size List Verification documents with their verification status
	"""
	try:
		verifications = frappe.db.sql("""
			SELECT 
				slv.name,
				slv.form_number,
				slv.project_name,
				slv.material_type,
				COUNT(slvd.name) as total_stones,
				SUM(CASE WHEN slvd.verified = 1 THEN 1 ELSE 0 END) as verified_stones,
				slv.creation
			FROM `tabSize List Verification` slv
			LEFT JOIN `tabSize List Verification Details` slvd ON slvd.parent = slv.name
			WHERE slv.docstatus != 2
			GROUP BY slv.name
			HAVING verified_stones > 0
			ORDER BY slv.creation DESC
		""", as_dict=True)
		
		return {
			"success": True,
			"data": verifications
		}
		
	except Exception as e:
		frappe.log_error(f"Error fetching verification documents: {str(e)}")
		return {
			"success": False,
			"message": f"Error: {str(e)}"
		}


@frappe.whitelist()
def query_verification_documents(doctype, txt, searchfield, start, page_len, filters):
	"""
	Custom query for Size List Verification documents showing verification status
	"""
	conditions = ""
	if txt:
		conditions += f" AND (slv.name LIKE '%{txt}%' OR slv.form_number LIKE '%{txt}%' OR slv.project_name LIKE '%{txt}%')"
	
	if filters:
		for key, value in filters.items():
			if key == "docstatus":
				conditions += f" AND slv.docstatus {value[0]} {value[1]}"
	
	return frappe.db.sql(f"""
		SELECT 
			slv.name,
			CONCAT(
				slv.name, 
				' (', slv.form_number, ') - ',
				COALESCE(slv.project_name, 'No Project'),
				' [', COALESCE(SUM(CASE WHEN slvd.verified = 1 THEN 1 ELSE 0 END), 0), 
				'/', COALESCE(COUNT(slvd.name), 0), ' verified]'
			) as description
		FROM `tabSize List Verification` slv
		LEFT JOIN `tabSize List Verification Details` slvd ON slvd.parent = slv.name
		WHERE slv.docstatus != 2 {conditions}
		GROUP BY slv.name
		HAVING COALESCE(SUM(CASE WHEN slvd.verified = 1 THEN 1 ELSE 0 END), 0) > 0
		ORDER BY slv.creation DESC
		LIMIT {start}, {page_len}
	""")


@frappe.whitelist()
def debug_verification_document(verification_name):
	"""
	Debug method to check if a verification document exists and has verified stones
	"""
	try:
		# Check if document exists
		doc = frappe.get_doc("Size List Verification", verification_name)
		
		# Get basic info
		info = {
			"exists": True,
			"name": doc.name,
			"form_number": doc.form_number,
			"project_name": doc.project_name,
			"total_stones": len(doc.stone_details) if doc.stone_details else 0,
			"verified_stones": 0,
			"stones_list": []
		}
		
		# Check each stone
		if doc.stone_details:
			for stone in doc.stone_details:
				stone_info = {
					"stone_name": stone.stone_name,
					"verified": getattr(stone, 'verified', 0),
					"incorrect": getattr(stone, 'incorrect', 0)
				}
				info["stones_list"].append(stone_info)
				if stone_info["verified"] == 1:
					info["verified_stones"] += 1
		
		return info
		
	except frappe.DoesNotExistError:
		return {"exists": False, "error": f"Document {verification_name} not found"}
	except Exception as e:
		return {"exists": False, "error": str(e)}


@frappe.whitelist()
def query_verification_documents_with_verified_stones(doctype, txt, searchfield, start, page_len, filters):
	"""
	Custom query for Size List Verification documents that have at least one verified stone
	Shows verification status in the dropdown
	"""
	conditions = ""
	if txt:
		conditions += f" AND (slv.name LIKE '%{txt}%' OR slv.form_number LIKE '%{txt}%' OR slv.project_name LIKE '%{txt}%')"
	
	return frappe.db.sql(f"""
		SELECT 
			slv.name,
			CONCAT(
				slv.name, 
				' | ', COALESCE(slv.project_name, 'No Project'),
				' | ', COALESCE(SUM(CASE WHEN slvd.verified = 1 THEN 1 ELSE 0 END), 0), 
				' verified of ', COALESCE(COUNT(slvd.name), 0), ' stones'
			) as description
		FROM `tabSize List Verification` slv
		LEFT JOIN `tabSize List Verification Details` slvd ON slvd.parent = slv.name
		WHERE slv.docstatus != 2 {conditions}
		GROUP BY slv.name
		HAVING COALESCE(SUM(CASE WHEN slvd.verified = 1 THEN 1 ELSE 0 END), 0) > 0
		ORDER BY slv.creation DESC
		LIMIT {start}, {page_len}
	""")


@frappe.whitelist()
def publish_stones_to_creation(generation_doc, selected_stones):
	"""
	Create Size List Creation document from selected stones in Size List Generation
	"""
	try:
		# Check if the document exists first
		if not frappe.db.exists("Size List Generation", generation_doc):
			return {
				"success": False,
				"message": f"Size List Generation document '{generation_doc}' not found. Please ensure the document exists and is saved."
			}
		
		# Get the Size List Generation document
		generation = frappe.get_doc("Size List Generation", generation_doc)
		
		# Validate that the document is saved (not draft)
		if generation.docstatus == 0 and not generation.name:
			return {
				"success": False,
				"message": "Please save the Size List Generation document before publishing stones."
			}
		
		# Validate selected stones
		if not selected_stones or len(selected_stones) == 0:
			return {
				"success": False,
				"message": "No stones selected for publication"
			}
		
		# Create new Size List Creation document
		try:
			creation_doc = frappe.new_doc("Size List Creation")
		except Exception as doc_creation_error:
			return {
				"success": False,
				"message": f"Error creating Size List Creation document: {str(doc_creation_error)}"
			}
		
		# Map main fields from generation to creation
		field_mapping = {
			'prep_date': 'prep_date',
			'baps_project': 'baps_project', 
			'project_name': 'project_name',
			'stone_type': 'material_type',  # Creation field: Generation field
			'main_part': 'main_part',
			'sub_part': 'sub_part',
			'cutting_region': 'cutting_region',
			'polishing': 'polishing_required',  # Creation field: Generation field
			'dry_fitting': 'dry_fitting_required',
			'carving': 'carving_required',
			'chemicaling': 'chemical_required'
		}
		
		# Copy main document fields
		for creation_field, generation_field in field_mapping.items():
			if hasattr(generation, generation_field):
				setattr(creation_doc, creation_field, getattr(generation, generation_field))
		
		# Set the form_number to point to the Size List Generation document (not verification)
		creation_doc.form_number = generation.name
		
		# Add selected stones to the creation document
		total_volume = 0
		
		# Validate that we're only publishing stones that exist in the Generation document
		generation_stones = {f"{stone.stone_name}_{stone.stone_code}": stone for stone in generation.stone_details}
		
		# Handle selected_stones data - it might be a JSON string or list
		if isinstance(selected_stones, str):
			import json
			selected_stones = json.loads(selected_stones)
		
		published_stones = 0
		for stone in selected_stones:
			# Handle both dict and object access patterns
			stone_data = {}
			
			if isinstance(stone, dict):
				stone_name = stone.get("stone_name", "")
				stone_code = stone.get("stone_code", "")
				stone_range = stone.get("range", "")
				stone_key = f"{stone_name}_{stone_code}"
				
				# Only publish if this stone exists in the generation document
				if stone_key in generation_stones:
					generation_stone = generation_stones[stone_key]
					
					# Expand range and create multiple records
					expanded_records = expand_stone_range(generation_stone)
					
					for expanded_stone in expanded_records:
						creation_doc.append("stone_details", expanded_stone)
						published_stones += 1
						
						# Calculate volume safely
						try:
							volume_val = float(expanded_stone.get("volume", 0))
							total_volume += volume_val
						except (ValueError, TypeError):
							total_volume += 0
				else:
					continue
			else:
				# Handle object-like access
				stone_name = getattr(stone, "stone_name", "")
				stone_code = getattr(stone, "stone_code", "")
				stone_range = getattr(stone, "range", "")
				stone_key = f"{stone_name}_{stone_code}"
				
				if stone_key in generation_stones:
					generation_stone = generation_stones[stone_key]
					
					# Expand range and create multiple records
					expanded_records = expand_stone_range(generation_stone)
					
					for expanded_stone in expanded_records:
						creation_doc.append("stone_details", expanded_stone)
						published_stones += 1
						
						# Calculate volume safely
						try:
							volume_val = float(expanded_stone.get("volume", 0))
							total_volume += volume_val
						except (ValueError, TypeError):
							total_volume += 0
				else:
					continue
		
		# Validate that we actually published some stones
		if published_stones == 0:
			return {
				"success": False,
				"message": "No valid stones found to publish. Please ensure stones exist in the Generation document."
			}
		
		# Set total volume
		creation_doc.total_volume = total_volume
		
		# Insert the document
		creation_doc.insert()
		frappe.db.commit()
		
		return {
			"success": True,
			"creation_doc": creation_doc.name,
			"stones_published": published_stones,
			"total_volume": total_volume,
			"message": f"Successfully created Size List Creation {creation_doc.name} with {published_stones} verified stones from Generation document"
		}
		
	except Exception as e:
		frappe.log_error(f"Error publishing stones to creation: {str(e)}")
		return {
			"success": False,
			"message": f"Error publishing stones: {str(e)}"
		}


def expand_stone_range(generation_stone):
	"""
	Expand a stone's range into individual records
	Example: range "1-10" creates 10 records with stone codes like FCBBH001, FCBBH002, ..., FCBBH010
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
		expanded_numbers = expand_range_string(stone_range)
		
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
		frappe.log_error(f"Error expanding stone range: {str(e)}")
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


def expand_range_string(range_str):
	"""
	Convert string like '1-10,12,15-17' → [1,2,3,4,5,6,7,8,9,10,12,15,16,17]
	"""
	try:
		result = []
		if not range_str:
			return []
			
		parts = [x.strip() for x in range_str.split(",") if x.strip()]
		
		for part in parts:
			if "-" in part:
				# Handle range like "1-10"
				range_parts = part.split("-")
				if len(range_parts) == 2:
					start = int(range_parts[0].strip())
					end = int(range_parts[1].strip())
					result.extend(range(start, end + 1))
			else:
				# Handle single number like "12"
				result.append(int(part))
		
		return sorted(list(set(result)))  # Remove duplicates and sort
		
	except Exception as e:
		frappe.log_error(f"Error parsing range string '{range_str}': {str(e)}")
		return []


@frappe.whitelist()
def publish_stones_to_creation(generation_doc, selected_stones):
	"""
	Create Size List Creation document from selected verified stones in Size List Generation
	"""
	try:
		# Check if the document exists first
		if not frappe.db.exists("Size List Generation", generation_doc):
			return {
				"success": False,
				"message": f"Size List Generation document '{generation_doc}' not found. Please ensure the document exists and is saved."
			}
		
		# Get the Size List Generation document
		generation = frappe.get_doc("Size List Generation", generation_doc)
		
		# Validate selected stones
		if not selected_stones or len(selected_stones) == 0:
			return {
				"success": False,
				"message": "No stones selected for publication"
			}
		
		# Handle selected_stones data - it might be a JSON string or list
		if isinstance(selected_stones, str):
			import json
			selected_stones = json.loads(selected_stones)
		
		# Create new Size List Creation document
		creation_doc = frappe.new_doc("Size List Creation")
		
		# Map main fields from generation to creation
		field_mapping = {
			'prep_date': 'prep_date',
			'baps_project': 'baps_project', 
			'project_name': 'project_name',
			'stone_type': 'material_type',  # Creation field: Generation field
			'main_part': 'main_part',
			'sub_part': 'sub_part',
			'cutting_region': 'cutting_region',
			'polishing': 'polishing_required',  # Creation field: Generation field
			'dry_fitting': 'dry_fitting_required',
			'carving': 'carving_required',
			'chemicaling': 'chemical_required'
		}
		
		# Copy main document fields
		for creation_field, generation_field in field_mapping.items():
			if hasattr(generation, generation_field):
				setattr(creation_doc, creation_field, getattr(generation, generation_field))
		
		# Set the form_number to point to the Size List Generation document
		creation_doc.form_number = generation.name
		
		# Add selected stones to the creation document
		total_volume = 0
		published_stones = 0
		
		# Validate that we're only publishing stones that exist in the Generation document
		generation_stones = {f"{stone.stone_name}_{stone.stone_code}": stone for stone in generation.stone_details}
		
		for stone in selected_stones:
			# Handle both dict and object access patterns
			if isinstance(stone, dict):
				stone_name = stone.get("stone_name", "")
				stone_code = stone.get("stone_code", "")
			else:
				stone_name = getattr(stone, "stone_name", "")
				stone_code = getattr(stone, "stone_code", "")
			
			stone_key = f"{stone_name}_{stone_code}"
			
			# Only publish if this stone exists in the generation document
			if stone_key in generation_stones:
				generation_stone = generation_stones[stone_key]
				
				# Expand range and create multiple records
				expanded_records = expand_stone_range(generation_stone)
				
				for expanded_stone in expanded_records:
					creation_doc.append("stone_details", expanded_stone)
					published_stones += 1
					
					# Calculate volume safely
					try:
						volume_val = float(expanded_stone.get("volume", 0))
						total_volume += volume_val
					except (ValueError, TypeError):
						total_volume += 0
		
		# Validate that we actually published some stones
		if published_stones == 0:
			return {
				"success": False,
				"message": "No valid stones found to publish. Please ensure stones exist in the Generation document."
			}
		
		# Set total volume
		creation_doc.total_volume = total_volume
		
		# Insert the document
		creation_doc.insert()
		
		# Mark the selected stones as published in the Generation document
		for stone in selected_stones:
			if isinstance(stone, dict):
				stone_name = stone.get("stone_name", "")
				stone_code = stone.get("stone_code", "")
			else:
				stone_name = getattr(stone, "stone_name", "")
				stone_code = getattr(stone, "stone_code", "")
			
			stone_key = f"{stone_name}_{stone_code}"
			if stone_key in generation_stones:
				# Find the stone in the generation document and mark as published
				for gen_stone in generation.stone_details:
					if gen_stone.stone_name == stone_name and gen_stone.stone_code == stone_code:
						gen_stone.published = 1
						break
		
		# Save the generation document with updated published status
		generation.save()
		frappe.db.commit()
		
		return {
			"success": True,
			"creation_doc": creation_doc.name,
			"stones_published": published_stones,
			"total_volume": total_volume,
			"message": f"Successfully created Size List Creation {creation_doc.name} with {published_stones} verified stones from Generation document"
		}
		
	except Exception as e:
		frappe.log_error(f"Error publishing stones to creation: {str(e)}")
		return {
			"success": False,
			"message": f"Error publishing stones: {str(e)}"
		}