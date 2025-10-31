# Generate gate pass book.py:

# Copyright (c) 2025, Dharmesh Rathod and contributors
# For license information, please see license.txt

# import frappe
# from frappe.model.document import Document


# class GenerateGatePassBooks(Document):
# 	pass

# import frappe
# from frappe.model.document import Document

# class GenerateGatePassBooks(Document):
#   """Controller for the Generate Gate Pass Books DocType"""

#   def validate(self):
#     """
#     This method is triggered when the document is saved.
#     It creates Gate Pass Books and their corresponding Gate Passes.
#     """
#     # Run this logic only when creating a new document to prevent it from
#     # running again on subsequent saves.
#     if self.is_new():
#       self.generate_books_and_passes()

#   def generate_books_and_passes(self):
#     """
#     The core logic to generate records.
#     """
#     # Get the quantities from the fields in the current document
#     num_books = self.quantity_of_gate_pass_books
#     num_passes_per_book = self.quantity_of_gate_passes

#     # Check if values are provided
#     if not num_books or not num_passes_per_book:
#       frappe.throw("Please specify both the 'Quantity of Gate Pass Books' and the 'Quantity of Gate Passes'.")

#     # The main loop to create the specified number of books
#     for _ in range(num_books):
#       # 1. Create the parent 'Gate Pass Book' document
#       new_book = frappe.new_doc("Gate Pass Book")
#       new_book.page_limit = num_passes_per_book
#       # The 'gate_pass_bookno' is set automatically by your naming rule
#       new_book.insert()

#       # A nested loop to create the child 'Gate Pass' documents for each book
#       for _ in range(num_passes_per_book):
#         # 2. Create the child 'Gate Pass' document
#         new_pass = frappe.new_doc("Gate Pass")
#         # 3. Link the child to its newly created parent book
#         new_pass.gate_pass_book_no = new_book.name
#         # The 'gate_pass_no' is also set automatically by its naming rule
#         new_pass.insert()

#     # Commit all the database changes at once
#     frappe.db.commit()

#     # Show a success message to the user in the UI 
#     frappe.msgprint(f"Successfully generated {num_books} Gate Pass Books, each with {num_passes_per_book} passes.")

##################################################################################
# Previous version of the code (commented out for reference)
##################################################################################
# import frappe
# from frappe.model.document import Document

# class GenerateGatePassBooks(Document):
#   """Controller for the Generate Gate Pass Books DocType"""

#   def validate(self):
#     """
#     This method is triggered when the document is saved.
#     """
#     if self.is_new():
#       self.generate_books_and_passes()

#   def generate_books_and_passes(self):
#     """
#     The core logic to generate records with resetting page numbers.
#     """
#     num_books = self.quantity_of_gate_pass_books
#     num_passes_per_book = self.quantity_of_gate_passes

#     if not num_books or not num_passes_per_book:
#       frappe.throw("Please specify both the 'Quantity of Gate Pass Books' and the 'Quantity of Gate Passes'.")

#     # The main loop to create the specified number of books
#     for _ in range(num_books):
#       # 1. Create the parent 'Gate Pass Book' document
#       new_book = frappe.new_doc("Gate Pass Book")
#       new_book.page_limit = num_passes_per_book
#       new_book.insert()

#       # A nested loop to create the child 'Gate Pass' documents
#       # We use 'page_index' to count from 0 to (n-1)
#       for page_index in range(num_passes_per_book):
#         # We add 1 to the index to get a 1-based page number (1, 2, 3...)
#         page_number = page_index + 1

#         # 2. **Construct the new unique name** (e.g., "GPBNO-0001-1")
#         new_pass_name = f"{new_book.name}-{page_number}"

#         # 3. Create the child 'Gate Pass' document
#         new_pass = frappe.new_doc("Gate Pass")
#         new_pass.gate_pass_book_no = new_book.name  # Link to the parent book
#         new_pass.gate_pass_no = new_pass_name     # Set the unique name we just built
#         new_pass.insert()

#     # Commit all the database changes
#     frappe.db.commit()

