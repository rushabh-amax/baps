import frappe
from frappe.model.document import Document

class StoneName(Document):
    def autoname(self):
        # keep the document name as stone_name (because Autoname = field:stone_name in DocType)
        pass  

#     def generate_stone_code(self):
#         def abbrev_main_part(text):
#             if not text:
#                 return ""
#             words = text.split()
#             if words[0].lower() == "ground":
#                 return "B" + words[-1][0].upper()
#             return words[0][0].upper() + words[-1][0].upper()

#         def abbrev_sub_part(text):
#             if not text:
#                 return ""
#             if text.lower().startswith("type "):
#                 return text.replace("Type ", "").upper()
#             return text[:3].upper()

#         def abbrev_stone_name(text):
#             if not text:
#                 return ""
#             words = text.split()
#             if len(words) == 1:
#                 return text[:2].upper()
#             return "".join([w[0].upper() if not w.isdigit() else w for w in words])

#         main_code = abbrev_main_part(self.main_part)
#         sub_code = abbrev_sub_part(self.sub_part)
#         stone_code = abbrev_stone_name(self.stone_name)

#         return (main_code + sub_code + stone_code).upper()

#     def before_save(self):
#         # always regenerate stone_code before saving
#         self.stone_code = self.generate_stone_code()
#         if self.stone_name and self.stone_code:
#             self.stone_display = f"{self.stone_name} ({self.stone_code})"
#         else:
#             self.stone_display = self.stone_name or ""

