// frappe.listview_settings['Size List Creation'] = {
//     // Add custom button to show available/used Size Lists
//     onload: function(listview) {
//         listview.page.add_inner_button(__('Show Available Size Lists'), function() {
//             show_available_size_lists_dialog();
//         });
//     }
// };

// function show_available_size_lists_dialog() {
//     frappe.call({
//         method: 'baps.baps.doctype.size_list_creation.size_list_creation.get_size_list_usage_report',
//         callback: function(r) {
//             if (r.message) {
//                 let html = '<div class="row">';
                
//                 // Available Size Lists
//                 html += '<div class="col-md-6">';
//                 html += '<h5 class="text-success">📋 Available Size Lists</h5>';
//                 html += '<div style="max-height: 300px; overflow-y: auto;">';
//                 if (r.message.available && r.message.available.length > 0) {
//                     r.message.available.forEach(function(item) {
//                         html += `<div class="alert alert-success" style="padding: 8px; margin: 4px 0;">
//                             <strong>${item.name}</strong><br>
//                             <small>Project: ${item.baps_project || 'N/A'} | Part: ${item.main_part || 'N/A'}</small>
//                         </div>`;
//                     });
//                 } else {
//                     html += '<p class="text-muted">No available Size Lists found</p>';
//                 }
//                 html += '</div></div>';
                
//                 // Used Size Lists
//                 html += '<div class="col-md-6">';
//                 html += '<h5 class="text-warning">🔒 Already Used Size Lists</h5>';
//                 html += '<div style="max-height: 300px; overflow-y: auto;">';
//                 if (r.message.used && r.message.used.length > 0) {
//                     r.message.used.forEach(function(item) {
//                         html += `<div class="alert alert-warning" style="padding: 8px; margin: 4px 0;">
//                             <strong>${item.form_number}</strong><br>
//                             <small>Used in: <a href="/app/size-list-creation/${item.creation_name}">${item.creation_name}</a></small>
//                         </div>`;
//                     });
//                 } else {
//                     html += '<p class="text-muted">No Size Lists have been used yet</p>';
//                 }
//                 html += '</div></div>';
                
//                 html += '</div>';
                
//                 let d = new frappe.ui.Dialog({
//                     title: __('Size List Usage Status'),
//                     fields: [
//                         {
//                             fieldname: 'usage_html',
//                             fieldtype: 'HTML',
//                             options: html
//                         }
//                     ],
//                     size: 'large'
//                 });
                
//                 d.show();
//             }
//         }
//     });
// }

// // frappe.listview_settings['Size List Creation'] = {
    
// //     // Add custom indicators
// //     get_indicator: function(doc) {
// //         if (doc.status === "Published") {
// //             return [__("Published"), "green", "status,=,Published"];
// //         } else if (doc.status === "In Progress") {
// //             return [__("In Progress"), "orange", "status,=,In Progress"];
// //         } else if (doc.status === "Cancelled") {
// //             return [__("Cancelled"), "red", "status,=,Cancelled"];
// //         } else {
// //             return [__("Draft"), "gray", "status,=,Draft"];
// //         }
// //     }
// // };

