# Copyright (c) 2025, Ayush Patel and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class SizeListVerification(Document):
	def before_save(self):
		"""Set checked_by field before saving"""
		# Always set checked_by to current user when document is being modified
		if frappe.session.user != "Administrator":
			self.checked_by = frappe.session.user
	
	def on_update(self):
		"""Update verification status in Size List when verification changes"""
		if self.form_number:
			update_size_list_verification_status(self.form_number, self.stone_details or [])
	
	def validate(self):
		"""Validate verification data"""
		# Auto-set checked_by to current user if not already set
		if not self.checked_by:
			self.checked_by = frappe.session.user
		
		# CRITICAL: Protect verified stones from being unmarked
		if self.stone_details:
			# Check if this is an update (not new document)
			if not self.is_new():
				# Get the original document to compare
				try:
					original = frappe.get_doc("Size List Verification", self.name)
					for i, stone in enumerate(self.stone_details):
						# Find corresponding stone in original
						original_stone = None
						for orig in original.stone_details:
							if (orig.stone_name == stone.stone_name and 
								orig.stone_code == stone.stone_code):
								original_stone = orig
								break
						
						# If stone was verified before and now it's not, reject the change
						if (original_stone and 
							getattr(original_stone, 'verified', 0) == 1 and 
							getattr(stone, 'verified', 0) != 1):
							frappe.throw(f"❌ Stone '{stone.stone_name or stone.stone_code}' is permanently verified and cannot be unmarked!")
				except frappe.DoesNotExistError:
					pass  # New document, no validation needed
		
		# Auto-update verification summary fields
		update_verification_counts(self)


@frappe.whitelist()
def get_size_list_with_details(size_list_name):
	"""
	Fetch Size List document with all its child table details
	This method runs with elevated permissions to avoid permission issues
	"""
	try:
		# Get the main Size List document
		size_list = frappe.get_doc("Size List", size_list_name)
		
		# Get all Size List Details for this Size List
		stone_details = frappe.get_all(
			"Size List Details",
			filters={"parent": size_list_name},
			fields=["*"]
		)
		
		# Convert to dict and add stone_details
		size_list_dict = size_list.as_dict()
		size_list_dict["stone_details"] = stone_details
		
		return {
			"success": True,
			"message": "Size List data fetched successfully",
			"data": size_list_dict
		}
		
	except frappe.DoesNotExistError:
		return {
			"success": False,
			"message": f"Size List {size_list_name} not found"
		}
	except Exception as e:
		frappe.log_error(f"Error fetching Size List {size_list_name}: {str(e)}")
		return {
			"success": False,
			"message": f"Error fetching Size List: {str(e)}"
		}


@frappe.whitelist()
def search_size_list_by_form_number(form_number):
	"""
	Search for Size List by form_number field and return with details
	"""
	try:
		# Search for Size List with matching form_number
		size_lists = frappe.get_all(
			"Size List",
			filters={"form_number": form_number},
			fields=["name"],
			limit=1
		)
		
		if not size_lists:
			return {
				"success": False,
				"message": f"No Size List found with Form Number: {form_number}"
			}
		
		# Get the full Size List data using the first method
		return get_size_list_with_details(size_lists[0].name)
		
	except Exception as e:
		frappe.log_error(f"Error searching Size List by form number {form_number}: {str(e)}")
		return {
			"success": False,
			"message": f"Error searching Size List: {str(e)}"
		}


@frappe.whitelist()
def get_verified_stones_for_generation(form_number):
	"""
	Get only verified stone details from Size List Verification for Size List Generation
	"""
	try:
		verification_doc = None
		original_form_number = None
		
		# Check if the input is a Size List Verification document name (SZVER-xxxx)
		if form_number.startswith("SZVER-"):
			# Direct lookup by Size List Verification document name
			try:
				verification_doc = frappe.get_doc("Size List Verification", form_number)
				original_form_number = verification_doc.form_number
			except frappe.DoesNotExistError:
				pass
		
		# If not found above, try to find by form_number field (original Size List number)
		if not verification_doc:
			verifications = frappe.get_all(
				"Size List Verification",
				filters={"form_number": form_number},
				fields=["name", "form_number"],
				limit=1
			)
			
			if verifications:
				verification_doc = frappe.get_doc("Size List Verification", verifications[0].name)
				original_form_number = form_number
		
		if not verification_doc:
			return {
				"success": False,
				"message": f"No Size List Verification found for: {form_number}"
			}
		
		# Get the original Size List data first
		size_list = frappe.get_doc("Size List", original_form_number)
		
		# Get verified stone details from verification
		verified_stones = []
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
		
		# Prepare response with Size List data and only verified stones
		size_list_dict = size_list.as_dict()
		size_list_dict["stone_details"] = verified_stones
		
		return {
			"success": True,
			"message": f"Found {len(verified_stones)} verified stones out of {len(verification_doc.stone_details or [])} total stones",
			"data": size_list_dict,
			"verification_stats": {
				"total_stones": len(verification_doc.stone_details or []),
				"verified_stones": len(verified_stones),
				"pending_stones": len(verification_doc.stone_details or []) - len(verified_stones)
			}
		}
		
	except frappe.DoesNotExistError:
		return {
			"success": False,
			"message": f"Size List {form_number} not found"
		}
	except Exception as e:
		frappe.log_error(f"Error getting verified stones for {form_number}: {str(e)}")
		return {
			"success": False,
			"message": f"Error getting verified stones: {str(e)}"
		}