#     # Show a success message to the user 
#     frappe.msgprint(f"Successfully generated {num_books} Gate Pass Books with correctly numbered passes.")

##################################################################################
# Even older version of the code (commented out for reference)
##################################################################################
# import frappe
# from frappe.model.document import Document

# class GenerateGatePassBooks(Document):
#   """Controller for the Generate Gate Pass Books DocType"""

#   def validate(self):
#     if self.is_new():
#       self.generate_books_and_passes()

#   def generate_books_and_passes(self):
#     num_books = self.quantity_of_gate_pass_books
#     num_passes_per_book = self.quantity_of_gate_passes

#     if not num_books or not num_passes_per_book:
#       frappe.throw("Please specify both the 'Quantity of Gate Pass Books' and the 'Quantity of Gate Passes'.")

#     for _ in range(num_books):
#       # Create the parent book
#       new_book = frappe.new_doc("Gate Pass Book")
#       new_book.page_limit = num_passes_per_book
#       new_book.insert()

#       # Create the child passes for this book
#       for page_index in range(num_passes_per_book):
#         page_number = page_index + 1

#         # 1. Create the unique SYSTEM ID (e.g., "GPBNO-0001-1")
#         # This is assigned to the 'name' field, which is 'gate_pass_no'.
#         unique_system_name = f"{new_book.name}-{page_number}"

#         # 2. Create the clean DISPLAY number (e.g., "GPNO-0001")
#         # The zfill(4) function adds leading zeros to the number.
#         display_number = f"GPNO-{str(page_number).zfill(4)}"

#         # 3. Create and save the new Gate Pass document
#         new_pass = frappe.new_doc("Gate Pass")
#         new_pass.gate_pass_book_no = new_book.name  # Link to parent

#         # Assign the unique name to the primary key field
#         new_pass.gate_pass_no = unique_system_name

#         # Assign the clean, repeating number to our new display field
#         new_pass.gate_pass_display_no = display_number

#         new_pass.insert()

#     frappe.db.commit()
#     frappe.msgprint(f"Successfully generated {num_books} Gate Pass Books, each with {num_passes_per_book} passes.")

##################################################################################
# Even older version of the code (commented out for reference)
##################################################################################

import frappe
from frappe.model.document import Document

class GenerateGatePassBooks(Document):
  """Controller for the Generate Gate Pass Books DocType"""

  def validate(self):
    if self.is_new():
      self.generate_books_and_passes()

  def generate_books_and_passes(self):
    num_books = self.quantity_of_gate_pass_books
    num_passes_per_book = self.quantity_of_gate_passes

    if not num_books or not num_passes_per_book:
      frappe.throw("Please specify both the 'Quantity of Gate Pass Books' and the 'Quantity of Gate Passes'.")

    for _ in range(num_books):
      # Create the parent book
      new_book = frappe.new_doc("Gate Pass Book")
      new_book.page_limit = num_passes_per_book
      new_book.insert()

      # Create the child passes for this book
      for page_index in range(num_passes_per_book):
        page_number = page_index + 1

        # 1. Create the unique SYSTEM ID (e.g., "GPNO-0003-5")
        # This is assigned to the 'name' field, which is 'gate_pass_no'.
        # We replace "GPBNO" from the book's name with "GPNO".
        unique_system_name = f"{new_book.name.replace('GPBNO', 'GPNO')}-{page_number}"

        # 2. Create the clean DISPLAY number (e.g., "GPNO-0001")
        # The zfill(4) function adds leading zeros to the number.
        display_number = f"GPNO-{str(page_number).zfill(4)}"

        # 3. Create and save the new Gate Pass document
        new_pass = frappe.new_doc("Gate Pass")
        new_pass.gate_pass_book_no = new_book.name  # Link to parent

        # Assign the unique name to the primary key field
        new_pass.gate_pass_no = unique_system_name

        # Assign the clean, repeating number to our new display field
        new_pass.gate_pass_display_no = display_number

        new_pass.insert()

    frappe.db.commit()
    frappe.msgprint(f"Successfully generated {num_books} Gate Pass Books, each with {num_passes_per_book} passes.")