// // function show_filter_dialog(listview) {
// //     let d = new frappe.ui.Dialog({
// //         title: __('Filter Records by Project/Part'),
// //         fields: [
// //             {
// //                 label: __('Filter By'),
// //                 fieldname: 'filter_type',
// //                 fieldtype: 'Select',
// //                 options: [
// //                     'BAPS Project',
// //                     'Main Part',
// //                     'Sub Part',
// //                     'Material Type'
// //                 ],
// //                 reqd: 1,
// //                 default: 'BAPS Project'
// //             },
// //             {
// //                 label: __('BAPS Project'),
// //                 fieldname: 'baps_project',
// //                 fieldtype: 'Link',
// //                 options: 'Baps Project',
// //                 depends_on: 'eval:doc.filter_type=="BAPS Project"',
// //                 onchange: function() {
// //                     let project = d.get_value('baps_project');
// //                     if (project) {
// //                         // Get project statistics
// //                         frappe.call({
// //                             method: 'baps.baps.doctype.size_list_creation.size_list_creation.get_project_statistics',
// //                             args: {
// //                                 project: project
// //                             },
// //                             callback: function(r) {
// //                                 if (r.message) {
// //                                     d.set_df_property('info_html', 'options', 
// //                                         `<div class="alert alert-info">
// //                                             <b>Project Statistics:</b><br>
// //                                             Total Records: ${r.message.total_records}<br>
// //                                             Published: ${r.message.published}<br>
// //                                             In Progress: ${r.message.in_progress}<br>
// //                                             Draft: ${r.message.draft}
// //                                         </div>`
// //                                     );
// //                                 }
// //                             }
// //                         });
// //                     }
// //                 }
// //             },
// //             {
// //                 label: __('Main Part'),
// //                 fieldname: 'main_part',
// //                 fieldtype: 'Link',
// //                 options: 'Main Part',
// //                 depends_on: 'eval:doc.filter_type=="Main Part"'
// //             },
// //             {
// //                 label: __('Sub Part'),
// //                 fieldname: 'sub_part',
// //                 fieldtype: 'Link',
// //                 options: 'Sub Part',
// //                 depends_on: 'eval:doc.filter_type=="Sub Part"'
// //             },
// //             {
// //                 label: __('Material Type'),
// //                 fieldname: 'material_type',
// //                 fieldtype: 'Link',
// //                 options: 'Material Type',
// //                 depends_on: 'eval:doc.filter_type=="Material Type"'
// //             },
// //             {
// //                 fieldname: 'info_html',
// //                 fieldtype: 'HTML',
// //                 options: ''
// //             }
// //         ],
// //         primary_action_label: __('Apply Filter'),
// //         primary_action(values) {
// //             // Apply filter based on selected type
// //             let filter_field = '';
// //             let filter_value = '';
            
// //             switch(values.filter_type) {
// //                 case 'BAPS Project':
// //                     filter_field = 'baps_project';
// //                     filter_value = values.baps_project;
// //                     break;
// //                 case 'Main Part':
// //                     filter_field = 'main_part';
// //                     filter_value = values.main_part;
// //                     break;
// //                 case 'Sub Part':
// //                     filter_field = 'sub_part';
// //                     filter_value = values.sub_part;
// //                     break;
// //                 case 'Material Type':
// //                     filter_field = 'stone_type';
// //                     filter_value = values.material_type;
// //                     break;
// //             }
            
// //             if (filter_value) {
// //                 // Clear existing filters
// //                 listview.filter_area.clear();
                
// //                 // Add new filter
// //                 listview.filter_area.add([[listview.doctype, filter_field, '=', filter_value]]);
                
// //                 frappe.show_alert({
// //                     message: __('Filter applied for {0}: {1}', [values.filter_type, filter_value]),
// //                     indicator: 'green'
// //                 });
                
// //                 d.hide();
// //             } else {
// //                 frappe.msgprint(__('Please select a {0}', [values.filter_type]));
// //             }
// //         }
// //     });
    
// //     d.show();
// // }

// // function show_verified_size_list_sources(listview) {
// //     // Get all Size List Creation records and show their source Size Lists
// //     frappe.call({
// //         method: 'baps.baps.doctype.size_list_creation.size_list_creation.get_all_verified_sources',
// //         callback: function(r) {
// //             if (r.message && r.message.length > 0) {
// //                 let html = '<div class="frappe-control"><table class="table table-bordered">';
// //                 html += '<thead><tr><th>Creation ID</th><th>Source Size List</th><th>Project</th><th>Main Part</th><th>Status</th></tr></thead><tbody>';
                
// //                 r.message.forEach(function(row) {
// //                     html += `<tr>
// //                         <td><a href="/app/size-list-creation/${row.name}">${row.name}</a></td>
// //                         <td>${row.form_number || 'N/A'}</td>
// //                         <td>${row.baps_project || 'N/A'}</td>
// //                         <td>${row.main_part || 'N/A'}</td>
// //                         <td><span class="badge badge-${row.status === 'Published' ? 'success' : 'warning'}">${row.status}</span></td>
// //                     </tr>`;
// //                 });
                
// //                 html += '</tbody></table></div>';
                
// //                 let d = new frappe.ui.Dialog({
// //                     title: __('All Records with Verified Source Size Lists'),
// //                     fields: [
// //                         {
// //                             fieldname: 'records_html',
// //                             fieldtype: 'HTML',
// //                             options: html
// //                         }
// //                     ],
// //                     size: 'large'
// //                 });
                