@frappe.whitelist()
def update_size_list_verification_status(form_number, verification_details):
	"""
	Update verification status in the original Size List based on verification results
	"""
	try:
		# Get the original Size List
		size_list = frappe.get_doc("Size List", form_number)
		
		# Create a mapping of stone details for faster lookup
		verification_map = {}
		for detail in verification_details:
			if isinstance(detail, dict):
				stone_key = f"{detail.get('stone_name', '')}_{detail.get('stone_code', '')}"
				verification_map[stone_key] = {
					'verified': detail.get('verified', 0),
					'incorrect': detail.get('incorrect', 0)
				}
			else:
				# Handle frappe document objects
				stone_key = f"{detail.stone_name or ''}_{detail.stone_code or ''}"
				verification_map[stone_key] = {
					'verified': getattr(detail, 'verified', 0),
					'incorrect': getattr(detail, 'incorrect', 0)
				}
		
		# Update verification status in Size List Details
		updated_count = 0
		for stone_detail in size_list.stone_details:
			stone_key = f"{stone_detail.stone_name or ''}_{stone_detail.stone_code or ''}"
			
			if stone_key in verification_map:
				verification_info = verification_map[stone_key]
				
				# Determine verification status
				if verification_info['verified'] == 1:
					stone_detail.verification_status = "Verified"
					stone_detail.needs_correction = 0
				elif verification_info['incorrect'] == 1:
					stone_detail.verification_status = "Incorrect"
					stone_detail.needs_correction = 1
				else:
					stone_detail.verification_status = "Pending"
					stone_detail.needs_correction = 0
				
				updated_count += 1
		
		# Save the Size List with updated verification status
		size_list.save(ignore_permissions=True)
		
		frappe.logger().info(f"Updated verification status for {updated_count} stones in Size List {form_number}")
		
		return {
			"success": True,
			"message": f"Verification status updated for {updated_count} stones",
			"updated_count": updated_count
		}
		
	except frappe.DoesNotExistError:
		frappe.logger().error(f"Size List {form_number} not found for verification status update")
		return {
			"success": False,
			"message": f"Size List {form_number} not found"
		}
	except Exception as e:
		frappe.log_error(f"Error updating verification status for {form_number}: {str(e)}")
		frappe.logger().error(f"Error updating verification status: {str(e)}")
		return {
			"success": False,
			"message": f"Error updating verification status: {str(e)}"
		}


def update_verification_counts(self):
	"""Update verification summary counts"""
	if not self.stone_details:
		return
	
	total_stones = len(self.stone_details)
	verified_count = sum(1 for stone in self.stone_details if getattr(stone, 'verified', 0) == 1)
	incorrect_count = sum(1 for stone in self.stone_details if getattr(stone, 'incorrect', 0) == 1)
	pending_count = total_stones - verified_count - incorrect_count
	
	# These fields need to be added to Size List Verification doctype
	# For now, we'll store them as custom fields or log them
	frappe.logger().info(f"Verification Summary - Total: {total_stones}, Verified: {verified_count}, Incorrect: {incorrect_count}, Pending: {pending_count}")


@frappe.whitelist()
def get_verification_summary(form_number):
	"""Get verification summary for a Size List"""
	try:
		verifications = frappe.get_all(
			"Size List Verification",
			filters={"form_number": form_number},
			fields=["name"],
			limit=1
		)
		
		if not verifications:
			return {
				"success": False,
				"message": "No verification found for this Size List"
			}
		
		verification_doc = frappe.get_doc("Size List Verification", verifications[0].name)
		
		total_stones = len(verification_doc.stone_details or [])
		verified_count = sum(1 for stone in verification_doc.stone_details if getattr(stone, 'verified', 0) == 1)
		incorrect_count = sum(1 for stone in verification_doc.stone_details if getattr(stone, 'incorrect', 0) == 1)
		pending_count = total_stones - verified_count - incorrect_count
		
		return {
			"success": True,
			"data": {
				"total_stones": total_stones,
				"verified_count": verified_count,
				"incorrect_count": incorrect_count,
				"pending_count": pending_count,
				"verification_complete": pending_count == 0 and total_stones > 0
			}
		}
		
	except Exception as e:
		frappe.log_error(f"Error getting verification summary for {form_number}: {str(e)}")
		return {
			"success": False,
			"message": f"Error getting verification summary: {str(e)}"
		}