// //                 d.show();
// //             } else {
// //                 frappe.msgprint(__('No records found with verified source Size Lists'));
// //             }
// //         }
// //     });
// // }


// frappe.listview_settings['Size List Creation'] = {
//     onload(listview) {
//     let filters = {
//         main_part: "",
//         sub_part: "",
//         baps_project: "",
//         stone_name: ""
//     };

//     // Add filter fields to the list view
//     listview.page.add_field({
//         label: __("BAPS Project"),
//         fieldtype: "Link",
//         fieldname: "baps_project_filter",
//         options: "Baps Project",
//         change() {
//             filters.baps_project = this.get_value();
//         }
//     });

//     listview.page.add_field({
//         label: __("Main Part"),
//         fieldtype: "Link",
//         fieldname: "main_part_filter",
//         options: "Main Part",
//         change() {
//             filters.main_part = this.get_value();
//         }
//     });

//     listview.page.add_field({
//         label: __("Sub Part"),
//         fieldtype: "Link",
//         fieldname: "sub_part_filter",
//         options: "Sub Part",
//         change() {
//             filters.sub_part = this.get_value();
//         }
//     });

//     listview.page.add_field({
//         label: __("Stone Name"),
//         fieldtype: "Data",
//         fieldname: "stone_name_filter",
//         change() {
//             filters.stone_name = this.get_value();
//         }
//     });

//     listview.page.add_inner_button(__('View All Size Lists'), function () {
//         frappe.call({
//             method: "baps.baps.doctype.size_list_creation.size_list_creation.get_unique_size_lists",
//             args: {
//                 main_part: filters.main_part,
//                 sub_part: filters.sub_part,
//                 baps_project: filters.baps_project,
//                 stone_name: filters.stone_name
//             },
//             callback: function (r) {
//                 if (r.message && r.message.length) {
//                     // Build filter summary
//                     let filterSummary = [];
//                     if (filters.baps_project) filterSummary.push(`Project: ${filters.baps_project}`);
//                     if (filters.main_part) filterSummary.push(`Main Part: ${filters.main_part}`);
//                     if (filters.sub_part) filterSummary.push(`Sub Part: ${filters.sub_part}`);
//                     if (filters.stone_name) filterSummary.push(`Stone Name: ${filters.stone_name}`);
                    
//                     let filterText = filterSummary.length > 0 ? 
//                         `<p class="text-muted">Filters Applied: ${filterSummary.join(', ')}</p>` : 
//                         '<p class="text-muted">No filters applied - showing all records</p>';

//                     let html = `<h3>Size List Details (${r.message.length} records)</h3>`;
//                     html += filterText;
//                     html += "<div style='max-height: 500px; overflow-y: auto;'>";
//                     html += "<table class='table table-bordered table-striped'><thead><tr>";

//                     let headers = ["Creation ID", "Project", "Main Part", "Stone Code", "Stone Name", "L1", "L2", "B1", "B2", "H1", "H2", "Volume"];
//                     headers.forEach(h => {
//                         html += `<th style='background-color: #f8f9fa; position: sticky; top: 0;'>${h}</th>`;
//                     });
//                     html += "</tr></thead><tbody>";

//                     r.message.forEach(row => {
//                         html += "<tr>";
//                         html += `<td><a href="/app/size-list-creation/${row.creation_name}" target="_blank">${row.creation_name || ""}</a></td>`;
//                         html += `<td>${row.baps_project || ""}</td>`;
//                         html += `<td>${row.main_part || ""}</td>`;
//                         html += `<td><strong>${row.stone_code || ""}</strong></td>`;
//                         html += `<td>${row.stone_name || ""}</td>`;
//                         html += `<td>${row.l1 || ""}</td>`;
//                         html += `<td>${row.l2 || ""}</td>`;
//                         html += `<td>${row.b1 || ""}</td>`;
//                         html += `<td>${row.b2 || ""}</td>`;
//                         html += `<td>${row.h1 || ""}</td>`;
//                         html += `<td>${row.h2 || ""}</td>`;
//                         html += `<td>${row.volume || ""}</td>`;
//                         html += "</tr>";
//                     });

//                     html += "</tbody></table></div>";

//                     frappe.msgprint({
//                         title: __("Filtered Size List Details"),
//                         message: html,
//                         wide: true
//                     });
//                 } else {
//                     let filterSummary = [];
//                     if (filters.baps_project) filterSummary.push(`Project: ${filters.baps_project}`);
//                     if (filters.main_part) filterSummary.push(`Main Part: ${filters.main_part}`);
//                     if (filters.sub_part) filterSummary.push(`Sub Part: ${filters.sub_part}`);
//                     if (filters.stone_name) filterSummary.push(`Stone Name: ${filters.stone_name}`);
                    
//                     let message = filterSummary.length > 0 ? 
//                         `No records found matching the filters: ${filterSummary.join(', ')}. Try adjusting your filter criteria.` :
//                         'No Size List Creation records found in the system.';
                    
//                     frappe.msgprint({
//                         title: __("No Records Found"),
//                         message: message,
//                         indicator: 'orange'
//                     });
//                 }
//             }
//         });
//     });
// }
// };



//--------------------------------------------------------------------------------------


// frappe.listview_settings['Size List Creation'] = {
//     onload(listview) {
//         let filters = {
//             baps_project: "",
//             main_part: "",
//             sub_part: "",
//             stone_name: ""
//         };

//         const fetchAndRenderTable = () => {
//             frappe.call({
//                 method: "baps.baps.doctype.size_list_creation.size_list_creation.get_unique_size_lists",
//                 args: filters,
//                 callback: function (r) {
//                     if (r.message) {
//                         let html = "<div style='margin-top: 15px'><h3>Size List Details</h3><table class='table table-bordered'><thead><tr>";

//                         let headers = ["Stone Code", "Stone Name", "l1", "l2", "b1", "b2", "h1", "h2", "Volume"];
//                         headers.forEach(h => html += `<th>${h}</th>`);
//                         html += "</tr></thead><tbody>";

//                         r.message.forEach(row => {
//                             html += "<tr>";
//                             html += `<td>${row.stone_code || ""}</td>`;
//                             html += `<td>${row.stone_name || ""}</td>`;
//                             html += `<td>${row.l1 || ""}</td>`;
//                             html += `<td>${row.l2 || ""}</td>`;
//                             html += `<td>${row.b1 || ""}</td>`;
//                             html += `<td>${row.b2 || ""}</td>`;
//                             html += `<td>${row.h1 || ""}</td>`;
//                             html += `<td>${row.h2 || ""}</td>`;
//                             html += `<td>${row.volume || ""}</td>`;
//                             html += "</tr>";
//                         });

//                         html += "</tbody></table></div>";

//                         const container_id = "size-list-table-container";
//                         let container = $(`#${container_id}`);
//                         if (!container.length) {
//                             container = $('<div id="' + container_id + '"></div>');
//                             listview.page.main.append(container);
//                         }
//                         container.html(html);
//                     }
//                 }
//             });
//         };

//         // Wait for the page to fully load, then add our custom filters
//         setTimeout(() => {
//             // Hide the default Frappe filters that are causing duplication
//             const hideDefaultFilters = () => {
//                 // Hide default filter fields by their common selectors
//                 listview.page.wrapper.find('input[data-fieldname="baps_project"]').closest('.frappe-control').hide();
//                 listview.page.wrapper.find('input[data-fieldname="main_part"]').closest('.frappe-control').hide();
//                 listview.page.wrapper.find('input[data-fieldname="sub_part"]').closest('.frappe-control').hide();
                
//                 // Also hide by label text
//                 listview.page.wrapper.find('.control-label:contains("Baps Project")').closest('.frappe-control').hide();
//                 listview.page.wrapper.find('.control-label:contains("Main Part")').closest('.frappe-control').hide();
//                 listview.page.wrapper.find('.control-label:contains("Sub Part")').closest('.frappe-control').hide();
//             };

//             // Clear any existing custom filters to prevent duplication
//             if (listview.page.fields_dict.custom_baps_project) return;

//             frappe.call({
//                 method: "baps.baps.doctype.size_list_creation.size_list_creation.get_filter_options",
//                 callback: function (res) {
//                     if (!res.message) return;

//                     const { baps_projects, main_parts, sub_parts, stone_names } = res.message;

//                     // Add custom filter fields with unique names to avoid conflicts
//                     const bapsField = listview.page.add_field({
//                         label: "Project",
//                         fieldname: "baps_project",
//                         fieldtype: "Select",
//                         options: ["", ...baps_projects],
//                         change: function () {
//                             filters.baps_project = this.get_value();
                            
//                             // Apply filter to the actual list view
//                             if (this.get_value()) {
//                                 listview.filter_area.add([listview.doctype, 'baps_project', '=', this.get_value()]);
//                             } else {
//                                 // Remove filter if empty
//                                 listview.filter_area.remove('baps_project');
//                             }
//                             fetchAndRenderTable();
//                         }
//                     });

//                     const mainPartField = listview.page.add_field({
//                         label: "Main Part",
//                         fieldname: "main_part",
//                         fieldtype: "Select",
//                         options: ["", ...main_parts],
//                         change: function () {
//                             filters.main_part = this.get_value();
                            
//                             // Apply filter to the actual list view
//                             if (this.get_value()) {
//                                 listview.filter_area.add([listview.doctype, 'main_part', '=', this.get_value()]);
//                             } else {
//                                 // Remove filter if empty
//                                 listview.filter_area.remove('main_part');
//                             }
//                             fetchAndRenderTable();
//                         }
//                     });

//                     const subPartField = listview.page.add_field({
//                         label: "Sub Part",
//                         fieldname: "sub_part",
//                         fieldtype: "Select",
//                         options: ["", ...sub_parts],
//                         change: function () {
//                             filters.sub_part = this.get_value();
                            
//                             // Apply filter to the actual list view
//                             if (this.get_value()) {
//                                 listview.filter_area.add([listview.doctype, 'sub_part', '=', this.get_value()]);
//                             } else {
//                                 // Remove filter if empty
//                                 listview.filter_area.remove('sub_part');
//                             }
//                             fetchAndRenderTable();
//                         }
//                     });

//                     const stoneNameField = listview.page.add_field({
//                         label: "Stone Name",
//                         fieldname: "stone_name",
//                         fieldtype: "Select",
//                         options: ["", ...stone_names],
//                         change: function () {
//                             filters.stone_name = this.get_value();
                            
//                             // For stone name filtering, we need to use a custom method since it's in child table
//                             if (this.get_value()) {
//                                 // Apply custom filter for records that have matching stone names in child table
//                                 frappe.call({
//                                     method: "baps.baps.doctype.size_list_creation.size_list_creation.get_records_by_stone_name",
//                                     args: { stone_name: this.get_value() },
//                                     callback: function(r) {
//                                         if (r.message && r.message.length > 0) {
//                                             // Filter by the IDs that contain the stone name
//                                             let record_names = r.message.map(record => record.name);
//                                             listview.filter_area.add([listview.doctype, 'name', 'in', record_names]);
//                                         } else {
//                                             // No records found, add impossible filter to show empty results
//                                             listview.filter_area.add([listview.doctype, 'name', '=', 'no-records-found']);
//                                         }
//                                     }
//                                 });
//                             } else {
//                                 // Remove filter if empty
//                                 listview.filter_area.remove('name');
//                             }
//                             fetchAndRenderTable();
//                         }
//                     });

//                     // Hide default Frappe filters after adding our custom ones
//                     hideDefaultFilters();
                    
//                     // Also hide them periodically in case they get re-rendered
//                     setInterval(hideDefaultFilters, 2000);

//                     // Initial full load
//                     fetchAndRenderTable();
//                 }
//             });
//         }, 1000);
//     }
// };



//--------------------------------------------------------------------------------------


frappe.listview_settings['Size List Creation'] = {
    onload(listview) {
        let filters = {
            baps_project: "",
            main_part: "",
            sub_part: "",
            stone_name: ""
        };

        const fetchAndRenderTable = () => {
            // Check if any filter is applied
            const isFiltered = Object.values(filters).some(value => value !== "");
            
            if (isFiltered) {
                frappe.call({
                    method: "baps.baps.doctype.size_list_creation.size_list_creation.get_unique_size_lists",
                    args: filters,
                    callback: function (r) {
                        if (r.message) {
                            let html = "<div style='margin-top: 15px'><h3>Size List Details</h3><table class='table table-bordered'><thead><tr>";

                            let headers = ["Stone Code", "Stone Name", "l1", "l2", "b1", "b2", "h1", "h2", "Volume"];
                            headers.forEach(h => html += `<th>${h}</th>`);
                            html += "</tr></thead><tbody>";

                            r.message.forEach(row => {
                                html += "<tr>";
                                html += `<td>${row.stone_code || ""}</td>`;
                                html += `<td>${row.stone_name || ""}</td>`;
                                html += `<td>${row.l1 || ""}</td>`;
                                html += `<td>${row.l2 || ""}</td>`;
                                html += `<td>${row.b1 || ""}</td>`;
                                html += `<td>${row.b2 || ""}</td>`;
                                html += `<td>${row.h1 || ""}</td>`;
                                html += `<td>${row.h2 || ""}</td>`;
                                html += `<td>${row.volume || ""}</td>`;
                                html += "</tr>";
                            });

                            html += "</tbody></table></div>";

                            const container_id = "size-list-table-container";
                            let container = $(`#${container_id}`);
                            if (!container.length) {
                                container = $('<div id="' + container_id + '"></div>');
                                listview.page.main.append(container);
                            }
                            container.html(html);
                        }
                    }
                });
            } else {
                // No filters applied, hide the container
                const container = $("#size-list-table-container");
                if (container.length) {
                    container.remove();
                }
            }
        };

        // Wait for the page to fully load, then add our custom filters
        setTimeout(() => {
            // Hide the default Frappe filters that are causing duplication
            const hideDefaultFilters = () => {
                // Hide default filter fields by their common selectors
                listview.page.wrapper.find('input[data-fieldname="baps_project"]').closest('.frappe-control').hide();
                listview.page.wrapper.find('input[data-fieldname="main_part"]').closest('.frappe-control').hide();
                listview.page.wrapper.find('input[data-fieldname="sub_part"]').closest('.frappe-control').hide();
                
                // Also hide by label text
                listview.page.wrapper.find('.control-label:contains("Baps Project")').closest('.frappe-control').hide();
                listview.page.wrapper.find('.control-label:contains("Main Part")').closest('.frappe-control').hide();
                listview.page.wrapper.find('.control-label:contains("Sub Part")').closest('.frappe-control').hide();
            };

            // Clear any existing custom fields to prevent duplication
            const clearExistingFields = () => {
                const existingFields = ['baps_project', 'main_part', 'sub_part', 'stone_name'];
                existingFields.forEach(field => {
                    if (listview.page.fields_dict[field]) {
                        listview.page.fields_dict[field].$wrapper.remove();
                        delete listview.page.fields_dict[field];
                    }
                });
            };

            frappe.call({
                method: "baps.baps.doctype.size_list_creation.size_list_creation.get_filter_options",
                callback: function (res) {
                    if (!res.message) return;

                    const { baps_projects, main_parts, sub_parts, stone_names } = res.message;

                    // Clear existing fields first
                    clearExistingFields();

                    // Add custom filter fields
                    const bapsField = listview.page.add_field({
                        label: "Project",
                        fieldname: "baps_project",
                        fieldtype: "Select",
                        options: ["", ...baps_projects],
                        change: function () {
                            filters.baps_project = this.get_value();
                            fetchAndRenderTable();
                        }
                    });

                    const mainPartField = listview.page.add_field({
                        label: "Main Part",
                        fieldname: "main_part",
                        fieldtype: "Select",
                        options: ["", ...main_parts],
                        change: function () {
                            filters.main_part = this.get_value();
                            fetchAndRenderTable();
                        }
                    });

                    const subPartField = listview.page.add_field({
                        label: "Sub Part",
                        fieldname: "sub_part",
                        fieldtype: "Select",
                        options: ["", ...sub_parts],
                        change: function () {
                            filters.sub_part = this.get_value();
                            fetchAndRenderTable();
                        }
                    });

                    const stoneNameField = listview.page.add_field({
                        label: "Stone Name",
                        fieldname: "stone_name",
                        fieldtype: "Select",
                        options: ["", ...stone_names],
                        change: function () {
                            filters.stone_name = this.get_value();
                            fetchAndRenderTable();
                        }
                    });

                    // Hide default Frappe filters
                    hideDefaultFilters();
                    
                    // Also hide them periodically in case they get re-rendered
                    setInterval(hideDefaultFilters, 2000);

                    // Don't load initially - only when filters are applied
                    // fetchAndRenderTable(); // Commented out initial load
                }
            });
        }, 1000);
    }
};